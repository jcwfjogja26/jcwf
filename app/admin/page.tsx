"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

type Stats = {
  totalParticipants: number;
  totalTickets: number;
  totalCheckins: number;
  checkinRate: number;
  days: {
    day1: number;
    day2: number;
    day3: number;
  };
};

type Checkin = {
  id: string;
  eventDate: string;
  checkedInAt: string;
  ticketCode: string;
  ticketType: string;
  fullName: string;
  reconnectId: string;
};

const festivalDays = [
  {
    number: "01",
    date: "2026-11-06",
    shortDate: "06 NOV",
    title: "Reconnect",
  },
  {
    number: "02",
    date: "2026-11-07",
    shortDate: "07 NOV",
    title: "Experience",
  },
  {
    number: "03",
    date: "2026-11-08",
    shortDate: "08 NOV",
    title: "Celebrate",
  },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalParticipants: 0,
    totalTickets: 0,
    totalCheckins: 0,
    checkinRate: 0,
    days: {
      day1: 0,
      day2: 0,
      day3: 0,
    },
  });

  const [recentCheckins, setRecentCheckins] =
    useState<Checkin[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadDashboard = useCallback(
    async () => {
      try {
        setError("");

        const [
          statsResponse,
          checkinsResponse,
        ] = await Promise.all([
          fetch("/api/admin/stats", {
            cache: "no-store",
          }),

          fetch("/api/admin/checkins", {
            cache: "no-store",
          }),
        ]);

        const statsData =
          await statsResponse.json();

        const checkinsData =
          await checkinsResponse.json();

        if (!statsResponse.ok) {
          throw new Error(
            statsData.message ||
              "Gagal mengambil statistik."
          );
        }

        if (!checkinsResponse.ok) {
          throw new Error(
            checkinsData.message ||
              "Gagal mengambil data check-in."
          );
        }

        setStats(
          statsData.stats ?? {
            totalParticipants: 0,
            totalTickets: 0,
            totalCheckins: 0,
            checkinRate: 0,
            days: {
              day1: 0,
              day2: 0,
              day3: 0,
            },
          }
        );

        setRecentCheckins(
          (checkinsData.checkins ?? []).slice(
            0,
            5
          )
        );
      } catch (error) {
        console.error(
          "LOAD DASHBOARD ERROR:",
          error
        );

        setError(
          "Gagal memuat dashboard."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();

    const interval = setInterval(
      loadDashboard,
      15000
    );

    return () =>
      clearInterval(interval);
  }, [loadDashboard]);

  const remaining = Math.max(
    stats.totalParticipants -
      stats.totalCheckins,
    0
  );

  const progress = Math.min(
    stats.checkinRate,
    100
  );

  const totalDayCheckins =
    stats.days.day1 +
    stats.days.day2 +
    stats.days.day3;

  const mostActiveDay = useMemo(() => {
    const days = [
      {
        title: "Day 01",
        name: "Reconnect",
        count: stats.days.day1,
      },
      {
        title: "Day 02",
        name: "Experience",
        count: stats.days.day2,
      },
      {
        title: "Day 03",
        name: "Celebrate",
        count: stats.days.day3,
      },
    ];

    return days.reduce(
      (current, day) =>
        day.count > current.count
          ? day
          : current,
      days[0]
    );
  }, [stats.days]);

  function getDayInfo(date: string) {
    return festivalDays.find(
      (day) => day.date === date
    );
  }

  function formatTime(
    dateString: string
  ) {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    ).format(new Date(dateString));
  }

  function formatDate(
    dateString: string
  ) {
    return new Intl.DateTimeFormat(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
      }
    ).format(new Date(dateString));
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
        {/* =========================
            HEADER
        ========================= */}

        <header className="sticky top-0 z-40 border-b border-[#17382A]/10 bg-[#F7F3E8]/95 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#C89B3C]">
                JCWF 2026
              </p>

              <h1 className="font-display text-xl font-semibold">
                Admin Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadDashboard}
                className="hidden rounded-full border border-[#17382A]/10 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-[#DCE9DC] sm:block"
              >
                ↻ Refresh
              </button>

              <button
                type="button"
                onClick={async () => {
                  await fetch(
                    "/api/admin/logout",
                    {
                      method: "POST",
                    }
                  );

                  window.location.href =
                    "/admin/login";
                }}
                className="rounded-full border border-[#17382A]/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#17382A] transition hover:bg-[#17382A] hover:text-white"
              >
                Logout
              </button>

              <Link
                href="/admin/scanner"
                className="rounded-full bg-[#17382A] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Open Scanner
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-12">
          {/* =========================
              WELCOME
          ========================= */}

          <section className="mb-8">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                  Festival Control
                </p>

                <h2 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                  Welcome, Admin.
                </h2>

                <p className="mt-3 max-w-2xl text-[#17382A]/60">
                  Manage participant attendance,
                  daily access, and festival
                  check-ins from one place.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start rounded-full bg-[#DCE9DC] px-4 py-2.5 text-xs font-bold text-[#17382A] md:self-auto">
                <span className="h-2 w-2 rounded-full bg-[#17382A]" />
                System Connected
              </div>
            </div>
          </section>

          {/* =========================
              ERROR
          ========================= */}

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700">
              <span>{error}</span>

              <button
                onClick={loadDashboard}
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* =========================
              MAIN STATS
          ========================= */}

          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Participants"
              value={
                loading
                  ? "—"
                  : stats.totalParticipants
              }
              description="Registered accounts"
              icon="◎"
            />

            <StatCard
              label="Daily Tickets"
              value={
                loading
                  ? "—"
                  : stats.totalTickets
              }
              description="Festival access"
              icon="◇"
            />

            <StatCard
              label="Total Check-ins"
              value={
                loading
                  ? "—"
                  : stats.totalCheckins
              }
              description="Successful arrivals"
              icon="✓"
            />

            <StatCard
              label="Check-in Rate"
              value={
                loading
                  ? "—"
                  : `${progress}%`
              }
              description="Attendance progress"
              icon="%"
            />
          </section>

          {/* =========================
              ATTENDANCE OVERVIEW
          ========================= */}

          <section className="mb-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
            {/* PROGRESS CARD */}

            <div className="rounded-[32px] bg-[#17382A] p-7 text-white shadow-[0_20px_70px_rgba(23,56,42,0.15)] md:p-9">
              <div className="flex flex-col gap-8 md:flex-row md:items-center">
                <div className="relative h-44 w-44 shrink-0 self-center md:self-auto">
                  <svg
                    className="h-full w-full -rotate-90"
                    viewBox="0 0 120 120"
                  >
                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="rgba(255,255,255,0.10)"
                      strokeWidth="9"
                    />

                    <circle
                      cx="60"
                      cy="60"
                      r="50"
                      fill="none"
                      stroke="#D9A441"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeDasharray="314"
                      strokeDashoffset={
                        314 -
                        (314 * progress) /
                          100
                      }
                      className="transition-all duration-700"
                    />
                  </svg>

                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-display text-4xl font-semibold">
                      {loading
                        ? "—"
                        : `${progress}%`}
                    </span>

                    <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/45">
                      Check-in Rate
                    </span>
                  </div>
                </div>

                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#D9A441]">
                    Attendance Overview
                  </p>

                  <h3 className="mt-2 font-display text-3xl font-semibold md:text-4xl">
                    {loading
                      ? "Loading attendance..."
                      : `${stats.totalCheckins} people have arrived.`}
                  </h3>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                    {remaining > 0
                      ? `${remaining} registered participant${
                          remaining !== 1
                            ? "s"
                            : ""
                        } have not checked in yet.`
                      : "All registered participants have checked in."}
                  </p>

                  <div className="mt-7 h-3 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#D9A441] transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/35">
                    <span>
                      {stats.totalCheckins} checked in
                    </span>

                    <span>
                      {stats.totalParticipants} registered
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}

            <div className="rounded-[32px] bg-white p-6 shadow-[0_16px_50px_rgba(23,56,42,0.08)]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                Quick Actions
              </p>

              <h3 className="mt-2 font-display text-2xl font-semibold">
                Manage Festival
              </h3>

              <div className="mt-6 space-y-3">
                <QuickAction
                  href="/admin/scanner"
                  icon="⌗"
                  title="Open Scanner"
                  description="Scan daily tickets"
                  primary
                />

                <QuickAction
                  href="/admin/checkins"
                  icon="✓"
                  title="Check-in List"
                  description="View attendance"
                />

                <QuickAction
                    href="/admin/activities"
                    icon="◈"
                    title="Activity Bookings"
                    description="Review bookings & payments"
                />

                <QuickAction
                href="/admin/communities"
                icon="◎"
                title="Communities"
                description="Manage communities & members"
                />

                <QuickAction
                href="/admin/marketplace"
                icon="◇"
                title="Marketplace"
                description="Manage products & vendors"
                />

              </div>
            </div>
          </section>

          {/* =========================
              FESTIVAL DAYS
          ========================= */}

          <section className="mb-8">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                  Festival Overview
                </p>

                <h3 className="mt-2 font-display text-3xl font-semibold">
                  Attendance by Day
                </h3>
              </div>

              <p className="hidden text-sm text-[#17382A]/40 sm:block">
                {totalDayCheckins} total daily
                check-ins
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <DayCard
                number="01"
                date="06 NOV"
                title="Reconnect"
                count={stats.days.day1}
                total={stats.totalParticipants}
              />

              <DayCard
                number="02"
                date="07 NOV"
                title="Experience"
                count={stats.days.day2}
                total={stats.totalParticipants}
              />

              <DayCard
                number="03"
                date="08 NOV"
                title="Celebrate"
                count={stats.days.day3}
                total={stats.totalParticipants}
              />
            </div>
          </section>

          {/* =========================
              INSIGHT
          ========================= */}

          <section className="mb-8 rounded-[30px] bg-[#DCE9DC] p-6 md:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#17382A]/45">
                  Festival Insight
                </p>

                <h3 className="mt-2 font-display text-2xl font-semibold">
                  {loading
                    ? "Loading..."
                    : `${mostActiveDay.title} · ${mostActiveDay.name}`}
                </h3>

                <p className="mt-1 text-sm text-[#17382A]/55">
                  {loading
                    ? "Calculating attendance."
                    : `${mostActiveDay.count} check-in${
                        mostActiveDay.count !== 1
                          ? "s"
                          : ""
                      } recorded on this day.`}
                </p>
              </div>

              <div className="rounded-2xl bg-white/60 px-5 py-4 text-center">
                <p className="font-display text-3xl font-semibold">
                  {loading
                    ? "—"
                    : mostActiveDay.count}
                </p>

                <p className="text-[9px] font-bold uppercase tracking-wider text-[#17382A]/40">
                  Daily Check-ins
                </p>
              </div>
            </div>
          </section>

          {/* =========================
              RECENT CHECKINS
          ========================= */}

          <section className="overflow-hidden rounded-[32px] bg-white shadow-[0_16px_50px_rgba(23,56,42,0.08)]">
            <div className="flex items-center justify-between border-b border-[#17382A]/8 px-6 py-5 md:px-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                  Live Activity
                </p>

                <h3 className="mt-1 font-display text-2xl font-semibold">
                  Recent Check-ins
                </h3>
              </div>

              <Link
                href="/admin/checkins"
                className="text-sm font-semibold text-[#17382A] transition hover:text-[#C89B3C]"
              >
                View All →
              </Link>
            </div>

            {loading ? (
              <LoadingState />
            ) : recentCheckins.length === 0 ? (
              <EmptyRecentState />
            ) : (
              <>
                {/* DESKTOP */}

                <div className="hidden md:block">
                  {recentCheckins.map(
                    (item) => {
                      const day =
                        getDayInfo(
                          item.eventDate
                        );

                      return (
                        <div
                          key={item.id}
                          className="flex items-center justify-between border-b border-[#17382A]/6 px-7 py-5 last:border-0"
                        >
                          <div className="flex items-center gap-4">
                            <Avatar
                              name={
                                item.fullName
                              }
                            />

                            <div>
                              <p className="font-semibold">
                                {item.fullName}
                              </p>

                              <p className="mt-0.5 text-xs text-[#17382A]/40">
                                {
                                  item.reconnectId
                                }
                              </p>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm font-semibold">
                              {day?.number
                                ? `Day ${day.number}`
                                : "-"}
                            </p>

                            <p className="text-xs text-[#17382A]/40">
                              {day?.title}
                            </p>
                          </div>

                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {formatTime(
                                item.checkedInAt
                              )}
                            </p>

                            <p className="text-xs text-[#17382A]/40">
                              {formatDate(
                                item.checkedInAt
                              )}
                            </p>
                          </div>

                          <span className="rounded-full bg-[#DCE9DC] px-3 py-1.5 text-xs font-bold">
                            Checked In
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>

                {/* MOBILE */}

                <div className="divide-y divide-[#17382A]/6 md:hidden">
                  {recentCheckins.map(
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
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <Avatar
                                name={
                                  item.fullName
                                }
                              />

                              <div>
                                <p className="font-semibold">
                                  {item.fullName}
                                </p>

                                <p className="text-xs text-[#17382A]/40">
                                  {
                                    item.reconnectId
                                  }
                                </p>
                              </div>
                            </div>

                            <span className="rounded-full bg-[#DCE9DC] px-2.5 py-1 text-[10px] font-bold">
                              Checked In
                            </span>
                          </div>

                          <div className="mt-4 flex items-center justify-between rounded-2xl bg-[#F7F3E8] p-3">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#17382A]/35">
                                Festival Day
                              </p>

                              <p className="mt-1 text-xs font-semibold">
                                {day?.number
                                  ? `Day ${day.number} · ${day.title}`
                                  : "-"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-[10px] font-bold uppercase tracking-wider text-[#17382A]/35">
                                Time
                              </p>

                              <p className="mt-1 text-xs font-semibold">
                                {formatTime(
                                  item.checkedInAt
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </>
            )}
          </section>

          {/* =========================
              FOOTER NOTE
          ========================= */}

          <div className="mt-8 flex flex-col items-center justify-between gap-3 text-center text-xs text-[#17382A]/35 sm:flex-row sm:text-left">
            <p>
              JCWF 2026 · Reconnecting —
              People, Culture & Wellbeing
            </p>

            <p>
              Data refreshes automatically
              every 15 seconds.
            </p>
          </div>
        </div>
      </main>
    </AdminShell>
  );
}

/* =========================
   COMPONENTS
========================= */

function StatCard({
  label,
  value,
  description,
  icon,
}: {
  label: string;
  value: number | string;
  description: string;
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

          <p className="mt-1 text-xs text-[#17382A]/35">
            {description}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#DCE9DC] text-sm font-bold">
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  title,
  description,
  primary = false,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 rounded-2xl p-4 transition ${
        primary
          ? "bg-[#17382A] text-white hover:-translate-y-0.5"
          : "bg-[#F7F3E8] hover:bg-[#DCE9DC]"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${
          primary
            ? "bg-white/10 text-[#D9A441]"
            : "bg-white text-[#17382A]"
        }`}
      >
        {icon}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">
          {title}
        </p>

        <p
          className={`mt-0.5 text-xs ${
            primary
              ? "text-white/45"
              : "text-[#17382A]/40"
          }`}
        >
          {description}
        </p>
      </div>

      <span
        className={`text-lg transition group-hover:translate-x-1 ${
          primary
            ? "text-white/40"
            : "text-[#17382A]/30"
        }`}
      >
        →
      </span>
    </Link>
  );
}

function DayCard({
  number,
  date,
  title,
  count,
  total,
}: {
  number: string;
  date: string;
  title: string;
  count: number;
  total: number;
}) {
  const percentage =
    total > 0
      ? Math.round(
          (count / total) * 100
        )
      : 0;

  return (
    <div className="rounded-[28px] bg-white p-6 shadow-[0_12px_35px_rgba(23,56,42,0.06)]">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#17382A] font-display text-sm font-semibold text-white">
            {number}
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#17382A]/35">
              {date}
            </p>

            <h4 className="font-display text-xl font-semibold">
              {title}
            </h4>
          </div>
        </div>

        <div className="text-right">
          <p className="font-display text-3xl font-semibold">
            {count}
          </p>

          <p className="text-[9px] font-bold uppercase tracking-wider text-[#17382A]/35">
            check-ins
          </p>
        </div>
      </div>

      <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#DCE9DC]">
        <div
          className="h-full rounded-full bg-[#17382A] transition-all duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="mt-2 flex justify-between text-[10px] font-semibold text-[#17382A]/35">
        <span>
          {percentage}% of registered
        </span>

        <span>
          {total} total
        </span>
      </div>
    </div>
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

function LoadingState() {
  return (
    <div className="flex min-h-[250px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#17382A]/10 border-t-[#17382A]" />

        <p className="text-sm text-[#17382A]/45">
          Loading activity...
        </p>
      </div>
    </div>
  );
}

function EmptyRecentState() {
  return (
    <div className="flex min-h-[250px] items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#DCE9DC] text-xl">
          ✓
        </div>

        <h4 className="font-display text-xl font-semibold">
          No check-ins yet
        </h4>

        <p className="mt-2 max-w-sm text-sm text-[#17382A]/45">
          Participants who successfully
          scan their daily tickets will
          appear here.
        </p>
      </div>
    </div>
  );
}