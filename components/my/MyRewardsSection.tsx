import Link from "next/link";

type Redemption = {
  id: string;
  redemption_code: string;
  points_spent: number;
  status: "pending" | "claimed" | "cancelled";
  redeemed_at: string;
  claimed_at: string | null;
  reward:
    | {
        id: string;
        name: string;
        image_url: string | null;
      }
    | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusLabel(
  status: Redemption["status"]
) {
  if (status === "pending") return "Pending";
  if (status === "claimed") return "Claimed";
  return "Cancelled";
}

function getStatusClass(
  status: Redemption["status"]
) {
  if (status === "pending") {
    return "bg-gold/10 text-gold";
  }

  if (status === "claimed") {
    return "bg-sage text-forest";
  }

  return "bg-red-50 text-red-600";
}

export default function MyRewardsSection({
  totalPoints,
  redemptions,
}: {
  totalPoints: number;
  redemptions: Redemption[];
}) {
  return (
    <section className="mt-5 grid gap-5 lg:grid-cols-12">
      {/* REWARDS CARD */}
      <div className="relative overflow-hidden rounded-[2rem] bg-forest p-7 text-ivory sm:p-8 lg:col-span-5 lg:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border border-gold/15" />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Rewards
              </p>

              <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                Make your points count.
              </h2>
            </div>

            <span className="text-3xl">🎁</span>
          </div>

          <p className="mt-4 max-w-md text-sm leading-6 text-ivory/55">
            Use the points you collect throughout
            your JCWF journey to redeem exclusive
            festival rewards.
          </p>

          <div className="mt-8 rounded-2xl bg-ivory/8 p-5">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ivory/40">
              Available Points
            </p>

            <p className="mt-2 font-display text-4xl text-gold">
              {totalPoints}
            </p>

            <p className="mt-1 text-xs text-ivory/40">
              points ready to redeem
            </p>
          </div>

          <Link
            href="/rewards"
            className="mt-6 inline-flex items-center gap-3 rounded-full bg-gold px-5 py-3 text-xs font-semibold text-forest transition hover:bg-ivory"
          >
            Explore Rewards
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* MY REDEMPTIONS */}
      <div className="rounded-[2rem] bg-white p-7 shadow-[0_18px_50px_rgba(23,56,42,0.06)] sm:p-8 lg:col-span-7 lg:p-10">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              My Redemptions
            </p>

            <h2 className="mt-3 font-display text-3xl tracking-[-0.03em] text-forest">
              Your reward history.
            </h2>
          </div>

          {redemptions.length > 0 && (
            <span className="rounded-full bg-forest/5 px-3 py-1.5 text-[10px] font-semibold text-forest/50">
              {redemptions.length} redemption
              {redemptions.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {redemptions.length === 0 ? (
          <div className="mt-7 rounded-2xl bg-ivory p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-xl">
                🎁
              </div>

              <div>
                <p className="text-sm font-semibold text-forest">
                  No rewards redeemed yet
                </p>

                <p className="mt-1 text-xs leading-5 text-forest/45">
                  Collect points and exchange them
                  for JCWF rewards.
                </p>
              </div>
            </div>

            <Link
              href="/rewards"
              className="mt-4 inline-flex text-xs font-semibold text-forest underline underline-offset-4"
            >
              Browse rewards →
            </Link>
          </div>
        ) : (
          <div className="mt-7 space-y-3">
            {redemptions.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 rounded-2xl border border-forest/8 bg-ivory/50 p-4 sm:flex-row sm:items-center"
              >
                {/* IMAGE */}
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-sage">
                  {item.reward?.image_url ? (
                    <img
                      src={item.reward.image_url}
                      alt={item.reward.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl">
                      🎁
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-forest">
                      {item.reward?.name ?? "JCWF Reward"}
                    </p>

                    <span
                      className={`rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] ${getStatusClass(
                        item.status
                      )}`}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-forest/45">
                    {formatDate(item.redeemed_at)} ·{" "}
                    {item.points_spent} points
                  </p>

                  <div className="mt-2">
                    <span className="text-[9px] uppercase tracking-[0.12em] text-forest/35">
                      Redemption Code
                    </span>

                    <p className="mt-0.5 font-mono text-xs font-bold tracking-[0.08em] text-forest">
                      {item.redemption_code}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {redemptions.length > 4 && (
              <p className="pt-2 text-center text-xs text-forest/35">
                Showing your latest 4 redemptions
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}