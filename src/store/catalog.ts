import { create } from "zustand";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { toast } from "sonner";
import { fallbackProducts, type Product } from "@/data/products";
import { reportError } from "@/lib/observability";

export type ProductOverride = Partial<
  Pick<
    Product,
    | "name"
    | "tagline"
    | "description"
    | "price"
    | "unit"
    | "image"
    | "category"
    | "badges"
    | "nutrition"
    | "stock"
  >
>;

type CatalogState = {
  products: Product[];
  categories: string[];
  loading: boolean;
  init: () => Promise<void>;
  featuredSlugs: string[];
  toggleFeatured: (slug: string) => void;
  isFeatured: (slug: string) => boolean;
  updateProduct: (slug: string, patch: ProductOverride) => void;
  resetProduct: (slug: string) => void;
  addProduct: (product: Omit<Product, "slug"> & { slug?: string }) => void;
  removeProduct: (slug: string) => void;
  addCategory: (name: string) => { ok: boolean; error?: string };
  renameCategory: (oldName: string, newName: string) => { ok: boolean; error?: string };
  removeCategory: (name: string) => { ok: boolean; error?: string };
};

const getFallbackCategories = (products: Product[]) =>
  Array.from(new Set(products.map((product) => product.category)));

export const useCatalog = create<CatalogState>()((set, get) => ({
  products: [],
  categories: [],
  featuredSlugs: [],
  loading: true,

  init: async () => {
    if (!isSupabaseConfigured) {
      set({
        products: fallbackProducts,
        featuredSlugs: fallbackProducts.filter((p) => p.is_featured).map((p) => p.slug),
        categories: getFallbackCategories(fallbackProducts),
        loading: false,
      });
      return;
    }

    const [{ data: prods, error: prodsError }, { data: cats, error: catsError }] = await Promise.all([
      supabase.from("products").select("*").order("sort_order"),
      supabase.from("categories").select("*").order("sort_order"),
    ]);

    if (prodsError || catsError) {
      reportError(prodsError ?? catsError, { scope: "catalog-store", action: "init" });
      set({
        products: fallbackProducts,
        featuredSlugs: fallbackProducts.filter((p) => p.is_featured).map((p) => p.slug),
        categories: getFallbackCategories(fallbackProducts),
        loading: false,
      });
      return;
    }

    const products: Product[] = (prods ?? []).map((p) => ({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      description: p.description,
      price: Number(p.price),
      unit: p.unit,
      image: p.image,
      category: p.category,
      badges: p.badges ?? [],
      nutrition: (p.nutrition ?? {}) as Product["nutrition"],
      is_featured: p.is_featured,
      stock: p.stock ?? 0,
    }));

    set({
      products,
      featuredSlugs: products.filter((p) => p.is_featured).map((p) => p.slug),
      categories: (cats ?? []).map((c) => c.name),
      loading: false,
    });
  },

  toggleFeatured: (slug) => {
    const prevProducts = get().products;
    const prevFeaturedSlugs = get().featuredSlugs;
    const featured = get().featuredSlugs.includes(slug);
    set((s) => ({
      featuredSlugs: featured
        ? s.featuredSlugs.filter((x) => x !== slug)
        : [...s.featuredSlugs, slug],
      products: s.products.map((p) => (p.slug === slug ? { ...p, is_featured: !featured } : p)),
    }));
    supabase
      .from("products")
      .update({ is_featured: !featured })
      .eq("slug", slug)
      .then(({ error }) => {
        if (error) {
          reportError(error, { scope: "catalog-store", action: "supabase-operation" });
          set({ products: prevProducts, featuredSlugs: prevFeaturedSlugs });
          toast.error("Failed to update featured status.");
        }
      });
  },

  isFeatured: (slug) => get().featuredSlugs.includes(slug),

  updateProduct: (slug, patch) => {
    const prevProducts = get().products;
    set((s) => ({
      products: s.products.map((p) => (p.slug === slug ? { ...p, ...patch } : p)),
    }));

    const dbPatch: {
      name?: string;
      tagline?: string;
      description?: string;
      price?: number;
      unit?: string;
      image?: string;
      category?: string;
      badges?: string[];
      nutrition?: Product["nutrition"];
      stock?: number;
    } = {};

    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.tagline !== undefined) dbPatch.tagline = patch.tagline;
    if (patch.description !== undefined) dbPatch.description = patch.description;
    if (patch.price !== undefined) dbPatch.price = patch.price;
    if (patch.unit !== undefined) dbPatch.unit = patch.unit;
    if (patch.image !== undefined) dbPatch.image = patch.image;
    if (patch.category !== undefined) dbPatch.category = patch.category;
    if (patch.badges !== undefined) dbPatch.badges = patch.badges;
    if (patch.nutrition !== undefined) dbPatch.nutrition = patch.nutrition;
    if (patch.stock !== undefined) dbPatch.stock = patch.stock;

    supabase
      .from("products")
      .update(dbPatch)
      .eq("slug", slug)
      .then(({ error }) => {
        if (error) {
          reportError(error, { scope: "catalog-store", action: "supabase-operation" });
          set({ products: prevProducts });
          toast.error("Failed to update product.");
        }
      });
  },

  resetProduct: (slug) => {
    // Re-fetch this product from DB to get original values
    supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .single()
      .then(({ data }) => {
        if (data) {
          set((s) => ({
            products: s.products.map((p) =>
              p.slug === slug
                ? {
                    ...p,
                    name: data.name,
                    tagline: data.tagline,
                    description: data.description,
                    price: Number(data.price),
                    unit: data.unit,
                    image: data.image,
                    category: data.category,
                    stock: data.stock ?? 0,
                  }
                : p,
            ),
          }));
        }
      });
  },

  addProduct: (product) => {
    const slug =
      product.slug ||
      product.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const newProduct = {
      ...product,
      slug,
      is_featured: false,
      badges: product.badges || [],
      nutrition: product.nutrition || { servingSize: "100g", calories: "0" },
      stock: product.stock ?? 0,
    };
    const prevProducts = get().products;
    set((s) => ({ products: [...s.products, newProduct] }));
    // Explicitly map to DB column names to avoid silent insert failures
    supabase
      .from("products")
      .insert({
        slug: newProduct.slug,
        name: newProduct.name,
        tagline: newProduct.tagline,
        description: newProduct.description,
        price: newProduct.price,
        unit: newProduct.unit,
        image: newProduct.image,
        category: newProduct.category,
        badges: newProduct.badges,
        nutrition: newProduct.nutrition,
        is_featured: false,
        stock: newProduct.stock ?? 0,
        sort_order: 9999,
      })
      .then(({ error }) => {
        if (error) {
          reportError(error, { scope: "catalog-store", action: "addProduct" });
          set({ products: prevProducts });
          toast.error("Failed to add product.");
        }
      });
  },

  removeProduct: (slug) => {
    const prevProducts = get().products;
    set((s) => ({ products: s.products.filter((p) => p.slug !== slug) }));
    supabase
      .from("products")
      .delete()
      .eq("slug", slug)
      .then(({ error }) => {
        if (error) {
          reportError(error, { scope: "catalog-store", action: "supabase-operation" });
          set({ products: prevProducts });
          toast.error("Failed to remove product.");
        }
      });
  },

  addCategory: (name) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, error: "Category name is required." };
    if (get().categories.some((c) => c.toLowerCase() === trimmed.toLowerCase()))
      return { ok: false, error: "That category already exists." };
    const prevCategories = get().categories;
    set((s) => ({ categories: [...s.categories, trimmed] }));
    supabase
      .from("categories")
      .insert({ name: trimmed, sort_order: get().categories.length })
      .then(({ error }) => {
        if (error) {
          reportError(error, { scope: "catalog-store", action: "supabase-operation" });
          set({ categories: prevCategories });
          toast.error("Failed to add category.");
        }
      });
    return { ok: true };
  },

  renameCategory: (oldName, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return { ok: false, error: "Category name is required." };
    if (get().categories.some((c) => c.toLowerCase() === trimmed.toLowerCase() && c !== oldName))
      return { ok: false, error: "Another category already uses that name." };
    const prevCategories = get().categories;
    const prevProducts = get().products;
    set((s) => ({
      categories: s.categories.map((c) => (c === oldName ? trimmed : c)),
      products: s.products.map((p) => (p.category === oldName ? { ...p, category: trimmed } : p)),
    }));
    supabase
      .from("categories")
      .update({ name: trimmed })
      .eq("name", oldName)
      .then(({ error }) => {
        if (error) {
          reportError(error, { scope: "catalog-store", action: "supabase-operation" });
          set({ categories: prevCategories, products: prevProducts });
          toast.error("Failed to rename category.");
        } else {
          supabase
            .from("products")
            .update({ category: trimmed })
            .eq("category", oldName)
            .then(({ error }) => {
              if (error) {
                reportError(error, { scope: "catalog-store", action: "supabase-operation" });
                set({ categories: prevCategories, products: prevProducts });
                toast.error("Failed to update product categories.");
              }
            });
        }
      });
    return { ok: true };
  },

  removeCategory: (name) => {
    const used = get().products.some((p) => p.category === name);
    if (used) return { ok: false, error: "Reassign products in this category before removing it." };
    const prevCategories = get().categories;
    set((s) => ({ categories: s.categories.filter((c) => c !== name) }));
    supabase
      .from("categories")
      .delete()
      .eq("name", name)
      .then(({ error }) => {
        if (error) {
          reportError(error, { scope: "catalog-store", action: "supabase-operation" });
          set({ categories: prevCategories });
          toast.error("Failed to remove category.");
        }
      });
    return { ok: true };
  },
}));

/** Hook that returns the full product list from the store. */
export const useMergedProducts = (): Product[] => useCatalog((s) => s.products);
