import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { useSite } from "@/store/site";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const { t } = useT();

  const settings = useSite((s) => s.settings);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSending(true);
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "");
    const email = String(f.get("email") || "");
    const message = String(f.get("message") || "");

    // Save to Supabase contact_messages table
    await supabase.from("contact_messages").insert({
      name,
      email,
      message,
    }).then(({ error }) => {
      if (error) {
        // Fallback: save to localStorage if table doesn't exist
        const msgs = JSON.parse(localStorage.getItem("rubanova-contact-msgs") || "[]");
        msgs.push({ name, email, message, createdAt: new Date().toISOString() });
        localStorage.setItem("rubanova-contact-msgs", JSON.stringify(msgs));
      }
    });

    setSending(false);
    setSent(true);
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="grid gap-16 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{t("contact.title")}</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">{t("contact.title")}</h1>
          <p className="mt-6 text-lg text-muted-foreground">{t("contact.subtitle")}</p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">{t("contact.visit")}</dt>
              <dd className="mt-1">{settings.address}</dd>
            </div>
            <div>
              <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">{t("contact.email")}</dt>
              <dd className="mt-1">{settings.contactEmail}</dd>
            </div>
            <div>
              <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">{t("contact.call")}</dt>
              <dd className="mt-1">{settings.contactPhone}</dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-border bg-card p-8"
        >
          {sent ? (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center">
              <h3 className="font-display text-2xl">{t("contact.sent")}</h3>
            </div>
          ) : (
            <div className="space-y-5">
              <h2 className="font-display text-xl font-bold">{t("contact.sendmsg")}</h2>
              <div>
                <label className="text-sm font-medium" htmlFor="name">{t("contact.name")}</label>
                <input
                  id="name"
                  name="name"
                  required
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">{t("auth.email")}</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="message">{t("contact.message")}</label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {sending ? "..." : t("contact.send")}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
