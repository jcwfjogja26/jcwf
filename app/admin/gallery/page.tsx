"use client";

import { useEffect, useMemo, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

type GalleryPost = {
  id: string;
  imageUrl: string | null;
  imagePath: string | null;
  caption: string | null;
  status: "visible" | "hidden" | "deleted";
  createdAt: string;
  updatedAt: string;
  participant: {
    id: string;
    fullName: string;
    reconnectId: string;
    email: string;
  } | null;
};

type Summary = {
  total: number;
  visible: number;
  hidden: number;
  deleted: number;
};

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
  { value: "deleted", label: "Deleted" },
];

export default function AdminGalleryPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [summary, setSummary] = useState<Summary>({
    total: 0,
    visible: 0,
    hidden: 0,
    deleted: 0,
  });

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingPost, setEditingPost] = useState<GalleryPost | null>(null);
  const [editCaption, setEditCaption] = useState("");

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadGallery() {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) {
        params.set("search", search.trim());
      }

      if (status) {
        params.set("status", status);
      }

      const response = await fetch(
        `/api/admin/gallery?${params.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal mengambil data gallery."
        );
      }

      setPosts(data.posts || []);
      setSummary(
        data.summary || {
          total: 0,
          visible: 0,
          hidden: 0,
          deleted: 0,
        }
      );
    } catch (error) {
      console.error("LOAD ADMIN GALLERY ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil data gallery."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadGallery();
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, status]);

  function openEdit(post: GalleryPost) {
    setEditingPost(post);
    setEditCaption(post.caption || "");
  }

  function closeEdit() {
    if (saving) return;

    setEditingPost(null);
    setEditCaption("");
  }

  async function updatePost(
    id: string,
    updates: {
      caption?: string;
      status?: "visible" | "hidden" | "deleted";
    }
  ) {
    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/admin/gallery", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          ...updates,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal memperbarui gallery."
        );
      }

      setPosts((current) =>
        current.map((post) =>
          post.id === id ? data.post : post
        )
      );

      setSummary((current) => {
        const next = {
          total: current.total,
          visible: current.visible,
          hidden: current.hidden,
          deleted: current.deleted,
        };

        const oldPost = posts.find((post) => post.id === id);
        const newPost = data.post as GalleryPost;

        if (oldPost && oldPost.status !== newPost.status) {
          next[oldPost.status] -= 1;
          next[newPost.status] += 1;
        }

        return next;
      });

      return true;
    } catch (error) {
      console.error("UPDATE ADMIN GALLERY ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal memperbarui gallery."
      );

      return false;
    } finally {
      setSaving(false);
    }
  }

  async function saveCaption() {
    if (!editingPost) return;

    const success = await updatePost(editingPost.id, {
      caption: editCaption,
    });

    if (success) {
      setEditingPost(null);
      setEditCaption("");
    }
  }

  async function toggleVisibility(post: GalleryPost) {
    await updatePost(post.id, {
      status:
        post.status === "visible"
          ? "hidden"
          : "visible",
    });
  }

  async function deletePost(post: GalleryPost) {
    const confirmed = window.confirm(
      `Hapus foto dari ${post.participant?.fullName || "participant"}?\n\nFoto dan file di storage akan dihapus permanen.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(post.id);
      setError("");

      const response = await fetch("/api/admin/gallery", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: post.id,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Gagal menghapus gallery."
        );
      }

      setPosts((current) =>
        current.filter((item) => item.id !== post.id)
      );

      setSummary((current) => ({
        ...current,
        total: Math.max(0, current.total - 1),
        [post.status]: Math.max(0, current[post.status] - 1),
      }));
    } catch (error) {
      console.error("DELETE ADMIN GALLERY ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus gallery."
      );
    } finally {
      setDeletingId(null);
    }
  }

  const visiblePosts = useMemo(() => posts, [posts]);

  return (
    <AdminShell>
      <div className="min-h-screen px-6 py-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#78907F]">
                Experience
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-[#17382A]">
                Gallery
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#66776E]">
                Kelola foto yang diunggah participant dan moderasi
                konten gallery JCWF.
              </p>
            </div>

            <button
              type="button"
              onClick={loadGallery}
              className="rounded-xl border border-[#17382A]/10 bg-white px-5 py-3 text-sm font-semibold text-[#17382A] transition hover:bg-[#17382A] hover:text-white"
            >
              Refresh
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Total Upload"
              value={summary.total}
            />

            <SummaryCard
              label="Visible"
              value={summary.visible}
            />

            <SummaryCard
              label="Hidden"
              value={summary.hidden}
            />

            <SummaryCard
              label="Deleted"
              value={summary.deleted}
            />
          </div>

          {/* Filters */}
          <div className="mb-6 rounded-2xl border border-[#17382A]/8 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search participant, Reconnect ID, email, caption..."
                  className="w-full rounded-xl border border-[#17382A]/10 bg-[#FAF9F4] px-4 py-3 text-sm text-[#17382A] outline-none transition placeholder:text-[#9AA7A0] focus:border-[#17382A]/30 focus:bg-white"
                />
              </div>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value)
                }
                className="rounded-xl border border-[#17382A]/10 bg-[#FAF9F4] px-4 py-3 text-sm font-medium text-[#17382A] outline-none focus:border-[#17382A]/30"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="rounded-2xl border border-[#17382A]/8 bg-white px-6 py-16 text-center text-sm text-[#66776E]">
              Loading gallery...
            </div>
          ) : visiblePosts.length === 0 ? (
            <div className="rounded-2xl border border-[#17382A]/8 bg-white px-6 py-16 text-center">
              <p className="text-base font-semibold text-[#17382A]">
                Belum ada data gallery.
              </p>

              <p className="mt-2 text-sm text-[#78877F]">
                Upload participant akan muncul di sini.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visiblePosts.map((post) => (
                <GalleryCard
                  key={post.id}
                  post={post}
                  deleting={deletingId === post.id}
                  saving={saving}
                  onEdit={() => openEdit(post)}
                  onToggleVisibility={() =>
                    toggleVisibility(post)
                  }
                  onDelete={() => deletePost(post)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Caption Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17382A]/45 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <h2 className="text-xl font-bold text-[#17382A]">
                Edit Caption
              </h2>

              <p className="mt-1 text-sm text-[#78877F]">
                {editingPost.participant?.fullName ||
                  "Participant"}
              </p>
            </div>

            {editingPost.imageUrl && (
              <div className="mb-5 overflow-hidden rounded-2xl bg-[#F4F1E8]">
                <img
                  src={editingPost.imageUrl}
                  alt={
                    editingPost.caption ||
                    "Gallery image"
                  }
                  className="max-h-72 w-full object-cover"
                />
              </div>
            )}

            <textarea
              value={editCaption}
              onChange={(event) =>
                setEditCaption(event.target.value)
              }
              maxLength={300}
              rows={5}
              placeholder="Tulis caption..."
              className="w-full resize-none rounded-2xl border border-[#17382A]/10 bg-[#FAF9F4] px-4 py-3 text-sm text-[#17382A] outline-none focus:border-[#17382A]/30 focus:bg-white"
            />

            <div className="mt-2 text-right text-xs text-[#8A9890]">
              {editCaption.length}/300
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                disabled={saving}
                className="rounded-xl border border-[#17382A]/10 px-5 py-3 text-sm font-semibold text-[#17382A] transition hover:bg-[#F5F2E9] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={saveCaption}
                disabled={saving}
                className="rounded-xl bg-[#17382A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#214C39] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Caption"}
              </button>
            </div>
          </div>
        </div>
      )}
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
    <div className="rounded-2xl border border-[#17382A]/8 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-[#78877F]">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold tracking-tight text-[#17382A]">
        {value}
      </p>
    </div>
  );
}

