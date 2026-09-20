import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";
import PassportQRCode from "@/components/home/PassportQRCode";

const festivalDays = {
  "2026-11-06": {
    day: "DAY 01",
    dateLabel: "06 NOVEMBER 2026",
    title: "Reconnect",
    description:
      "Your festival access for the first day of JCWF 2026.",
  },
  "2026-11-07": {
    day: "DAY 02",
    dateLabel: "07 NOVEMBER 2026",
    title: "Experience",
    description:
      "Your festival access for the second day of JCWF 2026.",
  },
  "2026-11-08": {
    day: "DAY 03",
    dateLabel: "08 NOVEMBER 2026",
    title: "Celebrate",
    description:
      "Your festival access for the final day of JCWF 2026.",
  },
} as const;

type TicketPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TicketPage({
  params,
}: TicketPageProps) {
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect("/login");
  }

  const { id } = await params;

  const { data: ticket, error } =
    await supabaseServer
      .from("daily_tickets")
      .select(
        "id, participant_id, event_date, ticket_code, status, created_at"
      )
      .eq("id", id)
      .eq("participant_id", participant.id)
      .maybeSingle();

  if (error) {
    console.error(
      "GET DAILY TICKET ERROR:",
      error
    );

    notFound();
  }

  if (!ticket) {
    notFound();
  }

  const eventDate =
    festivalDays[
      ticket.event_date as keyof typeof festivalDays
    ];

  if (!eventDate) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-ivory">
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="border-b border-forest/5 bg-ivory">
        <div className="mx-auto flex h-[76px] max-w-[900px] items-center justify-between px-6">
          <Link
            href="/my"
            className="font-display text-[28px] font-semibold tracking-[-0.04em] text-forest"
          >
            JCWF
            <span className="text-gold">.</span>
          </Link>

          <Link
            href="/my"
            className="rounded-full bg-forest/5 px-4 py-2 text-xs font-semibold text-forest transition hover:bg-forest/10"
          >
            ← My JCWF
          </Link>
        </div>
      </header>

      {/* =====================================================
          TICKET
      ====================================================== */}
      <div className="mx-auto max-w-[900px] px-6 py-10 md:py-16">
        {/* INTRO */}
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold">
            Your Festival Access
          </p>

          <h1 className="mt-3 font-display text-4xl tracking-[-0.04em] text-forest sm:text-5xl">
            {eventDate.day}
          </h1>

          <p className="mt-2 text-sm font-medium tracking-[0.12em] text-forest/45">
            {eventDate.dateLabel}
          </p>
        </div>

        {/* TICKET CARD */}
        <section className="relative mt-10 overflow-hidden rounded-[2rem] bg-forest shadow-[0_25px_70px_rgba(23,56,42,0.16)]">
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full border border-gold/15" />

          <div className="pointer-events-none absolute -left-24 bottom-[-180px] h-80 w-80 rounded-full border border-ivory/5" />

          <div className="relative z-10 p-7 sm:p-10 md:p-12">
            {/* HEADER */}
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold">
                  JCWF 2026
                </p>

                <h2 className="mt-3 font-display text-3xl text-ivory sm:text-4xl">
                  {eventDate.title}
                </h2>

                <p className="mt-2 max-w-md text-sm leading-6 text-ivory/50">
                  {eventDate.description}
                </p>
              </div>

              <span className="rounded-full bg-ivory/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ivory/70">
                ACTIVE
              </span>
            </div>

            {/* DIVIDER */}
            <div className="my-8 border-t border-dashed border-ivory/15" />

            {/* QR AREA */}
            <div className="flex flex-col items-center justify-center">
              <div className="rounded-[2rem] bg-ivory p-4">
                <PassportQRCode
                  value={ticket.ticket_code}
                />
              </div>

              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.2em] text-ivory/35">
                Ticket Access Code
              </p>

              <p className="mt-2 font-display text-2xl tracking-[0.08em] text-gold">
                {ticket.ticket_code}
              </p>
            </div>

            {/* DIVIDER */}
            <div className="my-8 border-t border-dashed border-ivory/15" />

            {/* PARTICIPANT */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ivory/35">
                  Name
                </p>

                <p className="mt-2 text-sm font-semibold text-ivory">
                  {participant.full_name}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ivory/35">
                  Reconnect ID
                </p>

                <p className="mt-2 text-sm font-semibold text-ivory">
                  {participant.reconnect_id}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ivory/35">
                  Venue
                </p>

                <p className="mt-2 text-sm font-semibold text-ivory">
                  Loman Park Hotel Yogyakarta
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ivory/35">
                  Valid
                </p>

                <p className="mt-2 text-sm font-semibold text-ivory">
                  {eventDate.dateLabel}
                </p>
              </div>
            </div>
          </div>

          {/* TICKET EDGE */}
          <div className="pointer-events-none absolute left-0 top-1/2 h-8 w-4 -translate-y-1/2 rounded-r-full bg-ivory" />

          <div className="pointer-events-none absolute right-0 top-1/2 h-8 w-4 -translate-y-1/2 rounded-l-full bg-ivory" />
        </section>

        {/* NOTE */}
        <div className="mt-6 rounded-2xl bg-white p-5 text-center shadow-[0_12px_35px_rgba(23,56,42,0.05)]">
          <p className="text-xs leading-5 text-forest/50">
            Show this QR code at the festival entrance
            on <span className="font-semibold text-forest">
              {eventDate.dateLabel}
            </span>
            .
          </p>
        </div>

        {/* BACK */}
        <div className="mt-6 flex justify-center">
          <Link
            href="/my"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition hover:bg-gold hover:text-forest"
          >
            Back to My JCWF
            <span>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}