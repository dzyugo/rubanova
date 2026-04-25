import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Leaf, Truck, Droplet, ChevronRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { useMergedProducts } from "@/store/catalog";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/shop/$slug")({
  component: ProductPage,
  notFoundComponent: NotFoundProduct,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function NotFoundProduct() {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">{t("product.notfound")}</h1>
      <Link to="/shop" className="mt-6 inline-block text-primary hover:underline">{t("product.backshop")}</Link>
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const products = useMergedProducts();
  const product = products.find((p) => p.slug === slug);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [showNutrition, setShowNutrition] = useState(true);
  const add = useCart((s) => s.add);
  const { t } = useT();

  if (!product) {
    if (products.length === 0) {
      return (
        <section className="flex min-h-[40vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </section>
      );
    }
    throw notFound();
  }

  const related = products.filter((p) => p.category === product.category && p.slug !== product.slug).slice(0, 4);
  const images = product.image ? product.image.split(',') : [];

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Link to="/shop" className="hover:text-primary">{t("nav.shop")}</Link>
        <ChevronRight className="size-3" />
        <span>{product.category}</span>
        <ChevronRight className="size-3" />
        <span className="text-primary">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-12 lg:grid-cols-2 lg:items-start">
        {/* Image */}
        <div>
          <div className="overflow-hidden rounded-3xl bg-card shadow-sm">
            <img src={images[activeImage] || images[0]} alt={product.name} width={800} height={800} className="aspect-square w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-4 grid grid-cols-4 gap-3">
              {images.map((src, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`overflow-hidden rounded-xl border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`}>
                  <img src={src} alt="" className={`aspect-square w-full object-cover ${i === activeImage ? "opacity-100" : "opacity-60 hover:opacity-100"}`} loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex flex-wrap gap-2">
            {product.badges.map((b: string) => (
              <span key={b} className="rounded-full bg-tertiary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{b}</span>
            ))}
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold md:text-5xl">{product.name}</h1>
          <p className="mt-3 text-base text-muted-foreground">{product.description}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-primary">{product.price.toFixed(2)} DA</span>
            <span className="text-sm text-muted-foreground">/ {product.unit}</span>
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t("product.qty")}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-8 place-items-center rounded-full hover:bg-secondary" aria-label="Decrease">
                <Minus className="size-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="grid size-8 place-items-center rounded-full hover:bg-secondary" aria-label="Increase">
                <Plus className="size-4" />
              </button>
            </div>
            <button
              onClick={() => add(product, qty)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90"
            >
              <ShoppingBag className="size-4" /> {t("product.addtocart")}
            </button>
          </div>

          {/* Nutrition */}
          <div className="mt-8 rounded-2xl border border-border bg-card">
            <button
              onClick={() => setShowNutrition((s) => !s)}
              className="flex w-full items-center justify-between px-5 py-4"
            >
              <span className="flex items-center gap-2 font-display text-base font-bold">
                <Leaf className="size-4 text-primary" /> {t("product.nutrition")}
              </span>
              <span className="text-muted-foreground">{showNutrition ? "−" : "+"}</span>
            </button>
            {showNutrition && (
              <dl className="divide-y divide-border border-t border-border text-sm">
                {(Object.entries(product.nutrition) as [string, string | undefined][])
                  .filter(([, v]) => Boolean(v))
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between px-5 py-3">
                      <dt className="text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1").trim()}</dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Leaf, label: t("product.organic") },
              { icon: Truck, label: t("product.fresh") },
              { icon: Droplet, label: t("product.washed") },
            ].map((b) => (
              <div key={b.label} className="grid place-items-center gap-2 rounded-2xl bg-tertiary/60 py-4">
                <b.icon className="size-5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="mt-20">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold">{t("product.related")}</h2>
            <p className="mt-1 text-muted-foreground">{t("product.related.sub")}</p>
          </div>
          <Link to="/shop" className="hidden text-sm font-semibold text-primary hover:underline md:block">
            {t("product.viewshop")}
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((p) => (
            <Link key={p.slug} to="/shop/$slug" params={{ slug: p.slug }} className="group block">
              <div className="overflow-hidden rounded-2xl bg-card">
                <img src={p.image.split(',')[0]} alt={p.name} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <h3 className="font-display text-base font-bold">{p.name}</h3>
                <span className="text-sm font-bold text-primary">{p.price.toFixed(2)} DA</span>
              </div>
              <p className="text-xs text-muted-foreground">{p.unit}</p>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
