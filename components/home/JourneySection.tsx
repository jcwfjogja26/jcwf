"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function JourneySection() {
  const { t } = useLanguage();

  const journeySteps = [
    {
      number: "01",
      key: "discover",
    },
    {
      number: "02",
      key: "connect",
    },
    {
      number: "03",
      key: "reconnect",
    },
  ] as const;

  return (
    <section
      id="journey"
      className="relative overflow-hidden bg-sage py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end lg:gap-12">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.journey.eyebrow}
            </p>

            <h2 className="max-w-4xl font-display text-[clamp(2.8rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.journey.titleLine1}
              <br />
              <span className="text-gold">
                {t.journey.titleLine2}
              </span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-6 text-forest/60 lg:pb-2 lg:text-[15px] lg:leading-7">
            {t.journey.description}
          </p>
        </div>

        {/* JOURNEY STEPS */}
        <div className="mt-12 grid gap-3 md:mt-16 md:grid-cols-3 md:gap-4">
          {journeySteps.map((step, index) => {
            const content = t.journey.steps[step.key];

            const isFeatured = index === 1;

            return (
              <article
                key={step.number}
                className={`group relative min-h-[210px] overflow-hidden rounded-[1.5rem] p-5 transition-transform duration-500 hover:-translate-y-1 md:min-h-[320px] md:rounded-[1.75rem] md:p-8 ${
                  isFeatured
                    ? "bg-forest text-ivory"
                    : "bg-ivory text-forest"
                }`}
              >
                {/* BACKGROUND NUMBER */}
                <span
                  className={`pointer-events-none absolute -right-1 -top-3 select-none font-display text-[6rem] font-medium leading-none tracking-[-0.08em] transition-transform duration-700 group-hover:scale-105 md:text-[9rem] ${
                    isFeatured
                      ? "text-white/[0.045]"
                      : "text-forest/[0.045]"
                  }`}
                >
                  {step.number}
                </span>

                {/* TOP */}
                <div className="relative flex items-center justify-between">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-gold">
                    {content.label}
                  </span>

                  <span
                    className={`text-[10px] font-medium ${
                      isFeatured
                        ? "text-white/30"
                        : "text-forest/30"
                    }`}
                  >
                    {step.number} / 03
                  </span>
                </div>

                {/* CONTENT */}
                <div className="relative mt-14 md:mt-24">
                  <h3
                    className={`font-display text-[1.8rem] leading-none tracking-[-0.04em] md:text-4xl ${
                      isFeatured
                        ? "text-white"
                        : "text-forest"
                    }`}
                  >
                    {content.title}
                  </h3>

                  <p
                    className={`mt-3 max-w-sm text-[11px] leading-5 md:mt-4 md:text-sm md:leading-6 ${
                      isFeatured
                        ? "text-white/60"
                        : "text-forest/55"
                    }`}
                  >
                    {content.description}
                  </p>
                </div>
              </article>
            );
          })}
        </div>

        {/* BOTTOM STATEMENT */}
        <div className="mt-3 rounded-[1.5rem] bg-forest px-6 py-6 md:mt-4 md:rounded-[1.75rem] md:px-9 md:py-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between md:gap-10">
            <p className="max-w-2xl font-display text-xl leading-[1.15] tracking-[-0.02em] text-ivory md:text-2xl">
              {t.journey.statementLine1}{" "}
              <span className="text-gold">
                {t.journey.statementLine2}
              </span>
            </p>

            <a
              href="#activities"
              className="inline-flex w-fit shrink-0 items-center rounded-full bg-ivory px-5 py-3 text-xs font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold md:px-6 md:py-3.5 md:text-sm"
            >
              {t.journey.explore}
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}