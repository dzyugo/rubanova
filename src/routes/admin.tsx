import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import {
  LayoutGrid,
  ShoppingBasket,
  ClipboardList,
  Settings,
  Banknote,
  Archive,
  Bell,
  HelpCircle,
  User,
  Search,
  ArrowUpRight,
  Pencil,
  Package,
  Star,
  Users,
  ShieldCheck,
  Image as ImageIcon,
  Plus,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Check,
  X,
  Menu,
  LogOut,
  Download,
  TrendingUp,
  HardDrive,
  ChevronRight,
  BarChart3,
  Eye,
  Trash2,
} from "lucide-react";
import { type Product } from "@/data/products";
import { useOrders, type OrderStatus } from "@/store/orders";
import { useAuth, selectCurrentUser, type Role } from "@/store/auth";
import { useSite } from "@/store/site";
import { useCatalog, useMergedProducts, type ProductOverride } from "@/store/catalog";
import { useShipping } from "@/store/shipping";
import { useBanners } from "@/store/banners";
import { wilayas } from "@/data/wilayas";
import { supabase } from "@/lib/supabase";
import { useT } from "@/lib/i18n";
import {
  parseProductImages,
  primaryProductImage,
  serializeProductImages,
} from "@/lib/product-images";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

type Tab = "dashboard" | "banners" | "products" | "orders" | "shipping" | "accounts" | "settings";

