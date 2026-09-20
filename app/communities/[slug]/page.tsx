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

  const [community, setCommunity] =
    useState<Community | null>(null);

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

        const response = await fetch(
          `/api/communities/${slug}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Community not found"
          );
        }

        setCommunity(data.community);
        setMembers(data.members ?? []);
        setMemberCount(data.memberCount ?? 0);
        setJoined(data.joined ?? false);
      } catch (error) {
        console.error(error);

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

      const response = await fetch(
        "/api/communities/join",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            communityId: community.id,
          }),
        }
      );

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

      // Update jumlah member
      setMemberCount((current) => current + 1);

      // Tidak perlu fetch /api/me.
      // Button langsung berubah menjadi Joined ✓.
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to join community"
      );
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8F7F3] text-[#151515]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <p className="text-sm text-black/40">
            Loading community...
          </p>
        </div>
      </main>
    );
  }

  if (error && !community) {
    return (
      <main className="min-h-screen bg-[#F8F7F3] text-[#151515]">
        <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
          <Link
            href="/communities"
            className="text-sm text-black/50 transition hover:text-black"
          >
            ← Back to communities
          </Link>

          <h1 className="mt-10 text-3xl font-medium">
            Community not found
          </h1>

          <p className="mt-3 text-black/50">
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
    <main className="min-h-screen bg-[#F8F7F3] text-[#151515]">
      {/* Header */}
      <header className="h-20">
        <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link
            href="/communities"
            className="text-sm text-black/50 transition hover:text-black"
          >
            ← Communities
          </Link>

          <Link
            href="/my"
            className="text-sm text-black/50 transition hover:text-black"
          >
            My
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-8 lg:px-10 lg:pb-28">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          {/* Image */}
          <div className="overflow-hidden rounded-[28px] bg-black/5">
            <img
              src={image}
              alt={community.name}
              className="aspect-[4/3] h-full w-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="lg:pb-4">
            <p className="text-sm uppercase tracking-[0.18em] text-black/40">
              {community.category}
            </p>

            <h1 className="mt-5 max-w-xl text-5xl font-medium leading-[0.95] tracking-[-0.04em] sm:text-6xl">
              {community.name}
            </h1>

            {community.description && (
              <p className="mt-7 max-w-lg text-base leading-7 text-black/60">
                {community.description}
              </p>
            )}

            {/* Join Button */}
            <div className="mt-9">
              {joined ? (
                <button
                  type="button"
                  disabled
                  className="rounded-full bg-[#151515] px-7 py-3.5 text-sm font-medium text-white"
                >
                  Joined ✓
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleJoin}
                  disabled={joining}
                  className="rounded-full bg-[#151515] px-7 py-3.5 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {joining
                    ? "Joining..."
                    : "Join Community"}
                </button>
              )}

              {error && (
                <p className="mt-3 text-sm text-red-500">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Details */}
      <section className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-3">
            {/* About */}
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                About
              </p>

              <p className="mt-4 max-w-md text-sm leading-7 text-black/60">
                A community connected through shared
                interests, experiences, and activities at
                JCWF 2026.
              </p>
            </div>

            {/* Category */}
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                Category
              </p>

              <p className="mt-4 text-lg">
                {community.category}
              </p>
            </div>

            {/* Members */}
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                Members
              </p>

              <p className="mt-4 text-lg">
                {memberCount}{" "}
                {memberCount === 1
                  ? "member"
                  : "members"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Members */}
      <section className="border-t border-black/10">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-black/40">
                Community
              </p>

              <h2 className="mt-3 text-3xl font-medium tracking-[-0.03em]">
                Members
              </h2>
            </div>

            <p className="text-sm text-black/40">
              {memberCount}{" "}
              {memberCount === 1
                ? "person"
                : "people"}
            </p>
          </div>

          {members.length === 0 ? (
            <div className="mt-10 border-y border-black/10 py-10">
              <p className="text-sm text-black/40">
                No members yet. Be the first to join.
              </p>
            </div>
          ) : (
            <div className="mt-10 divide-y divide-black/10 border-y border-black/10">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between gap-6 py-5"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {member.fullName}
                    </p>

                    <p className="mt-1 text-xs text-black/40">
                      {member.reconnectId}
                    </p>
                  </div>

                  {member.city && (
                    <p className="text-sm text-black/40">
                      {member.city}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Links */}
      {(community.instagramUrl ||
        community.websiteUrl) && (
        <section className="border-t border-black/10">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between lg:px-10">
            <p className="text-sm text-black/40">
              Find this community online
            </p>

            <div className="flex gap-6">
              {community.instagramUrl && (
                <a
                  href={community.instagramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm transition hover:opacity-50"
                >
                  Instagram ↗
                </a>
              )}

              {community.websiteUrl && (
                <a
                  href={community.websiteUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm transition hover:opacity-50"
                >
                  Website ↗
                </a>
              )}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}