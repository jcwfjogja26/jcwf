"use client";

import { useEffect, useState } from "react";

type Story = {
  id: string;
  reflection: string;
  isShared: boolean;
  shareToken?: string | null;
  sharedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export default function MyStoryCard() {
  const [stories, setStories] = useState<Story[]>([]);
  const [reflection, setReflection] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadStories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/my-story", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal mengambil My Stories."
        );
      }

      setStories(data.stories || []);
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengambil My Stories."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStories();
  }, []);

  function handleNewStory() {
    setReflection("");
    setEditingId(null);
    setShareUrl("");
    setCopiedId(null);
    setError("");
    setShowForm(true);
  }

  function handleEdit(story: Story) {
    setReflection(story.reflection);
    setEditingId(story.id);
    setShareUrl("");
    setCopiedId(null);
    setError("");
    setShowForm(true);
  }

  function handleCancel() {
    setReflection("");
    setEditingId(null);
    setShareUrl("");
    setCopiedId(null);
    setError("");
    setShowForm(false);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const trimmedReflection = reflection.trim();

    if (!trimmedReflection) {
      setError("Tulis sedikit tentang pengalamanmu dulu.");
      return;
    }

    if (trimmedReflection.length > 1000) {
      setError("Reflection maksimal 1000 karakter.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await fetch("/api/my-story", {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingId
            ? {
                storyId: editingId,
                reflection: trimmedReflection,
              }
            : {
                reflection: trimmedReflection,
              }
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal menyimpan My Story."
        );
      }

      if (editingId) {
        setStories((current) =>
          current.map((story) =>
            story.id === editingId ? data.story : story
          )
        );
      } else {
        setStories((current) => [
          data.story,
          ...current,
        ]);
      }

      handleCancel();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal menyimpan My Story."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(storyId: string) {
    const confirmed = window.confirm(
      "Hapus story ini? Story yang dihapus tidak akan tampil lagi."
    );

    if (!confirmed) return;

    try {
      setDeletingId(storyId);
      setError("");

      const response = await fetch("/api/my-story", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          storyId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Gagal menghapus story."
        );
      }

      setStories((current) =>
        current.filter((story) => story.id !== storyId)
      );
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus story."
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleShare(storyId: string) {
    try {
      setSharingId(storyId);
      setError("");
      setShareUrl("");
      setCopiedId(null);

      const response = await fetch(
        "/api/my-story/share",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            storyId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal membuat link sharing."
        );
      }

      setShareUrl(data.shareUrl);

      setStories((current) =>
        current.map((story) =>
          story.id === storyId
            ? {
                ...story,
                isShared: true,
                shareToken: data.shareToken,
                sharedAt:
                  story.sharedAt ||
                  new Date().toISOString(),
              }
            : story
        )
      );

      if (
        typeof navigator !== "undefined" &&
        navigator.share
      ) {
        try {
          await navigator.share({
            title: "My JCWF Story",
            text: "A Story Today, A Brighter Tomorrow",
            url: data.shareUrl,
          });
        } catch {
          // User closed the native share dialog.
        }
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Gagal membagikan story."
      );
    } finally {
      setSharingId(null);
    }
  }

  async function handleCopyLink(
    storyId: string,
    url: string
  ) {
    try {
      await navigator.clipboard.writeText(url);

      setCopiedId(storyId);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error(error);

      setError(
        "Link tidak dapat disalin. Silakan copy secara manual."
      );
    }
  }

  if (loading) {
    return (
      <div className="rounded-[28px] border border-black/10 bg-[#F7F4EA] p-7">
        <div className="h-3 w-24 animate-pulse rounded-full bg-black/10" />

        <div className="mt-5 h-6 w-56 animate-pulse rounded-full bg-black/10" />

        <div className="mt-3 h-20 animate-pulse rounded-2xl bg-black/5" />
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-black/10 bg-[#F7F4EA] p-7">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7B816D]">
            My Story
          </p>

          <h2 className="mt-3 font-serif text-2xl leading-tight text-[#1D241B] sm:text-3xl">
            What did you reconnect with today?
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#62675B]">
            Keep the moments that meant something to you.
            Your stories stay private until you choose to
            share them.
          </p>
        </div>

        {!showForm && (
          <button
            type="button"
            onClick={handleNewStory}
            className="self-start rounded-full bg-[#1D241B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#30382D]"
          >
            + Write a new story
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Form */}
      {showForm && (
        <div className="mt-7 rounded-2xl border border-black/5 bg-white p-5 sm:p-6">
          <div>
            <p className="text-sm font-semibold text-[#30352D]">
              {editingId
                ? "Edit your story"
                : "Write a new story"}
            </p>

            <p className="mt-1 text-xs leading-5 text-[#85897D]">
              What moment, person, place, or feeling do you
              want to remember?
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-5"
          >
            <textarea
              value={reflection}
              onChange={(event) =>
                setReflection(event.target.value)
              }
              maxLength={1000}
              rows={6}
              placeholder="Write your reflection..."
              className="w-full resize-none rounded-2xl border border-black/10 bg-[#FCFCFA] px-4 py-4 text-sm leading-6 text-[#1D241B] outline-none transition placeholder:text-black/30 focus:border-[#8A9278] focus:ring-2 focus:ring-[#8A9278]/10"
            />

            <div className="mt-2 flex items-center justify-between gap-4 text-xs text-[#85897D]">
              <span>
                Your story stays private until you choose
                to share it.
              </span>

              <span className="shrink-0">
                {reflection.length}/1000
              </span>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-[#1D241B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#30382D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Save Changes"
                    : "Save Story →"}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-[#30352D] transition hover:bg-black/[0.03]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Empty State */}
      {!showForm && stories.length === 0 && (
        <div className="mt-7 rounded-2xl border border-dashed border-black/10 bg-white/60 px-6 py-10 text-center">
          <p className="font-serif text-xl text-[#30352D]">
            Your story starts here.
          </p>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#85897D]">
            Write down a moment you want to remember from
            your JCWF journey.
          </p>

          <button
            type="button"
            onClick={handleNewStory}
            className="mt-5 rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-medium text-[#30352D] transition hover:bg-black/[0.03]"
          >
            Write your first story
          </button>
        </div>
      )}

      {/* Stories */}
      {!showForm && stories.length > 0 && (
        <div className="mt-7 space-y-4">
          {stories.map((story) => (
            <article
              key={story.id}
              className="rounded-2xl border border-black/5 bg-white p-5 sm:p-6"
            >
              {/* Story Header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#85897D]">
                    {formatDate(story.createdAt)}
                  </p>

                  <p className="mt-1 text-xs text-[#A0A398]">
                    {story.updatedAt !== story.createdAt
                      ? "Edited"
                      : "My JCWF Story"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1.5 text-[11px] font-medium ${
                      story.isShared
                        ? "bg-[#E8EEE2] text-[#53604A]"
                        : "bg-[#F3F2EC] text-[#85897D]"
                    }`}
                  >
                    {story.isShared
                      ? "Shared"
                      : "Private"}
                  </span>
                </div>
              </div>

              {/* Story Content */}
              <div className="mt-5 rounded-2xl bg-[#F9F8F3] px-5 py-5">
                <p className="text-sm leading-7 text-[#3F443A]">
                  “{story.reflection}”
                </p>
              </div>

              {/* Share Link */}
              {shareUrl &&
                story.isShared &&
                story.shareToken &&
                shareUrl.includes(story.shareToken) && (
                  <div className="mt-3 rounded-xl border border-black/5 bg-[#FAFAF7] px-3 py-2">
                    <p className="break-all text-[11px] leading-5 text-[#85897D]">
                      {shareUrl}
                    </p>
                  </div>
                )}

              {/* Actions */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleEdit(story)}
                  className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium text-[#30352D] transition hover:bg-black/[0.03]"
                >
                  Edit
                </button>

                {!story.isShared ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleShare(story.id)
                    }
                    disabled={
                      sharingId === story.id
                    }
                    className="rounded-full bg-[#1D241B] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#30382D] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {sharingId === story.id
                      ? "Preparing..."
                      : "Share Story ↗"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        handleShare(story.id)
                      }
                      disabled={
                        sharingId === story.id
                      }
                      className="rounded-full bg-[#1D241B] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[#30382D] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {sharingId === story.id
                        ? "Sharing..."
                        : "Share Again ↗"}
                    </button>

                    {shareUrl &&
                      story.shareToken &&
                      shareUrl.includes(
                        story.shareToken
                      ) && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyLink(
                              story.id,
                              shareUrl
                            )
                          }
                          className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium text-[#30352D] transition hover:bg-black/[0.03]"
                        >
                          {copiedId === story.id
                            ? "Copied ✓"
                            : "Copy Link"}
                        </button>
                      )}
                  </>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(story.id)
                  }
                  disabled={
                    deletingId === story.id
                  }
                  className="rounded-full border border-red-100 bg-white px-4 py-2.5 text-xs font-medium text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {deletingId === story.id
                    ? "Deleting..."
                    : "Delete"}
                </button>
              </div>

              {/* Privacy Note */}
              <p className="mt-3 text-xs leading-5 text-[#85897D]">
                {story.isShared
                  ? "This story has a public share link."
                  : "This story stays private until you choose to share it."}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* Continue Journey */}
      {!showForm && (
        <div className="mt-7">
          <button
            type="button"
            onClick={() => {
              document
                .getElementById("my-journey")
                ?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
            }}
            className="rounded-full border border-black/10 bg-white px-4 py-2.5 text-xs font-medium text-[#30352D] transition hover:bg-black/[0.03]"
          >
            Continue Journey →
          </button>
        </div>
      )}
    </div>
  );
}