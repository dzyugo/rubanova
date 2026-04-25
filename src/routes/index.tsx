import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Plus, Mail } from "lucide-react";
import { useCart } from "@/store/cart";
import { useCatalog, useMergedProducts } from "@/store/catalog";
import { useSite } from "@/store/site";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const settings = useSite((s) => s.settings);
  const featuredSlugs = useCatalog((s) => s.featuredSlugs);
  const products = useMergedProducts();
  const add = useCart((s) => s.add);
  const loading = useCatalog((s) => s.loading);

  const featured = products.filter((p) => featuredSlugs.includes(p.slug));
  const big = featured[0] ?? products[0];
  const rest = featured.slice(1, 5);
  const heroImage = settings.heroImageUrl || "/images/hero-produce.jpg";

  if (loading || products.length === 0) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Loading fresh harvest…</p>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative">
        <div className="relative h-[520px] w-full overflow-hidden md:h-[640px]">
          <img src={heroImage} alt="Fresh organic produce" className="absolute inset-0 size-full object-cover" width={1600} height={1024} />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/30 to-transparent" />
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
                  Shop Now →
                </Link>
                <Link to="/about" className="inline-flex items-center justify-center rounded-full border border-border bg-background/80 px-7 py-3 text-sm font-semibold backdrop-blur transition hover:bg-secondary">
                  Our Story
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured harvest */}
      <section className="mx-auto w-full max-w-7xl px-6 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold md:text-4xl">Featured Harvest</h2>
            <p className="mt-2 text-muted-foreground">Hand-picked by our team — updated weekly.</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-primary hover:underline md:block">
            View all collection →
          </Link>
        </div>

        {featured.length === 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.slice(0, 3).map((p) => (
              <div key={p.slug} className="rounded-3xl bg-card p-4 shadow-sm">
                <Link to="/shop/$slug" params={{ slug: p.slug }} className="block overflow-hidden rounded-2xl">
                  <img src={p.image} alt={p.name} className="aspect-square w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
                </Link>
                <Link to="/shop/$slug" params={{ slug: p.slug }} className="mt-3 block">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.tagline}.</p>
                </Link>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display text-lg font-bold text-primary">${p.price.toFixed(2)}</span>
                  <button onClick={() => add(p)} aria-label={`Add ${p.name} to cart`} className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90">
                    <Plus className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            <Link to="/shop/$slug" params={{ slug: big.slug }} className="group relative overflow-hidden rounded-3xl bg-card lg:row-span-2">
              <img src={big.image} alt={big.name} className="aspect-square w-full object-cover transition duration-700 group-hover:scale-105 lg:aspect-auto lg:h-full" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-6">
                <span className="inline-block rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">Featured</span>
                <h3 className="mt-3 font-display text-2xl font-bold">{big.name}</h3>
                <p className="text-sm text-muted-foreground">{big.tagline}.</p>
                <button
                  onClick={(e) => { e.preventDefault(); add(big); }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold shadow-sm transition hover:bg-secondary"
                >
                  Add to Cart — ${big.price.toFixed(2)}
                </button>
              </div>
            </Link>

            {rest.map((p) => (
              <div key={p.slug} className="rounded-3xl bg-card p-4 shadow-sm">
                <Link to="/shop/$slug" params={{ slug: p.slug }} className="block overflow-hidden rounded-2xl">
                  <img src={p.image} alt={p.name} className="aspect-square w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
                </Link>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                    ★ Featured
                  </span>
                  {p.badges.slice(0, 1).map((b) => (
                    <span key={b} className="rounded-full bg-tertiary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{b}</span>
                  ))}
                </div>
                <Link to="/shop/$slug" params={{ slug: p.slug }} className="mt-2 block">
                  <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  <p className="text-sm text-muted-foreground">{p.tagline}.</p>
                </Link>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="font-display text-lg font-bold text-primary">${p.price.toFixed(2)}</span>
                  <button onClick={() => add(p)} aria-label={`Add ${p.name} to cart`} className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90">
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
          <h2 className="mt-5 font-display text-2xl font-bold">Join the {settings.name} Circle</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Get seasonal recipes, wellness tips, and exclusive early access to our limited harvests delivered to your inbox.
          </p>
          <form
            onSubmit={(e) => { e.preventDefault(); alert("Thanks for subscribing!"); }}
            className="mx-auto mt-6 flex max-w-md gap-2"
          >
            <input
              required
              type="email"
              placeholder="vitality@example.com"
              className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
