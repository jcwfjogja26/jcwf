"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CollectionCard = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  points: number;
  collected: boolean;
  collectedAt: string | null;
  collectionId: string | null;
  pointsEarned: number;
};

type CollectionResponse = {
  success: boolean;
  progress: {
    collected: number;
    total: number;
    percentage: number;
  };
  cards: CollectionCard[];
};

export default function MyCollectionCard() {
  const [data, setData] =
    useState<CollectionResponse | null>(null);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadCollection() {
      try {
        const response = await fetch(
          "/api/my/collection",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) {
          return;
        }

        const result =
          (await response.json()) as CollectionResponse;

        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error(
          "Failed to load My Collection:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadCollection();
  }, []);

  if (loading) {
    return (
      <section className="rounded-[28px] border border-[#E8E5DE] bg-white p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-40 rounded bg-[#F1EFE9]" />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="aspect-square rounded-2xl bg-[#F1EFE9]"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <section className="rounded-[28px] border border-[#E8E5DE] bg-white p-6">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8C8A82]">
            Your journey
          </p>

          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#20231F]">
            My Collection
          </h2>

          <p className="mt-1 text-sm text-[#77766F]">
            Collect cards as you explore JCWF.
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-2xl font-semibold text-[#20231F]">
            {data.progress.collected}
            <span className="text-[#A6A39B]">
              /{data.progress.total}
            </span>
          </p>

          <p className="text-xs text-[#8C8A82]">
            cards collected
          </p>
        </div>
      </div>

      {/* PROGRESS */}
      <div className="mt-5">
        <div className="h-2 overflow-hidden rounded-full bg-[#EEECE6]">
          <div
            className="h-full rounded-full bg-[#20231F] transition-all duration-500"
            style={{
              width: `${data.progress.percentage}%`,
            }}
          />
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-[#8C8A82]">
          <span>
            {data.progress.percentage}% complete
          </span>

          <span>
            {data.progress.total -
              data.progress.collected}{" "}
            cards left
          </span>
        </div>
      </div>

      {/* CARDS */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {data.cards.map((card) => {
          if (card.collected) {
            return (
              <div
                key={card.id}
                className="group overflow-hidden rounded-2xl border border-[#E8E5DE] bg-[#FAF9F6]"
              >
                {/* IMAGE */}
                <div className="relative aspect-square overflow-hidden bg-[#E8E5DE]">
                  {card.imageUrl ? (
                    <img
                      src={card.imageUrl}
                      alt={card.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center">
                      <span className="text-sm font-semibold text-[#77766F]">
                        {card.name}
                      </span>
                    </div>
                  )}

                  <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-sm font-bold text-[#20231F] shadow-sm">
                    ✓
                  </div>
                </div>

                {/* INFO */}
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-[#20231F]">
                    {card.name}
                  </p>

                  <p className="mt-1 text-xs text-[#8C8A82]">
                    +{card.pointsEarned} points
                  </p>
                </div>
              </div>
            );
          }

          return (
            <div
              key={card.id}
              className="overflow-hidden rounded-2xl border border-dashed border-[#D9D6CD] bg-[#F7F6F2]"
            >
              {/* LOCKED IMAGE */}
              <div className="relative aspect-square overflow-hidden">
                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8E5DE] text-[#96938A]">
                    ?
                  </div>

                  <p className="mt-3 text-xs font-semibold text-[#9A978E]">
                    Locked
                  </p>
                </div>
              </div>

              <div className="border-t border-[#E5E2DA] p-3">
                <p className="line-clamp-2 text-sm font-medium text-[#A19E95]">
                  {card.name}
                </p>

                <p className="mt-1 text-xs text-[#B0ADA5]">
                  +{card.points} points
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#F6F4EE] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#20231F]">
            Discover more cards
          </p>

          <p className="mt-1 text-xs leading-5 text-[#77766F]">
            Visit JCWF booths and scan their QR codes
            to grow your collection.
          </p>
        </div>

        <Link
          href="/scan"
          className="inline-flex shrink-0 items-center justify-center rounded-full bg-[#20231F] px-5 py-2.5 text-xs font-semibold text-white transition hover:opacity-90"
        >
          Scan a booth
        </Link>
      </div>
    </section>
  );
}