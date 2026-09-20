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
    dateLabel: "06 NOVEMBER 2026",
    title: "Reconnect",
  },
  {
    date: "2026-11-07",
    day: "DAY 02",
    dateLabel: "07 NOVEMBER 2026",
    title: "Experience",
  },
  {
    date: "2026-11-08",
    day: "DAY 03",
    dateLabel: "08 NOVEMBER 2026",
    title: "Celebrate",
  },
];

export default function DailyTicketSection() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadTickets() {
    try {
      setLoading(true);

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

  return (
    <section className="mt-8 rounded-[32px] bg-forest p-6 text-ivory shadow-[0_18px_50px_rgba(23,56,42,0.12)] sm:p-8 lg:p-10">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            Festival Access
          </p>

          <h2 className="mt-2 font-display text-3xl leading-tight sm:text-4xl">
            Get Your Ticket Access
          </h2>

          <p className="mt-3 max-w-xl text-sm leading-6 text-ivory/65">
            Choose the festival day you want to attend
            and get your digital access ticket.
          </p>
        </div>

        <div className="hidden rounded-full bg-white/10 px-4 py-2 text-xs font-medium text-ivory/70 sm:block">
          06 — 08 NOV 2026
        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="mt-6 rounded-2xl bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* DAYS */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {festivalDays.map((day) => {
          const ticket = getTicketForDate(day.date);
          const isCreating = creating === day.date;

          return (
            <div
              key={day.date}
              className="group rounded-[24px] bg-white p-5 text-forest transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_35px_rgba(0,0,0,0.12)]"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.16em] text-gold">
                    {day.day}
                  </p>

                  <p className="mt-1 text-xs font-medium text-forest/45">
                    {day.dateLabel}
                  </p>
                </div>

                {ticket && (
                  <span className="rounded-full bg-sage px-3 py-1 text-[10px] font-semibold text-forest">
                    READY
                  </span>
                )}
              </div>

              <h3 className="mt-7 font-display text-2xl">
                {day.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-forest/50">
                {ticket
                  ? `Your access code: ${ticket.ticket_code}`
                  : "Your daily festival access ticket is ready to claim."}
              </p>

              {ticket ? (
                <Link
                  href={`/my/ticket/${ticket.id}`}
                  className="mt-6 flex w-full items-center justify-between rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-gold hover:text-forest"
                >
                  <span>View Ticket</span>
                  <span>→</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => getTicket(day.date)}
                  disabled={creating !== null}
                  className="mt-6 flex w-full items-center justify-between rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>
                    {isCreating
                      ? "Creating..."
                      : "Get Ticket"}
                  </span>

                  <span>→</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}