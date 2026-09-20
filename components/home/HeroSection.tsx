"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-ivory">
      <div className="mx-auto max-w-[1440px] px-6 pb-10 pt-6 md:px-10 md:pb-14 md:pt-8 lg:px-14 lg:pb-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-sage/70 shadow-[0_20px_70px_rgba(23,56,42,0.08)] md:rounded-[2.5rem]">

          {/* Soft background light */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(255,255,255,0.9),transparent_35%),radial-gradient(circle_at_90%_85%,rgba(200,155,60,0.14),transparent_30%)]" />

          {/* BATIK PARANG */}
          <div className="pointer-events-none absolute left-0 top-0 z-[1] hidden h-full w-[260px] overflow-hidden lg:block">
            <div className="absolute -left-[120px] -top-[30px] h-[760px] w-[520px] rotate-[-12deg] opacity-[0.075]">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 45 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative h-[100px] w-[88px]"
                  >
                    <div className="absolute left-1/2 top-1/2 h-[68px] w-[34px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[65%_10%_65%_10%] border-[3px] border-forest" />

                    <div className="absolute left-1/2 top-1/2 h-[35px] w-[18px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[65%_10%_65%_10%] border-2 border-gold" />

                    <span className="absolute left-[42%] top-[43%] h-2 w-2 rotate-45 rounded-sm bg-gold" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Small Parang accent */}
          <div className="pointer-events-none absolute right-0 top-0 z-[5] hidden h-[300px] w-[300px] overflow-hidden rounded-tr-[2.5rem] lg:block">
            <div className="absolute -right-[90px] -top-[90px] rotate-[-18deg] opacity-[0.12]">
              <div className="flex gap-3">
                {Array.from({ length: 6 }).map((_, column) => (
                  <div
                    key={column}
                    className="flex flex-col gap-3"
                  >
                    {Array.from({ length: 5 }).map((_, row) => (
                      <div
                        key={row}
                        className="relative h-[65px] w-[55px]"
                      >
                        <div className="absolute left-1/2 top-1/2 h-[45px] w-[23px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[70%_12%_70%_12%] border-2 border-gold" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative grid min-h-[650px] grid-cols-1 lg:min-h-[680px] lg:grid-cols-[0.9fr_1.1fr]">

            {/* LEFT CONTENT */}
            <div className="relative z-20 flex flex-col justify-between p-7 sm:p-10 md:p-14 lg:p-16 xl:p-20">
              <div>

                {/* Eyebrow */}
                <div className="mb-7 inline-flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-forest/65 shadow-sm backdrop-blur-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  {t.hero.eyebrow}
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
              </div>

              {/* INFO CARDS */}
              <div className="mt-12 grid max-w-[560px] grid-cols-2 gap-3 sm:grid-cols-3">

                {/* DATE */}
                <div className="rounded-2xl bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest/45">
                    {t.hero.dateLabel}
                  </p>

                  <p className="mt-1 font-display text-xl text-forest">
                    06—08 Nov
                  </p>

                  <p className="text-xs text-forest/45">
                    2026
                  </p>
                </div>

                {/* LOCATION */}
                <div className="rounded-2xl bg-white/60 p-4 shadow-sm backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-forest/45">
                    {t.hero.locationLabel}
                  </p>

                  <p className="mt-1 font-display text-xl text-forest">
                    Yogyakarta
                  </p>

                  <p className="text-xs text-forest/45">
                    Loman Park Hotel
                  </p>
                </div>

                {/* THEME */}
                <div className="col-span-2 rounded-2xl bg-forest p-4 text-ivory shadow-sm transition-transform duration-300 hover:-translate-y-1 sm:col-span-1">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ivory/45">
                    {t.hero.themeLabel}
                  </p>

                  <p className="mt-1 font-display text-xl">
                    Reconnect
                  </p>

                  <p className="text-xs text-ivory/50">
                    People · Culture · Wellbeing
                  </p>
                </div>

              </div>
            </div>

            {/* RIGHT VISUAL */}
            <div className="relative min-h-[430px] overflow-hidden lg:min-h-0">

              {/* Main image */}
              <div
                className="absolute inset-3 overflow-hidden rounded-[1.7rem] bg-forest sm:inset-4 sm:rounded-[2rem] lg:inset-5"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(23,56,42,0.02) 25%, rgba(23,56,42,0.45) 100%), url('/images/hero-jcwf.jpg')",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              />

              {/* Image gradient */}
              <div className="absolute inset-3 rounded-[1.7rem] bg-gradient-to-t from-forest/50 via-transparent to-transparent sm:inset-4 sm:rounded-[2rem] lg:inset-5" />

              {/* PARANG ON IMAGE */}
              <div className="pointer-events-none absolute right-5 top-5 z-[3] h-[270px] w-[250px] overflow-hidden rounded-tr-[2rem] opacity-[0.18] sm:right-6 sm:top-6">
                <div className="absolute -right-[45px] -top-[45px] rotate-[-16deg]">
                  <div className="flex gap-2">
                    {Array.from({ length: 6 }).map((_, column) => (
                      <div
                        key={column}
                        className="flex flex-col gap-2"
                      >
                        {Array.from({ length: 5 }).map((_, row) => (
                          <div
                            key={row}
                            className="relative h-[58px] w-[48px]"
                          >
                            <div className="absolute left-1/2 top-1/2 h-[42px] w-[21px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[70%_10%_70%_10%] border-2 border-gold" />

                            <div className="absolute left-1/2 top-1/2 h-[23px] w-[11px] -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[70%_10%_70%_10%] border border-gold" />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Location badge */}
              <div className="absolute left-7 top-7 z-10 flex items-center gap-2 rounded-full bg-white/85 px-4 py-2.5 text-xs font-semibold text-forest shadow-[0_10px_30px_rgba(23,56,42,0.12)] backdrop-blur-md sm:left-9 sm:top-9 lg:left-10 lg:top-10">
                <span className="h-2 w-2 rounded-full bg-gold" />
                {t.hero.location}
              </div>

              {/* Save the date */}
              <div className="absolute bottom-7 left-7 right-7 z-10 rounded-[1.5rem] bg-white/90 p-4 shadow-[0_15px_40px_rgba(23,56,42,0.16)] backdrop-blur-xl sm:bottom-9 sm:left-auto sm:right-9 sm:w-[300px] sm:p-5 lg:bottom-10 lg:right-10">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-forest/45">
                      {t.hero.saveDate}
                    </p>

                    <p className="mt-1 font-display text-2xl text-forest">
                      6—8 November
                    </p>

                    <p className="mt-0.5 text-xs text-forest/50">
                      Loman Park Hotel · Yogyakarta
                    </p>
                  </div>

                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-lg text-ivory shadow-sm transition-transform duration-300 hover:rotate-45">
                    ↗
                  </span>
                </div>
              </div>

              {/* Gold glow */}
              <div className="absolute right-8 top-24 z-[2] h-16 w-16 rounded-full bg-gold/20 blur-xl sm:right-12" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}