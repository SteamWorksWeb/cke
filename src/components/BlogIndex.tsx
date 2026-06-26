"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { PostSummary } from "@/app/blog/page";

/* ── Category config ── */
const CATEGORY_COLORS: Record<string, string> = {
  Entertainment: "bg-rose-700",
  Tech: "bg-violet-700",
  Sports: "bg-blue-700",
  Outdoors: "bg-lime-700",
  Finance: "bg-amber-700",
  "Web Design": "bg-cyan-700",
  Funny: "bg-orange-600",
  Life: "bg-emerald-700",
  Default: "bg-gray-700",
};

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

function categoryColor(name: string): string {
  return CATEGORY_COLORS[name] ?? CATEGORY_COLORS["Default"];
}

/* ── Tab pill active colours ── */
const TAB_ACTIVE_COLORS: Record<string, string> = {
  All: "bg-black text-white",
  Entertainment: "bg-rose-700 text-white",
  Tech: "bg-violet-700 text-white",
  Sports: "bg-blue-700 text-white",
  Outdoors: "bg-lime-700 text-white",
  Finance: "bg-amber-700 text-white",
  "Web Design": "bg-cyan-700 text-white",
  Funny: "bg-orange-600 text-white",
  Life: "bg-emerald-700 text-white",
};

/* ── Component ── */
interface Props {
  posts: PostSummary[];
}

export default function BlogIndex({ posts }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  /* Derive the sorted category list from the actual posts */
  const categories = useMemo(() => {
    const seen = new Set<string>();
    posts.forEach((p) => {
      if (p.primaryCat) seen.add(p.primaryCat);
    });
    return CATEGORY_PRIORITY.filter((c) => seen.has(c));
  }, [posts]);

  /* Filter posts */
  const filtered = useMemo(() => {
    if (activeCategory === "All") return posts;
    return posts.filter((p) => p.primaryCat === activeCategory);
  }, [posts, activeCategory]);

  return (
    <div className="bg-white text-black min-h-screen">
      {/* ── Page Header ── */}
      <section className="max-w-7xl mx-auto px-6 pt-14 pb-8 border-b border-gray-100">
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gray-400 mb-3">
          Clay Knows Everything
        </p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <h1 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl font-bold text-black leading-tight">
            All Posts
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            {filtered.length}{" "}
            {filtered.length === 1 ? "article" : "articles"}
            {activeCategory !== "All" ? ` in ${activeCategory}` : " total"}
          </p>
        </div>
      </section>

      {/* ── Category Filter Tabs ── */}
      <section className="max-w-7xl mx-auto px-6 py-6">
        <div
          className="flex flex-wrap gap-2"
          role="tablist"
          aria-label="Filter by category"
        >
          {/* All tab */}
          <button
            id="filter-all"
            role="tab"
            aria-selected={activeCategory === "All"}
            onClick={() => setActiveCategory("All")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-150 border ${
              activeCategory === "All"
                ? `${TAB_ACTIVE_COLORS["All"]} border-black shadow-md`
                : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-black"
            }`}
          >
            All
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              id={`filter-${cat.toLowerCase().replace(" ", "-")}`}
              role="tab"
              aria-selected={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all duration-150 border ${
                activeCategory === cat
                  ? `${TAB_ACTIVE_COLORS[cat] ?? "bg-gray-700 text-white"} border-transparent shadow-md`
                  : "bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-black"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* ── Posts Grid ── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-24">
            No articles in this category yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                id={`blog-post-${post.slug}`}
                className="rounded-lg overflow-hidden group shadow-md hover:shadow-xl transition-shadow duration-300 bg-white border border-gray-100 block"
              >
                {/* Thumbnail */}
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
                  {post.primaryCat && (
                    <span
                      className={`absolute top-3 left-3 ${categoryColor(post.primaryCat)} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md z-10`}
                    >
                      {post.primaryCat}
                    </span>
                  )}
                </div>

                {/* Card body */}
                <div className="p-4">
                  <h2 className="font-[family-name:var(--font-playfair)] text-black text-base font-bold leading-snug mb-2 line-clamp-2">
                    {post.title}
                  </h2>
                  {post.excerpt && (
                    <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-3">
                      {post.excerpt}
                    </p>
                  )}
                  <span className="text-xs text-gray-400 font-medium">
                    By Clay · {post.date}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
