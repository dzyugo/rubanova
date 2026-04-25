import { create } from "zustand";
import { reportError } from "@/lib/observability";
import { supabase } from "@/lib/supabase";

export type Role = "admin" | "shopper";

export type Account = {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
};

type AuthState = {
  user: Account | null;
  accounts: Account[];
  loading: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateAccount: (id: string, patch: Partial<Pick<Account, "name" | "email" | "role">>) => void;
  removeAccount: (id: string) => void;
  fetchAccounts: () => Promise<void>;
};

export const useAuth = create<AuthState>()((set, get) => ({
  user: null,
  accounts: [],
  loading: true,

  init: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (profile) {
        set({
          user: {
            id: session.user.id,
            name: profile.name,
            email: session.user.email ?? profile.email ?? "",
            role: profile.role as Role,
            createdAt: profile.created_at,
          },
          loading: false,
        });
        return;
      }
    }
    set({ user: null, loading: false });
  },

  login: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, error: error.message };
    await get().init();
    return { ok: true };
  },

  signup: async ({ name, email, password }) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { ok: false, error: error.message };
    await get().init();
    return { ok: true };
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },

  updateAccount: (id, patch) => {
    // Optimistic local update
    set((s) => ({
      accounts: s.accounts.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      user: s.user?.id === id ? { ...s.user, ...patch } : s.user,
    }));
    // Background sync
    const dbPatch: Record<string, string> = {};
    if (patch.name) dbPatch.name = patch.name;
    if (patch.email) dbPatch.email = patch.email;
    if (patch.role) dbPatch.role = patch.role;
    supabase
      .from("profiles")
      .update(dbPatch)
      .eq("id", id)
      .then(({ error }) => {
        if (error) reportError(error, { scope: "auth-store", action: "updateAccount" });
      });
  },

  removeAccount: (id) => {
    set((s) => ({
      accounts: s.accounts.filter((a) => a.id !== id),
      user: s.user?.id === id ? null : s.user,
    }));
  },

  fetchAccounts: async () => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true });
    if (data) {
      set({
        accounts: data.map((p) => ({
          id: p.id,
          name: p.name,
          email: p.email,
          role: p.role as Role,
          createdAt: p.created_at,
        })),
      });
    }
  },
}));

export const selectCurrentUser = (s: AuthState) => s.user;
