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
    <main className="min-h-screen bg-[#F8F6EF] text-[#183D31]">
      {/* Header */}
      <header className="mx-auto max-w-7xl px-6 pb-4 pt-12 lg:px-10 lg:pt-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#A87835]">
              JCWF 2026
            </p>

            <h1 className="mt-4 font-serif text-5xl leading-none tracking-tight text-[#183D31] sm:text-6xl lg:text-7xl">
              Explore Communities
            </h1>

            <p className="mt-5 max-w-3xl text-base leading-7 text-[#66706A] sm:text-lg">
              Meet people and communities connected by wellness, culture,
              creativity, nature, and shared experiences.
            </p>
          </div>

          <Link
            href="/my"
            className="hidden shrink-0 rounded-full border border-[#183D31]/15 bg-white px-7 py-3.5 text-base font-medium text-[#183D31] transition hover:border-[#183D31]/30 hover:bg-[#183D31] hover:text-white sm:inline-flex"
          >
            My Plan
          </Link>
        </div>

        {/* Mobile My Plan */}
        <Link
          href="/my"
          className="mt-7 inline-flex rounded-full border border-[#183D31]/15 bg-white px-6 py-3 text-sm font-medium text-[#183D31] transition hover:bg-[#183D31] hover:text-white sm:hidden"
        >
          My Plan
        </Link>
      </header>

      {/* Community Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-20 pt-10 lg:px-10 lg:pb-28 lg:pt-12">
        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <p className="text-sm text-[#66706A]">
              Loading communities...
            </p>
          </div>
        ) : errorMessage ? (
          <div className="rounded-[28px] border border-[#183D31]/10 bg-white p-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A87835]">
              Community
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#183D31]">
              Something went wrong
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#66706A]">
              {errorMessage}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-7 rounded-full bg-[#183D31] px-6 py-3 text-sm font-medium text-white transition hover:opacity-85"
            >
              Try Again
            </button>
          </div>
        ) : communities.length === 0 ? (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[28px] border border-[#183D31]/10 bg-white px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A87835]">
              Community
            </p>

            <h2 className="mt-3 font-serif text-3xl text-[#183D31]">
              No communities yet
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#66706A]">
              Communities will appear here as they become available.
            </p>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {communities.map((community) => (
              <Link
                key={community.id}
                href={`/communities/${community.slug}`}
                className="group overflow-hidden rounded-[28px] border border-[#183D31]/10 bg-white shadow-[0_2px_8px_rgba(24,61,49,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(24,61,49,0.12)]"
              >
                {/* Image */}
                <div className="relative aspect-[1.15/1] overflow-hidden bg-[#E7E5DC]">
                  <img
                    src={getImage(community)}
                    alt={community.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />

                  {/* Category */}
                  <div className="absolute left-5 top-5">
                    <span className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[#183D31] shadow-sm">
                      {community.category}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A87835]">
                    {community.memberCount}{" "}
                    {community.memberCount === 1
                      ? "MEMBER"
                      : "MEMBERS"}
                  </p>

                  <h2 className="mt-4 font-serif text-[28px] leading-tight text-[#183D31]">
                    {community.name}
                  </h2>

                  <p className="mt-4 line-clamp-3 min-h-[72px] text-[15px] leading-6 text-[#66706A]">
                    {community.description ||
                      "Discover people, stories, and experiences within this community."}
                  </p>

                  <div className="mt-7 border-t border-[#183D31]/10 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs text-[#7B847F]">
                          Community
                        </p>

                        <p className="mt-1 text-sm font-medium text-[#183D31]">
                          Join the community
                        </p>
                      </div>

                      <span className="inline-flex shrink-0 items-center rounded-full bg-[#183D31] px-5 py-3 text-sm font-medium text-white transition group-hover:bg-[#234F40]">
                        View Community
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}