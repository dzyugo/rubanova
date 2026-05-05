import { Link, useNavigate } from "@tanstack/react-router";
import {
  Search,
  ShoppingCart,
  User,
  Sun,
  Moon,
  LogOut,
  ShieldCheck,
  Languages,
  Menu,
  LayoutGrid,
  Info,
  Phone,
  LayoutDashboard,
  LogIn,
} from "lucide-react";
import { useCart } from "@/store/cart";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth, selectCurrentUser } from "@/store/auth";
import { useSite } from "@/store/site";
import { useT, useLang } from "@/lib/i18n";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerOverlay,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
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
    { to: "/shop" as const, label: t("nav.shop"), icon: LayoutGrid },
    { to: "/about" as const, label: t("nav.story"), icon: Info },
    { to: "/contact" as const, label: t("nav.contact"), icon: Phone },
  ];

  const handleSearch = () => {
    if (search.trim()) {
      navigate({ to: "/shop", search: { q: search.trim() } });
      setSearchOpen(false);
      setSearch("");
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.name} className="h-8 w-auto" />
            ) : (
              <span className="font-display text-lg font-bold tracking-tight text-primary sm:text-xl">
                {settings.name}
              </span>
            )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-6 md:flex">
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

          {/* Desktop Search */}
          <div className="hidden items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 md:flex">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <input
              placeholder={t("nav.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="w-32 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none lg:w-44"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Mobile Search Toggle */}
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground md:hidden"
              aria-label="Search"
            >
              <Search className="size-5" />
            </button>

            {/* Language toggle */}
            <button
              onClick={() => setLang(lang === "ar" ? "en" : "ar")}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Toggle language"
            >
              <Languages className="size-4" />
              <span className="hidden sm:inline">{lang === "ar" ? "EN" : "عربي"}</span>
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggle}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="size-5" /> : <Moon className="size-5" />}
            </button>

            {/* Cart (always visible on mobile via MobileNav, visible here on md+) */}
            <Link
              to="/cart"
              className="relative rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              aria-label="Cart"
            >
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>

            {/* User menu (desktop) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => {
                  const menu = document.getElementById("desktop-user-menu");
                  menu?.classList.toggle("hidden");
                }}
                className="flex items-center gap-2 rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="Account"
              >
                {user ? (
                  <span className="grid size-7 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                ) : (
                  <User className="size-5" />
                )}
              </button>
              <div
                id="desktop-user-menu"
                className="hidden absolute end-0 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-popover p-1 text-sm shadow-lg"
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
                      onClick={() => {
                        document.getElementById("desktop-user-menu")?.classList.add("hidden");
                        navigate({ to: "/account" });
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start hover:bg-secondary"
                    >
                      <User className="size-4" /> {t("nav.myaccount")}
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          document.getElementById("desktop-user-menu")?.classList.add("hidden");
                          navigate({ to: "/admin" });
                        }}
                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start hover:bg-secondary"
                      >
                        <ShieldCheck className="size-4" /> {t("nav.admindash")}
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        document.getElementById("desktop-user-menu")?.classList.add("hidden");
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-destructive hover:bg-secondary"
                    >
                      <LogOut className="size-4" /> {t("nav.signout")}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => {
                      document.getElementById("desktop-user-menu")?.classList.add("hidden");
                      navigate({ to: "/account" });
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-start hover:bg-secondary"
                  >
                    <User className="size-4" /> {t("nav.signin")}
                  </button>
                )}
              </div>
            </div>

            {/* Hamburger (mobile) */}
            <button
              onClick={() => setMenuOpen(true)}
              className="rounded-full p-2 text-muted-foreground transition hover:bg-secondary hover:text-foreground md:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile Search Sheet ─────────────────────────────────────── */}
      <Sheet open={searchOpen} onOpenChange={setSearchOpen}>
        <SheetContent side="top" className="flex flex-col gap-4 px-4 pb-6">
          <div className="flex items-center gap-3 rounded-full border border-border bg-secondary/60 px-4 py-2">
            <Search className="size-5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              placeholder={t("nav.search")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              className="flex-1 bg-transparent text-base placeholder:text-muted-foreground focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            className="w-full rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground"
          >
            Search
          </button>
        </SheetContent>
      </Sheet>

      {/* ── Mobile Nav Drawer ─────────────────────────────────────────── */}
      <Drawer open={menuOpen} onOpenChange={setMenuOpen}>
        <DrawerOverlay />
        <DrawerContent className="max-h-[85vh]">
          <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-muted" />
          <DrawerHeader className="px-4 pt-2 text-start">
            <DrawerTitle className="flex items-center gap-2">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.name} className="h-8 w-auto" />
              ) : (
                <span className="font-display text-xl font-bold text-primary">{settings.name}</span>
              )}
            </DrawerTitle>
          </DrawerHeader>
          <nav className="flex flex-col gap-1 overflow-y-auto px-4 pb-6">
            {/* Search */}
            <div className="mb-3 flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-2">
              <Search className="size-4 text-muted-foreground shrink-0" />
              <input
                placeholder={t("nav.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && search.trim()) {
                    setMenuOpen(false);
                    navigate({ to: "/shop", search: { q: search.trim() } });
                  }
                }}
                className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {/* Nav links */}
            {baseNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-foreground transition hover:bg-secondary"
                activeProps={{ className: "bg-secondary text-primary font-semibold" }}
              >
                <item.icon className="size-5 text-muted-foreground" />
                {item.label}
              </Link>
            ))}

            {/* Cart */}
            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-foreground transition hover:bg-secondary"
            >
              <div className="relative">
                <ShoppingCart className="size-5 text-muted-foreground" />
                {count > 0 && (
                  <span className="absolute -right-2 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </div>
              {t("mobile.cart")}
            </Link>

            <div className="my-2 border-t border-border" />

            {/* User section */}
            {user ? (
              <>
                <div className="flex items-center gap-3 rounded-xl bg-secondary/50 px-4 py-3">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                >
                  <User className="size-4" /> {t("nav.myaccount")}
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                  >
                    <LayoutDashboard className="size-4" /> {t("nav.admindash")}
                  </Link>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                  }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition hover:bg-secondary"
                >
                  <LogOut className="size-4" /> {t("nav.signout")}
                </button>
              </>
            ) : (
              <Link
                to="/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary transition hover:bg-primary/20"
              >
                <LogIn className="size-4" /> {t("nav.signin")}
              </Link>
            )}

            {/* Footer actions */}
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <button
                onClick={() => {
                  toggle();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button
                onClick={() => {
                  setLang(lang === "ar" ? "en" : "ar");
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground"
              >
                <Languages className="size-4" />
                {lang === "ar" ? "English" : "العربية"}
              </button>
            </div>
          </nav>
        </DrawerContent>
      </Drawer>
    </>
  );
}
