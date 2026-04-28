# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Framework**: React 19 + Vite 7 (TypeScript, no framework on top of React)
- **Routing**: TanStack Router v1 — routes auto-generated from `src/routes/` file-tree
- **State**: Zustand — each domain has its own store in `src/store/`
- **Styling**: Tailwind CSS v4 + custom oklch design tokens, `src/styles.css`
- **Backend**: Supabase (Postgres + Auth + Storage) — typed via `src/lib/database.types.ts`
- **UI primitives**: shadcn-style Radix UI components in `src/components/ui/`
- **Forms**: React Hook Form + Zod + `@hookform/resolvers`
- **Testing**: Vitest + Testing Library (tests live next to source in `__tests__/` subdirs)

## Common Commands

```bash
npm run dev        # Start dev server (http://localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview the production build locally
npm run lint       # ESLint
npm run format     # Prettier (write)
npm run test       # Run all tests (vitest run)
```

Single-test file: `npx vitest run src/store/__tests__/checkout.test.ts`

## Architecture

### Routes

TanStack Router scans `src/routes/`. Every `*.tsx` file that exports `Route = createFileRoute(...)` becomes a route. The generated `routeTree.gen.ts` is auto-written — never edit it manually.

Route tree:
```
/ (index.tsx)           — Home page
/shop (shop.index.tsx)  — Catalog listing
/shop/$slug (shop.$slug.tsx) — Product detail
/cart (cart.tsx)        — Cart
/checkout (checkout.tsx) — Checkout
/account (account.tsx)   — Login / account
/admin (admin.tsx)       — Admin dashboard (full SPA, role-guarded)
/about, /contact         — Static pages
/order-confirmation/$id  — Post-purchase
```

### Zustand Stores

| Store | File | Purpose |
|---|---|---|
| `useAuth` | `src/store/auth.ts` | User session, login/logout, account CRUD |
| `useCatalog` | `src/store/catalog.ts` | Products, categories, featured slugs |
| `useOrders` | `src/store/orders.ts` | Orders, addresses, order status |
| `useSite` | `src/store/site.ts` | Site settings (hero, footer, brand) |
| `useBanners` | `src/store/banners.ts` | Banner management |
| `useShipping` | `src/store/shipping.ts` | Shipping companies + per-wilaya rates |
| `useCart` | `src/store/cart.ts` | Cart items, quantity, totals |

All stores follow the same pattern: optimistic local update first, then background Supabase sync. On sync failure, they roll back state and surface a toast via `sonner`.

### Data Flow

```
Supabase DB
    ↓
store.init()  (async on app mount)
    ↓
Zustand state  (source of truth for UI)
    ↓
Components read via selector:  useCatalog(s => s.products)
```

### Mobile Breakpoint

Single breakpoint at **768 px**. `useIsMobile()` in `src/hooks/use-mobile.tsx` uses `window.matchMedia`. Components use `md:` / `lg:` / `xl:` Tailwind arbitrary-value prefixes (e.g. `md:flex`) — there is no Tailwind `screens` config.

### Product Images

Images are stored as semicolon-delimited strings (e.g. `"url1;url2;url3"`). Utilities:
- `parseProductImages(str)` → `string[]`
- `serializeProductImages(arr)` → `string`
- `primaryProductImage(str)` → first URL or product placeholder

### i18n

`useT()` from `src/lib/i18n.ts` returns a translation function. Keys follow dot-notation (e.g. `t("admin.dashboard")`). Translation source lives in that file.

### Supabase Offline Mode

If `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are not set, `isSupabaseConfigured` is `false` and all DB calls return no-op results. Stores fall back to local state (in-memory for orders, localStorage for banners/shipping). This allows full UI development without a backend.

### Database Schema

`src/lib/database.types.ts` is the single source of truth for all Supabase table shapes. Key tables: `profiles`, `products`, `categories`, `orders`, `addresses`, `site_settings`, `banners`, `shipping_companies`.

### Design Tokens (CSS variables, `src/styles.css`)

All colors use oklch. The theme defines: `--primary` (green, `oklch(0.66 0.16 152)`), `--tertiary` (same as `--secondary` in light), `--destructive` (red), `--font-display` / `--font-sans` (both Be Vietnam Pro). Custom classes: `.hide-scrollbar`, `.img-reveal` (fade-in animation on image load).

## Admin Dashboard (`src/routes/admin.tsx`)

Single 2289-line file. All sub-views are inline components: `ProductsTab`, `OrdersTab`, `AccountsTab`, `SettingsTab`, `BannersTab`, `ShippingTab`, `CategoriesTab`. Modal dialogs are inline too (`ProductEditModal`, `ConfirmDialog`).

- Mobile: slide-over sidebar via state (`mobileMenuOpen`), `lg:hidden` / `lg:block`
- Search bar: desktop only (`md:flex`), searches products + orders, shows dropdown
- Notifications: real-time from store (pending orders, low stock)
- Charts: Recharts (`BarChart` from `recharts`)

## Key Conventions

- Component files use `.tsx`, pure logic/util files use `.ts`
- UI components go in `src/components/ui/`, domain components in `src/components/`
- Stores use Zustand `create<State>()((set, get) => ...)` — no slices pattern
- Env vars: `VITE_` prefix required for Vite to expose them to client
- Image uploads: Supabase Storage first (`product-images` bucket), base64 fallback