function GalleryCard({
  post,
  deleting,
  saving,
  onEdit,
  onToggleVisibility,
  onDelete,
}: {
  post: GalleryPost;
  deleting: boolean;
  saving: boolean;
  onEdit: () => void;
  onToggleVisibility: () => void;
  onDelete: () => void;
}) {
  const statusLabel = {
    visible: "Visible",
    hidden: "Hidden",
    deleted: "Deleted",
  }[post.status];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#17382A]/8 bg-white shadow-sm">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F3F0E7]">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt={post.caption || "Gallery image"}
            className={`h-full w-full object-cover transition ${
              post.status === "hidden"
                ? "opacity-45 grayscale"
                : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[#8A9890]">
            No image
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${
              post.status === "visible"
                ? "bg-[#E8F2EB] text-[#286040]"
                : post.status === "hidden"
                  ? "bg-[#F3EEDB] text-[#856C22]"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="mb-3">
          <p className="font-semibold text-[#17382A]">
            {post.participant?.fullName ||
              "Unknown Participant"}
          </p>

          <p className="mt-1 text-xs text-[#78877F]">
            {post.participant?.reconnectId || "-"}
            {post.participant?.email
              ? ` • ${post.participant.email}`
              : ""}
          </p>
        </div>

        <div className="mb-4 min-h-[48px]">
          <p className="line-clamp-2 text-sm leading-6 text-[#586A61]">
            {post.caption || "No caption"}
          </p>
        </div>

        <p className="mb-4 text-xs text-[#9AA59F]">
          {formatDate(post.createdAt)}
        </p>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onEdit}
            disabled={saving || deleting}
            className="rounded-xl border border-[#17382A]/10 px-3 py-2.5 text-xs font-semibold text-[#17382A] transition hover:bg-[#F5F2E9] disabled:opacity-50"
          >
            Edit Caption
          </button>

          <button
            type="button"
            onClick={onToggleVisibility}
            disabled={saving || deleting || post.status === "deleted"}
            className="rounded-xl border border-[#17382A]/10 px-3 py-2.5 text-xs font-semibold text-[#17382A] transition hover:bg-[#F5F2E9] disabled:opacity-50"
          >
            {post.status === "visible"
              ? "Hide"
              : "Show"}
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={saving || deleting}
            className="col-span-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}