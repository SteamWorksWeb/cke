import Link from "next/link";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Home",          href: "/" },
  { label: "Entertainment", href: "/category/entertainment" },
  { label: "Tech",          href: "/category/tech" },
  { label: "Sports",        href: "/category/sports" },
  { label: "Life",          href: "/category/life" },
  { label: "Outdoors",      href: "/category/outdoors" },
  { label: "Funny",         href: "/category/funny" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center group flex-shrink-0" id="nav-logo-link">
          <Image
            src="/images/logo.png"
            alt="Clay Knows Everything Logo"
            width={208}
            height={62}
            priority
            className="object-contain transition-opacity duration-200 group-hover:opacity-80"
          />
        </Link>

        {/* Nav + CTA — flat top-level links */}
        <div className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={`nav-${link.label.toLowerCase()}`}
              className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-black rounded-md hover:bg-gray-50 transition-all duration-200 whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}

          {/* ASK CLAY CTA */}
          <Link
            href="/ask-clay"
            id="nav-ask-clay-cta"
            className="ml-3 inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2 rounded-lg transition-all duration-200 shadow-sm uppercase tracking-wide whitespace-nowrap"
          >
            Ask Clay
          </Link>
        </div>

        {/* Mobile toggle — placeholder */}
        <button className="md:hidden p-2 text-gray-600" aria-label="Open menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>

      </div>
    </header>
  );
}
