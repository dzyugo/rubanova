import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutGrid, ShoppingBasket, ClipboardList, Settings, Banknote, Archive, Bell, HelpCircle, User,
  Search, ArrowUpRight, Pencil, Package, Star, Trash2, Users, ShieldCheck, Image as ImageIcon,
  Tag, Plus, ChevronUp, ChevronDown, AlertTriangle, Check, X,
} from "lucide-react";
import { type Product } from "@/data/products";
import { useOrders, type OrderStatus } from "@/store/orders";
import { useAuth, selectCurrentUser, type Role } from "@/store/auth";
import { useSite } from "@/store/site";
import { useCatalog, useMergedProducts, type ProductOverride } from "@/store/catalog";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — Ruba Nova" },
      { name: "description", content: "Manage products, orders, accounts, and site settings." },
    ],
  }),
  component: AdminPage,
});

type Tab = "dashboard" | "products" | "categories" | "orders" | "accounts" | "settings";

const sidebar: { id: Tab; icon: typeof LayoutGrid; label: string }[] = [
  { id: "dashboard", icon: LayoutGrid, label: "Dashboard" },
  { id: "products", icon: ShoppingBasket, label: "Products" },
  { id: "categories", icon: Tag, label: "Categories" },
  { id: "orders", icon: ClipboardList, label: "Orders" },
  { id: "accounts", icon: Users, label: "Accounts" },
  { id: "settings", icon: Settings, label: "Site Settings" },
];

const sales = [12, 45, 30, 75, 95, 25, 18];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const statusStyles: Record<OrderStatus, string> = {
  Processing: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  Shipped: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  Delivered: "bg-tertiary text-primary",
  Cancelled: "bg-destructive/10 text-destructive",
};

const allStatuses: OrderStatus[] = ["Processing", "Shipped", "Delivered", "Cancelled"];

