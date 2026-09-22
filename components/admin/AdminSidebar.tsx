"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

const sections: NavSection[] = [
  {
    label: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: "⌂",
      },
    ],
  },
  {
    label: "Participants",
    items: [
      {
        label: "Check-ins",
        href: "/admin/checkins",
        icon: "✓",
      },
    ],
  },
  {
    label: "Experience",
    items: [
      {
        label: "Activities",
        href: "/admin/activities",
        icon: "◈",
      },
      {
        label: "Communities",
        href: "/admin/communities",
        icon: "○",
      },
      {
        label: "Marketplace",
        href: "/admin/marketplace",
        icon: "◇",
      },
      {
        label: "Collection",
        href: "/admin/collection",
        icon: "▣",
      },
      {
        label: "Gallery",
        href: "/admin/gallery",
        icon: "▧",
      },
    ],
  },
  {
    label: "Engagement",
    items: [
      {
        label: "Points",
        href: "/admin/points",
        icon: "✧",
      },
      {
        label: "Rewards",
        href: "/admin/rewards",
        icon: "◆",
      },
      {
        label: "Redemptions",
        href: "/admin/rewards/redemptions",
        icon: "◆",
      },
    ],
  },
  
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
      ===================================================== */}
      <aside className="hidden w-[250px] shrink-0 border-r border-[#17382A]/10 bg-[#17382A] text-white lg:flex lg:flex-col">
        {/* BRAND */}
        <div className="border-b border-white/10 px-6 py-6">
          <Link href="/admin" className="block">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#D9A441]">
              JCWF 2026
            </p>

            <h1 className="mt-1 font-display text-xl font-semibold">
              Admin Panel
            </h1>

            <p className="mt-1 text-xs text-white/35">
              Festival Control
            </p>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.label}>
                <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-white/30">
                  {section.label}
                </p>

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-white text-[#17382A]"
                            : "text-white/60 hover:bg-white/8 hover:text-white"
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${
                            active
                              ? "bg-[#DCE9DC] text-[#17382A]"
                              : "bg-white/6 text-white/45 group-hover:text-white"
                          }`}
                        >
                          {item.icon}
                        </span>

                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        
      </aside>

      {/* =====================================================
          MOBILE
      ===================================================== */}
      <div className="lg:hidden">
        {/* TOP BAR */}
        <header className="sticky top-0 z-50 border-b border-[#17382A]/10 bg-[#F7F3E8]/95 px-4 py-3 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#C89B3C]">
                JCWF 2026
              </p>

              <p className="font-display text-lg font-semibold leading-tight text-[#17382A]">
                Admin Panel
              </p>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17382A] text-white transition hover:bg-[#C89B3C] hover:text-[#17382A]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* OVERLAY */}
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={closeMobileMenu}
            className="fixed inset-0 z-[60] bg-[#17382A]/25 backdrop-blur-[2px]"
          />
        )}

        {/* DRAWER */}
        <aside
          className={`fixed right-0 top-0 z-[70] h-dvh w-[82vw] max-w-[360px] bg-[#17382A] text-white shadow-[-20px_0_60px_rgba(23,56,42,0.18)] transition-transform duration-300 ease-out ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* DRAWER HEADER */}
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-[#D9A441]">
                JCWF 2026
              </p>

              <p className="mt-1 font-display text-xl font-semibold">
                Admin Panel
              </p>
            </div>

            <button
              type="button"
              onClick={closeMobileMenu}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-white/70 transition hover:bg-white hover:text-[#17382A]"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M6 6l12 12M18 6L6 18"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* MENU */}
          <nav className="h-[calc(100dvh-145px)] overflow-y-auto px-4 py-5">
            <div className="space-y-6">
              {sections.map((section) => (
                <div key={section.label}>
                  <p className="mb-2 px-2 text-[8px] font-bold uppercase tracking-[0.2em] text-white/30">
                    {section.label}
                  </p>

                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = isActive(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                            active
                              ? "bg-white text-[#17382A]"
                              : "text-white/65 hover:bg-white/8 hover:text-white"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs ${
                              active
                                ? "bg-[#DCE9DC] text-[#17382A]"
                                : "bg-white/6 text-white/45"
                            }`}
                          >
                            {item.icon}
                          </span>

                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </nav>

          
          
        </aside>
      </div>
    </>
  );
}