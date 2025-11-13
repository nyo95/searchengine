## Architecture Catalog & Schedule Workspace

Localized catalog for material, lighting, furniture, and hardware products with learning-aware search, schedule builder, and lightweight insights. Built on Next.js 14 App Router + Prisma + PostgreSQL.

### Key Capabilities
- **Hierarchical catalog** – Brand → Product Type → Product → Variant → Media with flexible JSON attributes per variant.
- **Search that feels “Google-like”** – bilingual keywords, synonym table (`kursi ↔ chair`, `lampu sorot ↔ spotlight`, `hpl ↔ laminate`, etc.), usage-based ranking, pagination, and safe limits.
- **Internal learning signals** – every search / click / add-to-schedule is stored in `UserActivity` and converted into `UserPreference` weights to influence subsequent search scores.
- **Schedules & exports** – create project schedules, capture product snapshots (qty, UoM, unit price, area, notes), view totals, and export CSV or Excel-ready `.xls`.
- **Insights** – trends for searches, product usage, categories, brands, plus a dedicated endpoint for “top 5 habits” per user.

---

### 1. Prerequisites
| Requirement | Notes |
|-------------|-------|
| Node.js 18+ | `nvm use 18` (or newer compatible with Next.js 14) |
| PostgreSQL 14+ | Must allow `pg_trgm`/FTS extensions if you plan to extend search |

Create `.env` at repo root:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/catalog"
```

### 2. Install & Prepare Database
```bash
npm install
npm run db:generate          # optional but fast
npm run db:migrate           # prisma migrate dev
npm run db:seed              # loads demo brands / products / synonyms
```

### 3. Run the App
```bash
npm run dev
# visit http://localhost:3000
```

All demo traffic uses the `anonymous` user (seeded automatically) so learning signals remain internal.

---

### Included Demo Data
- **Brands & product types**: Taco (HPL), LuxBright + Philips (downlights & spotlights), Herman Miller + Studio Kursi (chairs).
- **Products/variants**: 12+ SKUs across material/lighting/furniture with variant attributes, pricing, and media (images + datasheets/CAD links).
- **Synonyms**: ≥10 bilingual pairs so “kursi”/“chair”/“lampu sorot”/“spotlight” and “hpl”/“laminate” resolve identically.

---

### API Highlights
| Endpoint | Purpose |
|----------|---------|
| `GET /api/search?q=&userId=` | Catalog search with filters (`category`, `brand`, `minPrice`, `maxPrice`, pagination). |
| `GET /api/suggestions?q=` | Type-ahead suggestions (products, brands, types, synonyms). |
| `POST /api/activity` | Track `SEARCH`, `CLICK_PRODUCT`, `VIEW_PRODUCT`, `ADD_TO_SCHEDULE`, etc. |
| `GET /api/schedule?userId=` + `POST /api/schedule` | List/create project schedules. |
| `GET/POST/DELETE /api/schedule/items` | Read/add/remove snapshot rows for a schedule. |
| `GET /api/insights` | Aggregated stats for overview cards (search volume, schedules, brands, categories, trends). |
| `GET /api/insights/preferences?userId=` | Top 5 learned preferences for the specified user (falls back to global weights). |
| `GET /api/catalog/meta` | Category + brand metadata with product counts (for filter panes). |
| `GET /api/catalog/trending` | Top products by usage/view counts (used on homepage). |

---

### Demo Scenario (happy path)
1. **Home/Search page**
   - Type `kursi` → see Herman Miller / Studio Kursi chairs (bilingual synonym works). Click a result → `CLICK_PRODUCT` recorded.
   - Search `HPL Taco` → laminate SKUs from Taco appear.
   - Search `downlight 3000K` → LuxBright/Philips lighting results.
2. **Create schedule**
   - Go to `/schedule`, create `Demo Showroom`, keep tab open (or refresh home page to fetch schedules).
3. **Add from search results**
   - On search page, use **Add to Schedule** button on three different products (material, lighting, furniture). Choose `Demo Showroom`, fill qty/UoM/notes.
4. **Review schedule**
   - Back on `/schedule`: `Schedule Items` tab shows rows with totals, summary cards update, export CSV & Excel buttons work.
5. **Learning signal**
   - Run 5–10 search/click/add actions focusing on one brand/type. Call `GET /api/insights/preferences?userId=anonymous` and see top weights reflect the behavior. Repeat search to notice re-ranked results for that brand/type.

Three core pages (Search, Product Schedule, Insights) render empty/load states cleanly and emit no console errors when the above scenario runs.

---

### Next Steps / Nice-to-haves
1. **Facet filters by variant attributes** – expose JSON attribute keys in the filter panel (e.g., wattage, color, thickness) and feed them into the Prisma query.
2. **PostgreSQL FTS + trigram** – current search mimics relevance via `ILIKE` + synonyms; wire in `pg_trgm`/`tsvector` columns for better ranking once the DB extension is enabled.
3. **Caching & performance** – cache catalog metadata and trending queries (Redis/Edge) to reduce DB hits on the home page.
4. **Vector search (optional)** – embed product descriptions for semantic recall, but keep it on internal infra per requirements.

---

### Repository Notes
- Only features relevant to catalog/search/schedule/insights remain; legacy demo-download code was removed.
- Seed + API responses are fully real (no mock arrays). Update `prisma/seed.ts` to extend the catalog.
- UI keeps the Z.ai scaffold styling, but all data wiring now hits Prisma/PostgreSQL for truthful results.
