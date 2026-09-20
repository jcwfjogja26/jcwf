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

function formatStoryDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/* =========================================================
   ICONS
========================================================= */

function NotesIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="5" y="3.5" width="14" height="17" rx="2.5" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
      <path d="M9 16h3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronIcon({
  open,
}: {
  open: boolean;
}) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`transition-transform duration-300 ${
        open ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="18" cy="5" r="2.2" />
      <circle cx="6" cy="12" r="2.2" />
      <circle cx="18" cy="19" r="2.2" />
      <path d="m8 10.9 7.8-4.5" />
      <path d="m8 13.1 7.8 4.5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="8" y="8" width="11" height="11" rx="2" />
      <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
    </svg>
  );
}

function DeleteIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 7h16" />
      <path d="M9 7V4h6v3" />
      <path d="m6 7 1 14h10l1-14" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
    </svg>
  );
}

/* =========================================================
   COMPONENT
========================================================= */

export default function MyStoryCard() {
  const [stories, setStories] = useState<Story[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [sharing, setSharing] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [expanded, setExpanded] =
    useState(false);

  const [composerOpen, setComposerOpen] =
    useState(false);

  const [selectedStory, setSelectedStory] =
    useState<Story | null>(null);

  const [editingStoryId, setEditingStoryId] =
    useState<string | null>(null);

  const [reflection, setReflection] =
    useState("");

  const [error, setError] =
    useState("");

  const [shareUrl, setShareUrl] =
    useState("");

  const [copied, setCopied] =
    useState(false);

  /* =======================================================
     LOAD STORIES
  ======================================================= */

  async function loadStories() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/my-story",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengambil My Stories."
        );
      }

      setStories(
        Array.isArray(data.stories)
          ? data.stories
          : []
      );
    } catch (error) {
      console.error(
        "LOAD MY STORIES ERROR:",
        error
      );

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

  /* =======================================================
     CREATE STORY
  ======================================================= */

  async function handleCreateStory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const value =
      reflection.trim();

    if (!value) {
      setError(
        "Tulis sedikit tentang pengalamanmu dulu."
      );
      return;
    }

    if (value.length > 1000) {
      setError(
        "Story maksimal 1000 karakter."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch("/api/my-story", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            reflection: value,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal membuat story."
        );
      }

      const newStory =
        data.story as Story;

      setStories((current) => [
        newStory,
        ...current,
      ]);

      setReflection("");
      setComposerOpen(false);

      /*
       * Automatically open the section
       * after creating a story so the
       * participant can immediately see it.
       */
      setExpanded(true);
    } catch (error) {
      console.error(
        "CREATE STORY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal membuat story."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     EDIT STORY
  ======================================================= */

  function startEditing(
    story: Story
  ) {
    setSelectedStory(null);
    setEditingStoryId(story.id);
    setReflection(
      story.reflection
    );
    setError("");
  }

  async function handleEditStory(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingStoryId) return;

    const value =
      reflection.trim();

    if (!value) {
      setError(
        "Story tidak boleh kosong."
      );
      return;
    }

    if (value.length > 1000) {
      setError(
        "Story maksimal 1000 karakter."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response =
        await fetch("/api/my-story", {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            storyId:
              editingStoryId,
            reflection: value,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal mengedit story."
        );
      }

      const updatedStory =
        data.story as Story;

      setStories((current) =>
        current.map((item) =>
          item.id ===
          updatedStory.id
            ? updatedStory
            : item
        )
      );

      setEditingStoryId(null);
      setReflection("");
    } catch (error) {
      console.error(
        "EDIT STORY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal mengedit story."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =======================================================
     DELETE STORY
  ======================================================= */

  async function handleDeleteStory(
    story: Story
  ) {
    const confirmed =
      window.confirm(
        "Hapus story ini?"
      );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");

      const response =
        await fetch("/api/my-story", {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            storyId: story.id,
          }),
        });

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal menghapus story."
        );
      }

      setStories((current) =>
        current.filter(
          (item) =>
            item.id !== story.id
        )
      );

      setSelectedStory(null);
    } catch (error) {
      console.error(
        "DELETE STORY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal menghapus story."
      );
    } finally {
      setDeleting(false);
    }
  }

  /* =======================================================
     SHARE STORY
  ======================================================= */

  async function handleShare(
    story: Story
  ) {
    try {
      setSharing(true);
      setError("");
      setCopied(false);

      const response =
        await fetch(
          "/api/my-story/share",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              storyId: story.id,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Gagal membuat link sharing."
        );
      }

      setShareUrl(
        data.shareUrl
      );

      const updatedStory: Story = {
        ...story,
        isShared: true,
        shareToken:
          data.shareToken,
        sharedAt:
          story.sharedAt ||
          new Date().toISOString(),
      };

      setStories((current) =>
        current.map((item) =>
          item.id === story.id
            ? updatedStory
            : item
        )
      );

      setSelectedStory(
        updatedStory
      );

      if (
        typeof navigator !==
          "undefined" &&
        navigator.share
      ) {
        try {
          await navigator.share({
            title:
              "My JCWF Story",
            text:
              "A Story Today, A Brighter Tomorrow",
            url:
              data.shareUrl,
          });
        } catch {
          // User closed native share.
        }
      }
    } catch (error) {
      console.error(
        "SHARE STORY ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Gagal membagikan story."
      );
    } finally {
      setSharing(false);
    }
  }

  /* =======================================================
     COPY SHARE LINK
  ======================================================= */

  async function handleCopyLink() {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(
        shareUrl
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        1800
      );
    } catch (error) {
      console.error(error);

      setError(
        "Link tidak dapat disalin."
      );
    }
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section className="rounded-[24px] bg-[#E8EFE4] p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-[12px] bg-white/70" />

            <div className="space-y-2">
              <div className="h-2 w-20 animate-pulse rounded-full bg-white/70" />
              <div className="h-2 w-28 animate-pulse rounded-full bg-white/50" />
            </div>
          </div>

          <div className="h-9 w-9 animate-pulse rounded-full bg-white/70" />
        </div>
      </section>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <>
      <section className="overflow-hidden rounded-[24px] bg-[#E8EFE4]">
        {/* =================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() =>
              setExpanded(
                (current) => !current
              )
            }
            className="flex min-w-0 items-center gap-3 text-left"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-white text-forest">
              <NotesIcon />
            </span>

            <span className="min-w-0">
              <span className="block text-[8px] font-bold uppercase tracking-[0.18em] text-gold">
                My Story
              </span>

              <span className="mt-0.5 block text-[8px] text-forest/35">
                Your notes & reflections
              </span>
            </span>
          </button>

          <div className="flex items-center gap-1.5">
            {/* PLUS */}

            <button
              type="button"
              onClick={() => {
                setComposerOpen(true);
                setEditingStoryId(
                  null
                );
                setReflection("");
                setError("");
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-forest/65 transition hover:text-forest"
              aria-label="Create new story"
            >
              <PlusIcon />
            </button>

            {/* CHEVRON */}

            <button
              type="button"
              onClick={() =>
                setExpanded(
                  (current) => !current
                )
              }
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/65 text-forest/45 transition hover:text-forest"
              aria-label={
                expanded
                  ? "Collapse My Story"
                  : "Open My Story"
              }
            >
              <ChevronIcon
                open={expanded}
              />
            </button>
          </div>
        </div>

        {/* =================================================
            CONTENT
        ================================================== */}

        {expanded && (
          <div className="border-t border-forest/[0.06] px-4 pb-4 pt-3">
            {/* ERROR */}

            {error && (
              <div className="mb-3 rounded-[12px] bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-500">
                {error}
              </div>
            )}

            {/* EMPTY */}

            {stories.length === 0 ? (
              <button
                type="button"
                onClick={() =>
                  setComposerOpen(true)
                }
                className="w-full rounded-[18px] bg-[#F8F7F1] px-5 py-6 text-left transition hover:bg-white"
              >
                <span className="font-display text-[27px] leading-none text-forest/10">
                  “
                </span>

                <p className="mt-1 font-display text-[15px] tracking-[-0.02em] text-forest/65">
                  Nothing written yet.
                </p>

                <p className="mt-1 text-[8px] text-forest/30">
                  Start with a small moment
                  worth remembering.
                </p>
              </button>
            ) : (
              <div className="space-y-2">
                {stories.map(
                  (story) => (
                    <button
                      key={story.id}
                      type="button"
                      onClick={() => {
                        setSelectedStory(
                          story
                        );
                        setShareUrl("");
                        setCopied(
                          false
                        );
                        setError("");
                      }}
                      className="group relative w-full overflow-hidden rounded-[18px] bg-[#F8F7F1] px-5 py-4 text-left transition hover:bg-white"
                    >
                      {/* quotation */}

                      <span className="pointer-events-none absolute -left-1 -top-4 font-display text-[64px] leading-none text-forest/[0.055]">
                        “
                      </span>

                      <div className="relative">
                        <p className="line-clamp-2 font-display text-[15px] leading-6 tracking-[-0.025em] text-forest/75">
                          {story.reflection}
                        </p>

                        <div className="mt-3 flex items-center justify-between gap-3">
                          <span className="text-[7px] font-semibold uppercase tracking-[0.12em] text-forest/25">
                            {formatStoryDate(
                              story.updatedAt ||
                                story.createdAt
                            )}
                          </span>

                          {story.isShared && (
                            <span className="rounded-full bg-[#DDE9D9] px-2 py-1 text-[7px] font-semibold text-forest/55">
                              Shared
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================
          CREATE STORY SHEET
      ====================================================== */}

      {composerOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-forest/15 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="w-full max-w-[500px] rounded-[28px] bg-[#F8F7F1] p-5 shadow-[0_25px_80px_rgba(49,90,63,0.18)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-gold">
                  New Story
                </p>

                <h2 className="mt-1 font-display text-[23px] tracking-[-0.04em] text-forest">
                  Keep this moment.
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setComposerOpen(
                    false
                  );
                  setReflection("");
                  setError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest/45"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateStory
              }
              className="mt-5"
            >
              <textarea
                autoFocus
                value={reflection}
                onChange={(event) =>
                  setReflection(
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={7}
                placeholder="What did you reconnect with today?"
                className="w-full resize-none rounded-[20px] border-0 bg-white px-5 py-5 font-display text-[17px] leading-7 tracking-[-0.02em] text-forest outline-none placeholder:text-forest/20 focus:ring-2 focus:ring-forest/10"
              />

              <div className="mt-2 flex items-center justify-between px-1 text-[7px] text-forest/25">
                <span>
                  Your story stays private
                  until you choose to share it.
                </span>

                <span>
                  {reflection.length}/1000
                </span>
              </div>

              {error && (
                <p className="mt-3 text-[8px] text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-forest text-[10px] font-semibold text-ivory transition hover:bg-gold hover:text-forest disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Story"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT STORY SHEET
      ====================================================== */}

      {editingStoryId && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-forest/15 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="w-full max-w-[500px] rounded-[28px] bg-[#F8F7F1] p-5 shadow-[0_25px_80px_rgba(49,90,63,0.18)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-gold">
                  Edit Story
                </p>

                <h2 className="mt-1 font-display text-[23px] tracking-[-0.04em] text-forest">
                  Refine your note.
                </h2>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditingStoryId(
                    null
                  );
                  setReflection("");
                  setError("");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest/45"
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            <form
              onSubmit={
                handleEditStory
              }
              className="mt-5"
            >
              <textarea
                autoFocus
                value={reflection}
                onChange={(event) =>
                  setReflection(
                    event.target.value
                  )
                }
                maxLength={1000}
                rows={7}
                className="w-full resize-none rounded-[20px] border-0 bg-white px-5 py-5 font-display text-[17px] leading-7 tracking-[-0.02em] text-forest outline-none focus:ring-2 focus:ring-forest/10"
              />

              {error && (
                <p className="mt-3 text-[8px] text-red-500">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="mt-4 flex h-11 w-full items-center justify-center rounded-full bg-forest text-[10px] font-semibold text-ivory transition hover:bg-gold hover:text-forest disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          STORY DETAIL
      ====================================================== */}

      {selectedStory && (
        <div className="fixed inset-0 z-[110] flex items-end justify-center bg-forest/20 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="relative max-h-[90vh] w-full max-w-[520px] overflow-y-auto rounded-[30px] bg-[#F8F7F1] p-6 shadow-[0_25px_80px_rgba(49,90,63,0.2)]">
            {/* close */}

            <button
              type="button"
              onClick={() =>
                setSelectedStory(
                  null
                )
              }
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-white text-forest/45"
              aria-label="Close story"
            >
              <CloseIcon />
            </button>

            {/* heading */}

            <p className="text-[8px] font-bold uppercase tracking-[0.18em] text-gold">
              My Story
            </p>

            <p className="mt-2 text-[8px] font-medium uppercase tracking-[0.12em] text-forest/25">
              {formatStoryDate(
                selectedStory.updatedAt ||
                  selectedStory.createdAt
              )}
            </p>

            {/* quote */}

            <div className="relative mt-6 overflow-hidden rounded-[22px] bg-white px-6 py-7">
              <span className="pointer-events-none absolute -left-2 -top-5 font-display text-[100px] leading-none text-forest/[0.055]">
                “
              </span>

              <p className="relative font-display text-[21px] leading-8 tracking-[-0.025em] text-forest/80">
                {selectedStory.reflection}
              </p>

              {selectedStory.isShared && (
                <span className="mt-6 inline-flex rounded-full bg-[#DDE9D9] px-2.5 py-1.5 text-[7px] font-semibold text-forest/55">
                  Shared
                </span>
              )}
            </div>

            {error && (
              <p className="mt-3 text-[8px] text-red-500">
                {error}
              </p>
            )}

            {/* actions */}

            <div className="mt-5 flex items-center justify-center gap-2">
              {/* edit */}

              <button
                type="button"
                onClick={() =>
                  startEditing(
                    selectedStory
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest/55 transition hover:text-forest"
                aria-label="Edit story"
              >
                <EditIcon />
              </button>

              {/* share */}

              <button
                type="button"
                onClick={() =>
                  handleShare(
                    selectedStory
                  )
                }
                disabled={sharing}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-ivory transition hover:bg-gold hover:text-forest disabled:opacity-50"
                aria-label="Share story"
              >
                <ShareIcon />
              </button>

              {/* copy */}

              {shareUrl && (
                <button
                  type="button"
                  onClick={
                    handleCopyLink
                  }
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white text-forest/55 transition hover:text-forest"
                  aria-label="Copy share link"
                >
                  <CopyIcon />

                  {copied && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-forest px-2 py-1 text-[7px] text-white">
                      Copied
                    </span>
                  )}
                </button>
              )}

              {/* delete */}

              <button
                type="button"
                onClick={() =>
                  handleDeleteStory(
                    selectedStory
                  )
                }
                disabled={deleting}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-red-400/60 transition hover:text-red-500 disabled:opacity-40"
                aria-label="Delete story"
              >
                <DeleteIcon />
              </button>
            </div>

            {selectedStory.isShared && (
              <p className="mt-4 text-center text-[8px] text-forest/25">
                This story has a public share
                link.
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}