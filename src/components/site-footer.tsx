import { Link } from "@tanstack/react-router";
import { Globe, ShoppingBag, Mail, Phone } from "lucide-react";
import { useSite } from "@/store/site";
import { useT } from "@/lib/i18n";

export function SiteFooter() {
  const settings = useSite((s) => s.settings);
  const { t } = useT();
  return (
    <footer className="mt-16 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-display text-xl font-bold text-primary">{settings.name}</h3>
          <p className="mt-1 max-w-sm text-xs uppercase tracking-widest text-muted-foreground">
            {settings.tagline} {settings.footerNote}
          </p>
          <div className="mt-3 space-y-1 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Mail className="size-3" /> {settings.contactEmail}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-3" /> {settings.contactPhone}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-6 text-xs font-medium uppercase tracking-widest text-muted-foreground">
          <Link to="/shop" className="hover:text-primary">
            {t("footer.shop")}
          </Link>
          <Link to="/about" className="hover:text-primary">
            {t("footer.about")}
          </Link>
          <Link to="/contact" className="hover:text-primary">
            {t("footer.contact")}
          </Link>
        </nav>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Globe className="size-4" />
          <ShoppingBag className="size-4" />
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs uppercase tracking-widest text-muted-foreground">
        © {new Date().getFullYear()} {settings.name}. {settings.tagline}
      </div>
    </footer>
  );
}
