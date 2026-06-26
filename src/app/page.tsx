import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Image from "next/image";
import Link from "next/link";

/* ── Types ── */
interface Post {
  title: string;
  date: string;
  slug: string;
  categories: string[];
  featuredImage: string | null;
  excerpt: string;
}

/* ── Category → colour map ── */
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

// Priority order — Life is last (most generic); pick the most specific category for the badge
const CATEGORY_PRIORITY = ["Entertainment","Tech","Sports","Outdoors","Finance","Web Design","Funny","Life"];

function primaryCategory(cats: string[]): string {
  if (!cats || cats.length === 0) return "";
  const sorted = [...cats].sort(
    (a, b) => CATEGORY_PRIORITY.indexOf(a) - CATEGORY_PRIORITY.indexOf(b)
  );
  return sorted[0] ?? cats[0];
}

function categoryColor(cats: string[]): string {
  const cat = primaryCategory(cats);
  return CATEGORY_COLORS[cat] ?? CATEGORY_COLORS["Default"];
}

/* ── Read all MDX posts from src/content/ ── */
function getAllPosts(): Post[] {
  const contentDir = path.join(process.cwd(), "src", "content");
  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data, content } = matter(raw);

    // Featured image from frontmatter (set by migration)
    const featuredImage: string | null =
      data.featuredImage && data.featuredImage !== "" ? data.featuredImage : null;

    // Plain-text excerpt from first paragraph
    const excerpt = content
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
      categories: Array.isArray(data.categories) ? data.categories : [],
      featuredImage,
      excerpt,
    };
  });

  return posts.sort((a, b) => (b.date > a.date ? 1 : -1));
}

/* ── Page ── */
export default function HomePage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="bg-white text-black min-h-screen">
      {/* ── Asymmetric Editorial Grid ── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 auto-rows-auto">

          {/* ── Featured Post — 2 cols × 2 rows ── */}
          {featured && (
            <Link
              href={`/blog/${featured.slug}`}
              id={`post-${featured.slug}`}
              className="relative rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300 bg-gray-900 md:col-span-2 md:row-span-2 block"
            >
              <div className="relative h-72 md:h-full min-h-[420px]">
                {featured.featuredImage ? (
                  <Image
                    src={featured.featuredImage}
                    alt={featured.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center p-10">
                    <Image
                      src="/images/logo.png"
                      alt="Clay Knows Everything"
                      width={200}
                      height={60}
                      className="object-contain opacity-20"
                    />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                {/* Category badge */}
                {featured.categories.length > 0 && (
                  <span className={`absolute top-4 left-4 ${categoryColor(featured.categories)} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-md z-10`}>
                    {primaryCategory(featured.categories)}
                  </span>
                )}
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-gray-400 text-xs mb-2">{featured.date}</p>
                <h2 className="font-[family-name:var(--font-playfair)] text-white text-2xl md:text-3xl font-bold leading-snug mb-2">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="text-gray-300 text-sm leading-relaxed line-clamp-2 mb-3">
                    {featured.excerpt}
                  </p>
                )}
                <span className="text-xs text-gray-400 font-medium">By Clay</span>
              </div>
            </Link>
          )}

          {/* ── Remaining Posts ── */}
          {rest.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              id={`post-${post.slug}`}
              className="rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100 block"
            >
              {/* Image area */}
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
                {/* Real category badge */}
                {post.categories.length > 0 && (
                  <span className={`absolute top-3 left-3 ${categoryColor(post.categories)} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md z-10`}>
                    {primaryCategory(post.categories)}
                  </span>
                )}
              </div>

              {/* Card body */}
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
      </section>
    </div>
  );
}
