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
        const response = await fetch("/api/activities");

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
    <main className="min-h-screen bg-[#F8F5ED] px-5 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#A17A3D]">
              JCWF 2026
            </p>

            <h1 className="font-serif text-4xl text-[#17382A] sm:text-5xl">
              Explore Activities
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#5D665F] sm:text-base">
              Discover experiences designed to reconnect you with
              yourself, others, nature, and culture.
            </p>
          </div>

          <Link
            href="/my"
            className="w-fit rounded-full border border-[#17382A]/15 bg-white px-5 py-2.5 text-sm font-semibold text-[#17382A] transition hover:bg-[#17382A] hover:text-white"
          >
            My Plan
          </Link>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="rounded-3xl border border-[#17382A]/10 bg-white p-10 text-center">
            <p className="text-sm text-[#6B736D]">
              Loading activities...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-10 text-center">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="rounded-3xl border border-[#17382A]/10 bg-white p-10 text-center">
            <p className="font-serif text-2xl text-[#17382A]">
              No activities yet
            </p>

            <p className="mt-2 text-sm text-[#6B736D]">
              Check back soon for the latest JCWF experiences.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {activities.map((activity) => (
              <article
                key={activity.id}
                className="group overflow-hidden rounded-[28px] border border-[#17382A]/10 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                {/* IMAGE */}
                <div className="relative aspect-[4/3] overflow-hidden bg-[#E7E4DA]">
                  {activity.image_url ? (
                    <img
                      src={activity.image_url}
                      alt={activity.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-[#DCE5D9]">
                      <span className="font-serif text-4xl text-[#17382A]/30">
                        JCWF
                      </span>
                    </div>
                  )}

                  <span
                    className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold ${
                      categoryStyles[activity.category] ??
                      "bg-white text-[#17382A]"
                    }`}
                  >
                    {activity.category}
                  </span>
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#A17A3D]">
                      {formatDate(activity.event_date)}
                    </p>

                    <h2 className="mt-2 font-serif text-2xl leading-tight text-[#17382A]">
                      {activity.title}
                    </h2>
                  </div>

                  <p className="line-clamp-2 text-sm leading-6 text-[#667069]">
                    {activity.description}
                  </p>

                  <div className="mt-5 space-y-2 text-sm text-[#5D665F]">
                    <p>
                      🕐 {activity.start_time.slice(0, 5)} –{" "}
                      {activity.end_time.slice(0, 5)}
                    </p>

                    <p>📍 {activity.location}</p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-[#17382A]/10 pt-5">
                    <div>
                      <p className="text-xs text-[#7A827C]">
                        Participation
                      </p>

                      <p className="mt-1 text-base font-semibold text-[#17382A]">
                        {formatPrice(activity.price)}
                      </p>
                    </div>

                    <Link
                    href={`/activities/${activity.slug}`}
                    className="rounded-full bg-[#17382A] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#28513F]"
                    >
                    View Details
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}