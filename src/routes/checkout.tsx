import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, CreditCard, ClipboardCheck, MapPin, Check, Lock, Building2, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Ruba Nova" },
      { name: "description", content: "Secure encrypted checkout via Verdant-Pay architecture." },
    ],
  }),
  component: CheckoutPage,
});

const steps = [
  { id: "shipping", label: "Shipping", icon: Truck },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "review", label: "Review", icon: ClipboardCheck },
] as const;

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.addOrder);
  const navigate = useNavigate();
  const [step] = useState<0 | 1 | 2>(0);
  const [shipping, setShipping] = useState<"express" | "standard">("express");
  const [payment, setPayment] = useState<"card" | "paypal">("card");

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipFee = shipping === "express" ? 12 : 5;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = subtotal + shipFee + tax;

  const placeOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const order = await addOrder({
      items: [...items],
      subtotal,
      shipping: shipFee,
      tax,
      total,
      shippingMethod: shipping,
      paymentMethod: payment,
      address: {
        fullName: String(f.get("fullName") || "Guest"),
        street: String(f.get("street") || ""),
        city: String(f.get("city") || ""),
        zip: String(f.get("zip") || ""),
      },
    });
    clear();
    navigate({ to: "/order-confirmation/$id", params: { id: order.id } });
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl font-bold">Your basket is empty</h1>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">Shop the harvest</Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-12">
      {/* Stepper */}
      <ol className="mx-auto flex max-w-2xl items-center justify-between">
        {steps.map((s, i) => {
          const active = i <= step;
          return (
            <li key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`grid size-12 place-items-center rounded-full ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                  {i < step ? <Check className="size-5" /> : <s.icon className="size-5" />}
                </div>
                <span className={`mt-2 text-xs font-semibold uppercase tracking-widest ${active ? "text-primary" : "text-muted-foreground"}`}>{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-2 h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </li>
          );
        })}
      </ol>

      <form onSubmit={placeOrder} className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Shipping address */}
          <fieldset className="rounded-2xl bg-card p-6 shadow-sm">
            <legend className="flex items-center gap-2 font-display text-lg font-bold"><MapPin className="size-5 text-primary" /> Shipping Address</legend>
            <div className="mt-5 grid gap-5">
              <Field name="fullName" label="Full Name" placeholder="e.g. Julian Verdant" required />
              <Field name="street" label="Street Address" placeholder="123 Greenhouse Lane" required />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="city" label="City" placeholder="Portland" required />
                <Field name="zip" label="Zip Code" placeholder="97201" required />
              </div>
            </div>
          </fieldset>

          {/* Shipping method */}
          <fieldset className="rounded-2xl bg-card p-6 shadow-sm">
            <legend className="flex items-center gap-2 font-display text-lg font-bold"><Check className="size-5 text-primary" /> Shipping Method</legend>
            <div className="mt-5 space-y-3">
              {[
                { id: "express", title: "Express Delivery", sub: "Arrival in 1-2 business days", price: 12 },
                { id: "standard", title: "Standard Shipping", sub: "Arrival in 4-6 business days", price: 5 },
              ].map((opt) => (
                <label key={opt.id} className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition ${shipping === opt.id ? "border-primary bg-tertiary/40" : "border-border"}`}>
                  <input type="radio" name="shipping" checked={shipping === opt.id} onChange={() => setShipping(opt.id as "express" | "standard")} className="sr-only" />
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${shipping === opt.id ? "border-primary bg-primary" : "border-border"}`}>
                    {shipping === opt.id && <Check className="size-3 text-primary-foreground" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-base font-bold">{opt.title}</p>
                    <p className="text-xs text-muted-foreground">{opt.sub}</p>
                  </div>
                  <span className="font-bold text-primary">${opt.price.toFixed(2)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="rounded-2xl bg-card p-6 shadow-sm">
            <legend className="flex items-center gap-2 font-display text-lg font-bold"><CreditCard className="size-5 text-primary" /> Payment Method</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { id: "card", icon: CreditCard, label: "Credit Card" },
                { id: "paypal", icon: Building2, label: "PayPal" },
              ].map((opt) => (
                <label key={opt.id} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 font-semibold transition ${payment === opt.id ? "border-primary bg-tertiary/40 text-primary" : "border-border text-muted-foreground"}`}>
                  <input type="radio" name="payment" checked={payment === opt.id} onChange={() => setPayment(opt.id as "card" | "paypal")} className="sr-only" />
                  <opt.icon className="size-4" /> {opt.label}
                </label>
              ))}
            </div>
            {payment === "card" && (
              <div className="mt-5 grid gap-5">
                <Field name="cardNumber" label="Card Number" placeholder="0000 0000 0000 0000" required />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="expiryDate" label="Expiry Date" placeholder="MM / YY" required />
                  <Field name="cvv" label="CVV" placeholder="123" required />
                </div>
              </div>
            )}
          </fieldset>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold">Order Summary</h2>
          <ul className="mt-5 space-y-4">
            {items.map((i) => (
              <li key={i.slug} className="flex gap-3">
                <img src={i.image} alt={i.name} className="size-14 rounded-lg object-cover" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold">{i.name}</span>
                  <span className="text-xs text-muted-foreground">Qty: {i.qty} • {i.unit}</span>
                </div>
                <span className="font-bold text-primary">${(i.price * i.qty).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd className="text-primary">${shipFee.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt>Estimated Tax</dt><dd>${tax.toFixed(2)}</dd></div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-display text-base font-bold">Total</span>
            <span className="font-display text-2xl font-bold">${total.toFixed(2)}</span>
          </div>
          <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90">
            Place Order <ArrowRight className="size-4" />
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
            <Lock className="size-3" /> ENCRYPTED CHECKOUT
          </p>
          <p className="mt-2 text-center text-[10px] italic text-muted-foreground">Secure Payment via Verdant-Pay Architecture</p>
        </aside>
      </form>
    </section>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input {...props} className="mt-2 w-full rounded-lg border-b border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none" />
    </label>
  );
}
