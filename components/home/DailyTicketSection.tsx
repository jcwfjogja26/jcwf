"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Ticket = {
  id: string;
  event_date: string;
  ticket_code: string;
  status: "active" | "used" | "cancelled";
  created_at: string;
};

const festivalDays = [
  {
    date: "2026-11-06",
    day: "DAY 01",
    shortDate: "06 NOV",
    dateLabel: "06 NOVEMBER 2026",
    title: "Reconnect",
  },
  {
    date: "2026-11-07",
    day: "DAY 02",
    shortDate: "07 NOV",
    dateLabel: "07 NOVEMBER 2026",
    title: "Experience",
  },
  {
    date: "2026-11-08",
    day: "DAY 03",
    shortDate: "08 NOV",
    dateLabel: "08 NOVEMBER 2026",
    title: "Celebrate",
  },
];

function ChevronIcon({
  open = false,
}: {
  open?: boolean;
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v3a2 2 0 0 0 0 5v3a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-3a2 2 0 0 0 0-5v-3Z" />
      <path d="M9 8v1M9 12v1M9 16v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export default function DailyTicketSection() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState("");

  const [expandedDate, setExpandedDate] =
    useState<string | null>(null);

  async function loadTickets() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/tickets", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil tiket."
        );
      }

      setTickets(data.tickets ?? []);
    } catch (error) {
      console.error("LOAD TICKETS ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil tiket."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTickets();
  }, []);

  async function getTicket(eventDate: string) {
    try {
      setCreating(eventDate);
      setError("");

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal membuat tiket."
        );
      }

      await loadTickets();
    } catch (error) {
      console.error("CREATE TICKET ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal membuat tiket."
      );
    } finally {
      setCreating(null);
    }
  }

  function getTicketForDate(date: string) {
    return tickets.find(
      (ticket) => ticket.event_date === date
    );
  }

  function toggleDay(date: string) {
    setExpandedDate((current) =>
      current === date ? null : date
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-[28px] bg-forest text-ivory shadow-[0_18px_45px_rgba(23,56,42,0.09)]">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="px-5 pb-4 pt-5 sm:px-6 sm:pt-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-white/10 text-gold">
              <TicketIcon />
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-gold">
                Daily Access
              </p>

              <h2 className="mt-0.5 truncate font-display text-[19px] tracking-[-0.03em] text-ivory">
                Festival Ticket
              </h2>
            </div>
          </div>

          <p className="shrink-0 text-[7px] font-medium uppercase tracking-[0.15em] text-ivory/35">
            06 — 08 NOV
          </p>
        </div>
      </div>

      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="mx-5 mb-4 rounded-[14px] bg-red-300/10 px-3 py-2.5 text-[9px] leading-4 text-red-100 sm:mx-6">
          {error}
        </div>
      )}

      {/* =====================================================
          TICKET DAYS
      ====================================================== */}

      <div className="px-5 pb-5 sm:px-6 sm:pb-6">
        {loading ? (
          <div className="flex gap-2 overflow-hidden">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[112px] min-w-[150px] flex-1 animate-pulse rounded-[20px] bg-white/[0.08]"
              />
            ))}
          </div>
        ) : (
          <>
            {/* =================================================
                HORIZONTAL DAY SELECTOR
            ================================================== */}

            <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {festivalDays.map((day, index) => {
                const ticket = getTicketForDate(
                  day.date
                );

                const isOpen =
                  expandedDate === day.date;

                const isUsed =
                  ticket?.status === "used";

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() =>
                      toggleDay(day.date)
                    }
                    className={`relative min-w-[148px] flex-1 rounded-[20px] p-4 text-left transition-all duration-300 sm:min-w-0 ${
                      isOpen
                        ? "bg-[#F7F5ED] text-forest"
                        : "bg-white/[0.08] text-ivory hover:bg-white/[0.12]"
                    }`}
                  >
                    {/* top row */}

                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[8px] font-bold uppercase tracking-[0.15em] ${
                          isOpen
                            ? "text-gold"
                            : "text-gold/80"
                        }`}
                      >
                        {day.day}
                      </span>

                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${
                          isOpen
                            ? "bg-forest/5 text-forest/55"
                            : "bg-white/10 text-ivory/60"
                        }`}
                      >
                        <ChevronIcon
                          open={isOpen}
                        />
                      </span>
                    </div>

                    {/* date */}

                    <p
                      className={`mt-3 text-[10px] font-medium ${
                        isOpen
                          ? "text-forest/45"
                          : "text-ivory/45"
                      }`}
                    >
                      {day.shortDate}
                    </p>

                    {/* title */}

                    <div className="mt-2 flex items-end justify-between gap-2">
                      <p
                        className={`font-display text-[16px] tracking-[-0.025em] ${
                          isOpen
                            ? "text-forest"
                            : "text-ivory"
                        }`}
                      >
                        {day.title}
                      </p>

                      {ticket && (
                        <span
                          className={`mb-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                            isUsed
                              ? "bg-[#EAD6C8] text-[#9A684E]"
                              : isOpen
                                ? "bg-[#DDE9D9] text-forest"
                                : "bg-white/10 text-gold"
                          }`}
                        >
                          <CheckIcon />
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* =================================================
                EXPANDED DETAIL
            ================================================== */}

            {expandedDate && (
              <div className="mt-2.5 overflow-hidden rounded-[20px] bg-[#F7F5ED] text-forest">
                {festivalDays
                  .filter(
                    (day) =>
                      day.date === expandedDate
                  )
                  .map((day) => {
                    const ticket =
                      getTicketForDate(day.date);

                    const isCreating =
                      creating === day.date;

                    const isUsed =
                      ticket?.status === "used";

                    const isCancelled =
                      ticket?.status ===
                      "cancelled";

                    return (
                      <div
                        key={day.date}
                        className="p-5 sm:p-6"
                      >
                        {/* detail header */}

                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-[8px] font-bold uppercase tracking-[0.17em] text-gold">
                              {day.day}
                            </p>

                            <p className="mt-1.5 text-[9px] font-medium uppercase tracking-[0.08em] text-forest/35">
                              {day.dateLabel}
                            </p>
                          </div>

                          {ticket && (
                            <span
                              className={`rounded-full px-2.5 py-1 text-[7px] font-semibold uppercase tracking-[0.08em] ${
                                isUsed
                                  ? "bg-[#EAD6C8] text-[#8D5D45]"
                                  : isCancelled
                                    ? "bg-red-50 text-red-500"
                                    : "bg-[#DDE9D9] text-forest"
                              }`}
                            >
                              {isUsed
                                ? "Used"
                                : isCancelled
                                  ? "Cancelled"
                                  : "Ready"}
                            </span>
                          )}
                        </div>

                        {/* title */}

                        <div className="mt-5 flex items-end justify-between gap-5">
                          <div>
                            <h3 className="font-display text-[25px] tracking-[-0.045em] text-forest">
                              {day.title}
                            </h3>

                            {ticket ? (
                              <p className="mt-2 text-[10px] text-forest/45">
                                Access code ·{" "}
                                <span className="font-medium text-forest/70">
                                  {
                                    ticket.ticket_code
                                  }
                                </span>
                              </p>
                            ) : (
                              <p className="mt-2 max-w-[280px] text-[10px] leading-5 text-forest/40">
                                Your daily festival
                                access is ready
                                to claim.
                              </p>
                            )}
                          </div>

                          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-forest/[0.05] text-forest/35 sm:flex">
                            <TicketIcon />
                          </div>
                        </div>

                        {/* action */}

                        {ticket ? (
                          <Link
                            href={`/my/ticket/${ticket.id}`}
                            className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-forest text-[10px] font-semibold text-ivory transition hover:bg-gold hover:text-forest"
                          >
                            View Ticket
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              getTicket(day.date)
                            }
                            disabled={
                              creating !== null
                            }
                            className="mt-5 flex h-11 w-full items-center justify-center rounded-full bg-forest text-[10px] font-semibold text-ivory transition hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isCreating
                              ? "Creating..."
                              : "Get Ticket"}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}