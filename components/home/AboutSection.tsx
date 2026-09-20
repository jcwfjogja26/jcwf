"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function AboutSection() {
  const { t } = useLanguage();

  const pillars = [
    {
      number: "01",
      key: "self",
      accent: "bg-[#e7eee2]",
    },
    {
      number: "02",
      key: "others",
      accent: "bg-[#eee8d8]",
    },
    {
      number: "03",
      key: "nature",
      accent: "bg-[#dce8d9]",
    },
    {
      number: "04",
      key: "culture",
      accent: "bg-[#eadfd3]",
    },
  ] as const;

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-ivory py-20 md:py-28 lg:py-32"
    >
      {/* Subtle Parang texture */}
      <div className="pointer-events-none absolute right-[-100px] top-[80px] hidden h-[500px] w-[420px] rotate-[-8deg] opacity-[0.035] lg:block">
        <div className="grid grid-cols-5 gap-5">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="relative h-24 w-16"
            >
              <div className="absolute left-1/2 top-1/2 h-16 w-8 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[70%_12%_70%_12%] border-[3px] border-forest" />

              <div className="absolute left-1/2 top-1/2 h-8 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[70%_12%_70%_12%] border-2 border-gold" />
            </div>
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="mb-14 max-w-4xl md:mb-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {t.about.eyebrow}
          </p>

          <h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
            {t.about.titleLine1}
            <br />
            <span className="text-gold">
              {t.about.titleLine2}
            </span>
          </h2>
        </div>

        {/* INTRO */}
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">

          {/* TEXT */}
          <div className="max-w-xl">
            <p className="font-display text-2xl leading-tight text-forest md:text-3xl">
              {t.about.intro}
            </p>

            <p className="mt-6 max-w-lg text-sm leading-7 text-forest/60 md:text-[15px]">
              {t.about.description}
            </p>
          </div>

          {/* IMAGE */}
          <div className="group relative h-[300px] overflow-hidden rounded-[2rem] bg-sage md:h-[400px] lg:h-[440px]">

            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-[1.04]"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(23,56,42,0.02), rgba(23,56,42,0.52)), url('/images/about-jcwf.jpg')",
              }}
            />

            {/* Parang overlay */}
            <div className="pointer-events-none absolute right-[-20px] top-[-30px] rotate-[-14deg] opacity-[0.18]">
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 20 }).map((_, index) => (
                  <div
                    key={index}
                    className="relative h-20 w-14"
                  >
                    <div className="absolute left-1/2 top-1/2 h-12 w-6 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[70%_10%_70%_10%] border-2 border-gold" />
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between md:bottom-8 md:left-8 md:right-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/65">
                  {t.about.location}
                </p>

                <p className="mt-1 font-display text-3xl leading-none text-white md:text-4xl">
                  {t.about.imageCaption}
                </p>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/90 text-lg text-forest shadow-lg backdrop-blur-sm transition-transform duration-300 group-hover:rotate-45">
                ↗
              </div>
            </div>
          </div>
        </div>

        {/* PILLARS HEADER */}
        <div className="mt-24 flex flex-col gap-3 md:mt-32 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.about.pillarsEyebrow}
            </p>

            <h3 className="mt-2 font-display text-3xl text-forest md:text-4xl">
              {t.about.pillarsTitle}
            </h3>
          </div>

          <p className="max-w-sm text-sm leading-6 text-forest/50">
            {t.about.pillarsDescription}
          </p>
        </div>

        {/* FOUR PILLARS */}
        <div className="mt-8 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const content =
              t.about.pillars[pillar.key];

            return (
              <article
                key={pillar.number}
                className={`group relative min-h-[310px] overflow-hidden rounded-[1.8rem] ${pillar.accent} p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_45px_rgba(23,56,42,0.1)] md:min-h-[360px] md:p-8`}
              >
                {/* Giant number */}
                <span className="absolute right-5 top-[-18px] font-display text-[9rem] font-medium leading-none tracking-[-0.08em] text-forest/[0.055] transition-transform duration-500 group-hover:scale-110">
                  {pillar.number}
                </span>

                {/* Number */}
                <p className="relative text-xs font-semibold tracking-[0.16em] text-gold">
                  {pillar.number}
                </p>

                {/* Title */}
                <h4 className="relative mt-16 font-display text-4xl font-medium tracking-[-0.04em] text-forest transition-transform duration-500 group-hover:translate-x-1 md:text-5xl">
                  {content.title}
                </h4>

                {/* Description */}
                <p className="relative mt-5 max-w-[250px] text-sm leading-6 text-forest/55">
                  {content.description}
                </p>

                {/* Arrow */}
                <span className="absolute bottom-6 right-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/65 text-forest shadow-sm transition-all duration-500 group-hover:rotate-45 group-hover:bg-forest group-hover:text-ivory">
                  ↗
                </span>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}