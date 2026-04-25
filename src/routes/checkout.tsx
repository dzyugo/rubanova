import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Truck, CreditCard, ClipboardCheck, MapPin, Check, Lock, Building2, ArrowRight } from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";
import { useShipping } from "@/store/shipping";
import { wilayas } from "@/data/wilayas";
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
  
  const { companies } = useShipping();
  const activeCompanies = companies.filter(c => c.active);
  
  const [selectedWilaya, setSelectedWilaya] = useState(wilayas[0]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(activeCompanies[0]?.id || "");
  const [deliveryType, setDeliveryType] = useState<"desk" | "home">("home");
  
  const { t } = useT();

  const selectedCompany = activeCompanies.find(c => c.id === selectedCompanyId) || activeCompanies[0];
  
  let shipFee = 0;
  if (selectedCompany) {
    const rate = selectedCompany.rates[selectedWilaya] || { desk: selectedCompany.defaultDeskRate, home: selectedCompany.defaultHomeRate };
    shipFee = deliveryType === "desk" ? rate.desk : rate.home;
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = 0; // No tax mentioned
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
      shippingMethod: deliveryType === "express" ? "express" : "standard", // Mocking previous required types
      paymentMethod: "card", // Mocking previous required types, actual is COD
      address: {
        fullName: String(f.get("fullName") || "Guest"),
        street: String(f.get("address") || ""),
        city: selectedWilaya,
        zip: String(f.get("phone") || ""),
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
              <Field name="fullName" label="Full Name" required />
              <div className="grid gap-5 sm:grid-cols-2">
                <Field name="phone" label="Phone Number" required type="tel" />
                <Field name="email" label="Email (Optional for tracking)" type="email" />
              </div>
              <label className="block">
                <span className="text-sm font-medium">Wilaya</span>
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="mt-2 w-full rounded-lg border-b border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  {wilayas.map((w) => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </label>
              <Field name="address" label="Detailed Address" required />
            </div>
          </fieldset>

          {/* Shipping method */}
          <fieldset className="rounded-2xl bg-card p-6 shadow-sm">
            <legend className="flex items-center gap-2 font-display text-lg font-bold"><Truck className="size-5 text-primary" /> Shipping Method</legend>
            
            <div className="mt-5 mb-5">
              <label className="block">
                <span className="text-sm font-medium">Shipping Company</span>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="mt-2 w-full rounded-lg border-b border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  {activeCompanies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-5 space-y-3">
              {[
                { id: "desk", title: "Desk Delivery (Point de relais)" },
                { id: "home", title: "Home Delivery (A domicile)" },
              ].map((opt) => (
                <label key={opt.id} className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition ${deliveryType === opt.id ? "border-primary bg-tertiary/40" : "border-border"}`}>
                  <input type="radio" name="deliveryType" checked={deliveryType === opt.id} onChange={() => setDeliveryType(opt.id as "desk" | "home")} className="sr-only" />
                  <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 ${deliveryType === opt.id ? "border-primary bg-primary" : "border-border"}`}>
                    {deliveryType === opt.id && <Check className="size-3 text-primary-foreground" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-display text-base font-bold">{opt.title}</p>
                  </div>
                  <span className="font-bold text-primary">
                    {selectedCompany ? (deliveryType === "desk" && opt.id === "desk" ? shipFee : (opt.id === "desk" ? (selectedCompany.rates[selectedWilaya]?.desk ?? selectedCompany.defaultDeskRate) : (selectedCompany.rates[selectedWilaya]?.home ?? selectedCompany.defaultHomeRate))).toFixed(2) : "0.00"} DA
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="rounded-2xl bg-card p-6 shadow-sm border-2 border-primary">
            <legend className="flex items-center gap-2 font-display text-lg font-bold"><CreditCard className="size-5 text-primary" /> {t("checkout.payment")}</legend>
            <div className="mt-5 flex items-center gap-4">
              <div className="grid size-12 place-items-center rounded-full bg-primary/20 text-primary">
                <Building2 className="size-6" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">Cash on Delivery (COD)</h3>
                <p className="text-sm text-muted-foreground">You will pay when the order is delivered to your selected location.</p>
              </div>
            </div>
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
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-border pt-4">
            <span className="font-display text-base font-bold">{t("checkout.total")}</span>
            <span className="font-display text-2xl font-bold">{total.toFixed(2)} DA</span>
          </div>
          <button type="submit" className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90">
            {t("checkout.placeorder")} <ArrowRight className="size-4" />
          </button>
          <p className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold text-primary">
            <Lock className="size-3" /> Secure checkout process
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