function AdminPage() {
  const [tab, setTab] = useState<Tab>("dashboard");
  const orders = useOrders((s) => s.orders);
  const user = useAuth(selectCurrentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/account" });
  }, [user, navigate]);

  if (!user) return null;
  if (user.role !== "admin") {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <ShieldCheck className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">Admins only</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You're signed in as a {user.role}. This dashboard is reserved for admin accounts — please ask an administrator to upgrade your role if you need access.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Back home</Link>
          <Link to="/account" className="inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary">My account</Link>
        </div>
      </section>
    );
  }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "Processing").length;

  const stats = [
    { label: "Total Sales", value: `$${totalRevenue.toFixed(2)}`, trend: `${orders.length} orders`, icon: Banknote },
    { label: "Pending Orders", value: String(pending), trend: "Needs fulfillment", icon: Package },
    { label: "Low Stock Alerts", value: "14 Items", trend: "Action required", trendColor: "text-destructive", icon: Archive },
  ];

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6 md:py-10 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-3xl bg-card p-5 shadow-sm">
        <div>
          <h2 className="font-display text-xl font-bold text-primary">Ruba Nova</h2>
          <p className="text-xs text-muted-foreground">Admin Dashboard</p>
        </div>
        <nav className="mt-6 grid grid-cols-2 gap-1 lg:grid-cols-1">
          {sidebar.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "bg-tertiary text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <item.icon className="size-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="mt-8 hidden items-center gap-3 rounded-xl bg-secondary/60 p-3 lg:flex">
          <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="text-xs">
            <p className="font-semibold">{user.name}</p>
            <p className="text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-2xl font-bold capitalize">{tab === "settings" ? "Site Settings" : tab}</h1>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-card px-4 py-2 text-sm shadow-sm md:flex">
              <Search className="size-4 text-muted-foreground" />
              <input placeholder="Search…" className="w-44 bg-transparent text-sm focus:outline-none" />
            </div>
            <button className="grid size-9 place-items-center rounded-full bg-card shadow-sm"><Bell className="size-4" /></button>
            <button className="grid size-9 place-items-center rounded-full bg-card shadow-sm"><HelpCircle className="size-4" /></button>
            <button className="grid size-9 place-items-center rounded-full bg-card shadow-sm"><User className="size-4" /></button>
          </div>
        </div>

        {tab === "dashboard" && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="flex items-start justify-between rounded-2xl bg-card p-5 shadow-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="mt-2 font-display text-3xl font-bold">{s.value}</p>
                    <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${s.trendColor ?? "text-primary"}`}>
                      <ArrowUpRight className="size-3" /> {s.trend}
                    </p>
                  </div>
                  <div className="grid size-11 place-items-center rounded-xl bg-tertiary text-primary">
                    <s.icon className="size-5" />
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-card p-6 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold">Sales Performance</h2>
                  <p className="text-sm text-muted-foreground">Real-time revenue tracking for the current week</p>
                </div>
                <select className="rounded-md border border-border bg-background px-3 py-1.5 text-xs">
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
              <div className="mt-8 flex h-56 items-end gap-3">
                {sales.map((v, i) => (
                  <div key={i} className="flex flex-1 flex-col items-center gap-2">
                    <div
                      className="w-full rounded-t-lg transition"
                      style={{ height: `${v}%`, background: `color-mix(in oklab, var(--primary) ${20 + v}%, transparent)` }}
                    />
                    <span className="text-xs text-muted-foreground">{days[i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "products" && <ProductsTab />}
        {tab === "categories" && <CategoriesTab />}
        {tab === "orders" && <OrdersTab />}
        {tab === "accounts" && <AccountsTab currentId={user.id} />}
        {tab === "settings" && <SettingsTab />}
      </div>
    </section>
  );
}

function ProductsTab() {
  const featuredSlugs = useCatalog((s) => s.featuredSlugs);
  const toggle = useCatalog((s) => s.toggleFeatured);
  const products = useMergedProducts();
  const updateProduct = useCatalog((s) => s.updateProduct);
  const resetProduct = useCatalog((s) => s.resetProduct);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);

  const editing = editingSlug ? products.find((p) => p.slug === editingSlug) ?? null : null;

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Products Management</h2>
          <p className="text-sm text-muted-foreground">Edit details, swap images, or feature an item — changes show on the home page instantly.</p>
        </div>
        <span className="hidden rounded-full bg-tertiary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary sm:inline-block">
          {featuredSlugs.length} on home
        </span>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Featured on Home</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p, i) => {
              const isFeatured = featuredSlugs.includes(p.slug);
              return (
                <tr key={p.slug}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="size-10 rounded-lg object-cover" />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-tertiary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">${p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 ${i === 1 ? "text-amber-600" : "text-primary"}`}>
                      <span className="size-2 rounded-full bg-current" />
                      {i === 1 ? "Low Stock (8)" : `In Stock (${100 + i * 23})`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(p.slug)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                        isFeatured ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-tertiary hover:text-primary"
                      }`}
                      aria-pressed={isFeatured}
                    >
                      <Star className={`size-3 ${isFeatured ? "fill-current" : ""}`} />
                      {isFeatured ? "On Home" : "Add to Home"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setEditingSlug(p.slug)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{featuredSlugs.length} products featured on the home page.</p>

      {editing && (
        <ProductEditModal
          key={editing.slug}
          product={editing}
          onClose={() => setEditingSlug(null)}
          onSave={(patch) => { updateProduct(editing.slug, patch); setEditingSlug(null); }}
          onReset={() => { resetProduct(editing.slug); setEditingSlug(null); }}
        />
      )}
    </div>
  );
}

function ProductEditModal({
  product,
  onClose,
  onSave,
  onReset,
}: {
  product: Product;
  onClose: () => void;
  onSave: (patch: ProductOverride) => void;
  onReset: () => void;
}) {
  const categories = useCatalog((s) => s.categories);
  const [name, setName] = useState(product.name);
  const [tagline, setTagline] = useState(product.tagline);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(String(product.price));
  const [unit, setUnit] = useState(product.unit);
  const [image, setImage] = useState(product.image);
  const [category, setCategory] = useState<string>(product.category);
  const [imgError, setImgError] = useState<string | null>(null);
  const baseImage = product.image;

  const dirty =
    name !== product.name ||
    tagline !== product.tagline ||
    description !== product.description ||
    unit !== product.unit ||
    image !== product.image ||
    category !== product.category ||
    parseFloat(price) !== product.price;

  const onPickImage = (file: File | null) => {
    setImgError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImgError("Please choose an image file (JPG, PNG, WEBP)."); return; }
    if (file.size > 2 * 1024 * 1024) { setImgError("Image must be under 2 MB."); return; }
    const reader = new FileReader();
    reader.onerror = () => setImgError("We couldn't read that file. Try another image.");
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    if (dirty && !confirm("You have unsaved changes. Discard them?")) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="w-full max-w-2xl rounded-3xl bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold">Edit product</h3>
            <p className="text-xs text-muted-foreground">Slug: {product.slug}</p>
          </div>
          <button onClick={handleClose} className="rounded-full p-2 hover:bg-secondary" aria-label="Close">✕</button>
        </div>

        {dirty && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="size-3.5" /> You have unsaved changes
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="space-y-2">
            <img src={image} alt="" className="aspect-square w-full rounded-2xl object-cover" />
            <label className="flex w-full cursor-pointer items-center justify-center rounded-full border border-dashed border-border px-3 py-2 text-xs font-semibold hover:bg-secondary">
              Upload image
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickImage(e.target.files?.[0] ?? null)} />
            </label>
            {imgError && <p className="text-[11px] text-destructive">{imgError}</p>}
            {image !== baseImage && (
              <button type="button" onClick={() => setImage(baseImage)} className="w-full rounded-full px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary">
                Restore original image
              </button>
            )}
          </div>
          <div className="space-y-3">
            <Input label="Name" value={name} onChange={setName} />
            <Input label="Tagline" value={tagline} onChange={setTagline} />
            <Textarea label="Description" value={description} onChange={setDescription} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Price (USD)" value={price} onChange={setPrice} type="number" step="0.01" />
              <Input label="Unit" value={unit} onChange={setUnit} />
            </div>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                {!categories.includes(category) && <option value={category}>{category}</option>}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <button onClick={onReset} className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary">
            Reset to defaults
          </button>
          <div className="flex gap-2">
            <button onClick={handleClose} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary">Cancel</button>
            <button
              onClick={() => onSave({
                name, tagline, description, unit, image,
                category: category as Product["category"],
                price: Number.isFinite(parseFloat(price)) ? parseFloat(price) : product.price,
              })}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CategoriesTab() {
  const categories = useCatalog((s) => s.categories);
  const products = useMergedProducts();
  const addCategory = useCatalog((s) => s.addCategory);
  const renameCategory = useCatalog((s) => s.renameCategory);
  const removeCategory = useCatalog((s) => s.removeCategory);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [products]);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = addCategory(newName);
    if (!r.ok) return setError(r.error ?? "Could not add category.");
    setNewName("");
  };

  const onRenameSave = (oldName: string) => {
    setError(null);
    const r = renameCategory(oldName, editValue);
    if (!r.ok) return setError(r.error ?? "Could not rename.");
    setEditing(null); setEditValue("");
  };

  const onRemove = (name: string) => {
    setError(null);
    if (!confirm(`Remove the “${name}” category?`)) return;
    const r = removeCategory(name);
    if (!r.ok) setError(r.error ?? "Could not remove.");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">Add a category</h2>
        <p className="text-sm text-muted-foreground">New categories appear in the shop sidebar and product editor right away.</p>
        <form onSubmit={onAdd} className="mt-4 flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Herbs & Spices"
            className="min-w-[220px] flex-1 rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Add
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">All categories</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Products</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c}>
                  <td className="px-4 py-3">
                    {editing === c ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") onRenameSave(c); if (e.key === "Escape") setEditing(null); }}
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-semibold">{c}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{counts[c] ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {editing === c ? (
                        <>
                          <button onClick={() => onRenameSave(c)} className="rounded-md p-1.5 text-primary hover:bg-secondary" aria-label="Save"><Check className="size-4" /></button>
                          <button onClick={() => setEditing(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Cancel"><X className="size-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditing(c); setEditValue(c); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Rename"><Pencil className="size-4" /></button>
                          <button onClick={() => onRemove(c)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label="Remove"><Trash2 className="size-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function OrdersTab() {
  const orders = useOrders((s) => s.orders);
  const setStatus = useOrders((s) => s.setStatus);
  const [filter, setFilter] = useState<OrderStatus | "All">("All");

  const visible = filter === "All" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Recent Orders</h2>
          <p className="text-sm text-muted-foreground">Update fulfillment status as orders progress.</p>
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
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Total</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Update</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No orders match this filter.</td></tr>
            ) : (
              visible.map((o) => (
                <tr key={o.id}>
                  <td className="px-4 py-3 font-mono text-xs font-bold text-primary">{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{o.address.fullName}</p>
                    <p className="text-xs text-muted-foreground">{o.address.city}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3 font-semibold">${o.total.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[o.status]}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
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
  );
}

type SortKey = "name" | "email" | "role" | "createdAt";
const PAGE_SIZE = 8;

function AccountsTab({ currentId }: { currentId: string }) {
  const accounts = useAuth((s) => s.accounts);
  const updateAccount = useAuth((s) => s.updateAccount);
  const removeAccount = useAuth((s) => s.removeAccount);
  const fetchAccounts = useAuth((s) => s.fetchAccounts);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pendingRole, setPendingRole] = useState<{ id: string; name: string; role: Role } | null>(null);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = accounts;
    if (q) list = list.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.role.includes(q));
    list = [...list].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [accounts, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const startEdit = (id: string, name: string, email: string) => {
    setEditing(id); setDraftName(name); setDraftEmail(email);
  };
  const saveEdit = (id: string) => {
    updateAccount(id, { name: draftName, email: draftEmail });
    setEditing(null);
  };

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
      {label}
      {sortKey === k && (sortDir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
    </button>
  );

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Accounts Management</h2>
          <p className="text-sm text-muted-foreground">Promote shoppers to admins, edit profiles, or remove accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 text-sm">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, role…"
              className="w-44 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <span className="rounded-full bg-tertiary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{accounts.length} users</span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left"><SortHeader k="name" label="User" /></th>
              <th className="px-4 py-3 text-left"><SortHeader k="email" label="Email" /></th>
              <th className="px-4 py-3 text-left"><SortHeader k="role" label="Role" /></th>
              <th className="px-4 py-3 text-left"><SortHeader k="createdAt" label="Joined" /></th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  {editing === a.id ? (
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-full bg-tertiary text-xs font-bold text-primary">
                        {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-semibold">{a.name}</span>
                      {a.id === currentId && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">You</span>}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === a.id ? (
                    <input
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-muted-foreground">{a.email}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={a.role}
                    onChange={(e) => setPendingRole({ id: a.id, name: a.name, role: e.target.value as Role })}
                    disabled={a.id === currentId}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-60"
                  >
                    <option value="shopper">Shopper</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {editing === a.id ? (
                      <>
                        <button onClick={() => saveEdit(a.id)} className="rounded-md p-1.5 text-primary hover:bg-secondary" aria-label="Save"><Check className="size-4" /></button>
                        <button onClick={() => setEditing(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Cancel"><X className="size-4" /></button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(a.id, a.name, a.email)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (a.id === currentId) return alert("You can't delete your own account here.");
                            if (confirm(`Delete account for ${a.name}? This can't be undone.`)) removeAccount(a.id);
                          }}
                          disabled={a.id === currentId}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-40"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No accounts match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Showing {visible.length} of {filtered.length} accounts</span>
        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-md border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary"
            >Prev</button>
            <span className="px-2">Page {safePage} of {pageCount}</span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
              className="rounded-md border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary"
            >Next</button>
          </div>
        )}
      </div>

      {pendingRole && (
        <ConfirmDialog
          title="Change role?"
          message={`Set ${pendingRole.name}'s role to ${pendingRole.role}? They'll ${pendingRole.role === "admin" ? "gain access to the admin dashboard." : "lose access to admin tools."}`}
          confirmLabel={`Yes, make ${pendingRole.role}`}
          onCancel={() => setPendingRole(null)}
          onConfirm={() => { updateAccount(pendingRole.id, { role: pendingRole.role }); setPendingRole(null); }}
        />
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4" onClick={onCancel}>
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary">Cancel</button>
          <button onClick={onConfirm} className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

function SettingsTab() {
  const settings = useSite((s) => s.settings);
  const update = useSite((s) => s.update);
  const reset = useSite((s) => s.reset);
  const [draft, setDraft] = useState(settings);

  useEffect(() => setDraft(settings), [settings]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    update(draft);
    alert("Site settings saved.");
  };

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={onSave} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel title="Brand" subtitle="The name, tagline and logo shown across the site.">
          <Input label="Shop name" value={draft.name} onChange={(v) => set("name", v)} />
          <Input label="Tagline" value={draft.tagline} onChange={(v) => set("tagline", v)} />
          <ImageField
            label="Logo"
            value={draft.logoUrl}
            onChange={(v) => set("logoUrl", v)}
            placeholder="Paste a URL or upload a file"
            previewClass="h-12 w-auto"
            maxSizeMB={1}
          />
        </Panel>

        <Panel title="Contact information" subtitle="Visible in the footer and on the contact page.">
          <Input label="Contact email" type="email" value={draft.contactEmail} onChange={(v) => set("contactEmail", v)} />
          <Input label="Contact phone" value={draft.contactPhone} onChange={(v) => set("contactPhone", v)} />
          <Input label="Address" value={draft.address} onChange={(v) => set("address", v)} />
        </Panel>

        <Panel title="Home page banner" subtitle="The hero block visitors see first.">
          <Input label="Eyebrow text" value={draft.heroEyebrow} onChange={(v) => set("heroEyebrow", v)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Headline" value={draft.heroTitle} onChange={(v) => set("heroTitle", v)} />
            <Input label="Accent line" value={draft.heroAccent} onChange={(v) => set("heroAccent", v)} />
          </div>
          <Textarea label="Subtitle" value={draft.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} />
          <ImageField
            label="Hero image"
            value={draft.heroImageUrl}
            onChange={(v) => set("heroImageUrl", v)}
            placeholder="Paste a URL or upload a file (leave blank for default)"
            previewClass="aspect-[16/7] w-full rounded-lg object-cover"
            maxSizeMB={3}
          />
        </Panel>

        <Panel title="Footer" subtitle="Appears beneath the brand line in the footer.">
          <Textarea label="Footer note" value={draft.footerNote} onChange={(v) => set("footerNote", v)} />
        </Panel>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
            Save all settings
          </button>
          <button
            type="button"
            onClick={() => { if (confirm("Reset site settings to defaults?")) reset(); }}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="aspect-[4/3] w-full bg-muted">
            <img src={draft.heroImageUrl || "/placeholder.svg"} alt="Hero preview" className="size-full object-cover" />
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{draft.heroEyebrow}</p>
            <h3 className="mt-2 font-display text-xl font-bold">{draft.heroTitle} <span className="text-primary">{draft.heroAccent}</span></h3>
            <p className="mt-2 text-xs text-muted-foreground">{draft.heroSubtitle}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
          <h3 className="font-display text-lg font-bold">Live preview</h3>
          <p className="mt-2 text-xs opacity-90">Changes apply instantly across the site after saving.</p>
        </div>
      </aside>
    </form>
  );
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Input({ label, value, onChange, ...props }: { label: string; value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      />
    </label>
  );
}

function Textarea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="mt-2 w-full rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];

function ImageField({
  label, value, onChange, placeholder, previewClass, maxSizeMB = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  previewClass?: string;
  maxSizeMB?: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);

  const onPick = (file: File | null) => {
    setError(null);
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError(`Unsupported file type. Use JPG, PNG, WEBP, GIF, or SVG.`);
      return;
    }
    if (file.size === 0) {
      setError("That file is empty.");
      return;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image must be under ${maxSizeMB} MB (yours is ${(file.size / 1024 / 1024).toFixed(2)} MB).`);
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setError("We couldn't read that file. Try a different one.");
    reader.onload = () => { setPreviewError(false); onChange(String(reader.result)); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(e) => { setPreviewError(false); setError(null); onChange(e.target.value); }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <label className="cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-secondary">
          Upload
          <input type="file" accept={ALLOWED_IMAGE_TYPES.join(",")} className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
        </label>
        {value && (
          <button type="button" onClick={() => { onChange(""); setError(null); setPreviewError(false); }} className="rounded-full px-3 py-2 text-xs text-muted-foreground hover:bg-secondary">
            Clear
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">JPG, PNG, WEBP, GIF or SVG · max {maxSizeMB} MB</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {value && !error && (
        <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3">
          <ImageIcon className="size-4 text-muted-foreground" />
          {previewError ? (
            <span className="text-xs text-destructive">Preview failed — the URL doesn't load as an image.</span>
          ) : (
            <img src={value} alt={`${label} preview`} className={previewClass ?? "h-12 w-auto"} onError={() => setPreviewError(true)} />
          )}
        </div>
      )}
    </div>
  );
}
