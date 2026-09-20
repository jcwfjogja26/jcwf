"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-ivory py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* HEADER */}
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.faq.eyebrow}
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.faq.titleLine1}
              <br />
              <span className="text-gold">
                {t.faq.titleLine2}
              </span>
            </h2>
          </div>

          <p className="max-w-md text-sm leading-7 text-forest/60 lg:pb-2 lg:text-[15px]">
            {t.faq.description}
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-12 max-w-5xl md:mt-16">
          {t.faq.items.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="border-b border-forest/10 last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() =>
                    setOpenIndex(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between gap-6 py-6 text-left md:py-7"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-xl tracking-[-0.02em] text-forest md:text-2xl">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sage text-lg text-forest transition-transform duration-300 ${
                      isOpen ? "rotate-45" : ""
                    }`}
                  >
                    +
                  </span>
                </button>

                <div
                  className={`grid transition-all duration-300 ${
                    isOpen
                      ? "grid-rows-[1fr] pb-6 opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-3xl pr-12 text-sm leading-7 text-forest/55">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FINAL CTA */}
        <div
          id="register"
          className="relative mt-20 overflow-hidden rounded-[2.5rem] bg-forest p-8 md:mt-28 md:p-12 lg:p-16"
        >
          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gold/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-sage/5 blur-3xl" />

          {/* Parang decoration */}
          <div className="pointer-events-none absolute right-[-20px] top-1/2 hidden -translate-y-1/2 rotate-[-18deg] opacity-[0.06] md:block">
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 20 }).map((_, index) => (
                <div
                  key={index}
                  className="h-24 w-14 rotate-45 rounded-[70%_12%_70%_12%] border-2 border-gold"
                />
              ))}
            </div>
          </div>

          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.faq.ctaDate}
            </p>

            <h3 className="mt-5 font-display text-[clamp(3rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.05em] text-white">
              {t.faq.ctaTitleLine1}
              <br />
              <span className="text-gold">
                {t.faq.ctaTitleLine2}
              </span>
            </h3>

            <p className="mt-6 max-w-xl text-sm leading-7 text-white/55 md:text-[15px]">
              {t.faq.ctaDescription}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/register"
                className="group inline-flex items-center justify-center gap-3 rounded-full bg-gold px-7 py-4 text-sm font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory"
              >
                {t.faq.ctaRegister}
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#activities"
                className="inline-flex items-center justify-center gap-3 rounded-full bg-white/10 px-7 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/15"
              >
                {t.faq.ctaExplore}
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}