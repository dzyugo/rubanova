import { createFileRoute, Link } from "@tanstack/react-router";
const hero = "/images/hero-produce.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Ruba Nova" },
      { name: "description", content: "Ruba Nova is a regenerative grocery rooted in honest sourcing and seasonal eating." },
      { property: "og:title", content: "Our Story — Ruba Nova" },
      { property: "og:description", content: "Ruba Nova is a regenerative grocery rooted in honest sourcing and seasonal eating." },
      { property: "og:image", content: hero },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <section className="mx-auto w-full max-w-4xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Our story</p>
        <h1 className="mt-3 font-display text-5xl font-bold md:text-7xl">Verdant vitality, by design.</h1>
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
          Ruba Nova began on a small regenerative farm in Ojai, California, with a single belief: that the food we eat
          should leave the soil, the grower, and our bodies better than it found them.
        </p>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Today we partner with twenty-three regenerative growers across the West Coast. Our team picks at sunrise,
          packs in compostable materials, and delivers carbon-neutral — usually within twenty-four hours of harvest.
        </p>
      </section>

      <section className="border-y border-border bg-tertiary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-3">
          {[
            { n: "23", l: "Regenerative growers" },
            { n: "100%", l: "Compostable packaging" },
            { n: "24h", l: "Farm to door" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display text-6xl font-bold text-primary">{s.n}</div>
              <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="font-display text-4xl font-bold">Eat with intention.</h2>
        <Link to="/shop" className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Shop the harvest
        </Link>
      </section>
    </>
  );
}
