import { create } from "zustand";
import { reportError } from "@/lib/observability";
import { supabase } from "@/lib/supabase";

export type SiteSettings = {
  name: string;
  tagline: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  heroEyebrow: string;
  heroTitle: string;
  heroAccent: string;
  heroSubtitle: string;
  heroImageUrl: string;
  footerNote: string;
};

const defaults: SiteSettings = {
  name: "Ruba",
  tagline: "Natural butters made with premium ingredients for a healthier, happier you.",
  logoUrl: "/logo.png",
  contactEmail: "hello@ruba.com",
  contactPhone: "+1 (555) 123-4567",
  address: "Algiers, Algeria",
  heroEyebrow: "100% Natural",
  heroTitle: "Pure Ingredients.",
  heroAccent: "Real Indulgence.",
  heroSubtitle:
    "Ruba natural butters are crafted from the finest nuts, blended to perfection for taste, nutrition, and goodness in every spoon.",
  heroImageUrl: "",
  footerNote: "© 2026 Ruba. All rights reserved.",
};

type SiteState = {
  settings: SiteSettings;
  loading: boolean;
  init: () => Promise<void>;
  update: (patch: Partial<SiteSettings>) => void;
  reset: () => void;
};

export const useSite = create<SiteState>()((set, get) => ({
  settings: defaults,
  loading: true,

  init: async () => {
    const { data } = await supabase.from("site_settings").select("settings").eq("id", 1).single();
    if (data?.settings) {
      set({
        settings: { ...defaults, ...(data.settings as Partial<SiteSettings>) },
        loading: false,
      });
    } else {
      set({ loading: false });
    }
  },

  update: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    const merged = { ...get().settings, ...patch };
    supabase
      .from("site_settings")
      .update({ settings: merged as unknown as Record<string, unknown> })
      .eq("id", 1)
      .then(({ error }) => {
        if (error) reportError(error, { scope: "site-store", action: "supabase-operation" });
      });
  },

  reset: () => {
    set({ settings: defaults });
    supabase
      .from("site_settings")
      .update({ settings: defaults as unknown as Record<string, unknown> })
      .eq("id", 1)
      .then(({ error }) => {
        if (error) reportError(error, { scope: "site-store", action: "supabase-operation" });
      });
  },
}));
