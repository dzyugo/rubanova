import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingCart, User, Sun, Moon, LogOut, ShieldCheck, Languages } from "lucide-react";
import { useCart } from "@/store/cart";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, selectCurrentUser } from "@/store/auth";
import { useSite } from "@/store/site";
import { useT, useLang } from "@/lib/i18n";

export function SiteHeader() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState("");
  const { theme, toggle } = useTheme();
  const user = useAuth(selectCurrentUser);
  const logout = useAuth((s) => s.logout);
  const settings = useSite((s) => s.settings);
  const navigate = useNavigate();
  const { t } = useT();
  const lang = useLang((s) => s.lang);
  const setLang = useLang((s) => s.setLang);

  const isAdmin = user?.role === "admin";

  const baseNav = [
    { to: "/shop" as const, label: t("nav.shop") },
    { to: "/about" as const, label: t("nav.story") },
    { to: "/contact" as const, label: t("nav.contact") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-6 px-6">
        <Link to="/" className="flex items-center gap-2">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} alt={settings.name} className="h-8 w-auto" />
          ) : null}
          <span className="font-display text-2xl font-bold tracking-tight text-primary">{settings.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {baseNav.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-primary border-b-2 border-primary pb-1" }}
              activeOptions={{ exact: true }}
            >
              {item.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 rounded-full bg-tertiary px-3 py-1.5 text-sm font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
              activeProps={{ className: "bg-primary text-primary-foreground" }}
            >
              <ShieldCheck className="size-4" /> {t("nav.admin")}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 md:px-4 md:py-2 text-sm">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              placeholder={t("nav.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && search.trim()) {
                  navigate({ to: "/shop", search: { q: search.trim() } });
                }
              }}
              className="w-24 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none md:w-44"
            />
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Toggle language"
          >
            <Languages className="size-4" />
            <span className="hidden sm:inline">{lang === "ar" ? "EN" : "عربي"}</span>
          </button>

          <button
            onClick={toggle}
            className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </button>

          <div className="relative">
            <button
              onClick={() => setMenu((m) => !m)}
              className="flex items-center gap-2 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Account"
            >
              {user ? (
                <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </span>
              ) : (
                <User className="size-5" />
              )}
            </button>
            {menu && (
              <div
                className="absolute end-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 text-sm shadow-lg"
                onMouseLeave={() => setMenu(false)}
              >
                {user ? (
                  <>
                    <div className="px-3 py-2 text-xs">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-muted-foreground">{user.email}</p>
                      <span className="mt-1 inline-block rounded-full bg-tertiary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                        {user.role}
                      </span>
                    </div>
                    <button
                      onClick={() => { setMenu(false); navigate({ to: "/account" }); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start hover:bg-secondary"
                    >
                      <User className="size-4" /> {t("nav.myaccount")}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => { setMenu(false); navigate({ to: "/admin" }); }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start hover:bg-secondary"
                      >
                        <ShieldCheck className="size-4" /> {t("nav.admindash")}
                      </button>
                    )}
                    <button
                      onClick={() => { logout(); setMenu(false); }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-destructive hover:bg-secondary"
                    >
                      <LogOut className="size-4" /> {t("nav.signout")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setMenu(false); navigate({ to: "/account" }); }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start hover:bg-secondary"
                  >
                    <User className="size-4" /> {t("nav.signin")}
                  </button>
                )}
              </div>
            )}
          </div>

          <Link to="/cart" className="relative hidden md:flex rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground" aria-label="Cart">
            <ShoppingCart className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
