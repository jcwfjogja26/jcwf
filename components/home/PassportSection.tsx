"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function PassportSection() {
  const { t } = useLanguage();

  const benefits = [
    {
      number: "01",
      type: "light",
      title: t.passport.benefits.oneId.title,
      description: t.passport.benefits.oneId.description,
    },
    {
      number: "02",
      type: "gold",
      title: t.passport.benefits.moments.title,
      description: t.passport.benefits.moments.description,
    },
    {
      number: "03",
      type: "dark",
      title: t.passport.benefits.story.title,
      description: t.passport.benefits.story.description,
    },
  ] as const;

  return (
    <section
      id="passport"
      className="relative overflow-hidden bg-forest py-20 text-ivory md:py-28 lg:py-32"
    >
      {/* Decorative Parang */}
      <div className="pointer-events-none absolute -right-32 top-20 hidden rotate-[-18deg] opacity-[0.06] lg:block">
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: 35 }).map((_, index) => (
            <div
              key={index}
              className="h-24 w-14 rotate-45 rounded-[70%_12%_70%_12%] border-2 border-gold"
            />
          ))}
        </div>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.passport.eyebrow}
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em]">
              {t.passport.titleLine1}
              <br />
              <span className="text-gold">
                {t.passport.titleLine2}
              </span>
            </h2>
          </div>

          <p className="max-w-xl text-sm leading-7 text-white/55 lg:pb-2 lg:text-[15px]">
            {t.passport.description}
          </p>
        </div>

        {/* MAIN CONTENT */}
        <div className="mt-14 grid gap-5 lg:mt-20 lg:grid-cols-[1.15fr_0.85fr]">

          {/* PASSPORT CARD */}
          <div className="relative overflow-hidden rounded-[2.2rem] bg-[#214634] p-7 md:p-10 lg:min-h-[500px] lg:p-12">

            {/* Background glow */}
            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

            {/* Passport header */}
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.18em] text-gold">
                  JOGJA CULTURAL
                </p>

                <p className="mt-1 font-display text-xl text-white">
                  WELLNESS FESTIVAL
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gold text-sm font-bold text-forest">
                JC
              </div>
            </div>

            {/* Profile */}
            <div className="relative mt-16 flex items-center gap-5">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/10 text-2xl text-gold">
                ✦
              </div>

              <div>
                <p className="text-xs text-white/40">
                  RECONNECT ID
                </p>

                <p className="mt-1 font-display text-2xl text-white md:text-3xl">
                  YOUR NAME
                </p>

                <p className="mt-1 text-xs text-white/40">
                  JCWF26 · YOGYAKARTA
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="relative mt-12 grid grid-cols-3 gap-3">
              <div className="rounded-2xl bg-white/[0.06] p-4">
                <p className="text-2xl font-semibold text-gold">
                  04
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/40">
                  {t.passport.stats.activities}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.06] p-4">
                <p className="text-2xl font-semibold text-gold">
                  120
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/40">
                  {t.passport.stats.points}
                </p>
              </div>

              <div className="rounded-2xl bg-white/[0.06] p-4">
                <p className="text-2xl font-semibold text-gold">
                  03
                </p>

                <p className="mt-1 text-[10px] uppercase tracking-[0.1em] text-white/40">
                  {t.passport.stats.days}
                </p>
              </div>
            </div>

            {/* QR */}
            <div className="absolute bottom-8 right-8 flex h-16 w-16 items-center justify-center rounded-xl bg-white p-2 md:bottom-10 md:right-10">
              <div className="grid grid-cols-5 gap-[2px]">
                {Array.from({ length: 25 }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-2 w-2 ${
                      index % 3 === 0 ||
                      index % 5 === 0 ||
                      index === 12
                        ? "bg-forest"
                        : "bg-transparent"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* BENEFITS */}
          <div className="grid gap-4">
            {benefits.map((benefit) => (
              <div
                key={benefit.number}
                className={`group rounded-[2rem] p-7 transition-transform duration-500 hover:-translate-y-1 md:p-8 ${
                  benefit.type === "light"
                    ? "bg-ivory text-forest"
                    : benefit.type === "gold"
                      ? "bg-gold text-forest"
                      : "bg-white/[0.06]"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                      benefit.type === "light"
                        ? "bg-sage"
                        : benefit.type === "gold"
                          ? "bg-forest text-gold"
                          : "bg-white/10 text-gold"
                    }`}
                  >
                    {benefit.number}
                  </span>

                  <span
                    className={`text-lg transition-transform duration-300 group-hover:rotate-45 ${
                      benefit.type === "dark"
                        ? "text-white/50"
                        : ""
                    }`}
                  >
                    ↗
                  </span>
                </div>

                <h3
                  className={`mt-8 font-display text-3xl tracking-[-0.03em] ${
                    benefit.type === "dark"
                      ? "text-white"
                      : "text-forest"
                  }`}
                >
                  {benefit.title}
                </h3>

                <p
                  className={`mt-3 max-w-md text-sm leading-6 ${
                    benefit.type === "dark"
                      ? "text-white/45"
                      : "text-forest/55"
                  }`}
                >
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col gap-5 rounded-[2rem] bg-white/[0.06] p-7 md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gold">
              {t.passport.ctaEyebrow}
            </p>

            <p className="mt-2 font-display text-2xl text-white md:text-3xl">
              {t.passport.ctaTitle}
            </p>
          </div>

          <a
            href="#register"
            className="group inline-flex w-fit items-center gap-3 rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory"
          >
            {t.passport.ctaButton}

            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}