import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

/* ── Helpers ── */
const CONTENT_DIR = path.join(process.cwd(), "src", "content");

const CATEGORY_COLORS: Record<string, string> = {
  "Entertainment": "bg-rose-700",
  "Tech":          "bg-violet-700",
  "Sports":        "bg-blue-700",
  "Outdoors":      "bg-lime-700",
  "Finance":       "bg-amber-700",
  "Web Design":    "bg-cyan-700",
  "Funny":         "bg-orange-600",
  "Life":          "bg-emerald-700",
};

const CATEGORY_PRIORITY = [
  "Entertainment", "Tech", "Sports", "Outdoors",
  "Finance", "Web Design", "Funny", "Life",
];

function primaryCategory(cats: string[]): string {
  if (!cats?.length) return "";
  return [...cats].sort(
    (a, b) => CATEGORY_PRIORITY.indexOf(a) - CATEGORY_PRIORITY.indexOf(b)
  )[0] ?? cats[0];
}

/* ── Related posts ── */
interface RelatedPost {
  title: string;
  slug: string;
  featuredImage: string | null;
  date: string;
  categories: string[];
}

function getRelatedPosts(currentSlug: string, categoryName: string, limit = 3): RelatedPost[] {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files
    .map((file) => {
      const slug = file.replace(".mdx", "");
      if (slug === currentSlug) return null;
      const { data } = matter(fs.readFileSync(path.join(CONTENT_DIR, file), "utf8"));
      const cats: string[] = Array.isArray(data.categories) ? data.categories : [];
      if (primaryCategory(cats) !== categoryName) return null;
      return {
        title: data.title || slug,
        slug: data.slug || slug,
        featuredImage: data.featuredImage || null,
        date: data.date || "",
        categories: cats,
      };
    })
    .filter((p): p is RelatedPost => p !== null)
    .sort((a, b) => (b.date > a.date ? 1 : -1))
    .slice(0, limit);
}

/* ── Static params — one per MDX file ── */
export async function generateStaticParams() {
  const files = fs.readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".mdx"));
  return files.map((f) => ({ slug: f.replace(".mdx", "") }));
}

