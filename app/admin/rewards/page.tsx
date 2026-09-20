"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type Reward = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  pointsRequired: number;
  stock: number;
  status: "active" | "inactive" | "sold_out";
  createdAt: string;
  updatedAt: string;
};

type Summary = {
  total: number;
  active: number;
  inactive: number;
  soldOut: number;
  totalStock: number;
};

type FormData = {
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  pointsRequired: string;
  stock: string;
  status: "active" | "inactive" | "sold_out";
};

const emptyForm: FormData = {
  name: "",
  slug: "",
  description: "",
  imageUrl: "",
  pointsRequired: "",
  stock: "",
  status: "active",
};

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    active: 0,
    inactive: 0,
    soldOut: 0,
    totalStock: 0,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  async function loadData() {
    try {
      setLoading(true);

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (statusFilter) {
        params.set("status", statusFilter);
      }

      const response = await fetch(`/api/admin/rewards?${params.toString()}`, {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal mengambil data rewards.");
      }

      setRewards(data.rewards || []);

      setSummary(
        data.summary || {
          total: 0,
          active: 0,
          inactive: 0,
          soldOut: 0,
          totalStock: 0,
        }
      );
    } catch (error) {
      console.error("LOAD ADMIN REWARDS ERROR:", error);
      setRewards([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [search, statusFilter]);

  function openAddModal() {
    setEditingReward(null);
    setForm(emptyForm);
    setErrorMessage("");
    setModalOpen(true);
  }

  function openEditModal(reward: Reward) {
    setEditingReward(reward);

    setForm({
      name: reward.name,
      slug: reward.slug,
      description: reward.description || "",
      imageUrl: reward.imageUrl || "",
      pointsRequired: String(reward.pointsRequired),
      stock: String(reward.stock),
      status: reward.status,
    });

    setErrorMessage("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingReward(null);
    setForm(emptyForm);
    setErrorMessage("");
  }

  function updateForm<K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSaving(true);
      setErrorMessage("");

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        imageUrl: form.imageUrl,
        pointsRequired: Number(form.pointsRequired),
        stock: Number(form.stock),
        status: form.status,
      };

      const response = await fetch("/api/admin/rewards", {
        method: editingReward ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingReward
            ? {
                id: editingReward.id,
                ...payload,
              }
            : payload
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menyimpan reward.");
      }

      closeModal();
      await loadData();
    } catch (error) {
      console.error("SAVE REWARD ERROR:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan reward."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(reward: Reward) {
    const confirmed = window.confirm(
      `Hapus reward "${reward.name}" secara permanen?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(reward.id);

      const response = await fetch(
        `/api/admin/rewards?id=${encodeURIComponent(reward.id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Gagal menghapus reward.");
      }

      await loadData();
    } catch (error) {
      console.error("DELETE REWARD ERROR:", error);

      window.alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus reward."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatPoints(points: number) {
    return `${points.toLocaleString("id-ID")} pts`;
  }

  function formatStatus(status: Reward["status"]) {
    if (status === "active") return "Active";
    if (status === "inactive") return "Inactive";
    return "Sold Out";
  }

  function getStatusClass(status: Reward["status"]) {
    if (status === "active") {
      return "bg-[#EAF3EC] text-[#3F7250]";
    }

    if (status === "sold_out") {
      return "bg-[#FFF1E5] text-[#A86432]";
    }

    return "bg-[#F0F1EF] text-[#69736C]";
  }

  return (
    <AdminShell>
      <main className="min-h-screen p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#7A8D7F]">
                Engagement
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#17382A]">
                Rewards
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6D7A72]">
                Kelola hadiah yang dapat ditukarkan peserta menggunakan
                points.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center justify-center rounded-full bg-[#17382A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#28513D]"
            >
              + Add Reward
            </button>
          </div>

          {/* Summary */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard
              label="Total Rewards"
              value={summary.total.toLocaleString("id-ID")}
            />

            <SummaryCard
              label="Active"
              value={summary.active.toLocaleString("id-ID")}
            />

            <SummaryCard
              label="Sold Out"
              value={summary.soldOut.toLocaleString("id-ID")}
            />

            <SummaryCard
              label="Total Stock"
              value={summary.totalStock.toLocaleString("id-ID")}
            />
          </div>

          {/* Filters */}
          <section className="mb-6 rounded-3xl border border-[#17382A]/10 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_200px]">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                  Search
                </label>

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search reward name, slug..."
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F8F7F2] px-4 py-3 text-sm text-[#17382A] outline-none transition placeholder:text-[#9AA59D] focus:border-[#17382A]/30 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
                  Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F8F7F2] px-4 py-3 text-sm text-[#17382A] outline-none"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>
            </div>
          </section>

          {/* Rewards */}
          <section className="rounded-3xl border border-[#17382A]/10 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="font-semibold text-[#17382A]">
                Reward Catalog
              </h2>

              <p className="mt-1 text-xs text-[#7A8D7F]">
                {rewards.length.toLocaleString("id-ID")} reward ditampilkan
              </p>
            </div>

            {loading ? (
              <div className="py-16 text-center text-sm text-[#7A8D7F]">
                Loading rewards...
              </div>
            ) : rewards.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#17382A]/10 py-16 text-center">
                <p className="font-medium text-[#17382A]">
                  Belum ada reward.
                </p>

                <p className="mt-1 text-sm text-[#7A8D7F]">
                  Tambahkan reward pertama untuk peserta JCWF.
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {rewards.map((reward) => (
                  <article
                    key={reward.id}
                    className="overflow-hidden rounded-3xl border border-[#17382A]/10 bg-[#FAF9F5]"
                  >
                    <div className="aspect-[16/10] overflow-hidden bg-[#EEF0EA]">
                      {reward.imageUrl ? (
                        <img
                          src={reward.imageUrl}
                          alt={reward.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm font-medium text-[#8A958D]">
                          No Image
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-[#17382A]">
                            {reward.name}
                          </h3>

                          <p className="mt-1 text-xs text-[#8A958D]">
                            /{reward.slug}
                          </p>
                        </div>

                        <span
                          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusClass(
                            reward.status
                          )}`}
                        >
                          {formatStatus(reward.status)}
                        </span>
                      </div>

                      <p className="min-h-[40px] text-sm leading-5 text-[#68756D]">
                        {reward.description || "No description."}
                      </p>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A958D]">
                            Required
                          </p>

                          <p className="mt-1 font-bold text-[#17382A]">
                            {formatPoints(reward.pointsRequired)}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8A958D]">
                            Stock
                          </p>

                          <p className="mt-1 font-bold text-[#17382A]">
                            {reward.stock.toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 flex gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(reward)}
                          className="flex-1 rounded-full border border-[#17382A]/10 bg-white px-4 py-2.5 text-sm font-semibold text-[#17382A] transition hover:bg-[#17382A] hover:text-white"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(reward)}
                          disabled={deletingId === reward.id}
                          className="rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {deletingId === reward.id ? "..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17382A]/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#17382A]/10 px-6 py-5">
              <div>
                <h2 className="text-xl font-bold text-[#17382A]">
                  {editingReward ? "Edit Reward" : "Add Reward"}
                </h2>

                <p className="mt-1 text-xs text-[#7A8D7F]">
                  {editingReward
                    ? "Perbarui informasi reward."
                    : "Tambahkan reward baru ke catalog."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F3EE] text-[#5F6D64] transition hover:bg-[#EAE9E3]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {errorMessage && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}

              <div className="grid gap-5 md:grid-cols-2">
                <FormField label="Reward Name">
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      updateForm("name", event.target.value)
                    }
                    placeholder="JCWF Tote Bag"
                    className="input-style"
                  />
                </FormField>

                <FormField label="Slug">
                  <input
                    required
                    value={form.slug}
                    onChange={(event) =>
                      updateForm("slug", event.target.value)
                    }
                    placeholder="jcwf-tote-bag"
                    className="input-style"
                  />
                </FormField>
              </div>

              <FormField label="Description">
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Deskripsi singkat reward..."
                  rows={3}
                  className="input-style resize-none"
                />
              </FormField>

              <FormField label="Image URL">
                <input
                  value={form.imageUrl}
                  onChange={(event) =>
                    updateForm("imageUrl", event.target.value)
                  }
                  placeholder="/images/reward-tote-bag.jpg"
                  className="input-style"
                />
              </FormField>

              <div className="grid gap-5 md:grid-cols-3">
                <FormField label="Points Required">
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.pointsRequired}
                    onChange={(event) =>
                      updateForm("pointsRequired", event.target.value)
                    }
                    placeholder="100"
                    className="input-style"
                  />
                </FormField>

                <FormField label="Stock">
                  <input
                    required
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(event) =>
                      updateForm("stock", event.target.value)
                    }
                    placeholder="20"
                    className="input-style"
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        "status",
                        event.target.value as FormData["status"]
                      )
                    }
                    className="input-style"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </FormField>
              </div>

              <div className="flex justify-end gap-3 border-t border-[#17382A]/10 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-full border border-[#17382A]/10 px-5 py-3 text-sm font-semibold text-[#17382A] transition hover:bg-[#F7F6F1]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full bg-[#17382A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#28513D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingReward
                      ? "Save Changes"
                      : "Add Reward"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx global>{`
        .input-style {
          width: 100%;
          border-radius: 1rem;
          border: 1px solid rgba(23, 56, 42, 0.1);
          background: #f8f7f2;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: #17382a;
          outline: none;
        }

        .input-style:focus {
          border-color: rgba(23, 56, 42, 0.3);
          background: white;
        }

        .input-style::placeholder {
          color: #9aa59d;
        }
      `}</style>
    </AdminShell>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-3xl border border-[#17382A]/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
        {label}
      </p>

      <p className="mt-3 text-2xl font-bold tracking-tight text-[#17382A]">
        {value}
      </p>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#7A8D7F]">
        {label}
      </label>

      {children}
    </div>
  );
}