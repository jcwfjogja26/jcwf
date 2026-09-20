const pillars = [
  {
    number: "01",
    title: "SELF",
    description:
      "Come back to yourself through moments of reflection, movement, rest, and mindful living.",
    symbol: "◯",
  },
  {
    number: "02",
    title: "OTHERS",
    description:
      "Build meaningful connections through shared experiences, conversations, and collective joy.",
    symbol: "◌",
  },
  {
    number: "03",
    title: "NATURE",
    description:
      "Reconnect with the natural world and discover slower, more conscious ways of living.",
    symbol: "⌁",
  },
  {
    number: "04",
    title: "CULTURE",
    description:
      "Experience Jogja through its stories, traditions, creativity, and living heritage.",
    symbol: "✦",
  },
];

export default function PillarsSection() {
  return (
    <section
      id="about"
      className="relative overflow-hidden bg-forest px-6 py-24 text-ivory md:px-10 md:py-32 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        {/* Section intro */}
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr] md:items-end">
          <div>
            <p className="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
              <span className="h-px w-8 bg-gold" />
              The four directions
            </p>

            <h2 className="font-display text-5xl leading-[0.95] tracking-[-0.03em] md:text-7xl">
              Four ways
              <br />
              <span className="text-gold">to reconnect.</span>
            </h2>
          </div>

          <p className="max-w-lg text-sm leading-7 text-ivory/60 md:ml-auto md:text-base">
            JCWF brings together four dimensions of wellbeing. Not as separate
            experiences, but as different paths that meet in one shared
            journey.
          </p>
        </div>

        {/* Pillars */}
        <div className="mt-20 border-t border-ivory/15">
          {pillars.map((pillar) => (
            <article
              key={pillar.number}
              className="group grid gap-6 border-b border-ivory/15 py-8 transition-all duration-500 hover:px-3 md:grid-cols-[100px_1fr_1.2fr_70px] md:items-center"
            >
              <span className="text-xs tracking-[0.2em] text-ivory/35">
                {pillar.number}
              </span>

              <h3 className="font-display text-4xl transition-colors duration-300 group-hover:text-gold md:text-5xl">
                {pillar.title}
              </h3>

              <p className="max-w-md text-sm leading-6 text-ivory/50 transition-colors duration-300 group-hover:text-ivory/75">
                {pillar.description}
              </p>

              <span className="text-right font-display text-3xl text-gold/60 transition-transform duration-500 group-hover:translate-x-2 group-hover:text-gold">
                {pillar.symbol}
              </span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}