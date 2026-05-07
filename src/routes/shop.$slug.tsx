import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Minus, Plus, ShoppingBag, Leaf, Truck, Droplet, ChevronRight, Star, CheckCircle, ChevronLeft } from "lucide-react";
import { useCart } from "@/store/cart";
import { useMergedProducts } from "@/store/catalog";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";
import { parseProductImages, primaryProductImage } from "@/lib/product-images";
import { useReviews } from "@/store/reviews";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/shop/$slug")({
  head: ({ params }) => ({
    meta: [
      {
        title: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Ruba`,
      },
      {
        property: "og:title",
        content: `${params.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())} — Ruba`,
      },
    ],
  }),
  component: ProductPage,
  notFoundComponent: NotFoundProduct,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-bold">Something went wrong</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

function NotFoundProduct() {
  const { t } = useT();
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="font-display text-4xl font-bold">{t("product.notfound")}</h1>
      <Link to="/shop" className="mt-6 inline-block text-primary hover:underline">
        {t("product.backshop")}
      </Link>
    </div>
  );
}

function ProductPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const products = useMergedProducts();
  const product = products.find((p) => p.slug === slug);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const add = useCart((s) => s.add);
  const { t } = useT();

  if (!product) {
    if (products.length === 0) {
      return (
        <section className="flex min-h-[40vh] items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </section>
      );
    }
    throw notFound();
  }

  const images = parseProductImages(product.image);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 overflow-hidden">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
        <Link to="/" className="hover:text-primary">Home</Link>
        <ChevronRight className="size-3 shrink-0" />
        <Link to="/shop" className="hover:text-primary">Shop</Link>
        <ChevronRight className="size-3 shrink-0" />
        <span className="hover:text-primary cursor-default">{product.category}</span>
        <ChevronRight className="size-3 shrink-0" />
        <span className="truncate text-foreground">{product.name}</span>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-12">
        {/* Image Gallery */}
        <div className="flex flex-col-reverse gap-4 lg:flex-row lg:items-start lg:gap-6">
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto lg:flex-col lg:w-24 lg:shrink-0 hide-scrollbar">
              {images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square w-20 lg:w-full shrink-0 overflow-hidden rounded-xl border-2 transition-all ${i === activeImage ? "border-primary opacity-100" : "border-transparent opacity-50 hover:opacity-100"}`}
                >
                  <img src={src} alt="" className="size-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1 overflow-hidden rounded-2xl bg-card shadow-sm sm:rounded-3xl border border-border">
            <img
              src={images[activeImage] || images[0]}
              alt={product.name}
              className="aspect-square w-full object-cover img-reveal"
              key={activeImage}
            />
          </div>
        </div>

        {/* Info */}
        <div className="pt-2">
          {product.is_featured && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-primary/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              <Star className="size-3 fill-primary" /> Best Seller
            </div>
          )}

          <h1 className="font-display text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl">
            {product.name}
          </h1>

          <ReviewSummaryBadge productSlug={product.slug} />

          <p className="mt-6 text-sm text-foreground/80 leading-relaxed sm:text-base max-w-md">
            {product.description}
          </p>

          <hr className="my-8 border-border" />

          {/* Size */}
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Size</p>
            <div className="mt-3 flex gap-3">
              <span className="rounded-lg border border-primary bg-primary/5 px-6 py-2.5 text-sm font-semibold text-primary">
                {product.unit}
              </span>
            </div>
          </div>

          <div className="mt-8">
            <span className="font-display text-3xl font-bold text-foreground sm:text-4xl">
              {(product.price || 0).toFixed(2)} DA
            </span>
          </div>
          
          {product.stock !== undefined && (
            <div className="mt-3">
              {product.stock === 0 ? (
                <span className="text-sm font-semibold text-destructive">
                  Out of Stock
                </span>
              ) : product.stock < 10 ? (
                <span className="text-sm font-semibold text-amber-500">
                  Only {product.stock} left in stock
                </span>
              ) : null}
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <p className="text-sm font-semibold text-muted-foreground">Quantity</p>
              <div className="flex items-center gap-4 rounded-full border border-border px-4 py-2">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Decrease"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Increase"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                onClick={() => {
                  add(product, qty);
                  toast.success(`${product.name} ×${qty} — Added to cart`);
                }}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-4 text-sm font-bold text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"} <ShoppingBag className="size-4" />
              </button>
              <button
                onClick={() => {
                  add(product, qty);
                  navigate({ to: "/checkout" });
                }}
                disabled={product.stock === 0}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card py-4 text-sm font-bold text-foreground transition hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Trust features list */}
          <div className="mt-10 grid grid-cols-1 gap-4 border-t border-border pt-8 sm:grid-cols-3">
            {[
              { icon: Truck, title: "Fast Delivery", sub: "Within 24-48h" },
              { icon: Droplet, title: "Fresh & Delicious", sub: "Sealed for freshness" },
              { icon: Leaf, title: "100% Natural", sub: "No additives ever" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-primary bg-card shadow-sm">
                  <f.icon className="size-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">{f.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{f.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <ReviewSection productSlug={product.slug} />

      <RelatedProductsCarousel currentCategory={product.category} currentSlug={product.slug} />
    </section>
  );
}

function ReviewSummaryBadge({ productSlug }: { productSlug: string }) {
  const { reviews, fetchReviews } = useReviews();
  const productReviews = reviews[productSlug];

  useEffect(() => {
    fetchReviews(productSlug);
  }, [productSlug, fetchReviews]);

  if (!productReviews || productReviews.length === 0) {
    return (
      <div className="mt-3 flex items-center gap-3">
        <div className="flex items-center text-primary/40">
          <Star className="size-4 fill-primary/40" />
          <Star className="size-4 fill-primary/40" />
          <Star className="size-4 fill-primary/40" />
          <Star className="size-4 fill-primary/40" />
          <Star className="size-4 fill-primary/40" />
        </div>
        <span className="text-sm text-muted-foreground">(0) reviews</span>
      </div>
    );
  }

  const averageRating = (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1);

  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="flex items-center text-primary">
        {[1, 2, 3, 4, 5].map(star => (
          <Star key={star} className={`size-4 ${star <= Math.round(Number(averageRating)) ? "fill-primary" : "fill-primary/30 text-primary/30"}`} />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({productReviews.length}) reviews</span>
    </div>
  );
}

function ReviewSection({ productSlug }: { productSlug: string }) {
  const { reviews, loading, fetchReviews, addReview } = useReviews();
  const productReviews = reviews[productSlug] || [];
  const isLoading = loading[productSlug];
  
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews(productSlug);
  }, [productSlug, fetchReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;
    setSubmitting(true);
    const res = await addReview({ 
      product_slug: productSlug, 
      author_name: authorName, 
      rating, 
      content, 
      is_verified: true 
    });
    setSubmitting(false);
    if (res.ok) {
      setShowForm(false);
      setAuthorName("");
      setContent("");
      setRating(5);
    }
  };

  const averageRating = productReviews.length > 0 
    ? (productReviews.reduce((acc, r) => acc + r.rating, 0) / productReviews.length).toFixed(1)
    : "5.0";

  return (
    <section className="mt-16 sm:mt-24">
      <div className="flex flex-col items-start gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Customer Reviews</h2>
          {productReviews.length > 0 && (
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-primary tracking-widest text-base">
                {[1, 2, 3, 4, 5].map(star => (
                  <span key={star} className={star <= Math.round(Number(averageRating)) ? "text-primary" : "text-primary/30"}>★</span>
                ))}
              </span>
              <span className="text-foreground">{averageRating} out of 5</span>
              <span>({productReviews.length})</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold transition hover:bg-secondary"
        >
          {showForm ? "Cancel Review" : "Write a Review"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-8 rounded-2xl bg-card border border-border p-6 shadow-sm">
          <h3 className="font-display text-xl font-bold mb-6">Write your review</h3>
          <div className="space-y-4 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star className={`size-6 ${star <= rating ? "fill-primary text-primary" : "text-primary/30"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Review</label>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What did you like about this product?"
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      )}

      {isLoading && productReviews.length === 0 ? (
        <div className="mt-12 flex justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : productReviews.length === 0 && !showForm ? (
        <div className="mt-12 text-center text-muted-foreground">
          No reviews yet. Be the first to review this product!
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {productReviews.map((review) => (
            <div key={review.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 overflow-hidden rounded-full bg-secondary border border-border grid place-items-center font-bold text-muted-foreground">
                    {review.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                      {review.author_name} 
                      {review.is_verified && <CheckCircle className="size-3.5 text-primary" />}
                    </p>
                    <p className="flex text-[10px] tracking-widest mt-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} className={star <= review.rating ? "text-primary" : "text-primary/30"}>★</span>
                      ))}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
                </span>
              </div>
              <p className="mt-5 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {review.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function RelatedProductsCarousel({ currentCategory, currentSlug }: { currentCategory: string, currentSlug: string }) {
  const products = useMergedProducts();
  const related = products
    .filter((p) => p.category === currentCategory && p.slug !== currentSlug);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  if (related.length === 0) return null;

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' });
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' });

  return (
    <section className="mt-16 border-t border-border pt-16 sm:mt-24">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-bold sm:text-3xl">
          You May Also Like
        </h2>
        <div className="hidden items-center gap-2 sm:flex">
            <button 
              onClick={scrollLeft}
              className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button 
              onClick={scrollRight}
              className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              <ChevronRight className="size-5" />
            </button>
        </div>
      </div>
      
      <div 
        ref={scrollRef}
        className="mt-8 flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory hide-scrollbar pb-4"
      >
        {related.map((p) => (
          <Link 
            key={p.slug} 
            to="/shop/$slug" 
            params={{ slug: p.slug }} 
            className="group block w-[260px] sm:w-[280px] lg:w-[320px] shrink-0 snap-start"
          >
            <div className="overflow-hidden rounded-2xl bg-card border border-border shadow-sm h-full flex flex-col">
              <img
                src={primaryProductImage(p.image)}
                alt={p.name}
                className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105"
                loading="lazy"
              />
              <div className="p-4 sm:p-5 flex flex-col flex-1">
                <h3 className="font-display text-base font-bold text-foreground sm:text-lg truncate">{p.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{p.unit}</p>
                <div className="mt-auto pt-4">
                  <p className="text-sm font-bold text-foreground">
                    {(p.price || 0).toFixed(2)} DA
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
