import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Metadata } from "next";
import BlogIndex from "@/components/BlogIndex";

/* ── Metadata ── */
export const metadata: Metadata = {
  title: "All Posts",
  description:
    "Every article Clay has written — browse by category or scroll them all. Real talk on life, tech, sports, outdoors, finance, entertainment, and more.",
  alternates: {
    canonical: "https://clayknowseverything.com/blog",
  },
  openGraph: {
    type: "website",
    url: "https://clayknowseverything.com/blog",
    title: "All Posts | Clay Knows Everything",
    description:
      "Every article Clay has written — browse by category or scroll them all.",
    siteName: "Clay Knows Everything",
    images: [
      {
        url: "https://clayknowseverything.com/images/logo.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

/* ── Types ── */
export interface PostSummary {
  title: string;
  date: string;
  slug: string;
  categories: string[];
  primaryCat: string;
  featuredImage: string | null;
  excerpt: string;
}

/* ── Helpers ── */
const CATEGORY_PRIORITY = [
  "Entertainment",
  "Tech",
  "Sports",
  "Outdoors",
  "Finance",
  "Web Design",
  "Funny",
  "Life",
];

function primaryCategory(cats: string[]): string {
  if (!cats?.length) return "";
  return [...cats].sort(
    (a, b) => CATEGORY_PRIORITY.indexOf(a) - CATEGORY_PRIORITY.indexOf(b)
  )[0] ?? cats[0];
}

function getAllPosts(): PostSummary[] {
  const contentDir = path.join(process.cwd(), "src", "content");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
      const { data, content } = matter(raw);

      const categories: string[] = Array.isArray(data.categories)
        ? data.categories
        : [];
      const primCat = primaryCategory(categories);

      const featuredImage: string | null =
        data.featuredImage && data.featuredImage !== ""
          ? data.featuredImage
          : null;

      const excerpt =
        content
          .replace(/!\[.*?\]\(.*?\)/g, "")
          .replace(/#{1,6}\s+/g, "")
          .replace(/\*\*|__|[*_]/g, "")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
          .split("\n")
          .map((l: string) => l.trim())
          .filter(Boolean)[0]
          ?.slice(0, 160) || "";

      return {
        title: data.title || file.replace(".mdx", ""),
        date: data.date || "",
        slug: data.slug || file.replace(".mdx", ""),
        categories,
        primaryCat: primCat,
        featuredImage,
        excerpt,
      };
    })
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

/* ── Page ── */
export default function BlogPage() {
  const posts = getAllPosts();
  return <BlogIndex posts={posts} />;
}
