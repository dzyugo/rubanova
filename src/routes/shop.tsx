import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ShoppingCart } from "lucide-react";
import { diets, type Diet } from "@/data/products";
import { useCart } from "@/store/cart";
import { useCatalog, useMergedProducts } from "@/store/catalog";

export const Route = createFileRoute("/shop")({
  component: ShopPage,
});

function ShopPage() {
  const products = useMergedProducts();
  const categories = useCatalog((s) => s.categories);
  const loading = useCatalog((s) => s.loading);
  const [activeCat, setActiveCat] = useState<string | "All">("All");
  const [activeDiets, setActiveDiets] = useState<Diet[]>([]);
  const [maxPrice, setMaxPrice] = useState(50);
  const [sort, setSort] = useState<"latest" | "price-asc" | "price-desc">("latest");
  const add = useCart((s) => s.add);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= maxPrice);
    if (activeCat !== "All") list = list.filter((p) => p.category === activeCat);
    if (activeDiets.length) list = list.filter((p) => activeDiets.every((d) => p.badges.includes(d)));
    if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCat, activeDiets, maxPrice, sort]);

  const toggleDiet = (d: Diet) =>
    setActiveDiets((arr) => (arr.includes(d) ? arr.filter((x) => x !== d) : [...arr, d]));

  if (loading) {
    return (
      <section className="flex min-h-[40vh] items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-8">
          <div>
            <h3 className="font-display text-base font-bold text-primary">Categories</h3>
            <ul className="mt-4 space-y-1 text-sm">
              <li>
                <button
                  onClick={() => setActiveCat("All")}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2 transition ${activeCat === "All" ? "border-l-2 border-primary bg-secondary font-semibold text-primary" : "hover:bg-secondary/60"}`}
                >
                  <span>All Products</span>
                  <span className="text-xs text-muted-foreground">{products.length}</span>
                </button>
              </li>
              {categories.map((c) => (
                <li key={c}>
                  <button
                    onClick={() => setActiveCat(c)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 transition ${activeCat === c ? "border-l-2 border-primary bg-secondary font-semibold text-primary" : "hover:bg-secondary/60"}`}
                  >
                    <span>{c}</span>
                    <span className="text-xs text-muted-foreground">{counts[c] ?? 0}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-base font-bold text-primary">Dietary Needs</h3>
            <ul className="mt-4 space-y-2 text-sm">
              {diets.map((d) => (
                <li key={d}>
                  <label className="flex cursor-pointer items-center gap-3 px-3 py-1">
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
            <h3 className="font-display text-base font-bold text-primary">Price Range</h3>
            <input
              type="range"
              min={0}
              max={50}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-4 w-full accent-primary"
            />
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>$0</span>
              <span>${maxPrice}+</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <div>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-4xl font-bold md:text-5xl">Our Harvest</h1>
              <p className="mt-2 text-muted-foreground">Selected fresh produce and essentials for your vitality.</p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-muted-foreground">Sort by:</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="latest">Latest Harvest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <article key={p.slug} className="overflow-hidden rounded-2xl bg-card shadow-sm transition hover:shadow-md">
                <Link to="/shop/$slug" params={{ slug: p.slug }} className="block">
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    <img src={p.image} alt={p.name} loading="lazy" className="size-full object-cover transition duration-500 hover:scale-105" />
                    <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
                      {p.badges.slice(0, 2).map((b) => (
                        <span key={b} className="rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary backdrop-blur">{b}</span>
                      ))}
                    </div>
                  </div>
                </Link>
                <div className="p-5">
                  <Link to="/shop/$slug" params={{ slug: p.slug }}>
                    <h3 className="font-display text-lg font-bold">{p.name}</h3>
                  </Link>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.tagline}.</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <span className="font-display text-xl font-bold text-primary">${p.price.toFixed(2)}</span>
                      <span className="ml-1 text-xs text-muted-foreground">/{p.unit.split(" ")[0]}</span>
                    </div>
                    <button
                      onClick={() => add(p)}
                      aria-label={`Add ${p.name} to cart`}
                      className="grid size-10 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90"
                    >
                      <ShoppingCart className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="mt-16 rounded-2xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground">No products match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
