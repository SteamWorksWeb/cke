"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { label: "Home",          href: "/" },
  { label: "Entertainment", href: "/category/entertainment" },
  { label: "Tech",          href: "/category/tech" },
  { label: "Sports",        href: "/category/sports" },
  { label: "Life",          href: "/category/life" },
  { label: "Outdoors",      href: "/category/outdoors" },
  { label: "Finance",       href: "/category/finance" },
  { label: "Funny",         href: "/category/funny" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
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

          {/* Desktop Nav */}
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

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-600 hover:text-black transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {menuOpen ? (
              /* X icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              /* Hamburger icon */
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>

        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer */}
      <nav
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Mobile navigation"
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            <Image
              src="/images/logo.png"
              alt="Clay Knows Everything"
              width={140}
              height={42}
              className="object-contain"
            />
          </Link>
          <button
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 text-gray-500 hover:text-black transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <div className="flex-1 overflow-y-auto py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              id={`mobile-nav-${link.label.toLowerCase()}`}
              className="flex items-center px-6 py-3.5 text-base font-medium text-gray-700 hover:text-black hover:bg-gray-50 transition-colors border-b border-gray-50"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Ask Clay CTA at the bottom */}
        <div className="p-6 border-t border-gray-100">
          <Link
            href="/ask-clay"
            id="mobile-nav-ask-clay"
            className="flex items-center justify-center w-full bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-3.5 rounded-lg transition-colors uppercase tracking-wide text-sm"
            onClick={() => setMenuOpen(false)}
          >
            Ask Clay
          </Link>
        </div>
      </nav>
    </>
  );
}
