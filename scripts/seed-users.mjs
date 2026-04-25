import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://zwubytfejkuniggsqckv.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3dWJ5dGZlamt1bmlnZ3NxY2t2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzEwMjE4MywiZXhwIjoyMDkyNjc4MTgzfQ.ujydKs2nc71ZSzxBNEEr9RSgcpUItPG0h8tozawkclg",
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function main() {
  // Create admin
  const { data: a, error: e1 } = await supabase.auth.admin.createUser({
    email: "admin@rubanova.com",
    password: "admin123",
    email_confirm: true,
    user_metadata: { name: "Julian Verdant" },
  });
  if (e1) console.error("Admin error:", e1.message);
  else {
    await supabase
      .from("profiles")
      .update({ role: "admin", email: "admin@rubanova.com" })
      .eq("id", a.user.id);
    console.log("✓ Admin created:", a.user.id);
  }

  // Create shopper
  const { data: b, error: e2 } = await supabase.auth.admin.createUser({
    email: "lena@example.com",
    password: "shopper123",
    email_confirm: true,
    user_metadata: { name: "Lena Hart" },
  });
  if (e2) console.error("Shopper error:", e2.message);
  else {
    await supabase.from("profiles").update({ email: "lena@example.com" }).eq("id", b.user.id);
    console.log("✓ Shopper created:", b.user.id);
  }
}

main();
