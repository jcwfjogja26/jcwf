"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Activity = {
  id: string;
  title: string;
  slug: string;
  category: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
};

type PlanItem = {
  registrationId: string;
  bookingCode: string | null;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  registrationStatus: string;
  registeredAt: string;
  activity: Activity | null;
};

function formatDate(dateString: string) {
  const date = new Date(`${dateString}T00:00:00`);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  })
    .format(date)
    .toUpperCase();
}

function formatTime(time: string) {
  return time.slice(0, 5).replace(":", ".");
}

export default function MyPlanCard() {
  const [plan, setPlan] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch("/api/my/plan", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        setPlan(data.plan ?? []);
      } catch (error) {
        console.error("FETCH MY PLAN ERROR:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlan();
  }, []);

  return (
    <div className="rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(23,56,42,0.06)] sm:p-8 lg:col-span-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
        My Plan
      </p>

      <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest">
        Your schedule
      </h2>

      <p className="mt-3 max-w-md text-sm leading-6 text-forest/50">
        Activities you&apos;ve booked and paid for will appear here.
      </p>

      {loading ? (
        <div className="mt-7 rounded-2xl bg-ivory p-5">
          <p className="text-xs text-forest/45">
            Loading your plan...
          </p>
        </div>
      ) : plan.length === 0 ? (
        <div className="mt-7 rounded-2xl bg-ivory p-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest text-lg text-ivory">
              +
            </div>

            <div>
              <p className="text-sm font-semibold text-forest">
                Plan your festival
              </p>

              <p className="mt-1 text-xs leading-5 text-forest/45">
                Choose activities for November 6–8.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-7 space-y-3">
          {plan.slice(0, 3).map((item) => {
            if (!item.activity) return null;

            return (
              <Link
                key={item.registrationId}
                href={`/activities/${item.activity.slug}/success?booking=${item.registrationId}`}
                className="block rounded-2xl bg-ivory p-4 transition hover:-translate-y-0.5 hover:bg-sage/40"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gold">
                      {item.activity.category}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-forest">
                      {item.activity.title}
                    </p>

                    <p className="mt-1 text-xs text-forest/45">
                      {formatDate(item.activity.event_date)} ·{" "}
                      {formatTime(item.activity.start_time)} —{" "}
                      {formatTime(item.activity.end_time)}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-forest px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-ivory">
                    Paid
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Link
        href="/activities"
        className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-forest transition hover:text-gold"
      >
        Explore activities
        <span>→</span>
      </Link>

      {plan.length > 3 && (
        <p className="mt-3 text-[11px] text-forest/35">
          +{plan.length - 3} more activities in your plan
        </p>
      )}
    </div>
  );
}