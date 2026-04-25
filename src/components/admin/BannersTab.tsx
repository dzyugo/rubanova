function BannersTab() {
  const banners = useBanners((s) => s.banners);
  const addBanner = useBanners((s) => s.addBanner);
  const updateBanner = useBanners((s) => s.updateBanner);
  const removeBanner = useBanners((s) => s.removeBanner);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Banners & Visuals</h2>
          <p className="text-sm text-muted-foreground">Manage Hero banners displayed on the home page.</p>
        </div>
        <button
          onClick={() => addBanner({ title: "New Banner", imageUrl: "", link: "/shop", location: "Hero", order: banners.length, status: "Active" })}
          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" /> Add Banner
        </button>
      </div>

      <div className="grid gap-6">
        {banners.map((b) => (
          <div key={b.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <Input label="Title" value={b.title} onChange={(v) => updateBanner(b.id, { title: v })} />
                <Input label="Link URL" value={b.link} onChange={(v) => updateBanner(b.id, { link: v })} />
                <ImageField
                  label="Banner Image"
                  value={b.imageUrl}
                  onChange={(v) => updateBanner(b.id, { imageUrl: v })}
                  placeholder="Paste image URL or upload"
                  previewClass="h-20 w-auto rounded object-cover"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={b.status === "Active"}
                    onChange={(e) => updateBanner(b.id, { status: e.target.checked ? "Active" : "Inactive" })}
                    className="size-4 accent-primary"
                  />
                  Active
                </label>
                <button
                  onClick={() => { if (confirm("Remove this banner?")) removeBanner(b.id); }}
                  className="mt-4 rounded-full border border-destructive/20 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-3 inline mr-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No banners defined.
          </div>
        )}
      </div>
    </div>
  );
}

