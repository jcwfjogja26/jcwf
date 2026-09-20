"use client";

import { useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";

export default function FaqSection() {
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-[#E8EBDD] py-20 md:py-28 lg:py-32"
    >
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">
        {/* HEADER + FAQ */}
        <div className="grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          {/* LEFT */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
              {t.faq.eyebrow}
            </p>

            <h2 className="font-display text-[clamp(3rem,6vw,6rem)] font-medium leading-[0.92] tracking-[-0.05em] text-forest">
              {t.faq.titleLine1}
              <br />
              <span className="text-gold">{t.faq.titleLine2}</span>
            </h2>

            <p className="mt-7 max-w-md text-sm leading-7 text-forest/60 md:text-[15px]">
              {t.faq.description}
            </p>
          </div>

          {/* RIGHT — FAQ LIST */}
          <div className="border-t border-forest/10">
            {t.faq.items.map((faq, index) => {
              const isOpen = openIndex === index;

              return (
                <div
                  key={faq.question}
                  className={`border-b border-forest/10 transition-colors duration-300 ${
                    isOpen ? "bg-ivory/45" : "bg-transparent"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setOpenIndex(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-5 px-4 py-5 text-left md:px-6 md:py-6"
                    aria-expanded={isOpen}
                  >
                    <div className="flex min-w-0 items-start gap-4 md:gap-5">
                      <span className="pt-1 text-[9px] font-semibold tracking-[0.15em] text-forest/30">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <span className="font-display text-lg leading-tight tracking-[-0.02em] text-forest md:text-2xl">
                        {faq.question}
                      </span>
                    </div>

                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest/10 text-lg leading-none text-forest transition-all duration-300 md:h-9 md:w-9 ${
                        isOpen
                          ? "rotate-45 bg-forest text-ivory"
                          : "rotate-0"
                      }`}
                    >
                      +
                    </span>
                  </button>

                  <div
                    className={`grid transition-all duration-300 ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 pb-6 pl-12 md:px-6 md:pb-7 md:pl-[4.5rem]">
                        <p className="max-w-2xl text-sm leading-6 text-forest/55 md:text-[15px] md:leading-7">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FINAL CTA */}
        <div
          id="register"
          className="relative mt-16 overflow-hidden rounded-[2rem] bg-forest p-6 text-ivory md:mt-24 md:rounded-[2.5rem] md:p-10 lg:p-14"
        >
          <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-16">
            {/* COPY */}
            <div className="max-w-4xl">
              

              <h3 className="mt-4 font-display text-[clamp(2.8rem,6vw,5.5rem)] font-medium leading-[0.92] tracking-[-0.05em] text-white">
                {t.faq.ctaTitleLine1}
                <br />
                <span className="text-gold">
                  {t.faq.ctaTitleLine2}
                </span>
              </h3>

              <p className="mt-5 max-w-2xl text-sm leading-6 text-white/55 md:mt-6 md:text-[15px] md:leading-7">
                {t.faq.ctaDescription}
              </p>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-col gap-2.5 sm:flex-row lg:flex-col lg:min-w-[190px]">
              <a
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-gold px-6 py-3.5 text-sm font-semibold text-forest transition-all duration-300 hover:-translate-y-0.5 hover:bg-ivory"
              >
                {t.faq.ctaRegister}
              </a>

              <a
                href="#activities"
                className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10"
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