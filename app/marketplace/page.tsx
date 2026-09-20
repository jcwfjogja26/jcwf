"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type MarketplaceItem = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  vendor_name: string;
  price: number | null;
  stock: number | null;
  image_url: string | null;
  status: string;
};

const categoryStyles: Record<string, string> = {
  FOOD: "bg-[#F3E8D8] text-[#765637]",
  CRAFT: "bg-[#E9E5D8] text-[#59604B]",
  WELLNESS: "bg-[#E3ECE3] text-[#3D5B47]",
  LOCAL: "bg-[#E7E9DF] text-[#59624E]",
};

const categories = [
  "ALL",
  "FOOD",
  "CRAFT",
  "WELLNESS",
  "LOCAL",
];

export default function MarketplacePage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    async function loadMarketplace() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/marketplace", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Gagal mengambil data marketplace."
          );
        }

        setItems(data.items ?? data.marketplace ?? []);
      } catch (error) {
        console.error("LOAD MARKETPLACE ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Gagal memuat marketplace."
        );
      } finally {
        setLoading(false);
      }
    }

    loadMarketplace();
  }, []);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" ||
        item.category?.toUpperCase() === selectedCategory;

      const matchesSearch =
        !query ||
        item.title?.toLowerCase().includes(query) ||
        item.vendor_name?.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [items, searchQuery, selectedCategory]);

  return (
    <main className="min-h-screen bg-ivory text-forest">
      {/* HEADER */}
      <header className="border-b border-forest/8 bg-ivory">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-14">
          <Link
            href="/"
            className="font-display text-[28px] font-semibold tracking-[-0.04em] text-forest"
          >
            JCWF<span className="text-gold">.</span>
          </Link>

          <Link
            href="/my"
            className="rounded-full border border-forest/10 bg-white/60 px-5 py-2.5 text-xs font-semibold text-forest backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-sage"
          >
            My JCWF
          </Link>
        </div>
      </header>

      {/* PAGE */}
      <section className="mx-auto max-w-[1440px] px-6 pb-20 pt-10 md:px-10 md:pb-28 md:pt-14 lg:px-14">
        {/* BACK */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-forest/10 bg-white/80 px-4 py-2 text-xs font-semibold text-forest shadow-[0_5px_18px_rgba(23,56,42,0.05)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-sage"
        >
          <span
            aria-hidden="true"
            className="text-sm leading-none"
          >
            ←
          </span>
          Back
        </Link>

        {/* INTRO */}
        <div className="mt-10 border-b border-forest/10 pb-10 md:mt-14 md:pb-12">
          <div className="grid gap-7 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-16">
            <div className="max-w-4xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                JCWF Marketplace
              </p>

              <h1 className="mt-4 font-display text-[clamp(3.2rem,7vw,7rem)] font-medium leading-[0.88] tracking-[-0.06em] text-forest">
                Things worth
                <br />
                <span className="text-gold">bringing home.</span>
              </h1>
            </div>

            <p className="max-w-md text-sm leading-7 text-forest/55 lg:pb-2 lg:text-[15px]">
              Discover local food, crafts, wellness experiences,
              and thoughtful finds from the people and communities
              behind JCWF.
            </p>
          </div>
        </div>

        {/* SEARCH + FILTER */}
        <div className="mt-8 flex flex-col gap-5 md:mt-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full md:max-w-md">
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
                className="w-full rounded-full border border-forest/10 bg-white/60 py-3.5 pl-11 pr-5 text-sm text-forest outline-none backdrop-blur-md transition-all placeholder:text-forest/30 focus:border-gold/40 focus:bg-white/80 focus:shadow-[0_0_0_4px_rgba(196,157,73,0.07)]"
              />
            </div>

            <p className="text-xs text-forest/35 md:text-right">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </p>
          </div>

          {/* CATEGORY */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((category) => {
              const active = selectedCategory === category;

              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] transition-all duration-300 ${
                    active
                      ? "bg-forest text-ivory"
                      : "border border-forest/10 bg-white/55 text-forest/50 hover:bg-sage hover:text-forest"
                  }`}
                >
                  {category === "ALL" ? "All" : category}
                </button>
              );
            })}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-[1.5rem] border border-forest/6 bg-white"
              >
                <div className="aspect-square animate-pulse bg-sage/60" />

                <div className="space-y-3 p-4 md:p-5">
                  <div className="h-2.5 w-16 animate-pulse rounded-full bg-sage/70" />
                  <div className="h-5 w-3/4 animate-pulse rounded-full bg-sage/60" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-sage/50" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="mt-10 rounded-[2rem] border border-red-200/70 bg-red-50 p-10 text-center">
            <p className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-ivory transition-colors hover:bg-gold hover:text-forest"
            >
              Try Again
            </button>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="mt-10 rounded-[2rem] bg-sage/45 px-6 py-16 text-center md:px-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              Marketplace
            </p>

            <h2 className="mt-3 font-display text-3xl tracking-[-0.04em] text-forest md:text-4xl">
              Nothing found.
            </h2>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-forest/50">
              Try another keyword or explore a different category.
            </p>

            {(searchQuery || selectedCategory !== "ALL") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("ALL");
                }}
                className="mt-6 rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
              >
                View All
              </button>
            )}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
            {filteredItems.map((item) => {
              const category =
                item.category?.toUpperCase() || "LOCAL";

              return (
                <Link
                  key={item.id}
                  href={`/marketplace/${item.slug}`}
                  className="group block overflow-hidden rounded-[1.5rem] border border-forest/8 bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(23,56,42,0.08)] md:rounded-[1.75rem]"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-square overflow-hidden bg-sage">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-sage">
                        <span className="font-display text-3xl tracking-[-0.04em] text-forest/20 md:text-4xl">
                          JCWF
                        </span>
                      </div>
                    )}

                    {/* CATEGORY */}
                    <span
                      className={`absolute left-3 top-3 rounded-full px-2.5 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] md:left-4 md:top-4 md:px-3 md:text-[9px] ${
                        categoryStyles[category] ??
                        "bg-ivory text-forest"
                      }`}
                    >
                      {category}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-4 md:p-5">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.15em] text-gold md:text-[10px]">
                      {item.vendor_name}
                    </p>

                    <h2 className="mt-1.5 font-display text-[1.35rem] leading-[0.95] tracking-[-0.035em] text-forest md:text-[1.65rem]">
                      {item.title}
                    </h2>

                    {item.description && (
                      <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-forest/45 md:mt-3 md:text-xs md:leading-5">
                        {item.description}
                      </p>
                    )}

                    <div className="mt-4 border-t border-forest/8 pt-3.5 md:mt-5 md:pt-4">
                      <span className="text-[10px] font-medium text-forest/40 md:text-xs">
                        Discover more
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* BOTTOM */}
        {!loading && !error && filteredItems.length > 0 && (
          <div className="mt-14 border-t border-forest/10 pt-8 md:mt-20 md:flex md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                JCWF Community
              </p>

              <p className="mt-2 max-w-lg font-display text-xl leading-tight tracking-[-0.02em] text-forest md:text-2xl">
                More than things.
                <br />
                <span className="text-gold">
                  Stories worth discovering.
                </span>
              </p>
            </div>

            <Link
              href="/"
              className="mt-6 inline-flex w-fit rounded-full border border-forest/10 bg-white px-5 py-3 text-xs font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-sage md:mt-0"
            >
              Back to JCWF
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}