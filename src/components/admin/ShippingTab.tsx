function ShippingTab() {
  const { companies, addCompany, updateCompany, removeCompany, updateRate } = useShipping();
  const [newCompanyName, setNewCompanyName] = useState("");
  const [deskRate, setDeskRate] = useState(400);
  const [homeRate, setHomeRate] = useState(600);

  const onAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    addCompany(newCompanyName, deskRate, homeRate);
    setNewCompanyName("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-card p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold">Add Shipping Company</h2>
        <form onSubmit={onAdd} className="mt-4 flex flex-wrap items-end gap-3">
          <Input label="Company Name" value={newCompanyName} onChange={setNewCompanyName} />
          <Input label="Default Desk Rate (DA)" type="number" value={String(deskRate)} onChange={(v) => setDeskRate(Number(v))} />
          <Input label="Default Home Rate (DA)" type="number" value={String(homeRate)} onChange={(v) => setHomeRate(Number(v))} />
          <button type="submit" className="mb-0.5 inline-flex items-center gap-1 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90">
            <Plus className="size-4" /> Add
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {companies.map((c) => (
          <div key={c.id} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateCompany(c.id, { name: e.target.value })}
                  className="font-display text-lg font-bold bg-transparent focus:outline-none border-b border-transparent focus:border-border"
                />
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={c.active}
                    onChange={(e) => updateCompany(c.id, { active: e.target.checked })}
                    className="size-4 accent-primary"
                  />
                  Active
                </label>
              </div>
              <button
                onClick={() => { if (confirm("Remove this shipping company?")) removeCompany(c.id); }}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 mb-6">
              <Input label="Default Desk Rate (DA)" type="number" value={String(c.defaultDeskRate)} onChange={(v) => updateCompany(c.id, { defaultDeskRate: Number(v) })} />
              <Input label="Default Home Rate (DA)" type="number" value={String(c.defaultHomeRate)} onChange={(v) => updateCompany(c.id, { defaultHomeRate: Number(v) })} />
            </div>

            <details className="group">
              <summary className="cursor-pointer font-semibold text-primary hover:underline outline-none">Configure Custom Rates per Wilaya</summary>
              <div className="mt-4 max-h-[400px] overflow-y-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-4 py-3 text-left">Wilaya</th>
                      <th className="px-4 py-3 text-left">Desk Delivery (DA)</th>
                      <th className="px-4 py-3 text-left">Home Delivery (DA)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {wilayas.map((w) => {
                      const rate = c.rates[w] || { desk: c.defaultDeskRate, home: c.defaultHomeRate };
                      return (
                        <tr key={w}>
                          <td className="px-4 py-2 font-semibold">{w}</td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={rate.desk}
                              onChange={(e) => updateRate(c.id, w, Number(e.target.value), rate.home)}
                              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input
                              type="number"
                              value={rate.home}
                              onChange={(e) => updateRate(c.id, w, rate.desk, Number(e.target.value))}
                              className="w-24 rounded-md border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        ))}
      </div>
    </div>
