import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

/* ── Valid category slugs → display names ── */
const CATEGORY_MAP: Record<string, string> = {
  entertainment: "Entertainment",
  tech:          "Tech",
  sports:        "Sports",
  life:          "Life",
  outdoors:      "Outdoors",
  funny:         "Funny",
  finance:       "Finance",
  "web-design":  "Web Design",
};

/* ── Category colour map ── */
const CATEGORY_COLORS: Record<string, string> = {
  "Entertainment":  "bg-rose-700",
  "Tech":           "bg-violet-700",
  "Sports":         "bg-blue-700",
  "Outdoors":       "bg-lime-700",
  "Finance":        "bg-amber-700",
  "Web Design":     "bg-cyan-700",
  "Funny":          "bg-orange-600",
  "Life":           "bg-emerald-700",
  "Default":        "bg-gray-700",
};

/* ── Priority: more specific categories beat "Life" ── */
const CATEGORY_PRIORITY = [
  "Entertainment", "Tech", "Sports", "Outdoors",
  "Finance", "Web Design", "Funny", "Life",
];

/** Returns the single primary category for a post (most specific wins) */
function primaryCategory(cats: string[]): string {
  if (!cats || cats.length === 0) return "";
  const sorted = [...cats].sort(
    (a, b) => CATEGORY_PRIORITY.indexOf(a) - CATEGORY_PRIORITY.indexOf(b)
  );
  return sorted[0] ?? cats[0];
}

function categoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? CATEGORY_COLORS["Default"];
}

interface Post {
  title: string;
  date: string;
  slug: string;
  categories: string[];
  primaryCat: string;
  featuredImage: string | null;
  excerpt: string;
}

/**
 * Include posts that list this category anywhere in their categories array.
 * A post tagged ["Life","Tech"] appears on BOTH /category/life AND /category/tech.
 * The primary category is still used only for the badge display.
 */
function getPostsByCategory(categoryName: string): Post[] {
  const contentDir = path.join(process.cwd(), "src", "content");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
      const { data, content } = matter(raw);

      const categories: string[] = Array.isArray(data.categories) ? data.categories : [];

      // Include if ANY of the post's categories matches (case-insensitive)
      const belongs = categories.some(
        (c) => c.toLowerCase() === categoryName.toLowerCase()
      );
      if (!belongs) return null;

      const primCat = primaryCategory(categories);

      const featuredImage: string | null =
        data.featuredImage && data.featuredImage !== "" ? data.featuredImage : null;

      const excerpt =
        content
          .replace(/!\[.*?\]\(.*?\)/g, "")
          .replace(/#{1,6}\s+/g, "")
          .replace(/\*\*|__|\*|_/g, "")
          .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
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
    .filter((p): p is Post => p !== null)
    .sort((a, b) => (b.date > a.date ? 1 : -1));
}

/* ── Generate static params for all known categories ── */
export function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((slug) => ({ slug }));
}

/* ── Per-category metadata ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = CATEGORY_MAP[slug];
  if (!categoryName) return {};

  const title = `${categoryName} Articles`;
  const description = `Read all of Clay's ${categoryName} articles — real talk, no fluff, straight from someone who's been around.`;
  const url = `https://clayknowseverything.com/category/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: `${title} | Clay Knows Everything`,
      description,
      siteName: "Clay Knows Everything",
      images: [{ url: "https://clayknowseverything.com/images/logo.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/* ── Page ── */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categoryName = CATEGORY_MAP[slug];
  if (!categoryName) notFound();

  const posts = getPostsByCategory(categoryName);
  const color = categoryColor(categoryName);

  return (
    <div className="bg-white text-black min-h-screen">
      {/* ── Category Header ── */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-10 border-b border-gray-100">
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gray-400 mb-3">
          What Clay Knows
        </p>
        <div className="flex items-center gap-4">
          <span className={`${color} text-white text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-md`}>
            {categoryName}
          </span>
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-black leading-tight">
            {categoryName}
          </h1>
        </div>
        <p className="text-gray-500 text-sm mt-3">
          {posts.length} article{posts.length !== 1 ? "s" : ""}
        </p>
      </section>

      {/* ── Posts Grid ── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-20">No articles in this category yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                id={`post-${post.slug}`}
                className="rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100 block"
              >
                <div className="relative h-48 bg-gray-50">
                  {post.featuredImage ? (
                    <Image
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src="/images/logo.png"
                        alt="Clay Knows Everything"
                        width={100}
                        height={30}
                        className="object-contain opacity-20"
                      />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 ${color} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md z-10`}>
                    {categoryName}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-[family-name:var(--font-playfair)] text-black text-base font-bold leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="text-xs text-gray-400 font-medium">By Clay · {post.date}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
