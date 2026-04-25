import { create } from "zustand";
import { persist } from "zustand/middleware";
import { wilayas } from "@/data/wilayas";

export type ShippingCompany = {
  id: string;
  name: string;
  defaultDeskRate: number;
  defaultHomeRate: number;
  rates: Record<string, { desk: number; home: number }>; // Wilaya code -> rates
  active: boolean;
};

type ShippingState = {
  companies: ShippingCompany[];
  addCompany: (name: string, deskRate: number, homeRate: number) => void;
  updateCompany: (id: string, patch: Partial<ShippingCompany>) => void;
  removeCompany: (id: string) => void;
  updateRate: (companyId: string, wilaya: string, desk: number, home: number) => void;
};

const initialCompanies: ShippingCompany[] = [
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

export const useShipping = create<ShippingState>()(
  persist(
    (set) => ({
      companies: initialCompanies,
      addCompany: (name, deskRate, homeRate) =>
        set((s) => ({
          companies: [
            ...s.companies,
            { id: Math.random().toString(36).substring(7), name, defaultDeskRate: deskRate, defaultHomeRate: homeRate, rates: {}, active: true },
          ],
        })),
      updateCompany: (id, patch) =>
        set((s) => ({
          companies: s.companies.map((c) => (c.id === id ? { ...c, ...patch } : c)),
        })),
      removeCompany: (id) =>
        set((s) => ({
          companies: s.companies.filter((c) => c.id !== id),
        })),
      updateRate: (companyId, wilaya, desk, home) =>
        set((s) => ({
          companies: s.companies.map((c) => {
            if (c.id !== companyId) return c;
            return {
              ...c,
              rates: {
                ...c.rates,
                [wilaya]: { desk, home },
              },
            };
          }),
        })),
    }),
    {
      name: "rubanova-shipping",
    }
  )
);
