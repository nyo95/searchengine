# Backend Contract – Catalog & Search

This document defines the **source of truth** for the catalog backend: schema, APIs, and behavior.
It is what AI assistants (Codex/Cursor) must follow when editing backend code.

---

## 1. Data Model (Prisma)

### Brand
- id: String @id @default(cuid())
- name: String
- website?: String
- phone?: String
- salesName?: String
- salesContact?: String
- isActive: Boolean @default(true)
- createdAt: DateTime @default(now())
- updatedAt: DateTime @updatedAt

Relations:
- products: Product[]

### Category
- id: String @id @default(cuid())
- name: String
- normalizedName: String @unique
- createdAt / updatedAt
Relations:
- subcategories: Subcategory[]
- products: Product[]

### Subcategory
- id: String @id @default(cuid())
- name: String
- normalizedName: String
- prefix: String
- isActive: Boolean @default(true)
- categoryId: String (FK → Category)
- createdAt / updatedAt

Unique:
- @@unique([categoryId, normalizedName])
- @@unique([categoryId, prefix])

Relations:
- category: Category
- products: Product[]

### Product
- id: String @id @default(cuid())
- internalCode: String
- name: String
- sku: String @unique
- brandId: String
- categoryId: String
- subcategoryId: String
- description?: String
- imageUrl?: String
- tags: String[] @default([])
- dynamicAttributes: Json?
- isActive: Boolean @default(true)
- createdAt / updatedAt

Relations:
- brand: Brand
- category: Category
- subcategory: Subcategory
- scheduleItems: ProjectScheduleItem[]

> NOTE: Project / ProjectSchedule / ProjectScheduleItem schema lives in schema.prisma and is **out of scope** for Phase 1.

---

## 2. Brand API

Base path: `/api/brands`

### GET /api/brands
- Returns only `isActive = true` brands.
- Response:
  ```json
  {
    "brands": [ { ..Brand fields.. } ]
  }
  ```

### POST /api/brands
- Body:
  ```json
  {
    "name": "required",
    "website": "optional",
    "phone": "optional",
    "salesName": "optional",
    "salesContact": "optional"
  }
  ```
- Creates a new active brand.
- Response:
  ```json
  { "brand": { ..Brand.. } }
  ```

### PATCH /api/brands/:id
- Used for:
  - updating name/contact fields, OR
  - soft delete / revive via `isActive`.
- Soft delete = `{ "isActive": false }`
- Revive = `{ "isActive": true }`
- Response:
  ```json
  { "brand": { ..updated Brand.. } }
  ```

No hard delete in Phase 1.

---

## 3. Product API

Base path: `/api/products`

### POST /api/products
- Body:
  ```json
  {
    "name": "Homogeneous Tile White 60x60",
    "sku": "HT-6060-WH-X",
    "brandId": "<Brand.id>",
    "categoryName": "Material",
    "subcategoryName": "Homogeneous Tile",
    "dynamicAttributes": {
      "size": "600x600",
      "finish": "matt",
      "roughness": "R10"
    }
  }
  ```
- Behavior:
  - Normalize `categoryName` → `normalizedName`.
  - Find or create Category.
  - Normalize `subcategoryName` and find/create Subcategory for that Category.
  - Ensure Subcategory has a `prefix` (e.g. "Homogeneous Tile" → "HT").
  - Generate `internalCode`:
    - prefix + incremental number per subcategory, e.g. `HT-01`, `HT-02`.
    - Guarantee uniqueness with `@@unique([subcategoryId, internalCode])`.
  - Create Product with FK to Brand, Category, Subcategory.
  - Save `dynamicAttributes` as JSON.

- Response:
  ```json
  { "product": { ..Product + joined Brand/Category/Subcategory.. } }
  ```

### GET /api/products/:id
- Returns a single product with:
  - Product base fields
  - Brand (id, name)
  - Category (id, name)
  - Subcategory (id, name, prefix)

### PATCH /api/products/:id
- Allowed updates:
  - name
  - sku
  - description
  - imageUrl
  - dynamicAttributes
  - tags
  - isActive
- Deactivating a product (`isActive = false`) hides it from search by default.

---

## 4. Search & Suggestions

### GET /api/search/products

Query parameters:
- `q` (string)
- `brandId?`
- `categoryId?`
- `subcategoryId?`
- `isActive?` (default: true)
- `page?` (default: 1)
- `pageSize?` (default: 20)

Search rules:
- By default filter `isActive = true`.
- `q` matches:
  - product.name
  - product.sku
  - product.internalCode
  - tags (array contains)
  - brand.name
  - subcategory.name

Response:
```json
{
  "items": [
    {
      "id": "...",
      "sku": "...",
      "name": "...",
      "internalCode": "HT-01",
      "description": null,
      "imageUrl": null,
      "brand": { "id": "...", "name": "Test Brand X" },
      "category": { "id": "...", "name": "Material" },
      "subcategory": { "id": "...", "name": "Homogeneous Tile", "prefix": "HT" },
      "dynamicAttributes": { "size": "600x600" },
      "tags": [],
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "total": 1,
  "page": 1,
  "pageSize": 20
}
```

> Old fields from the legacy schema (productType, variants, priceRange, images, cadFiles, media, datasheets, etc.) must **NOT** appear in this response.

---

### GET /api/search/suggestions

Query parameters:
- `q` (string, required)

Behavior:
- Reuse the same base search as `/api/search/products`, pick top matches.
- Return a **lightweight** array:

```json
{
  "suggestions": [
    { "code": "HT-01", "name": "Homogeneous Tile White 60x60", "brandName": "Test Brand X" }
  ]
}
```

Only active products are considered by default.

---

## 5. Phase 1 Scope

- Brand, Category, Subcategory, Product, Search.
- Project & Schedule APIs are untouched in Phase 1.
- All AI changes MUST respect this contract.
