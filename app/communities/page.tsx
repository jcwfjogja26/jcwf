"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Community = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  memberCount: number;
  createdAt: string;
};

const fallbackImages: Record<string, string> = {
  "jogja-yoga-community": "/images/activity-wellness.jpg",
  "sound-healing-jogja": "/images/activity-wellness.jpg",
  "green-jogja-collective": "/images/activity-culture.jpg",
  "jogja-creative-circle": "/images/activity-community.jpg",
  "wellness-kitchen-jogja": "/images/activity-culinary.jpg",
};

function getImage(community: Community) {
  return (
    community.imageUrl ||
    fallbackImages[community.slug] ||
    "/images/activity-community.jpg"
  );
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function fetchCommunities() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/communities", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Gagal mengambil data communities."
          );
        }

        setCommunities(data.communities || []);
      } catch (error) {
        console.error("FETCH COMMUNITIES ERROR:", error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Gagal mengambil data communities."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCommunities();
  }, []);

  return (
    <main className="min-h-screen bg-ivory text-forest">
      {/* =====================================================
          NAVBAR
      ====================================================== */}
      <header className="sticky top-0 z-50 border-b border-forest/6 bg-ivory/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 md:h-[76px] md:px-10 lg:px-14">
          <Link
            href="/"
            className="font-display text-[26px] font-semibold tracking-[-0.05em] text-forest"
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
              href="/communities"
              className="font-semibold text-forest"
            >
              Communities
            </Link>
          </nav>

          <Link
            href="/my"
            className="rounded-full bg-forest px-4 py-2.5 text-[11px] font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest md:px-5 md:text-xs"
          >
            My JCWF
          </Link>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}
      <div className="mx-auto max-w-[1440px] px-5 pb-14 pt-9 md:px-10 md:pb-24 md:pt-14 lg:px-14">

        {/* ===================================================
            INTRO
        ==================================================== */}
        <section>
          <div className="grid gap-6 lg:grid-cols-[1fr_0.55fr] lg:items-end lg:gap-16">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />

                <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold md:text-xs">
                  JCWF Community
                </p>
              </div>

              <h1 className="mt-3 font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.06em] text-forest md:mt-4">
                Find your
                <br />
                <span className="text-gold">people.</span>
              </h1>
            </div>

            <p className="max-w-md text-xs leading-5 text-forest/50 md:text-[15px] md:leading-7 lg:pb-1">
              Discover communities across Jogja connected
              by wellness, culture, creativity, nature, and
              shared experiences.
            </p>
          </div>
        </section>

        {/* ===================================================
            COMMUNITY SECTION
        ==================================================== */}
        <section className="mt-9 md:mt-16">
          {loading ? (
            <>
              {/* MOBILE LOADING */}
              <div className="flex gap-3 overflow-hidden md:hidden">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="w-[61vw] max-w-[250px] shrink-0 overflow-hidden rounded-[1.35rem] bg-white"
                  >
                    <div className="aspect-[1.18/1] animate-pulse bg-sage/50" />

                    <div className="space-y-2.5 p-4">
                      <div className="h-5 w-3/4 animate-pulse rounded-full bg-sage/50" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded-full bg-sage/60" />
                      <div className="h-8 w-full animate-pulse rounded-full bg-sage/40" />
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP LOADING */}
              <div className="hidden gap-4 md:grid md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="overflow-hidden rounded-[1.5rem] bg-white"
                  >
                    <div className="aspect-[1.2/1] animate-pulse bg-sage/50" />

                    <div className="space-y-3 p-5">
                      <div className="h-7 w-3/4 animate-pulse rounded-full bg-sage/50" />
                      <div className="h-3 w-1/3 animate-pulse rounded-full bg-sage/60" />
                      <div className="h-10 w-full animate-pulse rounded-full bg-sage/40" />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : errorMessage ? (
            <div className="rounded-[1.5rem] bg-white px-5 py-14 text-center md:rounded-[1.75rem] md:py-20">
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
                Community
              </p>

              <h2 className="mt-3 font-display text-3xl tracking-[-0.04em] text-forest md:text-4xl">
                Something went wrong
              </h2>

              <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-forest/45 md:text-sm md:leading-6">
                {errorMessage}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest md:px-6 md:py-3.5 md:text-sm"
              >
                Try Again
              </button>
            </div>
          ) : communities.length === 0 ? (
            <div className="rounded-[1.5rem] bg-sage/45 px-5 py-14 text-center md:rounded-[1.75rem] md:py-20">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-forest text-[10px] font-semibold text-gold">
                JC
              </div>

              <h2 className="mt-5 font-display text-3xl tracking-[-0.04em] text-forest">
                No communities yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-xs leading-5 text-forest/45 md:text-sm md:leading-6">
                Communities will appear here as they become
                available.
              </p>
            </div>
          ) : (
            <>
              {/* =================================================
                  MOBILE
              ================================================== */}
              <div className="md:hidden">
                <div className="mb-4 flex items-end justify-between">
                  <div>
                    <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-forest/35">
                      Community directory
                    </p>

                    <p className="mt-1 text-[10px] text-forest/40">
                      Swipe to explore
                    </p>
                  </div>

                  <Link
                    href="/communities"
                    className="text-[10px] font-semibold text-forest"
                  >
                    View all
                  </Link>
                </div>

                <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-3 scrollbar-none">
                  {communities.map((community) => (
                    <Link
                      key={community.id}
                      href={`/communities/${community.slug}`}
                      className="group flex w-[61vw] max-w-[250px] shrink-0 snap-start flex-col overflow-hidden rounded-[1.35rem] bg-white shadow-[0_6px_24px_rgba(23,56,42,0.045)]"
                    >
                      {/* IMAGE */}
                      <div className="relative aspect-[1.18/1] shrink-0 overflow-hidden bg-sage">
                        <img
                          src={getImage(community)}
                          alt={community.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        />

                        <div className="absolute left-3 top-3">
                          <span className="inline-flex rounded-full bg-ivory/90 px-2.5 py-1.5 text-[7px] font-bold uppercase tracking-[0.12em] text-forest backdrop-blur-md">
                            {community.category}
                          </span>
                        </div>
                      </div>

                      {/* CONTENT */}
                      <div className="flex min-h-[166px] flex-1 flex-col p-4">
                        {/* TITLE AREA */}
                        <div className="min-h-[48px]">
                          <h2 className="line-clamp-2 font-display text-[1.35rem] leading-[0.98] tracking-[-0.035em] text-forest">
                            {community.name}
                          </h2>
                        </div>

                        {/* MEMBER */}
                        <p className="mt-1.5 h-3 text-[8px] font-semibold uppercase tracking-[0.13em] text-gold">
                          {community.memberCount}{" "}
                          {community.memberCount === 1
                            ? "member"
                            : "members"}
                        </p>

                        {/* DESCRIPTION */}
                        <p className="mt-2.5 line-clamp-2 h-8 text-[10px] leading-4 text-forest/45">
                          {community.description ||
                            "Discover people, stories, and experiences within this community."}
                        </p>

                        {/* LINK */}
                        <div className="mt-auto border-t border-forest/8 pt-3.5">
                          <span className="text-[9px] font-semibold text-forest transition-colors group-hover:text-gold">
                            Explore community
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* =================================================
                  DESKTOP
              ================================================== */}
              <div className="hidden md:grid md:grid-cols-2 md:gap-4 lg:grid-cols-3">
                {communities.map((community) => (
                  <Link
                    key={community.id}
                    href={`/communities/${community.slug}`}
                    className="group flex flex-col overflow-hidden rounded-[1.5rem] bg-white transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(23,56,42,0.08)]"
                  >
                    {/* IMAGE */}
                    <div className="relative aspect-[1.2/1] shrink-0 overflow-hidden bg-sage">
                      <img
                        src={getImage(community)}
                        alt={community.name}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />

                      <div className="absolute left-4 top-4">
                        <span className="inline-flex rounded-full bg-ivory/90 px-3 py-1.5 text-[8px] font-bold uppercase tracking-[0.12em] text-forest backdrop-blur-md">
                          {community.category}
                        </span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="flex min-h-[205px] flex-1 flex-col p-5">
                      <div className="min-h-[54px]">
                        <h2 className="line-clamp-2 font-display text-[1.6rem] leading-[0.98] tracking-[-0.035em] text-forest">
                          {community.name}
                        </h2>
                      </div>

                      <p className="mt-1.5 h-3 text-[9px] font-semibold uppercase tracking-[0.13em] text-gold">
                        {community.memberCount}{" "}
                        {community.memberCount === 1
                          ? "member"
                          : "members"}
                      </p>

                      <p className="mt-3 line-clamp-2 h-10 text-xs leading-5 text-forest/45">
                        {community.description ||
                          "Discover people, stories, and experiences within this community."}
                      </p>

                      <div className="mt-auto border-t border-forest/8 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-semibold text-forest transition-colors group-hover:text-gold">
                            Explore community
                          </span>

                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-[10px] font-semibold text-forest transition-colors group-hover:bg-gold">
                            {getInitial(community.name)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </section>

        {/* =====================================================
            BOTTOM CTA
        ====================================================== */}
        {!loading &&
          !errorMessage &&
          communities.length > 0 && (
            <section className="mt-8 rounded-[1.5rem] bg-sage/55 px-5 py-6 md:mt-14 md:rounded-[1.75rem] md:px-8 md:py-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-gold md:text-[9px]">
                    Beyond the festival
                  </p>

                  <h2 className="mt-1.5 max-w-xl font-display text-xl leading-[1.05] tracking-[-0.035em] text-forest md:text-3xl">
                    Some connections continue long after JCWF.
                  </h2>
                </div>

                <Link
                  href="/#activities"
                  className="inline-flex w-fit shrink-0 rounded-full bg-forest px-4 py-2.5 text-[10px] font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest md:px-6 md:py-3.5 md:text-sm"
                >
                  Explore JCWF
                </Link>
              </div>
            </section>
          )}
      </div>

      {/* =====================================================
          FOOTER
      ====================================================== */}
      <footer className="mx-auto max-w-[1440px] px-5 pb-7 pt-6 md:px-10 md:pt-7 lg:px-14">
        <div className="flex flex-col gap-2 border-t border-forest/8 pt-5 text-[9px] text-forest/30 sm:flex-row sm:items-center sm:justify-between md:text-xs">
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