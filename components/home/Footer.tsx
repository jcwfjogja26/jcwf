"use client";

import { useLanguage } from "@/components/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();

  const footerLinks = {
    explore: [
      { label: t.footer.links.about, href: "#about" },
      { label: t.footer.links.program, href: "#activities" },
      { label: t.footer.links.marketplace, href: "#marketplace" },
      { label: t.footer.links.moments, href: "#gallery" },
    ],
    festival: [
      { label: t.footer.links.passport, href: "#passport" },
      { label: t.footer.links.faq, href: "#faq" },
      { label: t.footer.links.register, href: "#register" },
    ],
  };

  return (
    <footer className="bg-forest text-ivory">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:px-14">

        {/* MAIN FOOTER */}
        <div className="grid gap-14 py-16 md:py-20 lg:grid-cols-[1.3fr_1fr_1fr] lg:gap-20 lg:py-24">

          {/* BRAND */}
          <div>
            <a
              href="/"
              className="group inline-flex items-baseline font-display text-5xl font-medium tracking-[-0.05em] text-ivory md:text-6xl"
            >
              JCWF
              <span className="ml-1 text-gold transition-transform duration-300 group-hover:rotate-12">
                .
              </span>
            </a>

            <p className="mt-5 max-w-md font-display text-2xl leading-tight text-white/80 md:text-3xl">
              Reconnecting —
              <br />
              <span className="text-gold">
                People, Culture & Wellbeing.
              </span>
            </p>

            <p className="mt-6 max-w-sm text-sm leading-6 text-white/40">
              {t.footer.description}
            </p>
          </div>

          {/* EXPLORE */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {t.footer.explore}
            </p>

            <nav className="mt-6 flex flex-col gap-4">
              {footerLinks.explore.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group flex w-fit items-center gap-2 text-sm text-white/55 transition-colors duration-300 hover:text-white"
                >
                  <span>{link.label}</span>

                  <span className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </a>
              ))}
            </nav>
          </div>

          {/* FESTIVAL */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
              {t.footer.festival}
            </p>

            <nav className="mt-6 flex flex-col gap-4">
              {footerLinks.festival.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="group flex w-fit items-center gap-2 text-sm text-white/55 transition-colors duration-300 hover:text-white"
                >
                  <span>{link.label}</span>

                  <span className="opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                    →
                  </span>
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* INFO STRIP */}
        <div className="rounded-[1.8rem] bg-white/[0.06] p-6 md:p-7">
          <div className="grid gap-6 sm:grid-cols-3">

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t.footer.info.date}
              </p>

              <p className="mt-2 font-display text-xl text-white">
                6—8 November 2026
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t.footer.info.venue}
              </p>

              <p className="mt-2 font-display text-xl text-white">
                {t.footer.info.venueName}
              </p>

              <p className="mt-1 text-xs text-white/35">
                {t.footer.info.city}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/35">
                {t.footer.info.theme}
              </p>

              <p className="mt-2 font-display text-xl text-gold">
                {t.footer.info.themeValue}
              </p>
            </div>

          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col gap-5 py-7 text-xs text-white/30 md:flex-row md:items-center md:justify-between">

          <p>
            {t.footer.copyright}
          </p>

          <div className="flex gap-5">
            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              Instagram
            </a>

            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              {t.footer.privacy}
            </a>

            <a
              href="#"
              className="transition-colors hover:text-white"
            >
              {t.footer.terms}
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}