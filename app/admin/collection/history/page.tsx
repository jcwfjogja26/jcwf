"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type CollectionHistory = {
  id: string;

  participant: {
    id: string;
    reconnectId: string;
    fullName: string;
    email: string;
  } | null;

  card: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  } | null;

  booth: {
    id: string;
    code: string;
    name: string;
    location: string | null;
  } | null;

  pointsEarned: number;
  collectedAt: string;
};

type Summary = {
  totalCollections: number;
  totalPoints: number;
  uniqueParticipants: number;
  uniqueCards: number;
};

type CardOption = {
  id: string;
  name: string;
};

type BoothOption = {
  id: string;
  name: string;
};

export default function CollectionHistoryPage() {
  const [collections, setCollections] = useState<
    CollectionHistory[]
  >([]);

  const [summary, setSummary] =
    useState<Summary>({
      totalCollections: 0,
      totalPoints: 0,
      uniqueParticipants: 0,
      uniqueCards: 0,
    });

  const [cards, setCards] = useState<CardOption[]>(
    []
  );

  const [booths, setBooths] =
    useState<BoothOption[]>([]);

  const [search, setSearch] = useState("");
  const [cardId, setCardId] = useState("");
  const [boothId, setBoothId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (cardId) {
        params.set("cardId", cardId);
      }

      if (boothId) {
        params.set("boothId", boothId);
      }

      const response = await fetch(
        `/api/admin/collection/history?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengambil collection history."
        );
      }

      setCollections(data.collections ?? []);

      setSummary(
        data.summary ?? {
          totalCollections: 0,
          totalPoints: 0,
          uniqueParticipants: 0,
          uniqueCards: 0,
        }
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      const response = await fetch(
        "/api/admin/collection",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return;
      }

      setCards(
        (data.cards ?? []).map(
          (card: any) => ({
            id: card.id,
            name: card.name,
          })
        )
      );

      setBooths(
        (data.qrCodes ?? []).map(
          (qr: any) => ({
            id: qr.id,
            name: qr.boothName,
          })
        )
      );
    } catch (error) {
      console.error(
        "Load collection filters error:",
        error
      );
    }
  };

  useEffect(() => {
    loadFilters();
    loadHistory();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory();
    }, 350);

    return () => clearTimeout(timer);
  }, [search, cardId, boothId]);

  const hasFilters = useMemo(() => {
    return Boolean(
      search.trim() ||
        cardId ||
        boothId
    );
  }, [search, cardId, boothId]);

  const clearFilters = () => {
    setSearch("");
    setCardId("");
    setBoothId("");
  };

  const formatDate = (value: string) => {
    return new Intl.DateTimeFormat(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(value));
  };

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F7F3E8] px-6 py-8 text-[#17382A] lg:px-10">
        <div className="mx-auto max-w-[1500px]">
          {/* ============================================
              HEADER
          ============================================ */}

          <div className="flex flex-col gap-5 border-b border-[#17382A]/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4A63A]">
                My Collection
              </p>

              <h1 className="mt-2 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">
                Collection History
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#17382A]/55">
                Monitor collection cards gathered by
                participants across JCWF booths and
                experiences.
              </p>
            </div>

            <a
              href="/admin/collection"
              className="inline-flex w-fit items-center rounded-full border border-[#17382A]/10 bg-white px-5 py-3 text-sm font-semibold text-[#17382A] transition hover:bg-[#17382A] hover:text-white"
            >
              ← Manage Collection
            </a>
          </div>

          {/* ============================================
              SUMMARY
          ============================================ */}

          <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Collections"
              value={summary.totalCollections}
              description="Successful card scans"
            />

            <SummaryCard
              label="Points Earned"
              value={summary.totalPoints}
              description="Points from collections"
            />

            <SummaryCard
              label="Participants"
              value={summary.uniqueParticipants}
              description="Participants collecting cards"
            />

            <SummaryCard
              label="Cards Collected"
              value={summary.uniqueCards}
              description="Unique cards collected"
            />
          </section>

          {/* ============================================
              FILTERS
          ============================================ */}

          <section className="mt-8 rounded-[28px] border border-[#17382A]/8 bg-white p-5 shadow-[0_12px_40px_rgba(23,56,42,0.04)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
              {/* SEARCH */}

              <div className="flex-1">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#17382A]/45">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Name, Reconnect ID, email, card, booth..."
                  className="h-12 w-full rounded-2xl border border-[#17382A]/10 bg-[#FAFAF6] px-4 text-sm outline-none transition placeholder:text-[#17382A]/30 focus:border-[#D4A63A]"
                />
              </div>

              {/* CARD */}

              <div className="w-full xl:w-64">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#17382A]/45">
                  Collection Card
                </label>

                <select
                  value={cardId}
                  onChange={(event) =>
                    setCardId(event.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-[#17382A]/10 bg-[#FAFAF6] px-4 text-sm outline-none focus:border-[#D4A63A]"
                >
                  <option value="">
                    All cards
                  </option>

                  {cards.map((card) => (
                    <option
                      key={card.id}
                      value={card.id}
                    >
                      {card.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* BOOTH */}

              <div className="w-full xl:w-64">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-[#17382A]/45">
                  Booth
                </label>

                <select
                  value={boothId}
                  onChange={(event) =>
                    setBoothId(event.target.value)
                  }
                  className="h-12 w-full rounded-2xl border border-[#17382A]/10 bg-[#FAFAF6] px-4 text-sm outline-none focus:border-[#D4A63A]"
                >
                  <option value="">
                    All booths
                  </option>

                  {booths.map((booth) => (
                    <option
                      key={booth.id}
                      value={booth.id}
                    >
                      {booth.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* CLEAR */}

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-12 rounded-2xl border border-[#17382A]/10 px-5 text-sm font-semibold text-[#17382A] transition hover:bg-[#17382A] hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>
          </section>

          {/* ============================================
              TABLE
          ============================================ */}

          <section className="mt-6 overflow-hidden rounded-[28px] border border-[#17382A]/8 bg-white shadow-[0_12px_40px_rgba(23,56,42,0.04)]">
            <div className="flex items-center justify-between border-b border-[#17382A]/8 px-6 py-5">
              <div>
                <h2 className="font-serif text-2xl">
                  Scan Activity
                </h2>

                <p className="mt-1 text-xs text-[#17382A]/45">
                  {loading
                    ? "Loading..."
                    : `${collections.length} collection${
                        collections.length === 1
                          ? ""
                          : "s"
                      } found`}
                </p>
              </div>
            </div>

            {error && (
              <div className="m-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-[#17382A]/45">
                Loading collection history...
              </div>
            ) : collections.length === 0 ? (
              <div className="px-6 py-20 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAF1EB] text-2xl">
                  ◌
                </div>

                <h3 className="mt-5 font-serif text-2xl">
                  No collections yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#17382A]/45">
                  Collection scans from participants
                  will appear here once they start
                  discovering booth cards.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#17382A]/8 bg-[#FAFAF6] text-left">
                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#17382A]/45">
                        Participant
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#17382A]/45">
                        Collection Card
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#17382A]/45">
                        Booth
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#17382A]/45">
                        Points
                      </th>

                      <th className="px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#17382A]/45">
                        Collected At
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {collections.map(
                      (collection) => (
                        <tr
                          key={collection.id}
                          className="border-b border-[#17382A]/6 last:border-b-0"
                        >
                          {/* PARTICIPANT */}

                          <td className="px-6 py-5">
                            <div>
                              <p className="text-sm font-semibold text-[#17382A]">
                                {collection
                                  .participant
                                  ?.fullName ||
                                  "Unknown participant"}
                              </p>

                              <p className="mt-1 text-xs font-medium text-[#D4A63A]">
                                {collection
                                  .participant
                                  ?.reconnectId ||
                                  "—"}
                              </p>

                              {collection
                                .participant
                                ?.email && (
                                <p className="mt-1 text-xs text-[#17382A]/40">
                                  {
                                    collection
                                      .participant
                                      .email
                                  }
                                </p>
                              )}
                            </div>
                          </td>

                          {/* CARD */}

                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#EAF1EB]">
                                {collection.card
                                  ?.imageUrl ? (
                                  <img
                                    src={
                                      collection
                                        .card
                                        .imageUrl
                                    }
                                    alt={
                                      collection
                                        .card
                                        .name ||
                                      "Collection card"
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-lg text-[#17382A]/30">
                                    ✦
                                  </div>
                                )}
                              </div>

                              <div>
                                <p className="text-sm font-semibold">
                                  {collection.card
                                    ?.name ||
                                    "Unknown card"}
                                </p>

                                <p className="mt-1 text-xs text-[#17382A]/40">
                                  {collection.card
                                    ?.slug ||
                                    "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* BOOTH */}

                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold">
                              {collection.booth
                                ?.name ||
                                "Unknown booth"}
                            </p>

                            <p className="mt-1 text-xs text-[#17382A]/40">
                              {collection.booth
                                ?.location ||
                                collection.booth
                                  ?.code ||
                                "—"}
                            </p>
                          </td>

                          {/* POINTS */}

                          <td className="px-6 py-5">
                            <span className="inline-flex rounded-full bg-[#EAF1EB] px-3 py-1.5 text-xs font-semibold text-[#17382A]">
                              +
                              {
                                collection.pointsEarned
                              }{" "}
                              pts
                            </span>
                          </td>

                          {/* DATE */}

                          <td className="px-6 py-5">
                            <p className="text-sm text-[#17382A]/65">
                              {formatDate(
                                collection.collectedAt
                              )}
                            </p>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#17382A]/8 bg-white p-6 shadow-[0_12px_40px_rgba(23,56,42,0.04)]">
      <p className="text-xs font-semibold uppercase tracking-[0.13em] text-[#17382A]/40">
        {label}
      </p>

      <p className="mt-3 font-serif text-4xl tracking-[-0.03em]">
        {value.toLocaleString("en-US")}
      </p>

      <p className="mt-2 text-xs text-[#17382A]/40">
        {description}
      </p>
    </div>
  );
}