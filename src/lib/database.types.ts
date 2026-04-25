export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string; role: "admin" | "shopper"; created_at: string };
        Insert: { id: string; name: string; role?: "admin" | "shopper"; created_at?: string };
        Update: { name?: string; role?: "admin" | "shopper" };
      };
      products: {
        Row: {
          slug: string; name: string; tagline: string; description: string;
          price: number; unit: string; image: string; category: string;
          badges: string[]; nutrition: Json; is_featured: boolean; sort_order: number;
        };
        Insert: {
          slug: string; name: string; tagline: string; description: string;
          price: number; unit: string; image: string; category: string;
          badges?: string[]; nutrition?: Json; is_featured?: boolean; sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      categories: {
        Row: { id: number; name: string; sort_order: number };
        Insert: { name: string; sort_order?: number };
        Update: { name?: string; sort_order?: number };
      };
      orders: {
        Row: {
          id: string; user_id: string; items: Json; subtotal: number;
          shipping: number; tax: number; total: number;
          shipping_method: string; payment_method: string;
          address: Json; status: string; created_at: string;
        };
        Insert: {
          id: string; user_id: string; items: Json; subtotal: number;
          shipping: number; tax: number; total: number;
          shipping_method: string; payment_method: string;
          address: Json; status?: string; created_at?: string;
        };
        Update: { status?: string };
      };
      addresses: {
        Row: {
          id: string; user_id: string; label: string; full_name: string;
          street: string; city: string; zip: string; is_default: boolean;
        };
        Insert: {
          id?: string; user_id: string; label: string; full_name: string;
          street: string; city: string; zip: string; is_default?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
      };
      cart_items: {
        Row: { id: number; user_id: string; product_slug: string; qty: number };
        Insert: { user_id: string; product_slug: string; qty: number };
        Update: { qty?: number };
      };
      site_settings: {
        Row: { id: number; settings: Json };
        Insert: { id?: number; settings: Json };
        Update: { settings?: Json };
      };
    };
  };
}
