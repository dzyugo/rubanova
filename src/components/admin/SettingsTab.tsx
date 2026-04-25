function SettingsTab() {
  const settings = useSite((s) => s.settings);
  const update = useSite((s) => s.update);
  const reset = useSite((s) => s.reset);
  const [draft, setDraft] = useState(settings);

  useEffect(() => setDraft(settings), [settings]);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    update(draft);
    alert("Site settings saved.");
  };

  const set = <K extends keyof typeof draft>(k: K, v: (typeof draft)[K]) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <form onSubmit={onSave} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Panel title="Brand" subtitle="The name, tagline and logo shown across the site.">
          <Input label="Shop name" value={draft.name} onChange={(v) => set("name", v)} />
          <Input label="Tagline" value={draft.tagline} onChange={(v) => set("tagline", v)} />
          <ImageField
            label="Logo"
            value={draft.logoUrl}
            onChange={(v) => set("logoUrl", v)}
            placeholder="Paste a URL or upload a file"
            previewClass="h-12 w-auto"
            maxSizeMB={1}
          />
        </Panel>

        <Panel title="Contact information" subtitle="Visible in the footer and on the contact page.">
          <Input label="Contact email" type="email" value={draft.contactEmail} onChange={(v) => set("contactEmail", v)} />
          <Input label="Contact phone" value={draft.contactPhone} onChange={(v) => set("contactPhone", v)} />
          <Input label="Address" value={draft.address} onChange={(v) => set("address", v)} />
        </Panel>

        <Panel title="Home page banner" subtitle="The hero block visitors see first.">
          <Input label="Eyebrow text" value={draft.heroEyebrow} onChange={(v) => set("heroEyebrow", v)} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Headline" value={draft.heroTitle} onChange={(v) => set("heroTitle", v)} />
            <Input label="Accent line" value={draft.heroAccent} onChange={(v) => set("heroAccent", v)} />
          </div>
          <Textarea label="Subtitle" value={draft.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} />
          <ImageField
            label="Hero image"
            value={draft.heroImageUrl}
            onChange={(v) => set("heroImageUrl", v)}
            placeholder="Paste a URL or upload a file (leave blank for default)"
            previewClass="aspect-[16/7] w-full rounded-lg object-cover"
            maxSizeMB={3}
          />
        </Panel>

        <Panel title="Footer" subtitle="Appears beneath the brand line in the footer.">
          <Textarea label="Footer note" value={draft.footerNote} onChange={(v) => set("footerNote", v)} />
        </Panel>

        <div className="flex flex-wrap gap-3">
          <button type="submit" className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90">
            Save all settings
          </button>
          <button
            type="button"
            onClick={() => { if (confirm("Reset site settings to defaults?")) reset(); }}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold hover:bg-secondary"
          >
            Reset to defaults
          </button>
        </div>
      </div>

      <aside className="space-y-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="aspect-[4/3] w-full bg-muted">
            <img src={draft.heroImageUrl || "/placeholder.svg"} alt="Hero preview" className="size-full object-cover" />
          </div>
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{draft.heroEyebrow}</p>
            <h3 className="mt-2 font-display text-xl font-bold">{draft.heroTitle} <span className="text-primary">{draft.heroAccent}</span></h3>
            <p className="mt-2 text-xs text-muted-foreground">{draft.heroSubtitle}</p>
          </div>
        </div>
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-sm">
          <h3 className="font-display text-lg font-bold">Live preview</h3>
          <p className="mt-2 text-xs opacity-90">Changes apply instantly across the site after saving.</p>
        </div>
      </aside>
    </form>
  );
}

