#!/usr/bin/env node
/**
 * migrate-wp.mjs
 * Fetches posts from the Clay Knows Everything WordPress REST API,
 * converts HTML content to Markdown, downloads wp-content images
 * (including featured images) to /public/images/blog/, and writes
 * .mdx files to src/content/ with real category data.
 */

import fs from "fs";
import path from "path";
import https from "https";
import http from "http";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const TurndownService = require("turndown");

/* ── Paths ─────────────────────────────────────────────────────── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CONTENT_DIR = path.join(ROOT, "src", "content");
const IMAGES_DIR = path.join(ROOT, "public", "images", "blog");

/* ── Ensure output directories exist ───────────────────────────── */
fs.mkdirSync(CONTENT_DIR, { recursive: true });
fs.mkdirSync(IMAGES_DIR, { recursive: true });

/* ── Turndown setup ─────────────────────────────────────────────── */
const td = new TurndownService({ headingStyle: "atx", codeBlockStyle: "fenced" });

/* ── Helpers ────────────────────────────────────────────────────── */

/** Download a URL to a local file path. Returns a promise. */
function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);
    const lib = url.startsWith("https") ? https : http;

    const request = lib.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlink(destPath, () => {});
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }
      if (response.statusCode !== 200) {
        file.close();
        fs.unlink(destPath, () => {});
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on("finish", () => file.close(resolve));
    });

    request.on("error", (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

/** Fetch JSON from a URL. Returns a promise. */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    let data = "";
    lib
      .get(url, { headers: { "User-Agent": "migrate-wp-script/1.0" } }, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          return fetchJson(res.headers.location).then(resolve).catch(reject);
        }
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`JSON parse error: ${e.message}\nBody: ${data.slice(0, 200)}`));
          }
        });
      })
      .on("error", reject);
  });
}

/** Sanitize a filename — strip query strings and decode URI components. */
function safeFilename(url) {
  try {
    const u = new URL(url);
    return path.basename(decodeURIComponent(u.pathname));
  } catch {
    return path.basename(url.split("?")[0]);
  }
}

/** Download a single image, return local path or null on failure. */
async function downloadImage(url) {
  const filename = safeFilename(url);
  const destPath = path.join(IMAGES_DIR, filename);
  const localPath = `/images/blog/${filename}`;

  if (fs.existsSync(destPath)) {
    console.log(`  ↩  Already exists: ${filename}`);
    return localPath;
  }

  try {
    await downloadFile(url, destPath);
    console.log(`  ✓  Downloaded: ${filename}`);
    return localPath;
  } catch (err) {
    console.warn(`  ✗  Failed to download ${url}: ${err.message}`);
    return null;
  }
}

/**
 * Find all wp-content/uploads/ image URLs in markdown,
 * download each image, and rewrite the URL to the local path.
 */
async function processContentImages(markdown) {
  const imageRegex =
    /https?:\/\/[^\s"')]+\/wp-content\/uploads\/[^\s"')]+\.(?:jpe?g|png|gif|webp|svg)/gi;
  const urls = [...new Set(markdown.match(imageRegex) || [])];

  const urlMap = {};
  for (const url of urls) {
    const local = await downloadImage(url);
    urlMap[url] = local || url;
  }

  let result = markdown;
  for (const [original, local] of Object.entries(urlMap)) {
    result = result.split(original).join(local);
  }
  return result;
}

/** Escape double quotes in frontmatter strings. */
function fmEscape(str) {
  return (str || "").replace(/"/g, '\\"');
}

/** Build the .mdx file content. */
function buildMdx({ title, date, slug, categories, featuredImage, body }) {
  const categoriesYaml =
    categories.length > 0
      ? `categories: [${categories.map((c) => `"${fmEscape(c)}"`).join(", ")}]`
      : `categories: []`;

  const featuredImageLine = featuredImage
    ? `featuredImage: "${featuredImage}"`
    : `featuredImage: ""`;

  return `---
title: "${fmEscape(title)}"
date: "${date}"
slug: "${slug}"
${categoriesYaml}
${featuredImageLine}
---

${body}
`;
}

/* ── Main ───────────────────────────────────────────────────────── */
async function main() {
  // Use _embed to get featured media + category terms in one request
  const API_URL =
    "https://clayknowseverything.com/wp-json/wp/v2/posts?per_page=100&_embed";

  console.log(`\n🔍  Fetching posts from:\n    ${API_URL}\n`);

  let posts;
  try {
    posts = await fetchJson(API_URL);
  } catch (err) {
    console.error(`❌  Failed to fetch posts: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(posts) || posts.length === 0) {
    console.warn("⚠️  No posts returned from the API.");
    process.exit(0);
  }

  console.log(`📦  ${posts.length} post(s) found. Starting migration...\n`);

  let success = 0;
  let failed = 0;

  for (const post of posts) {
    const title = post.title?.rendered || "Untitled";
    const slug = post.slug || `post-${post.id}`;
    const date = (post.date || "").slice(0, 10); // YYYY-MM-DD
    const rawHtml = post.content?.rendered || "";

    // ── Extract real categories from _embedded wp:term ──
    let categories = [];
    try {
      const terms = post._embedded?.["wp:term"] || [];
      // terms[0] = categories, terms[1] = tags
      const catTerms = terms[0] || [];
      categories = catTerms
        .filter((t) => t.taxonomy === "category" && t.name !== "Uncategorized")
        .map((t) => t.name);
    } catch {
      categories = [];
    }

    // ── Extract featured image URL from _embedded wp:featuredmedia ──
    let featuredImage = null;
    try {
      const media = post._embedded?.["wp:featuredmedia"];
      if (Array.isArray(media) && media[0]?.source_url) {
        const featureUrl = media[0].source_url;
        if (featureUrl.includes("wp-content/uploads")) {
          featuredImage = await downloadImage(featureUrl);
        } else {
          featuredImage = featureUrl;
        }
      }
    } catch {
      featuredImage = null;
    }

    console.log(
      `📝  [${slug}] | cats: ${categories.join(", ") || "none"} | img: ${featuredImage ? "✓" : "✗"}`
    );

    // Convert HTML → Markdown
    let markdown;
    try {
      markdown = td.turndown(rawHtml);
    } catch (err) {
      console.warn(`  ✗  Turndown failed: ${err.message}`);
      failed++;
      continue;
    }

    // Download inline content images & rewrite paths
    markdown = await processContentImages(markdown);

    // Write .mdx file
    const mdxContent = buildMdx({ title, date, slug, categories, featuredImage, body: markdown });
    const outPath = path.join(CONTENT_DIR, `${slug}.mdx`);

    try {
      fs.writeFileSync(outPath, mdxContent, "utf8");
      console.log(`  ✓  Written: src/content/${slug}.mdx`);
      success++;
    } catch (err) {
      console.warn(`  ✗  File write failed: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✅  Migration complete: ${success} succeeded, ${failed} failed.\n`);
}

main().catch((err) => {
  console.error(`\n💥  Unexpected error: ${err.message}`);
  process.exit(1);
});
