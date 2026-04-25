import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Plus, Mail } from "lucide-react";
import { useCart } from "@/store/cart";
import { useCatalog, useMergedProducts } from "@/store/catalog";
import { useSite } from "@/store/site";
import { useBanners } from "@/store/banners";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ruba Nova — Fresh Organic Produce & Natural Goods" },
      { name: "description", content: "Discover premium organic produce and natural goods sourced from trusted Algerian farms. Order online with cash on delivery nationwide." },
      { property: "og:title", content: "Ruba Nova — Fresh Organic Produce & Natural Goods" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const settings = useSite((s) => s.settings);
  const featuredSlugs = useCatalog((s) => s.featuredSlugs);
  const products = useMergedProducts();
  const add = useCart((s) => s.add);
  const loading = useCatalog((s) => s.loading);
  const activeBanners = useBanners((s) => s.banners).filter(b => b.status === "Active");
  const { t, p } = useT();

  const featured = products.filter((p) => featuredSlugs.includes(p.slug));
  const big = featured[0] ?? products[0];
  const rest = featured.slice(1, 5);

  const handleNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string)?.trim();
    if (!email) return;
    const { error } = await supabase.from("newsletter_subscribers").upsert({ email }, { onConflict: "email" });
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success(t("home.thanks"));
      form.reset();
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero Banners */}
      <section className="relative flex snap-x snap-mandatory overflow-x-auto scroll-smooth hide-scrollbar">
        {activeBanners.length > 0 ? (
          activeBanners.map((banner, i) => (
            <div key={banner.id} className="relative h-[520px] w-full shrink-0 snap-center overflow-hidden md:h-[640px]">
              <img src={banner.imageUrl || "/images/hero-produce.jpg"} alt={banner.title} className="absolute inset-0 size-full object-cover" width={1600} height={1024} />
              <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent rtl:bg-gradient-to-l" />
              <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-6">
                <div className="max-w-xl">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                      <Leaf className="size-3.5" /> {settings.heroEyebrow}
                    </span>
                  )}
                  <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
                    {banner.title}
                  </h1>
                  {i === 0 && (
                    <p className="mt-5 max-w-md text-base text-foreground/80 md:text-lg">
                      {settings.heroSubtitle}
                    </p>
                  )}
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link to={banner.link || "/shop"} className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90">
                      {t("home.shopnow")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="relative h-[520px] w-full shrink-0 snap-center overflow-hidden md:h-[640px]">
            <img src={settings.heroImageUrl || "/images/hero-produce.jpg"} alt="Fresh organic produce" className="absolute inset-0 size-full object-cover" width={1600} height={1024} />
            <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent rtl:bg-gradient-to-l" />
            <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-6">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                  <Leaf className="size-3.5" /> {settings.heroEyebrow}
                </span>
                <h1 className="mt-5 font-display text-5xl leading-[1.05] md:text-7xl">
                  {settings.heroTitle}<br /><span className="text-primary">{settings.heroAccent}</span>
                </h1>
                <p className="mt-5 max-w-md text-base text-foreground/80 md:text-lg">
                  {settings.heroSubtitle}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/shop" className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90">
                    {t("home.shopnow")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Featured harvest */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">{t("home.featured")}</h2>
            <p className="mt-2 text-muted-foreground">{t("home.featured.sub")}</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-primary hover:underline md:block">
            {t("home.viewall")}
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-16 rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground">
            {t("shop.nomatch", "No products available right now.")}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Link to="/shop/$slug" params={{ slug: big.slug }} className="group relative overflow-hidden rounded-3xl bg-card lg:row-span-2">
              <img src={big.image.split(',')[0]} alt={big.name} className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105 lg:aspect-auto lg:h-full" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-6">
                <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">{t("home.featured.badge")}</span>
                <h3 className="mt-3 font-display text-2xl font-bold">{big.name}</h3>
                <p className="text-sm text-muted-foreground">{big.tagline}.</p>
                <button
                  onClick={(e) => { e.preventDefault(); add(big); toast.success(`${big.name} — ${t("toast.added")}`); }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-secondary"
                >
                  {t("home.addtocart")} — {formatPrice(big.price)}
                </button>
              </div>
            </Link>

            {rest.map((prod) => (
              <div key={prod.slug} className="rounded-3xl bg-card p-4 shadow-sm">
                <Link to="/shop/$slug" params={{ slug: prod.slug }} className="block overflow-hidden rounded-2xl">
                  <img src={prod.image.split(',')[0]} alt={prod.name} className="aspect-square w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
                </Link>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    ★ {t("home.featured.badge")}
                  </span>
                  {prod.badges.slice(0, 1).map((b) => (
                    <span key={b} className="rounded-full bg-tertiary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{b}</span>
                  ))}
                </div>
                <Link to="/shop/$slug" params={{ slug: prod.slug }} className="mt-2 block">
                  <h3 className="font-display text-lg font-bold">{prod.name}</h3>
                  <p className="text-sm text-muted-foreground">{prod.tagline}.</p>
                </Link>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display text-lg font-bold text-primary">{formatPrice(prod.price)}</span>
                  <button onClick={() => { add(prod); toast.success(`${prod.name} — ${t("toast.added")}`); }} aria-label={`Add ${prod.name} to cart`} className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90">
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="bg-tertiary/60">
        <div className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
          <div className="mx-auto grid size-14 place-items-center rounded-full bg-background shadow-sm">
            <Mail className="size-6 text-primary" />
          </div>
          <h2 className="mt-5 font-display text-2xl font-bold">{t("home.newsletter.title", { name: settings.name })}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("home.newsletter.sub")}</p>
          <form
            onSubmit={handleNewsletter}
            className="mx-auto mt-6 flex max-w-md gap-2"
          >
            <input
              required
              name="email"
              type="email"
              placeholder="vitality@example.com"
              className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              {t("home.subscribe")}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function formatPrice(amount: number) {
  return `${amount.toFixed(2)} DA`;
}
