# Searchengine – Catalog + Project Scheduler

This project is a **Next.js + Prisma** app that combines:

1. A **Product/Material Catalog** (searchable, brand-aware, prefix-based codes).
2. A **Project Schedule** module (per-project material schedule, swap codes, etc.).

AI assistants (Codex, Cursor, ChatGPT) are used as coding partners, but the **truth source** for backend is `backend_full.md`.

---

## High-Level Structure

- `src/app`  
  - `/api/brands` – Brand CRUD (Phase 1 done)  
  - `/api/products` – Product CRUD (Phase 1 WIP)  
  - `/api/search/products` – Catalog search  
  - `/api/search/suggestions` – Lightweight suggestions  
  - `/api/projects` – Project & schedule APIs (Phase 2)  

- `prisma/`  
  - `schema.prisma` – Brand / Category / Subcategory / Product / Project / Schedule models  
  - `migrations/` – migrations generated via `prisma migrate dev`  

- `backend_full.md`  
  Backend contract for catalog & search.

- `run-smoketest-phase1-fixed.js`  
  Node script to run automated smoke tests for:
  - Brand API
  - Product API
  - Search + Suggestions

---

## Dev Commands

```bash
# Start dev server
npm run dev

# Apply migrations and generate client
npx prisma migrate dev --name phase1_catalog_schema_reset
npx prisma generate

# Run backend smoke tests (Phase 1)
node run-smoketest-phase1-fixed.js
```

The smoke test will write a log file:

- `smoke-test-phase1-log-fixed.md`

You can paste that log into ChatGPT to get a **precise prompt** for the next backend fix.

---

## Phases

### Phase 1 – Catalog & Search
- [x] Prisma schema reset for Brand/Category/Subcategory/Product.
- [x] Brand API (create/list/soft delete/revive).
- [ ] Product API (create/read/update/deactivate).
- [ ] Search & suggestions aligned with backend_full.md.
- [x] Smoke test script for Phase 1.

### Phase 2 – Project & Schedule
- Project CRUD.
- ProjectScheduleItem APIs (add item, edit, delete).
- Swap code endpoint.
- Integration with catalog products.

### Phase 3 – UI/UX Polish
- Cursor AI refactor of UI to match new backend contracts.
- Dashboard + catalog + schedule layout.

---

## AI Usage

When using Codex/Cursor/ChatGPT to modify code:

1. **Always load**:
   - `backend_full.md`
   - `prisma/schema.prisma`
2. **Never re-introduce** legacy models:
   - ProductType, BrandSubcategory, Variant, etc.
3. Keep **Project/Schedule** APIs untouched until Phase 2.
4. After any backend change, run:
   - `node run-smoketest-phase1-fixed.js`
   and inspect the log.

This keeps the backend evolvable but safe, even when multiple AI tools are involved.
