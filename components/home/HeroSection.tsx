"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const EVENT_DATE = new Date("2026-11-06T00:00:00+07:00");

function getCountdown() {
  const now = new Date();
  const difference = EVENT_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(
      difference / (1000 * 60 * 60 * 24),
    ),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24,
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60,
    ),
    seconds: Math.floor(
      (difference / 1000) % 60,
    ),
  };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export default function HeroSection() {
  const { t } = useLanguage();

  const [countdown, setCountdown] = useState(
    getCountdown(),
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown(getCountdown());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-6 md:px-10 md:pb-14 md:pt-8 lg:px-14 lg:pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-sage/70 shadow-[0_20px_70px_rgba(23,56,42,0.08)] md:rounded-[2.5rem]">

          {/* Soft background */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(200,155,60,0.14),transparent_30%)]" />

          {/* Subtle batik-inspired accent */}
          <div className="pointer-events-none absolute left-0 top-0 z-[1] hidden h-full w-[300px] overflow-hidden lg:block">
            <div className="absolute -left-[130px] -top-[40px] h-[780px] w-[600px] rotate-[-8deg] opacity-[0.045]">
              <svg
                viewBox="0 0 600 780"
                className="h-full w-full"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {Array.from({ length: 6 }).map((_, column) =>
                  Array.from({ length: 8 }).map((_, row) => {
                    const x = column * 105;
                    const y = row * 105;

                    return (
                      <g
                        key={`${column}-${row}`}
                        transform={`translate(${x} ${y})`}
                      >
                        <path
                          d="M52 0C24 20 8 42 8 63C8 85 24 102 52 108C80 102 96 85 96 63C96 42 80 20 52 0Z"
                          fill="#C79B3C"
                        />

                        <path
                          d="M52 0C24 6 8 23 8 45C8 66 24 88 52 108C80 88 96 66 96 45C96 23 80 6 52 0Z"
                          transform="translate(0 105)"
                          fill="#C79B3C"
                        />
                      </g>
                    );
                  }),
                )}
              </svg>
            </div>
          </div>

          <div className="relative grid min-h-[650px] grid-cols-1 lg:min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">

            {/* =================================================
                LEFT CONTENT
            ================================================== */}

            <div className="relative z-20 flex flex-col justify-between p-7 sm:p-10 md:p-14 lg:p-16 xl:p-20">

              <div>

                {/* Eyebrow */}
                <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest/65 shadow-sm backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  JCWF 2026
                </div>

                {/* Heading */}
                <h1 className="max-w-[620px] font-display text-[clamp(3.4rem,6vw,6.7rem)] font-medium leading-[0.9] tracking-[-0.055em] text-forest">
                  Reconnecting
                  <br />
                  <span className="text-gold">
                    People,
                  </span>
                  <br />
                  Culture &amp;
                  <br />
                  Wellbeing.
                </h1>

                {/* Description */}
                <p className="mt-7 max-w-[480px] text-[15px] leading-7 text-forest/65 md:text-base">
                  {t.hero.description}
                </p>

                {/* CTA */}
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <a
                    href="#activities"
                    className="group inline-flex items-center gap-3 rounded-full bg-forest px-6 py-3.5 text-sm font-semibold text-ivory shadow-[0_10px_25px_rgba(23,56,42,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold hover:text-forest"
                  >
                    {t.hero.explore}

                    <span className="transition-transform duration-300 group-hover:translate-x-1">
                      →
                    </span>
                  </a>

                  <a
                    href="#about"
                    className="inline-flex items-center rounded-full bg-white/70 px-6 py-3.5 text-sm font-semibold text-forest shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
                  >
                    {t.hero.about}
                  </a>
                </div>

                {/* =================================================
                    DATE + LOCATION
                    Back underneath the title/content
                ================================================== */}

                <div className="mt-12 flex flex-wrap items-start gap-x-10 gap-y-5 border-t border-forest/10 pt-5">

                  {/* Date */}
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-forest/40">
                      {t.hero.dateLabel}
                    </p>

                    <p className="mt-1 font-display text-xl leading-none text-forest">
                      06—08 Nov
                    </p>

                    <p className="mt-1 text-[11px] text-forest/40">
                      2026
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="hidden h-10 w-px bg-forest/10 sm:block" />

                  {/* Location */}
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-forest/40">
                      {t.hero.locationLabel}
                    </p>

                    <p className="mt-1 font-display text-xl leading-none text-forest">
                      Yogyakarta
                    </p>

                    <p className="mt-1 text-[11px] text-forest/40">
                      Loman Park Hotel
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}

            <div className="relative min-h-[620px] overflow-hidden px-4 pb-6 pt-4 sm:px-6 sm:pb-8 sm:pt-6 lg:min-h-0 lg:px-8 lg:pb-8 lg:pt-8">

              <div className="flex h-full flex-col gap-4">

                {/* =================================================
                    PHOTO CARD
                    Clean ivory glass
                ================================================== */}

                <div className="relative min-h-[330px] flex-1 overflow-hidden rounded-[2rem] border border-white/80 bg-ivory/90 p-3 shadow-[0_20px_50px_rgba(23,56,42,0.10)] backdrop-blur-xl sm:p-4">

                  {/* Photo */}
                  <div className="relative h-full min-h-[300px] overflow-hidden rounded-[1.5rem] bg-forest sm:rounded-[1.7rem]">

                    <img
                      src="/images/hero-jcwf.jpg"
                      alt="JCWF 2026"
                      className="absolute inset-0 h-full w-full object-cover"
                    />

                    {/* Very subtle photo overlay */}
                    <div className="absolute inset-0 bg-forest/5" />

                    {/* Location */}
                    <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full border border-white/70 bg-ivory/90 px-4 py-2.5 text-xs font-semibold text-forest shadow-[0_8px_25px_rgba(23,56,42,0.10)] backdrop-blur-xl sm:left-5 sm:top-5">
                      <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                      Yogyakarta, Indonesia
                    </div>

                    {/* Year */}
                    <div className="absolute bottom-4 right-5 z-10 sm:bottom-5 sm:right-6">
                      <p className="font-display text-3xl text-ivory drop-shadow-sm">
                        2026
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    COUNTDOWN CARD
                    Sage glass
                ================================================== */}

                <div className="relative overflow-hidden rounded-[2rem] border border-white/45 bg-sage/75 px-5 py-6 shadow-[0_18px_45px_rgba(23,56,42,0.10)] backdrop-blur-xl sm:px-7 sm:py-7">

                  {/* Glass shine */}
                  <div className="pointer-events-none absolute inset-0 bg-white/10" />

                  <div className="relative">

                    {/* Heading */}
                    <div className="text-center">
                      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-forest/45">
                        JCWF 2026
                      </p>

                      <h2 className="mt-1 font-display text-2xl text-forest sm:text-3xl">
                        Acara dimulai dalam
                      </h2>
                    </div>

                    {/* =================================================
                        COUNTDOWN NUMBERS
                    ================================================== */}

                    <div className="mt-5 flex items-center justify-center gap-1.5 sm:gap-2">

                      {/* DAYS */}
                      <div className="min-w-[58px] rounded-[1rem] border border-white/35 bg-forest/90 px-2 py-2.5 text-center shadow-[0_5px_20px_rgba(23,56,42,0.08)] sm:min-w-[70px] sm:px-3 sm:py-3">
                        <p className="font-display text-2xl leading-none tracking-[-0.04em] text-ivory sm:text-3xl">
                          {pad(countdown.days)}
                        </p>

                        <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-ivory/45">
                          Days
                        </p>
                      </div>

                      <span className="font-display text-xl text-gold sm:text-2xl">
                        :
                      </span>

                      {/* HOURS */}
                      <div className="min-w-[58px] rounded-[1rem] border border-white/55 bg-ivory/45 px-2 py-2.5 text-center shadow-[0_5px_20px_rgba(23,56,42,0.05)] backdrop-blur-md sm:min-w-[70px] sm:px-3 sm:py-3">
                        <p className="font-display text-2xl leading-none tracking-[-0.04em] text-forest sm:text-3xl">
                          {pad(countdown.hours)}
                        </p>

                        <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-forest/40">
                          Hours
                        </p>
                      </div>

                      <span className="font-display text-xl text-gold sm:text-2xl">
                        :
                      </span>

                      {/* MINUTES */}
                      <div className="min-w-[58px] rounded-[1rem] border border-white/55 bg-ivory/45 px-2 py-2.5 text-center shadow-[0_5px_20px_rgba(23,56,42,0.05)] backdrop-blur-md sm:min-w-[70px] sm:px-3 sm:py-3">
                        <p className="font-display text-2xl leading-none tracking-[-0.04em] text-forest sm:text-3xl">
                          {pad(countdown.minutes)}
                        </p>

                        <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-forest/40">
                          Minutes
                        </p>
                      </div>

                      <span className="font-display text-xl text-gold sm:text-2xl">
                        :
                      </span>

                      {/* SECONDS */}
                      <div className="min-w-[58px] rounded-[1rem] border border-white/55 bg-ivory/45 px-2 py-2.5 text-center shadow-[0_5px_20px_rgba(23,56,42,0.05)] backdrop-blur-md sm:min-w-[70px] sm:px-3 sm:py-3">
                        <p className="font-display text-2xl leading-none tracking-[-0.04em] text-forest sm:text-3xl">
                          {pad(countdown.seconds)}
                        </p>

                        <p className="mt-1.5 text-[7px] font-semibold uppercase tracking-[0.14em] text-forest/40">
                          Seconds
                        </p>
                      </div>

                    </div>

                    

                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}