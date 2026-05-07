import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { ShoppingCart } from "lucide-react";

import { useCart } from "@/store/cart";
import { useMergedProducts, useCatalog } from "@/store/catalog";
import { useT } from "@/lib/i18n";
import { primaryProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/shop/")({
  validateSearch: z.object({
    q: z.string().optional(),
  }),
  head: () => ({
    meta: [
      { title: "Shop — Ruba" },
      {
        name: "description",
        content:
          "Browse our full collection of fresh organic produce and natural goods. Filter by category, dietary needs, and price.",
      },
      { property: "og:title", content: "Shop — Ruba" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const products = useMergedProducts();
  const loading = useCatalog((s) => s.loading);

  const [sort, setSort] = useState<"latest" | "price-asc" | "price-desc">("latest");
  const add = useCart((s) => s.add);
  const { t } = useT();
  const { q } = Route.useSearch();
  const [activeSearch, setActiveSearch] = useState(q || "");

  useEffect(() => {
    setActiveSearch(q || "");
  }, [q]);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeSearch.trim()) {
      const qs = activeSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(qs) ||
          (p.description || "").toLowerCase().includes(qs) ||
          (p.tagline || "").toLowerCase().includes(qs),
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sort, activeSearch]);

  if (loading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:py-16">
      <div className="grid gap-8 lg:gap-10">
        {/* Main */}
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl">
                {t("shop.title")}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground sm:mt-2">{t("shop.subtitle")}</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-full border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="latest">{t("shop.latest")}</option>
                <option value="price-asc">{t("shop.priceasc")}</option>
                <option value="price-desc">{t("shop.pricedesc")}</option>
              </select>
            </div>
          </div>

          <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p, i) => (
              <article
                key={p.slug}
                className="overflow-hidden rounded-xl bg-card shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-md sm:rounded-2xl opacity-0 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Link to="/shop/$slug" params={{ slug: p.slug }} className="block">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={primaryProductImage(p.image)}
                      alt={p.name}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 hover:scale-105"
                    />
                    {p.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                        <span className="rounded-full bg-destructive px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-3 sm:p-5">
                  <Link to="/shop/$slug" params={{ slug: p.slug }}>
                    <h3 className="font-display text-sm font-bold sm:text-base lg:text-lg">
                      {p.name}
                    </h3>
                  </Link>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:mt-1 sm:text-sm">
                    {p.tagline || p.description || ""}
                  </p>
                  <div className="mt-3 flex items-center justify-between sm:mt-4">
                    <div>
                      <span className="font-display text-sm font-bold text-primary sm:text-base lg:text-xl">
                        {(p.price || 0).toFixed(2)} DA
                      </span>
                      <span className="ms-1 text-[10px] text-muted-foreground sm:text-xs">
                        /{p.unit ? p.unit.split(" ")[0] : "unit"}
                      </span>
                    </div>
                    <button
                      onClick={() => add(p)}
                      aria-label={`Add ${p.name} to cart`}
                      disabled={p.stock === 0}
                      className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed sm:size-9"
                    >
                      <ShoppingCart className="size-3 sm:size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center sm:mt-16 sm:p-12">
              <p className="text-sm text-muted-foreground sm:text-base">{t("shop.nomatch")}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
