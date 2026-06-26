import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Clay",
  description:
    "Meet Clay — fishing guide, web designer, husband, father, and the man behind Clay Knows Everything. Real talk from someone who's been around.",
  alternates: {
    canonical: "https://clayknowseverything.com/about",
  },
  openGraph: {
    type: "profile",
    url: "https://clayknowseverything.com/about",
    title: "About Clay | Clay Knows Everything",
    description:
      "Meet Clay — fishing guide, web designer, husband, father, and the man behind Clay Knows Everything.",
    siteName: "Clay Knows Everything",
    images: [
      {
        url: "https://clayknowseverything.com/images/clay.png",
        width: 800,
        height: 800,
        alt: "Clay",
      },
    ],
  },
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Clay",
  url: "https://clayknowseverything.com/about",
  image: "https://clayknowseverything.com/images/clay.png",
  sameAs: ["https://clayknowseverything.com"],
  jobTitle: "Writer, Web Designer, Full-Time Outdoorsman",
  description:
    "Clay is a former full-time fishing guide, web designer, husband, father, and the voice behind Clay Knows Everything — a personal blog covering life, tech, outdoors, sports, and everything in between.",
  knowsAbout: [
    "Fishing",
    "Hunting",
    "Web Design",
    "Technology",
    "Sports",
    "Personal Finance",
    "Life Advice",
  ],
};

export default function AboutPage() {
  return (
    <div className="bg-white text-black min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* ── Hero ── */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <p className="text-xs uppercase tracking-[0.25em] font-semibold text-gray-400 mb-4">
          The Man Behind the Blog
        </p>
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-6xl font-bold text-black leading-tight mb-10">
          About Clay
        </h1>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-48 h-48 rounded-2xl overflow-hidden border-4 border-gray-100 shadow-lg">
              <Image
                src="/images/clay.png"
                alt="Clay — the author of Clay Knows Everything"
                width={192}
                height={192}
                className="object-cover w-full h-full"
                priority
              />
            </div>
          </div>

          {/* Bio */}
          <div className="flex-1 prose">
            <p>
              Hey — I&apos;m Clay. Welcome to <strong>Clay Knows Everything</strong>, which is admittedly an ambitious name for a guy who still burns toast. But I do know a lot of things, and more importantly, I have opinions about all of them.
            </p>
            <p>
              I spent over 12 years as a <strong>full-time fishing guide</strong>, putting clients on fish 300 days a year. That job taught me more about patience, problem-solving, and reading people than any classroom ever could. It also gave me a deep and completely unreasonable knowledge of boat trailer tires.
            </p>
            <p>
              These days I run a <strong>web design business</strong>, which means I went from waking up at 4am to chase fish to waking up at 4am to fix someone&apos;s WordPress site. Progress. I build websites for small businesses, and I genuinely love helping people show up well online.
            </p>
            <p>
              I&apos;m also a <strong>husband and father</strong>, a Christian, a sports fan who takes losses personally, a devoted cast-iron skillet defender, and someone who has strong feelings about handshakes, phone calls, and the right way to end both.
            </p>
            <p>
              This blog is where I write about all of it — tech, outdoors, sports, life, finance, entertainment, and whatever else I feel like the world needs to hear. No corporate spin. No SEO-stuffed filler. Just real talk from someone who&apos;s been around.
            </p>
            <p>
              <strong>Clay Knows Everything. And now, so do you.</strong>
            </p>
          </div>
        </div>
      </section>

      {/* ── What I Write About ── */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-14">
          <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black mb-8">
            What I Write About
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Life", color: "bg-emerald-700", href: "/category/life" },
              { label: "Outdoors", color: "bg-lime-700", href: "/category/outdoors" },
              { label: "Tech", color: "bg-violet-700", href: "/category/tech" },
              { label: "Sports", color: "bg-blue-700", href: "/category/sports" },
              { label: "Finance", color: "bg-amber-700", href: "/category/finance" },
              { label: "Entertainment", color: "bg-rose-700", href: "/category/entertainment" },
              { label: "Funny", color: "bg-orange-600", href: "/category/funny" },
              { label: "Web Design", color: "bg-cyan-700", href: "/category/web-design" },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={cat.href}
                id={`about-category-${cat.label.toLowerCase().replace(" ", "-")}`}
                className={`${cat.color} text-white text-center py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-widest hover:opacity-90 transition-opacity`}
              >
                {cat.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-14 text-center">
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-black mb-4">
          Got a question for Clay?
        </h2>
        <p className="text-gray-500 text-base mb-8 max-w-lg mx-auto">
          Ask me anything. Seriously — I have opinions on just about everything and I&apos;m not shy about sharing them.
        </p>
        <Link
          href="/ask-clay"
          id="about-ask-clay-cta"
          className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-lg transition-colors uppercase tracking-wide text-sm shadow-md hover:shadow-lg"
        >
          Ask Clay
        </Link>
      </section>
    </div>
  );
}
