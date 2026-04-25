import { create } from "zustand";
import { supabase } from "@/lib/supabase";

export type ShippingCompany = {
  id: string;
  name: string;
  defaultDeskRate: number;
  defaultHomeRate: number;
  rates: Record<string, { desk: number; home: number }>; // Wilaya code -> rates
  active: boolean;
};

const LOCAL_KEY = "rubanova-shipping";

function loadLocal(): ShippingCompany[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* empty */ }
  // Default companies if nothing saved
  return [
    {
      id: "yalidine",
      name: "Yalidine Express",
      defaultDeskRate: 400,
      defaultHomeRate: 600,
      rates: {
        "16 - Alger": { desk: 300, home: 400 },
        "09 - Blida": { desk: 350, home: 450 },
      },
      active: true,
    },
    {
      id: "zre",
      name: "ZR Express",
      defaultDeskRate: 350,
      defaultHomeRate: 500,
      rates: {},
      active: true,
    }
  ];
}

function saveLocal(companies: ShippingCompany[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(companies));
}

type ShippingState = {
  companies: ShippingCompany[];
  loading: boolean;
  init: () => Promise<void>;
  addCompany: (name: string, deskRate: number, homeRate: number) => void;
  updateCompany: (id: string, patch: Partial<ShippingCompany>) => void;
  removeCompany: (id: string) => void;
  updateRate: (companyId: string, wilaya: string, desk: number, home: number) => void;
};

export const useShipping = create<ShippingState>()((set, get) => ({
  companies: loadLocal(),
  loading: true,

  init: async () => {
    const { data, error } = await supabase.from("shipping_companies").select("*");
    if (!error && data && data.length > 0) {
      const companies: ShippingCompany[] = data.map((c) => ({
        id: c.id,
        name: c.name,
        defaultDeskRate: Number(c.default_desk_rate ?? 400),
        defaultHomeRate: Number(c.default_home_rate ?? 600),
        rates: (c.rates ?? {}) as Record<string, { desk: number; home: number }>,
        active: c.active ?? true,
      }));
      saveLocal(companies);
      set({ companies, loading: false });
    } else {
      set({ loading: false });
    }
  },

  addCompany: (name, deskRate, homeRate) => {
    const id = Math.random().toString(36).substring(2, 8);
    set((s) => {
      const next = [
        ...s.companies,
        { id, name, defaultDeskRate: deskRate, defaultHomeRate: homeRate, rates: {}, active: true },
      ];
      saveLocal(next);
      return { companies: next };
    });
    supabase.from("shipping_companies").insert({
      id, name, default_desk_rate: deskRate, default_home_rate: homeRate, rates: {}, active: true,
    }).then();
  },

  updateCompany: (id, patch) => {
    set((s) => {
      const next = s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c));
      saveLocal(next);
      return { companies: next };
    });
    const dbPatch: Record<string, unknown> = {};
    if (patch.name !== undefined) dbPatch.name = patch.name;
    if (patch.defaultDeskRate !== undefined) dbPatch.default_desk_rate = patch.defaultDeskRate;
    if (patch.defaultHomeRate !== undefined) dbPatch.default_home_rate = patch.defaultHomeRate;
    if (patch.active !== undefined) dbPatch.active = patch.active;
    if (patch.rates !== undefined) dbPatch.rates = patch.rates;
    supabase.from("shipping_companies").update(dbPatch).eq("id", id).then();
  },

  removeCompany: (id) => {
    set((s) => {
      const next = s.companies.filter((c) => c.id !== id);
      saveLocal(next);
      return { companies: next };
    });
    supabase.from("shipping_companies").delete().eq("id", id).then();
  },

  updateRate: (companyId, wilaya, desk, home) => {
    set((s) => {
      const next = s.companies.map((c) => {
        if (c.id !== companyId) return c;
        return { ...c, rates: { ...c.rates, [wilaya]: { desk, home } } };
      });
      saveLocal(next);
      return { companies: next };
    });
    // Sync full rates object to Supabase
    const company = get().companies.find((c) => c.id === companyId);
    if (company) {
      supabase.from("shipping_companies").update({ rates: company.rates }).eq("id", companyId).then();
    }
  },
}));
