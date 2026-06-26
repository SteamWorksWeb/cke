#!/usr/bin/env node
/**
 * fix-categories.mjs
 * Patches every MDX file in src/content/ with the EXACT categories
 * pulled directly from the WordPress REST API.
 * Run: node scripts/fix-categories.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.resolve(__dirname, "../src/content");

/* ── Ground-truth category map from WP API ──────────────────────
   Derived from:
   https://clayknowseverything.com/wp-json/wp/v2/posts?per_page=100&_embed&_fields=slug,categories,_embedded
   Category IDs: 10=Sports 11=Life 12=Funny 13=Tech 14=Outdoors
                 17=Finance 18=Web Design 19=Entertainment
   ─────────────────────────────────────────────────────────────── */
const CATEGORY_MAP = {
  "i-was-raised-in-church-but-jesus-set-me-free":                                                                ["Outdoors"],
  "found-worms-in-your-catch-dont-throw-it-away":                                                                ["Outdoors"],
  "the-computer-finally-talks-back":                                                                             ["Life", "Tech"],
  "the-triple-a-recipe-loving-your-husband-the-way-he-was-designed-for":                                        ["Life"],
  "the-ghost-in-the-diamond-why-the-era-of-the-human-umpire-is-over":                                          ["Life", "Tech"],
  "how-a-gun-suppressor-works-the-science-myths-and-real-world-purpose":                                        ["Life", "Tech"],
  "the-origins-of-timekeeping-who-gave-us-time-the-365-day-calendar-and-the-24-hour-day":                      ["Life", "Tech"],
  "why-the-308-winchester-is-the-best-all-around-medium-to-big-game-hunting-round":                            ["Life"],
  "how-to-tell-a-story-that-sticks":                                                                            ["Life"],
  "muscadines-and-scuppernongs-natures-best-wild-fruit":                                                        ["Life"],
  "i-thought-i-had-allergies-and-anxiety-for-15-years-turns-out-it-was-nicotine":                              ["Life"],
  "stop-dont-use-soap-on-that-cast-iron-skillet":                                                               ["Life"],
  "what-a-handshake-really-says-the-psychology-of-turning-a-hand-over":                                        ["Life"],
  "chatgpt-grok-and-midjourney-for-image-creation-a-no-fluff-comparison":                                      ["Tech"],
  "ummmm-no-the-art-of-speaking-with-purpose":                                                                  ["Life"],
  "the-urgent-need-for-reproduction-understanding-birth-replacement-theory":                                    ["Life"],
  "why-we-celebrate-the-4th-of-july":                                                                           ["Life"],
  "good-cheap-or-fast-which-two-should-you-choose":                                                             ["Life"],
  "why-olukai-sandals-are-the-best-for-boating-the-beach-the-lake-and-everyday-wear":                         ["Outdoors", "Life"],
  "why-bananas-are-considered-bad-luck-on-boats-a-comprehensive-look":                                         ["Outdoors", "Life"],
  "the-bloodsuckers-choice-why-some-people-are-mosquito-magnets":                                               ["Life", "Outdoors"],
  "the-only-way-to-win-with-a-narcissist-is-not-to-play-their-game-the-definitive-guide":                      ["Life"],
  "cut-and-run-how-to-know-when-to-let-go-of-something-or-somebody":                                           ["Life"],
  "how-to-be-the-go-to-person-for-people-to-call":                                                             ["Life"],
  "the-art-of-anti-selling-how-to-sell-without-selling":                                                       ["Life", "Finance"],
  "a-short-guide-on-how-to-bet-on-college-football-understanding-the-lines-and-how-the-lines-are-set":        ["Life", "Finance", "Sports"],
  "how-to-have-an-amazing-date-night-with-your-spouse-for-0-10":                                               ["Life"],
  "democracy-republic-and-constitutional-republic-a-comparative-exploration":                                   ["Life"],
  "how-to-win-an-argument-with-your-wife-five-not-so-conventional-techniques":                                 ["Life", "Funny"],
  "if-i-got-drafted-by-major-league-baseball-today-my-advice-for-2023s-first-year-pros":                      ["Life", "Sports"],
  "a-quick-guide-to-building-your-own-premium-wordpress-website-under-200":                                    ["Tech"],
  "how-to-delete-all-your-unread-emails-in-gmail":                                                             ["Tech"],
  "the-case-for-using-truck-tires-on-your-boat-trailer-a-comprehensive-guide":                                 ["Outdoors", "Life", "Sports"],
  "movie-review-air-the-nike-michael-jordan-story":                                                            ["Entertainment"],
  "what-is-the-difference-between-chatgpt-and-bard":                                                           ["Tech"],
  "this-is-so-stupid-high-school-baseball-team-forfeits-state-tournament-game-because-of-one-pitch":          ["Sports"],
  "a-brief-history-of-timekeeping-from-sundials-to-atomic-clocks":                                             ["Life"],
  "why-is-the-ocean-salty-understanding-the-science-behind-ocean-salinitywhy-is-the-ocean-salty":             ["Life", "Outdoors"],
  "some-of-my-favorite-marriage-memes":                                                                        ["Funny"],
  "samsung-galaxy-s23-ultra-review-a-cinema-camera-in-your-pocket":                                            ["Tech", "Life"],
  "power-pole-move-trolling-motor-the-game-changer-that-every-fisherman-needs":                                ["Outdoors"],
  "clays-friday-playlist":                                                                                      ["Entertainment"],
  "baseball-is-ruining-itself-nobody-asked-for-this-mess-so-stupid":                                           ["Sports"],
  "cocaine-bear-movie-review-worst-movie-i-have-seen-in-a-theater-in-2023-and-maybe-ever":                    ["Entertainment"],
  "jesus-revolution-movie-review-best-movie-i-have-seen-in-a-theater-in-2023":                                ["Entertainment"],
  "the-best-landing-net-i-ever-used-for-fishing-the-frabill-biber-net":                                       ["Outdoors"],
  "2-great-options-for-a-podcast-microphone-for-under-50":                                                     ["Tech"],
  "how-to-optimize-your-website-for-maximum-conversions-and-success":                                          ["Tech", "Web Design"],
  "how-to-know-if-your-web-designer-is-holding-you-hostage-and-how-to-leave-them":                            ["Tech"],
  "the-best-option-for-getting-a-mortgage":                                                                    ["Finance"],
  "samsung-g9-49-ultra-widescreen-computer-monitor-the-best-monitor-clay-has-ever-owned":                     ["Tech"],
  "where-to-find-the-best-prices-on-ammunition":                                                               ["Outdoors"],
  "the-most-useful-book-clay-has-ever-read":                                                                   ["Life"],
  "a-great-truck-bed-cover-is-worth-every-penny":                                                              ["Life"],
  "the-best-seasoning-on-the-planet":                                                                          ["Life"],
  "the-one-purchase-clay-made-during-the-pandemic-that-changed-his-life":                                      ["Outdoors"],
  "if-clay-only-had-one-fishing-lure-to-use-the-rest-of-his-life-and-he-needed-it-to-survive":               ["Outdoors"],
  "the-only-3-things-in-the-world-with-real-tangible-value":                                                   ["Life"],
  "the-5-most-common-things-people-do-that-wreck-their-website":                                               ["Tech"],
  "the-funniest-binge-worthy-tv-show-you-have-never-heard-of":                                                 ["Life", "Funny"],
  "the-best-pocket-knife-for-saltwater-fishermen-and-fisherwomen":                                             ["Outdoors"],
  "the-best-usa-based-managed-wordpress-hosting":                                                              ["Tech"],
  "the-best-pocket-knife-for-everyday-carry":                                                                  ["Outdoors"],
  "the-best-home-theater-projector-clay-has-ever-owned-and-everything-else-you-need-to-complete-your-home-theater": ["Tech"],
  "5-wordpress-plugins-that-clay-uses-on-every-web-design-build":                                              ["Tech"],
  "clays-top-5-favorite-movies-of-all-time":                                                                   ["Life"],
  "the-best-baseball-tv-show-your-kids-probably-never-heard-of":                                               ["Sports"],
  "the-best-online-booking-system-we-have-used-to-date":                                                       ["Outdoors", "Tech"],
};

