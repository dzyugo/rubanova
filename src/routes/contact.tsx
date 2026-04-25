import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="grid gap-16 md:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Get in touch</p>
          <h1 className="mt-3 font-display text-5xl md:text-6xl">Say hello.</h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Questions about an ingredient, a custom order, or a wholesale partnership? We'd love to hear from you.
          </p>

          <dl className="mt-10 space-y-6 text-sm">
            <div>
              <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">Visit</dt>
              <dd className="mt-1">14 Linden Lane<br />Open daily, 8am – 7pm</dd>
            </div>
            <div>
              <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">Email</dt>
              <dd className="mt-1">hello@verdure.shop</dd>
            </div>
            <div>
              <dt className="font-display text-xs uppercase tracking-widest text-muted-foreground">Phone</dt>
              <dd className="mt-1">(555) 014-2233</dd>
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
              <h3 className="font-display text-2xl">Thanks — note received.</h3>
              <p className="mt-2 text-sm text-muted-foreground">We'll get back to you within a day.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium" htmlFor="name">Name</label>
                <input
                  id="name"
                  required
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium" htmlFor="message">Message</label>
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
                Send message
              </button>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
