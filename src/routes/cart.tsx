import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, Lock, Leaf, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";
import { useShipping } from "@/store/shipping";
import { wilayas } from "@/data/wilayas";
import { useT } from "@/lib/i18n";
import { primaryProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/cart")({
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const companies = useShipping((s) => s.companies);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const activeCompanies = companies.filter((c) => c.active);
  const defaultWilaya = wilayas[0];
  const defaultCompany = activeCompanies[0];
  const shippingRate = defaultCompany
    ? (defaultCompany.rates[defaultWilaya]?.home ?? defaultCompany.defaultHomeRate)
    : 0;
  const shipping = subtotal > 0 ? shippingRate : 0;
  const total = subtotal + shipping;
  const { t, p } = useT();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 md:py-16">
      <h1 className="font-display text-3xl font-bold text-primary sm:text-4xl md:text-5xl lg:text-6xl">
        {t("cart.title")}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground sm:mt-2">{t("cart.subtitle")}</p>

      {items.length === 0 ? (
        <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-border p-10 text-center sm:mt-16 sm:rounded-3xl sm:p-16">
          <ShoppingBag className="size-10 text-muted-foreground sm:size-12" />
          <h2 className="mt-4 font-display text-xl font-bold sm:text-2xl">{t("cart.empty")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("cart.empty.sub")}</p>
          <Link
            to="/shop"
            className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            {t("cart.browse")}
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8">
          {/* Items */}
          <div className="space-y-3 sm:space-y-4">
            {items.map((i) => (
              <article
                key={i.slug}
                className="flex gap-3 rounded-xl bg-card p-3 shadow-sm sm:rounded-2xl sm:p-4"
              >
                <img
                  src={primaryProductImage(i.image)}
                  alt={i.name}
                  className="size-20 shrink-0 rounded-lg object-cover sm:size-28 sm:rounded-xl"
                />
                <div className="flex flex-1 flex-col min-w-0">
                  <h3 className="font-display text-base font-bold sm:text-lg">{i.name}</h3>
                  <p className="text-xs text-muted-foreground">{i.unit}</p>
                  <button
                    onClick={() => remove(i.slug)}
                    className="mt-auto flex items-center gap-1 self-start text-xs font-semibold text-destructive hover:underline"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
                <div className="flex flex-col items-end justify-between gap-2">
                  <span className="font-display text-base font-bold sm:text-lg">
                    {p(i.price * i.qty)}
                  </span>
                  <div className="flex items-center gap-1 rounded-full border border-border px-1 py-1">
                    <button
                      onClick={() => setQty(i.slug, i.qty - 1)}
                      className="grid size-6 place-items-center rounded-full hover:bg-secondary sm:size-7"
                    >
                      <Minus className="size-2.5 sm:size-3" />
                    </button>
                    <span className="w-5 text-center text-sm font-semibold sm:w-6 sm:text-sm">
                      {i.qty}
                    </span>
                    <button
                      onClick={() => setQty(i.slug, i.qty + 1)}
                      className="grid size-6 place-items-center rounded-full hover:bg-secondary sm:size-7"
                    >
                      <Plus className="size-2.5 sm:size-3" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary — stacked on mobile, beside on lg */}
          <aside className="rounded-2xl bg-tertiary/50 p-4 sm:rounded-3xl sm:p-6 lg:sticky lg:top-24 lg:h-fit">
            <h2 className="font-display text-xl font-bold text-primary sm:text-2xl">
              {t("checkout.ordersummary")}
            </h2>
            <dl className="mt-5 space-y-2.5 text-sm sm:mt-6 sm:space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("cart.subtotal")}</dt>
                <dd className="font-semibold">{p(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("cart.shipping.estimate")}</dt>
                <dd className="font-semibold">{p(shipping)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">{t("cart.shipping.disclaimer")}</p>
            <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4 sm:mt-5 sm:pt-5">
              <span className="font-display text-base font-bold sm:text-xl">
                {t("checkout.total")}
              </span>
              <span className="font-display text-2xl font-bold text-primary sm:text-3xl">
                {p(total)}
              </span>
            </div>
            <Link
              to="/checkout"
              className="mt-5 flex items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 sm:mt-6 sm:py-4"
            >
              {t("cart.checkout")}
            </Link>
            <p className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground sm:mt-3">
              <Lock className="size-3" /> {t("cart.secure")}
            </p>
            <div className="mt-5 flex gap-3 border-t border-border pt-4 sm:mt-6">
              <Leaf className="size-5 shrink-0 text-primary" />
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t("cart.sustainable")}
              </p>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
