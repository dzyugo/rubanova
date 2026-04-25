function ProductsTab() {
  const featuredSlugs = useCatalog((s) => s.featuredSlugs);
  const toggle = useCatalog((s) => s.toggleFeatured);
  const products = useMergedProducts();
  const updateProduct = useCatalog((s) => s.updateProduct);
  const resetProduct = useCatalog((s) => s.resetProduct);
  const addProduct = useCatalog((s) => s.addProduct);
  const removeProduct = useCatalog((s) => s.removeProduct);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const editing = editingSlug ? products.find((p) => p.slug === editingSlug) ?? null : null;

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold">Products Management</h2>
          <p className="text-sm text-muted-foreground">Edit details, swap images, or feature an item — changes show on the home page instantly.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden rounded-full bg-tertiary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary sm:inline-block">
            {featuredSlugs.length} on home
          </span>
          <button onClick={() => setIsAdding(true)} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            Add Product
          </button>
        </div>
      </div>
      <div className="mt-5 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Product</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Featured on Home</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p, i) => {
              const isFeatured = featuredSlugs.includes(p.slug);
              return (
                <tr key={p.slug}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image.split(',')[0]} alt="" className="size-10 rounded-lg object-cover" />
                      <span className="font-semibold">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-tertiary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">{p.category}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{p.price.toFixed(2)} DA</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1.5 ${p.stock && p.stock < 10 ? "text-amber-600" : "text-primary"}`}>
                      <span className="size-2 rounded-full bg-current" />
                      {p.stock && p.stock < 10 ? `Low Stock (${p.stock})` : `In Stock (${p.stock ?? 0})`}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggle(p.slug)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition ${
                        isFeatured ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-tertiary hover:text-primary"
                      }`}
                      aria-pressed={isFeatured}
                    >
                      <Star className={`size-3 ${isFeatured ? "fill-current" : ""}`} />
                      {isFeatured ? "On Home" : "Add to Home"}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setEditingSlug(p.slug)}
                        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-secondary"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                            removeProduct(p.slug);
                          }
                        }}
                        className="rounded-md p-1.5 text-muted-foreground transition hover:bg-destructive hover:text-destructive-foreground"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">{featuredSlugs.length} products featured on the home page.</p>

      {editing && (
        <ProductEditModal
          key={editing.slug}
          product={editing}
          onClose={() => setEditingSlug(null)}
          onSave={(patch) => { updateProduct(editing.slug, patch); setEditingSlug(null); }}
          onReset={() => { resetProduct(editing.slug); setEditingSlug(null); }}
        />
      )}
      {isAdding && (
        <ProductEditModal
          key="new-product"
          product={null}
          onClose={() => setIsAdding(false)}
          onSave={(patch) => { addProduct(patch as any); setIsAdding(false); }}
        />
      )}
    </div>
  );
}

function ProductEditModal({
  product,
  onClose,
  onSave,
  onReset,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (patch: ProductOverride) => void;
  onReset?: () => void;
}) {
  const categories = useCatalog((s) => s.categories);
  const [name, setName] = useState(product?.name || "");
  const [tagline, setTagline] = useState(product?.tagline || "");
  const [description, setDescription] = useState(product?.description || "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [unit, setUnit] = useState(product?.unit || "");
  const [images, setImages] = useState<string[]>(product?.image ? product.image.split(',') : []);
  const [category, setCategory] = useState<string>(product?.category || categories[0] || "");
  const [badgesStr, setBadgesStr] = useState(product?.badges?.join(", ") || "");
  const [servingSize, setServingSize] = useState(product?.nutrition?.servingSize || "100g");
  const [calories, setCalories] = useState(product?.nutrition?.calories || "0");
  const [stock, setStock] = useState(product ? String(product.stock ?? 0) : "0");
  const [imgError, setImgError] = useState<string | null>(null);
  const baseImage = product?.image || "";

  const dirty =
    !product ||
    name !== product.name ||
    tagline !== product.tagline ||
    description !== product.description ||
    unit !== product.unit ||
    images.join(',') !== product.image ||
    category !== product.category ||
    badgesStr.trim() !== (product?.badges?.join(", ") || "") ||
    servingSize !== (product?.nutrition?.servingSize || "100g") ||
    calories !== (product?.nutrition?.calories || "0") ||
    parseFloat(price) !== product.price ||
    parseInt(stock) !== (product.stock ?? 0);

  const [uploading, setUploading] = useState(false);

  const onPickImage = async (file: File | null) => {
    setImgError(null);
    if (!file) return;
    if (!file.type.startsWith("image/")) { setImgError("Please choose an image file (JPG, PNG, WEBP)."); return; }
    if (file.size > 5 * 1024 * 1024) { setImgError("Image must be under 5 MB."); return; }

    setUploading(true);
    try {
      // Try uploading to Supabase Storage
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `products/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const { data, error } = await supabase.storage.from('product-images').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (!error && data) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(data.path);
        setImages((prev) => [...prev, urlData.publicUrl]);
      } else {
        // Fallback to base64 if storage not configured
        const reader = new FileReader();
        reader.onerror = () => setImgError("We couldn't read that file. Try another image.");
        reader.onload = () => setImages((prev) => [...prev, String(reader.result)]);
        reader.readAsDataURL(file);
      }
    } catch {
      // Fallback to base64
      const reader = new FileReader();
      reader.onerror = () => setImgError("We couldn't read that file. Try another image.");
      reader.onload = () => setImages((prev) => [...prev, String(reader.result)]);
      reader.readAsDataURL(file);
    }
    setUploading(false);
  };

  const handleClose = () => {
    if (dirty && !confirm("You have unsaved changes. Discard them?")) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 backdrop-blur-sm p-4" onClick={handleClose}>
      <div className="w-full max-w-2xl rounded-3xl bg-card p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-xl font-bold">{product ? "Edit product" : "Add product"}</h3>
            <p className="text-xs text-muted-foreground">Slug: {product?.slug || "auto-generated"}</p>
          </div>
          <button onClick={handleClose} className="rounded-full p-2 hover:bg-secondary" aria-label="Close">✕</button>
        </div>

        {dirty && product && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            <AlertTriangle className="size-3.5" /> You have unsaved changes
          </div>
        )}

        <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {images.map((img, i) => (
                <div key={i} className="group relative aspect-square w-20 overflow-hidden rounded-xl border border-border">
                  <img src={img} alt="" className="size-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-destructive opacity-0 backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground group-hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className={`flex w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-border px-3 py-6 text-xs font-semibold hover:bg-secondary ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
              {uploading ? "Uploading…" : "Upload Image"}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickImage(e.target.files?.[0] ?? null)} disabled={uploading} />
            </label>
            {imgError && <p className="text-[11px] text-destructive">{imgError}</p>}
            {images.join(',') !== baseImage && (
              <button type="button" onClick={() => setImages(baseImage ? baseImage.split(',') : [])} className="w-full rounded-full px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-secondary">
                Restore original images
              </button>
            )}
          </div>
          <div className="space-y-3">
            <Input label="Name" value={name} onChange={setName} />
            <Input label="Tagline" value={tagline} onChange={setTagline} />
            <Textarea label="Description" value={description} onChange={setDescription} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Price (DA)" value={price} onChange={setPrice} type="number" step="1" />
              <Input label="Unit" value={unit} onChange={setUnit} />
              <Input label="Stock" value={stock} onChange={setStock} type="number" step="1" />
            </div>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Category</span>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-2 w-full rounded-lg bg-secondary/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                {!categories.includes(category) && <option value={category}>{category}</option>}
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
          <Input label="Badges (comma separated)" value={badgesStr} onChange={setBadgesStr} placeholder="e.g. Organic, Vegan" />
          <Input label="Serving Size" value={servingSize} onChange={setServingSize} />
          <Input label="Calories" value={calories} onChange={setCalories} />
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {onReset && product ? (
            <button onClick={onReset} className="rounded-full px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-secondary">
              Reset to defaults
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button onClick={handleClose} className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:bg-secondary">Cancel</button>
            <button
              onClick={() => onSave({
                name, tagline, description, unit,
                image: images.join(','),
                category: category as Product["category"],
                badges: badgesStr.split(",").map((s) => s.trim()).filter(Boolean),
                nutrition: { ...product?.nutrition, servingSize, calories },
                price: Number.isFinite(parseFloat(price)) ? parseFloat(price) : (product?.price || 0),
                stock: Number.isFinite(parseInt(stock)) ? parseInt(stock) : (product?.stock ?? 0),
              })}
              disabled={!dirty || !name || !price}
              className="rounded-full bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

