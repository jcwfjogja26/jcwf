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

      // Booking berhasil dibuat.
      // Lanjut ke halaman checkout.
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

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F7F3]">
        <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6">
          <p className="text-sm text-black/50">
            Loading activity...
          </p>
        </div>
      </main>
    );
  }

  if (!activity) {
    return (
      <main className="min-h-screen bg-[#F8F7F3]">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-black/40">
            Activity
          </p>

          <h1 className="text-3xl font-semibold tracking-tight text-[#151515]">
            Activity tidak ditemukan
          </h1>

          <p className="mt-3 max-w-md text-sm leading-6 text-black/50">
            {errorMessage ||
              "Activity yang kamu cari tidak tersedia."}
          </p>

          <Link
            href="/activities"
            className="mt-8 inline-flex items-center rounded-full bg-[#151515] px-6 py-3 text-sm font-medium text-white transition hover:opacity-85"
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
    <main className="min-h-screen bg-[#F8F7F3] text-[#151515]">
      {/* Header */}
      <header className="border-b border-black/10 bg-[#F8F7F3]">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/activities"
            className="text-sm font-medium text-black/60 transition hover:text-black"
          >
            ← Back to Activities
          </Link>

          <Link
            href="/my"
            className="text-sm font-medium text-black/60 transition hover:text-black"
          >
            My Plan
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10 lg:px-10 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          {/* Image */}
          <div className="overflow-hidden rounded-[28px] bg-black/5">
            <div className="aspect-[4/3] w-full">
              <img
                src={image}
                alt={activity.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Information */}
          <div className="lg:pt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              {activity.category}
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {activity.title}
            </h1>

            {activity.description && (
              <p className="mt-6 max-w-xl text-base leading-7 text-black/60">
                {activity.description}
              </p>
            )}

            {/* Details */}
            <div className="mt-8 divide-y divide-black/10 border-y border-black/10">
              <div className="flex items-center justify-between gap-6 py-5">
                <span className="text-sm text-black/40">
                  Date
                </span>

                <span className="text-right text-sm font-medium">
                  {formatDate(
                    activity.event_date
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-6 py-5">
                <span className="text-sm text-black/40">
                  Time
                </span>

                <span className="text-right text-sm font-medium">
                  {formatTime(
                    activity.start_time
                  )}{" "}
                  —{" "}
                  {formatTime(
                    activity.end_time
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between gap-6 py-5">
                <span className="text-sm text-black/40">
                  Location
                </span>

                <span className="text-right text-sm font-medium">
                  {activity.location}
                </span>
              </div>

              <div className="flex items-center justify-between gap-6 py-5">
                <span className="text-sm text-black/40">
                  Price
                </span>

                <span className="text-right text-sm font-semibold">
                  {formatPrice(
                    activity.price
                  )}
                </span>
              </div>

              {activity.capacity !== null && (
                <div className="flex items-center justify-between gap-6 py-5">
                  <span className="text-sm text-black/40">
                    Capacity
                  </span>

                  <span className="text-right text-sm font-medium">
                    {activity.capacity} peserta
                  </span>
                </div>
              )}
            </div>

            {/* Booking */}
            <div className="mt-8 rounded-[24px] border border-black/10 bg-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    Number of tickets
                  </p>

                  <p className="mt-1 text-xs text-black/40">
                    Maksimal sesuai kapasitas yang tersedia.
                  </p>
                </div>

                <div className="flex items-center gap-3">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg transition hover:bg-black/5 disabled:opacity-40"
                  >
                    −
                  </button>

                  <span className="w-6 text-center text-sm font-semibold">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg transition hover:bg-black/5 disabled:opacity-40"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between border-t border-black/10 pt-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-black/40">
                    Total
                  </p>

                  <p className="mt-1 text-xl font-semibold">
                    {formatPrice(
                      totalPrice
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBooking}
                  disabled={booking}
                  className="rounded-full bg-[#151515] px-7 py-3.5 text-sm font-medium text-white transition hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {booking
                    ? "Creating booking..."
                    : "Book Now →"}
                </button>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
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