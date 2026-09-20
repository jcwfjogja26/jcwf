"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
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

type SortOption =
  | "featured"
  | "price-low"
  | "price-high"
  | "name";

const categoryLabels: Record<
  MarketplaceItem["category"],
  string
> = {
  FOOD: "Food",
  CRAFT: "Craft",
  WELLNESS: "Wellness",
  LOCAL: "Local",
};

export default function MarketplacePage() {
  const { t } = useLanguage();

  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [activeCategory, setActiveCategory] =
    useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] =
    useState<SortOption>("featured");
  const [loading, setLoading] = useState(true);

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
    const keyword = search.trim().toLowerCase();

    let result = items.filter((item) => {
      const matchesCategory =
        activeCategory === "all" ||
        item.category.toLowerCase() ===
          activeCategory;

      const matchesSearch =
        !keyword ||
        item.title
          .toLowerCase()
          .includes(keyword) ||
        item.vendor
          .toLowerCase()
          .includes(keyword) ||
        item.category
          .toLowerCase()
          .includes(keyword);

      return matchesCategory && matchesSearch;
    });

    if (sort === "price-low") {
      result = [...result].sort(
        (a, b) => a.price - b.price
      );
    }

    if (sort === "price-high") {
      result = [...result].sort(
        (a, b) => b.price - a.price
      );
    }

    if (sort === "name") {
      result = [...result].sort((a, b) =>
        a.title.localeCompare(b.title)
      );
    }

    return result;
  }, [
    items,
    activeCategory,
    search,
    sort,
  ]);

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const categories = [
    {
      key: "all",
      label: "All",
    },
    {
      key: "food",
      label: "Food",
    },
    {
      key: "craft",
      label: "Craft",
    },
    {
      key: "wellness",
      label: "Wellness",
    },
    {
      key: "local",
      label: "Local",
    },
  ];

  return (
    <main className="min-h-screen bg-ivory text-forest">
      {/* =====================================================
          NAVBAR
      ===================================================== */}
      <header className="border-b border-forest/8 bg-ivory">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-14">
          <Link
            href="/"
            className="font-display text-[27px] font-semibold tracking-[-0.04em]"
          >
            JCWF<span className="text-gold">.</span>
          </Link>

          <Link
            href="/my"
            className="rounded-full bg-forest px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-gold hover:text-forest"
          >
            My JCWF
          </Link>
        </div>
      </header>

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}
      <section className="border-b border-forest/8 bg-white">
        <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-10 md:py-12 lg:px-14">
          {/* BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/"
              className="text-forest/35 transition hover:text-forest"
            >
              JCWF
            </Link>

            <span className="text-forest/20">
              /
            </span>

            <span className="font-medium text-forest/65">
              Marketplace
            </span>
          </div>

          {/* HEADER */}
          <div className="mt-9 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            {/* LEFT */}
            <div className="max-w-3xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
                JCWF Market
              </p>

              <h1 className="mt-3 font-display text-[clamp(3rem,5vw,5.25rem)] leading-[0.94] tracking-[-0.055em] text-forest">
                Things worth
                <br />
                <span className="text-gold">
                  bringing home.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-6 text-forest/50 md:text-[15px]">
                Food, crafts, wellness goods, and
                local products from the people
                behind JCWF.
              </p>
            </div>

            {/* RIGHT — COMPACT STATS */}
            <div className="flex shrink-0 items-center gap-5 lg:pb-1">
              <div className="h-12 w-px bg-forest/10" />

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-forest/35">
                  Available
                </p>

                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-4xl leading-none tracking-[-0.04em] text-forest">
                    {items.length}
                  </span>

                  <span className="text-xs text-forest/40">
                    products
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MARKETPLACE CONTENT
      ===================================================== */}
      <section className="mx-auto max-w-[1440px] px-6 py-8 md:px-10 md:py-10 lg:px-14">
        {/* SEARCH + SORT */}
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-forest/35">
              ⌕
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products, vendors, or categories..."
              className="h-12 w-full rounded-2xl border border-forest/10 bg-white pl-10 pr-4 text-sm text-forest outline-none transition placeholder:text-forest/30 focus:border-gold"
            />
          </div>

          {/* SORT */}
          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value as SortOption
              )
            }
            className="h-12 rounded-2xl border border-forest/10 bg-white px-4 text-sm text-forest outline-none focus:border-gold lg:w-[190px]"
          >
            <option value="featured">
              Featured
            </option>

            <option value="price-low">
              Price: Low to high
            </option>

            <option value="price-high">
              Price: High to low
            </option>

            <option value="name">
              Name: A–Z
            </option>
          </select>
        </div>

        {/* CATEGORY FILTER */}
        <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
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
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? "bg-forest text-ivory"
                    : "bg-white text-forest/55 ring-1 ring-forest/8 hover:bg-sage/50 hover:text-forest"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* RESULT INFO */}
        <div className="mt-8 flex items-center justify-between border-b border-forest/8 pb-4">
          <p className="text-xs text-forest/40">
            {loading
              ? "Loading..."
              : `${filteredItems.length} ${
                  filteredItems.length === 1
                    ? "item"
                    : "items"
                }`}
          </p>

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="text-xs font-semibold text-gold transition hover:text-forest"
            >
              Clear search
            </button>
          )}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-[1.8rem] bg-white"
                >
                  <div className="aspect-square animate-pulse bg-sage/40" />

                  <div className="space-y-3 p-5">
                    <div className="h-3 w-20 animate-pulse rounded-full bg-sage/50" />

                    <div className="h-6 w-3/4 animate-pulse rounded-full bg-sage/50" />

                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-sage/50" />
                  </div>
                </div>
              )
            )}
          </div>
        ) : filteredItems.length === 0 ? (
          /* EMPTY */
          <div className="py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage/60 text-2xl">
              ⌕
            </div>

            <h2 className="mt-6 font-display text-3xl tracking-[-0.03em]">
              Nothing found.
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-forest/45">
              Try another keyword or explore a
              different category.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setActiveCategory("all");
              }}
              className="mt-6 rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-gold hover:text-forest"
            >
              Reset filters
            </button>
          </div>
        ) : (
          /* PRODUCT GRID */
          <div className="grid gap-4 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {filteredItems.map((item) => (
              <Link
                key={item.id}
                href={`/marketplace/${item.slug}`}
                className="group overflow-hidden rounded-[1.8rem] bg-white ring-1 ring-forest/5 transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(23,56,42,0.08)]"
              >
                {/* IMAGE */}
                <div className="relative aspect-square overflow-hidden bg-sage/30">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-sage/40">
                      <span className="font-display text-3xl text-forest/20">
                        JCWF
                      </span>
                    </div>
                  )}

                  {/* CATEGORY */}
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] text-forest backdrop-blur-sm">
                    {categoryLabels[item.category]}
                  </span>

                  {/* ARROW */}
                  <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm text-forest shadow-sm transition duration-300 group-hover:rotate-45 group-hover:bg-gold">
                    ↗
                  </span>
                </div>

                {/* INFO */}
                <div className="p-5">
                  <p className="truncate text-[11px] text-forest/40">
                    {item.vendor}
                  </p>

                  <h2 className="mt-1.5 line-clamp-2 min-h-[56px] font-display text-2xl leading-tight tracking-[-0.03em] text-forest">
                    {item.title}
                  </h2>

                  {item.description && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-forest/40">
                      {item.description}
                    </p>
                  )}

                  <div className="mt-5 flex items-end justify-between gap-3 border-t border-forest/8 pt-4">
                    <div>
                      <p className="text-[9px] uppercase tracking-[0.12em] text-forest/30">
                        Price
                      </p>

                      <p className="mt-1 text-sm font-semibold text-forest">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {item.stock !== null && (
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-[0.12em] text-forest/30">
                          Stock
                        </p>

                        <p className="mt-1 text-xs font-medium text-forest/55">
                          {item.stock > 0
                            ? `${item.stock} left`
                            : "Sold out"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="mx-auto max-w-[1440px] px-6 pb-10 md:px-10 lg:px-14">
        <div className="flex flex-col justify-between gap-3 border-t border-forest/8 pt-6 text-xs text-forest/35 sm:flex-row">
          <p>
            JCWF 2026 · Jogja Cultural Wellness Festival
          </p>

          <p>
            Reconnecting — People, Culture & Wellbeing
          </p>
        </div>
      </footer>
    </main>
  );
}