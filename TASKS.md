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
- Created `.env.example` with `NEXT_PUBLIC_API_URL`
- Added `.turbo/`, lockfiles, and `pnpm-workspace.yaml` to `.gitignore`

### Acceptance criteria
- [x] `npm run build` compiles all 79 routes without errors
- [x] No remaining `@repo/ui` imports anywhere in `src/`
- [x] All UI components resolve from `@/components/ui`
- [x] `NEXT_PUBLIC_API_URL` env var documented

---

## Phase 2 — Cloudflare R2 Image URLs ⏳

**Status:** Pending — depends on API Phase 2 & 3

### Goal
Once the API migrates file storage to R2, the frontend will automatically serve images from R2 URLs. No code changes required — `getImageUrl()` in `src/lib/utils.ts` already handles full `https://` URLs by passing them through as-is.

### Tasks
- [ ] Update `NEXT_PUBLIC_API_URL` in production env to point to deployed API
- [ ] Verify `getImageUrl()` correctly resolves R2 URLs after DB migration
- [ ] Test: all product images, banners, brand logos load from R2
- [ ] Test: media picker in admin shows R2-hosted images
- [ ] Remove any hardcoded `http://127.0.0.1:3000` references if found

### Notes
- `src/lib/utils.ts` — `getImageUrl()` logic:
  - If URL starts with `http/https` → return as-is ✅ (R2 URLs will work automatically)
  - If URL starts with `/` → prepend `NEXT_PUBLIC_API_URL` (legacy `/uploads/` paths)
  - Otherwise → return placeholder image

---

## Backlog

- [ ] Set up CI/CD pipeline (GitHub Actions → Vercel or custom server)
- [ ] Add proper error boundaries and loading states
- [ ] Add end-to-end tests (Playwright or Cypress)
- [ ] Separate admin dashboard into its own repo (currently co-located under `/admin`)
