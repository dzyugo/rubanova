import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { reportError } from "@/lib/observability";

export type Review = {
  id: string;
  product_slug: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
  is_verified: boolean;
};

type ReviewsState = {
  reviews: Record<string, Review[]>;
  loading: Record<string, boolean>;
  fetchReviews: (slug: string) => Promise<void>;
  addReview: (review: Omit<Review, "id" | "created_at">) => Promise<{ ok: boolean }>;
};

const fallbackReviews: Record<string, Review[]> = {
  "organic-lacinato-kale": [
    {
      id: "1",
      product_slug: "organic-lacinato-kale",
      author_name: "Sara M.",
      rating: 5,
      content: "The freshest kale I've ever bought! Perfect for my morning smoothies.",
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      is_verified: true,
    },
    {
      id: "2",
      product_slug: "organic-lacinato-kale",
      author_name: "Amine B.",
      rating: 5,
      content: "Great quality, will definitely buy again.",
      created_at: new Date(Date.now() - 7 * 86400000).toISOString(),
      is_verified: true,
    },
  ],
};

export const useReviews = create<ReviewsState>()((set, get) => ({
  reviews: {},
  loading: {},

  fetchReviews: async (slug: string) => {
    if (get().loading[slug] || get().reviews[slug]) return;

    set((s) => ({ loading: { ...s.loading, [slug]: true } }));

    if (!isSupabaseConfigured) {
      setTimeout(() => {
        set((s) => ({
          reviews: { ...s.reviews, [slug]: fallbackReviews[slug] || [] },
          loading: { ...s.loading, [slug]: false },
        }));
      }, 500);
      return;
    }

    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_slug", slug)
      .order("created_at", { ascending: false });

    if (error) {
      reportError(error, { scope: "reviews-store", action: "fetchReviews" });
      set((s) => ({
        loading: { ...s.loading, [slug]: false },
        reviews: { ...s.reviews, [slug]: [] },
      }));
      return;
    }

    set((s) => ({
      loading: { ...s.loading, [slug]: false },
      reviews: { ...s.reviews, [slug]: data as Review[] },
    }));
  },

  addReview: async (review) => {
    const newReview = {
      ...review,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    // Optimistic update
    const prevReviews = get().reviews[review.product_slug] || [];
    set((s) => ({
      reviews: {
        ...s.reviews,
        [review.product_slug]: [newReview, ...prevReviews],
      },
    }));

    if (!isSupabaseConfigured) {
      toast.success("Review submitted!");
      return { ok: true };
    }

    const { error } = await supabase.from("reviews").insert({
      id: newReview.id,
      product_slug: newReview.product_slug,
      author_name: newReview.author_name,
      rating: newReview.rating,
      content: newReview.content,
      created_at: newReview.created_at,
      is_verified: newReview.is_verified,
    });

    if (error) {
      reportError(error, { scope: "reviews-store", action: "addReview" });
      set((s) => ({
        reviews: {
          ...s.reviews,
          [review.product_slug]: prevReviews,
        },
      }));
      toast.error("Failed to submit review.");
      return { ok: false };
    }

    toast.success("Review submitted successfully!");
    return { ok: true };
  },
}));
