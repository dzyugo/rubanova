import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  location: "Hero";
  order: number;
  status: "Active" | "Inactive";
};

type BannersState = {
  banners: Banner[];
  addBanner: (banner: Omit<Banner, "id">) => void;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  removeBanner: (id: string) => void;
};

const initialBanners: Banner[] = [
  {
    id: "b1",
    title: "Launch Offer: -15%",
    imageUrl: "/images/hero-produce.jpg",
    link: "/shop",
    location: "Hero",
    order: 0,
    status: "Active",
  }
];

export const useBanners = create<BannersState>()(
  persist(
    (set) => ({
      banners: initialBanners,
      addBanner: (banner) =>
        set((s) => ({
          banners: [...s.banners, { ...banner, id: Math.random().toString(36).substring(7) }],
        })),
      updateBanner: (id, patch) =>
        set((s) => ({
          banners: s.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),
      removeBanner: (id) =>
        set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),
    }),
    {
      name: "rubanova-banners",
    }
  )
);
