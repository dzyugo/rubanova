function AccountsTab({ currentId }: { currentId: string }) {
  const accounts = useAuth((s) => s.accounts);
  const updateAccount = useAuth((s) => s.updateAccount);
  const removeAccount = useAuth((s) => s.removeAccount);
  const fetchAccounts = useAuth((s) => s.fetchAccounts);
  const [editing, setEditing] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftEmail, setDraftEmail] = useState("");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pendingRole, setPendingRole] = useState<{ id: string; name: string; role: Role } | null>(null);

  useEffect(() => { fetchAccounts(); }, [fetchAccounts]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = accounts;
    if (q) list = list.filter((a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.role.includes(q));
    list = [...list].sort((a, b) => {
      const av = a[sortKey]; const bv = b[sortKey];
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [accounts, query, sortKey, sortDir]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [query, sortKey, sortDir]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(k); setSortDir("asc"); }
  };

  const startEdit = (id: string, name: string, email: string) => {
    setEditing(id); setDraftName(name); setDraftEmail(email);
  };
  const saveEdit = (id: string) => {
    updateAccount(id, { name: draftName, email: draftEmail });
    setEditing(null);
  };

  const SortHeader = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
      {label}
      {sortKey === k && (sortDir === "asc" ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />)}
    </button>
  );

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">Accounts Management</h2>
          <p className="text-sm text-muted-foreground">Promote shoppers to admins, edit profiles, or remove accounts.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1.5 text-sm">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, email, role…"
              className="w-44 bg-transparent text-sm focus:outline-none"
            />
          </div>
          <span className="rounded-full bg-tertiary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">{accounts.length} users</span>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left"><SortHeader k="name" label="User" /></th>
              <th className="px-4 py-3 text-left"><SortHeader k="email" label="Email" /></th>
              <th className="px-4 py-3 text-left"><SortHeader k="role" label="Role" /></th>
              <th className="px-4 py-3 text-left"><SortHeader k="createdAt" label="Joined" /></th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visible.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3">
                  {editing === a.id ? (
                    <input
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="grid size-9 place-items-center rounded-full bg-tertiary text-xs font-bold text-primary">
                        {a.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-semibold">{a.name}</span>
                      {a.id === currentId && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">You</span>}
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editing === a.id ? (
                    <input
                      value={draftEmail}
                      onChange={(e) => setDraftEmail(e.target.value)}
                      className="rounded-md border border-border bg-background px-2 py-1 text-sm"
                    />
                  ) : (
                    <span className="text-muted-foreground">{a.email}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={a.role}
                    onChange={(e) => setPendingRole({ id: a.id, name: a.name, role: e.target.value as Role })}
                    disabled={a.id === currentId}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs disabled:opacity-60"
                  >
                    <option value="shopper">Shopper</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    {editing === a.id ? (
                      <>
                        <button onClick={() => saveEdit(a.id)} className="rounded-md p-1.5 text-primary hover:bg-secondary" aria-label="Save"><Check className="size-4" /></button>
                        <button onClick={() => setEditing(null)} className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary" aria-label="Cancel"><X className="size-4" /></button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(a.id, a.name, a.email)}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (a.id === currentId) return alert("You can't delete your own account here.");
                            if (confirm(`Delete account for ${a.name}? This can't be undone.`)) removeAccount(a.id);
                          }}
                          disabled={a.id === currentId}
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-40"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No accounts match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>Showing {visible.length} of {filtered.length} accounts</span>
        {pageCount > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="rounded-md border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary"
            >Prev</button>
            <span className="px-2">Page {safePage} of {pageCount}</span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={safePage === pageCount}
              className="rounded-md border border-border px-3 py-1 disabled:opacity-40 hover:bg-secondary"
            >Next</button>
          </div>
        )}
      </div>

      {pendingRole && (
        <ConfirmDialog
          title="Change role?"
          message={`Set ${pendingRole.name}'s role to ${pendingRole.role}? They'll ${pendingRole.role === "admin" ? "gain access to the admin dashboard." : "lose access to admin tools."}`}
          confirmLabel={`Yes, make ${pendingRole.role}`}
          onCancel={() => setPendingRole(null)}
          onConfirm={() => { updateAccount(pendingRole.id, { role: pendingRole.role }); setPendingRole(null); }}
        />
      )}
    </div>
  );
}

