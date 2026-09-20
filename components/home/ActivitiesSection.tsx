"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Activity = {
  id: string;
  slug: string;
  title: string;
  status: string;
};

export default function ActivitiesSection() {
  const { t } = useLanguage();

  const [activitiesData, setActivitiesData] = useState<
    Activity[]
  >([]);

  const [joiningSlug, setJoiningSlug] = useState<
    string | null
  >(null);

  const [joinMessage, setJoinMessage] = useState("");

  const activities = [
    {
      key: "morningReset",
      slug: "morning-reset",
      image: "/images/activity-wellness.jpg",
      featured: true,
    },
    {
      key: "livingHeritage",
      slug: "living-heritage",
      image: "/images/activity-culture.jpg",
      featured: false,
    },
    {
      key: "circleStories",
      slug: "circle-of-stories",
      image: "/images/activity-community.jpg",
      featured: false,
    },
    {
      key: "tasteJogja",
      slug: "taste-of-jogja",
      image: "/images/activity-culinary.jpg",
      featured: false,
    },
  ] as const;

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch(
          "/api/activities"
        );

        if (!response.ok) {
          throw new Error(
            "Failed to load activities."
          );
        }

        const data = await response.json();

        setActivitiesData(
          data.activities ?? []
        );
      } catch (error) {
        console.error(
          "LOAD ACTIVITIES ERROR:",
          error
        );
      }
    }

    loadActivities();
  }, []);

  async function handleJoinActivity(
    slug: string
  ) {
    setJoinMessage("");

    const activity =
      activitiesData.find(
        (item) => item.slug === slug
      );

    if (!activity) {
      setJoinMessage(
        "Activity belum tersedia."
      );
      return;
    }

    setJoiningSlug(slug);

    try {
      const response = await fetch(
        "/api/activities/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            activityId: activity.id,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        window.location.href =
          "/login?redirect=/activities";
        return;
      }

      if (response.status === 409) {
        setJoinMessage(
          data.message ||
            "Kamu sudah terdaftar di activity ini."
        );
        return;
      }

      if (!response.ok) {
        setJoinMessage(
          data.message ||
            "Gagal bergabung ke activity."
        );
        return;
      }

      setJoinMessage(
        "Activity berhasil ditambahkan ke My Plan."
      );
    } catch (error) {
      console.error(
        "JOIN ACTIVITY ERROR:",
        error
      );

      setJoinMessage(
        "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setJoiningSlug(null);
    }
  }

  const featuredActivity = activities.find(
    (activity) => activity.featured
  );

  const otherActivities =
    activities.filter(
      (activity) => !activity.featured
    );

  return (
    <section
      id="activities"
      className="relative overflow-hidden bg-ivory py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.activities.eyebrow}
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.activities.titleLine1}
              <br />
              <span className="text-gold">
                {t.activities.titleLine2}
              </span>
            </h2>
          </div>

          <div className="max-w-sm md:pb-2">
            <p className="text-sm leading-7 text-forest/60 md:text-[15px]">
              {t.activities.description}
            </p>
          </div>
        </div>

        {/* FEATURED + ACTIVITIES */}
        <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-[1.35fr_0.65fr]">

          {/* FEATURED ACTIVITY */}
          {featuredActivity && (
            <article className="group relative min-h-[520px] overflow-hidden rounded-[2rem] bg-forest md:min-h-[620px]">

              {/* Image */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                style={{
                  backgroundImage: `linear-gradient(
                    180deg,
                    rgba(23, 56, 42, 0.02) 20%,
                    rgba(23, 56, 42, 0.18) 45%,
                    rgba(23, 56, 42, 0.9) 100%
                  ), url('${featuredActivity.image}')`,
                }}
              />

              {/* Content */}
              <div className="absolute inset-x-0 bottom-0 p-7 md:p-10 lg:p-12">

                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-gold px-3 py-1.5 text-[10px] font-bold tracking-[0.15em] text-forest">
                    {t.activities.items.morningReset.category}
                  </span>

                  <span className="text-xs font-medium text-white/70">
                    {t.activities.featuredLabel}
                  </span>
                </div>

                <h3 className="mt-5 max-w-2xl font-display text-4xl leading-[0.95] tracking-[-0.04em] text-white md:text-6xl">
                  {t.activities.items.morningReset.title}
                </h3>

                <p className="mt-5 max-w-xl text-sm leading-6 text-white/70 md:text-[15px]">
                  {t.activities.items.morningReset.description}
                </p>

                {/* Meta */}
                <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-white/70">
                  <span>
                    <strong className="font-semibold text-white">
                      {t.activities.items.morningReset.date}
                    </strong>{" "}
                    ·{" "}
                    {t.activities.items.morningReset.time}
                  </span>

                  <span>
                    {t.activities.items.morningReset.location}
                  </span>
                </div>

                {/* JOIN */}
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      handleJoinActivity(
                        featuredActivity.slug
                      )
                    }
                    disabled={
                      joiningSlug !== null
                    }
                    className="group/join inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {joiningSlug ===
                    featuredActivity.slug
                      ? "Joining..."
                      : "Join Activity"}

                    <span className="transition-transform duration-300 group-hover/join:translate-x-1">
                      →
                    </span>
                  </button>

                  {joinMessage && (
                    <span className="text-xs text-white/70">
                      {joinMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute right-7 top-7 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-lg text-forest shadow-lg backdrop-blur-sm transition-all duration-500 group-hover:rotate-45 group-hover:bg-gold md:right-10 md:top-10">
                ↗
              </div>
            </article>
          )}

          {/* OTHER ACTIVITIES */}
          <div className="grid gap-4">
            {otherActivities.map((activity) => {
              const content =
                t.activities.items[activity.key];

              return (
                <article
                  key={activity.key}
                  className="group relative min-h-[260px] overflow-hidden rounded-[2rem] bg-sage md:min-h-[280px]"
                >
                  {/* Image */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                    style={{
                      backgroundImage: `linear-gradient(
                        180deg,
                        rgba(23, 56, 42, 0.02) 10%,
                        rgba(23, 56, 42, 0.78) 100%
                      ), url('${activity.image}')`,
                    }}
                  />

                  {/* Content */}
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-[10px] font-bold tracking-[0.16em] text-gold">
                        {content.category}
                      </span>

                      <span className="text-xs text-white/65">
                        {content.date}
                      </span>
                    </div>

                    <h3 className="mt-2 font-display text-3xl leading-none tracking-[-0.03em] text-white md:text-4xl">
                      {content.title}
                    </h3>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <p className="max-w-sm text-xs leading-5 text-white/65">
                        {content.description}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleJoinActivity(
                            activity.slug
                          )
                        }
                        disabled={
                          joiningSlug !== null
                        }
                        className="flex h-9 shrink-0 items-center gap-2 rounded-full bg-white/85 px-4 text-xs font-semibold text-forest transition-all duration-300 hover:bg-gold disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {joiningSlug ===
                        activity.slug
                          ? "..."
                          : "Join"}

                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* BOTTOM CTA */}
        <div className="mt-8 flex flex-col gap-5 rounded-[2rem] bg-sage/70 p-7 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              {t.activities.bottomDate}
            </p>

            <p className="mt-2 font-display text-2xl tracking-[-0.02em] text-forest md:text-3xl">
              {t.activities.bottomTitle}
            </p>
          </div>

          <a
            href="/activities"
            className="group inline-flex w-fit items-center gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
          >
            {t.activities.viewAll}

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}

