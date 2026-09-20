"use client";

import { useEffect, useState } from "react";
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
  const [activeCategory, setActiveCategory] = useState("all");
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
          throw new Error("Failed to load marketplace.");
        }

        const data = await response.json();

        setItems(data.items ?? []);
      } catch (error) {
        console.error("LOAD MARKETPLACE ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMarketplace();
  }, []);

  const filteredItems =
    activeCategory === "all"
      ? items
      : items.filter(
          (item) =>
            item.category.toLowerCase() === activeCategory
        );

  const featuredItem =
    activeCategory === "all"
      ? items[0]
      : null;

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section
      id="marketplace"
      className="relative overflow-hidden bg-ivory py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
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

          <p className="max-w-md text-sm leading-7 text-forest/60 lg:pb-2 lg:text-[15px]">
            {t.marketplace.description}
          </p>
        </div>

        {/* CATEGORY FILTER */}
        <div className="mt-10 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => {
            const isActive =
              activeCategory === category.key;

            return (
              <button
                key={category.key}
                type="button"
                onClick={() =>
                  setActiveCategory(category.key)
                }
                className={`shrink-0 rounded-full px-5 py-2.5 text-xs font-semibold tracking-[0.08em] transition-all duration-300 ${
                  isActive
                    ? "bg-forest text-ivory"
                    : "bg-sage/60 text-forest/60 hover:bg-forest hover:text-ivory"
                }`}
              >
                {category.label}
              </button>
            );
          })}
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="mt-8 rounded-[2rem] bg-sage/40 p-12 text-center">
            <p className="text-sm text-forest/50">
              Loading marketplace...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          /* EMPTY STATE */
          <div className="mt-8 rounded-[2rem] bg-sage/40 p-12 text-center">
            <p className="font-display text-2xl text-forest">
              No items found.
            </p>

            <p className="mt-2 text-sm text-forest/50">
              There are no marketplace items in this category yet.
            </p>
          </div>
        ) : (
          <>
            {/* FEATURED — ONLY ON ALL */}
            {featuredItem && (
              <div className="group relative mt-8 min-h-[420px] overflow-hidden rounded-[2rem] bg-forest md:min-h-[500px]">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
                  style={{
                    backgroundImage: `linear-gradient(
                      90deg,
                      rgba(23,56,42,0.9) 0%,
                      rgba(23,56,42,0.5) 45%,
                      rgba(23,56,42,0.08) 100%
                    ), url('${
                      featuredItem.image_url ??
                      "/images/marketplace-featured.jpg"
                    }')`,
                  }}
                />

                <div className="relative flex min-h-[420px] flex-col justify-end p-7 md:min-h-[500px] md:p-10 lg:p-12">
                  <span className="w-fit rounded-full bg-gold px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-forest">
                    {featuredItem.category}
                  </span>

                  <h3 className="mt-5 max-w-2xl font-display text-4xl leading-[0.95] tracking-[-0.04em] text-white md:text-6xl">
                    {featuredItem.title}
                  </h3>

                  <p className="mt-5 max-w-lg text-sm leading-6 text-white/65 md:text-[15px]">
                    {featuredItem.description}
                  </p>

                  <div className="mt-7 flex flex-wrap items-center gap-4">
                    <a
                      href={`/marketplace/${featuredItem.slug}`}
                      className="group/btn inline-flex items-center gap-3 rounded-full bg-ivory px-6 py-3.5 text-sm font-semibold text-forest transition-all duration-300 hover:bg-gold"
                    >
                      {t.marketplace.explore}

                      <span className="transition-transform duration-300 group-hover/btn:translate-x-1">
                        →
                      </span>
                    </a>

                    <span className="text-xs text-white/50">
                      {formatPrice(featuredItem.price)}
                    </span>
                  </div>
                </div>

                <div className="absolute right-7 top-7 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg text-forest shadow-lg transition-all duration-500 group-hover:rotate-45 group-hover:bg-gold md:right-10 md:top-10">
                  ↗
                </div>
              </div>
            )}

            {/* PRODUCT GRID */}
            <div
              className={`mt-5 grid gap-4 sm:grid-cols-2 ${
                activeCategory === "all"
                  ? "lg:grid-cols-4"
                  : "lg:grid-cols-3"
              }`}
            >
              {filteredItems.map((item) => (
                <a
                  key={item.id}
                  href={`/marketplace/${item.slug}`}
                  className="group overflow-hidden rounded-[1.8rem] bg-sage/50 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(23,56,42,0.08)]"
                >
                  {/* IMAGE */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${
                          item.image_url ??
                          "/images/marketplace-local.jpg"
                        }')`,
                      }}
                    />

                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[9px] font-bold tracking-[0.12em] text-forest backdrop-blur-sm">
                      {item.category}
                    </span>

                    <span className="absolute bottom-4 right-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-sm text-forest shadow-sm transition-all duration-300 group-hover:rotate-45 group-hover:bg-gold">
                      ↗
                    </span>
                  </div>

                  {/* INFO */}
                  <div className="p-5">
                    <p className="text-xs text-forest/45">
                      {item.vendor}
                    </p>

                    <h3 className="mt-1 font-display text-2xl tracking-[-0.03em] text-forest">
                      {item.title}
                    </h3>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-forest">
                        {formatPrice(item.price)}
                      </span>

                      <span className="text-xs text-forest/40">
                        {t.marketplace.view}
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* BOTTOM CTA */}
        <div className="mt-8 flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
          <p className="max-w-lg font-display text-2xl leading-tight text-forest md:text-3xl">
            {t.marketplace.bottomTitleLine1}
            <span className="text-gold">
              {" "}
              {t.marketplace.bottomTitleLine2}
            </span>
          </p>

          <a
            href="/marketplace"
            className="group inline-flex items-center gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
          >
            {t.marketplace.viewAll}

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}