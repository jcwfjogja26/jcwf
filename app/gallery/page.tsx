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
  const [uploadMessage, setUploadMessage] = useState("");

  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");

  const [showPoints, setShowPoints] = useState(false);

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
      console.error("Failed to fetch gallery:", error);
    } finally {
      setLoading(false);
    }
  }

  /*
   * ==========================================================
   * SHARE MOMENT
   * User must login before uploading.
   * After login, they return to /gallery.
   * ==========================================================
   */
  function handleShareMoment() {
    window.location.href = "/login?redirect=/gallery";
  }

  async function handleUpload() {
    if (!selectedFile) {
      setUploadMessage("Please choose a photo first.");
      return;
    }

    setUploading(true);
    setUploadMessage("");

    try {
      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("caption", caption);

      const response = await fetch("/api/gallery/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        window.location.href = "/login?redirect=/gallery";
        return;
      }

      if (!response.ok) {
        setUploadMessage(
          data.error || "Something went wrong. Please try again."
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
      console.error("Gallery upload error:", error);

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
    const file = event.target.files?.[0] ?? null;

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
    <main className="min-h-screen bg-ivory text-forest">
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-forest/6 bg-ivory/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-5 md:h-[76px] md:px-10 lg:px-14">
          <Link
            href="/"
            className="font-display text-[27px] font-semibold tracking-[-0.05em] text-forest"
          >
            JCWF<span className="text-gold">.</span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm text-forest/45 transition-colors hover:text-forest"
            >
              Explore
            </Link>

            <Link
              href="/#activities"
              className="text-sm text-forest/45 transition-colors hover:text-forest"
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
            className="rounded-full bg-forest px-4 py-2.5 text-xs font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
          >
            My JCWF
          </Link>
        </div>
      </header>

      {/* =====================================================
          PAGE CONTENT
      ====================================================== */}
      <div className="mx-auto max-w-[1440px] px-5 pb-16 pt-9 md:px-10 md:pb-24 md:pt-14 lg:px-14">

        {/* ===================================================
            INTRO
        ==================================================== */}
        <section>
          <div className="grid gap-8 lg:grid-cols-[1fr_0.55fr] lg:items-end lg:gap-16">
            <div className="max-w-4xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold md:text-xs">
                Community Gallery
              </p>

              <h1 className="mt-3 font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.06em] text-forest">
                Moments
                <br />
                <span className="text-gold">together.</span>
              </h1>
            </div>

            <div className="lg:pb-1">
              <p className="max-w-md text-sm leading-6 text-forest/50 md:text-[15px] md:leading-7">
                A collection of moments shared by the
                JCWF community. Capture your experience,
                share it, and earn 10 points.
              </p>

              <button
                type="button"
                onClick={handleShareMoment}
                className="mt-6 inline-flex rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest md:px-6 md:py-3.5 md:text-sm"
              >
                Share a moment
              </button>
            </div>
          </div>
        </section>

        {/* ===================================================
            GALLERY
        ==================================================== */}
        <section className="mt-10 md:mt-16">
          {loading ? (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {Array.from({ length: 7 }).map((_, index) => (
                <div
                  key={index}
                  className={`overflow-hidden rounded-[1.4rem] bg-white ${
                    index === 0
                      ? "col-span-2 md:col-span-2"
                      : ""
                  }`}
                >
                  <div
                    className={`animate-pulse bg-sage/50 ${
                      index === 0
                        ? "aspect-[1.5/1] md:aspect-[1.7/1]"
                        : "aspect-square"
                    }`}
                  />

                  <div className="space-y-2 p-4">
                    <div className="h-3 w-2/3 animate-pulse rounded-full bg-sage/60" />
                    <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-sage/40" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="rounded-[1.75rem] bg-white px-6 py-16 text-center md:py-20">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sage text-xl text-forest">
                +
              </div>

              <h2 className="mt-5 font-display text-3xl tracking-[-0.04em] text-forest">
                No moments yet.
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-forest/45">
                Be the first to share a moment from
                JCWF 2026.
              </p>

              <button
                type="button"
                onClick={handleShareMoment}
                className="mt-6 rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest md:px-6 md:py-3.5 md:text-sm"
              >
                Share the first moment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
              {posts.map((post, index) => {
                const isFeatured = index === 0;

                return (
                  <button
                    key={post.id}
                    type="button"
                    onClick={() => setSelectedPost(post)}
                    className={`group overflow-hidden rounded-[1.4rem] bg-white text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(23,56,42,0.08)] md:rounded-[1.7rem] ${
                      isFeatured
                        ? "col-span-2 md:col-span-2"
                        : ""
                    }`}
                  >
                    {/* PHOTO */}
                    <div
                      className={`relative overflow-hidden bg-sage ${
                        isFeatured
                          ? "aspect-[1.35/1] md:aspect-[1.7/1]"
                          : "aspect-square"
                      }`}
                    >
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={
                            post.caption ||
                            "JCWF community moment"
                          }
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-forest/30">
                          Image unavailable
                        </div>
                      )}

                      {isFeatured && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-forest/55 to-transparent px-5 pb-5 pt-14 md:px-7 md:pb-7">
                          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                            Community moment
                          </p>

                          <p className="mt-1.5 font-display text-xl leading-none text-white md:text-3xl">
                            {post.participant?.fullName ||
                              "JCWF Participant"}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* INFO */}
                    {!isFeatured && (
                      <div className="p-3.5 md:p-4.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-forest text-[9px] font-semibold text-ivory md:h-8 md:w-8 md:text-[10px]">
                            {post.participant?.fullName
                              ?.charAt(0)
                              .toUpperCase() || "J"}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-[11px] font-semibold text-forest md:text-xs">
                              {post.participant?.fullName ||
                                "JCWF Participant"}
                            </p>

                            <p className="mt-0.5 text-[8px] uppercase tracking-[0.1em] text-forest/30 md:text-[9px]">
                              {formatDate(post.createdAt)}
                            </p>
                          </div>
                        </div>

                        {post.caption && (
                          <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-forest/50 md:text-xs md:leading-5">
                            {post.caption}
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================================================
            SMALL CTA
        ==================================================== */}
        {!loading && posts.length > 0 && (
          <section className="mt-10 rounded-[1.7rem] bg-sage/55 px-5 py-6 md:mt-14 md:flex md:items-center md:justify-between md:px-7 md:py-7">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                Your moment matters
              </p>

              <p className="mt-1.5 font-display text-xl leading-tight tracking-[-0.025em] text-forest md:text-2xl">
                Add your story to the JCWF community.
              </p>
            </div>

            <button
              type="button"
              onClick={handleShareMoment}
              className="mt-5 rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest md:mt-0 md:px-6 md:py-3.5 md:text-sm"
            >
              Share a moment
            </button>
          </section>
        )}
      </div>

      {/* =====================================================
          PHOTO DETAIL MODAL
      ====================================================== */}
      {selectedPost && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest/75 p-4 backdrop-blur-md"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-[1.75rem] bg-ivory shadow-2xl md:rounded-[2rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-forest/80 text-lg text-ivory backdrop-blur-md transition hover:bg-forest md:right-4 md:top-4 md:h-10 md:w-10"
              aria-label="Close"
            >
              ×
            </button>

            <div className="grid max-h-[92vh] overflow-auto md:grid-cols-[1.35fr_0.65fr]">
              <div className="flex min-h-[280px] items-center justify-center bg-forest md:min-h-[500px]">
                {selectedPost.imageUrl && (
                  <img
                    src={selectedPost.imageUrl}
                    alt={
                      selectedPost.caption ||
                      "JCWF community moment"
                    }
                    className="max-h-[72vh] w-full object-contain"
                  />
                )}
              </div>

              <div className="flex flex-col p-6 md:p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory">
                    {selectedPost.participant?.fullName
                      ?.charAt(0)
                      .toUpperCase() || "J"}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-forest">
                      {selectedPost.participant?.fullName ||
                        "JCWF Participant"}
                    </p>

                    <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-forest/30">
                      {formatDate(selectedPost.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-8 flex-1">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                    Shared moment
                  </p>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-forest/65">
                    {selectedPost.caption ||
                      "A moment from JCWF 2026."}
                  </p>
                </div>

                <div className="mt-8 rounded-[1.25rem] bg-sage/55 p-4">
                  <p className="text-xs font-semibold text-forest">
                    +10 points
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-forest/45">
                    Earned when this moment was successfully
                    uploaded.
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
          className="fixed inset-0 z-[100] flex items-center justify-center bg-forest/70 p-4 backdrop-blur-md"
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
            className="w-full max-w-lg rounded-[1.75rem] bg-ivory p-6 shadow-2xl sm:p-8 md:rounded-[2rem]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                  Share a moment
                </p>

                <h2 className="mt-2 font-display text-3xl tracking-[-0.04em] text-forest">
                  What did you experience?
                </h2>

                <p className="mt-2 text-sm leading-6 text-forest/45">
                  Share a photo from your JCWF journey
                  and earn 10 points.
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
              <div className="overflow-hidden rounded-[1.25rem] border border-dashed border-forest/15 bg-white transition hover:border-forest/30">
                {selectedFile ? (
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sage text-lg text-forest">
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
                  <div className="px-5 py-9 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sage text-lg text-forest">
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
                className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest/50"
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
                className="mt-2 w-full resize-none rounded-[1.25rem] border border-forest/10 bg-white px-4 py-3 text-sm leading-6 text-forest outline-none transition placeholder:text-forest/25 focus:border-gold"
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
              disabled={uploading || !selectedFile}
              className="mt-5 flex w-full items-center justify-center rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? "Uploading..." : "Upload moment"}
            </button>

            <p className="mt-4 text-center text-[10px] leading-5 text-forest/30">
              You can share one moment per day.
            </p>
          </div>
        </div>
      )}

      {/* =====================================================
          POINTS SUCCESS
      ====================================================== */}
      {showPoints && (
        <div className="fixed bottom-5 left-1/2 z-[200] -translate-x-1/2 px-4">
          <div className="flex min-w-[270px] items-center gap-3 rounded-2xl bg-forest px-4 py-3.5 text-ivory shadow-2xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold font-display text-base font-semibold text-forest">
              +10
            </div>

            <div>
              <p className="text-sm font-semibold">
                Points earned!
              </p>

              <p className="mt-0.5 text-[10px] text-ivory/50">
                Your moment is now part of JCWF.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mx-auto max-w-[1440px] px-5 pb-8 pt-7 md:px-10 lg:px-14">
        <div className="flex flex-col justify-between gap-2 border-t border-forest/8 pt-5 text-[10px] text-forest/30 sm:flex-row md:text-xs">
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