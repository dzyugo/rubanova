export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          role: "admin" | "shopper";
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email?: string;
          role?: "admin" | "shopper";
          created_at?: string;
        };
        Update: {
          name?: string;
          email?: string;
          role?: "admin" | "shopper";
        };
        Relationships: [];
      };
      products: {
        Row: {
          slug: string;
          name: string;
          tagline: string;
          description: string;
          price: number;
          unit: string;
          image: string;
          category: string;
          badges: string[];
          nutrition: Json;
          is_featured: boolean;
          stock: number;
          sort_order: number;
        };
        Insert: {
          slug: string;
          name: string;
          tagline: string;
          description: string;
          price: number;
          unit: string;
          image: string;
          category: string;
          badges?: string[];
          nutrition?: Json;
          is_featured?: boolean;
          stock?: number;
          sort_order?: number;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      categories: {
        Row: { id: number; name: string; sort_order: number };
        Insert: { name: string; sort_order?: number };
        Update: { name?: string; sort_order?: number };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          items: Json;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
          shipping_method: string;
          payment_method: string;
          address: Json;
          status: string;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id?: string | null;
          items: Json;
          subtotal: number;
          shipping: number;
          tax: number;
          total: number;
          shipping_method: string;
          payment_method: string;
          address: Json;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: [];
      };
      addresses: {
        Row: {
          id: string;
          user_id: string;
          label: string;
          full_name: string;
          street: string;
          city: string;
          zip: string;
          is_default: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          label: string;
          full_name: string;
          street: string;
          city: string;
          zip: string;
          is_default?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["addresses"]["Insert"]>;
        Relationships: [];
      };
      cart_items: {
        Row: { id: number; user_id: string; product_slug: string; qty: number };
        Insert: { user_id: string; product_slug: string; qty: number };
        Update: { qty?: number };
        Relationships: [];
      };
      site_settings: {
        Row: { id: number; settings: Json };
        Insert: { id?: number; settings: Json };
        Update: { settings?: Json };
        Relationships: [];
      };
      banners: {
        Row: {
          id: string;
          title: string;
          image_url: string | null;
          link: string | null;
          order: number | null;
          status: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          title?: string;
          image_url?: string | null;
          link?: string | null;
          order?: number | null;
          status?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["banners"]["Insert"]>;
        Relationships: [];
      };
      shipping_companies: {
        Row: {
          id: string;
          name: string;
          default_desk_rate: number | null;
          default_home_rate: number | null;
          rates: Json | null;
          active: boolean | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          default_desk_rate?: number | null;
          default_home_rate?: number | null;
          rates?: Json | null;
          active?: boolean | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["shipping_companies"]["Insert"]>;
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          message: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          message: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["contact_messages"]["Insert"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          subscribed_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          subscribed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
