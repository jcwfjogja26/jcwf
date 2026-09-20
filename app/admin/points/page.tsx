"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type Participant = {
  id: string;
  fullName: string;
  reconnectId: string;
  email: string;
};

type PointTransaction = {
  id: string;
  points: number;
  type: string;
  description: string | null;
  referenceId: string | null;
  createdAt: string;
  participant: Participant | null;
};

type Summary = {
  totalTransactions: number;
  totalEarned: number;
  totalDeducted: number;
  netPoints: number;
  uniqueParticipants: number;
};

export default function AdminPointsPage() {
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalTransactions: 0,
    totalEarned: 0,
    totalDeducted: 0,
    netPoints: 0,
    uniqueParticipants: 0,
  });

  const [transactionTypes, setTransactionTypes] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [direction, setDirection] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadData() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (type) {
        params.set("type", type);
      }

      if (direction) {
        params.set("direction", direction);
      }

      const response = await fetch(`/api/admin/points?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data points.");
      }

      setTransactions(data.transactions || []);
      setSummary(
        data.summary || {
          totalTransactions: 0,
          totalEarned: 0,
          totalDeducted: 0,
          netPoints: 0,
          uniqueParticipants: 0,
        }
      );
      setTransactionTypes(data.transactionTypes || []);
    } catch (error) {
      console.error("LOAD ADMIN POINTS ERROR:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, type, direction]);

  const filteredTransactions = useMemo(() => {
    return transactions;
  }, [transactions]);

  function formatPoints(points: number) {
    return `${points > 0 ? "+" : ""}${points.toLocaleString("id-ID")} pts`;
  }

  function formatType(type: string) {
    return type
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <AdminShell>
      <main className="min-h-screen p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#7A8D7F]">
              Engagement
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#17382A]">
              Points
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6D7A72]">
              Pantau seluruh aktivitas perolehan dan pengurangan points
              peserta JCWF.
            </p>
          </div>

          {/* Summary */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              label="Total Transactions"
              value={summary.totalTransactions.toLocaleString("id-ID")}
            />

            <SummaryCard
              label="Total Earned"
              value={`+${summary.totalEarned.toLocaleString("id-ID")}`}
              suffix="pts"
            />

            <SummaryCard
              label="Total Deducted"
              value={`-${summary.totalDeducted.toLocaleString("id-ID")}`}
              suffix="pts"
            />

            <SummaryCard
              label="Net Points"
              value={summary.netPoints.toLocaleString("id-ID")}
              suffix="pts"
            />

            <SummaryCard
              label="Participants"
              value={summary.uniqueParticipants.toLocaleString("id-ID")}
            />
          </div>

          {/* Filters */}
          <section className="mb-6 rounded-3xl border border-[#17382A]/10 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_200px_180px]">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nama, Reconnect ID, email, type..."
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F8F7F2] px-4 py-3 text-sm text-[#17382A] outline-none transition placeholder:text-[#9AA59D] focus:border-[#17382A]/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                  Transaction Type
                </label>

                <select
                  value={type}
                  onChange={(event) => setType(event.target.value)}
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F8F7F2] px-4 py-3 text-sm text-[#17382A] outline-none"
                >
                  <option value="">All Types</option>

                  {transactionTypes.map((item) => (
                    <option key={item} value={item}>
                      {formatType(item)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                  Direction
                </label>

                <select
                  value={direction}
                  onChange={(event) => setDirection(event.target.value)}
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F8F7F2] px-4 py-3 text-sm text-[#17382A] outline-none"
                >
                  <option value="">All</option>
                  <option value="earned">Earned</option>
                  <option value="deducted">Deducted</option>
                </select>
              </div>
            </div>
          </section>

          {/* Transactions */}
          <section className="overflow-hidden rounded-3xl border border-[#17382A]/10 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#17382A]/10 px-6 py-5">
              <div>
                <h2 className="font-semibold text-[#17382A]">
                  Points Transactions
                </h2>

                <p className="mt-1 text-xs text-[#7A8D7F]">
                  {filteredTransactions.length.toLocaleString("id-ID")}{" "}
                  transaction ditampilkan
                </p>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-[#7A8D7F]">
                Loading points...
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="font-medium text-[#17382A]">
                  Belum ada transaksi points.
                </p>

                <p className="mt-1 text-sm text-[#7A8D7F]">
                  Data akan muncul ketika peserta mendapatkan atau kehilangan
                  points.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-[#17382A]/10 bg-[#FAF9F5] text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                        Participant
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                        Type
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                        Description
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                        Points
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                        Date
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-[#17382A]/5 last:border-b-0 hover:bg-[#FAF9F5]/70"
                      >
                        <td className="px-6 py-4">
                          {transaction.participant ? (
                            <div>
                              <p className="font-semibold text-[#17382A]">
                                {transaction.participant.fullName}
                              </p>

                              <p className="mt-1 text-xs text-[#7A8D7F]">
                                {transaction.participant.reconnectId}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-[#9AA59D]">
                              Unknown participant
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-[#EEF3EE] px-3 py-1.5 text-xs font-semibold text-[#355743]">
                            {formatType(transaction.type)}
                          </span>
                        </td>

                        <td className="max-w-[300px] px-6 py-4">
                          <p className="truncate text-sm text-[#53635A]">
                            {transaction.description || "—"}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`text-sm font-bold ${
                              transaction.points >= 0
                                ? "text-[#3F7250]"
                                : "text-[#A84D4D]"
                            }`}
                          >
                            {formatPoints(transaction.points)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-sm text-[#6D7A72]">
                          {formatDate(transaction.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
  suffix,
}: {
  label: string;
  value: string;
  suffix?: string;
}) {
  return (
    <div className="rounded-3xl border border-[#17382A]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
        {label}
      </p>

      <div className="mt-3 flex items-baseline gap-1.5">
        <p className="text-2xl font-bold tracking-tight text-[#17382A]">
          {value}
        </p>

        {suffix && (
          <span className="text-xs font-medium text-[#7A8D7F]">{suffix}</span>
        )}
      </div>
    </div>
  );
}