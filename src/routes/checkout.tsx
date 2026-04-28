import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Truck,
  CreditCard,
  ClipboardCheck,
  MapPin,
  Check,
  Lock,
  Building2,
  ArrowRight,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { useOrders } from "@/store/orders";
import { useShipping } from "@/store/shipping";
import { wilayas } from "@/data/wilayas";
import { useT } from "@/lib/i18n";
import { primaryProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
});

function CheckoutPage() {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const addOrder = useOrders((s) => s.addOrder);
  const addGuestOrder = useOrders((s) => s.addGuestOrder);
  const navigate = useNavigate();
  const [step] = useState<0 | 1 | 2>(0);

  const { companies } = useShipping();
  const activeCompanies = companies.filter((c) => c.active);

  const [selectedWilaya, setSelectedWilaya] = useState(wilayas[0]);
  const [selectedCompanyId, setSelectedCompanyId] = useState(activeCompanies[0]?.id || "");
  const [deliveryType, setDeliveryType] = useState<"desk" | "home">("home");

  const { t, p } = useT();

  const selectedCompany =
    activeCompanies.find((c) => c.id === selectedCompanyId) || activeCompanies[0];

  let shipFee = 0;
  if (selectedCompany) {
    const rate = selectedCompany.rates[selectedWilaya] || {
      desk: selectedCompany.defaultDeskRate,
      home: selectedCompany.defaultHomeRate,
    };
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
    const phone = String(f.get("phone") || "");
    const orderData = {
      items: [...items],
      subtotal,
      shipping: shipFee,
      tax,
      total,
      deliveryType,
      shippingCompany: selectedCompany?.name || "",
      paymentMethod: "cod" as const,
      phone,
      address: {
        fullName: String(f.get("fullName") || "Guest"),
        street: String(f.get("address") || ""),
        city: selectedWilaya,
        zip: "",
      },
    };

    // Check if user is logged in
    const {
      data: { user },
    } = await (await import("@/lib/supabase")).supabase.auth.getUser();
    let order;
    if (user) {
      order = await addOrder(orderData);
    } else {
      order = addGuestOrder(orderData);
    }
    clear();
    navigate({ to: "/order-confirmation/$id", params: { id: order.id } });
  };

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{t("checkout.empty")}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{t("checkout.empty.sub")}</p>
        <Link
          to="/shop"
          className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          {t("checkout.backtoshop")}
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Stepper */}
      <ol className="mx-auto flex max-w-2xl items-center justify-between">
        {steps.map((s, i) => {
          const active = i <= step;
          return (
            <li key={s.id} className="flex flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`grid size-10 place-items-center rounded-full sm:size-12 ${active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                >
                  {i < step ? <Check className="size-4 sm:size-5" /> : <s.icon className="size-4 sm:size-5" />}
                </div>
                <span
                  className={`mt-1.5 text-[10px] font-semibold uppercase tracking-widest sm:mt-2 sm:text-xs ${active ? "text-primary" : "text-muted-foreground"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`mx-1.5 h-0.5 flex-1 sm:mx-2 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </li>
          );
        })}
      </ol>

      <form onSubmit={placeOrder} className="mt-8 grid gap-6 lg:grid lg:grid-cols-[1fr_340px] lg:gap-8 sm:mt-12">
        <div className="space-y-5 sm:space-y-6">
          {/* Shipping address */}
          <fieldset className="rounded-xl bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6">
            <legend className="flex items-center gap-2 font-display text-base font-bold sm:text-lg">
              <MapPin className="size-5 text-primary" /> {t("checkout.shipping")}
            </legend>
            <div className="mt-4 grid gap-4 sm:mt-5 sm:grid sm:gap-5">
              <Field name="fullName" label={t("checkout.fullname")} required />
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                <Field
                  name="phone"
                  label={t("checkout.phone")}
                  required
                  type="tel"
                  pattern="^0(2|3|4|5|6|7)\d{8}$"
                  title="Algerian phone number starting with 0 and followed by 9 digits"
                />
                <Field name="email" label={t("checkout.email")} type="email" />
              </div>
              <label className="block">
                <span className="text-sm font-medium">{t("checkout.wilaya")}</span>
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border-b border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  {wilayas.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </label>
              <Field name="address" label={t("checkout.address")} required />
            </div>
          </fieldset>

          {/* Shipping method */}
          <fieldset className="rounded-xl bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6">
            <legend className="flex items-center gap-2 font-display text-base font-bold sm:text-lg">
              <Truck className="size-5 text-primary" /> {t("checkout.shippingmethod")}
            </legend>

            <div className="mt-4 sm:mt-5">
              <label className="block">
                <span className="text-sm font-medium">{t("checkout.shippingcompany")}</span>
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="mt-1.5 w-full rounded-lg border-b border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
                >
                  {activeCompanies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-4 space-y-2.5 sm:mt-5 sm:space-y-3">
              {[
                { id: "desk", title: t("checkout.deskdelivery") },
                { id: "home", title: t("checkout.homedelivery") },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition sm:gap-4 sm:p-4 ${deliveryType === opt.id ? "border-primary bg-tertiary/40" : "border-border"}`}
                >
                  <input
                    type="radio"
                    name="deliveryType"
                    checked={deliveryType === opt.id}
                    onChange={() => setDeliveryType(opt.id as "desk" | "home")}
                    className="sr-only"
                  />
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 sm:size-6 ${deliveryType === opt.id ? "border-primary bg-primary" : "border-border"}`}
                  >
                    {deliveryType === opt.id && (
                      <Check className="size-2.5 text-primary-foreground sm:size-3" />
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm font-bold sm:text-base">{opt.title}</p>
                  </div>
                  <span className="font-bold text-primary text-sm sm:text-base">
                    {p(
                      selectedCompany
                        ? deliveryType === "desk" && opt.id === "desk"
                          ? shipFee
                          : opt.id === "desk"
                            ? (selectedCompany.rates[selectedWilaya]?.desk ??
                              selectedCompany.defaultDeskRate)
                            : (selectedCompany.rates[selectedWilaya]?.home ??
                              selectedCompany.defaultHomeRate)
                        : 0,
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Payment */}
          <fieldset className="rounded-xl border-2 border-primary bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6">
            <legend className="flex items-center gap-2 font-display text-base font-bold sm:text-lg">
              <CreditCard className="size-5 text-primary" /> {t("checkout.payment")}
            </legend>
            <div className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/20 text-primary sm:size-12">
                <Building2 className="size-5 sm:size-6" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold sm:text-base lg:text-lg">{t("checkout.cod")}</h3>
                <p className="text-xs text-muted-foreground sm:text-sm">{t("checkout.cod.sub")}</p>
              </div>
            </div>
          </fieldset>
        </div>

        {/* Order summary — sticky on desktop */}
        <aside className="rounded-2xl bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6 lg:sticky lg:top-24 lg:h-fit">
          <h2 className="font-display text-lg font-bold sm:text-xl">{t("checkout.ordersummary")}</h2>
          <ul className="mt-4 space-y-3 sm:mt-5">
            {items.map((i) => (
              <li key={i.slug} className="flex gap-2.5 sm:gap-3">
                <img
                  src={primaryProductImage(i.image)}
                  alt={i.name}
                  className="size-12 shrink-0 rounded-lg object-cover sm:size-14"
                />
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="truncate text-sm font-semibold">{i.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ×{i.qty} • {i.unit}
                  </span>
                </div>
                <span className="shrink-0 font-bold text-primary">{p(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm sm:mt-5">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("checkout.subtotal")}</dt>
              <dd className="font-semibold">{p(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">{t("checkout.shipping")}</dt>
              <dd className="text-primary">{p(shipFee)}</dd>
            </div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3 sm:mt-4 sm:pt-4">
            <span className="font-display text-base font-bold sm:text-lg">{t("checkout.total")}</span>
            <span className="font-display text-xl font-bold sm:text-2xl">{p(total)}</span>
          </div>
          <button
            type="submit"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-bold text-primary-foreground shadow-md hover:opacity-90 sm:mt-6 sm:py-4"
          >
            {t("checkout.placeorder")} <ArrowRight className="size-4" />
          </button>
          <p className="mt-2 flex items-center justify-center gap-2 text-xs font-semibold text-primary sm:mt-3">
            <Lock className="size-3" /> {t("checkout.secure")}
          </p>
        </aside>
      </form>
    </section>
  );
}

function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <input
        {...props}
        className="mt-2 w-full rounded-lg border-b border-border bg-secondary/40 px-3 py-2.5 text-sm focus:border-primary focus:outline-none"
      />
    </label>
  );
}
