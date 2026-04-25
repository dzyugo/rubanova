import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingCart, ClipboardList } from "lucide-react";
import { useCart } from "@/store/cart";
import { useT } from "@/lib/i18n";

export function MobileNav() {
  const count = useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
  const { t } = useT();

  const navItems = [
    { to: "/", icon: Home, label: t("mobile.home") },
    { to: "/shop", icon: LayoutGrid, label: t("mobile.catalog") },
    { to: "/cart", icon: ShoppingCart, label: t("mobile.cart"), badge: count },
    { to: "/account", icon: ClipboardList, label: t("mobile.orders") },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-border/60 bg-background/95 px-2 py-3 backdrop-blur md:hidden">
      {navItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="relative flex flex-1 flex-col items-center gap-1 rounded-xl text-muted-foreground transition hover:text-foreground [&.active]:text-primary"
          activeProps={{ className: "active" }}
        >
          <item.icon className="size-6" />
          <span className="text-[10px] font-bold">{item.label}</span>
          {item.badge ? (
            <span className="absolute right-1/4 top-0 flex size-4 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {item.badge > 99 ? "99+" : item.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
