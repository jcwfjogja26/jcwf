"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type Category = "FOOD" | "CRAFT" | "WELLNESS" | "LOCAL";
type Status = "active" | "sold_out" | "inactive";

type MarketplaceItem = {
  id: string;
  title: string;
  slug: string;
  category: Category;
  vendor: string;
  description: string | null;
  price: number;
  stock: number | null;
  image_url: string | null;
  status: Status;
  created_at: string;
};

type FormState = {
  title: string;
  slug: string;
  category: Category;
  vendor: string;
  description: string;
  price: string;
  stock: string;
  image_url: string;
  status: Status;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  category: "FOOD",
  vendor: "",
  description: "",
  price: "0",
  stock: "",
  image_url: "",
  status: "active",
};

const categoryLabels: Record<Category, string> = {
  FOOD: "Food",
  CRAFT: "Craft",
  WELLNESS: "Wellness",
  LOCAL: "Local",
};

const statusLabels: Record<Status, string> = {
  active: "Active",
  sold_out: "Sold Out",
  inactive: "Inactive",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function MarketplaceAdminPage() {
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<"ALL" | Category>("ALL");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | Status>("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<MarketplaceItem | null>(null);

  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] =
    useState<string | null>(null);

  async function loadItems() {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/marketplace");

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load marketplace.");
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(
          data.error || "Failed to load marketplace."
        );
      }

      setItems(data.items ?? []);
    } catch (error) {
      console.error(error);
      alert("Gagal mengambil data marketplace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  const stats = useMemo(() => {
    return {
      total: items.length,
      active: items.filter((item) => item.status === "active")
        .length,
      soldOut: items.filter(
        (item) => item.status === "sold_out"
      ).length,
      inactive: items.filter(
        (item) => item.status === "inactive"
      ).length,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.vendor.toLowerCase().includes(query) ||
        item.slug.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "ALL" ||
        item.category === categoryFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        item.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }, [items, search, categoryFilter, statusFilter]);

  function openAddModal() {
    setEditingItem(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(item: MarketplaceItem) {
    setEditingItem(item);

    setForm({
      title: item.title,
      slug: item.slug,
      category: item.category,
      vendor: item.vendor,
      description: item.description ?? "",
      price: String(item.price),
      stock:
        item.stock === null ? "" : String(item.stock),
      image_url: item.image_url ?? "",
      status: item.status,
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  }

  function updateForm(
    key: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      alert("Nama produk wajib diisi.");
      return;
    }

    if (!form.vendor.trim()) {
      alert("Vendor wajib diisi.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        title: form.title,
        slug: slugify(form.slug || form.title),
        category: form.category,
        vendor: form.vendor,
        description: form.description,
        price: Number(form.price) || 0,
        stock:
          form.stock.trim() === ""
            ? null
            : Number(form.stock),
        image_url: form.image_url,
        status: form.status,
      };

      const response = await fetch(
        editingItem
          ? `/api/admin/marketplace/${editingItem.id}`
          : "/api/admin/marketplace",
        {
          method: editingItem ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menyimpan produk."
        );
      }

      setModalOpen(false);
      setEditingItem(null);
      setForm(emptyForm);

      await loadItems();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan produk."
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(
    item: MarketplaceItem,
    status: Status
  ) {
    const message =
      status === "active"
        ? `Aktifkan "${item.title}"?`
        : status === "sold_out"
          ? `Tandai "${item.title}" sebagai Sold Out?`
          : `Nonaktifkan "${item.title}"?`;

    if (!window.confirm(message)) {
      return;
    }

    setProcessingId(item.id);

    try {
      const response = await fetch(
        `/api/admin/marketplace/${item.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: item.title,
            slug: item.slug,
            category: item.category,
            vendor: item.vendor,
            description: item.description,
            price: item.price,
            stock: item.stock,
            image_url: item.image_url,
            status,
          }),
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal mengubah status."
        );
      }

      await loadItems();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function handleDelete(item: MarketplaceItem) {
    const confirmed = window.confirm(
      `Hapus produk "${item.title}" secara permanen?`
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(item.id);

    try {
      const response = await fetch(
        `/api/admin/marketplace/${item.id}`,
        {
          method: "DELETE",
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Gagal menghapus produk."
        );
      }

      await loadItems();
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus produk."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
        <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-8 lg:px-10">
          {/* HEADER */}
          <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                JCWF 2026
              </p>

              <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">
                Marketplace
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#17382A]/60">
                Kelola produk, vendor, stok, dan status
                marketplace festival.
              </p>
            </div>

            <button
              type="button"
              onClick={openAddModal}
              className="rounded-2xl bg-[#17382A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#214A37]"
            >
              + Add Product
            </button>
          </div>

          {/* STATS */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Products"
              value={stats.total}
            />

            <StatCard
              label="Active"
              value={stats.active}
            />

            <StatCard
              label="Sold Out"
              value={stats.soldOut}
            />

            <StatCard
              label="Inactive"
              value={stats.inactive}
            />
          </div>

          {/* FILTER */}
          <section className="mb-6 rounded-[26px] border border-[#17382A]/10 bg-white p-4 shadow-[0_12px_35px_rgba(23,56,42,0.06)] md:p-5">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search product, vendor, or slug..."
                  className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8]/50 px-4 py-3 text-sm outline-none transition placeholder:text-[#17382A]/35 focus:border-[#17382A]/30"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(
                    event.target.value as
                      | "ALL"
                      | Category
                  )
                }
                className="rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8]/50 px-4 py-3 text-sm outline-none"
              >
                <option value="ALL">
                  All Categories
                </option>
                <option value="FOOD">Food</option>
                <option value="CRAFT">Craft</option>
                <option value="WELLNESS">
                  Wellness
                </option>
                <option value="LOCAL">Local</option>
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as
                      | "ALL"
                      | Status
                  )
                }
                className="rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8]/50 px-4 py-3 text-sm outline-none"
              >
                <option value="ALL">
                  All Status
                </option>
                <option value="active">Active</option>
                <option value="sold_out">
                  Sold Out
                </option>
                <option value="inactive">
                  Inactive
                </option>
              </select>
            </div>
          </section>

          {/* TABLE */}
          <section className="overflow-hidden rounded-[30px] border border-[#17382A]/10 bg-white shadow-[0_16px_45px_rgba(23,56,42,0.07)]">
            <div className="border-b border-[#17382A]/10 px-5 py-5 md:px-6">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Products
                </h2>

                <p className="mt-1 text-xs text-[#17382A]/50">
                  {filteredItems.length} product
                  {filteredItems.length !== 1
                    ? "s"
                    : ""}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-[#17382A]/50">
                Loading marketplace...
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="font-display text-xl font-semibold">
                  No products found
                </p>

                <p className="mt-2 text-sm text-[#17382A]/50">
                  Coba ubah pencarian atau filter.
                </p>
              </div>
            ) : (
              <>
                {/* DESKTOP */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full min-w-[1050px]">
                    <thead>
                      <tr className="border-b border-[#17382A]/10 bg-[#F7F3E8]/50 text-left">
                        <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#17382A]/50">
                          Product
                        </th>

                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#17382A]/50">
                          Vendor
                        </th>

                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#17382A]/50">
                          Category
                        </th>

                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#17382A]/50">
                          Price
                        </th>

                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#17382A]/50">
                          Stock
                        </th>

                        <th className="px-4 py-4 text-[11px] font-bold uppercase tracking-[0.12em] text-[#17382A]/50">
                          Status
                        </th>

                        <th className="px-6 py-4 text-right text-[11px] font-bold uppercase tracking-[0.12em] text-[#17382A]/50">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredItems.map((item) => (
                        <tr
                          key={item.id}
                          className="border-b border-[#17382A]/8 last:border-b-0"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#DCE9DC]">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-lg">
                                    ◇
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-semibold">
                                  {item.title}
                                </p>

                                <p className="mt-0.5 truncate text-xs text-[#17382A]/45">
                                  /{item.slug}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-5 text-sm">
                            {item.vendor}
                          </td>

                          <td className="px-4 py-5">
                            <span className="rounded-full bg-[#DCE9DC] px-3 py-1.5 text-xs font-semibold">
                              {categoryLabels[
                                item.category
                              ]}
                            </span>
                          </td>

                          <td className="px-4 py-5 text-sm font-semibold">
                            {formatPrice(item.price)}
                          </td>

                          <td className="px-4 py-5 text-sm">
                            {item.stock === null
                              ? "∞"
                              : item.stock}
                          </td>

                          <td className="px-4 py-5">
                            <StatusBadge
                              status={item.status}
                            />
                          </td>

                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(item)
                                }
                                className="rounded-xl border border-[#17382A]/10 px-3 py-2 text-xs font-semibold transition hover:bg-[#F7F3E8]"
                              >
                                Edit
                              </button>

                              {item.status !==
                                "active" && (
                                <button
                                  type="button"
                                  disabled={
                                    processingId ===
                                    item.id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      item,
                                      "active"
                                    )
                                  }
                                  className="rounded-xl bg-[#17382A] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                >
                                  Activate
                                </button>
                              )}

                              {item.status ===
                                "active" && (
                                <button
                                  type="button"
                                  disabled={
                                    processingId ===
                                    item.id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      item,
                                      "sold_out"
                                    )
                                  }
                                  className="rounded-xl bg-[#C89B3C] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                                >
                                  Sold Out
                                </button>
                              )}

                              {item.status ===
                                "active" && (
                                <button
                                  type="button"
                                  disabled={
                                    processingId ===
                                    item.id
                                  }
                                  onClick={() =>
                                    updateStatus(
                                      item,
                                      "inactive"
                                    )
                                  }
                                  className="rounded-xl border border-[#17382A]/10 px-3 py-2 text-xs font-semibold text-[#17382A]/70 disabled:opacity-50"
                                >
                                  Deactivate
                                </button>
                              )}

                              <button
                                type="button"
                                disabled={
                                  processingId === item.id
                                }
                                onClick={() =>
                                  handleDelete(item)
                                }
                                className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}
                <div className="divide-y divide-[#17382A]/8 lg:hidden">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-5"
                    >
                      <div className="flex gap-3">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#DCE9DC]">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl">
                              ◇
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">
                                {item.title}
                              </h3>

                              <p className="mt-0.5 text-xs text-[#17382A]/45">
                                {item.vendor}
                              </p>
                            </div>

                            <StatusBadge
                              status={item.status}
                            />
                          </div>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-[#DCE9DC] px-2.5 py-1 font-semibold">
                              {categoryLabels[
                                item.category
                              ]}
                            </span>

                            <span className="rounded-full bg-[#F7F3E8] px-2.5 py-1 font-semibold">
                              {formatPrice(
                                item.price
                              )}
                            </span>

                            <span className="rounded-full bg-[#F7F3E8] px-2.5 py-1 font-semibold">
                              Stock:{" "}
                              {item.stock === null
                                ? "∞"
                                : item.stock}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditModal(item)
                          }
                          className="rounded-xl border border-[#17382A]/10 px-3 py-2 text-xs font-semibold"
                        >
                          Edit
                        </button>

                        {item.status !== "active" && (
                          <button
                            type="button"
                            disabled={
                              processingId === item.id
                            }
                            onClick={() =>
                              updateStatus(
                                item,
                                "active"
                              )
                            }
                            className="rounded-xl bg-[#17382A] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            Activate
                          </button>
                        )}

                        {item.status === "active" && (
                          <>
                            <button
                              type="button"
                              disabled={
                                processingId === item.id
                              }
                              onClick={() =>
                                updateStatus(
                                  item,
                                  "sold_out"
                                )
                              }
                              className="rounded-xl bg-[#C89B3C] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              Sold Out
                            </button>

                            <button
                              type="button"
                              disabled={
                                processingId === item.id
                              }
                              onClick={() =>
                                updateStatus(
                                  item,
                                  "inactive"
                                )
                              }
                              className="rounded-xl border border-[#17382A]/10 px-3 py-2 text-xs font-semibold disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          </>
                        )}

                        <button
                          type="button"
                          disabled={
                            processingId === item.id
                          }
                          onClick={() =>
                            handleDelete(item)
                          }
                          className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>
        </div>

        {/* MODAL */}
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#17382A]/40 p-4 backdrop-blur-sm">
            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white shadow-2xl">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#17382A]/10 bg-white px-6 py-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#C89B3C]">
                    Marketplace
                  </p>

                  <h2 className="mt-1 font-display text-2xl font-semibold">
                    {editingItem
                      ? "Edit Product"
                      : "Add Product"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeModal}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F3E8] text-lg"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Product Name"
                    required
                    value={form.title}
                    onChange={(value) =>
                      updateForm("title", value)
                    }
                    placeholder="Contoh: Wedang Uwuh"
                  />

                  <Field
                    label="Vendor"
                    required
                    value={form.vendor}
                    onChange={(value) =>
                      updateForm("vendor", value)
                    }
                    placeholder="Nama vendor"
                  />
                </div>

                <Field
                  label="Slug"
                  value={form.slug}
                  onChange={(value) =>
                    updateForm("slug", value)
                  }
                  placeholder="wedang-uwuh"
                  hint="Kosongkan untuk generate otomatis dari nama produk."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Category"
                    value={form.category}
                    onChange={(value) =>
                      updateForm(
                        "category",
                        value
                      )
                    }
                    options={[
                      ["FOOD", "Food"],
                      ["CRAFT", "Craft"],
                      [
                        "WELLNESS",
                        "Wellness",
                      ],
                      ["LOCAL", "Local"],
                    ]}
                  />

                  <SelectField
                    label="Status"
                    value={form.status}
                    onChange={(value) =>
                      updateForm(
                        "status",
                        value
                      )
                    }
                    options={[
                      [
                        "active",
                        "Active",
                      ],
                      [
                        "sold_out",
                        "Sold Out",
                      ],
                      [
                        "inactive",
                        "Inactive",
                      ],
                    ]}
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Price"
                    type="number"
                    value={form.price}
                    onChange={(value) =>
                      updateForm(
                        "price",
                        value
                      )
                    }
                    placeholder="0"
                  />

                  <Field
                    label="Stock"
                    type="number"
                    value={form.stock}
                    onChange={(value) =>
                      updateForm(
                        "stock",
                        value
                      )
                    }
                    placeholder="Kosongkan jika unlimited"
                  />
                </div>

                <Field
                  label="Image URL"
                  value={form.image_url}
                  onChange={(value) =>
                    updateForm(
                      "image_url",
                      value
                    )
                  }
                  placeholder="/images/product.jpg"
                />

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Description
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    rows={4}
                    placeholder="Deskripsi singkat produk..."
                    className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8]/40 px-4 py-3 text-sm outline-none transition placeholder:text-[#17382A]/35 focus:border-[#17382A]/30"
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="rounded-2xl border border-[#17382A]/10 px-5 py-3 text-sm font-semibold"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-2xl bg-[#17382A] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : editingItem
                        ? "Save Changes"
                        : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AdminShell>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[24px] border border-[#17382A]/10 bg-white p-5 shadow-[0_10px_30px_rgba(23,56,42,0.05)]">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#17382A]/45">
        {label}
      </p>

      <p className="mt-3 font-display text-3xl font-semibold">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  const styles: Record<Status, string> = {
    active: "bg-[#DCE9DC] text-[#17382A]",
    sold_out: "bg-[#F5E7C6] text-[#8A651C]",
    inactive: "bg-[#EFEFEA] text-[#17382A]/50",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        required={required}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8]/40 px-4 py-3 text-sm outline-none transition placeholder:text-[#17382A]/35 focus:border-[#17382A]/30"
      />

      {hint && (
        <p className="mt-1.5 text-xs text-[#17382A]/45">
          {hint}
        </p>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8]/40 px-4 py-3 text-sm outline-none focus:border-[#17382A]/30"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}