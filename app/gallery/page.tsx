"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type GalleryPost = {
  id: string;
  imageUrl: string;
  imagePath: string | null;
  caption: string | null;
  createdAt: string;
  participant: {
    fullName: string;
    reconnectId: string;
  } | null;
};

export default function GalleryPage() {
  const [posts, setPosts] = useState<GalleryPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPost, setSelectedPost] =
    useState<GalleryPost | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] =
    useState("");

  const [showUpload, setShowUpload] =
    useState(false);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [caption, setCaption] = useState("");

  const [showPoints, setShowPoints] =
    useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  async function fetchGallery() {
    try {
      setLoading(true);

      const response = await fetch("/api/gallery", {
        cache: "no-store",
      });

      const data = await response.json();

      if (data.success) {
        setPosts(data.posts ?? []);
      }
    } catch (error) {
      console.error(
        "Failed to fetch gallery:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setUploadMessage(
        "Please choose a photo first."
      );
      return;
    }

    setUploading(true);
    setUploadMessage("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("caption", caption);

      const response = await fetch(
        "/api/gallery/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setUploadMessage(
          data.error ||
            "Something went wrong. Please try again."
        );
        return;
      }

      setShowUpload(false);
      setSelectedFile(null);
      setCaption("");
      setUploadMessage("");

      await fetchGallery();

      setShowPoints(true);

      setTimeout(() => {
        setShowPoints(false);
      }, 3000);
    } catch (error) {
      console.error(
        "Gallery upload error:",
        error
      );

      setUploadMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setUploadMessage("");
  }

  function formatDate(
    dateString: string | null | undefined
  ) {
    if (!dateString) {
      return "Date unavailable";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  }

  return (
    <main className="min-h-screen bg-ivory">
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-forest/5 bg-ivory/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 md:px-10 lg:px-14">
          <Link
            href="/"
            className="font-display text-[28px] font-semibold tracking-[-0.04em] text-forest"
          >
            JCWF
            <span className="text-gold">.</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <Link
              href="/"
              className="text-sm text-forest/55 transition hover:text-forest"
            >
              Explore
            </Link>

            <Link
              href="/#activities"
              className="text-sm text-forest/55 transition hover:text-forest"
            >
              Activities
            </Link>

            <Link
              href="/gallery"
              className="text-sm font-semibold text-forest"
            >
              Gallery
            </Link>
          </nav>

          <Link
            href="/my"
            className="inline-flex items-center gap-2 rounded-full bg-forest px-4 py-2.5 text-xs font-semibold text-ivory transition hover:bg-gold hover:text-forest"
          >
            My JCWF
            <span>→</span>
          </Link>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-10 md:py-14 lg:px-14">
        {/* ===================================================
            HEADER
        ==================================================== */}
        <section>
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                Community Gallery
              </p>

              <h1 className="mt-3 font-display text-5xl tracking-[-0.05em] text-forest sm:text-6xl md:text-7xl">
                Moments together
                <span className="text-gold">.</span>
              </h1>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-forest/50 md:text-base">
                A collection of moments shared by the
                JCWF community. Capture your experience,
                share it, and earn 10 points.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowUpload(true);
                setUploadMessage("");
              }}
              className="inline-flex w-fit items-center gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
            >
              Share a Moment
              <span className="text-base">+</span>
            </button>
          </div>
        </section>

        {/* ===================================================
            GALLERY GRID
        ==================================================== */}
        <section className="mt-12">
          {loading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-[1.5rem] bg-white"
                  >
                    <div className="aspect-square animate-pulse bg-forest/5" />

                    <div className="space-y-2 p-4">
                      <div className="h-3 w-3/4 animate-pulse rounded-full bg-forest/5" />

                      <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-forest/5" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[2rem] bg-white px-6 py-20 text-center shadow-[0_18px_50px_rgba(23,56,42,0.05)] sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage text-2xl text-forest">
                +
              </div>

              <h2 className="mt-6 font-display text-3xl tracking-[-0.03em] text-forest">
                No moments yet.
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-forest/45">
                Be the first to share a moment from
                JCWF 2026.
              </p>

              <button
                type="button"
                onClick={() => setShowUpload(true)}
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition hover:bg-gold hover:text-forest"
              >
                Share the first moment
                <span>→</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() =>
                    setSelectedPost(post)
                  }
                  className="group overflow-hidden rounded-[1.5rem] bg-white text-left shadow-[0_12px_35px_rgba(23,56,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(23,56,42,0.09)]"
                >
                  {/* PHOTO */}
                  <div className="aspect-square overflow-hidden bg-sage">
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={
                          post.caption ||
                          "JCWF community moment"
                        }
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-forest/30">
                        Image unavailable
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-[10px] font-semibold text-ivory">
                        {post.participant?.fullName
                          ?.charAt(0)
                          .toUpperCase() || "J"}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-forest">
                          {post.participant
                            ?.fullName ||
                            "JCWF Participant"}
                        </p>

                        <p className="text-[9px] uppercase tracking-[0.1em] text-forest/35">
                          {formatDate(
                            post.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    {post.caption && (
                      <p className="mt-3 line-clamp-2 text-xs leading-5 text-forest/55">
                        {post.caption}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* ===================================================
            BOTTOM CTA
        ==================================================== */}
        <section className="mt-12 rounded-[2rem] bg-forest p-7 text-ivory sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Your moment matters
              </p>

              <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                Add your story to the
                JCWF community.
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-ivory/50">
                Every shared moment becomes part of
                the collective festival story.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="inline-flex w-fit shrink-0 items-center gap-3 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition hover:bg-ivory"
            >
              Share a moment
              <span>→</span>
            </button>
          </div>
        </section>
      </div>

      {/* =====================================================
          PHOTO DETAIL MODAL
      ====================================================== */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest/70 p-4 backdrop-blur-sm"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-[2rem] bg-ivory shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-forest/80 text-lg text-ivory backdrop-blur-md transition hover:bg-forest"
              aria-label="Close"
            >
              ×
            </button>

            <div className="grid max-h-[92vh] overflow-auto md:grid-cols-[1.3fr_0.7fr]">
              <div className="flex min-h-[320px] items-center justify-center bg-forest">
                {selectedPost.imageUrl && (
                  <img
                    src={selectedPost.imageUrl}
                    alt={
                      selectedPost.caption ||
                      "JCWF community moment"
                    }
                    className="max-h-[75vh] w-full object-contain"
                  />
                )}
              </div>

              <div className="flex flex-col p-7 sm:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory">
                    {selectedPost.participant?.fullName
                      ?.charAt(0)
                      .toUpperCase() || "J"}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-forest">
                      {selectedPost.participant
                        ?.fullName ||
                        "JCWF Participant"}
                    </p>

                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-forest/35">
                      {formatDate(
                        selectedPost.createdAt
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                    Shared moment
                  </p>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-forest/70">
                    {selectedPost.caption ||
                      "A moment from JCWF 2026."}
                  </p>
                </div>

                <div className="mt-8 rounded-2xl bg-sage/50 p-4">
                  <p className="text-xs font-semibold text-forest">
                    +10 points
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-forest/45">
                    Earned when this moment was
                    successfully uploaded.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          UPLOAD MODAL
      ====================================================== */}
      {showUpload && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest/70 p-4 backdrop-blur-sm"
          onClick={() => {
            if (!uploading) {
              setShowUpload(false);
              setSelectedFile(null);
              setCaption("");
              setUploadMessage("");
            }
          }}
        >
          <div
            className="w-full max-w-lg rounded-[2rem] bg-ivory p-7 shadow-2xl sm:p-9"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Share a moment
                </p>

                <h2 className="mt-2 font-display text-3xl tracking-[-0.04em] text-forest">
                  What did you experience?
                </h2>

                <p className="mt-2 text-sm leading-6 text-forest/45">
                  Share a photo from your JCWF
                  journey and earn 10 points.
                </p>
              </div>

              <button
                type="button"
                disabled={uploading}
                onClick={() => {
                  setShowUpload(false);
                  setSelectedFile(null);
                  setCaption("");
                  setUploadMessage("");
                }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-forest/5 text-lg text-forest transition hover:bg-forest/10"
              >
                ×
              </button>
            </div>

            {/* FILE INPUT */}
            <label className="mt-7 block cursor-pointer">
              <div className="overflow-hidden rounded-2xl border border-dashed border-forest/15 bg-white transition hover:border-forest/30">
                {selectedFile ? (
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sage text-xl text-forest">
                        ✓
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-forest">
                          {selectedFile.name}
                        </p>

                        <p className="mt-1 text-xs text-forest/40">
                          {(
                            selectedFile.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="px-5 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sage text-xl text-forest">
                      +
                    </div>

                    <p className="mt-4 text-sm font-semibold text-forest">
                      Choose a photo
                    </p>

                    <p className="mt-1 text-xs text-forest/40">
                      JPG, PNG, or WebP · Max 5 MB
                    </p>
                  </div>
                )}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
              </div>
            </label>

            {/* CAPTION */}
            <div className="mt-5">
              <label
                htmlFor="gallery-caption"
                className="text-[11px] font-semibold uppercase tracking-[0.14em] text-forest/50"
              >
                Caption
              </label>

              <textarea
                id="gallery-caption"
                value={caption}
                onChange={(event) =>
                  setCaption(event.target.value)
                }
                maxLength={300}
                rows={4}
                placeholder="Tell us about this moment..."
                disabled={uploading}
                className="mt-2 w-full resize-none rounded-2xl border border-forest/10 bg-white px-4 py-3 text-sm leading-6 text-forest outline-none transition placeholder:text-forest/25 focus:border-gold"
              />

              <p className="mt-1 text-right text-[10px] text-forest/30">
                {caption.length}/300
              </p>
            </div>

            {/* ERROR */}
            {uploadMessage && (
              <div className="mt-4 rounded-xl bg-[#EAD6C8] px-4 py-3 text-xs leading-5 text-forest">
                {uploadMessage}
              </div>
            )}

            {/* ACTION */}
            <button
              type="button"
              onClick={handleUpload}
              disabled={
                uploading || !selectedFile
              }
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? (
                "Uploading..."
              ) : (
                <>
                  Upload moment
                  <span>→</span>
                </>
              )}
            </button>

            <p className="mt-4 text-center text-[10px] leading-5 text-forest/30">
              You can share one moment per day.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          POINTS SUCCESS POPUP
      ====================================================== */}
      {showPoints && (
        <div className="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2">
          <div className="flex min-w-[280px] items-center gap-4 rounded-2xl bg-forest px-5 py-4 text-ivory shadow-2xl">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold font-display text-lg font-semibold text-forest">
              +10
            </div>

            <div>
              <p className="text-sm font-semibold">
                Points earned!
              </p>

              <p className="mt-0.5 text-xs text-ivory/50">
                Your moment is now part of JCWF.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mx-auto max-w-[1440px] px-6 pb-10 pt-8 md:px-10 lg:px-14">
        <div className="flex flex-col justify-between gap-3 border-t border-forest/8 pt-6 text-xs text-forest/35 sm:flex-row">
          <p>
            JCWF 2026 · Jogja Cultural Wellness Festival
          </p>

          <p>
            Reconnecting — People, Culture & Wellbeing
          </p>
        </div>
      </footer>
    </main>
  );
}

