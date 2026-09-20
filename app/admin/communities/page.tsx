"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";

type Community = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  image_url: string | null;
  instagram_url: string | null;
  website_url: string | null;
  status: "active" | "inactive";
  member_count: number;
  created_at: string;
};

type Filter = "all" | "active" | "inactive";

const categories = [
  "Wellness",
  "Culture",
  "Community",
  "Creative",
  "Nature",
  "Culinary",
  "Other",
];

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<
    Community[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [showModal, setShowModal] = useState(false);
  const [editingCommunity, setEditingCommunity] =
    useState<Community | null>(null);

  const [processingId, setProcessingId] =
    useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "Wellness",
    image_url: "",
    instagram_url: "",
    website_url: "",
    status: "active",
  });

  async function fetchCommunities() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/admin/communities",
        {
          cache: "no-store",
        }
      );

      if (response.status === 401) {
        window.location.href = "/admin/login";
        return;
      }

      if (!response.ok) {
        throw new Error(
          "Gagal mengambil data community."
        );
      }

      const data = await response.json();

      setCommunities(data.communities ?? []);
    } catch (error) {
      console.error(
        "FETCH ADMIN COMMUNITIES ERROR:",
        error
      );

      alert("Gagal mengambil data community.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCommunities();
  }, []);

  const filteredCommunities = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return communities.filter((community) => {
      const matchesSearch =
        !keyword ||
        community.name
          .toLowerCase()
          .includes(keyword) ||
        community.category
          .toLowerCase()
          .includes(keyword) ||
        community.slug
          .toLowerCase()
          .includes(keyword);

      const matchesFilter =
        filter === "all" ||
        community.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [communities, search, filter]);

  const stats = useMemo(() => {
    return {
      total: communities.length,
      active: communities.filter(
        (item) => item.status === "active"
      ).length,
      inactive: communities.filter(
        (item) => item.status === "inactive"
      ).length,
      members: communities.reduce(
        (sum, item) => sum + item.member_count,
        0
      ),
    };
  }, [communities]);

  function resetForm() {
    setForm({
      name: "",
      slug: "",
      description: "",
      category: "Wellness",
      image_url: "",
      instagram_url: "",
      website_url: "",
      status: "active",
    });
  }

  function openCreateModal() {
    setEditingCommunity(null);
    resetForm();
    setShowModal(true);
  }

  function openEditModal(community: Community) {
    setEditingCommunity(community);

    setForm({
      name: community.name,
      slug: community.slug,
      description: community.description ?? "",
      category: community.category,
      image_url: community.image_url ?? "",
      instagram_url:
        community.instagram_url ?? "",
      website_url:
        community.website_url ?? "",
      status: community.status,
    });

    setShowModal(true);
  }

  function closeModal() {
    if (processingId) return;

    setShowModal(false);
    setEditingCommunity(null);
    resetForm();
  }

  function generateSlug(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name.trim()) {
      alert("Nama community wajib diisi.");
      return;
    }

    if (!form.slug.trim()) {
      alert("Slug community wajib diisi.");
      return;
    }

    if (!form.category.trim()) {
      alert("Category wajib diisi.");
      return;
    }

    try {
      setProcessingId(
        editingCommunity?.id ?? "create"
      );

      const response = await fetch(
        editingCommunity
          ? `/api/admin/communities/${editingCommunity.id}`
          : "/api/admin/communities",
        {
          method: editingCommunity
            ? "PATCH"
            : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...form,
            slug: generateSlug(form.slug),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menyimpan community."
        );
      }

      closeModal();
      await fetchCommunities();

      alert(
        editingCommunity
          ? "Community berhasil diperbarui."
          : "Community berhasil ditambahkan."
      );
    } catch (error) {
      console.error(
        "SAVE COMMUNITY ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan community."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function toggleStatus(
    community: Community
  ) {
    const nextStatus =
      community.status === "active"
        ? "inactive"
        : "active";

    const confirmed = window.confirm(
      `${nextStatus === "active" ? "Activate" : "Deactivate"} "${community.name}"?`
    );

    if (!confirmed) return;

    try {
      setProcessingId(community.id);

      const response = await fetch(
        `/api/admin/communities/${community.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengubah status."
        );
      }

      await fetchCommunities();
    } catch (error) {
      console.error(
        "TOGGLE COMMUNITY ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengubah status."
      );
    } finally {
      setProcessingId(null);
    }
  }

  async function deleteCommunity(
    community: Community
  ) {
    const confirmed = window.confirm(
      `Hapus community "${community.name}"?\n\nData community akan dihapus dari database.`
    );

    if (!confirmed) return;

    try {
      setProcessingId(community.id);

      const response = await fetch(
        `/api/admin/communities/${community.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menghapus community."
        );
      }

      await fetchCommunities();

      alert(
        "Community berhasil dihapus."
      );
    } catch (error) {
      console.error(
        "DELETE COMMUNITY ERROR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "Gagal menghapus community."
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <AdminShell>
      <main className="min-h-screen bg-[#F7F3E8] text-[#17382A]">
        {/* HEADER */}
        <header className="border-b border-[#17382A]/10 bg-[#F7F3E8]">
          <div className="mx-auto max-w-7xl px-6 py-7 lg:px-10">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C]">
                  JCWF 2026
                </p>

                <h1 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
                  Communities
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-[#17382A]/50">
                  Manage communities, member
                  counts, visibility, and community
                  information.
                </p>
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                className="inline-flex h-12 items-center justify-center rounded-full bg-[#17382A] px-6 text-sm font-semibold text-white transition hover:bg-[#234F40]"
              >
                + Add Community
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-6 py-8 lg:px-10">
          {/* STATS */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Communities"
              value={stats.total}
              icon="◎"
            />

            <StatCard
              label="Active"
              value={stats.active}
              icon="✓"
            />

            <StatCard
              label="Inactive"
              value={stats.inactive}
              icon="—"
            />

            <StatCard
              label="Total Members"
              value={stats.members}
              icon="◌"
            />
          </div>

          {/* SEARCH + FILTER */}
          <div className="mt-8 rounded-[26px] border border-[#17382A]/10 bg-white p-4 shadow-[0_8px_30px_rgba(23,56,42,0.05)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#17382A]/30">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search community, category, or slug..."
                  className="h-12 w-full rounded-2xl border border-[#17382A]/10 bg-[#F7F3E8] pl-10 pr-4 text-sm outline-none transition placeholder:text-[#17382A]/35 focus:border-[#C89B3C]"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto">
                {(
                  [
                    "all",
                    "active",
                    "inactive",
                  ] as Filter[]
                ).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setFilter(item)
                    }
                    className={`whitespace-nowrap rounded-full px-5 py-2.5 text-xs font-semibold capitalize transition ${
                      filter === item
                        ? "bg-[#17382A] text-white"
                        : "bg-[#F7F3E8] text-[#17382A]/55 hover:text-[#17382A]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CONTENT */}
          <div className="mt-6 overflow-hidden rounded-[28px] border border-[#17382A]/10 bg-white shadow-[0_8px_30px_rgba(23,56,42,0.05)]">
            {loading ? (
              <LoadingState />
            ) : filteredCommunities.length ===
              0 ? (
              <EmptyState
                onAdd={openCreateModal}
              />
            ) : (
              <>
                {/* DESKTOP TABLE */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#17382A]/10 bg-[#F7F3E8]/60">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#17382A]/40">
                          Community
                        </th>

                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#17382A]/40">
                          Category
                        </th>

                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#17382A]/40">
                          Members
                        </th>

                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.16em] text-[#17382A]/40">
                          Status
                        </th>

                        <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.16em] text-[#17382A]/40">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredCommunities.map(
                        (community) => (
                          <tr
                            key={community.id}
                            className="border-b border-[#17382A]/8 last:border-0"
                          >
                            {/* COMMUNITY */}
                            <td className="px-6 py-5">
                              <div className="flex items-center gap-4">
                                <CommunityImage
                                  community={
                                    community
                                  }
                                />

                                <div className="min-w-0">
                                  <p className="truncate font-semibold">
                                    {
                                      community.name
                                    }
                                  </p>

                                  <p className="mt-1 truncate text-xs text-[#17382A]/40">
                                    /
                                    {
                                      community.slug
                                    }
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}
                            <td className="px-6 py-5">
                              <span className="inline-flex rounded-full bg-[#DCE9DC] px-3 py-1.5 text-xs font-semibold text-[#17382A]">
                                {
                                  community.category
                                }
                              </span>
                            </td>

                            {/* MEMBERS */}
                            <td className="px-6 py-5">
                              <div>
                                <p className="text-sm font-semibold">
                                  {
                                    community.member_count
                                  }
                                </p>

                                <p className="mt-1 text-[11px] text-[#17382A]/35">
                                  registered
                                  members
                                </p>
                              </div>
                            </td>

                            {/* STATUS */}
                            <td className="px-6 py-5">
                              <StatusBadge
                                status={
                                  community.status
                                }
                              />
                            </td>

                            {/* ACTIONS */}
                            <td className="px-6 py-5">
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openEditModal(
                                      community
                                    )
                                  }
                                  className="rounded-full border border-[#17382A]/10 px-4 py-2 text-xs font-semibold transition hover:bg-[#F7F3E8]"
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    processingId ===
                                    community.id
                                  }
                                  onClick={() =>
                                    toggleStatus(
                                      community
                                    )
                                  }
                                  className="rounded-full bg-[#17382A] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#234F40] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {community.status ===
                                  "active"
                                    ? "Deactivate"
                                    : "Activate"}
                                </button>

                                <button
                                  type="button"
                                  disabled={
                                    processingId ===
                                    community.id
                                  }
                                  onClick={() =>
                                    deleteCommunity(
                                      community
                                    )
                                  }
                                  className="rounded-full border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="divide-y divide-[#17382A]/8 md:hidden">
                  {filteredCommunities.map(
                    (community) => (
                      <div
                        key={community.id}
                        className="p-5"
                      >
                        <div className="flex gap-4">
                          <CommunityImage
                            community={
                              community
                            }
                            mobile
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate font-semibold">
                                  {
                                    community.name
                                  }
                                </h3>

                                <p className="mt-1 text-xs text-[#17382A]/40">
                                  {
                                    community.category
                                  }
                                </p>
                              </div>

                              <StatusBadge
                                status={
                                  community.status
                                }
                              />
                            </div>

                            <p className="mt-3 text-sm text-[#17382A]/50">
                              {
                                community.member_count
                              }{" "}
                              members
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                community
                              )
                            }
                            className="rounded-xl border border-[#17382A]/10 py-2.5 text-xs font-semibold transition hover:bg-[#F7F3E8]"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              processingId ===
                              community.id
                            }
                            onClick={() =>
                              toggleStatus(
                                community
                              )
                            }
                            className="rounded-xl bg-[#17382A] py-2.5 text-xs font-semibold text-white disabled:opacity-50"
                          >
                            {community.status ===
                            "active"
                              ? "Deactivate"
                              : "Activate"}
                          </button>

                          <button
                            type="button"
                            disabled={
                              processingId ===
                              community.id
                            }
                            onClick={() =>
                              deleteCommunity(
                                community
                              )
                            }
                            className="rounded-xl border border-red-200 py-2.5 text-xs font-semibold text-red-600 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17382A]/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C89B3C]">
                    JCWF Community
                  </p>

                  <h2 className="mt-2 font-display text-3xl tracking-tight">
                    {editingCommunity
                      ? "Edit Community"
                      : "Add Community"}
                  </h2>

                  <p className="mt-2 text-sm text-[#17382A]/45">
                    {editingCommunity
                      ? "Update community information and visibility."
                      : "Add a new community to JCWF."}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={!!processingId}
                  onClick={closeModal}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F7F3E8] text-xl transition hover:bg-[#EDE6D6] disabled:opacity-50"
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-7 space-y-5"
              >
                {/* NAME */}
                <div>
                  <label className="text-xs font-semibold text-[#17382A]">
                    Community Name
                  </label>

                  <input
                    required
                    value={form.name}
                    onChange={(event) => {
                      const name =
                        event.target.value;

                      setForm((current) => ({
                        ...current,
                        name,
                        ...(editingCommunity
                          ? {}
                          : {
                              slug: generateSlug(
                                name
                              ),
                            }),
                      }));
                    }}
                    className="mt-2 h-12 w-full rounded-2xl border border-[#17382A]/10 px-4 text-sm outline-none transition focus:border-[#C89B3C]"
                    placeholder="Jogja Yoga Community"
                  />
                </div>

                {/* SLUG */}
                <div>
                  <label className="text-xs font-semibold text-[#17382A]">
                    Slug
                  </label>

                  <input
                    required
                    value={form.slug}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        slug: generateSlug(
                          event.target.value
                        ),
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-[#17382A]/10 px-4 text-sm outline-none transition focus:border-[#C89B3C]"
                    placeholder="jogja-yoga-community"
                  />

                  <p className="mt-1.5 text-[11px] text-[#17382A]/35">
                    Used for the community URL.
                  </p>
                </div>

                {/* CATEGORY + STATUS */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[#17382A]">
                      Category
                    </label>

                    <select
                      value={form.category}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          category:
                            event.target.value,
                        }))
                      }
                      className="mt-2 h-12 w-full rounded-2xl border border-[#17382A]/10 bg-white px-4 text-sm outline-none transition focus:border-[#C89B3C]"
                    >
                      {categories.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {category}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#17382A]">
                      Status
                    </label>

                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status:
                            event.target.value,
                        }))
                      }
                      className="mt-2 h-12 w-full rounded-2xl border border-[#17382A]/10 bg-white px-4 text-sm outline-none transition focus:border-[#C89B3C]"
                    >
                      <option value="active">
                        Active
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>
                    </select>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-xs font-semibold text-[#17382A]">
                    Description
                  </label>

                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description:
                          event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-2xl border border-[#17382A]/10 px-4 py-3 text-sm outline-none transition focus:border-[#C89B3C]"
                    placeholder="Describe this community..."
                  />
                </div>

                {/* IMAGE */}
                <div>
                  <label className="text-xs font-semibold text-[#17382A]">
                    Image URL
                  </label>

                  <input
                    value={form.image_url}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        image_url:
                          event.target.value,
                      }))
                    }
                    className="mt-2 h-12 w-full rounded-2xl border border-[#17382A]/10 px-4 text-sm outline-none transition focus:border-[#C89B3C]"
                    placeholder="https://..."
                  />
                </div>

                {/* SOCIAL */}
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-semibold text-[#17382A]">
                      Instagram URL
                    </label>

                    <input
                      value={
                        form.instagram_url
                      }
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          instagram_url:
                            event.target.value,
                        }))
                      }
                      className="mt-2 h-12 w-full rounded-2xl border border-[#17382A]/10 px-4 text-sm outline-none transition focus:border-[#C89B3C]"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#17382A]">
                      Website URL
                    </label>

                    <input
                      value={form.website_url}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          website_url:
                            event.target.value,
                        }))
                      }
                      className="mt-2 h-12 w-full rounded-2xl border border-[#17382A]/10 px-4 text-sm outline-none transition focus:border-[#C89B3C]"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                {/* BUTTONS */}
                <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    disabled={!!processingId}
                    onClick={closeModal}
                    className="rounded-full border border-[#17382A]/10 px-6 py-3 text-sm font-semibold transition hover:bg-[#F7F3E8] disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={!!processingId}
                    className="rounded-full bg-[#17382A] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#234F40] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {processingId
                      ? "Saving..."
                      : editingCommunity
                      ? "Save Changes"
                      : "Add Community"}
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

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="rounded-[26px] border border-[#17382A]/10 bg-white p-6 shadow-[0_8px_30px_rgba(23,56,42,0.05)]">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#17382A]/40">
          {label}
        </p>

        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE9DC] text-sm text-[#17382A]">
          {icon}
        </span>
      </div>

      <p className="mt-4 font-display text-4xl tracking-tight">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: "active" | "inactive";
}) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${
        status === "active"
          ? "bg-[#DCE9DC] text-[#17382A]"
          : "bg-[#EEEAE0] text-[#17382A]/50"
      }`}
    >
      {status}
    </span>
  );
}

function CommunityImage({
  community,
  mobile = false,
}: {
  community: Community;
  mobile?: boolean;
}) {
  const size = mobile
    ? "h-14 w-14"
    : "h-12 w-12";

  return (
    <div
      className={`${size} shrink-0 overflow-hidden rounded-2xl bg-[#DCE9DC]`}
    >
      {community.image_url ? (
        <img
          src={community.image_url}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center font-display text-xs text-[#17382A]/30">
          JCWF
        </div>
      )}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="p-16 text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#17382A]/10 border-t-[#17382A]" />

      <p className="mt-5 text-sm text-[#17382A]/45">
        Loading communities...
      </p>
    </div>
  );
}

function EmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="p-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#DCE9DC] text-2xl text-[#17382A]/50">
        ◎
      </div>

      <h2 className="mt-5 font-display text-2xl">
        No communities found
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#17382A]/45">
        Try another search or add a new
        community to JCWF.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-6 rounded-full bg-[#17382A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#234F40]"
      >
        + Add Community
      </button>
    </div>
  );
}