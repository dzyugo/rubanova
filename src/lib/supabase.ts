import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? "https://zwubytfejkuniggsqckv.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dWJ5dGZlamt1bmlnZ3NxY2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMDIxODMsImV4cCI6MjA5MjY3ODE4M30.8r3h0QWK9cwa-ghQuk83Cm52Gmp6C-l1mpBuQxvUY5Y";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
