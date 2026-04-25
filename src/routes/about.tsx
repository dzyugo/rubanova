import { createFileRoute, Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { t, lang } = useT();
  return (
    <>
      <section className="mx-auto w-full max-w-4xl px-6 py-20">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
          {t("about.badge")}
        </p>
        <h1 className="mt-3 font-display text-5xl font-bold md:text-7xl">
          {t("about.title")} <span className="text-primary">{t("about.titleaccent")}</span>
        </h1>
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{t("about.p1")}</p>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("about.p2")}</p>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{t("about.p3")}</p>
      </section>

      <section className="border-y border-border bg-tertiary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 md:grid-cols-3">
          {[
            { n: "40+", l: { en: "Regenerative farms", ar: "مزرعة مستدامة" } },
            { n: "100%", l: { en: "Compostable packaging", ar: "تغليف قابل للتحلل" } },
            { n: "24h", l: { en: "Farm to door", ar: "من المزرعة لبابك" } },
          ].map((s) => (
            <div key={s.l.en} className="text-center">
              <div className="font-display text-6xl font-bold text-primary">{s.n}</div>
              <div className="mt-2 text-sm uppercase tracking-widest text-muted-foreground">
                {s.l[lang]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <Link
          to="/shop"
          className="mt-8 inline-flex rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
        >
          {t("about.cta")}
        </Link>
      </section>
    </>
  );
}
