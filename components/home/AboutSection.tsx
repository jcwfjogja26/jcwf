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
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* =====================================================
            HEADER
        ====================================================== */}

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

        {/* =====================================================
            INTRO + IMAGE
        ====================================================== */}

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

            {/* IMAGE CAPTION */}
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/65">
                  {t.about.location}
                </p>

                <p className="mt-1 font-display text-3xl leading-none text-white md:text-4xl">
                  {t.about.imageCaption}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            PILLARS HEADER
        ====================================================== */}

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

        {/* =====================================================
            FOUR PILLARS
        ====================================================== */}

        <div className="mt-8 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">

          {pillars.map((pillar) => {
            const content =
              t.about.pillars[pillar.key];

            return (
              <article
                key={pillar.number}
                className={`
                  group
                  relative
                  min-h-[220px]
                  overflow-hidden
                  rounded-[1.5rem]
                  ${pillar.accent}
                  p-5
                  transition-all
                  duration-500
                  md:min-h-[360px]
                  md:rounded-[1.8rem]
                  md:p-8
                  lg:hover:-translate-y-2
                  lg:hover:shadow-[0_20px_45px_rgba(23,56,42,0.1)]
                `}
              >

                {/* Subtle giant number */}
                <span className="absolute right-2 top-[-5px] font-display text-[5rem] font-medium leading-none tracking-[-0.08em] text-forest/[0.055] transition-transform duration-500 md:right-5 md:top-[-18px] md:text-[9rem] lg:group-hover:scale-110">
                  {pillar.number}
                </span>

                {/* Number */}
                <p className="relative text-[10px] font-semibold tracking-[0.16em] text-gold md:text-xs">
                  {pillar.number}
                </p>

                {/* Title */}
                <h4 className="relative mt-12 font-display text-3xl font-medium leading-none tracking-[-0.04em] text-forest md:mt-16 md:text-5xl">
                  {content.title}
                </h4>

                {/* Description */}
                <p className="relative mt-4 max-w-[250px] text-[11px] leading-5 text-forest/55 md:mt-5 md:text-sm md:leading-6">
                  {content.description}
                </p>

              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}