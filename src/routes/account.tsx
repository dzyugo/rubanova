import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import {
  User,
  MapPin,
  Package,
  Plus,
  Trash2,
  Star,
  ChevronRight,
  LogIn,
  UserPlus,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useOrders, type OrderStatus } from "@/store/orders";
import { useAuth, selectCurrentUser } from "@/store/auth";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/account")({
  validateSearch: z.object({
    mode: z.enum(["login", "signup"]).optional(),
  }),
  component: AccountPage,
});

const statusStyles: Record<OrderStatus, string> = {
  Processing: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  Shipped: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
  Delivered: "bg-tertiary text-primary",
  Cancelled: "bg-destructive/10 text-destructive",
};

function AccountPage() {
  const user = useAuth(selectCurrentUser);
  if (!user) return <AuthGate />;
  return <AccountDashboard />;
}

function AuthGate() {
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "signup">(search.mode || "login");
  const [error, setError] = useState<string | null>(null);
  const login = useAuth((s) => s.login);
  const signup = useAuth((s) => s.signup);
  const [busy, setBusy] = useState(false);
  const { t } = useT();
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    try {
      if (mode === "login") {
        const r = await login(email, password);
        if (!r.ok) return setError(r.error ?? "Could not sign in.");
        navigate({ to: "/" });
      } else {
        const name = String(f.get("name") || "").trim();
        if (!name || !email || password.length < 6) {
          setError("Name, email and a 6+ character password are required.");
          return;
        }
        const r = await signup({ name, email, password });
        if (!r.ok) return setError(r.error ?? "Could not sign up.");
        navigate({ to: "/" });
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-12 sm:max-w-md sm:px-6 sm:py-16">
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-tertiary text-primary sm:size-14">
          <User className="size-5 sm:size-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold sm:text-3xl">
          {mode === "login" ? t("auth.welcome") : t("auth.create")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login" ? t("auth.login.sub") : t("auth.signup.sub")}
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-card p-5 shadow-sm sm:p-6">
        {mode === "signup" && <Field name="name" label={t("auth.fullname")} required />}
        <Field name="email" label={t("auth.email")} type="email" required />
        <Field
          name="password"
          label={t("auth.password")}
          type="password"
          required
          minLength={mode === "signup" ? 6 : undefined}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {busy ? (
            t("auth.wait")
          ) : mode === "login" ? (
            <>
              <LogIn className="size-4" /> {t("auth.signin")}
            </>
          ) : (
            <>
              <UserPlus className="size-4" /> {t("auth.createaccount")}
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
          className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-primary"
        >
          {mode === "login" ? t("auth.needaccount") : t("auth.havaccount")}
        </button>
      </form>
    </section>
  );
}

function AccountDashboard() {
  const user = useAuth(selectCurrentUser)!;
  const logout = useAuth((s) => s.logout);
  const updateAccount = useAuth((s) => s.updateAccount);
  const orders = useOrders((s) => s.orders);
  const addresses = useOrders((s) => s.addresses);
  const addAddress = useOrders((s) => s.addAddress);
  const removeAddress = useOrders((s) => s.removeAddress);
  const setDefaultAddress = useOrders((s) => s.setDefaultAddress);
  const { t } = useT();

  const [tab, setTab] = useState<"orders" | "addresses" | "profile">("orders");
  const [showForm, setShowForm] = useState(false);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    addAddress({
      label: String(f.get("label") || "Home"),
      fullName: String(f.get("fullName") || ""),
      street: String(f.get("street") || ""),
      city: String(f.get("city") || ""),
      zip: String(f.get("zip") || ""),
      isDefault: addresses.length === 0,
    });
    setShowForm(false);
    (e.currentTarget as HTMLFormElement).reset();
  };

  const handleProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    updateAccount(user.id, {
      name: String(f.get("name") || user.name),
      email: String(f.get("email") || user.email),
    });
    alert(t("auth.profileupdated"));
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-full bg-tertiary text-primary sm:size-14">
            <User className="size-5 sm:size-6" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary sm:text-xs">
              {t("auth.myaccount")}
            </p>
            <h1 className="font-display text-xl font-bold sm:text-2xl lg:text-3xl">
              {t("auth.welcomeback")} {user.name.split(" ")[0]}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {user.email} •{" "}
              <span className="font-semibold uppercase tracking-wider text-primary">
                {user.role}
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {user.role === "admin" && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-tertiary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-tertiary/80 sm:px-4 sm:py-2 sm:text-sm"
            >
              <ShieldCheck className="size-3 sm:size-4" /> {t("nav.admin")}
            </Link>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary sm:px-4 sm:py-2 sm:text-sm"
          >
            <LogOut className="size-3 sm:size-4" />{" "}
            <span className="hidden sm:inline">{t("nav.signout")}</span>
          </button>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="mt-6 -mb-px flex gap-1 overflow-x-auto border-b border-border hide-scrollbar sm:mt-8 sm:gap-2">
        {[
          { id: "orders", label: t("auth.orders"), icon: Package },
          { id: "addresses", label: t("auth.addresses"), icon: MapPin },
          { id: "profile", label: t("auth.profile"), icon: User },
        ].map((tb) => (
          <button
            key={tb.id}
            onClick={() => setTab(tb.id as typeof tab)}
            className={`-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-xs font-semibold transition sm:gap-2 sm:px-4 sm:py-3 sm:text-sm ${
              tab === tb.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tb.icon className="size-3.5 sm:size-4" /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-xl bg-card p-8 text-center shadow-sm sm:rounded-2xl sm:p-10">
              <p className="text-sm text-muted-foreground sm:text-base">{t("auth.noorders")}</p>
            </div>
          ) : (
            orders.map((o) => (
              <article
                key={o.id}
                className="rounded-xl bg-card p-4 shadow-sm sm:rounded-2xl sm:p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-xs">
                      {t("auth.order")}
                    </p>
                    <p className="font-display text-base font-bold tracking-wider text-primary sm:text-lg">
                      {o.id}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1">
                      {new Date(o.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider sm:text-xs ${statusStyles[o.status]}`}
                    >
                      {o.status}
                    </span>
                    <span className="font-display text-lg font-bold sm:text-xl">
                      {o.total.toFixed(2)} DA
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3 sm:mt-4 sm:pt-4">
                  <p className="text-xs text-muted-foreground sm:text-sm">
                    {t("misc.shippedto")} {o.address.fullName}, {o.address.city}
                  </p>
                  <Link
                    to="/order-confirmation/$id"
                    params={{ id: o.id }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline sm:text-sm"
                  >
                    {t("auth.viewreceipt")} <ChevronRight className="size-3 sm:size-4" />
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {tab === "addresses" && (
        <div className="mt-5 sm:mt-8">
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {addresses.map((a) => (
              <div
                key={a.id}
                className={`rounded-xl border-2 p-4 shadow-sm sm:rounded-2xl sm:p-5 ${a.isDefault ? "border-primary bg-tertiary/40" : "border-border bg-card"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-display text-sm font-bold sm:text-base">{a.label}</p>
                      {a.isDefault && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground sm:text-[10px]">
                          <Star className="size-2.5" /> {t("auth.default")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold sm:mt-2">{a.fullName}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">{a.street}</p>
                    <p className="text-xs text-muted-foreground sm:text-sm">
                      {a.city}, {a.zip}
                    </p>
                  </div>
                  <button
                    onClick={() => removeAddress(a.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"
                    aria-label="Remove address"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                {!a.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(a.id)}
                    className="mt-3 text-xs font-semibold text-primary hover:underline sm:mt-4"
                  >
                    {t("auth.makedefault")}
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => setShowForm((s) => !s)}
              className="flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-card p-4 text-muted-foreground transition hover:border-primary hover:text-primary sm:min-h-[160px] sm:rounded-2xl sm:p-5"
            >
              <Plus className="size-5 sm:size-6" />
              <span className="text-xs font-semibold sm:text-sm">{t("auth.addaddress")}</span>
            </button>
          </div>

          {showForm && (
            <form
              onSubmit={handleAdd}
              className="mt-4 grid gap-4 rounded-2xl bg-card p-5 shadow-sm sm:mt-6 sm:p-6 sm:grid-cols-2"
            >
              <Field name="label" label={t("auth.label")} required />
              <Field name="fullName" label={t("auth.fullname")} required />
              <Field
                name="street"
                label={t("checkout.street")}
                className="sm:col-span-2"
                required
              />
              <Field name="city" label={t("checkout.city")} required />
              <Field name="zip" label={t("checkout.zip")} required />
              <div className="flex gap-3 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 sm:px-5 sm:py-2.5"
                >
                  {t("auth.saveaddress")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-secondary sm:px-5 sm:py-2.5"
                >
                  {t("auth.cancel")}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="mt-5 max-w-xl rounded-xl bg-card p-5 shadow-sm sm:mt-8 sm:rounded-2xl sm:p-6">
          <h2 className="font-display text-lg font-bold sm:text-xl">{t("auth.profiledetails")}</h2>
          <form onSubmit={handleProfile} className="mt-4 grid gap-4 sm:mt-5">
            <Field name="name" label={t("auth.fullname")} defaultValue={user.name} required />
            <Field
              name="email"
              label={t("auth.email")}
              type="email"
              defaultValue={user.email}
              required
            />
            <button className="mt-2 w-fit rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90">
              {t("auth.savechanges")}
            </button>
          </form>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  className,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <input
        {...props}
        className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}
