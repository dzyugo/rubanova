import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Minus, Plus, ShoppingBag, Leaf, Truck, Droplet, ChevronRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { useMergedProducts } from "@/store/catalog";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { parseProductImages, primaryProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/shop/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Ruba`,
      },
      {
        property: "og:title",
        content: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Ruba`,
      },
    ],
  }),
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
      <Link to="/shop" className="mt-6 inline-block text-primary hover:underline">
        {t("product.backshop")}
      </Link>
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
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

  const related = products
    .filter((p) => p.category === product.category && p.slug !== product.slug)
    .slice(0, 4);
  const images = parseProductImages(product.image);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-xs">
        <Link to="/shop" className="hover:text-primary">
          {t("nav.shop")}
        </Link>
        <ChevronRight className="size-3 shrink-0" />
        <span className="truncate max-w-[160px] text-primary">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
        {/* Image */}
        <div>
          <div className="overflow-hidden rounded-2xl bg-card shadow-sm sm:rounded-3xl">
            <img
              src={images[activeImage] || images[0]}
              alt={product.name}
              width={800}
              height={800}
              className="aspect-square w-full object-cover img-reveal"
              key={activeImage}
            />
          </div>
          {images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2 sm:mt-4 sm:gap-3">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`overflow-hidden rounded-lg border-2 ${i === activeImage ? "border-primary" : "border-transparent"}`}
                >
                  <img
                    src={src}
                    alt=""
                    className={`aspect-square w-full object-cover ${i === activeImage ? "opacity-100" : "opacity-50 hover:opacity-80"}`}
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <h1 className="mt-3 font-display text-2xl font-bold sm:mt-4 sm:text-3xl md:text-4xl lg:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3">{product.description}</p>

          <div className="mt-5 flex items-baseline gap-2 sm:mt-6">
            <span className="font-display text-3xl font-bold text-primary sm:text-4xl">
              {(product.price || 0).toFixed(2)} DA
            </span>
            <span className="text-sm text-muted-foreground">/ {product.unit}</span>
          </div>
          {product.stock !== undefined && (
            <div className="mt-3">
              {product.stock === 0 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-bold text-destructive">
                  ● Out of Stock
                </span>
              ) : product.stock < 10 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  ● Only {product.stock} left in stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary px-3 py-1 text-xs font-bold text-primary">
                  ● In Stock
                </span>
              )}
            </div>
          )}

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground sm:mt-8">
            {t("product.qty")}
          </p>
          <div className="mt-2 flex items-center gap-3 sm:mt-3">
            <div className="flex items-center gap-1 rounded-full border border-border bg-card px-1.5 py-1 sm:gap-2 sm:px-2">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid size-8 place-items-center rounded-full hover:bg-secondary"
                aria-label="Decrease"
              >
                <Minus className="size-3.5 sm:size-4" />
              </button>
              <span className="w-7 text-center text-sm font-semibold sm:w-8">{qty}</span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="grid size-8 place-items-center rounded-full hover:bg-secondary"
                aria-label="Increase"
              >
                <Plus className="size-3.5 sm:size-4" />
              </button>
            </div>
            <div className="flex flex-1 gap-2">
              <button
                onClick={() => {
                  add(product, qty);
                  toast.success(`${product.name} ×${qty} — ${t("toast.added")}`);
                }}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-primary bg-background px-2 py-3 text-sm font-semibold text-primary shadow-sm transition hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed sm:px-4"
              >
                <ShoppingBag className="size-4 shrink-0" />
                <span className="truncate">
                  {product.stock === 0 ? t("product.outofstock") : t("product.addtocart")}
                </span>
              </button>
              <button
                onClick={() => {
                  add(product, qty);
                  navigate({ to: "/checkout" });
                }}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary px-2 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed sm:px-4"
              >
                {t("product.buynow")}
              </button>
            </div>
          </div>

          {/* Nutrition */}
          <div className="mt-6 rounded-xl border border-border bg-card sm:mt-8 sm:rounded-2xl">
            <button
              onClick={() => setShowNutrition((s) => !s)}
              className="flex w-full items-center justify-between px-4 py-3 sm:px-5 sm:py-4"
            >
              <span className="flex items-center gap-2 font-display text-sm font-bold sm:text-base">
                <Leaf className="size-4 text-primary" /> {t("product.nutrition")}
              </span>
              <span className="text-muted-foreground">{showNutrition ? "−" : "+"}</span>
            </button>
            {showNutrition && (
              <dl className="divide-y divide-border border-t border-border text-sm">
                {(Object.entries(product.nutrition || {}) as [string, string | undefined][])
                  .filter(([, v]) => Boolean(v))
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between px-4 py-2.5 sm:px-5 sm:py-3">
                      <dt className="text-muted-foreground capitalize">
                        {k.replace(/([A-Z])/g, " $1").trim()}
                      </dt>
                      <dd className="font-semibold">{v}</dd>
                    </div>
                  ))}
              </dl>
            )}
          </div>

          {/* Trust badges */}
          <div className="mt-4 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
            {[
              { icon: Leaf, label: t("product.organic") },
              { icon: Truck, label: t("product.fresh") },
              { icon: Droplet, label: t("product.washed") },
            ].map((b) => (
              <div
                key={b.label}
                className="grid place-items-center gap-1.5 rounded-xl bg-tertiary/60 py-3 sm:rounded-2xl sm:py-4"
              >
                <b.icon className="size-4 text-primary sm:size-5" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary sm:text-[11px]">
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related */}
      <section className="mt-12 sm:mt-16 lg:mt-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold sm:text-2xl lg:text-3xl">
              {t("product.related")}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("product.related.sub")}</p>
          </div>
          <Link to="/shop" className="shrink-0 text-sm font-semibold text-primary hover:underline">
            {t("product.viewshop")}
          </Link>
        </div>
        <div className="mt-5 grid gap-3 grid-cols-2 sm:mt-6 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4">
          {related.map((p) => (
            <Link key={p.slug} to="/shop/$slug" params={{ slug: p.slug }} className="group block">
              <div className="overflow-hidden rounded-xl bg-card sm:rounded-2xl">
                <img
                  src={primaryProductImage(p.image)}
                  alt={p.name}
                  className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-2 sm:mt-3">
                <h3 className="text-sm font-bold sm:text-base">{p.name}</h3>
                <span className="text-xs font-bold text-primary sm:text-sm">
                  {(p.price || 0).toFixed(2)} DA
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground sm:text-xs">{p.unit}</p>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
