import Link from "next/link";
import type { Metadata } from "next";

type StoryResponse = {
  story: {
    id: string;
    reflection: string;
    sharedAt: string | null;
    createdAt: string;
    participant: {
      fullName: string;
      reconnectId: string;
    } | null;
  };
};

async function getStory(
  token: string
): Promise<StoryResponse | null> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  try {
    const response = await fetch(
      `${baseUrl}/api/story/${token}`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return null;
    }

    return response.json();
  } catch {
    return null;
  }
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateString));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}): Promise<Metadata> {
  const { token } = await params;

  const data = await getStory(token);

  if (!data?.story) {
    return {
      title: "Story Not Found — JCWF 2026",
      description:
        "This JCWF story is no longer available.",
    };
  }

  const story = data.story;

  const participantName =
    story.participant?.fullName ||
    "JCWF Participant";

  const description =
    story.reflection.length > 160
      ? `${story.reflection.slice(0, 157)}...`
      : story.reflection;

  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const storyUrl = `${baseUrl}/story/${token}`;

  const imageUrl = `${storyUrl}/opengraph-image`;

  return {
    title: `${participantName}'s JCWF Story`,
    description,
    alternates: {
      canonical: storyUrl,
    },
    openGraph: {
      title: `${participantName}'s JCWF Story`,
      description,
      url: storyUrl,
      siteName: "Jogja Cultural Wellness Festival",
      type: "article",
      publishedTime: story.createdAt,
      modifiedTime: story.sharedAt || story.createdAt,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: "My JCWF Story — A Story Today, A Brighter Tomorrow",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${participantName}'s JCWF Story`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SharedStoryPage({
  params,
}: {
  params: Promise<{
    token: string;
  }>;
}) {
  const { token } = await params;

  const data = await getStory(token);

  if (!data?.story) {
    return (
      <main className="min-h-screen bg-[#F7F4EA] px-5 py-16">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#1D241B] text-lg font-serif text-white">
            J
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#7B816D]">
            JCWF 2026
          </p>

          <h1 className="mt-4 font-serif text-3xl text-[#1D241B]">
            Story not found
          </h1>

          <p className="mt-3 text-sm leading-6 text-[#62675B]">
            This story may no longer be available or
            the link may have expired.
          </p>

          <Link
            href="/"
            className="mt-7 inline-flex rounded-full bg-[#1D241B] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#30382D]"
          >
            Back to JCWF
          </Link>
        </div>
      </main>
    );
  }

  const { story } = data;

  const participantName =
    story.participant?.fullName ||
    "JCWF Participant";

  return (
    <main className="min-h-screen bg-[#F7F4EA] px-5 py-10 sm:py-16">
      <div className="mx-auto max-w-2xl">
        {/* Brand */}
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#1D241B] font-serif text-sm text-white">
            J
          </div>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7B816D]">
            Jogja Cultural Wellness Festival
          </p>

          <p className="mt-2 text-xs text-[#85897D]">
            JCWF 2026 · Yogyakarta
          </p>
        </div>

        {/* Main Heading */}
        <div className="mt-10 text-center sm:mt-12">
          <h1 className="font-serif text-4xl leading-[1.08] text-[#1D241B] sm:text-5xl">
            A Story Today,
            <br />
            <span className="text-[#697257]">
              A Brighter Tomorrow
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-[#62675B]">
            A reflection from someone who reconnected
            with people, culture, and wellbeing at JCWF.
          </p>
        </div>

        {/* Story Card */}
        <article className="relative mt-9 overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_20px_60px_rgba(29,36,27,0.08)] sm:mt-11">
          {/* Decorative top */}
          <div className="h-2 bg-[#1D241B]" />

          <div className="p-7 sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7B816D]">
                  My JCWF Story
                </p>

                <p className="mt-2 text-xs text-[#A0A398]">
                  {formatDate(story.createdAt)}
                </p>
              </div>

              <div className="rounded-full bg-[#E8EEE2] px-3 py-1.5 text-[10px] font-medium text-[#53604A]">
                Shared
              </div>
            </div>

            {/* Reflection */}
            <div className="mt-8">
              <p className="font-serif text-xl leading-8 text-[#30352D] sm:text-2xl sm:leading-9">
                “{story.reflection}”
              </p>
            </div>

            {/* Author */}
            <div className="mt-9 border-t border-black/5 pt-6">
              <p className="text-sm font-semibold text-[#1D241B]">
                {participantName}
              </p>

              {story.participant?.reconnectId && (
                <p className="mt-1 text-xs text-[#85897D]">
                  {story.participant.reconnectId}
                </p>
              )}
            </div>
          </div>
        </article>

        {/* Footer message */}
        <div className="mt-8 text-center">
          <p className="font-serif text-lg text-[#30352D]">
            Reconnecting starts with a moment.
          </p>

          <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#85897D]">
            People, Culture &amp; Wellbeing
          </p>

          <Link
            href="/"
            className="mt-6 inline-flex rounded-full border border-black/10 bg-white px-5 py-3 text-xs font-medium text-[#30352D] transition hover:bg-black/[0.03]"
          >
            Explore JCWF →
          </Link>
        </div>

        <div className="pb-6 pt-10 text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#A0A398]">
            Jogja Cultural Wellness Festival · 2026
          </p>
        </div>
      </div>
    </main>
  );
}