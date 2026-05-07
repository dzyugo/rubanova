import { createFileRoute, Link } from "@tanstack/react-router";
import { Leaf, Plus, Mail, ChevronRight, Play, ShoppingCart, Star } from "lucide-react";
import { useCart } from "@/store/cart";
import { useCatalog, useMergedProducts } from "@/store/catalog";
import { useSite } from "@/store/site";
import { useBanners } from "@/store/banners";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { primaryProductImage, featuredProductImage } from "@/lib/product-images";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Ruba — Fresh Organic Produce & Natural Goods" },
      {
        name: "description",
        content:
          "Discover premium organic produce and natural goods sourced from trusted Algerian farms. Order online with cash on delivery nationwide.",
      },
      { property: "og:title", content: "Ruba — Fresh Organic Produce & Natural Goods" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const settings = useSite((s) => s.settings);
  const featuredSlugs = useCatalog((s) => s.featuredSlugs);
  const products = useMergedProducts();
  const add = useCart((s) => s.add);
  const loading = useCatalog((s) => s.loading);
  const activeBanners = useBanners((s) => s.banners).filter((b) => b.status === "Active");
  const { t } = useT();

  const featured = products.filter((p) => featuredSlugs.includes(p.slug));
  const displayProducts = featured.length > 0 ? featured : products.slice(0, 5);

  const handleNewsletter = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (new FormData(form).get("email") as string)?.trim();
    if (!email) return;
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email }, { onConflict: "email" });
    if (error) {
      toast.error("Something went wrong. Please try again.");
    } else {
      toast.success(t("home.thanks"));
      form.reset();
    }
  };

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>
        </div>
      </section>
    );
  }

  // Use the first banner image as background, or fallback to heroImageUrl
  const heroBg = activeBanners[0]?.imageUrl || settings.heroImageUrl || "/images/hero-produce.jpg";

  return (
    <>
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden min-h-[500px] sm:min-h-[600px] lg:min-h-[700px] flex items-center border-b border-border/50">
        <div className="absolute inset-0 z-0 animate-fade-in">
          <img
            src={heroBg}
            alt={activeBanners[0]?.title || settings.heroTitle}
            className="size-full object-cover object-center"
            width={1600}
            height={1024}
          />
          <div className="absolute inset-0 bg-background/80 sm:bg-background/60 lg:bg-gradient-to-r lg:from-background lg:via-background/80 lg:to-transparent" />
        </div>
        
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 pt-12 sm:pt-0">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary opacity-0 animate-fade-in-up">
              {settings.heroEyebrow || "100% NATURAL"} <Leaf className="size-3.5 fill-primary" />
            </span>
            
            <h1 className="mt-6 font-display text-4xl leading-tight font-bold sm:text-5xl md:text-6xl lg:text-7xl opacity-0 animate-fade-in-up [animation-delay:150ms]">
              {activeBanners[0] ? (
                activeBanners[0].title
              ) : (
                <>
                  {settings.heroTitle}
                  <br />
                  <span className="text-primary">{settings.heroAccent}</span>
                </>
              )}
            </h1>
            
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-foreground/90 sm:text-base md:text-lg opacity-0 animate-fade-in-up [animation-delay:300ms]">
              {activeBanners[0] ? "" : settings.heroSubtitle}
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4 opacity-0 animate-fade-in-up [animation-delay:450ms]">
              <Link
                to={activeBanners[0]?.link || "/shop"}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                {t("home.shopnow")} <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24 animate-fade-in-up [animation-delay:200ms]">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-border/50 pb-6">
          <h2 className="font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            Featured Products
          </h2>
          <Link to="/shop" className="shrink-0 flex items-center gap-1.5 text-sm font-bold text-primary hover:underline">
            View All Products <ChevronRight className="size-4" />
          </Link>
        </div>

        {displayProducts.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground sm:mt-16 sm:p-12">
            No products available right now.
          </div>
        ) : (
          <div className="mt-8 grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 sm:gap-6">
            {displayProducts.slice(0, 5).map((prod) => (
              <div
                key={prod.slug}
                className="group flex flex-col rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/50"
              >
                <Link
                  to="/shop/$slug"
                  params={{ slug: prod.slug }}
                  className="block overflow-hidden rounded-xl bg-background/50 flex-1 relative"
                >
                  <img
                    src={featuredProductImage(prod.image)}
                    alt={prod.name}
                    className="aspect-[4/5] w-full object-cover mix-blend-normal transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  {prod.stock === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                      <span className="rounded-full bg-destructive px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </Link>
                
                <div className="mt-5 flex flex-col gap-2 flex-1 justify-end">
                  <Link to="/shop/$slug" params={{ slug: prod.slug }} className="block">
                    <h3 className="font-display text-sm font-bold sm:text-base line-clamp-1">{prod.name}</h3>
                  </Link>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex text-primary">
                      <Star className="size-3 fill-primary" />
                      <Star className="size-3 fill-primary" />
                      <Star className="size-3 fill-primary" />
                      <Star className="size-3 fill-primary" />
                      <Star className="size-3 fill-primary" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-muted-foreground">(128)</span>
                  </div>
                  
                  <div className="mt-2 text-base font-bold text-foreground sm:text-lg">
                    {formatPrice(prod.price)}
                  </div>
                  
                  <button
                    onClick={() => {
                      add(prod);
                      toast.success(`${prod.name} — Added to cart`);
                    }}
                    aria-label={`Add ${prod.name} to cart`}
                    disabled={prod.stock === 0}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add to Cart <ShoppingCart className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Newsletter */}
      <section className="border-t border-border/50 bg-card/30 animate-fade-in">
        <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="mx-auto grid size-14 place-items-center rounded-full border border-border bg-background shadow-sm">
            <Mail className="size-6 text-primary" />
          </div>
          <h2 className="mt-6 font-display text-2xl font-bold sm:text-3xl md:text-4xl">
            {t("home.newsletter.title", { name: settings.name })}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">{t("home.newsletter.sub")}</p>
          <form
            onSubmit={handleNewsletter}
            className="mx-auto mt-8 flex flex-col gap-3 sm:flex-row sm:max-w-md"
          >
            <input
               required
               name="email"
               type="email"
               placeholder="Enter your email"
               className="flex-1 rounded-full border border-border bg-background px-6 py-3.5 text-sm focus:border-primary focus:outline-none"
             />
            <button className="rounded-full bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90">
               Subscribe
            </button>
          </form>
        </div>
      </section>
    </>
  );
}

function formatPrice(amount: number) {
  return `${amount.toFixed(2)} DA`;
}