// Sidebar moved to AdminPage body for translations
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

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
  const { t } = useT();

  const sidebar: { id: Tab; icon: typeof LayoutGrid; label: string }[] = [
    { id: "dashboard", icon: LayoutGrid, label: t("admin.dashboard") },
    { id: "banners", icon: ImageIcon, label: t("admin.banners") },
    { id: "products", icon: ShoppingBasket, label: t("admin.products") },
    { id: "orders", icon: ClipboardList, label: t("admin.orders") },
    { id: "shipping", icon: Package, label: t("admin.shipping") },
    { id: "accounts", icon: Users, label: t("admin.accounts") },
    { id: "settings", icon: Settings, label: t("admin.settings") },
  ];

  const products = useMergedProducts();
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pending = orders.filter((o) => o.status === "Processing").length;
  const lowStockCount = products.filter((p) => p.stock !== undefined && p.stock < 10).length;
  const uniqueCustomers = useMemo(
    () => new Set(orders.map((o) => o.address?.fullName || "Guest")).size,
    [orders],
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = useMemo(() => {
    if (searchQuery.trim().length < 3) return null;
    const q = searchQuery.toLowerCase();

    const matchedProducts = products
      .filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q))
      .slice(0, 3);
    const matchedOrders = orders
      .filter(
        (o) =>
          o.id.toLowerCase().includes(q) || (o.address?.fullName || "").toLowerCase().includes(q),
      )
      .slice(0, 3);

    return { products: matchedProducts, orders: matchedOrders };
  }, [searchQuery, products, orders]);

  const notifications = useMemo(() => {
    const notifs = [];
    const recentPending = orders.filter((o) => o.status === "Processing").slice(0, 3);
    recentPending.forEach((o) => {
      notifs.push({
        id: `order-${o.id}`,
        title: "Order Awaiting Fulfillment",
        message: `Order ${o.id} from ${o.address.fullName} is processing.`,
        time: new Date(o.createdAt).toLocaleDateString(),
        icon: Package,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-500/10",
        onClick: () => {
          setTab("orders");
          setShowNotifications(false);
        },
      });
    });

    const lowStock = products.filter((p) => p.stock !== undefined && p.stock < 10);
    lowStock.forEach((p) => {
      notifs.push({
        id: `stock-${p.slug}`,
        title: "Low Stock Alert",
        message: `${p.name} is low on stock (${p.stock} remaining).`,
        time: "Now",
        icon: AlertTriangle,
        iconColor: "text-destructive",
        iconBg: "bg-destructive/10",
        onClick: () => {
          setTab("products");
          setShowNotifications(false);
        },
      });
    });

    return notifs;
  }, [orders, products]);

  // Build last-7-days chart data from real orders
  const chartData = useMemo(() => {
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result: { day: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = dayNames[d.getDay()];
      const dateStr = d.toDateString();
      const revenue = orders
        .filter((o) => new Date(o.createdAt).toDateString() === dateStr)
        .reduce((s, o) => s + o.total, 0);
      result.push({ day: dayName, revenue: Math.round(revenue) });
    }
    return result;
  }, [orders]);

  useEffect(() => {
    if (!user) navigate({ to: "/account" });
  }, [user, navigate]);

  if (!user) return null;
  if (user.role !== "admin") {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <ShieldCheck className="mx-auto size-12 text-muted-foreground" />
        <h1 className="mt-4 font-display text-2xl font-bold">{t("admin.only")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("admin.only.sub", { role: user.role })}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Back home
          </Link>
          <Link
            to="/account"
            className="inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-semibold hover:bg-secondary"
          >
            My account
          </Link>
        </div>
      </section>
    );
  }

  const stats = [
    {
      label: t("admin.totalsales"),
      value: `${totalRevenue.toFixed(2)} DA`,
      trend: t("admin.orders.count", { count: String(orders.length) }),
      icon: Banknote,
      gradient: "from-emerald-500/10 to-transparent",
    },
    {
      label: t("admin.pending"),
      value: String(pending),
      trend: t("admin.needsfulfillment"),
      icon: Package,
      gradient: "from-amber-500/10 to-transparent",
    },
    {
      label: t("admin.lowstock"),
      value: t("admin.items.count", { count: String(lowStockCount) }),
      trend: t("admin.actionrequired"),
      trendColor: lowStockCount > 0 ? "text-destructive" : "text-muted-foreground",
      icon: Archive,
      gradient: "from-rose-500/10 to-transparent",
    },
    {
      label: "Active Customers",
      value: String(uniqueCustomers),
      trend: `${orders.length} total orders`,
      icon: Users,
      gradient: "from-sky-500/10 to-transparent",
    },
  ];

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-4 sm:gap-6 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-10 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* ── Mobile menu overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" />
          <aside
            className="relative ml-0 h-full w-72 overflow-y-auto bg-card p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <Link to="/" className="block">
                <h2 className="font-display text-xl font-bold text-primary">Ruba Nova</h2>
                <p className="text-xs text-muted-foreground">Admin Console</p>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-2 hover:bg-secondary"
              >
                <X className="size-5" />
              </button>
            </div>
            {/* Mobile search bar */}
            <div className="mt-4 flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-sm">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                placeholder="Search products or orders…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="shrink-0 rounded p-0.5 hover:bg-secondary"
                >
                  <X className="size-3.5 text-muted-foreground" />
                </button>
              )}
            </div>
            <nav className="mt-4 grid gap-1">
              {sidebar.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "bg-tertiary text-primary" : "text-muted-foreground hover:bg-secondary"}`}
                >
                  <item.icon className="size-4" /> {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-6 border-t border-border pt-4">
              <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
                <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="text-muted-foreground capitalize">{user.role}</p>
                </div>
              </div>
              <Link
                to="/"
                className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary"
              >
                <LogOut className="size-4" /> Logout
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ── Desktop sidebar ── */}
      <aside className="hidden h-fit rounded-3xl border border-border/50 bg-card p-5 shadow-sm lg:block">
        <Link to="/" className="block">
          <h2 className="font-display text-xl font-bold text-primary">Ruba Nova</h2>
          <p className="text-xs text-muted-foreground">Admin Console</p>
        </Link>
        <nav className="mt-6 grid gap-1">
          {sidebar.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${tab === item.id ? "bg-tertiary text-primary shadow-sm" : "text-muted-foreground hover:bg-secondary"}`}
            >
              <item.icon className="size-4" /> {item.label}
              {tab === item.id && <ChevronRight className="ml-auto size-3.5 text-primary/60" />}
            </button>
          ))}
        </nav>
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3">
            <div className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
          <Link
            to="/"
            className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground hover:bg-secondary transition"
          >
            <LogOut className="size-4" /> Logout
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="min-w-0 space-y-4 sm:space-y-6">
        {/* Header bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="grid size-10 place-items-center rounded-xl bg-card shadow-sm lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Overview
              </p>
              <h1 className="font-display text-2xl font-bold capitalize">
                {tab === "settings" ? "Site Settings" : tab}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative" ref={searchRef}>
              <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm md:flex focus-within:ring-2 focus-within:ring-primary/20">
                <Search className="size-4 text-muted-foreground" />
                <input
                  placeholder="Search products or orders…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  className="w-56 bg-transparent text-sm focus:outline-none"
                />
              </div>

              {searchFocused &&
                searchResults &&
                (searchResults.products.length > 0 || searchResults.orders.length > 0) && (
                  <div className="absolute left-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card p-2 shadow-xl">
                    {searchResults.products.length > 0 && (
                      <div className="mb-2">
                        <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Products
                        </p>
                        {searchResults.products.map((p) => (
                          <button
                            key={p.slug}
                            onClick={() => {
                              setTab("products");
                              setSearchFocused(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-secondary"
                          >
                            <ShoppingBasket className="size-4 text-primary" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold">{p.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {p.price.toFixed(2)} DA
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {searchResults.orders.length > 0 && (
                      <div>
                        <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Orders
                        </p>
                        {searchResults.orders.map((o) => (
                          <button
                            key={o.id}
                            onClick={() => {
                              setTab("orders");
                              setSearchFocused(false);
                            }}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-secondary"
                          >
                            <ClipboardList className="size-4 text-amber-500" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-mono text-sm font-bold">{o.id}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {o.address.fullName}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
            </div>

            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative grid size-10 place-items-center rounded-xl bg-card shadow-sm transition hover:bg-secondary"
              >
                <Bell className="size-4" />
                {notifications.length > 0 && (
                  <span className="absolute right-2 top-2 size-2.5 rounded-full bg-destructive border-2 border-card" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-12 z-50 w-[calc(100vw-2rem)] max-w-80 rounded-2xl border border-border bg-card p-4 shadow-xl">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display font-bold">Notifications</h3>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold">
                      {notifications.length}
                    </span>
                  </div>
                  <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-sm text-muted-foreground">
                        No new notifications
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <button
                          key={n.id}
                          onClick={n.onClick}
                          className="flex items-start gap-3 rounded-xl p-2 text-left transition hover:bg-secondary"
                        >
                          <div
                            className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-full ${n.iconBg} ${n.iconColor}`}
                          >
                            <n.icon className="size-4" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{n.title}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">
                              {n.time}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {tab === "dashboard" && (
          <>
            {/* ── 4-Column KPI Cards ── */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className={`relative overflow-hidden rounded-2xl border border-border/50 bg-card p-3 sm:p-5 shadow-sm transition hover:shadow-md bg-gradient-to-br ${s.gradient}`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-muted-foreground truncate">
                        {s.label}
                      </p>
                      <p className="mt-1 sm:mt-2 font-display text-lg sm:text-2xl xl:text-3xl font-bold tracking-tight truncate">
                        {s.value}
                      </p>
                    </div>
                    <div className="grid size-8 sm:size-11 shrink-0 place-items-center rounded-lg sm:rounded-xl bg-tertiary text-primary">
                      <s.icon className="size-4 sm:size-5" />
                    </div>
                  </div>
                  <p
                    className={`mt-2 sm:mt-3 flex items-center gap-1 text-[10px] sm:text-xs font-semibold ${s.trendColor ?? "text-primary"}`}
                  >
                    <TrendingUp className="size-3 shrink-0" />{" "}
                    <span className="truncate">{s.trend}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* ── Chart + Sidebar row ── */}
            <div className="grid gap-4 sm:gap-6 xl:grid-cols-[1fr_320px]">
              {/* Sales chart */}
              <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold">Sales Performance</h2>
                    <p className="text-xs text-muted-foreground">
                      Revenue for the last 7 days (DA)
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-tertiary px-3 py-1.5">
                    <BarChart3 className="size-3.5 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      Weekly
                    </span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-6 h-48 sm:h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} barSize={20}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--color-border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="day"
                        tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                        axisLine={false}
                        tickLine={false}
                        width={40}
                        tickFormatter={(v) => `${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "0.75rem",
                          fontSize: 12,
                        }}
                        formatter={(v: number) => [`${v.toLocaleString()} DA`, "Revenue"]}
                        cursor={{ fill: "var(--color-secondary)" }}
                      />
                      <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Right column: Storage + Quick Actions */}
              <div className="space-y-6">
                {/* Storage Usage */}
                <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
                  <div className="flex items-center gap-2">
                    <HardDrive className="size-4 text-primary" />
                    <h3 className="text-sm font-bold">Storage Usage</h3>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-end justify-between text-xs">
                      <span className="text-muted-foreground">1.4 GB used</span>
                      <span className="font-semibold">2 GB</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-secondary">
                      <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-primary to-emerald-400 transition-all" />
                    </div>
                    <p className="mt-2 text-[11px] text-muted-foreground">70% of storage used</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-2xl border border-border/50 bg-card p-5 shadow-sm">
                  <h3 className="text-sm font-bold">Quick Actions</h3>
                  <div className="mt-4 grid gap-2">
                    <button
                      onClick={() => setTab("products")}
                      className="flex items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      <Plus className="size-4" /> Add Product
                    </button>
                    <button
                      onClick={() => setTab("banners")}
                      className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-secondary"
                    >
                      <ImageIcon className="size-4" /> Create Banner
                    </button>
                    <button
                      onClick={() => setTab("orders")}
                      className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-semibold transition hover:bg-secondary"
                    >
                      <Download className="size-4" /> Export Orders
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Recent Orders Summary ── */}
            <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold">Recent Orders</h2>
                <button
                  onClick={() => setTab("orders")}
                  className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  View All Orders <ChevronRight className="size-3.5" />
                </button>
              </div>
              {/* Mobile recent orders cards */}
              <div className="mt-4 grid gap-2 sm:hidden">
                {orders.slice(0, 4).map((o) => (
                  <div key={o.id} className="rounded-xl border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{o.address.fullName}</p>
                        <p className="font-mono text-[10px] text-primary">{o.id}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(o.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <span className="font-semibold text-foreground">{o.total.toFixed(2)} DA</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">No orders yet.</p>
                )}
              </div>
              {/* Desktop recent orders table */}
              <div className="mt-4 hidden overflow-x-auto rounded-xl border border-border sm:block">
                <table className="w-full min-w-[480px] text-sm">
                  <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 text-left">Order</th>
                      <th className="px-4 py-3 text-left">Customer</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Total</th>
                      <th className="px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 4).map((o) => (
                      <tr key={o.id} className="transition hover:bg-secondary/30">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-primary">
                          {o.id}
                        </td>
                        <td className="px-4 py-3 font-semibold">{o.address.fullName}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(o.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-4 py-3 font-semibold">{o.total.toFixed(2)} DA</td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[o.status]}`}
                          >
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {orders.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                          No orders yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "products" && <ProductsTab searchQuery={searchQuery} />}
        {tab === "orders" && <OrdersTab searchQuery={searchQuery} />}
        {tab === "accounts" && <AccountsTab currentId={user.id} />}
        {tab === "settings" && <SettingsTab />}
        {tab === "banners" && <BannersTab />}
        {tab === "shipping" && <ShippingTab />}
      </div>
    </section>
  );
}

