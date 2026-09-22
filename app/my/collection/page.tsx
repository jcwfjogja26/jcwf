import Link from "next/link";
import MyCollectionCard from "@/components/my/MyCollectionCard";

export default function MyCollectionPage() {
  return (
    <main className="min-h-screen bg-[#F5F2E9] text-[#20231F]">
      {/* HEADER */}
      <header className="border-b border-[#20231F]/8 bg-[#F5F2E9]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-4 md:px-8 md:py-5">
          <Link
            href="/my"
            className="inline-flex items-center gap-2 rounded-full border border-[#20231F]/10 bg-white/65 px-4 py-2.5 text-xs font-semibold text-[#20231F] shadow-[0_5px_18px_rgba(32,35,31,0.04)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-white"
          >
            <span className="text-sm leading-none">←</span>
            <span>Back</span>
          </Link>

          <div className="text-center">
            <p className="font-display text-lg leading-none text-[#20231F] md:text-xl">
              My Collection
            </p>

            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#20231F]/35">
              JCWF Passport
            </p>
          </div>

          <Link
            href="/my"
            className="rounded-full border border-[#20231F]/10 bg-white/65 px-4 py-2.5 text-[10px] font-semibold text-[#20231F] shadow-[0_5px_18px_rgba(32,35,31,0.04)] backdrop-blur-md transition hover:bg-[#DCE9DC]"
          >
            My JCWF
          </Link>
        </div>
      </header>

      {/* PAGE INTRO */}
      <section className="mx-auto max-w-[1200px] px-5 pb-8 pt-10 md:px-8 md:pb-12 md:pt-14">
        <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-14">
          <div>
            <p className="mb-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C89B3C]">
              Your journey
            </p>

            <h1 className="max-w-3xl font-display text-[clamp(3rem,7vw,6.5rem)] font-medium leading-[0.9] tracking-[-0.055em] text-[#17382A]">
              Collect the
              <br />
              <span className="text-[#C89B3C]">moments.</span>
            </h1>
          </div>

          <p className="max-w-md text-sm leading-7 text-[#20231F]/55 lg:pb-2 lg:text-[15px]">
            Your JCWF Collection grows as you explore the festival. Visit
            participating booths, discover new experiences, and collect their
            cards through QR scans.
          </p>
        </div>
      </section>

      {/* COLLECTION */}
      <section className="mx-auto max-w-[1200px] px-5 pb-16 md:px-8 md:pb-24">
        <MyCollectionCard />
      </section>

      {/* DISCOVER CTA */}
      <section className="bg-[#17382A] text-[#F7F3E8]">
        <div className="mx-auto flex max-w-[1200px] flex-col gap-6 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-8 md:py-16">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C89B3C]">
              Keep exploring
            </p>

            <h2 className="mt-3 max-w-2xl font-display text-3xl leading-[1] tracking-[-0.035em] md:text-4xl">
              There are more stories
              <br />
              waiting to be collected.
            </h2>

            <p className="mt-3 max-w-xl text-xs leading-6 text-white/50 md:text-sm">
              Discover activities, communities, and festival spaces around
              JCWF to continue your journey.
            </p>
          </div>

          <Link
            href="/scan"
            className="inline-flex w-fit shrink-0 items-center justify-center rounded-full bg-[#C89B3C] px-6 py-3.5 text-sm font-semibold text-[#17382A] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#F7F3E8]"
          >
            Scan a booth
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#17382A] px-5 pb-8 text-center">
        <p className="text-[9px] uppercase tracking-[0.18em] text-white/25">
          JCWF 2026 · Reconnect through every experience
        </p>
      </footer>
    </main>
  );
}