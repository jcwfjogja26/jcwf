"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function PassportSection() {
  const { t } = useLanguage();

  const benefits = [
    {
      number: "01",
      type: "light",
      title: t.passport.benefits.oneId.title,
      description:
        t.passport.benefits.oneId.description,
    },
    {
      number: "02",
      type: "gold",
      title: t.passport.benefits.moments.title,
      description:
        t.passport.benefits.moments.description,
    },
    {
      number: "03",
      type: "dark",
      title: t.passport.benefits.story.title,
      description:
        t.passport.benefits.story.description,
    },
  ] as const;

  return (
    <section
      id="passport"
      className="relative overflow-hidden bg-forest py-20 text-ivory md:py-28 lg:py-32"
    >
      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:gap-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.passport.eyebrow}
            </p>

            <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em]">
              {t.passport.titleLine1}
              <br />
              <span className="text-gold">
                {t.passport.titleLine2}
              </span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-white/55 lg:pb-2 lg:text-[15px] lg:leading-7">
            {t.passport.description}
          </p>
        </div>

        {/* PASSPORT INTRO */}
        <div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.045] p-5 md:mt-14 md:p-7">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-8">
            
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-forest">
                JC
              </div>

              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                  JOGJA CULTURAL
                </p>

                <p className="mt-1 font-display text-xl text-white md:text-2xl">
                  WELLNESS FESTIVAL
                </p>
              </div>
            </div>

            <p className="max-w-xl text-xs leading-5 text-white/45 md:text-sm md:leading-6 md:text-right">
              A digital passport to keep your festival
              experience, moments, and personal journey
              connected in one place.
            </p>
          </div>
        </div>

        {/* BENEFITS */}
        <div className="mt-4 grid gap-3 md:grid-cols-3 md:gap-4">
          {benefits.map((benefit) => (
            <article
              key={benefit.number}
              className={`rounded-[1.5rem] p-5 md:p-7 ${
                benefit.type === "light"
                  ? "bg-ivory text-forest"
                  : benefit.type === "gold"
                    ? "bg-gold text-forest"
                    : "bg-white/[0.06] text-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-bold ${
                    benefit.type === "light"
                      ? "bg-sage text-forest"
                      : benefit.type === "gold"
                        ? "bg-forest text-gold"
                        : "bg-white/10 text-gold"
                  }`}
                >
                  {benefit.number}
                </span>
              </div>

              <h3
                className={`mt-8 font-display text-2xl leading-none tracking-[-0.03em] md:text-3xl ${
                  benefit.type === "dark"
                    ? "text-white"
                    : "text-forest"
                }`}
              >
                {benefit.title}
              </h3>

              <p
                className={`mt-3 text-xs leading-5 md:text-sm md:leading-6 ${
                  benefit.type === "dark"
                    ? "text-white/45"
                    : "text-forest/55"
                }`}
              >
                {benefit.description}
              </p>
            </article>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-4 flex flex-col gap-5 border-t border-white/10 pt-7 md:flex-row md:items-center md:justify-between md:pt-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
              {t.passport.ctaEyebrow}
            </p>

            <p className="mt-2 max-w-xl font-display text-xl leading-tight text-white md:text-2xl">
              {t.passport.ctaTitle}
            </p>
          </div>

          <a
            href="/register"
            className="inline-flex w-fit shrink-0 items-center rounded-full bg-gold px-5 py-3 text-xs font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory md:px-6 md:py-3.5 md:text-sm"
          >
            {t.passport.ctaButton}
          </a>
        </div>

      </div>
    </section>
  );
}