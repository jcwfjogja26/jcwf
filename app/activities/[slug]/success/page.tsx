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
  activity_id: string;
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

  const [booking, setBooking] = useState<Booking | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadSuccess() {
      try {
        setLoading(true);
        setErrorMessage("");

        if (!bookingId) {
          setErrorMessage("Booking tidak ditemukan.");
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
            data.message || "Gagal mengambil data booking."
          );
        }

        if (data.booking?.payment_status !== "paid") {
          setErrorMessage(
            "Pembayaran untuk booking ini belum berhasil."
          );
          return;
        }

        setBooking(data.booking);

        const activityResponse = await fetch("/api/activities", {
          cache: "no-store",
        });

        const activityData = await activityResponse.json();

        if (!activityResponse.ok) {
          throw new Error(
            activityData.message || "Gagal mengambil data activity."
          );
        }

        const foundActivity = activityData.activities?.find(
          (item: Activity) => item.id === data.booking.activity_id
        );

        if (!foundActivity) {
          throw new Error("Activity tidak ditemukan.");
        }

        setActivity(foundActivity);
      } catch (error) {
        console.error("LOAD ACTIVITY SUCCESS ERROR:", error);

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
      <main className="flex min-h-screen items-center justify-center bg-ivory text-forest">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-forest/10 border-t-forest" />
          <p className="mt-4 text-sm text-forest/45">
            Loading confirmation...
          </p>
        </div>
      </main>
    );
  }

  if (!booking || !activity) {
    return (
      <main className="min-h-screen bg-ivory text-forest">
        <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            Booking
          </p>

          <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.04em]">
            Confirmation unavailable
          </h1>

          <p className="mt-4 text-sm leading-6 text-forest/50">
            {errorMessage || "Data booking tidak tersedia."}
          </p>

          <Link
            href="/my"
            className="mt-8 inline-flex rounded-full bg-forest px-6 py-3 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
          >
            Go to My Plan
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ivory text-forest">
      <section className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-20 lg:px-14">
        {/* Back */}
        <Link
          href="/activities"
          className="inline-flex items-center text-sm font-medium text-forest/50 transition-colors hover:text-forest"
        >
          ← Back to Activities
        </Link>

        {/* Success Header */}
        <div className="mt-14 text-center md:mt-20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-forest text-xl font-medium text-gold">
            ✓
          </div>

          <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
            Booking Confirmed
          </p>

          <h1 className="mt-3 font-display text-[clamp(3rem,7vw,5.5rem)] font-medium leading-[0.9] tracking-[-0.055em] text-forest">
            You're all
            <br />
            <span className="text-gold">set.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-forest/50 md:text-[15px]">
            Your payment has been confirmed. This experience is now
            part of your JCWF journey.
          </p>
        </div>

        {/* Confirmation */}
        <div className="mt-12 overflow-hidden rounded-[2rem] border border-forest/8 bg-white shadow-[0_12px_40px_rgba(23,56,42,0.06)] md:mt-16">
          {/* Booking Code */}
          <div className="bg-forest px-6 py-7 text-center md:px-8 md:py-9">
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gold">
              Booking Code
            </p>

            <p className="mt-3 font-display text-3xl tracking-[0.08em] text-white md:text-4xl">
              {booking.booking_code}
            </p>

            <span className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.14em] text-white/75">
              Payment Confirmed
            </span>
          </div>

          <div className="p-6 md:p-8">
            {/* Activity */}
            <div className="border-b border-forest/8 pb-7">
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold">
                Your Activity
              </p>

              <h2 className="mt-2 font-display text-3xl leading-[0.95] tracking-[-0.04em] text-forest md:text-4xl">
                {activity.title}
              </h2>

              <p className="mt-2 text-xs font-medium uppercase tracking-[0.12em] text-forest/40">
                {activity.category}
              </p>
            </div>

            {/* Details */}
            <div className="divide-y divide-forest/8">
              <div className="flex items-start justify-between gap-6 py-5">
                <span className="text-xs font-medium text-forest/40">
                  Date
                </span>

                <span className="max-w-[65%] text-right text-sm font-semibold text-forest">
                  {formatDate(activity.event_date)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-6 py-5">
                <span className="text-xs font-medium text-forest/40">
                  Time
                </span>

                <span className="text-right text-sm font-semibold text-forest">
                  {formatTime(activity.start_time)} —{" "}
                  {formatTime(activity.end_time)}
                </span>
              </div>

              <div className="flex items-start justify-between gap-6 py-5">
                <span className="text-xs font-medium text-forest/40">
                  Location
                </span>

                <span className="max-w-[65%] text-right text-sm font-semibold leading-5 text-forest">
                  {activity.location}
                </span>
              </div>

              <div className="flex items-start justify-between gap-6 py-5">
                <span className="text-xs font-medium text-forest/40">
                  Tickets
                </span>

                <span className="text-right text-sm font-semibold text-forest">
                  {booking.quantity}
                </span>
              </div>

              <div className="flex items-start justify-between gap-6 pt-5">
                <span className="text-xs font-medium text-forest/40">
                  Total Paid
                </span>

                <span className="text-right text-sm font-semibold text-forest">
                  {formatPrice(booking.total_amount)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-4 rounded-[1.5rem] bg-sage/55 px-5 py-5 md:px-6">
          <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-forest/45">
            Keep this code
          </p>

          <p className="mt-2 text-xs leading-5 text-forest/60 md:text-sm">
            Simpan booking code ini. Kamu dapat menggunakannya
            sebagai referensi saat mengikuti activity.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href="/my"
            className="flex items-center justify-center rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
          >
            View My Plan
          </Link>

          <Link
            href="/activities"
            className="flex items-center justify-center rounded-full border border-forest/10 bg-white px-6 py-3.5 text-sm font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-sage"
          >
            Explore More Activities
          </Link>
        </div>
      </section>
    </main>
  );
}