# Tasks & Migration Log

Tracks all infrastructure and migration work done on this repo.

---

## About `sharp` (Image Processing)

`sharp` is a Node.js image processing library powered by **libvips** (a C++ image processing system). It runs in the API (`ecom-node-api`) — not in this frontend repo — but it directly affects what this frontend renders.

Every image uploaded through the admin panel is processed by `sharp` before being stored:

- Converted to **WebP** format at quality 85
- Optionally stamped with a brand watermark (text or image)
- All processing happens in memory — no temp files

**What this means for the frontend:**
- All new image URLs will end in `.webp`
- `getImageUrl()` in `src/lib/utils.ts` is format-agnostic — no changes needed
- `<img>` tags and Next.js `<Image>` both support WebP natively in all modern browsers

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

## Phase 4 — Watermark Settings UI ✅

**Status:** Completed — 2026-05-15

### Goal
Admin UI to configure the brand watermark applied to all uploaded images (controlled by API Phase 4).

### Changes made
- Updated `src/app/admin/settings/page.tsx`:
  - Filters `watermark_*` keys out of the generic settings list
  - Adds a dedicated **Watermark Configuration** card with:
    - Enable/disable **toggle** (sky-500 when active)
    - **Type** radio: Text or Image
    - **Text** input (shown when type = text)
    - **Image URL** input + live preview thumbnail + width (px) input (shown when type = image)
    - **Opacity** range slider (0.1–1.0, step 0.1) with live numeric display
    - **3×3 position grid** (↖ ↑ ↗ ← ◎ → ↙ ↓ ↘) with active highlight
    - Section dims (`opacity-40 pointer-events-none`) when watermark is disabled
  - All watermark settings save via the same `PUT /settings/:key` flow as general settings
- Fixed `MediaPicker.tsx` and `admin/media/page.tsx` — replaced `${API_URL}${file.url}` with `getImageUrl(file.url)` to correctly handle both local `/uploads/` paths and full R2 URLs

### Acceptance criteria
- [x] Watermark section renders separately from general settings
- [x] Enable toggle shows/hides the section controls
- [x] Text and Image modes show the correct conditional inputs
- [x] Opacity slider updates live
- [x] Position grid highlights the active selection
- [x] Save button persists all watermark settings to API
- [x] Media library and picker render images correctly for both local and R2 URLs

---

## Backlog

- [ ] Set up CI/CD pipeline (GitHub Actions → Vercel or custom server)
- [ ] Add proper error boundaries and loading states
- [ ] Add end-to-end tests (Playwright or Cypress)
- [ ] Separate admin dashboard into its own repo (currently co-located under `/admin`)
