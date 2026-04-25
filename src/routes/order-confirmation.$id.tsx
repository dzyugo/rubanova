import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CheckCircle2, Package, Truck, Mail, ArrowRight } from "lucide-react";
import { useOrders } from "@/store/orders";

export const Route = createFileRoute("/order-confirmation/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Order ${params.id} confirmed — Ruba Nova` },
      { name: "description", content: "Thank you for your order. Your harvest is on its way." },
    ],
  }),
  component: ConfirmationPage,
  notFoundComponent: () => (
    <section className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">Order not found</h1>
      <p className="mt-3 text-muted-foreground">We couldn't locate that order.</p>
      <Link to="/shop" className="mt-6 inline-block rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
        Back to shop
      </Link>
    </section>
  ),
});

function ConfirmationPage() {
  const { id } = Route.useParams();
  const order = useOrders((s) => s.orders.find((o) => o.id === id));

  if (!order) throw notFound();

  const placed = new Date(order.createdAt);

  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-tertiary text-primary">
          <CheckCircle2 className="size-10" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">Order Confirmed</p>
        <h1 className="mt-2 font-display text-4xl font-bold sm:text-5xl">Thank you for your harvest</h1>
        <p className="mt-3 text-muted-foreground">
          A confirmation has been sent to your email. We'll notify you when it ships.
        </p>
        <div className="mt-6 inline-flex flex-col items-center rounded-2xl bg-card px-8 py-5 shadow-sm">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Order ID</span>
          <span className="mt-1 font-display text-2xl font-bold tracking-wider text-primary">{order.id}</span>
          <span className="mt-1 text-xs text-muted-foreground">
            Placed {placed.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <ol className="mt-12 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Mail, label: "Confirmed", active: true },
          { icon: Package, label: "Packing", active: order.status !== "Processing" },
          { icon: Truck, label: order.shippingMethod === "express" ? "Express Shipping" : "Standard Shipping", active: order.status === "Shipped" || order.status === "Delivered" },
        ].map((s) => (
          <li key={s.label} className={`flex items-center gap-3 rounded-2xl border p-4 ${s.active ? "border-primary bg-tertiary/40" : "border-border bg-card"}`}>
            <div className={`grid size-10 place-items-center rounded-full ${s.active ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <s.icon className="size-5" />
            </div>
            <span className="text-sm font-semibold">{s.label}</span>
          </li>
        ))}
      </ol>

      {/* Summary */}
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <h2 className="font-display text-xl font-bold">Order Summary</h2>
          <ul className="mt-5 divide-y divide-border">
            {order.items.length === 0 ? (
              <li className="py-3 text-sm text-muted-foreground">Items receipt unavailable.</li>
            ) : (
              order.items.map((i) => (
                <li key={i.slug} className="flex items-center gap-4 py-4">
                  <img src={i.image} alt={i.name} className="size-14 rounded-lg object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold">{i.name}</p>
                    <p className="text-xs text-muted-foreground">Qty {i.qty} • {i.unit}</p>
                  </div>
                  <span className="font-bold text-primary">${(i.price * i.qty).toFixed(2)}</span>
                </li>
              ))
            )}
          </ul>
          <dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>${order.subtotal.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt>Shipping</dt><dd>${order.shipping.toFixed(2)}</dd></div>
            <div className="flex justify-between"><dt>Tax</dt><dd>${order.tax.toFixed(2)}</dd></div>
            <div className="flex items-baseline justify-between border-t border-border pt-3">
              <dt className="font-display text-base font-bold">Total</dt>
              <dd className="font-display text-2xl font-bold">${order.total.toFixed(2)}</dd>
            </div>
          </dl>
        </div>

        <aside className="h-fit space-y-6">
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipping to</h3>
            <p className="mt-3 font-semibold">{order.address.fullName}</p>
            <p className="text-sm text-muted-foreground">{order.address.street}</p>
            <p className="text-sm text-muted-foreground">{order.address.city}, {order.address.zip}</p>
          </div>
          <div className="rounded-2xl bg-card p-6 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment</h3>
            <p className="mt-3 text-sm font-semibold capitalize">{order.paymentMethod === "card" ? "Credit Card" : "PayPal"}</p>
          </div>
        </aside>
      </div>

      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link to="/account" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
          View order history <ArrowRight className="size-4" />
        </Link>
        <Link to="/shop" className="rounded-full border border-border bg-card px-6 py-3 text-sm font-semibold hover:bg-secondary">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
