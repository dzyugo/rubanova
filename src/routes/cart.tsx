import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, Lock, Leaf, ShoppingBag } from "lucide-react";
import { useCart } from "@/store/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Harvest Basket — Ruba Nova" },
      { name: "description", content: "Review your selection of verdant vitality before we prepare your shipment." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + shipping;

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
      <h1 className="font-display text-5xl font-bold text-primary md:text-6xl">Your Harvest Basket</h1>
      <p className="mt-2 text-muted-foreground">Review your selection of verdant vitality before we prepare your shipment.</p>

      {items.length === 0 ? (
        <div className="mt-16 grid place-items-center rounded-3xl border border-dashed border-border p-16 text-center">
          <ShoppingBag className="size-12 text-muted-foreground" />
          <h2 className="mt-4 font-display text-2xl font-bold">Your basket is empty</h2>
          <p className="mt-2 text-sm text-muted-foreground">Browse our harvest to begin your vitality journey.</p>
          <Link to="/shop" className="mt-6 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">
            Shop the harvest
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Items */}
          <div className="space-y-4">
            {items.map((i) => (
              <article key={i.slug} className="flex gap-4 rounded-2xl bg-card p-4 shadow-sm">
                <img src={i.image} alt={i.name} className="size-28 shrink-0 rounded-xl object-cover" />
                <div className="flex flex-1 flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Organic Certified</span>
                  <h3 className="mt-1 font-display text-lg font-bold">{i.name}</h3>
                  <p className="text-xs text-muted-foreground">{i.unit}</p>
                  <button onClick={() => remove(i.slug)} className="mt-auto flex items-center gap-1 self-start text-xs font-semibold text-destructive hover:underline">
                    <Trash2 className="size-3" /> Remove
                  </button>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <span className="font-display text-lg font-bold">${(i.price * i.qty).toFixed(2)}</span>
                  <div className="flex items-center gap-2 rounded-full border border-border px-1 py-1">
                    <button onClick={() => setQty(i.slug, i.qty - 1)} className="grid size-7 place-items-center rounded-full hover:bg-secondary"><Minus className="size-3" /></button>
                    <span className="w-6 text-center text-sm font-semibold">{i.qty}</span>
                    <button onClick={() => setQty(i.slug, i.qty + 1)} className="grid size-7 place-items-center rounded-full hover:bg-secondary"><Plus className="size-3" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Summary */}
          <aside className="h-fit rounded-3xl bg-tertiary/50 p-6">
            <h2 className="font-display text-2xl font-bold text-primary">Order Summary</h2>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex justify-between"><dt>Subtotal</dt><dd className="font-semibold">${subtotal.toFixed(2)}</dd></div>
              <div className="flex justify-between"><dt>Sustainable Packaging</dt><dd className="font-semibold text-primary">FREE</dd></div>
              <div className="flex justify-between"><dt>Carbon Neutral Shipping</dt><dd className="font-semibold">${shipping.toFixed(2)}</dd></div>
            </dl>
            <div className="mt-5 flex items-baseline justify-between border-t border-border pt-5">
              <span className="font-display text-xl font-bold">Total</span>
              <span className="font-display text-3xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="mt-6 flex items-center justify-center rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90">
              Proceed to Checkout
            </Link>
            <p className="mt-3 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Lock className="size-3" /> Secure & Encrypted Checkout
            </p>
            <div className="mt-6 flex gap-3 border-t border-border pt-5">
              <Leaf className="size-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Our Promise</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">Every purchase supports regenerative local farmers and sustainable distribution.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </section>
  );
}
