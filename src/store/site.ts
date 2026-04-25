import { create } from "zustand";
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
  name: "Ruba Nova",
  tagline: "Verdant vitality for your soul.",
  logoUrl: "",
  contactEmail: "hello@rubanova.com",
  contactPhone: "+1 (555) 123-4567",
  address: "742 Greenhouse Lane, Portland OR",
  heroEyebrow: "100% Sustainably Sourced",
  heroTitle: "Verdant Vitality",
  heroAccent: "For Your Soul.",
  heroSubtitle:
    "Experience the rejuvenating power of nature through curated organic produce delivered with transparency and care.",
  heroImageUrl: "",
  footerNote: "Sustainably grown, thoughtfully curated.",
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
      set({ settings: { ...defaults, ...(data.settings as Partial<SiteSettings>) }, loading: false });
    } else {
      set({ loading: false });
    }
  },

  update: (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
    const merged = { ...get().settings, ...patch };
    supabase.from("site_settings").update({ settings: merged as unknown as Record<string, unknown> }).eq("id", 1).then(({ error }) => { if (error) console.error("Supabase error:", error); });
  },

  reset: () => {
    set({ settings: defaults });
    supabase.from("site_settings").update({ settings: defaults as unknown as Record<string, unknown> }).eq("id", 1).then(({ error }) => { if (error) console.error("Supabase error:", error); });
  },
}));
