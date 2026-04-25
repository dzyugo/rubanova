import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { CartItem } from "./cart";

export type Address = {
  id: string;
  label: string;
  fullName: string;
  street: string;
  city: string;
  zip: string;
  isDefault?: boolean;
};

export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

export type Order = {
  id: string;
  createdAt: number;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingMethod: "express" | "standard";
  paymentMethod: "card" | "paypal";
  address: Omit<Address, "id" | "label" | "isDefault">;
  status: OrderStatus;
};

type OrdersState = {
  orders: Order[];
  addresses: Address[];
  loading: boolean;
  init: () => Promise<void>;
  addOrder: (o: Omit<Order, "id" | "createdAt" | "status">) => Promise<Order>;
  setStatus: (id: string, status: OrderStatus) => void;
  addAddress: (a: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
};

function makeOrderId() {
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const yymm = new Date().toISOString().slice(2, 7).replace("-", "");
  return `RN-${yymm}-${rand}`;
}

export const useOrders = create<OrdersState>()((set, get) => ({
  orders: [],
  addresses: [],
  loading: true,

  init: async () => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) { set({ loading: false }); return; }

    const [{ data: ords }, { data: addrs }] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("addresses").select("*").eq("user_id", userId),
    ]);

    set({
      orders: (ords ?? []).map((o) => ({
        id: o.id,
        createdAt: new Date(o.created_at).getTime(),
        items: (o.items ?? []) as CartItem[],
        subtotal: Number(o.subtotal),
        shipping: Number(o.shipping),
        tax: Number(o.tax),
        total: Number(o.total),
        shippingMethod: o.shipping_method as "express" | "standard",
        paymentMethod: o.payment_method as "card" | "paypal",
        address: (o.address ?? {}) as Order["address"],
        status: o.status as OrderStatus,
      })),
      addresses: (addrs ?? []).map((a) => ({
        id: a.id,
        label: a.label,
        fullName: a.full_name,
        street: a.street,
        city: a.city,
        zip: a.zip,
        isDefault: a.is_default,
      })),
      loading: false,
    });
  },

  addOrder: async (o) => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const order: Order = { ...o, id: makeOrderId(), createdAt: Date.now(), status: "Processing" };
    set((s) => ({ orders: [order, ...s.orders] }));

    if (userId) {
      await supabase.from("orders").insert({
        id: order.id,
        user_id: userId,
        items: order.items as unknown as Record<string, unknown>[],
        subtotal: order.subtotal,
        shipping: order.shipping,
        tax: order.tax,
        total: order.total,
        shipping_method: order.shippingMethod,
        payment_method: order.paymentMethod,
        address: order.address as unknown as Record<string, unknown>,
        status: order.status,
      });
    }
    return order;
  },

  setStatus: (id, status) => {
    set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
    supabase.from("orders").update({ status }).eq("id", id).then();
  },

  addAddress: (a) => {
    const id = `addr-${Math.random().toString(36).slice(2, 8)}`;
    set((s) => {
      const next = [...s.addresses, { ...a, id }];
      if (a.isDefault) return { addresses: next.map((x) => ({ ...x, isDefault: x.id === id })) };
      return { addresses: next };
    });
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("addresses").insert({
        id, user_id: data.user.id, label: a.label,
        full_name: a.fullName, street: a.street, city: a.city, zip: a.zip,
        is_default: a.isDefault ?? false,
      }).then();
    });
  },

  removeAddress: (id) => {
    set((s) => ({ addresses: s.addresses.filter((a) => a.id !== id) }));
    supabase.from("addresses").delete().eq("id", id).then();
  },

  setDefaultAddress: (id) => {
    set((s) => ({ addresses: s.addresses.map((a) => ({ ...a, isDefault: a.id === id })) }));
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase.from("addresses").update({ is_default: false }).eq("user_id", data.user.id).then(() => {
        supabase.from("addresses").update({ is_default: true }).eq("id", id).then();
      });
    });
  },
}));
