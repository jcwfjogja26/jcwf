import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentParticipant } from "@/lib/participant-session";
import { supabaseServer } from "@/lib/supabase-server";

type GalleryPost = {
  id: string;
  image_path: string | null;
  image_url: string | null;
  caption: string | null;
  created_at: string;
};

function formatDate(dateString: string) {
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function MyGalleryPage() {
  const participant = await getCurrentParticipant();

  if (!participant) {
    redirect("/login");
  }

  const { data: galleryPosts, error } =
    await supabaseServer
      .from("gallery_posts")
      .select(
        `
        id,
        image_path,
        image_url,
        caption,
        created_at
        `
      )
      .eq("participant_id", participant.id)
      .eq("status", "visible")
      .order("created_at", {
        ascending: false,
      });

  if (error) {
    console.error(
      "GET MY GALLERY PAGE ERROR:",
      error
    );
  }

  const posts: GalleryPost[] =
    (galleryPosts ?? []).map((post) => ({
      id: post.id,
      image_path: post.image_path,
      image_url:
        post.image_path
          ? supabaseServer.storage
              .from("gallery")
              .getPublicUrl(post.image_path).data
              .publicUrl
          : post.image_url,
      caption: post.caption,
      created_at: post.created_at,
    }));

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
              className="text-sm text-forest/55 transition hover:text-forest"
            >
              Gallery
            </Link>
          </nav>

          <Link
            href="/my"
            className="flex items-center gap-3"
          >
            <div className="hidden text-right sm:block">
              <p className="text-xs font-medium text-forest">
                {participant.full_name}
              </p>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-forest/40">
                {participant.reconnect_id}
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-sm font-semibold text-ivory">
              {participant.full_name
                .charAt(0)
                .toUpperCase()}
            </div>
          </Link>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="mx-auto max-w-[1440px] px-6 py-10 md:px-10 md:py-14 lg:px-14">
        {/* ===================================================
            PAGE HEADER
        ==================================================== */}
        <section>
          <Link
            href="/my"
            className="inline-flex items-center gap-2 text-xs font-semibold text-forest/45 transition hover:text-forest"
          >
            <span>←</span>
            Back to My JCWF
          </Link>

          <div className="mt-8 flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
                My Moments
              </p>

              <h1 className="mt-3 font-display text-5xl tracking-[-0.05em] text-forest sm:text-6xl">
                My Gallery<span className="text-gold">.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-forest/50 md:text-base">
                Moments you&apos;ve shared from your
                JCWF journey.
              </p>
            </div>

            <Link
              href="/gallery"
              className="inline-flex w-fit items-center gap-3 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-ivory transition hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
            >
              Share a Moment
              <span>+</span>
            </Link>
          </div>
        </section>

        {/* ===================================================
            STATS
        ==================================================== */}
        <section className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-[1.5rem] bg-white p-6 shadow-[0_18px_50px_rgba(23,56,42,0.05)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
              Moments
            </p>

            <p className="mt-3 font-display text-4xl tracking-[-0.04em] text-forest">
              {posts.length}
            </p>

            <p className="mt-1 text-xs text-forest/40">
              Shared memories
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-forest p-6 text-ivory">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
              Points
            </p>

            <p className="mt-3 font-display text-4xl tracking-[-0.04em]">
              +{posts.length * 10}
            </p>

            <p className="mt-1 text-xs text-ivory/45">
              Earned from gallery uploads
            </p>
          </div>

          <div className="rounded-[1.5rem] bg-[#E9E5D6] p-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
              Reconnect ID
            </p>

            <p className="mt-3 font-display text-2xl tracking-[0.02em] text-forest">
              {participant.reconnect_id}
            </p>

            <p className="mt-1 text-xs text-forest/40">
              Your festival identity
            </p>
          </div>
        </section>

        {/* ===================================================
            GALLERY
        ==================================================== */}
        <section className="mt-10">
          {posts.length === 0 ? (
            <div className="rounded-[2rem] bg-white px-6 py-20 text-center shadow-[0_18px_50px_rgba(23,56,42,0.05)] sm:px-10">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage text-2xl text-forest">
                +
              </div>

              <h2 className="mt-6 font-display text-3xl tracking-[-0.03em] text-forest">
                Your gallery is empty.
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-forest/45">
                Capture a moment from JCWF and share
                it with the community. Every successful
                upload earns 10 points.
              </p>

              <Link
                href="/gallery"
                className="mt-7 inline-flex items-center gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition hover:bg-gold hover:text-forest"
              >
                Share your first moment
                <span>→</span>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                    Your moments
                  </p>

                  <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] text-forest">
                    Memories from JCWF
                  </h2>
                </div>

                <span className="text-xs text-forest/35">
                  {posts.length}{" "}
                  {posts.length === 1
                    ? "moment"
                    : "moments"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {posts.map((post) => (
                  <article
                    key={post.id}
                    className="group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_35px_rgba(23,56,42,0.05)]"
                  >
                    <div className="aspect-square overflow-hidden bg-sage">
                      {post.image_url ? (
                        <img
                          src={post.image_url}
                          alt={
                            post.caption ||
                            "JCWF moment"
                          }
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-forest/30">
                          Image unavailable
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      {post.caption ? (
                        <p className="line-clamp-2 text-sm leading-5 text-forest">
                          {post.caption}
                        </p>
                      ) : (
                        <p className="text-sm italic text-forest/30">
                          No caption
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <p className="text-[10px] uppercase tracking-[0.12em] text-forest/35">
                          {formatDate(
                            post.created_at
                          )}
                        </p>

                        <span className="text-[10px] font-semibold text-gold">
                          +10 pts
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ===================================================
            BOTTOM CTA
        ==================================================== */}
        <section className="mt-10 rounded-[2rem] bg-forest p-7 text-ivory sm:p-8 lg:p-10">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
                Keep reconnecting
              </p>

              <h2 className="mt-3 max-w-2xl font-display text-3xl tracking-[-0.03em] sm:text-4xl">
                There&apos;s always another moment
                to capture.
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/gallery"
                className="inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition hover:bg-ivory"
              >
                Share a moment
                <span>→</span>
              </Link>

              <Link
                href="/my"
                className="inline-flex items-center gap-3 rounded-full bg-ivory/10 px-6 py-3.5 text-sm font-semibold text-ivory transition hover:bg-ivory/20"
              >
                My JCWF
              </Link>
            </div>
          </div>
        </section>
      </div>

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

