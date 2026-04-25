import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const missingSupabaseError = new Error(
  "Missing Supabase configuration: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
);

if (!isSupabaseConfigured) {
  console.error("[supabase] Missing configuration. Running in offline mode.", missingSupabaseError);
}

const offlineQueryBuilder: {
  [key: string]: (...args: unknown[]) => unknown;
  then: Promise<{ data: null; error: Error }>["then"];
  catch: Promise<{ data: null; error: Error }>["catch"];
  finally: Promise<{ data: null; error: Error }>["finally"];
} = new Proxy(
  {
    then: Promise.resolve({ data: null, error: missingSupabaseError }).then.bind(
      Promise.resolve({ data: null, error: missingSupabaseError }),
    ),
    catch: Promise.resolve({ data: null, error: missingSupabaseError }).catch.bind(
      Promise.resolve({ data: null, error: missingSupabaseError }),
    ),
    finally: Promise.resolve({ data: null, error: missingSupabaseError }).finally.bind(
      Promise.resolve({ data: null, error: missingSupabaseError }),
    ),
  },
  {
    get(target, prop) {
      if (prop in target) return target[prop as keyof typeof target];
      return () => offlineQueryBuilder;
    },
  },
);

const offlineSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: missingSupabaseError }),
    getUser: async () => ({ data: { user: null }, error: missingSupabaseError }),
    signInWithPassword: async () => ({ data: { session: null, user: null }, error: missingSupabaseError }),
    signUp: async () => ({ data: { session: null, user: null }, error: missingSupabaseError }),
    signOut: async () => ({ error: missingSupabaseError }),
  },
  from: () => offlineQueryBuilder,
} as unknown as SupabaseClient<Database>;

export const supabase = isSupabaseConfigured
  ? createClient<Database>(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : offlineSupabaseClient;
