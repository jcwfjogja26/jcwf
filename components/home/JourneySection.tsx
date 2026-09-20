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
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.journey.eyebrow}
            </p>

            <h2 className="max-w-4xl font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.journey.titleLine1}
              <br />
              <span className="text-gold">
                {t.journey.titleLine2}
              </span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-forest/60 lg:pb-2 lg:text-[15px]">
            {t.journey.description}
          </p>
        </div>

        {/* JOURNEY */}
        <div className="mt-14 grid gap-4 md:mt-20 md:grid-cols-3">
          {journeySteps.map((step, index) => {
            const content = t.journey.steps[step.key];

            return (
              <article
                key={step.number}
                className={`group relative overflow-hidden rounded-[2rem] p-7 transition-all duration-500 hover:-translate-y-2 md:min-h-[390px] md:p-9 ${
                  index === 1
                    ? "bg-forest text-ivory"
                    : "bg-ivory text-forest"
                }`}
              >
                {/* Giant Number */}
                <span
                  className={`absolute -right-3 -top-8 font-display text-[11rem] font-medium leading-none tracking-[-0.08em] transition-transform duration-700 group-hover:scale-110 ${
                    index === 1
                      ? "text-white/[0.045]"
                      : "text-forest/[0.055]"
                  }`}
                >
                  {step.number}
                </span>

                {/* Step label */}
                <div className="relative flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-[0.18em] text-gold">
                    {content.label}
                  </span>

                  <span
                    className={`text-xs ${
                      index === 1
                        ? "text-white/35"
                        : "text-forest/30"
                    }`}
                  >
                    {step.number} / 03
                  </span>
                </div>

                {/* Title */}
                <div className="relative mt-28">
                  <h3
                    className={`font-display text-4xl tracking-[-0.04em] md:text-5xl ${
                      index === 1
                        ? "text-white"
                        : "text-forest"
                    }`}
                  >
                    {content.title}
                  </h3>

                  <p
                    className={`mt-5 max-w-sm text-sm leading-6 ${
                      index === 1
                        ? "text-white/60"
                        : "text-forest/55"
                    }`}
                  >
                    {content.description}
                  </p>
                </div>

                {/* Arrow */}
                <div
                  className={`absolute bottom-7 right-7 flex h-11 w-11 items-center justify-center rounded-full transition-all duration-500 group-hover:rotate-45 md:bottom-9 md:right-9 ${
                    index === 1
                      ? "bg-white/10 text-white group-hover:bg-gold group-hover:text-forest"
                      : "bg-forest/5 text-forest group-hover:bg-forest group-hover:text-ivory"
                  }`}
                >
                  ↗
                </div>
              </article>
            );
          })}
        </div>

        {/* BOTTOM STATEMENT */}
        <div className="mt-5 rounded-[2rem] bg-forest px-7 py-8 md:px-10 md:py-9">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl font-display text-2xl leading-tight text-ivory md:text-3xl">
              {t.journey.statementLine1}
              <br className="md:hidden" />{" "}
              <span className="text-gold">
                {t.journey.statementLine2}
              </span>
            </p>

            <a
              href="#activities"
              className="group inline-flex w-fit items-center gap-3 rounded-full bg-ivory px-6 py-3.5 text-sm font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-gold"
            >
              {t.journey.explore}

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}