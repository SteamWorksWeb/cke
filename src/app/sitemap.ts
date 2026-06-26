import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const SITE_URL = "https://clayknowseverything.com";

const CATEGORIES = [
  "entertainment",
  "tech",
  "sports",
  "life",
  "outdoors",
  "funny",
  "finance",
  "web-design",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const contentDir = path.join(process.cwd(), "src", "content");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  // Blog post entries
  const posts: MetadataRoute.Sitemap = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data } = matter(raw);
    const slug = data.slug || file.replace(".mdx", "");
    const date = data.date ? new Date(data.date) : new Date();

    return {
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: date,
      changeFrequency: "monthly",
      priority: 0.8,
    };
  });

  // Compute the most recent post date for use in static/category pages
  const mostRecentPost = posts.reduce<Date>((latest, p) => {
    const d = p.lastModified instanceof Date ? p.lastModified : new Date(p.lastModified as string);
    return d > latest ? d : latest;
  }, new Date("2020-01-01"));

  // Category archive pages — use most-recent post date per category
  const categoryLastMod: Record<string, Date> = {};
  files.forEach((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data } = matter(raw);
    const cats: string[] = Array.isArray(data.categories) ? data.categories : [];
    const date = data.date ? new Date(data.date) : new Date("2020-01-01");
    cats.forEach((cat) => {
      const slug = cat.toLowerCase().replace(" ", "-");
      if (!categoryLastMod[slug] || date > categoryLastMod[slug]) {
        categoryLastMod[slug] = date;
      }
    });
  });

  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: categoryLastMod[slug] ?? mostRecentPost,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: mostRecentPost,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: mostRecentPost,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date("2026-06-26"),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/ask-clay`,
      lastModified: new Date("2026-06-26"),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  return [...staticPages, ...categoryPages, ...posts];
}
