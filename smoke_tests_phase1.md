# Smoke Tests – Phase 1 (Catalog)

This document describes the **Phase 1 backend smoke tests** and how to use them.

---

## Script

- File: `run-smoketest-phase1-fixed.js`
- Requirements:
  - Node.js 18+ (global `fetch` support)
  - Dev server running at `http://localhost:3000`

Run:

```bash
npm run dev
node run-smoketest-phase1-fixed.js
```

Output:

- Markdown log at: `smoke-test-phase1-log-fixed.md`

---

## What It Tests

1. **Brand**
   - Create brand
   - List active brands
   - Soft delete (isActive = false)
   - Revive (isActive = true)
   - Confirm only the **created brand** is affected

2. **Product**
   - Create product with:
     - brandId
     - categoryName
     - subcategoryName
     - dynamicAttributes
   - Read product detail
   - Update product (PATCH)
   - Deactivate product (isActive = false)

3. **Search**
   - Search by q=tile (active)
   - Search after deactivation (product should disappear)
   - Search by brandId
   - Search by subcategoryId
   - Suggestions (q=tile)

---

## Interpreting the Log

Each step logs:

- Request method + path
- Body (if any)
- Status code
- Raw response text
- Human-readable result (✅ / ❌ / ⚠ / Skip)

For example:

```markdown
## 7. Create Product
...
**Status:** 200
**Raw Response:**
{"product":{...}}
**Result:** ✅ Product created with id = `...`, subcategoryId = `...`.
```

If any step fails (status 4xx/5xx or ❌/⚠), you can paste the entire log into ChatGPT and ask:

> "Read this smoke test log and generate a focused prompt for Codex to fix only the failing steps."

---

## Scope

Phase 1 smoke test is only concerned with:

- Brand
- Product
- Search + Suggestions

Project / Schedule tests are part of **Phase 2** and will use a separate script.
