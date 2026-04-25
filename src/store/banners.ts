import { create } from "zustand";
import { reportError } from "@/lib/observability";
import { supabase } from "@/lib/supabase";

export type Banner = {
  id: string;
  title: string;
  imageUrl: string;
  link: string;
  location: "Hero";
  order: number;
  status: "Active" | "Inactive";
};

const LOCAL_KEY = "rubanova-banners";

function loadLocal(): Banner[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocal(banners: Banner[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(banners));
}

type BannersState = {
  banners: Banner[];
  loading: boolean;
  init: () => Promise<void>;
  addBanner: (banner: Omit<Banner, "id">) => void;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  removeBanner: (id: string) => void;
};

export const useBanners = create<BannersState>()((set, get) => ({
  banners: loadLocal(),
  loading: true,

  init: async () => {
    const { data, error } = await supabase.from("banners").select("*").order("order");
    if (!error && data && data.length > 0) {
      const banners: Banner[] = data.map((b) => ({
        id: b.id,
        title: b.title,
        imageUrl: b.image_url ?? b.imageUrl ?? "",
        link: b.link ?? "/shop",
        location: "Hero" as const,
        order: b.order ?? 0,
        status: b.status === "Inactive" ? "Inactive" : "Active",
      }));
      saveLocal(banners);
      set({ banners, loading: false });
    } else {
      // Fallback to localStorage if table doesn't exist or is empty
      set({ loading: false });
    }
  },

  addBanner: (banner) => {
    const id = `b-${Math.random().toString(36).substring(2, 8)}`;
    const newBanner = { ...banner, id };
    set((s) => {
      const next = [...s.banners, newBanner];
      saveLocal(next);
      return { banners: next };
    });
    supabase
      .from("banners")
      .insert({
        id,
        title: banner.title,
        image_url: banner.imageUrl,
        link: banner.link,
        order: banner.order,
        status: banner.status,
      })
      .then(({ error }) => {
        if (error) reportError(error, { scope: "banners-store", action: "supabase-operation" });
      });
  },

  updateBanner: (id, patch) => {
    set((s) => {
      const next = s.banners.map((b) => (b.id === id ? { ...b, ...patch } : b));
      saveLocal(next);
      return { banners: next };
    });
    const dbPatch: Record<string, unknown> = {};
    if (patch.title !== undefined) dbPatch.title = patch.title;
    if (patch.imageUrl !== undefined) dbPatch.image_url = patch.imageUrl;
    if (patch.link !== undefined) dbPatch.link = patch.link;
    if (patch.order !== undefined) dbPatch.order = patch.order;
    if (patch.status !== undefined) dbPatch.status = patch.status;
    supabase
      .from("banners")
      .update(dbPatch)
      .eq("id", id)
      .then(({ error }) => {
        if (error) reportError(error, { scope: "banners-store", action: "supabase-operation" });
      });
  },

  removeBanner: (id) => {
    set((s) => {
      const next = s.banners.filter((b) => b.id !== id);
      saveLocal(next);
      return { banners: next };
    });
    supabase
      .from("banners")
      .delete()
      .eq("id", id)
      .then(({ error }) => {
        if (error) reportError(error, { scope: "banners-store", action: "supabase-operation" });
      });
  },
}));
