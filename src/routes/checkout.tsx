import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, CreditCard, ClipboardCheck, MapPin, Check, Lock, Building2, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.addOrder);
  const navigate = useNavigate();
  const [step] = useState<0 | 1 | 2>(0);
  const [shipping, setShipping] = useState<"express" | "standard">("express");
  const [payment, setPayment] = useState<"card" | "paypal">("card");
  const { t } = useT();

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipFee = shipping === "express" ? 12 : 5;
  const tax = +(subtotal * 0.08).toFixed(2);
  const total = subtotal + shipFee + tax;

  const steps = [
    { id: "shipping", label: t("checkout.shipping"), icon: Truck },
    { id: "payment", label: t("checkout.payment"), icon: CreditCard },
    { id: "review", label: t("checkout.review"), icon: ClipboardCheck },
  ] as const;

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
        <h1 className="font-display text-4xl font-bold">{t("checkout.empty")}</h1>
        <p className="mt-2 text-muted-foreground">{t("checkout.empty.sub")}</p>
        <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{t("checkout.backtoshop")}</Link>
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
            <legend className="flex items-center gap-2 font-display text-lg font-bold"><MapPin className="size-5 text-primary" /> {t("checkout.shipping")}</legend>
            <div className="mt-5 grid gap-5">
              <Field name="fullName" label={t("checkout.fullname")} required />
              <Field name="street" label={t("checkout.street")} required />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="city" label={t("checkout.city")} required />
                <Field name="zip" label={t("checkout.zip")} required />
              </div>
            </div>
          </fieldset>

          {/* Shipping method */}
          <fieldset className="rounded-2xl bg-card p-6 shadow-sm">
            <legend className="flex items-center gap-2 font-display text-lg font-bold"><Check className="size-5 text-primary" /> {t("checkout.shipping")}</legend>
            <div className="mt-5 space-y-3">
              {[
                { id: "express", title: t("checkout.express"), price: 12 },
                { id: "standard", title: t("checkout.standard"), price: 5 },
              ].map((opt) => (
                <label key={opt.id} className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition ${shipping === opt.id ? "border-primary bg-tertiary/40" : "border-border"}`}>
                  <input type="radio" name="shipping" checked={shipping === opt.id} onChange={() => setShipping(opt.id as "express" | "standard")} className="sr-only" />
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${shipping === opt.id ? "border-primary bg-primary" : "border-border"}`}>
                    {shipping === opt.id && <Check className="size-3 text-primary-foreground" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-base font-bold">{opt.title}</p>
                  </div>
                  <span className="font-bold text-primary">{opt.price.toFixed(2)} DA</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="rounded-2xl bg-card p-6 shadow-sm">
            <legend className="flex items-center gap-2 font-display text-lg font-bold"><CreditCard className="size-5 text-primary" /> {t("checkout.payment")}</legend>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                { id: "card", icon: CreditCard, label: t("checkout.card") },
                { id: "paypal", icon: Building2, label: t("checkout.paypal") },
              ].map((opt) => (
                <label key={opt.id} className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-5 py-3 font-semibold transition ${payment === opt.id ? "border-primary bg-tertiary/40 text-primary" : "border-border text-muted-foreground"}`}>
                  <input type="radio" name="payment" checked={payment === opt.id} onChange={() => setPayment(opt.id as "card" | "paypal")} className="sr-only" />
                  <opt.icon className="size-4" /> {opt.label}
                </label>
              ))}
            </div>
            {payment === "card" && (
              <div className="mt-5 grid gap-5">
                <Field name="cardNumber" label={t("checkout.cardnumber")} required />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field name="expiryDate" label={t("checkout.expiry")} required />
                  <Field name="cvv" label={t("checkout.cvv")} required />
                </div>
              </div>
            )}
          </fieldset>
        </div>

        {/* Order summary */}
        <aside className="h-fit rounded-2xl bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold">{t("checkout.ordersummary")}</h2>
          <ul className="mt-5 space-y-4">
            {items.map((i) => (
              <li key={i.slug} className="flex gap-3">
                <img src={i.image} alt={i.name} className="size-14 rounded-lg object-cover" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold">{i.name}</span>
                  <span className="text-xs text-muted-foreground">×{i.qty} • {i.unit}</span>
                </div>
                <span className="font-bold text-primary">{(i.price * i.qty).toFixed(2)} DA</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
            <div className="flex justify-between"><dt>{t("checkout.subtotal")}</dt><dd>{subtotal.toFixed(2)} DA</dd></div>
            <div className="flex justify-between"><dt>{t("checkout.shipping")}</dt><dd className="text-primary">{shipFee.toFixed(2)} DA</dd></div>
            <div className="flex justify-between"><dt>{t("checkout.tax")}</dt><dd>{tax.toFixed(2)} DA</dd></div>
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-display text-base font-bold">{t("checkout.total")}</span>
            <span className="font-display text-2xl font-bold">{total.toFixed(2)} DA</span>
          </div>
          <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90">
            {t("checkout.placeorder")} <ArrowRight className="size-4" />
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
            <Lock className="size-3" /> {t("checkout.encrypted")}
          </p>
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
