import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { z } from "zod";
import { ShoppingCart, SlidersHorizontal, X } from "lucide-react";
import { dietaryPreferences, flavorProfiles } from "@/data/products";
import { useCart } from "@/store/cart";
import { useMergedProducts, useCatalog } from "@/store/catalog";
import { useT } from "@/lib/i18n";
import { primaryProductImage } from "@/lib/product-images";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

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

  const categories = useCatalog((s) => s.categories);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [activeDiets, setActiveDiets] = useState<string[]>([]);
  const [activeFlavors, setActiveFlavors] = useState<string[]>([]);
  const computedMax = useMemo(() => {
    if (products.length === 0) return 10000;
    return Math.ceil(Math.max(...products.map((p) => p.price)) / 100) * 100;
  }, [products]);
  const [maxPrice, setMaxPrice] = useState(99999);
  const [sort, setSort] = useState<"latest" | "price-asc" | "price-desc">("latest");
  const add = useCart((s) => s.add);
  const { t } = useT();
  const { q } = Route.useSearch();
  const [activeSearch, setActiveSearch] = useState(q || "");

  useEffect(() => {
    setActiveSearch(q || "");
  }, [q]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (activeSearch.trim()) {
      const qs = activeSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(qs) ||
          p.description.toLowerCase().includes(qs) ||
          p.tagline.toLowerCase().includes(qs),
      );
    }
    if (activeCategories.length)
      list = list.filter((p) => activeCategories.includes(p.category));
    if (activeDiets.length)
      list = list.filter((p) => activeDiets.every((d) => p.badges.includes(d)));
    if (activeFlavors.length)
      list = list.filter((p) => activeFlavors.every((f) => p.badges.includes(f)));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCategories, activeDiets, activeFlavors, maxPrice, sort, activeSearch]);

  const toggleCategory = (c: string) =>
    setActiveCategories((arr) => (arr.includes(c) ? arr.filter((x) => x !== c) : [...arr, c]));
  const toggleDiet = (d: string) =>
    setActiveDiets((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));
  const toggleFlavor = (f: string) =>
    setActiveFlavors((arr) => (arr.includes(f) ? arr.filter((x) => x !== f) : [...arr, f]));

  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = activeCategories.length + activeDiets.length + activeFlavors.length + (maxPrice < 99999 ? 1 : 0);

  if (loading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </section>
    );
  }

  // Sidebar filter content — shared between desktop and mobile sheet
  const FilterPanel = () => (
    <div className="space-y-6">
      {categories.length > 0 && (
        <div>
          <h3 className="font-display text-sm font-bold text-primary">Product Type</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c}>
                <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/60">
                  <input
                    type="checkbox"
                    checked={activeCategories.includes(c)}
                    onChange={() => toggleCategory(c)}
                    className="size-4 accent-primary"
                  />
                  {c}
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-display text-sm font-bold text-primary">Dietary Preferences</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {dietaryPreferences.map((d) => (
            <li key={d}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/60">
                <input
                  type="checkbox"
                  checked={activeDiets.includes(d)}
                  onChange={() => toggleDiet(d)}
                  className="size-4 accent-primary"
                />
                {d}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold text-primary">Flavor Profile</h3>
        <ul className="mt-3 space-y-2 text-sm">
          {flavorProfiles.map((f) => (
            <li key={f}>
              <label className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/60">
                <input
                  type="checkbox"
                  checked={activeFlavors.includes(f)}
                  onChange={() => toggleFlavor(f)}
                  className="size-4 accent-primary"
                />
                {f}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-display text-sm font-bold text-primary">{t("shop.pricerange")}</h3>
        <input
          type="range"
          min={0}
          max={computedMax}
          step={50}
          value={Math.min(maxPrice, computedMax)}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="mt-3 w-full accent-primary"
        />
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>0 DA</span>
          <span>{maxPrice >= computedMax ? `${computedMax}+` : maxPrice} DA</span>
        </div>
      </div>
    </div>
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:py-16">
      {/* Mobile filter sheet */}
      <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
        <SheetContent side="left" className="flex w-[300px] flex-col overflow-y-auto sm:w-[320px]">
          <SheetHeader className="flex flex-row items-center justify-between px-1">
            <SheetTitle className="font-display text-lg font-bold">Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 flex-1 overflow-y-auto">
            <FilterPanel />
          </div>
        </SheetContent>
      </Sheet>

      <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:gap-10">
        {/* Desktop Sidebar */}
        <aside className="hidden space-y-6 lg:block">
          <FilterPanel />
        </aside>

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
              {/* Mobile filter button */}
              <button
                onClick={() => setFilterOpen(true)}
                className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium transition hover:bg-secondary md:hidden"
              >
                <SlidersHorizontal className="size-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>
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

          {/* Active filter chips (mobile) */}
          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 md:hidden">
              {[...activeCategories, ...activeDiets, ...activeFlavors].map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                >
                  {item}
                  <button onClick={() => {
                    if (activeCategories.includes(item)) toggleCategory(item);
                    else if (activeDiets.includes(item)) toggleDiet(item);
                    else toggleFlavor(item);
                  }}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              {maxPrice < 99999 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                  ≤{maxPrice} DA
                  <button onClick={() => setMaxPrice(99999)}>
                    <X className="size-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <article
                key={p.slug}
                className="overflow-hidden rounded-xl bg-card shadow-sm transition hover:shadow-md sm:rounded-2xl"
              >
                <Link to="/shop/$slug" params={{ slug: p.slug }} className="block">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img
                      src={primaryProductImage(p.image)}
                      alt={p.name}
                      loading="lazy"
                      className="size-full object-cover transition duration-500 hover:scale-105"
                    />
                    <div className="absolute start-2 top-2 flex flex-wrap gap-1">
                      {p.badges.slice(0, 2).map((b) => (
                        <span
                          key={b}
                          className="rounded-full bg-background/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary backdrop-blur"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
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
                    {p.tagline}.
                  </p>
                  <div className="mt-3 flex items-center justify-between sm:mt-4">
                    <div>
                      <span className="font-display text-sm font-bold text-primary sm:text-base lg:text-xl">
                        {p.price.toFixed(2)} DA
                      </span>
                      <span className="ms-1 text-[10px] text-muted-foreground sm:text-xs">
                        /{p.unit.split(" ")[0]}
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
