"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Member = {
  id: string;
  fullName: string;
  reconnectId: string;
  city: string | null;
  joinedAt: string;
};

type Community = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  instagramUrl: string | null;
  websiteUrl: string | null;
  status: string;
};

const fallbackImages: Record<string, string> = {
  "Mind & Body": "/images/activity-wellness.jpg",
  "Healing & Therapy": "/images/activity-wellness.jpg",
  "Nature Connection": "/images/activity-culture.jpg",
  "Creative Experience": "/images/activity-community.jpg",
  "Culinary Wellness": "/images/activity-culinary.jpg",
};

export default function CommunityDetailPage() {
  const params = useParams();
  const router = useRouter();

  const slug = params.slug as string;

  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [joined, setJoined] = useState(false);

  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCommunity() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/communities/${slug}`, {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Community not found");
        }

        setCommunity(data.community);
        setMembers(data.members ?? []);
        setMemberCount(data.memberCount ?? 0);
        setJoined(data.joined ?? false);
      } catch (error) {
        console.error("FETCH COMMUNITY ERROR:", error);

        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchCommunity();
    }
  }, [slug]);

  async function handleJoin() {
    if (!community || joining || joined) {
      return;
    }

    try {
      setJoining(true);
      setError("");

      const response = await fetch("/api/communities/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId: community.id,
        }),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push(
          `/login?redirect=/communities/${community.slug}`
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to join community"
        );
      }

      setJoined(true);
      setMemberCount((current) => current + 1);
    } catch (error) {
      console.error("JOIN COMMUNITY ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to join community"
      );
    } finally {
      setJoining(false);
    }
  }

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="min-h-screen bg-ivory text-forest">
        <header className="border-b border-forest/6">
          <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 md:h-[76px] md:px-10 lg:px-14">
            <div className="h-9 w-28 animate-pulse rounded-full bg-sage/50" />

            <div className="h-9 w-20 animate-pulse rounded-full bg-sage/50" />
          </div>
        </header>

        <div className="mx-auto max-w-[1100px] px-5 py-8 md:px-10 md:py-14">
          <div className="grid gap-7 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div className="aspect-[1.15/0.9] animate-pulse rounded-[1.5rem] bg-sage/55" />

            <div>
              <div className="h-3 w-28 animate-pulse rounded-full bg-sage/60" />

              <div className="mt-5 h-20 max-w-lg animate-pulse rounded-2xl bg-sage/50" />

              <div className="mt-5 h-12 max-w-xl animate-pulse rounded-2xl bg-sage/40" />

              <div className="mt-7 h-11 w-36 animate-pulse rounded-full bg-sage/55" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (error && !community) {
    return (
      <main className="min-h-screen bg-ivory text-forest">
        <div className="mx-auto flex min-h-screen max-w-[1100px] flex-col justify-center px-5 py-20 md:px-10">
          <Link
            href="/communities"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-forest/10 bg-white/70 px-4 py-2.5 text-xs font-semibold text-forest shadow-[0_5px_18px_rgba(23,56,42,0.05)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-sage"
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </Link>

          <p className="mt-12 text-[9px] font-semibold uppercase tracking-[0.2em] text-gold">
            Community
          </p>

          <h1 className="mt-3 font-display text-5xl leading-[0.9] tracking-[-0.05em] md:text-7xl">
            Community
            <br />
            not found.
          </h1>

          <p className="mt-5 max-w-md text-sm leading-6 text-forest/45">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!community) {
    return null;
  }

  const image =
    community.imageUrl ||
    fallbackImages[community.category] ||
    "/images/activity-community.jpg";

  return (
    <main className="min-h-screen bg-ivory text-forest">
      {/* ========================================================
          HEADER
      ========================================================= */}
      <header className="border-b border-forest/6 bg-ivory/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[66px] max-w-[1100px] items-center justify-between px-5 md:h-[72px] md:px-8">
          <Link
            href="/communities"
            className="inline-flex items-center gap-1.5 rounded-full border border-forest/10 bg-white/70 px-4 py-2.5 text-xs font-semibold text-forest shadow-[0_5px_18px_rgba(23,56,42,0.05)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-sage"
          >
            <span aria-hidden="true">←</span>
            <span>Back</span>
          </Link>

          <Link
            href="/my"
            className="rounded-full bg-forest px-4 py-2.5 text-[10px] font-semibold text-ivory transition-all hover:bg-gold hover:text-forest md:px-5 md:text-xs"
          >
            My JCWF
          </Link>
        </div>
      </header>

      {/* ========================================================
          HERO
      ========================================================= */}
      <section className="mx-auto max-w-[1100px] px-5 pb-12 pt-7 md:px-8 md:pb-16 md:pt-12">
        <div className="grid gap-7 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-12">
          {/* IMAGE */}
          <div className="overflow-hidden rounded-[1.5rem] bg-sage md:rounded-[1.75rem]">
            <img
              src={image}
              alt={community.name}
              className="aspect-[1.15/0.9] w-full object-cover"
            />
          </div>

          {/* CONTENT */}
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />

              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-gold md:text-[10px]">
                JCWF Community
              </p>
            </div>

            <p className="mt-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-forest/35">
              {community.category}
            </p>

            <h1 className="mt-2 max-w-2xl font-display text-[clamp(2.8rem,6vw,5.8rem)] font-medium leading-[0.88] tracking-[-0.06em] text-forest">
              {community.name}
            </h1>

            {community.description && (
              <p className="mt-5 max-w-xl text-xs leading-5 text-forest/50 md:text-sm md:leading-6">
                {community.description}
              </p>
            )}

            {/* JOIN + COUNT */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5">
              {joined ? (
                <button
                  type="button"
                  disabled
                  className="rounded-full bg-gold px-5 py-3 text-xs font-semibold text-forest"
                >
                  Joined
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={joining}
                  className="rounded-full bg-forest px-5 py-3 text-xs font-semibold text-ivory transition-all hover:-translate-y-0.5 hover:bg-gold hover:text-forest disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {joining ? "Joining..." : "Join Community"}
                </button>
              )}

              <span className="rounded-full border border-forest/10 bg-white/60 px-4 py-3 text-[10px] font-semibold text-forest/50 backdrop-blur-md">
                {memberCount}{" "}
                {memberCount === 1 ? "member" : "members"}
              </span>
            </div>

            {error && (
              <p className="mt-3 text-xs text-red-500">
                {error}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================
          INFO STRIP
      ========================================================= */}
      <section className="border-y border-forest/8 bg-sage/35">
        <div className="mx-auto grid max-w-[1100px] grid-cols-2 md:grid-cols-3">
          <div className="px-5 py-5 md:px-8 md:py-6">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-forest/35">
              Category
            </p>

            <p className="mt-1.5 text-sm font-medium text-forest md:text-base">
              {community.category}
            </p>
          </div>

          <div className="border-l border-forest/8 px-5 py-5 md:px-8 md:py-6">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-forest/35">
              Members
            </p>

            <p className="mt-1.5 text-sm font-medium text-forest md:text-base">
              {memberCount}
            </p>
          </div>

          <div className="hidden border-l border-forest/8 px-8 py-6 md:block">
            <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-forest/35">
              Festival
            </p>

            <p className="mt-1.5 text-sm font-medium text-forest md:text-base">
              JCWF 2026
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================
          MEMBERS
      ========================================================= */}
      <section className="mx-auto max-w-[1100px] px-5 py-12 md:px-8 md:py-16">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
              Community
            </p>

            <h2 className="mt-2 font-display text-3xl leading-none tracking-[-0.045em] text-forest md:text-4xl">
              Members
            </h2>
          </div>

          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-forest/30 md:text-[10px]">
            {memberCount}{" "}
            {memberCount === 1 ? "person" : "people"}
          </p>
        </div>

        {members.length === 0 ? (
          <div className="mt-6 rounded-[1.25rem] bg-sage/40 px-5 py-7">
            <p className="text-xs leading-5 text-forest/45">
              No members yet. Be the first to join this community.
            </p>

            {!joined && (
              <button
                type="button"
                onClick={handleJoin}
                disabled={joining}
                className="mt-4 rounded-full bg-forest px-5 py-2.5 text-[10px] font-semibold text-ivory transition-all hover:bg-gold hover:text-forest disabled:opacity-50"
              >
                {joining ? "Joining..." : "Join Community"}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[1.25rem] bg-white">
            {members.map((member, index) => (
              <div
                key={member.id}
                className={`flex items-center gap-3.5 px-4 py-3.5 md:px-5 ${
                  index !== members.length - 1
                    ? "border-b border-forest/7"
                    : ""
                }`}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-[10px] font-bold text-forest md:h-10 md:w-10 md:text-xs">
                  {member.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold text-forest md:text-xs">
                    {member.fullName}
                  </p>

                  <p className="mt-0.5 truncate text-[8px] text-forest/30 md:text-[9px]">
                    {member.reconnectId}
                  </p>
                </div>

                {member.city && (
                  <p className="hidden text-[9px] text-forest/35 sm:block md:text-[10px]">
                    {member.city}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ========================================================
          SOCIAL LINKS
      ========================================================= */}
      {(community.instagramUrl || community.websiteUrl) && (
        <section className="border-t border-forest/8 bg-sage/25">
          <div className="mx-auto flex max-w-[1100px] flex-col gap-4 px-5 py-7 sm:flex-row sm:items-center sm:justify-between md:px-8">
            <div>
              <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-gold">
                Stay connected
              </p>

              <p className="mt-1 font-display text-lg tracking-[-0.025em] text-forest md:text-xl">
                Find this community online.
              </p>
            </div>

            <div className="flex gap-2">
              {community.instagramUrl && (
                <a
                  href={community.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-forest/10 bg-white/65 px-4 py-2.5 text-[9px] font-semibold text-forest backdrop-blur-md transition-all hover:bg-gold"
                >
                  Instagram
                </a>
              )}

              {community.websiteUrl && (
                <a
                  href={community.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-forest/10 bg-white/65 px-4 py-2.5 text-[9px] font-semibold text-forest backdrop-blur-md transition-all hover:bg-gold"
                >
                  Website
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ========================================================
          FOOTER
      ========================================================= */}
      <footer className="mx-auto max-w-[1100px] px-5 pb-6 pt-5 md:px-8">
        <div className="flex flex-col gap-1.5 border-t border-forest/8 pt-5 text-[8px] text-forest/30 sm:flex-row sm:items-center sm:justify-between md:text-[9px]">
          <p>JCWF 2026 · Jogja Cultural Wellness Festival</p>

          <p>Reconnecting — People, Culture & Wellbeing</p>
        </div>
      </footer>
    </main>
  );
}