"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type Activity = {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  price: number;
  capacity: number | null;
  image_url: string | null;
  status: string;
};

type Booking = {
  id: string;
  participant_id: string;
  activity_id: string;
  booking_code: string;
  quantity: number;
  total_amount: number;
  status: string;
  payment_status: string;
  registered_at: string;
  activity?: Activity;
};

type Payment = {
  id: string;
  booking_id: string;
  payment_method: string;
  amount: number;
  status: string;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
};

export default function ActivityCheckoutPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const slug =
    typeof params.slug === "string"
      ? params.slug
      : "";

  const bookingId =
    searchParams.get("booking") || "";

  const [activity, setActivity] =
    useState<Activity | null>(null);

  const [booking, setBooking] =
    useState<Booking | null>(null);

  const [payment, setPayment] =
    useState<Payment | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [paying, setPaying] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  // ==========================================
  // FORMAT HELPERS
  // ==========================================

  function formatPrice(price: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  }

  function formatTime(time: string) {
    return time.slice(0, 5);
  }

  // ==========================================
  // LOAD CHECKOUT DATA
  // ==========================================

  useEffect(() => {
    let cancelled = false;

    async function loadCheckout() {
      try {
        setLoading(true);
        setErrorMessage("");

        console.log(
          "=== CHECKOUT DEBUG START ==="
        );

        console.log("SLUG:", slug);
        console.log("BOOKING ID:", bookingId);

        // --------------------------------------
        // VALIDATION
        // --------------------------------------

        if (!slug) {
          throw new Error(
            "Slug activity tidak ditemukan."
          );
        }

        if (!bookingId) {
          throw new Error(
            "Booking ID tidak ditemukan."
          );
        }

        // UUID validation
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!uuidRegex.test(bookingId)) {
          throw new Error(
            `Booking ID tidak valid: ${bookingId}`
          );
        }

        // ======================================
        // 1. LOAD ACTIVITIES
        // ======================================

        console.log(
          "FETCH 1: /api/activities"
        );

        const activitiesResponse =
          await fetch("/api/activities", {
            cache: "no-store",
          });

        console.log(
          "ACTIVITIES STATUS:",
          activitiesResponse.status
        );

        const activitiesText =
          await activitiesResponse.text();

        console.log(
          "ACTIVITIES RESPONSE:",
          activitiesText
        );

        let activitiesData: any;

        try {
          activitiesData =
            JSON.parse(activitiesText);
        } catch {
          throw new Error(
            "Response /api/activities bukan JSON yang valid."
          );
        }

        if (!activitiesResponse.ok) {
          throw new Error(
            activitiesData?.message ||
              "Gagal mengambil data activities."
          );
        }

        /*
         * API biasanya mengembalikan:
         *
         * {
         *   success: true,
         *   activities: [...]
         * }
         */

        const activities =
          Array.isArray(
            activitiesData?.activities
          )
            ? activitiesData.activities
            : [];

        const foundActivity =
          activities.find(
            (item: Activity) =>
              item.slug === slug
          );

        console.log(
          "FOUND ACTIVITY:",
          foundActivity
        );

        if (!foundActivity) {
          throw new Error(
            `Activity dengan slug "${slug}" tidak ditemukan.`
          );
        }

        if (!cancelled) {
          setActivity(foundActivity);
        }

        // ======================================
        // 2. LOAD BOOKING
        // ======================================

        const encodedBookingId =
          encodeURIComponent(bookingId);

        const bookingUrl =
          `/api/activities/book/${encodedBookingId}`;

        console.log(
          "FETCH 2:",
          bookingUrl
        );

        const bookingResponse =
          await fetch(bookingUrl, {
            cache: "no-store",
          });

        console.log(
          "BOOKING STATUS:",
          bookingResponse.status
        );

        const bookingText =
  await bookingResponse.text();

console.log(
  "=============================="
);

console.log(
  "BOOKING RESPONSE STATUS:",
  bookingResponse.status
);

console.log(
  "BOOKING RESPONSE URL:",
  bookingResponse.url
);

console.log(
  "BOOKING RESPONSE CONTENT-TYPE:",
  bookingResponse.headers.get(
    "content-type"
  )
);

console.log(
  "BOOKING RESPONSE BODY:",
  bookingText
);

console.log(
  "=============================="
);

if (!bookingResponse.ok) {
  throw new Error(
    `Booking API error ${bookingResponse.status}: ${bookingText}`
  );
}

let bookingData: any;

try {
  bookingData =
    JSON.parse(bookingText);
} catch {
  throw new Error(
    `Booking API mengembalikan response yang bukan JSON: ${bookingText.slice(
      0,
      500
    )}`
  );
}

        if (bookingResponse.status === 401) {
          router.push(
            `/login?redirect=${encodeURIComponent(
              `/activities/${slug}/checkout?booking=${bookingId}`
            )}`
          );

          return;
        }

        if (!bookingResponse.ok) {
          throw new Error(
            bookingData?.message ||
              "Gagal mengambil data booking."
          );
        }

        if (!bookingData?.booking) {
          throw new Error(
            "Data booking tidak ditemukan."
          );
        }

        console.log(
          "BOOKING DATA:",
          bookingData.booking
        );

        console.log(
          "PAYMENT DATA:",
          bookingData.payment
        );

        if (!cancelled) {
          setBooking(
            bookingData.booking
          );

          setPayment(
            bookingData.payment ?? null
          );
        }

        console.log(
          "=== CHECKOUT DEBUG SUCCESS ==="
        );
      } catch (error) {
        console.error(
          "LOAD ACTIVITY CHECKOUT ERROR:",
          error
        );

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : String(error)
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCheckout();

    return () => {
      cancelled = true;
    };
  }, [slug, bookingId, router]);

  // ==========================================
  // PAYMENT
  // ==========================================

  async function handlePayment() {
    if (!booking) {
      setErrorMessage(
        "Data booking tidak tersedia."
      );
      return;
    }

    try {
      setPaying(true);
      setErrorMessage("");

      const response = await fetch(
        "/api/activities/payment",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            bookingId: booking.id,
          }),
        }
      );

      const text =
        await response.text();

      let data: any;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Response pembayaran bukan JSON yang valid."
        );
      }

      if (response.status === 401) {
        router.push(
          `/login?redirect=${encodeURIComponent(
            `/activities/${slug}/checkout?booking=${booking.id}`
          )}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            "Pembayaran gagal."
        );
      }

      if (!data?.booking) {
        throw new Error(
          "Data booking setelah pembayaran tidak ditemukan."
        );
      }

      router.push(
        `/activities/${slug}/success?booking=${encodeURIComponent(
          data.booking.id
        )}`
      );
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      setErrorMessage(
        error instanceof Error
          ? error.message
          : String(error)
      );
    } finally {
      setPaying(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f8f7f3] px-6 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-24 rounded bg-black/10" />

            <div className="h-10 w-80 rounded bg-black/10" />

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-96 rounded-3xl bg-black/10 lg:col-span-2" />

              <div className="h-96 rounded-3xl bg-black/10" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (
    errorMessage ||
    !activity ||
    !booking
  ) {
    return (
      <main className="min-h-screen bg-[#f8f7f3] px-6 py-16">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-black/40">
            Checkout
          </p>

          <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-[#171717]">
              Booking tidak ditemukan
            </h1>

            <p className="mt-3 text-sm leading-6 text-black/60">
              {errorMessage ||
                "Data booking belum dapat dimuat."}
            </p>

            <div className="mt-6 rounded-2xl bg-black/[0.03] p-4 text-xs text-black/50">
              <p>
                <strong>Slug:</strong>{" "}
                {slug || "-"}
              </p>

              <p className="mt-1 break-all">
                <strong>Booking ID:</strong>{" "}
                {bookingId || "-"}
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={`/activities/${slug}`}
                className="rounded-full bg-[#171717] px-5 py-3 text-sm font-medium text-white transition hover:bg-black"
              >
                Back to Activity
              </Link>

              <Link
                href="/activities"
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black transition hover:bg-black/[0.03]"
              >
                All Activities
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // CHECKOUT PAGE
  // ==========================================

  const isPaid =
    booking.payment_status === "paid";

  const paymentAmount =
    payment?.amount ??
    booking.total_amount;

  return (
    <main className="min-h-screen bg-[#f8f7f3] px-6 py-12">
      <div className="mx-auto max-w-5xl">
        {/* HEADER */}
        <div className="mb-10">
          <Link
            href={`/activities/${activity.slug}`}
            className="text-sm text-black/50 transition hover:text-black"
          >
            ← Back to activity
          </Link>

          <p className="mt-8 text-sm font-medium uppercase tracking-[0.2em] text-black/40">
            Checkout
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#171717] sm:text-4xl">
            Complete your booking
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">
            Review your booking details and
            complete the payment to secure your
            spot.
          </p>
        </div>

        {/* ERROR */}
        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ================================= */}
          {/* BOOKING SUMMARY */}
          {/* ================================= */}

          <section className="lg:col-span-2">
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/40">
                    Activity
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold text-[#171717]">
                    {activity.title}
                  </h2>

                  <p className="mt-1 text-sm text-black/50">
                    {activity.category}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                    isPaid
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {isPaid
                    ? "Paid"
                    : "Payment Pending"}
                </span>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-black/40">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-medium text-black">
                    {formatDate(
                      activity.event_date
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-black/40">
                    Time
                  </p>

                  <p className="mt-1 text-sm font-medium text-black">
                    {formatTime(
                      activity.start_time
                    )}{" "}
                    –{" "}
                    {formatTime(
                      activity.end_time
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-black/40">
                    Location
                  </p>

                  <p className="mt-1 text-sm font-medium text-black">
                    {activity.location}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-black/40">
                    Booking code
                  </p>

                  <p className="mt-1 text-sm font-medium text-black">
                    {booking.booking_code}
                  </p>
                </div>
              </div>

              <div className="my-8 h-px bg-black/10" />

              {/* TICKETS */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-black/40">
                    Tickets
                  </p>

                  <p className="mt-1 text-sm text-black/60">
                    {formatPrice(activity.price)}{" "}
                    × {booking.quantity}
                  </p>
                </div>

                <p className="text-lg font-semibold text-black">
                  {formatPrice(
                    booking.total_amount
                  )}
                </p>
              </div>

              {/* STATUS */}
              <div className="mt-8 rounded-2xl bg-black/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-black/60">
                    Payment status
                  </span>

                  <span className="text-sm font-medium capitalize text-black">
                    {booking.payment_status}
                  </span>
                </div>

                {payment && (
                  <div className="mt-2 flex items-center justify-between gap-4">
                    <span className="text-sm text-black/60">
                      Payment method
                    </span>

                    <span className="text-sm font-medium uppercase text-black">
                      {payment.payment_method}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ================================= */}
          {/* PAYMENT */}
          {/* ================================= */}

          <aside>
            <div className="sticky top-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-black/40">
                Payment
              </p>

              <h2 className="mt-2 text-xl font-semibold text-[#171717]">
                QRIS
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/55">
                Scan the QRIS below to complete
                your payment.
              </p>

              {/* QRIS MOCKUP */}
              <div className="mt-6 flex aspect-square items-center justify-center rounded-3xl bg-black/[0.04] p-6">
                <div className="flex h-full w-full max-w-[220px] items-center justify-center rounded-2xl border-2 border-dashed border-black/20 bg-white">
                  <div className="text-center">
                    <div className="mx-auto mb-4 grid h-28 w-28 grid-cols-7 gap-1 opacity-80">
                      {Array.from({
                        length: 49,
                      }).map((_, index) => (
                        <span
                          key={index}
                          className={
                            (
                              index * 17 +
                              index * 3
                            ) %
                              5 <
                            2
                              ? "bg-black"
                              : "bg-white"
                          }
                        />
                      ))}
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-[0.15em] text-black/50">
                      QRIS
                    </p>

                    <p className="mt-1 text-[11px] text-black/40">
                      Payment simulation
                    </p>
                  </div>
                </div>
              </div>

              {/* TOTAL */}
              <div className="mt-6 border-t border-black/10 pt-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-black/55">
                    Total
                  </span>

                  <span className="text-xl font-semibold text-black">
                    {formatPrice(
                      paymentAmount
                    )}
                  </span>
                </div>
              </div>

              {/* PAYMENT BUTTON */}
              {!isPaid ? (
                <button
                  type="button"
                  onClick={handlePayment}
                  disabled={paying}
                  className="mt-6 w-full rounded-full bg-[#171717] px-5 py-3.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paying
                    ? "Processing..."
                    : "I've Paid →"}
                </button>
              ) : (
                <Link
                  href={`/activities/${activity.slug}/success?booking=${encodeURIComponent(
                    booking.id
                  )}`}
                  className="mt-6 block w-full rounded-full bg-emerald-600 px-5 py-3.5 text-center text-sm font-medium text-white transition hover:bg-emerald-700"
                >
                  View Confirmation →
                </Link>
              )}

              <p className="mt-4 text-center text-xs leading-5 text-black/40">
                This is a payment simulation for
                the JCWF prototype.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}