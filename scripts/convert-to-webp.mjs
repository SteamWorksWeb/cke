/**
 * convert-to-webp.mjs
 * Converts all JPG/JPEG/PNG images in public/images/ to WebP
 * and updates all MDX frontmatter references to use .webp versions.
 *
 * Run with: node scripts/convert-to-webp.mjs
 */

import sharp from "sharp";
import fs from "fs";
import path from "path";

const IMAGE_DIR = path.join(process.cwd(), "public", "images");
const CONTENT_DIR = path.join(process.cwd(), "src", "content");
const EXTENSIONS = [".jpg", ".jpeg", ".png"];
// Keep these as-is (favicon, socialshare should stay as their original format for OG compatibility)
const SKIP_FILES = ["favicon.ico", "socialshare.png", "logo.png"];

let converted = 0;
let skipped = 0;
let mdxUpdated = 0;

/* ── 1. Recursively collect all image files ── */
function collectImages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(fullPath));
    } else if (EXTENSIONS.includes(path.extname(entry.name).toLowerCase())) {
      if (!SKIP_FILES.includes(entry.name)) {
        results.push(fullPath);
      } else {
        console.log(`  SKIP  ${entry.name}`);
        skipped++;
      }
    }
  }
  return results;
}

/* ── 2. Convert each image to WebP ── */
async function convertToWebP(filePath) {
  const ext = path.extname(filePath);
  const webpPath = filePath.replace(new RegExp(`\\${ext}$`, "i"), ".webp");

  if (fs.existsSync(webpPath)) {
    console.log(`  EXISTS  ${path.basename(webpPath)}`);
    return false;
  }

  try {
    await sharp(filePath)
      .webp({ quality: 85 })
      .toFile(webpPath);

    const origSize = fs.statSync(filePath).size;
    const webpSize = fs.statSync(webpPath).size;
    const savings = Math.round((1 - webpSize / origSize) * 100);
    console.log(`  ✓  ${path.basename(filePath)} → ${path.basename(webpPath)} (${savings}% smaller)`);
    converted++;
    return true;
  } catch (err) {
    console.error(`  ✗  Failed: ${filePath} — ${err.message}`);
    return false;
  }
}

/* ── 3. Update MDX frontmatter references ── */
function updateMdxReferences() {
  const mdxFiles = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));

  for (const file of mdxFiles) {
    const filePath = path.join(CONTENT_DIR, file);
    let content = fs.readFileSync(filePath, "utf8");
    const original = content;

    // Replace .jpg/.jpeg/.png refs in frontmatter with .webp
    content = content.replace(
      /(featuredImage:\s*["'].*?)\.(jpg|jpeg|png)(["'])/gi,
      "$1.webp$3"
    );

    if (content !== original) {
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`  MDX  updated: ${file}`);
      mdxUpdated++;
    }
  }
}

/* ── Run ── */
console.log("\n🔄 Converting images to WebP...\n");

const images = collectImages(IMAGE_DIR);
console.log(`Found ${images.length} images to process.\n`);

for (const img of images) {
  await convertToWebP(img);
}

console.log("\n📝 Updating MDX frontmatter references...\n");
updateMdxReferences();

console.log(`
✅ Done!
   Converted:    ${converted} images
   Skipped:      ${skipped} files  
   MDX updated:  ${mdxUpdated} files
`);
