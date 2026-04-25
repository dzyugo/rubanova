function OrdersTab() {
  const orders = useOrders((s) => s.orders);
  const setStatus = useOrders((s) => s.setStatus);
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = filter === "All" ? orders : orders.filter((o) => o.status === filter);
  const selected = selectedId ? orders.find((o) => o.id === selectedId) : null;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold">Recent Orders</h2>
            <p className="text-sm text-muted-foreground">Click an order to view full details. Update fulfillment status as orders progress.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["All", ...allStatuses] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-tertiary hover:text-primary"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Order ID</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Phone</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Total</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No orders match this filter.</td></tr>
              ) : (
                visible.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => setSelectedId(o.id === selectedId ? null : o.id)}
                    className={`cursor-pointer transition hover:bg-secondary/40 ${selectedId === o.id ? "bg-tertiary/30" : ""}`}
                  >
                    <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-semibold">{o.address.fullName}</p>
                      <p className="text-xs text-muted-foreground">{o.address.city}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{o.phone || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3 font-semibold">{o.total.toFixed(2)} DA</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={o.status}
                        onChange={(e) => setStatus(o.id, e.target.value as OrderStatus)}
                        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {allStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Showing {visible.length} of {orders.length} orders</p>
      </div>

      {/* Order Detail Panel */}
      {selected && (
        <div className="rounded-2xl bg-card p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Order {selected.id}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(selected.createdAt).toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
            <button onClick={() => setSelectedId(null)} className="rounded-full p-2 hover:bg-secondary" aria-label="Close">✕</button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[1fr_280px]">
            {/* Items list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Items ({selected.items.length})</h4>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {selected.items.length === 0 ? (
                  <li className="px-4 py-4 text-sm text-muted-foreground">Item details not available for this order.</li>
                ) : (
                  selected.items.map((item) => (
                    <li key={item.slug} className="flex items-center gap-4 px-4 py-3">
                      <img src={item.image?.split(',')[0]} alt={item.name} className="size-12 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">×{item.qty} • {item.unit}</p>
                      </div>
                      <span className="text-sm font-bold text-primary">{(item.price * item.qty).toFixed(2)} DA</span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Customer</h4>
                <p className="mt-2 text-sm font-semibold">{selected.address.fullName}</p>
                {selected.phone && <p className="mt-1 text-sm text-muted-foreground">📱 {selected.phone}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{selected.address.street}</p>
                <p className="text-sm text-muted-foreground">{selected.address.city}</p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Shipping</h4>
                <p className="mt-2 text-sm font-semibold capitalize">{selected.deliveryType === "desk" ? "Desk Delivery" : "Home Delivery"}</p>
                {selected.shippingCompany && <p className="mt-1 text-sm text-muted-foreground">Via: {selected.shippingCompany}</p>}
              </div>

              <div className="rounded-xl border border-border p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Payment</h4>
                <p className="mt-2 text-sm font-semibold">Cash on Delivery</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-tertiary/20 p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Totals</h4>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between"><dt>Subtotal</dt><dd>{selected.subtotal.toFixed(2)} DA</dd></div>
                  <div className="flex justify-between"><dt>Shipping</dt><dd>{selected.shipping.toFixed(2)} DA</dd></div>
                  <div className="flex justify-between border-t border-border pt-2 font-bold">
                    <dt>Total</dt><dd className="text-primary">{selected.total.toFixed(2)} DA</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type SortKey = "name" | "email" | "role" | "createdAt";
const PAGE_SIZE = 8;

