#!/usr/bin/env node
/**
 * fix-html-entities.mjs
 * Decodes HTML entities in MDX frontmatter fields (title, slug, etc.)
 * Run: node scripts/fix-html-entities.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, "../src/content");

/* ── HTML entity decoder ─────────────────────────────────────── */
const NAMED_ENTITIES = {
  "&amp;":   "&",
  "&quot;":  '"',
  "&apos;":  "'",
  "&lt;":    "<",
  "&gt;":    ">",
  "&nbsp;":  " ",
  "&ndash;": "–",
  "&mdash;": "—",
  "&lsquo;": "\u2018",
  "&rsquo;": "\u2019",
  "&ldquo;": "\u201C",
  "&rdquo;": "\u201D",
  "&hellip;":"…",
  "&bull;":  "•",
};

function decodeEntities(str) {
  if (!str) return str;

  // Named entities
  let result = str.replace(/&[a-z]+;/gi, (match) => NAMED_ENTITIES[match] ?? match);

  // Numeric decimal entities: &#8217; &#038; etc.
  result = result.replace(/&#(\d+);/g, (_, code) =>
    String.fromCodePoint(parseInt(code, 10))
  );

  // Numeric hex entities: &#x2019; etc.
  result = result.replace(/&#x([0-9a-f]+);/gi, (_, code) =>
    String.fromCodePoint(parseInt(code, 16))
  );

  return result;
}

/* ── Patch only the YAML frontmatter block ───────────────────── */
function patchFrontmatter(content) {
  // Match the frontmatter block between --- delimiters
  return content.replace(/^---\n([\s\S]*?)\n---/m, (_, fm) => {
    const decoded = fm
      .split("\n")
      .map((line) => {
        // Only decode lines that are string values (quoted or unquoted)
        // Leave arrays and booleans alone
        return line.replace(/:\s*"(.*)"$/, (_, val) => `: "${decodeEntities(val)}"`);
      })
      .join("\n");
    return `---\n${decoded}\n---`;
  });
}

/* ── Main ────────────────────────────────────────────────────── */
const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
let fixed = 0;
let unchanged = 0;

console.log(`\n🔧  Decoding HTML entities in ${files.length} MDX files...\n`);

for (const file of files) {
  const filePath = path.join(CONTENT_DIR, file);
  const original = fs.readFileSync(filePath, "utf8");
  const patched = patchFrontmatter(original);

  if (patched !== original) {
    fs.writeFileSync(filePath, patched, "utf8");
    console.log(`  ✓  Fixed: ${file}`);
    fixed++;
  } else {
    unchanged++;
  }
}

console.log(`\n✅  Done: ${fixed} fixed, ${unchanged} already clean.\n`);
