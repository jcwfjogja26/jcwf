"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

type Checkin = {
  id: string;
  ticketId: string;
  participantId: string;

  eventDate: string;
  checkedInAt: string;

  ticketCode: string;
  ticketType: string;
  ticketStatus: string;

  fullName: string;
  reconnectId: string;
  email: string;
  whatsapp: string;
};

const festivalDays = [
  {
    date: "2026-11-06",
    label: "Day 01",
    title: "Reconnect",
  },
  {
    date: "2026-11-07",
    label: "Day 02",
    title: "Experience",
  },
  {
    date: "2026-11-08",
    label: "Day 03",
    title: "Celebrate",
  },
];

export default function CheckinsPage() {
  const [checkins, setCheckins] =
    useState<Checkin[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [selectedDay, setSelectedDay] =
    useState("ALL");

  const [error, setError] =
    useState("");

  useEffect(() => {
    loadCheckins();
  }, []);

  async function loadCheckins() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/checkins",
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengambil data."
        );
      }

      setCheckins(data.checkins ?? []);
    } catch (error) {
      console.error(error);

      setError(
        "Gagal memuat data check-in."
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredCheckins = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return checkins.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.fullName
          .toLowerCase()
          .includes(keyword) ||
        item.reconnectId
          .toLowerCase()
          .includes(keyword) ||
        item.ticketCode
          .toLowerCase()
          .includes(keyword) ||
        item.email
          .toLowerCase()
          .includes(keyword);

      const matchesDay =
        selectedDay === "ALL" ||
        item.eventDate === selectedDay;

      return (
        matchesSearch && matchesDay
      );
    });
  }, [
    checkins,
    search,
    selectedDay,
  ]);

  const dayCounts = useMemo(() => {
    return {
      all: checkins.length,

      day1: checkins.filter(
        (item) =>
          item.eventDate ===
          "2026-11-06"
      ).length,

      day2: checkins.filter(
        (item) =>
          item.eventDate ===
          "2026-11-07"
      ).length,

      day3: checkins.filter(
        (item) =>
          item.eventDate ===
          "2026-11-08"
      ).length,
    };
  }, [checkins]);

  function formatDate(
    dateString: string
  ) {
    const date = new Date(
      dateString
    );

    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(date);
  }

  function formatTime(
    dateString: string
  ) {
    const date = new Date(
      dateString
    );

    return new Intl.DateTimeFormat(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    ).format(date);
  }

  function getDayInfo(
    date: string
  ) {
    return festivalDays.find(
      (day) => day.date === date
    );
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
        {/* HEADER */}
        <header className="sticky top-0 z-40 border-b border-[#17382A]/10 bg-[#F7F3E8]/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/scanner"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#17382A] text-lg text-white transition hover:scale-105"
              >
                ←
              </Link>

              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#C89B3C]">
                  JCWF 2026
                </p>

                <h1 className="font-display text-xl font-semibold">
                  Check-in List
                </h1>
              </div>
            </div>

            <Link
              href="/admin/scanner"
              className="rounded-full bg-[#17382A] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
            >
              Open Scanner
            </Link>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
          {/* TITLE */}
          <section className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#C89B3C]">
              Attendance
            </p>

            <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
              Welcome to JCWF.
            </h2>

            <p className="mt-3 max-w-2xl text-[#17382A]/65">
              Monitor participants who have
              successfully checked in during
              the festival.
            </p>
          </section>

          {/* STATS */}
          <section className="mb-8 grid gap-4 md:grid-cols-4">
            <StatCard
              label="Total Checked In"
              value={dayCounts.all}
              icon="✓"
            />

            <StatCard
              label="Day 01 · Reconnect"
              value={dayCounts.day1}
              icon="01"
            />

            <StatCard
              label="Day 02 · Experience"
              value={dayCounts.day2}
              icon="02"
            />

            <StatCard
              label="Day 03 · Celebrate"
              value={dayCounts.day3}
              icon="03"
            />
          </section>

          {/* CONTROLS */}
          <section className="mb-6 rounded-[28px] bg-white p-4 shadow-[0_16px_50px_rgba(23,56,42,0.08)] md:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              {/* SEARCH */}
              <div className="relative w-full lg:max-w-md">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#17382A]/40">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search name, Reconnect ID, ticket..."
                  className="h-12 w-full rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8]/60 pl-11 pr-4 text-sm outline-none transition placeholder:text-[#17382A]/35 focus:border-[#C89B3C]"
                />
              </div>

              {/* DAY FILTER */}
              <div className="flex flex-wrap gap-2">
                <FilterButton
                  active={
                    selectedDay === "ALL"
                  }
                  onClick={() =>
                    setSelectedDay("ALL")
                  }
                >
                  All
                </FilterButton>

                {festivalDays.map(
                  (day) => (
                    <FilterButton
                      key={day.date}
                      active={
                        selectedDay ===
                        day.date
                      }
                      onClick={() =>
                        setSelectedDay(
                          day.date
                        )
                      }
                    >
                      {day.label}
                    </FilterButton>
                  )
                )}
              </div>
            </div>
          </section>

          {/* ERROR */}
          {error && (
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
              <span>{error}</span>

              <button
                onClick={loadCheckins}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* TABLE */}
          <section className="overflow-hidden rounded-[30px] bg-white shadow-[0_16px_50px_rgba(23,56,42,0.08)]">
            <div className="flex items-center justify-between border-b border-[#17382A]/8 px-5 py-5 md:px-7">
              <div>
                <h3 className="font-display text-2xl font-semibold">
                  Checked-in Participants
                </h3>

                <p className="mt-1 text-sm text-[#17382A]/50">
                  {loading
                    ? "Loading..."
                    : `${filteredCheckins.length} participant${
                        filteredCheckins.length !==
                        1
                          ? "s"
                          : ""
                      } shown`}
                </p>
              </div>

              <button
                onClick={loadCheckins}
                className="rounded-full border border-[#17382A]/10 px-4 py-2 text-sm font-semibold transition hover:bg-[#F7F3E8]"
              >
                ↻ Refresh
              </button>
            </div>

            {loading ? (
              <LoadingState />
            ) : filteredCheckins.length ===
              0 ? (
              <EmptyState
                hasSearch={
                  Boolean(search) ||
                  selectedDay !== "ALL"
                }
              />
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#17382A]/8 bg-[#F7F3E8]/45 text-left">
                        <th className="px-7 py-4 text-xs font-bold uppercase tracking-wider text-[#17382A]/45">
                          Participant
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#17382A]/45">
                          Day
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#17382A]/45">
                          Ticket
                        </th>

                        <th className="px-5 py-4 text-xs font-bold uppercase tracking-wider text-[#17382A]/45">
                          Check-in
                        </th>

                        <th className="px-7 py-4 text-right text-xs font-bold uppercase tracking-wider text-[#17382A]/45">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCheckins.map(
                        (item) => {
                          const day =
                            getDayInfo(
                              item.eventDate
                            );

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-[#17382A]/6 last:border-0 transition hover:bg-[#F7F3E8]/35"
                            >
                              <td className="px-7 py-5">
                                <div className="flex items-center gap-3">
                                  <Avatar
                                    name={
                                      item.fullName
                                    }
                                  />

                                  <div>
                                    <p className="font-semibold">
                                      {
                                        item.fullName
                                      }
                                    </p>

                                    <p className="mt-0.5 text-xs text-[#17382A]/45">
                                      {
                                        item.reconnectId
                                      }
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-5">
                                <p className="text-sm font-semibold">
                                  {
                                    day?.label
                                  }
                                </p>

                                <p className="text-xs text-[#17382A]/45">
                                  {
                                    day?.title
                                  }
                                </p>
                              </td>

                              <td className="px-5 py-5">
                                <p className="font-mono text-xs font-semibold">
                                  {
                                    item.ticketCode
                                  }
                                </p>

                                <p className="mt-1 text-xs text-[#17382A]/45">
                                  {
                                    item.ticketType
                                  }
                                </p>
                              </td>

                              <td className="px-5 py-5">
                                <p className="text-sm font-semibold">
                                  {formatTime(
                                    item.checkedInAt
                                  )}
                                </p>

                                <p className="text-xs text-[#17382A]/45">
                                  {formatDate(
                                    item.checkedInAt
                                  )}
                                </p>
                              </td>

                              <td className="px-7 py-5 text-right">
                                <StatusBadge />
                              </td>
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="divide-y divide-[#17382A]/6 md:hidden">
                  {filteredCheckins.map(
                    (item) => {
                      const day =
                        getDayInfo(
                          item.eventDate
                        );

                      return (
                        <div
                          key={item.id}
                          className="p-5"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={
                                  item.fullName
                                }
                              />

                              <div>
                                <p className="font-semibold">
                                  {
                                    item.fullName
                                  }
                                </p>

                                <p className="text-xs text-[#17382A]/45">
                                  {
                                    item.reconnectId
                                  }
                                </p>
                              </div>
                            </div>

                            <StatusBadge />
                          </div>

                          <div className="mt-5 grid grid-cols-2 gap-3">
                            <InfoBox
                              label="Festival Day"
                              value={`${day?.label} · ${day?.title}`}
                            />

                            <InfoBox
                              label="Ticket"
                              value={
                                item.ticketCode
                              }
                            />

                            <InfoBox
                              label="Check-in"
                              value={`${formatDate(
                                item.checkedInAt
                              )} · ${formatTime(
                                item.checkedInAt
                              )}`}
                            />

                            <InfoBox
                              label="WhatsApp"
                              value={
                                item.whatsapp
                              }
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-[26px] bg-white p-5 shadow-[0_12px_35px_rgba(23,56,42,0.06)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-[#17382A]/50">
            {label}
          </p>

          <p className="mt-2 font-display text-4xl font-semibold">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DCE9DC] text-sm font-bold text-[#17382A]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-[#17382A] text-white"
          : "bg-[#F7F3E8] text-[#17382A]/60 hover:text-[#17382A]"
      }`}
    >
      {children}
    </button>
  );
}

function Avatar({
  name,
}: {
  name: string;
}) {
  const initial =
    name?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#DCE9DC] font-display text-lg font-semibold text-[#17382A]">
      {initial}
    </div>
  );
}

function StatusBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#DCE9DC] px-3 py-1.5 text-xs font-bold text-[#17382A]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#17382A]" />
      Checked In
    </span>
  );
}

function InfoBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#F7F3E8]/70 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-[#17382A]/40">
        {label}
      </p>

      <p className="mt-1 break-words text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[#17382A]/15 border-t-[#17382A]" />

        <p className="text-sm text-[#17382A]/50">
          Loading check-ins...
        </p>
      </div>
    </div>
  );
}

function EmptyState({
  hasSearch,
}: {
  hasSearch: boolean;
}) {
  return (
    <div className="flex min-h-[300px] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DCE9DC] text-2xl">
          {hasSearch ? "⌕" : "✓"}
        </div>

        <h3 className="font-display text-xl font-semibold">
          {hasSearch
            ? "No participants found"
            : "No check-ins yet"}
        </h3>

        <p className="mt-2 max-w-sm text-sm text-[#17382A]/50">
          {hasSearch
            ? "Try another search or change the festival day filter."
            : "Participants who scan their daily ticket will appear here."}
        </p>
      </div>
    </div>
  );
}