/* ── Metadata ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return {};

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  // Use explicit frontmatter description if available, else extract from content
  const excerpt = data.description || content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*|__|\*|_/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean)[0]
    ?.slice(0, 160) || "";

  const title = data.title ?? slug;
  const ogTitle = title.length > 60 ? title.slice(0, 57) + "\u2026" : title;
  const ogImage = data.featuredImage
    ? `https://clayknowseverything.com${data.featuredImage}`
    : "https://clayknowseverything.com/images/logo.png";

  return {
    title,
    description: excerpt,
    ...(data.noindex ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical: `https://clayknowseverything.com/blog/${slug}`,
    },
    openGraph: {
      type: "article",
      url: `https://clayknowseverything.com/blog/${slug}`,
      title: ogTitle,
      description: excerpt,
      siteName: "Clay Knows Everything",
      publishedTime: data.date ? new Date(data.date).toISOString() : undefined,
      authors: ["Clay"],
      images: [{ url: ogImage, width: 1200, height: 630, alt: ogTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: excerpt,
      images: [ogImage],
    },
  };
}

/* ── Page ── */
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) notFound();

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  // Configure marked for clean output
  marked.setOptions({ gfm: true, breaks: true });
  const htmlContent = await marked(content);

  // Reading time estimate
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  // Clean excerpt for JSON-LD
  const excerpt = content
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*|__|\*|_/g, "")
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean)[0]
    ?.slice(0, 200) || "";

  const categories: string[] = Array.isArray(data.categories) ? data.categories : [];
  const primCat = primaryCategory(categories);
  const badgeColor = CATEGORY_COLORS[primCat] ?? "bg-gray-700";
  const featuredImage: string | null =
    data.featuredImage && data.featuredImage !== "" ? data.featuredImage : null;
  const relatedPosts = primCat ? getRelatedPosts(slug, primCat) : [];

  // Article JSON-LD schema
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: excerpt,
    image: data.featuredImage
      ? `https://clayknowseverything.com${data.featuredImage}`
      : "https://clayknowseverything.com/images/logo.png",
    datePublished: data.date ? new Date(data.date).toISOString() : undefined,
    dateModified: data.date ? new Date(data.date).toISOString() : undefined,
    author: {
      "@type": "Person",
      name: "Clay",
      url: "https://clayknowseverything.com/about",
    },
    publisher: {
      "@type": "Organization",
      name: "Clay Knows Everything",
      logo: {
        "@type": "ImageObject",
        url: "https://clayknowseverything.com/images/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://clayknowseverything.com/blog/${slug}`,
    },
    keywords: categories.join(", "),
    wordCount,
    timeRequired: `PT${readingTime}M`,
  };

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://clayknowseverything.com" },
      primCat
        ? { "@type": "ListItem", position: 2, name: primCat, item: `https://clayknowseverything.com/category/${primCat.toLowerCase()}` }
        : null,
      { "@type": "ListItem", position: primCat ? 3 : 2, name: data.title, item: `https://clayknowseverything.com/blog/${slug}` },
    ].filter(Boolean),
  };

  return (
    <div className="bg-white text-black min-h-screen">
      {/* ── JSON-LD Schemas ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {/* ── Visual Breadcrumb ── */}
      <nav className="max-w-4xl mx-auto px-6 pt-6 pb-2" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-xs text-gray-400 flex-wrap">
          <li><Link href="/" className="hover:text-orange-500 transition-colors">Home</Link></li>
          {primCat && (
            <>
              <li aria-hidden>·</li>
              <li>
                <Link
                  href={`/category/${primCat.toLowerCase().replace(" ", "-")}`}
                  className="hover:text-orange-500 transition-colors"
                >
                  {primCat}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden>·</li>
          <li className="text-gray-600 font-medium line-clamp-1 max-w-xs">{data.title}</li>
        </ol>
      </nav>

      {/* ── Hero ── */}
      {featuredImage && (
        <div className="relative w-full h-[420px] md:h-[520px] bg-gray-900 overflow-hidden">
          <Image
            src={featuredImage}
            alt={data.title ?? ""}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-75"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Hero text overlay */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 max-w-4xl mx-auto w-full">
            {primCat && (
              <span className={`inline-block ${badgeColor} text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-md mb-4`}>
                {primCat}
              </span>
            )}
            <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-white leading-tight drop-shadow-lg">
              {data.title}
            </h1>
            <p className="text-gray-300 text-sm mt-3 font-medium">
              By Clay &nbsp;·&nbsp; {data.date}
            </p>
          </div>
        </div>
      )}

      {/* ── If no featured image, show plain header ── */}
      {!featuredImage && (
        <div className="max-w-4xl mx-auto px-6 pt-14 pb-8 border-b border-gray-100">
          {primCat && (
            <span className={`inline-block ${badgeColor} text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-md mb-4`}>
              {primCat}
            </span>
          )}
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl md:text-5xl font-bold text-black leading-tight">
            {data.title}
          </h1>
          <p className="text-gray-500 text-sm mt-3">By Clay &nbsp;·&nbsp; {data.date}</p>
        </div>
      )}

      {/* ── Article Body ── */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Author chip + reading time */}
        <div className="flex items-center gap-3 mb-10 pb-6 border-b border-gray-100">
          <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100">
            <Image
              src="/images/clay.webp"
              alt="Clay"
              width={44}
              height={44}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-black">Clay</p>
            <p className="text-xs text-gray-400">{data.date} &nbsp;·&nbsp; {readingTime} min read</p>
          </div>
          {primCat && (
            <span className={`ml-auto ${badgeColor} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md`}>
              {primCat}
            </span>
          )}
        </div>

        {/* Rendered markdown */}
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {/* ── Back navigation ── */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black transition-colors"
          >
            ← Back to all posts
          </Link>
          {primCat && (
            <Link
              href={`/category/${primCat.toLowerCase().replace(" ", "-")}`}
              className={`${badgeColor} text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity`}
            >
              More {primCat}
            </Link>
          )}
        </div>
      </div>

      {/* ── Related Posts ── */}
      {relatedPosts.length > 0 && (
        <section className="border-t border-gray-100 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-14">
            <div className="flex items-center gap-3 mb-8">
              {primCat && (
                <span className={`${badgeColor} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md`}>
                  {primCat}
                </span>
              )}
              <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-black">
                More from Clay
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 group block"
                >
                  <div className="relative h-44 bg-gray-100">
                    {post.featuredImage ? (
                      <Image
                        src={post.featuredImage}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Image src="/images/logo.png" alt="" width={80} height={24} className="opacity-20 object-contain" />
                      </div>
                    )}
                    {primCat && (
                      <span className={`absolute top-3 left-3 ${badgeColor} text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md z-10`}>
                        {primCat}
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-[family-name:var(--font-playfair)] text-black text-sm font-bold leading-snug line-clamp-2 mb-2">
                      {post.title}
                    </h3>
                    <span className="text-xs text-gray-400">By Clay · {post.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
