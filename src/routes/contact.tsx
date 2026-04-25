import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);
  const { t } = useT();

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
              <dd className="mt-1">{t("contact.hours")}</dd>
            </div>
            <div>
              <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">{t("contact.email")}</dt>
              <dd className="mt-1">hello@rubanova.com</dd>
            </div>
            <div>
              <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">{t("contact.call")}</dt>
              <dd className="mt-1">{t("contact.available")}</dd>
            </div>
          </dl>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
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
                  required
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">{t("auth.email")}</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="message">{t("contact.message")}</label>
                <textarea
                  id="message"
                  rows={5}
                  required
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
              >
                {t("contact.send")}
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
