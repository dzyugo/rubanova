import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Plus, Mail } from "lucide-react";
import { useCart } from "@/store/cart";
import { useCatalog, useMergedProducts } from "@/store/catalog";
import { useSite } from "@/store/site";
import { useBanners } from "@/store/banners";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { primaryProductImage, featuredProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ruba — Fresh Organic Produce & Natural Goods" },
      {
        name: "description",
        content:
          "Discover premium organic produce and natural goods sourced from trusted Algerian farms. Order online with cash on delivery nationwide.",
      },
      { property: "og:title", content: "Ruba — Fresh Organic Produce & Natural Goods" },
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
  const activeBanners = useBanners((s) => s.banners).filter((b) => b.status === "Active");
  const { t, p } = useT();

  const featured = products.filter((p) => featuredSlugs.includes(p.slug));
  const big = featured[0] ?? products[0];
  const rest = featured.slice(1, 5);

  const handleNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string)?.trim();
    if (!email) return;
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email }, { onConflict: "email" });
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
            <div
              key={banner.id}
              className="relative h-[380px] w-full shrink-0 snap-center overflow-hidden sm:h-[460px] md:h-[520px] lg:h-[640px]"
            >
              <img
                src={banner.imageUrl || "/images/hero-produce.jpg"}
                alt={banner.title}
                className="absolute inset-0 size-full object-cover"
                width={1600}
                height={1024}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent rtl:bg-gradient-to-l" />
              <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-4 sm:px-6">
                <div className="max-w-xl">
                  {i === 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                      <Leaf className="size-3.5" /> {settings.heroEyebrow}
                    </span>
                  )}
                  <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-7xl">
                    {banner.title}
                  </h1>
                  {i === 0 && (
                    <p className="mt-3 max-w-md text-sm text-foreground/80 sm:text-base md:text-lg">
                      {settings.heroSubtitle}
                    </p>
                  )}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to={banner.link || "/shop"}
                      className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 sm:px-7 sm:py-3"
                    >
                      {t("home.shopnow")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="relative h-[380px] w-full shrink-0 snap-center overflow-hidden sm:h-[460px] md:h-[520px] lg:h-[640px]">
            <img
              src={settings.heroImageUrl || "/images/hero-produce.jpg"}
              alt="Fresh organic produce"
              className="absolute inset-0 size-full object-cover"
              width={1600}
              height={1024}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent rtl:bg-gradient-to-l" />
            <div className="relative mx-auto flex h-full w-full max-w-7xl items-center px-4 sm:px-6">
              <div className="max-w-xl">
                <span className="inline-flex items-center gap-2 rounded-full bg-tertiary/80 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                  <Leaf className="size-3.5" /> {settings.heroEyebrow}
                </span>
                <h1 className="mt-4 font-display text-3xl leading-tight sm:text-4xl md:text-5xl lg:text-7xl">
                  {settings.heroTitle}
                  <br />
                  <span className="text-primary">{settings.heroAccent}</span>
                </h1>
                <p className="mt-3 max-w-md text-sm text-foreground/80 sm:text-base md:text-lg">
                  {settings.heroSubtitle}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/shop"
                    className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 sm:px-7 sm:py-3"
                  >
                    {t("home.shopnow")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Featured harvest */}
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
              {t("home.featured")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground sm:mt-2">{t("home.featured.sub")}</p>
          </div>
          <Link to="/shop" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            {t("home.viewall")}
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground sm:mt-16 sm:p-12">
            {t("shop.nomatch", "No products available right now.")}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid lg:grid-cols-3">
            {/* Big featured card — full width on mobile, spans 2 cols on lg */}
            <Link
              to="/shop/$slug"
              params={{ slug: big.slug }}
              className="group relative overflow-hidden rounded-2xl bg-card sm:rounded-3xl lg:row-span-2 lg:col-span-2"
            >
              <img
                src={featuredProductImage(big.image)}
                alt={big.name}
                className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105 sm:aspect-square lg:aspect-auto lg:h-full"
                loading="lazy"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-4 sm:inset-x-0 sm:p-6">
                <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  {t("home.featured.badge")}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold sm:mt-3 sm:text-2xl lg:text-3xl">
                  {big.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{big.tagline}.</p>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    add(big);
                    toast.success(`${big.name} — ${t("toast.added")}`);
                  }}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-xs font-semibold shadow-sm transition hover:bg-secondary sm:mt-4 sm:px-5 sm:py-2.5 sm:text-sm"
                >
                  {t("home.addtocart")} — {formatPrice(big.price)}
                </button>
              </div>
            </Link>

            {/* Smaller cards */}
            {rest.map((prod) => (
              <div
                key={prod.slug}
                className="rounded-2xl bg-card p-3 shadow-sm sm:rounded-3xl sm:p-4"
              >
                <Link
                  to="/shop/$slug"
                  params={{ slug: prod.slug }}
                  className="block overflow-hidden rounded-xl"
                >
                  <img
                    src={featuredProductImage(prod.image)}
                    alt={prod.name}
                    className="aspect-square w-full object-cover transition duration-500 hover:scale-105"
                    loading="lazy"
                  />
                </Link>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    ★ {t("home.featured.badge")}
                  </span>
                  {prod.badges.slice(0, 1).map((b) => (
                    <span
                      key={b}
                      className="rounded-full bg-tertiary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary"
                    >
                      {b}
                    </span>
                  ))}
                </div>
                <Link to="/shop/$slug" params={{ slug: prod.slug }} className="mt-2 block">
                  <h3 className="font-display text-base font-bold sm:text-lg">{prod.name}</h3>
                  <p className="text-xs text-muted-foreground sm:text-sm">{prod.tagline}.</p>
                </Link>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 sm:mt-4 sm:pt-4">
                  <span className="font-display text-base font-bold text-primary sm:text-lg">
                    {formatPrice(prod.price)}
                  </span>
                  <button
                    onClick={() => {
                      add(prod);
                      toast.success(`${prod.name} — ${t("toast.added")}`);
                    }}
                    aria-label={`Add ${prod.name} to cart`}
                    className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 sm:size-9"
                  >
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
        <div className="mx-auto w-full max-w-2xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-background shadow-sm sm:size-14">
            <Mail className="size-5 text-primary sm:size-6" />
          </div>
          <h2 className="mt-5 font-display text-xl font-bold sm:text-2xl md:text-3xl">
            {t("home.newsletter.title", { name: settings.name })}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("home.newsletter.sub")}</p>
          <form
            onSubmit={handleNewsletter}
            className="mx-auto mt-6 flex flex-col gap-2 sm:flex-row sm:max-w-md sm:gap-3"
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
