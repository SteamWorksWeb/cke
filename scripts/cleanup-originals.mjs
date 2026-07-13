/**
 * cleanup-originals.mjs
 *
 * Finds every .jpg/.jpeg/.png in public/images/ that:
 *   1. Has a matching .webp sibling already on disk, AND
 *   2. Is NOT referenced anywhere in src/, scripts/, or any config file.
 *
 * Safe to run: defaults to DRY-RUN.  Pass --delete to actually remove files.
 *
 * Run with: node scripts/cleanup-originals.mjs [--delete]
 */

import fs from "fs";
import path from "path";

const ROOT        = process.cwd();
const IMAGE_DIR   = path.join(ROOT, "public", "images");
const SEARCH_DIRS = [
  path.join(ROOT, "src"),
  path.join(ROOT, "scripts"),
];
const SEARCH_EXTS = new Set([
  ".tsx", ".ts", ".jsx", ".js", ".mjs",
  ".mdx", ".md", ".css", ".json",
]);
const IMAGE_EXTS  = new Set([".jpg", ".jpeg", ".png"]);

// Files that must NEVER be deleted regardless of reference status
const PROTECTED = new Set([
  "logo.png",          // OG meta + components
  "socialshare.png",   // OG meta
  "socialshare2.jpg",  // OG meta (layout.tsx)
  "clay.png",          // OG / JSON-LD schema meta
  "favicon.ico",
]);

const DRY_RUN = !process.argv.includes("--delete");

/* ── 1. Collect all source-file content into one big string for fast grep ── */
function collectSourceText(dirs) {
  let text = "";
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    collectFiles(dir, (filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (SEARCH_EXTS.has(ext)) {
        text += fs.readFileSync(filePath, "utf8") + "\n";
      }
    });
  }
  return text;
}

function collectFiles(dir, cb) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(full, cb);
    } else {
      cb(full);
    }
  }
}

/* ── 2. Collect all candidate image files ── */
function collectImages(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectImages(full));
    } else if (IMAGE_EXTS.has(path.extname(entry.name).toLowerCase())) {
      results.push(full);
    }
  }
  return results;
}

/* ── Run ── */
console.log(`\n🔍 Scanning for orphaned originals (${DRY_RUN ? "DRY RUN" : "DELETE MODE"})...\n`);

const sourceText = collectSourceText(SEARCH_DIRS);
const images     = collectImages(IMAGE_DIR);

let safeToDelete = [];
let kept         = [];

for (const imgPath of images) {
  const basename = path.basename(imgPath);
  const ext      = path.extname(imgPath).toLowerCase();
  const webpPath = imgPath.slice(0, -ext.length) + ".webp";

  // Must be protected?
  if (PROTECTED.has(basename)) {
    kept.push({ file: imgPath, reason: "protected" });
    continue;
  }

  // Has a WebP sibling?
  if (!fs.existsSync(webpPath)) {
    kept.push({ file: imgPath, reason: "no .webp sibling" });
    continue;
  }

  // Is it referenced anywhere in source?
  if (sourceText.includes(basename)) {
    kept.push({ file: imgPath, reason: "still referenced in source" });
    continue;
  }

  safeToDelete.push(imgPath);
}

/* ── Report ── */
const fmtKB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
let totalBytes = 0;

console.log(`🗑️  SAFE TO DELETE (${safeToDelete.length} files):\n`);
for (const f of safeToDelete) {
  const size = fs.statSync(f).size;
  totalBytes += size;
  const rel  = path.relative(ROOT, f);
  if (DRY_RUN) {
    console.log(`  [DRY RUN]  ${rel}  (${fmtKB(size)})`);
  } else {
    fs.unlinkSync(f);
    console.log(`  ✓ deleted  ${rel}  (${fmtKB(size)})`);
  }
}

console.log(`\n📦 KEPT (${kept.length} files):`);
for (const { file, reason } of kept) {
  console.log(`  • ${path.relative(ROOT, file)}  [${reason}]`);
}

console.log(`
${DRY_RUN ? "📊 DRY RUN COMPLETE" : "✅ DONE"}
  Files ${DRY_RUN ? "that would be" : ""} deleted: ${safeToDelete.length}
  Space ${DRY_RUN ? "that would be" : ""} reclaimed: ${fmtKB(totalBytes)} (${(totalBytes / 1024 / 1024).toFixed(2)} MB)

${DRY_RUN ? '  Run with --delete flag to actually remove files:\n  node scripts/cleanup-originals.mjs --delete' : ''}
`);
