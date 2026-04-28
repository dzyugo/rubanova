import { createFileRoute, Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  const { t, lang } = useT();
  return (
    <>
      <section className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 md:py-20">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary sm:text-xs">
          {t("about.badge")}
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl md:text-5xl lg:text-7xl">
          {t("about.title")} <span className="text-primary">{t("about.titleaccent")}</span>
        </h1>
        <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg">{t("about.p1")}</p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">{t("about.p2")}</p>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-lg">{t("about.p3")}</p>
      </section>

      <section className="border-y border-border bg-tertiary/40">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:gap-12 sm:px-6 sm:py-16 md:py-20">
          {[
            { n: "40+", l: { en: "Regenerative farms", ar: "مزرعة مستدامة" } },
            { n: "100%", l: { en: "Compostable packaging", ar: "تغليف قابل للتحلل" } },
            { n: "24h", l: { en: "Farm to door", ar: "من المزرعة لبابك" } },
          ].map((s) => (
            <div key={s.l.en} className="text-center">
              <div className="font-display text-4xl font-bold text-primary sm:text-5xl md:text-6xl">{s.n}</div>
              <div className="mt-2 text-xs uppercase tracking-widest text-muted-foreground sm:text-sm">
                {s.l[lang]}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 sm:py-16 md:py-20">
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
