# Tasks & Migration Log

Tracks all infrastructure and migration work done on this repo.

---

## Phase 1 — Monorepo Separation ✅

**Status:** Completed — 2026-05-15

### Changes made
- Extracted from `ecom-node-react` monorepo (`apps/web/`)
- Inlined all `@repo/ui` shared components into `src/components/ui/`
  - Copied: `avatar`, `badge`, `button`, `card`, `image`, `layouts`, `rating`, `section`, `skeleton`, `typography`
- Replaced all `@repo/ui` imports with `@/components/ui` across 90+ files
- Removed `@repo/ui` path alias from `tsconfig.json`
- Created `.env.example` with `NEXT_PUBLIC_API_URL` and `PORT`
- Added `.turbo/`, lockfiles, and `pnpm-workspace.yaml` to `.gitignore`
- Pinned port to `3001` in `package.json` dev/start scripts

### Acceptance criteria
- [x] `npm run build` compiles all 79 routes without errors
- [x] No remaining `@repo/ui` imports anywhere in `src/`
- [x] All UI components resolve from `@/components/ui`
- [x] Frontend runs on port `3001`, API on `3000`

---

## Phase 2 — Skincare Theme ✅

**Status:** Completed — 2026-05-15

### Changes made
- Replaced "Prithibee Baby Blue" design system with Replant Glow skincare palette
- Removed stale `@source` reference to deleted `packages/ui` path
- Updated all CSS variables in `src/app/globals.css`

### New palette
| Token | Value | Use |
|-------|-------|-----|
| `--color-primary` | `#4a7c59` | Sage green — brand |
| `--color-secondary` | `#f5f0e8` | Warm cream — backgrounds |
| `--color-accent` | `#c9956c` | Rose gold — CTAs |
| `--color-dark` | `#2d5a3d` | Forest green — hover |
| `--color-muted` | `#8fac97` | Soft sage — borders |
| `--background` | `#fdfaf5` | Off-white cream |
| `--foreground` | `#1a2e1f` | Deep green-black |

---

## Phase 3 — Cloudflare R2 Image URLs ⏳

**Status:** Pending — depends on API Phase 3 (existing file migration)

### Goal
Verify all images render correctly from R2 URLs after the API migration. No frontend code changes needed — `getImageUrl()` already handles full `https://` URLs.

### Tasks
- [ ] Update `NEXT_PUBLIC_API_URL` in production env to point to deployed API
- [ ] Verify `getImageUrl()` resolves R2 URLs correctly after DB migration
- [ ] Test: product images, banners, brand logos load from R2
- [ ] Test: media picker in admin shows R2-hosted images
- [ ] Search and remove any hardcoded `http://127.0.0.1:3000` references

### Notes
- `src/lib/utils.ts` `getImageUrl()` logic:
  - URL starts with `https://` → returned as-is ✅ (R2 URLs work automatically)
  - URL starts with `/` → prepends `NEXT_PUBLIC_API_URL` (legacy `/uploads/` paths)
  - Otherwise → returns placeholder image

---

## Backlog

- [ ] Set up CI/CD pipeline (GitHub Actions → Vercel or custom server)
- [ ] Add proper error boundaries and loading states
- [ ] Add end-to-end tests (Playwright or Cypress)
- [ ] Separate admin dashboard into its own repo (currently co-located under `/admin`)
