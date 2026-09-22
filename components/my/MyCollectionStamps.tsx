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

function Stamp({
  card,
}: {
  card: CollectionCard;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center">
      {/* STAMP */}
      <div
        className={`relative flex h-[64px] w-[64px] items-center justify-center rounded-full ${
          card.collected
            ? "bg-[#DCE9D8]"
            : "bg-white/55"
        }`}
      >
        <div
          className={`flex h-[52px] w-[52px] items-center justify-center overflow-hidden rounded-full border-[1.5px] ${
            card.collected
              ? "border-[#BFD2BA]"
              : "border-[#DDE3DA]"
          }`}
        >
          {card.imageUrl ? (
            <img
              src={card.imageUrl}
              alt=""
              className={`h-full w-full object-cover ${
                card.collected
                  ? ""
                  : "opacity-20 grayscale"
              }`}
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className={`h-4 w-4 ${
                card.collected
                  ? "text-[#315A3F]"
                  : "text-[#C5CCC5]"
              }`}
              aria-hidden="true"
            >
              <path
                d="m12 3 1.45 5.55L19 10l-5.55 1.45L12 17l-1.45-5.55L5 10l5.55-1.45z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        {card.collected && (
          <span className="absolute -bottom-1 rounded-full bg-[#C69A45] px-2 py-0.5 text-[8px] font-bold text-[#17382A]">
            +{card.pointsEarned}
          </span>
        )}
      </div>

      {/* NAME */}
      <p
        className={`mt-3 max-w-[85px] truncate text-center text-[8px] font-semibold uppercase tracking-[0.1em] ${
          card.collected
            ? "text-[#315A3F]/65"
            : "text-[#9DA99F]"
        }`}
        title={card.name}
      >
        {card.name}
      </p>
    </div>
  );
}

export default function MyCollectionStamps() {
  const [data, setData] =
    useState<CollectionResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCollection() {
      try {
        const response = await fetch(
          "/api/my/collection",
          {
            cache: "no-store",
          }
        );

        if (!response.ok) return;

        const result =
          (await response.json()) as CollectionResponse;

        if (result.success) {
          setData(result);
        }
      } catch (error) {
        console.error(
          "LOAD COLLECTION ERROR:",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadCollection();
  }, []);

  const visibleCards =
    data?.cards?.slice(0, 6) ?? [];

  const hasMore =
    (data?.cards?.length ?? 0) > 6;

  return (
    <div
      id="collection"
      className="rounded-[24px] bg-[#E8EFE4] p-5"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-[#C69A45]">
            Collection
          </p>

          <h2 className="mt-1 font-display text-[20px] tracking-[-0.04em] text-[#315A3F]">
            Festival stamps
          </h2>
        </div>

        {/* SCAN BUTTON */}
        <Link
          href="/scan"
          aria-label="Scan booth"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#315A3F]/50 transition hover:bg-[#315A3F] hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-[14px] w-[14px]"
            aria-hidden="true"
          >
            <path
              d="M4 7V5.5A1.5 1.5 0 0 1 5.5 4H7"
              strokeLinecap="round"
            />
            <path
              d="M17 4h1.5A1.5 1.5 0 0 1 20 5.5V7"
              strokeLinecap="round"
            />
            <path
              d="M20 17v1.5a1.5 1.5 0 0 1-1.5 1.5H17"
              strokeLinecap="round"
            />
            <path
              d="M7 20H5.5A1.5 1.5 0 0 1 4 18.5V17"
              strokeLinecap="round"
            />
            <path
              d="M8 8h3v3H8zM13 13h3v3h-3z"
              strokeLinejoin="round"
            />
            <path
              d="M13 8h3M8 16h3"
              strokeLinecap="round"
            />
          </svg>
        </Link>
      </div>

      {/* STAMPS */}
      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-3 gap-x-3 gap-y-5">
            {Array.from({ length: 6 }).map(
              (_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center"
                >
                  <div className="h-16 w-16 animate-pulse rounded-full bg-white/50" />

                  <div className="mt-3 h-2 w-12 animate-pulse rounded-full bg-white/40" />
                </div>
              )
            )}
          </div>
        ) : visibleCards.length > 0 ? (
          <>
            <div className="grid grid-cols-3 gap-x-3 gap-y-5">
              {visibleCards.map((card) => (
                <Stamp
                  key={card.id}
                  card={card}
                />
              ))}
            </div>

            {/* VIEW ALL */}
            {hasMore && (
              <div className="mt-4 flex justify-end">
                <Link
                  href="/my/collection"
                  className="text-[9px] font-semibold text-[#315A3F]/55 underline decoration-[#315A3F]/15 underline-offset-4 transition hover:text-[#315A3F]"
                >
                  View all
                </Link>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[16px] bg-white/40 px-4 py-6 text-center">
            <p className="text-xs text-[#315A3F]/50">
              Belum ada collection.
            </p>

            <p className="mt-1 text-[9px] text-[#315A3F]/35">
              Scan booth untuk mulai mengumpulkan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}