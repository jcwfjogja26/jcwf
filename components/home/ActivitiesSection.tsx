"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

type Activity = {
  id: string;
  slug: string;
  title: string;
  status: string;
};

export default function ActivitiesSection() {
  const { t } = useLanguage();

  const [activitiesData, setActivitiesData] = useState<Activity[]>(
    [],
  );

  const [joiningSlug, setJoiningSlug] = useState<string | null>(
    null,
  );

  const [joinMessage, setJoinMessage] = useState("");

  const sliderRef = useRef<HTMLDivElement>(null);

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
        const response = await fetch("/api/activities");

        if (!response.ok) {
          throw new Error("Failed to load activities.");
        }

        const data = await response.json();

        setActivitiesData(data.activities ?? []);
      } catch (error) {
        console.error("LOAD ACTIVITIES ERROR:", error);
      }
    }

    loadActivities();
  }, []);

  async function handleJoinActivity(slug: string) {
    setJoinMessage("");

    const activity = activitiesData.find(
      (item) => item.slug === slug,
    );

    if (!activity) {
      setJoinMessage("Activity belum tersedia.");
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
        },
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
            "Kamu sudah terdaftar di activity ini.",
        );
        return;
      }

      if (!response.ok) {
        setJoinMessage(
          data.message ||
            "Gagal bergabung ke activity.",
        );
        return;
      }

      setJoinMessage(
        "Activity berhasil ditambahkan ke My Plan.",
      );
    } catch (error) {
      console.error("JOIN ACTIVITY ERROR:", error);

      setJoinMessage(
        "Terjadi kesalahan. Silakan coba lagi.",
      );
    } finally {
      setJoiningSlug(null);
    }
  }

  function scrollActivities(direction: "left" | "right") {
    if (!sliderRef.current) return;

    const amount =
      sliderRef.current.clientWidth * 0.82;

    sliderRef.current.scrollBy({
      left:
        direction === "right"
          ? amount
          : -amount,
      behavior: "smooth",
    });
  }

  return (
    <section
      id="activities"
      className="relative overflow-hidden bg-[#f1eee4] py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">

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

          {/* DESKTOP DESCRIPTION + VIEW ALL */}
          <div className="flex max-w-md flex-col gap-5 md:items-end md:pb-2">
            <p className="text-sm leading-7 text-forest/60 md:text-[15px] md:text-right">
              {t.activities.description}
            </p>

           <a
  href="/activities"
  className="inline-flex w-fit items-center rounded-full border border-white/15 bg-[#A8B99F]/80 px-5 py-2.5 text-sm font-semibold text-forest shadow-[0_8px_25px_rgba(23,56,42,0.08)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-bg-[#8FA58A]/90 hover:shadow-[0_12px_30px_rgba(23,56,42,0.12)]"
>
  {t.activities.viewAll}
</a>
          </div>
        </div>

        {/* =====================================================
            MOBILE SLIDER CONTROLS
        ====================================================== */}

        <div className="mt-7 flex items-center justify-between md:hidden">

          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/40">
            Swipe to explore
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous activity"
              onClick={() =>
                scrollActivities("left")
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/15 bg-ivory text-lg text-forest transition hover:bg-forest hover:text-ivory"
            >
              ‹
            </button>

            <button
              type="button"
              aria-label="Next activity"
              onClick={() =>
                scrollActivities("right")
              }
              className="flex h-9 w-9 items-center justify-center rounded-full border border-forest/15 bg-ivory text-lg text-forest transition hover:bg-forest hover:text-ivory"
            >
              ›
            </button>
          </div>
        </div>

        {/* =====================================================
            ACTIVITY SLIDER / GRID
        ====================================================== */}

        <div
          ref={sliderRef}
          className="
            mt-10
            flex
            snap-x
            snap-mandatory
            gap-4
            overflow-x-auto
            pb-3
            scrollbar-none
            md:mt-14
            md:grid
            md:grid-cols-2
            md:overflow-visible
            md:pb-0
            lg:grid-cols-4
          "
        >

          {activities.map((activity) => {
            const content =
              t.activities.items[activity.key];

            return (
              <article
                key={activity.key}
                className="
                  group
                  relative
                  min-w-[82vw]
                  snap-start
                  overflow-hidden
                  rounded-[1.8rem]
                  bg-forest
                  shadow-[0_12px_35px_rgba(23,56,42,0.08)]
                  transition-transform
                  duration-500
                  md:min-w-0
                  md:hover:-translate-y-1
                "
              >

                {/* =================================================
                    IMAGE
                ================================================== */}

                <div className="relative h-[360px] overflow-hidden">

                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    style={{
                      backgroundImage: `linear-gradient(
                        180deg,
                        rgba(23, 56, 42, 0.02) 15%,
                        rgba(23, 56, 42, 0.18) 40%,
                        rgba(23, 56, 42, 0.94) 100%
                      ), url('${activity.image}')`,
                    }}
                  />

                  {/* =================================================
                      TOP LABEL
                  ================================================== */}

                  <div className="absolute left-5 right-5 top-5 flex items-center justify-between gap-3">

                    <span className="rounded-full bg-gold px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-forest">
                      {content.category}
                    </span>

                    {activity.featured && (
                      <span className="rounded-full border border-white/25 bg-forest/35 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/80 backdrop-blur-md">
                        Featured
                      </span>
                    )}
                  </div>

                  {/* =================================================
                      CONTENT
                  ================================================== */}

                  <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">

                    <h3 className="font-display text-3xl leading-[0.95] tracking-[-0.035em] text-white md:text-[2rem]">
                      {content.title}
                    </h3>

                    <p className="mt-3 line-clamp-2 text-[11px] leading-5 text-white/65 md:text-xs">
                      {content.description}
                    </p>

                    {/* META */}
                    <div className="mt-4 border-t border-white/15 pt-4">

                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-white/65">

                        <span>
                          <strong className="font-semibold text-white">
                            {content.date}
                          </strong>
                        </span>

                        <span>
                          {content.time}
                        </span>

                      </div>

                      <p className="mt-1.5 truncate text-[10px] text-white/50">
                        {content.location}
                      </p>
                    </div>

                    {/* JOIN */}
                    <button
                      type="button"
                      onClick={() =>
                        handleJoinActivity(
                          activity.slug,
                        )
                      }
                      disabled={
                        joiningSlug !== null
                      }
                      className="
                        mt-4
                        flex
                        w-full
                        items-center
                        justify-center
                        rounded-full
                        bg-ivory
                        px-4
                        py-3
                        text-xs
                        font-semibold
                        text-forest
                        transition-all
                        duration-300
                        hover:bg-gold
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {joiningSlug ===
                      activity.slug
                        ? "Joining..."
                        : "Join Activity"}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* =====================================================
            JOIN MESSAGE
        ====================================================== */}

        {joinMessage && (
          <div className="mt-5 text-center text-xs text-forest/60">
            {joinMessage}
          </div>
        )}

        
        
      </div>
    </section>
  );
}