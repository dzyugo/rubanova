import { Link } from "@tanstack/react-router";
import { Globe, ShoppingBag, Mail, Phone } from "lucide-react";
import { useSite } from "@/store/site";
import { useT } from "@/lib/i18n";

export function SiteFooter() {
  const settings = useSite((s) => s.settings);
  const { t } = useT();
  return (
    <footer className="mt-12 border-t border-border/60 bg-secondary/40 sm:mt-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:flex-row sm:items-start sm:justify-between sm:px-6 sm:py-10">
        <div className="max-w-xs">
          <h3 className="font-display text-lg font-bold text-primary sm:text-xl">
            {settings.name}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            {settings.tagline} {settings.footerNote}
          </p>
          <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
            <p className="flex items-center gap-2">
              <Mail className="size-3" /> {settings.contactEmail}
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-3" /> {settings.contactPhone}
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-xs font-medium uppercase tracking-widest text-muted-foreground sm:gap-6">
          <Link to="/shop" className="hover:text-primary">
            {t("footer.shop")}
          </Link>
          <Link to="/contact" className="hover:text-primary">
            {t("footer.contact")}
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/60 px-4 py-4 text-center text-[11px] uppercase tracking-widest text-muted-foreground sm:px-6 sm:py-5">
        © {new Date().getFullYear()} {settings.name}. {settings.tagline}
      </div>
    </footer>
  );
}
