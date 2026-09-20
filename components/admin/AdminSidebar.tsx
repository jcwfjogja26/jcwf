"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        label: "Registrations",
        href: "/admin/registrations",
        icon: "◎",
      },
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
        label: "My Collection",
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
  {
    label: "Administration",
    items: [
      {
        label: "Admin & Staff",
        href: "/admin/users",
        icon: "♙",
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: "⚙",
      },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/admin") {
      return pathname === "/admin";
    }

    return pathname.startsWith(href);
  }

  return (
    <aside className="hidden w-[250px] shrink-0 border-r border-[#17382A]/10 bg-[#17382A] text-white lg:flex lg:flex-col">
      {/* BRAND */}
      <div className="border-b border-white/10 px-6 py-6">
        <Link
          href="/admin"
          className="block"
        >
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
                {section.items.map(
                  (item) => {
                    const active =
                      isActive(item.href);

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

                        <span className="truncate">
                          {item.label}
                        </span>
                      </Link>
                    );
                  }
                )}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 px-3 py-3">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/30">
            Festival
          </p>

          <p className="mt-1 text-xs font-semibold text-white/75">
            06 — 08 November 2026
          </p>

          <p className="mt-0.5 text-[10px] text-white/30">
            Loman Park · Yogyakarta
          </p>
        </div>
      </div>
    </aside>
  );
}