function CategoriesTab() {
  const categories = useCatalog((s) => s.categories);
  const products = useMergedProducts();
  const addCategory = useCatalog((s) => s.addCategory);
  const renameCategory = useCatalog((s) => s.renameCategory);
  const removeCategory = useCatalog((s) => s.removeCategory);
  const [newName, setNewName] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    for (const p of products) c[p.category] = (c[p.category] ?? 0) + 1;
    return c;
  }, [products]);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = addCategory(newName);
    if (!r.ok) return setError(r.error ?? "Could not add category.");
    setNewName("");
  };

  const onRenameSave = (oldName: string) => {
    setError(null);
    const r = renameCategory(oldName, editValue);
    if (!r.ok) return setError(r.error ?? "Could not rename.");
    setEditing(null); setEditValue("");
  };

  const onRemove = (name: string) => {
    setError(null);
    if (!confirm(`Remove the “${name}” category?`)) return;
    const r = removeCategory(name);
    if (!r.ok) setError(r.error ?? "Could not remove.");
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">Add a category</h2>
        <p className="text-sm text-muted-foreground">New categories appear in the shop sidebar and product editor right away.</p>
        <form onSubmit={onAdd} className="mt-4 flex flex-wrap gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g. Herbs & Spices"
            className="min-w-[220px] flex-1 rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button className="inline-flex items-center gap-1 rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Add
          </button>
        </form>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">All categories</h2>
        <div className="mt-4 overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Products</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c) => (
                <tr key={c}>
                  <td className="px-4 py-3">
                    {editing === c ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") onRenameSave(c); if (e.key === "Escape") setEditing(null); }}
                        className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                      />
                    ) : (
                      <span className="font-semibold">{c}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{counts[c] ?? 0}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {editing === c ? (
                        <>
                          <button onClick={() => onRenameSave(c)} className="rounded-md p-1.5 text-primary hover:bg-secondary" aria-label="Save"><Check className="size-4" /></button>
                          <button onClick={() => setEditing(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Cancel"><X className="size-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setEditing(c); setEditValue(c); }} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Rename"><Pencil className="size-4" /></button>
                          <button onClick={() => onRemove(c)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label="Remove"><Trash2 className="size-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No categories yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

