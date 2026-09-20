"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

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

const fallbackImages: Record<string, string> = {
  "morning-reset": "/images/activity-wellness.jpg",
  "living-heritage": "/images/activity-culture.jpg",
  "circle-of-stories": "/images/activity-community.jpg",
  "taste-of-jogja": "/images/activity-culinary.jpg",
};

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatTime(time: string) {
  return time.slice(0, 5).replace(":", ".");
}

function formatPrice(price: number) {
  if (price === 0) {
    return "Gratis";
  }

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;

  const [activity, setActivity] =
    useState<Activity | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [booking, setBooking] =
    useState(false);

  const [quantity, setQuantity] =
    useState(1);

  const [errorMessage, setErrorMessage] =
    useState("");

  // =========================
  // FETCH ACTIVITY
  // =========================

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch(
          "/api/activities",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Gagal mengambil data activity."
          );
        }

        const foundActivity =
          data.activities?.find(
            (item: Activity) =>
              item.slug === slug
          );

        if (!foundActivity) {
          setErrorMessage(
            "Activity tidak ditemukan."
          );
          return;
        }

        setActivity(foundActivity);
      } catch (error) {
        console.error(
          "FETCH ACTIVITY DETAIL ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data activity."
        );
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchActivity();
    }
  }, [slug]);

  // =========================
  // BOOK ACTIVITY
  // =========================

  async function handleBooking() {
    if (!activity) return;

    try {
      setBooking(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/activities/book",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activityId: activity.id,
            quantity,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push(
            `/login?redirect=${encodeURIComponent(
              `/activities/${activity.slug}`
            )}`
          );

          return;
        }

        throw new Error(
          data.message ||
            "Gagal membuat booking."
        );
      }

      router.push(
        `/activities/${activity.slug}/checkout?booking=${data.booking.id}`
      );
    } catch (error) {
      console.error(
        "BOOK ACTIVITY ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal membuat booking."
      );
    } finally {
      setBooking(false);
    }
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-forest/15 border-t-forest" />
            <p className="mt-4 text-sm text-forest/45">
              Loading activity...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =========================
  // NOT FOUND
  // =========================

  if (!activity) {
    return (
      <main className="min-h-screen bg-ivory">
        <header className="flex items-center justify-between px-6 py-6 md:px-10 lg:px-14">
          <Link
            href="/"
            className="font-display text-[28px] font-semibold tracking-[-0.04em] text-forest"
          >
            JCWF<span className="text-gold">.</span>
          </Link>

          <Link
            href="/activities"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest/60 transition-colors hover:text-forest"
          >
            <span aria-hidden="true">←</span>
            Back
          </Link>
        </header>

        <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Activity
          </p>

          <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-forest md:text-5xl">
            Activity tidak ditemukan
          </h1>

          <p className="mt-4 max-w-md text-sm leading-6 text-forest/50">
            {errorMessage ||
              "Activity yang kamu cari tidak tersedia."}
          </p>

          <Link
            href="/activities"
            className="mt-8 inline-flex items-center rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
          >
            Kembali ke Activities
          </Link>
        </div>
      </main>
    );
  }

  const image =
    activity.image_url ||
    fallbackImages[activity.slug] ||
    "/images/activity-wellness.jpg";

  const totalPrice =
    activity.price * quantity;

  return (
    <main className="min-h-screen bg-ivory text-forest">

      {/* =========================
          HEADER
      ========================= */}

      <header className="border-b border-forest/8 bg-ivory">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-14">

          <Link
            href="/activities"
            className="inline-flex items-center gap-2 text-sm font-medium text-forest/55 transition-colors hover:text-forest"
          >
            <span
              aria-hidden="true"
              className="text-base"
            >
              ←
            </span>

            <span>Back</span>
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
          HERO
      ========================= */}

      <section className="mx-auto max-w-[1440px] px-6 pb-20 pt-8 md:px-10 md:pb-28 md:pt-12 lg:px-14">

        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 xl:gap-20">

          {/* =========================
              IMAGE
          ========================= */}

          <div className="relative overflow-hidden rounded-[2rem] bg-sage md:rounded-[2.5rem]">

            <div className="aspect-[4/3] w-full md:aspect-[1.08/1] lg:aspect-[1/1.03]">
              <img
                src={image}
                alt={activity.title}
                className="h-full w-full object-cover"
              />
            </div>

            {/* IMAGE CATEGORY */}
            <div className="absolute left-5 top-5 md:left-7 md:top-7">
              <span className="rounded-full bg-ivory/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-forest shadow-[0_6px_20px_rgba(23,56,42,0.08)] backdrop-blur-md">
                {activity.category}
              </span>
            </div>
          </div>

          {/* =========================
              INFORMATION
          ========================= */}

          <div className="flex flex-col justify-center lg:py-8">

            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              JCWF Activity
            </p>

            <h1 className="mt-4 max-w-xl font-display text-[clamp(2.8rem,5vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {activity.title}
            </h1>

            {activity.description && (
              <p className="mt-6 max-w-xl text-sm leading-7 text-forest/55 md:text-[15px]">
                {activity.description}
              </p>
            )}

            {/* =========================
                DETAILS
            ========================= */}

            <div className="mt-8 border-y border-forest/10">

              {/* DATE */}
              <div className="flex items-start justify-between gap-6 border-b border-forest/10 py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/35">
                    Date
                  </p>

                  <p className="mt-1.5 text-sm font-medium text-forest">
                    {formatDate(
                      activity.event_date
                    )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/35">
                    Time
                  </p>

                  <p className="mt-1.5 text-sm font-medium text-forest">
                    {formatTime(
                      activity.start_time
                    )}{" "}
                    —{" "}
                    {formatTime(
                      activity.end_time
                    )}
                  </p>
                </div>
              </div>

              {/* LOCATION */}
              <div className="flex items-start justify-between gap-6 py-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/35">
                    Location
                  </p>

                  <p className="mt-1.5 max-w-sm text-sm font-medium leading-5 text-forest">
                    {activity.location}
                  </p>
                </div>

                <div className="shrink-0 text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/35">
                    Price
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-forest">
                    {formatPrice(
                      activity.price
                    )}
                  </p>
                </div>
              </div>

            </div>

            {/* =========================
                BOOKING
            ========================= */}

            <div className="mt-8 rounded-[1.75rem] bg-sage/55 p-5 md:p-6">

              <div className="flex items-center justify-between gap-5">

                <div>
                  <p className="text-sm font-semibold text-forest">
                    Number of tickets
                  </p>

                  <p className="mt-1 text-xs leading-5 text-forest/45">
                    {activity.capacity !== null
                      ? `Up to ${activity.capacity} participants`
                      : "Choose the number of tickets you need."}
                  </p>
                </div>

                {/* QUANTITY */}
                <div className="flex shrink-0 items-center rounded-full border border-forest/10 bg-white p-1">

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        Math.max(
                          1,
                          quantity - 1
                        )
                      )
                    }
                    disabled={booking}
                    aria-label="Decrease quantity"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg text-forest/60 transition hover:bg-sage hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="w-8 text-center text-sm font-semibold text-forest">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(
                        activity.capacity !==
                          null
                          ? Math.min(
                              activity.capacity,
                              quantity + 1
                            )
                          : quantity + 1
                      )
                    }
                    disabled={
                      booking ||
                      (activity.capacity !==
                        null &&
                        quantity >=
                          activity.capacity)
                    }
                    aria-label="Increase quantity"
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg text-forest/60 transition hover:bg-sage hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>

                </div>
              </div>

              {/* TOTAL + BUTTON */}
              <div className="mt-5 flex flex-col gap-4 border-t border-forest/10 pt-5 sm:flex-row sm:items-end sm:justify-between">

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/40">
                    Total
                  </p>

                  <p className="mt-1 font-display text-2xl tracking-[-0.02em] text-forest">
                    {formatPrice(
                      totalPrice
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={booking}
                  className="inline-flex w-full cursor-pointer items-center justify-center rounded-full bg-forest px-7 py-3.5 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  {booking
                    ? "Creating booking..."
                    : "Book Now"}
                </button>

              </div>

              {/* ERROR */}
              {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {errorMessage}
                </div>
              )}

            </div>

          </div>
        </div>
      </section>
    </main>
  );
}