"use client";

import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type MarketplaceItem = {
  id: string;
  title: string;
  slug: string;
  category: "FOOD" | "CRAFT" | "WELLNESS" | "LOCAL";
  vendor: string;
  description: string | null;
  price: number;
  stock: number | null;
  image_url: string | null;
  status: string;
};

export default function MarketplaceSection() {
  const { t } = useLanguage();

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [activeCategory, setActiveCategory] =
    useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const categories = [
    {
      key: "all",
      label: t.marketplace.categories.all,
    },
    {
      key: "food",
      label: t.marketplace.categories.food,
    },
    {
      key: "craft",
      label: t.marketplace.categories.craft,
    },
    {
      key: "wellness",
      label: t.marketplace.categories.wellness,
    },
    {
      key: "local",
      label: t.marketplace.categories.local,
    },
  ];

  useEffect(() => {
    const loadMarketplace = async () => {
      try {
        const response = await fetch("/api/marketplace");

        if (!response.ok) {
          throw new Error(
            "Failed to load marketplace."
          );
        }

        const data = await response.json();

        setItems(data.items ?? []);
      } catch (error) {
        console.error(
          "LOAD MARKETPLACE ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadMarketplace();
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        activeCategory === "all" ||
        item.category.toLowerCase() ===
          activeCategory;

      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.vendor.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [
    items,
    activeCategory,
    searchQuery,
  ]);

  return (
    <section
      id="marketplace"
      className="relative overflow-hidden bg-ivory py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.marketplace.eyebrow}
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.marketplace.titleLine1}
              <br />
              <span className="text-gold">
                {t.marketplace.titleLine2}
              </span>
            </h2>
          </div>

          <div className="flex max-w-md flex-col gap-5 lg:items-end lg:pb-2">
            <p className="text-sm leading-6 text-forest/60 lg:text-right lg:text-[15px] lg:leading-7">
              {t.marketplace.description}
            </p>

            <a
              href="/marketplace"
              className="inline-flex w-fit items-center rounded-full border border-white/15 bg-[#A8B99F]/55 px-5 py-2.5 text-sm font-semibold text-forest shadow-[0_8px_25px_rgba(23,56,42,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#A8B99F]/75"
            >
              {t.marketplace.viewAll}
            </a>
          </div>
        </div>

        {/* FILTER + SEARCH */}
        <div className="mt-10 flex flex-col gap-4 md:mt-12">
          
          {/* CATEGORIES */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((category) => {
              const isActive =
                activeCategory === category.key;

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() =>
                    setActiveCategory(
                      category.key
                    )
                  }
                  className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.06em] transition-all duration-300 ${
                    isActive
                      ? "bg-forest text-ivory"
                      : "bg-sage/55 text-forest/60 hover:bg-sage hover:text-forest"
                  }`}
                >
                  {category.label}
                </button>
              );
            })}
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:max-w-sm">
            <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-forest/40">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path
                  d="m16 16 4 4"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <input
              type="search"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              placeholder="Search marketplace..."
              className="w-full rounded-full border border-forest/10 bg-white/45 py-3 pl-11 pr-5 text-sm text-forest outline-none backdrop-blur-md transition-all placeholder:text-forest/35 focus:border-forest/20 focus:bg-white/65"
            />
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="mt-10 rounded-[1.75rem] bg-sage/35 px-6 py-12 text-center">
            <p className="text-sm text-forest/50">
              Loading marketplace...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-10 rounded-[1.75rem] bg-sage/35 px-6 py-12 text-center">
            <p className="font-display text-2xl text-forest">
              No marketplace found.
            </p>

            <p className="mt-2 text-sm text-forest/50">
              Try another category or search.
            </p>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:mt-10 md:grid-cols-4 lg:grid-cols-5 lg:gap-4">
            {filteredItems.map((item) => (
              <a
                key={item.id}
                href={`/marketplace/${item.slug}`}
                className="group overflow-hidden rounded-[1.5rem] bg-sage/35 transition-all duration-400 hover:-translate-y-1 hover:bg-sage/55 hover:shadow-[0_16px_35px_rgba(23,56,42,0.07)]"
              >
                {/* LOGO / IMAGE */}
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white/55 p-6 md:p-8">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.vendor}
                      className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-center">
                      <span className="font-display text-xl leading-tight text-forest/30 md:text-2xl">
                        {item.vendor}
                      </span>
                    </div>
                  )}

                  {/* CATEGORY */}
                  <span className="absolute left-3 top-3 rounded-full bg-ivory/90 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-forest backdrop-blur-md md:left-4 md:top-4 md:px-3 md:py-1.5 md:text-[9px]">
                    {item.category}
                  </span>
                </div>

                {/* BRAND INFO */}
                <div className="p-4 md:p-5">
                  <h3 className="font-display text-lg leading-tight tracking-[-0.025em] text-forest md:text-xl">
                    {item.vendor}
                  </h3>

                  <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-forest/40 md:text-[11px]">
                    {item.title}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}

       
      </div>
    </section>
  );
}