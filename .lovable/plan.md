## Findings

- `/admin` route already exists with Dashboard, Products, Orders, Accounts, and Site Settings tabs. The Products tab already has a ⭐ Featured toggle wired to `useCatalog`, and the Home page reads from it. The Accounts tab already supports edit/delete/role change.
- The reason "no admin page appears" on login: the only entry to `/admin` is buried inside the user dropdown in the header. There's no top-level nav link or auto-redirect for admins.
- The previous turn was supposed to delete wellness and differentiate Organic, but `src/routes/organic.tsx` still exists, the route is wired in `routeTree.gen.ts`, and links to `/organic` remain in `site-header.tsx` and `site-footer.tsx`.

## Plan

### 1. Make admin page reachable
- Add an **"Admin"** link in `src/components/site-header.tsx` desktop nav (and mobile menu) that only renders when `useAuth` current user has `role === "admin"`.
- On successful login in `src/routes/account.tsx`, if the logged-in user is an admin, auto-navigate to `/admin` (shoppers stay on /account as today).
- Keep the existing dropdown "Admin Dashboard" link as a secondary entry.

### 2. Remove Organic & any remaining wellness traces
- Delete `src/routes/organic.tsx` (TanStack Router will regenerate `routeTree.gen.ts` automatically — do not hand-edit).
- Remove the `/organic` link from `src/components/site-header.tsx` (`navLinks` array) and from `src/components/site-footer.tsx`.
- Grep for any leftover `wellness` strings in routes/components and remove (currently only copy text uses the word "wellness" generically; will scrub if it implies a removed page).
- Nav after change: **Home · Shop · About · Contact** (+ Admin when admin).

### 3. Featured products control (verify + polish)
- Already implemented in admin Products tab via `useCatalog.toggleFeatured`. Home `/` reads `featuredSlugs` and filters `products`.
- Polish: ensure the Home featured section gracefully shows a fallback row of products if the admin un-features everything, and add a small "Showing on Home" helper text in the admin Products tab header.

### 4. Accounts management table (verify + polish)
- Already implemented in admin Accounts tab: edit name/email, role select (admin/shopper), delete account, with confirm dialog.
- Polish: prevent deleting or demoting the currently signed-in admin (would lock them out); show a disabled state with a tooltip explaining why.

### 5. QA
- Log in as `admin@rubanova.com / admin123` → should land on `/admin`, see Admin link in header.
- Toggle a product as Featured → home `/` updates immediately.
- Edit a shopper, change role to admin, delete a non-current account.
- Confirm `/organic` returns the root 404 component and no nav link references it.

No new dependencies needed.