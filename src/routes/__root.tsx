import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { useEffect } from "react";
import { useAuth } from "@/store/auth";
import { useCatalog } from "@/store/catalog";
import { useSite } from "@/store/site";
import { useOrders } from "@/store/orders";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Ruba Nova — Verdant Vitality for Your Soul" },
      { name: "description", content: "Sustainably grown organic produce, cold-pressed juices, whole grains and superfoods. Curated with care, delivered fresh." },
      { name: "author", content: "Ruba Nova" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#38B673" },
      { property: "og:title", content: "Ruba Nova — Verdant Vitality for Your Soul" },
      { name: "twitter:title", content: "Ruba Nova — Verdant Vitality for Your Soul" },
      { property: "og:description", content: "Sustainably grown organic produce, cold-pressed juices, whole grains and superfoods. Curated with care, delivered fresh." },
      { name: "twitter:description", content: "Sustainably grown organic produce, cold-pressed juices, whole grains and superfoods. Curated with care, delivered fresh." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c83fe989-0dc6-4c65-bb3d-977a3d79c120/id-preview-da788fa8--9ab593c1-b7de-4c6d-905a-7ee6290e4fcb.lovable.app-1777110501227.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c83fe989-0dc6-4c65-bb3d-977a3d79c120/id-preview-da788fa8--9ab593c1-b7de-4c6d-905a-7ee6290e4fcb.lovable.app-1777110501227.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Work+Sans:wght@400;500;600&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const initAuth = useAuth((s) => s.init);
  const initCatalog = useCatalog((s) => s.init);
  const initSite = useSite((s) => s.init);
  const initOrders = useOrders((s) => s.init);

  useEffect(() => {
    initAuth();
    initCatalog();
    initSite();
    initOrders();
  }, [initAuth, initCatalog, initSite, initOrders]);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}