/* ── Patch a single MDX file ─────────────────────────────────── */
function patchFile(filePath, slug, newCategories) {
  let content = fs.readFileSync(filePath, "utf8");

  // Build the replacement categories line
  const newLine = `categories: [${newCategories.map((c) => `"${c}"`).join(", ")}]`;

  // Replace existing categories line (handles any previous value)
  if (/^categories:.*$/m.test(content)) {
    content = content.replace(/^categories:.*$/m, newLine);
  } else {
    // Insert after slug line if no categories field exists
    content = content.replace(/^(slug:.*$)/m, `$1\n${newLine}`);
  }

  fs.writeFileSync(filePath, content, "utf8");
}

/* ── Main ────────────────────────────────────────────────────── */
const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
let patched = 0;
let skipped = 0;
let notFound = 0;

console.log(`\n🔧  Patching categories in ${files.length} MDX files...\n`);

for (const file of files) {
  const slug = file.replace(".mdx", "");
  const correctCats = CATEGORY_MAP[slug];

  if (!correctCats) {
    console.warn(`  ⚠  No mapping found for: ${slug}`);
    notFound++;
    continue;
  }

  const filePath = path.join(CONTENT_DIR, file);
  try {
    patchFile(filePath, slug, correctCats);
    console.log(`  ✓  ${slug}`);
    console.log(`     → [${correctCats.join(", ")}]`);
    patched++;
  } catch (err) {
    console.warn(`  ✗  Failed: ${slug} — ${err.message}`);
    skipped++;
  }
}

console.log(`\n✅  Done: ${patched} patched, ${skipped} failed, ${notFound} not in map.\n`);
