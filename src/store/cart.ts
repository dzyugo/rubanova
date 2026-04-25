import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/data/products";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  count: () => number;
  subtotal: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (p, qty = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.slug === p.slug);
          if (existing) {
            return { items: state.items.map((i) => (i.slug === p.slug ? { ...i, qty: i.qty + qty } : i)) };
          }
          return {
            items: [...state.items, { slug: p.slug, name: p.name, price: p.price, unit: p.unit, image: p.image, qty }],
          };
        }),
      remove: (slug) => set((state) => ({ items: state.items.filter((i) => i.slug !== slug) })),
      setQty: (slug, qty) =>
        set((state) => ({
          items: qty <= 0
            ? state.items.filter((i) => i.slug !== slug)
            : state.items.map((i) => (i.slug === slug ? { ...i, qty } : i)),
        })),
      clear: () => set({ items: [] }),
      count: () => get().items.reduce((n, i) => n + i.qty, 0),
      subtotal: () => get().items.reduce((s, i) => s + i.qty * i.price, 0),
    }),
    { name: "rubanova-cart" }
  )
);
