"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Activity = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  price: number;
  capacity: number | null;
  image_url: string | null;
  status: string;
};

const categoryStyles: Record<string, string> = {
  SELF: "bg-[#E8EDE3] text-[#36513D]",
  OTHERS: "bg-[#F1E8DC] text-[#765A3A]",
  NATURE: "bg-[#E2EEE7] text-[#3D6250]",
  CULTURE: "bg-[#F0E5D5] text-[#75563B]",
};

const formatDate = (date: string) => {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
};

const formatPrice = (price: number) => {
  if (price === 0) return "Free";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function MarketplacePage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadActivities = async () => {
      try {
        const response = await fetch("/api/activities", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Gagal mengambil aktivitas."
          );
        }

        setActivities(data.activities ?? []);
      } catch (error) {
        console.error("LOAD ACTIVITIES ERROR:", error);
        setError("Gagal memuat aktivitas.");
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, []);

  return (
    <main className="min-h-screen bg-ivory text-forest">

      {/* =========================
          HEADER
      ========================= */}

      <header className="border-b border-forest/8 bg-ivory">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-14">

          <Link
            href="/"
            className="font-display text-[28px] font-semibold tracking-[-0.04em] text-forest"
          >
            JCWF<span className="text-gold">.</span>
          </Link>

          <Link
            href="/my"
            className="rounded-full border border-forest/10 bg-white/60 px-5 py-2.5 text-xs font-semibold text-forest transition-all duration-300 hover:bg-sage"
          >
            My Plan
          </Link>

        </div>
      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <section className="mx-auto max-w-[1440px] px-6 pb-20 pt-12 md:px-10 md:pb-28 md:pt-16 lg:px-14">

        {/* PAGE INTRO */}

        <div className="flex flex-col gap-7 border-b border-forest/10 pb-10 md:flex-row md:items-end md:justify-between md:gap-12">

          <div className="max-w-3xl">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              JCWF 2026
            </p>

            <h1 className="mt-4 font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              Explore
              <br />
              <span className="text-gold">
                Activities
              </span>
            </h1>

          </div>

          <p className="max-w-md text-sm leading-7 text-forest/55 md:pb-1 md:text-[15px]">
            Discover experiences designed to reconnect you with
            yourself, others, nature, and culture.
          </p>

        </div>

        {/* =========================
            CONTENT STATES
        ========================= */}

        {loading ? (
          <div className="flex min-h-[420px] items-center justify-center">
            <div className="text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-forest/10 border-t-forest" />

              <p className="mt-4 text-sm text-forest/45">
                Loading activities...
              </p>

            </div>
          </div>
        ) : error ? (
          <div className="mt-10 rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center">

            <p className="text-sm text-red-700">
              {error}
            </p>

          </div>
        ) : activities.length === 0 ? (
          <div className="mt-10 rounded-[2rem] bg-sage/50 p-10 text-center">

            <p className="font-display text-3xl text-forest">
              No activities yet
            </p>

            <p className="mt-3 text-sm text-forest/50">
              Check back soon for the latest JCWF experiences.
            </p>

          </div>
        ) : (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">

            {activities.map((activity) => (
              <article
                key={activity.id}
                className="group overflow-hidden rounded-[1.75rem] border border-forest/8 bg-white shadow-[0_8px_30px_rgba(23,56,42,0.05)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_40px_rgba(23,56,42,0.09)]"
              >

                {/* =========================
                    IMAGE
                ========================= */}

                <div className="relative aspect-[4/3] overflow-hidden bg-sage">

                  {activity.image_url ? (
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-sage">

                      <span className="font-display text-4xl text-forest/20">
                        JCWF
                      </span>

                    </div>
                  )}

                  {/* CATEGORY */}

                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] ${
                      categoryStyles[activity.category] ??
                      "bg-ivory text-forest"
                    }`}
                  >
                    {activity.category}
                  </span>

                </div>

                {/* =========================
                    CONTENT
                ========================= */}

                <div className="p-5 md:p-6">

                  {/* DATE */}

                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                    {formatDate(activity.event_date)}
                  </p>

                  {/* TITLE */}

                  <h2 className="mt-2 font-display text-[1.7rem] leading-[0.98] tracking-[-0.035em] text-forest">
                    {activity.title}
                  </h2>

                  {/* DESCRIPTION */}

                  {activity.description && (
                    <p className="mt-3 line-clamp-2 text-xs leading-5 text-forest/50">
                      {activity.description}
                    </p>
                  )}

                  {/* META */}

                  <div className="mt-5 space-y-2 border-t border-forest/8 pt-4">

                    <div className="flex items-center justify-between gap-4">

                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-forest/35">
                        Time
                      </span>

                      <span className="text-xs font-medium text-forest">
                        {activity.start_time.slice(0, 5)}
                        {" — "}
                        {activity.end_time.slice(0, 5)}
                      </span>

                    </div>

                    <div className="flex items-start justify-between gap-4">

                      <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-forest/35">
                        Location
                      </span>

                      <span className="max-w-[65%] text-right text-xs font-medium leading-5 text-forest">
                        {activity.location}
                      </span>

                    </div>

                  </div>

                  {/* FOOTER */}

                  <div className="mt-5 flex items-end justify-between gap-4">

                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-forest/35">
                        Participation
                      </p>

                      <p className="mt-1 text-sm font-semibold text-forest">
                        {formatPrice(activity.price)}
                      </p>
                    </div>

                    <Link
                      href={`/activities/${activity.slug}`}
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-forest px-5 py-2.5 text-xs font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
                    >
                      View Details
                    </Link>

                  </div>

                </div>

              </article>
            ))}

          </div>
        )}

      </section>
    </main>
  );
}