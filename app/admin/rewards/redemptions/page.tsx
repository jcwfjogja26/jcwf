"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type RedemptionStatus = "pending" | "claimed" | "cancelled";

type Redemption = {
  id: string;
  redemptionCode: string;
  pointsSpent: number;
  status: RedemptionStatus;
  redeemedAt: string;
  claimedAt: string | null;
  createdAt: string;
  updatedAt: string;

  participant: {
    id: string;
    fullName: string;
    reconnectId: string;
    email: string;
    whatsapp: string;
  } | null;

  reward: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
    pointsRequired: number;
  } | null;
};

type Summary = {
  total: number;
  pending: number;
  claimed: number;
  cancelled: number;
  totalPointsSpent: number;
};

const emptySummary: Summary = {
  total: 0,
  pending: 0,
  claimed: 0,
  cancelled: 0,
  totalPointsSpent: 0,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getStatusLabel(status: RedemptionStatus) {
  if (status === "pending") return "Pending";
  if (status === "claimed") return "Claimed";
  return "Cancelled";
}

function getStatusClass(status: RedemptionStatus) {
  if (status === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "claimed") {
    return "bg-emerald-100 text-emerald-700";
  }

  return "bg-red-100 text-red-700";
}

export default function AdminRewardRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadData() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/admin/rewards/redemptions?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil data redemption."
        );
      }

      setRedemptions(data.redemptions ?? []);
      setSummary(data.summary ?? emptySummary);
    } catch (error) {
      console.error("LOAD REDEMPTIONS ERROR:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data redemption."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [status]);

  async function updateStatus(
    redemptionId: string,
    nextStatus: RedemptionStatus
  ) {
    try {
      setUpdatingId(redemptionId);

      const response = await fetch(
        "/api/admin/rewards/redemptions",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: redemptionId,
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal memperbarui status."
        );
      }

      await loadData();
    } catch (error) {
      console.error("UPDATE REDEMPTION ERROR:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui status redemption."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const pendingCount = useMemo(
    () =>
      redemptions.filter(
        (item) => item.status === "pending"
      ).length,
    [redemptions]
  );

  return (
    <AdminShell>
      <main className="min-h-screen p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7A8F83]">
                Rewards
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#17382A]">
                Reward Redemptions
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#617067]">
                Kelola penukaran reward participant dan konfirmasi
                reward yang sudah diambil.
              </p>
            </div>

            <div className="rounded-2xl border border-[#17382A]/10 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium text-[#7A8F83]">
                Pending sekarang
              </p>

              <p className="mt-1 text-2xl font-bold text-[#17382A]">
                {pendingCount}
              </p>
            </div>
          </div>

          {/* Summary */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Total"
              value={summary.total}
            />

            <SummaryCard
              label="Pending"
              value={summary.pending}
            />

            <SummaryCard
              label="Claimed"
              value={summary.claimed}
            />

            <SummaryCard
              label="Cancelled"
              value={summary.cancelled}
            />

            <SummaryCard
              label="Points Spent"
              value={summary.totalPointsSpent}
            />
          </div>

          {/* Filters */}
          <section className="rounded-3xl border border-[#17382A]/10 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    loadData();
                  }
                }}
                placeholder="Search participant, Reconnect ID, reward, atau code..."
                className="min-w-0 flex-1 rounded-2xl border border-[#17382A]/10 bg-[#F9F7F0] px-4 py-3 text-sm outline-none transition focus:border-[#17382A]/30"
              />

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="rounded-2xl border border-[#17382A]/10 bg-[#F9F7F0] px-4 py-3 text-sm outline-none"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="claimed">Claimed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                onClick={loadData}
                className="rounded-2xl bg-[#17382A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#24513D]"
              >
                Search
              </button>
            </div>
          </section>

          {/* Table */}
          <section className="overflow-hidden rounded-3xl border border-[#17382A]/10 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-[#F4F1E7]">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-[#718078]">
                    <th className="px-5 py-4">
                      Participant
                    </th>

                    <th className="px-5 py-4">
                      Reward
                    </th>

                    <th className="px-5 py-4">
                      Redemption Code
                    </th>

                    <th className="px-5 py-4">
                      Points
                    </th>

                    <th className="px-5 py-4">
                      Redeemed
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>

                    <th className="px-5 py-4 text-right">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#17382A]/10">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-[#718078]"
                      >
                        Loading redemption...
                      </td>
                    </tr>
                  ) : redemptions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-sm text-[#718078]"
                      >
                        Belum ada redemption.
                      </td>
                    </tr>
                  ) : (
                    redemptions.map((item) => (
                      <tr
                        key={item.id}
                        className="align-top transition hover:bg-[#FAF9F4]"
                      >
                        {/* Participant */}
                        <td className="px-5 py-5">
                          <div>
                            <p className="font-semibold text-[#17382A]">
                              {item.participant?.fullName ??
                                "-"}
                            </p>

                            <p className="mt-1 text-xs text-[#718078]">
                              {item.participant?.reconnectId ??
                                "-"}
                            </p>

                            <p className="mt-1 text-xs text-[#718078]">
                              {item.participant?.email ?? "-"}
                            </p>
                          </div>
                        </td>

                        {/* Reward */}
                        <td className="px-5 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#F0EDE2]">
                              {item.reward?.imageUrl ? (
                                <img
                                  src={item.reward.imageUrl}
                                  alt={item.reward.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg">
                                  🎁
                                </div>
                              )}
                            </div>

                            <div>
                              <p className="font-semibold text-[#17382A]">
                                {item.reward?.name ?? "-"}
                              </p>

                              <p className="mt-1 text-xs text-[#718078]">
                                {item.reward
                                  ?.pointsRequired ?? 0}{" "}
                                points
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="px-5 py-5">
                          <code className="rounded-lg bg-[#F4F1E7] px-3 py-2 text-xs font-bold tracking-[0.08em] text-[#17382A]">
                            {item.redemptionCode}
                          </code>
                        </td>

                        {/* Points */}
                        <td className="px-5 py-5">
                          <span className="font-semibold text-[#17382A]">
                            -{item.pointsSpent}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-5 py-5 text-sm text-[#617067]">
                          {formatDate(item.redeemedAt)}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-5">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-5 py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {item.status === "pending" && (
                              <>
                                <button
                                  disabled={
                                    updatingId === item.id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "claimed"
                                    )
                                  }
                                  className="rounded-xl bg-[#17382A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#24513D] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {updatingId === item.id
                                    ? "Updating..."
                                    : "Mark Claimed"}
                                </button>

                                <button
                                  disabled={
                                    updatingId === item.id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      item.id,
                                      "cancelled"
                                    )
                                  }
                                  className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Cancel
                                </button>
                              </>
                            )}

                            {item.status === "claimed" && (
                              <button
                                disabled={
                                  updatingId === item.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    item.id,
                                    "pending"
                                  )
                                }
                                className="rounded-xl border border-[#17382A]/10 px-4 py-2 text-xs font-semibold text-[#17382A] transition hover:bg-[#F4F1E7] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reopen
                              </button>
                            )}

                            {item.status === "cancelled" && (
                              <button
                                disabled={
                                  updatingId === item.id
                                }
                                onClick={() =>
                                  updateStatus(
                                    item.id,
                                    "pending"
                                  )
                                }
                                className="rounded-xl border border-[#17382A]/10 px-4 py-2 text-xs font-semibold text-[#17382A] transition hover:bg-[#F4F1E7] disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                Reopen
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-[#17382A]/10 bg-white p-5 shadow-sm">
      <p className="text-sm text-[#718078]">{label}</p>

      <p className="mt-2 text-2xl font-bold text-[#17382A]">
        {value.toLocaleString("id-ID")}
      </p>
    </div>
  );
}