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

  // Category archive pages
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/ask-clay`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  return [...staticPages, ...categoryPages, ...posts];
}