function ProductsTab({ searchQuery = "" }: { searchQuery?: string }) {
  const featuredSlugs = useCatalog((s) => s.featuredSlugs);
  const toggle = useCatalog((s) => s.toggleFeatured);
  const products = useMergedProducts();
  const updateProduct = useCatalog((s) => s.updateProduct);
  const resetProduct = useCatalog((s) => s.resetProduct);
  const addProduct = useCatalog((s) => s.addProduct);
  const removeProduct = useCatalog((s) => s.removeProduct);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const editing = editingSlug ? (products.find((p) => p.slug === editingSlug) ?? null) : null;

  return (
    <div className="min-w-0 rounded-2xl bg-card p-3 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Products Management</h2>
          <p className="text-sm text-muted-foreground">
            Edit details, swap images, or feature an item — changes show on the home page instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-tertiary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary sm:inline-block">
            {featuredSlugs.length} on home
          </span>
          <button
            onClick={() => setIsAdding(true)}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Add Product
          </button>
        </div>
      </div>
      {/* Mobile card layout */}
      <div className="mt-5 grid gap-3 sm:hidden">
        {products
          .filter((p) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
              p.name.toLowerCase().includes(q) ||
              p.slug.toLowerCase().includes(q) ||
              (p.category || "").toLowerCase().includes(q)
            );
          })
          .map((p) => {
            const isFeatured = featuredSlugs.includes(p.slug);
            return (
              <div key={p.slug} className="rounded-xl border border-border bg-secondary/20 p-3">
                <div className="flex items-center gap-3">
                  <img
                    src={primaryProductImage(p.image)}
                    alt=""
                    className="size-12 rounded-lg object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{p.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="rounded-full bg-tertiary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        {p.category}
                      </span>
                      <span className="text-xs font-semibold">{p.price.toFixed(2)} DA</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingSlug(p.slug)}
                      className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
                      aria-label={`Edit ${p.name}`}
                    >
                      <Pencil className="size-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${p.name}?`)) removeProduct(p.slug);
                      }}
                      className="rounded-md p-2 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                      aria-label={`Delete ${p.name}`}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span
                    className={`flex items-center gap-1.5 text-xs ${p.stock && p.stock < 10 ? "text-amber-600" : "text-primary"}`}
                  >
                    <span className="size-1.5 rounded-full bg-current" />
                    {p.stock && p.stock < 10 ? `Low (${p.stock})` : `In Stock (${p.stock ?? 0})`}
                  </span>
                  <button
                    onClick={() => toggle(p.slug)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider transition ${isFeatured ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}
                  >
                    <Star className={`size-2.5 ${isFeatured ? "fill-current" : ""}`} />
                    {isFeatured ? "Featured" : "Feature"}
                  </button>
                </div>
              </div>
            );
          })}
      </div>

      {/* Desktop table layout */}
      <div className="mt-5 hidden overflow-x-auto rounded-xl border border-border sm:block">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Featured on Home</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products
              .filter((p) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase();
                return (
                  p.name.toLowerCase().includes(q) ||
                  p.slug.toLowerCase().includes(q) ||
                  (p.category || "").toLowerCase().includes(q)
                );
              })
              .map((p) => {
                const isFeatured = featuredSlugs.includes(p.slug);
                return (
                  <tr key={p.slug}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={primaryProductImage(p.image)}
                          alt=""
                          className="size-10 rounded-lg object-cover"
                        />
                        <span className="font-semibold">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{p.price.toFixed(2)} DA</td>
                    <td className="px-4 py-3">
                      <span
                        className={`flex items-center gap-1.5 ${p.stock && p.stock < 10 ? "text-amber-600" : "text-primary"}`}
                      >
                        <span className="size-2 rounded-full bg-current" />
                        {p.stock && p.stock < 10
                          ? `Low Stock (${p.stock})`
                          : `In Stock (${p.stock ?? 0})`}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggle(p.slug)}
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${isFeatured ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-tertiary hover:text-primary"}`}
                        aria-pressed={isFeatured}
                      >
                        <Star className={`size-3 ${isFeatured ? "fill-current" : ""}`} />
                        {isFeatured ? "On Home" : "Add to Home"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditingSlug(p.slug)}
                          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary"
                          aria-label={`Edit ${p.name}`}
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name}?`))
                              removeProduct(p.slug);
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive hover:text-destructive-foreground"
                          aria-label={`Delete ${p.name}`}
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        {featuredSlugs.length} products featured on the home page.
      </p>

      {editing && (
        <ProductEditModal
          key={editing.slug}
          product={editing}
          onClose={() => setEditingSlug(null)}
          onSave={(patch) => {
            updateProduct(editing.slug, patch);
            setEditingSlug(null);
          }}
          onReset={() => {
            resetProduct(editing.slug);
            setEditingSlug(null);
          }}
        />
      )}
      {isAdding && (
        <ProductEditModal
          key="new-product"
          product={null}
          onClose={() => setIsAdding(false)}
          onSave={(patch) => {
            addProduct(patch as Omit<Product, "slug"> & { slug?: string });
            setIsAdding(false);
          }}
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
  product: Product | null;
  onClose: () => void;
  onSave: (patch: ProductOverride) => void;
  onReset?: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [tagline, setTagline] = useState(product?.tagline || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [unit, setUnit] = useState(product?.unit || "");
  const [images, setImages] = useState<string[]>(parseProductImages(product?.image));

  const [badgesStr, setBadgesStr] = useState(product?.badges?.join(", ") || "");
  const [servingSize, setServingSize] = useState(product?.nutrition?.servingSize || "100g");
  const [calories, setCalories] = useState(product?.nutrition?.calories || "0");
  const [stock, setStock] = useState(product ? String(product.stock ?? 0) : "0");
  const [imgError, setImgError] = useState<string | null>(null);
  const baseImage = product?.image || "";
  const baseImages = parseProductImages(baseImage);
  const baseSerializedImages = serializeProductImages(baseImages);

  const dirty =
    !product ||
    name !== product.name ||
    tagline !== product.tagline ||
    description !== product.description ||
    unit !== product.unit ||
    serializeProductImages(images) !== baseSerializedImages ||
    badgesStr.trim() !== (product?.badges?.join(", ") || "") ||
    servingSize !== (product?.nutrition?.servingSize || "100g") ||
    calories !== (product?.nutrition?.calories || "0") ||
    parseFloat(price) !== product.price ||
    parseInt(stock) !== (product.stock ?? 0);

  const [uploading, setUploading] = useState(false);

  const onPickImage = async (file: File | null, inputEl?: HTMLInputElement) => {
    setImgError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setImgError("Please choose an image file (JPG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImgError("Image must be under 5 MB.");
      return;
    }

    setUploading(true);
    try {
      // Try uploading to Supabase Storage
      const ext = file.name.split(".").pop() || "jpg";
      const path = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data, error } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(data.path);
        setImages((prev) => [...prev, urlData.publicUrl]);
      } else {
        // Fallback to base64 if storage not configured
        await new Promise<void>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => {
            setImgError("We couldn't read that file. Try another image.");
            reject();
          };
          reader.onload = () => {
            setImages((prev) => [...prev, String(reader.result)]);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    } catch {
      // Fallback to base64
      await new Promise<void>((resolve) => {
        const reader = new FileReader();
        reader.onerror = () => {
          setImgError("We couldn't read that file. Try another image.");
          resolve();
        };
        reader.onload = () => {
          setImages((prev) => [...prev, String(reader.result)]);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    } finally {
      setUploading(false);
      // Reset the input so the same file can be picked again
      if (inputEl) inputEl.value = "";
    }
  };

  const handleClose = () => {
    if (dirty && !confirm("You have unsaved changes. Discard them?")) return;
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-lg sm:max-w-2xl rounded-3xl bg-card p-4 sm:p-6 shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold">
              {product ? "Edit product" : "Add product"}
            </h3>
            <p className="text-xs text-muted-foreground">
              Slug: {product?.slug || "auto-generated"}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-2 hover:bg-secondary"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {dirty && product && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="size-3.5" /> You have unsaved changes
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr]">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-square w-20 overflow-hidden rounded-xl border border-border"
                >
                  <img src={img} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-destructive opacity-0 backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <label
              className={`flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-border px-3 py-6 text-xs font-semibold hover:bg-secondary ${uploading ? "opacity-60 pointer-events-none" : ""}`}
            >
              {uploading ? "Uploading…" : "+ Upload Image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  onPickImage(file, e.target);
                }}
                disabled={uploading}
              />
            </label>
            {imgError && <p className="text-[11px] text-destructive">{imgError}</p>}
            {serializeProductImages(images) !== baseSerializedImages && (
              <button
                type="button"
                onClick={() => setImages(parseProductImages(baseImage))}
                className="w-full rounded-full px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary"
              >
                Restore original images
              </button>
            )}
          </div>
          <div className="space-y-3">
            <Input label="Name" value={name} onChange={setName} />
            <Input label="Tagline" value={tagline} onChange={setTagline} />
            <Textarea label="Description" value={description} onChange={setDescription} />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Input label="Price (DA)" value={price} onChange={setPrice} type="number" step="1" />
              <Input label="Unit" value={unit} onChange={setUnit} />
              <Input label="Stock" value={stock} onChange={setStock} type="number" step="1" />
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-border pt-5 grid-cols-1 sm:grid-cols-3">
          <Input
            label="Badges (comma separated)"
            value={badgesStr}
            onChange={setBadgesStr}
            placeholder="e.g. Organic, Vegan"
          />
          <Input label="Serving Size" value={servingSize} onChange={setServingSize} />
          <Input label="Calories" value={calories} onChange={setCalories} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {onReset && product ? (
            <button
              onClick={onReset}
              className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary"
            >
              Reset to defaults
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              onClick={() =>
                onSave({
                  name,
                  tagline,
                  description,
                  unit,
                  image: serializeProductImages(images),
                  category: product?.category || "Uncategorized",
                  badges: badgesStr
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                  nutrition: { ...product?.nutrition, servingSize, calories },
                  price: Number.isFinite(parseFloat(price))
                    ? parseFloat(price)
                    : product?.price || 0,
                  stock: Number.isFinite(parseInt(stock)) ? parseInt(stock) : (product?.stock ?? 0),
                })
              }
              disabled={!dirty || !name || !price || uploading}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {uploading ? "Uploading image…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ searchQuery = "" }: { searchQuery?: string }) {
  const orders = useOrders((s) => s.orders);
  const setStatus = useOrders((s) => s.setStatus);
  const [filter, setFilter] = useState<OrderStatus | "All">("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visible = useMemo(() => {
    let list = filter === "All" ? orders : orders.filter((o) => o.status === filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.address?.fullName || "").toLowerCase().includes(q) ||
          (o.phone && o.phone.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [orders, filter, searchQuery]);
  const selected = selectedId ? orders.find((o) => o.id === selectedId) : null;

  return (
    <div className="min-w-0 space-y-4 sm:space-y-5">
      <div className="min-w-0 rounded-2xl bg-card p-3 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold">Recent Orders</h2>
            <p className="text-sm text-muted-foreground">
              Click an order to view full details. Update fulfillment status as orders progress.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["All", ...allStatuses] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`rounded-full px-3 py-2 sm:py-1.5 text-xs font-semibold transition ${filter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-tertiary hover:text-primary"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile order cards */}
        <div className="mt-5 grid gap-2 sm:hidden">
          {visible.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No orders match this filter.
            </p>
          ) : (
            visible.map((o) => (
              <div
                key={o.id}
                onClick={() => setSelectedId(o.id === selectedId ? null : o.id)}
                className={`cursor-pointer rounded-xl border border-border p-3 transition hover:bg-secondary/30 ${selectedId === o.id ? "bg-tertiary/30 border-primary/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">{o.address.fullName}</p>
                    <p className="text-xs text-muted-foreground">
                      {o.address.city} {o.phone ? `• ${o.phone}` : ""}
                    </p>
                    <p className="font-mono text-[10px] text-primary mt-0.5">{o.id}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${statusStyles[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">
                    {new Date(o.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{o.total.toFixed(2)} DA</span>
                    <select
                      value={o.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        setStatus(o.id, e.target.value as OrderStatus);
                      }}
                      className="rounded-md border border-border bg-background px-1.5 py-1 text-[10px] focus:outline-none"
                    >
                      {allStatuses.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {/* Desktop order table */}
        <div className="mt-5 hidden overflow-x-auto rounded-xl border border-border sm:block">
          <table className="w-full min-w-[540px] text-sm">
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
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No orders match this filter.
                  </td>
                </tr>
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
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 font-semibold">{o.total.toFixed(2)} DA</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${statusStyles[o.status]}`}
                      >
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
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Showing {visible.length} of {orders.length} orders
        </p>
      </div>

      {/* Order Detail Panel */}
      {selected && (
        <div className="rounded-2xl bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Order {selected.id}</h3>
              <p className="text-xs text-muted-foreground">
                {new Date(selected.createdAt).toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => setSelectedId(null)}
              className="rounded-full p-2 hover:bg-secondary"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[1fr_280px]">
            {/* Items list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Items ({selected.items.length})
              </h4>
              <ul className="mt-3 divide-y divide-border rounded-xl border border-border">
                {selected.items.length === 0 ? (
                  <li className="px-4 py-4 text-sm text-muted-foreground">
                    Item details not available for this order.
                  </li>
                ) : (
                  selected.items.map((item) => (
                    <li key={item.slug} className="flex items-center gap-4 px-4 py-3">
                      <img
                        src={primaryProductImage(item.image)}
                        alt={item.name}
                        className="size-12 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          ×{item.qty} • {item.unit}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary">
                        {(item.price * item.qty).toFixed(2)} DA
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Customer
                </h4>
                <p className="mt-2 text-sm font-semibold">{selected.address.fullName}</p>
                {selected.phone && (
                  <p className="mt-1 text-sm text-muted-foreground">📱 {selected.phone}</p>
                )}
                <p className="mt-1 text-sm text-muted-foreground">{selected.address.street}</p>
                <p className="text-sm text-muted-foreground">{selected.address.city}</p>
              </div>

              <div className="rounded-xl border border-border p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Shipping
                </h4>
                <p className="mt-2 text-sm font-semibold capitalize">
                  {selected.deliveryType === "desk" ? "Desk Delivery" : "Home Delivery"}
                </p>
                {selected.shippingCompany && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    Via: {selected.shippingCompany}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-border p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Payment
                </h4>
                <p className="mt-2 text-sm font-semibold">Cash on Delivery</p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-tertiary/20 p-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Totals
                </h4>
                <dl className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt>Subtotal</dt>
                    <dd>{selected.subtotal.toFixed(2)} DA</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Shipping</dt>
                    <dd>{selected.shipping.toFixed(2)} DA</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-bold">
                    <dt>Total</dt>
                    <dd className="text-primary">{selected.total.toFixed(2)} DA</dd>
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
  const [pendingRole, setPendingRole] = useState<{ id: string; name: string; role: Role } | null>(
    null,
  );

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = accounts;
    if (q)
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.role.includes(q),
      );
    list = [...list].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [accounts, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(k);
      setSortDir("asc");
    }
  };

  const startEdit = (id: string, name: string, email: string) => {
    setEditing(id);
    setDraftName(name);
    setDraftEmail(email);
  };
  const saveEdit = (id: string) => {
    updateAccount(id, { name: draftName, email: draftEmail });
    setEditing(null);
  };

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <button
      onClick={() => toggleSort(k)}
      className="inline-flex items-center gap-1 hover:text-foreground"
    >
      {label}
      {sortKey === k &&
        (sortDir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
    </button>
  );

  return (
    <div className="min-w-0 rounded-2xl bg-card p-3 sm:p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Accounts Management</h2>
          <p className="text-sm text-muted-foreground">
            Promote shoppers to admins, edit profiles, or remove accounts.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 text-sm">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-28 sm:w-44 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <span className="rounded-full bg-tertiary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
            {accounts.length} users
          </span>
        </div>
      </div>

      {/* Mobile account cards */}
      <div className="mt-5 grid gap-2 sm:hidden">
        {visible.map((a) => (
          <div key={a.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center gap-3">
              <div className="grid size-9 shrink-0 place-items-center rounded-full bg-tertiary text-xs font-bold text-primary">
                {a.name
                  .split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-sm truncate">{a.name}</p>
                  {a.id === currentId && (
                    <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[8px] font-bold uppercase text-primary">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{a.email}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => startEdit(a.id, a.name, a.email)}
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary"
                  aria-label="Edit"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (a.id === currentId) return alert("You can't delete your own account.");
                    if (confirm(`Delete ${a.name}?`)) removeAccount(a.id);
                  }}
                  disabled={a.id === currentId}
                  className="rounded-md p-2 text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-40"
                  aria-label="Delete"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <select
                value={a.role}
                onChange={(e) =>
                  setPendingRole({ id: a.id, name: a.name, role: e.target.value as Role })
                }
                disabled={a.id === currentId}
                className="rounded-md border border-border bg-background px-2 py-1 text-[10px] disabled:opacity-60"
              >
                <option value="shopper">Shopper</option>
                <option value="admin">Admin</option>
              </select>
              <span className="text-[10px] text-muted-foreground">
                {new Date(a.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No accounts match your search.
          </p>
        )}
      </div>
      {/* Desktop account table */}
      <div className="mt-5 hidden overflow-x-auto rounded-xl border border-border sm:block">
        <table className="w-full min-w-[540px] text-sm">
          <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">
                <SortHeader k="name" label="User" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader k="email" label="Email" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader k="role" label="Role" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader k="createdAt" label="Joined" />
              </th>
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
                        {a.name
                          .split(" ")
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")}
                      </div>
                      <span className="font-semibold">{a.name}</span>
                      {a.id === currentId && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                          You
                        </span>
                      )}
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
                    onChange={(e) =>
                      setPendingRole({ id: a.id, name: a.name, role: e.target.value as Role })
                    }
                    disabled={a.id === currentId}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-60"
                  >
                    <option value="shopper">Shopper</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {editing === a.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(a.id)}
                          className="rounded-md p-2 sm:p-1.5 text-primary hover:bg-secondary"
                          aria-label="Save"
                        >
                          <Check className="size-4" />
                        </button>
                        <button
                          onClick={() => setEditing(null)}
                          className="rounded-md p-2 sm:p-1.5 text-muted-foreground hover:bg-secondary"
                          aria-label="Cancel"
                        >
                          <X className="size-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(a.id, a.name, a.email)}
                          className="rounded-md p-2 sm:p-1.5 text-muted-foreground hover:bg-secondary"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (a.id === currentId)
                              return alert("You can't delete your own account here.");
                            if (confirm(`Delete account for ${a.name}? This can't be undone.`))
                              removeAccount(a.id);
                          }}
                          disabled={a.id === currentId}
                          className="rounded-md p-2 sm:p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-40"
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
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No accounts match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          Showing {visible.length} of {filtered.length} accounts
        </span>
        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-md border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary"
            >
              Prev
            </button>
            <span className="px-2">
              Page {safePage} of {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
              className="rounded-md border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {pendingRole && (
        <ConfirmDialog
          title="Change role?"
          message={`Set ${pendingRole.name}'s role to ${pendingRole.role}? They'll ${pendingRole.role === "admin" ? "gain access to the admin dashboard." : "lose access to admin tools."}`}
          confirmLabel={`Yes, make ${pendingRole.role}`}
          onCancel={() => setPendingRole(null)}
          onConfirm={() => {
            updateAccount(pendingRole.id, { role: pendingRole.role });
            setPendingRole(null);
          }}
        />
      )}
    </div>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm sm:max-w-md rounded-2xl bg-card p-4 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-lg font-bold">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            {confirmLabel}
          </button>
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

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

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

        <Panel
          title="Contact information"
          subtitle="Visible in the footer and on the contact page."
        >
          <Input
            label="Contact email"
            type="email"
            value={draft.contactEmail}
            onChange={(v) => set("contactEmail", v)}
          />
          <Input
            label="Contact phone"
            value={draft.contactPhone}
            onChange={(v) => set("contactPhone", v)}
          />
          <Input label="Address" value={draft.address} onChange={(v) => set("address", v)} />
        </Panel>

        <Panel title="Home page banner" subtitle="The hero block visitors see first.">
          <Input
            label="Eyebrow text"
            value={draft.heroEyebrow}
            onChange={(v) => set("heroEyebrow", v)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Headline" value={draft.heroTitle} onChange={(v) => set("heroTitle", v)} />
            <Input
              label="Accent line"
              value={draft.heroAccent}
              onChange={(v) => set("heroAccent", v)}
            />
          </div>
          <Textarea
            label="Subtitle"
            value={draft.heroSubtitle}
            onChange={(v) => set("heroSubtitle", v)}
          />
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
          <Textarea
            label="Footer note"
            value={draft.footerNote}
            onChange={(v) => set("footerNote", v)}
          />
        </Panel>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            Save all settings
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Reset site settings to defaults?")) reset();
            }}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="aspect-[4/3] w-full bg-muted">
            <img
              src={draft.heroImageUrl || "/placeholder.svg"}
              alt="Hero preview"
              className="size-full object-cover"
            />
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
              {draft.heroEyebrow}
            </p>
            <h3 className="mt-2 font-display text-xl font-bold">
              {draft.heroTitle} <span className="text-primary">{draft.heroAccent}</span>
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">{draft.heroSubtitle}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
          <h3 className="font-display text-lg font-bold">Live preview</h3>
          <p className="mt-2 text-xs opacity-90">
            Changes apply instantly across the site after saving.
          </p>
        </div>
      </aside>
    </form>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-card p-4 sm:p-6 shadow-sm">
      <h2 className="font-display text-lg font-bold">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  ...props
}: { label: string; value: string; onChange: (v: string) => void } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        {...props}
      />
    </label>
  );
}

function Textarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
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
  label,
  value,
  onChange,
  placeholder,
  previewClass,
  maxSizeMB = 2,
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
      setError(
        `Image must be under ${maxSizeMB} MB (yours is ${(file.size / 1024 / 1024).toFixed(2)} MB).`,
      );
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setError("We couldn't read that file. Try a different one.");
    reader.onload = () => {
      setPreviewError(false);
      onChange(String(reader.result));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={value}
          onChange={(e) => {
            setPreviewError(false);
            setError(null);
            onChange(e.target.value);
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <label className="cursor-pointer rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-secondary">
          Upload
          <input
            type="file"
            accept={ALLOWED_IMAGE_TYPES.join(",")}
            className="hidden"
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setError(null);
              setPreviewError(false);
            }}
            className="rounded-full px-3 py-2 text-xs text-muted-foreground hover:bg-secondary"
          >
            Clear
          </button>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground">
        JPG, PNG, WEBP, GIF or SVG · max {maxSizeMB} MB
      </p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {value && !error && (
        <div className="flex items-center gap-3 rounded-lg bg-secondary/60 p-3">
          <ImageIcon className="size-4 text-muted-foreground" />
          {previewError ? (
            <span className="text-xs text-destructive">
              Preview failed — the URL doesn't load as an image.
            </span>
          ) : (
            <img
              src={value}
              alt={`${label} preview`}
              className={previewClass ?? "h-12 w-auto"}
              onError={() => setPreviewError(true)}
            />
          )}
        </div>
      )}
    </div>
  );
}

function BannersTab() {
  const banners = useBanners((s) => s.banners);
  const addBanner = useBanners((s) => s.addBanner);
  const updateBanner = useBanners((s) => s.updateBanner);
  const removeBanner = useBanners((s) => s.removeBanner);

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Banners & Visuals</h2>
          <p className="text-sm text-muted-foreground">
            Manage Hero banners displayed on the home page.
          </p>
        </div>
        <button
          onClick={() =>
            addBanner({
              title: "New Banner",
              imageUrl: "",
              link: "/shop",
              location: "Hero",
              order: banners.length,
              status: "Active",
            })
          }
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> Add Banner
        </button>
      </div>

      <div className="grid gap-6">
        {banners.map((b) => (
          <div key={b.id} className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <Input
                  label="Title"
                  value={b.title}
                  onChange={(v) => updateBanner(b.id, { title: v })}
                />
                <Input
                  label="Link URL"
                  value={b.link}
                  onChange={(v) => updateBanner(b.id, { link: v })}
                />
                <ImageField
                  label="Banner Image"
                  value={b.imageUrl}
                  onChange={(v) => updateBanner(b.id, { imageUrl: v })}
                  placeholder="Paste image URL or upload"
                  previewClass="h-20 w-auto rounded object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={b.status === "Active"}
                    onChange={(e) =>
                      updateBanner(b.id, { status: e.target.checked ? "Active" : "Inactive" })
                    }
                    className="size-4 accent-primary"
                  />
                  Active
                </label>
                <button
                  onClick={() => {
                    if (confirm("Remove this banner?")) removeBanner(b.id);
                  }}
                  className="mt-4 rounded-full border border-destructive/20 px-3 py-2 sm:py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3 inline mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No banners defined.
          </div>
        )}
      </div>
    </div>
  );
}

function ShippingTab() {
  const { companies, addCompany, updateCompany, removeCompany, updateRate } = useShipping();
  const [newCompanyName, setNewCompanyName] = useState("");
  const [deskRate, setDeskRate] = useState(400);
  const [homeRate, setHomeRate] = useState(600);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    addCompany(newCompanyName, deskRate, homeRate);
    setNewCompanyName("");
  };

  return (
    <div className="min-w-0 space-y-4 sm:space-y-6">
      <div className="rounded-2xl bg-card p-3 sm:p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">Add Shipping Company</h2>
        <form onSubmit={onAdd} className="mt-4 grid gap-3 sm:flex sm:flex-wrap sm:items-end">
          <Input label="Company Name" value={newCompanyName} onChange={setNewCompanyName} />
          <Input
            label="Default Desk Rate (DA)"
            type="number"
            value={String(deskRate)}
            onChange={(v) => setDeskRate(Number(v))}
          />
          <Input
            label="Default Home Rate (DA)"
            type="number"
            value={String(homeRate)}
            onChange={(v) => setHomeRate(Number(v))}
          />
          <button
            type="submit"
            className="mb-0.5 inline-flex items-center gap-1 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
          >
            <Plus className="size-4" /> Add
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {companies.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateCompany(c.id, { name: e.target.value })}
                  className="font-display text-lg font-bold bg-transparent focus:outline-none border-b border-transparent focus:border-border"
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={c.active}
                    onChange={(e) => updateCompany(c.id, { active: e.target.checked })}
                    className="size-4 accent-primary"
                  />
                  Active
                </label>
              </div>
              <button
                onClick={() => {
                  if (confirm("Remove this shipping company?")) removeCompany(c.id);
                }}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <Input
                label="Default Desk Rate (DA)"
                type="number"
                value={String(c.defaultDeskRate)}
                onChange={(v) => updateCompany(c.id, { defaultDeskRate: Number(v) })}
              />
              <Input
                label="Default Home Rate (DA)"
                type="number"
                value={String(c.defaultHomeRate)}
                onChange={(v) => updateCompany(c.id, { defaultHomeRate: Number(v) })}
              />
            </div>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-primary hover:underline outline-none">
                Configure Custom Rates per Wilaya
              </summary>
              <div className="mt-4 max-h-[400px] overflow-auto rounded-xl border border-border">
                <table className="w-full min-w-[340px] text-sm">
                  <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-2 sm:px-4 py-3 text-left">Wilaya</th>
                      <th className="px-2 sm:px-4 py-3 text-left">Desk (DA)</th>
                      <th className="px-2 sm:px-4 py-3 text-left">Home (DA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {wilayas.map((w) => {
                      const rate = c.rates[w] || {
                        desk: c.defaultDeskRate,
                        home: c.defaultHomeRate,
                      };
                      return (
                        <tr key={w}>
                          <td className="px-2 sm:px-4 py-2 font-semibold text-xs sm:text-sm">
                            {w}
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            <input
                              type="number"
                              value={rate.desk}
                              onChange={(e) =>
                                updateRate(c.id, w, Number(e.target.value), rate.home)
                              }
                              className="w-16 sm:w-24 rounded-md border border-border bg-background px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="px-2 sm:px-4 py-2">
                            <input
                              type="number"
                              value={rate.home}
                              onChange={(e) =>
                                updateRate(c.id, w, rate.desk, Number(e.target.value))
                              }
                              className="w-16 sm:w-24 rounded-md border border-border bg-background px-1.5 sm:px-2 py-1 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
  );
}
