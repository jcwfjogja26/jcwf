"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

type Booking = {
  id: string;
  booking_code: string;
  quantity: number;
  total_amount: number;
  payment_status: string;
  registered_at: string;
};

type Activity = {
  id: string;
  title: string;
  category: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
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

export default function ActivitySuccessPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const slug = params.slug as string;
  const bookingId = searchParams.get("booking");

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [activity, setActivity] =
    useState<Activity | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadSuccess() {
      try {
        setLoading(true);
        setErrorMessage("");

        if (!bookingId) {
          setErrorMessage(
            "Booking tidak ditemukan."
          );
          return;
        }

        const response = await fetch(
          `/api/activities/book/${bookingId}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Gagal mengambil data booking."
          );
        }

        if (
          data.booking?.payment_status !==
          "paid"
        ) {
          setErrorMessage(
            "Pembayaran untuk booking ini belum berhasil."
          );
          return;
        }

        setBooking(data.booking);

        const activityResponse =
          await fetch("/api/activities", {
            cache: "no-store",
          });

        const activityData =
          await activityResponse.json();

        if (!activityResponse.ok) {
          throw new Error(
            activityData.message ||
              "Gagal mengambil data activity."
          );
        }

        const foundActivity =
          activityData.activities?.find(
            (item: Activity) =>
              item.id ===
              data.booking.activity_id
          );

        if (!foundActivity) {
          throw new Error(
            "Activity tidak ditemukan."
          );
        }

        setActivity(foundActivity);
      } catch (error) {
        console.error(
          "LOAD ACTIVITY SUCCESS ERROR:",
          error
        );

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data booking."
        );
      } finally {
        setLoading(false);
      }
    }

    loadSuccess();
  }, [bookingId, slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F7F3]">
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-sm text-black/50">
            Loading confirmation...
          </p>
        </div>
      </main>
    );
  }

  if (!booking || !activity) {
    return (
      <main className="min-h-screen bg-[#F8F7F3]">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
            Booking
          </p>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight">
            Confirmation unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-black/50">
            {errorMessage ||
              "Data booking tidak tersedia."}
          </p>

          <Link
            href="/my"
            className="mt-8 rounded-full bg-[#151515] px-6 py-3 text-sm font-medium text-white"
          >
            Go to My Plan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F3] text-[#151515]">
      <section className="mx-auto flex min-h-screen max-w-2xl items-center px-6 py-12">
        <div className="w-full">
          {/* Success Icon */}
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#151515] text-2xl text-white">
            ✓
          </div>

          {/* Heading */}
          <div className="mt-7 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/40">
              Booking Confirmed
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
              You're all set.
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/50">
              Your payment has been confirmed.
              This experience is now part of your
              JCWF journey.
            </p>
          </div>

          {/* Confirmation Card */}
          <div className="mt-10 overflow-hidden rounded-[28px] border border-black/10 bg-white">
            <div className="p-6 sm:p-8">
              {/* Booking Code */}
              <div className="rounded-2xl bg-[#F5F4EF] p-5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40">
                  Booking Code
                </p>

                <p className="mt-2 text-2xl font-semibold tracking-[0.08em]">
                  {booking.booking_code}
                </p>

                <div className="mt-3 inline-flex items-center rounded-full bg-white px-3 py-1.5 text-xs font-medium">
                  ✓ PAID
                </div>
              </div>

              {/* Activity */}
              <div className="mt-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/40">
                  Activity
                </p>

                <h2 className="mt-2 text-2xl font-semibold">
                  {activity.title}
                </h2>

                <p className="mt-1 text-sm text-black/40">
                  {activity.category}
                </p>
              </div>

              {/* Details */}
              <div className="mt-7 divide-y divide-black/10 border-y border-black/10">
                <div className="flex justify-between gap-6 py-4">
                  <span className="text-sm text-black/40">
                    Date
                  </span>

                  <span className="text-right text-sm font-medium">
                    {formatDate(
                      activity.event_date
                    )}
                  </span>
                </div>

                <div className="flex justify-between gap-6 py-4">
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

                <div className="flex justify-between gap-6 py-4">
                  <span className="text-sm text-black/40">
                    Location
                  </span>

                  <span className="text-right text-sm font-medium">
                    {activity.location}
                  </span>
                </div>

                <div className="flex justify-between gap-6 py-4">
                  <span className="text-sm text-black/40">
                    Tickets
                  </span>

                  <span className="text-right text-sm font-medium">
                    {booking.quantity}
                  </span>
                </div>

                <div className="flex justify-between gap-6 py-4">
                  <span className="text-sm text-black/40">
                    Total Paid
                  </span>

                  <span className="text-right text-sm font-semibold">
                    {formatPrice(
                      booking.total_amount
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link
              href="/my"
              className="flex items-center justify-center rounded-full bg-[#151515] px-6 py-4 text-sm font-medium text-white transition hover:opacity-85"
            >
              View My Plan →
            </Link>

            <Link
              href="/activities"
              className="flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-4 text-sm font-medium transition hover:bg-black/5"
            >
              Explore More Activities
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}