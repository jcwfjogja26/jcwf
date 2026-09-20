export default function MarqueeSection() {
  const items = [
    "RECONNECTING",
    "PEOPLE",
    "CULTURE",
    "WELLBEING",
    "YOGYAKARTA",
  ];

  return (
    <section className="overflow-hidden border-y border-forest/10 bg-forest py-4 text-ivory">
      <div className="flex w-max animate-[marquee_25s_linear_infinite]">
        {[...items, ...items].map((item, index) => (
          <div key={index} className="flex items-center">
            <span className="px-6 font-display text-lg tracking-wide md:text-xl">
              {item}
            </span>
            <span className="text-gold">✦</span>
          </div>
        ))}
      </div>
    </section>
  );
}