"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Reward = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  pointsRequired: number;
  stock: number;
  status: "active" | "inactive" | "sold_out";
};

type Redemption = {
  id: string;
  code: string;
  pointsSpent: number;
  status: string;
  redeemedAt: string;
};

export default function RewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [redemption, setRedemption] = useState<Redemption | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadRewards() {
    try {
      setLoading(true);

      const response = await fetch("/api/rewards", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil rewards.");
      }

      setRewards(data.rewards || []);
      setPoints(data.points || 0);
    } catch (error) {
      console.error("LOAD REWARDS ERROR:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data rewards."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRewards();
  }, []);

  async function handleRedeem(reward: Reward) {
    if (reward.stock <= 0) {
      setError("Reward ini sudah habis.");
      return;
    }

    if (points < reward.pointsRequired) {
      setError("Points kamu belum cukup untuk menukar reward ini.");
      return;
    }

    const confirmed = window.confirm(
      `Tukar ${reward.pointsRequired.toLocaleString(
        "id-ID"
      )} points untuk ${reward.name}?`
    );

    if (!confirmed) return;

    try {
      setRedeemingId(reward.id);
      setError("");
      setMessage("");

      const response = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rewardId: reward.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menukar reward.");
      }

      setPoints(data.points?.remaining ?? points - reward.pointsRequired);

      setRedemption(data.redemption);
      setSelectedReward(reward);
      setMessage(data.message || "Reward berhasil ditukar.");

      await loadRewards();
    } catch (error) {
      console.error("REDEEM REWARD ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal menukar reward."
      );
    } finally {
      setRedeemingId(null);
    }
  }

  function formatPoints(value: number) {
    return value.toLocaleString("id-ID");
  }

  return (
    <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
      {/* Header */}
      <section className="border-b border-[#17382A]/10 bg-[#17382A] text-white">
        <div className="mx-auto max-w-7xl px-6 py-10 md:px-8">
          <Link
            href="/my"
            className="mb-6 inline-flex text-sm font-medium text-white/70 transition hover:text-white"
          >
            ← Back to My Journey
          </Link>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                JCWF 2026
              </p>

              <h1 className="text-4xl font-bold tracking-tight">
                Rewards
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/70">
                Gunakan points yang kamu kumpulkan untuk mendapatkan
                merchandise dan hadiah eksklusif JCWF.
              </p>
            </div>

            {/* Points */}
            <div className="rounded-3xl border border-white/10 bg-white/10 px-6 py-5 backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                Your Points
              </p>

              <p className="mt-1 text-3xl font-bold">
                {formatPoints(points)}
                <span className="ml-1 text-sm font-medium text-white/60">
                  pts
                </span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-10 md:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 rounded-2xl border border-[#BCD5C2] bg-[#EDF6EF] px-5 py-4 text-sm text-[#355743]">
            {message}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center text-sm text-[#7A8D7F]">
            Loading rewards...
          </div>
        ) : rewards.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#17382A]/15 bg-white px-6 py-20 text-center">
            <h2 className="font-semibold text-[#17382A]">
              Belum ada reward tersedia
            </h2>

            <p className="mt-2 text-sm text-[#7A8D7F]">
              Cek kembali nanti untuk melihat reward JCWF.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#17382A]">
                Available Rewards
              </h2>

              <p className="mt-1 text-sm text-[#7A8D7F]">
                Pilih reward yang ingin kamu tukarkan dengan points.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {rewards.map((reward) => {
                const canRedeem =
                  reward.status === "active" &&
                  reward.stock > 0 &&
                  points >= reward.pointsRequired;

                const insufficientPoints =
                  points < reward.pointsRequired;

                return (
                  <article
                    key={reward.id}
                    className="overflow-hidden rounded-[2rem] border border-[#17382A]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden bg-[#EEF0EA]">
                      {reward.imageUrl ? (
                        <img
                          src={reward.imageUrl}
                          alt={reward.name}
                          className="h-full w-full object-cover transition duration-500 hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#8A958D]">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-bold text-[#17382A]">
                        {reward.name}
                      </h3>

                      <p className="mt-2 min-h-[42px] text-sm leading-5 text-[#6D7A72]">
                        {reward.description || "JCWF exclusive reward."}
                      </p>

                      <div className="mt-5 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A958D]">
                            Required
                          </p>

                          <p className="mt-1 text-lg font-bold text-[#17382A]">
                            {formatPoints(reward.pointsRequired)}
                            <span className="ml-1 text-xs font-medium text-[#7A8D7F]">
                              pts
                            </span>
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8A958D]">
                            Stock
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#17382A]">
                            {reward.stock > 0
                              ? `${reward.stock} left`
                              : "Sold out"}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      {reward.status === "sold_out" || reward.stock <= 0 ? (
                        <button
                          type="button"
                          disabled
                          className="mt-5 w-full rounded-full bg-[#E9E9E4] px-5 py-3 text-sm font-semibold text-[#909891]"
                        >
                          Sold Out
                        </button>
                      ) : insufficientPoints ? (
                        <button
                          type="button"
                          disabled
                          className="mt-5 w-full rounded-full bg-[#F1F0EA] px-5 py-3 text-sm font-semibold text-[#909891]"
                        >
                          Need {formatPoints(
                            reward.pointsRequired - points
                          )}{" "}
                          More Points
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={
                            redeemingId === reward.id || !canRedeem
                          }
                          onClick={() => handleRedeem(reward)}
                          className="mt-5 w-full rounded-full bg-[#17382A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#28513D] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {redeemingId === reward.id
                            ? "Redeeming..."
                            : "Redeem Reward"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* Success Modal */}
      {redemption && selectedReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17382A]/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#EAF3EC] text-2xl text-[#3F7250]">
              ✓
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[#7A8D7F]">
              Redemption Successful
            </p>

            <h2 className="mt-2 text-2xl font-bold text-[#17382A]">
              {selectedReward.name}
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#6D7A72]">
              Reward berhasil ditukar. Simpan redemption code ini untuk
              proses pengambilan hadiah.
            </p>

            <div className="mt-6 rounded-2xl bg-[#F7F3E8] p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7A8D7F]">
                Redemption Code
              </p>

              <p className="mt-2 text-2xl font-bold tracking-[0.12em] text-[#17382A]">
                {redemption.code}
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#17382A]/10 px-4 py-3 text-sm">
              <span className="text-[#7A8D7F]">Points spent</span>

              <span className="font-semibold text-[#17382A]">
                -{formatPoints(redemption.pointsSpent)} pts
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setRedemption(null);
                setSelectedReward(null);
                setMessage("");
              }}
              className="mt-6 w-full rounded-full bg-[#17382A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#28513D]"
            >
              Continue Exploring
            </button>
          </div>
        </div>
      )}
    </main>
  );
}