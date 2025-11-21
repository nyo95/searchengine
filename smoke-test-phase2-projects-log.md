# Backend Phase 2 Smoke Test Log (Projects + Schedule)

Base URL: http://localhost:3000
Date: 2025-11-21T16:25:52.230Z

---
Starting Phase 2 smoke tests (Projects + Schedule)...

## 0.1. Create Brand (dependency)
**Request:** `POST /api/brands`
**Body:**
```json
{
  "name": "Smoke Brand Phase2",
  "website": "https://example.com",
  "phone": "08123456789",
  "salesName": "Phase2",
  "salesContact": "phase2@example.com"
}
```
**Status:** 200
**Raw Response:**
```json
{"brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2","website":"https://example.com","phone":"08123456789","salesName":"Phase2","salesContact":"phase2@example.com","isActive":true,"createdAt":"2025-11-21T16:25:52.311Z","updatedAt":"2025-11-21T16:25:52.311Z"}}
```
**Result:** ✅ Brand created with id = `cmi92novr0009duqk00o6oxt3`

## 0.2. Create Product (dependency)
**Request:** `POST /api/products`
**Body:**
```json
{
  "name": "Smoke Test Tile Phase2",
  "sku": "P2-SMOKE-1763742352319",
  "brandId": "cmi92novr0009duqk00o6oxt3",
  "categoryName": "Material",
  "subcategoryName": "Homogeneous Tile",
  "dynamicAttributes": {
    "size": "600x600",
    "finish": "matt",
    "roughness": "R10"
  }
}
```
**Status:** 200
**Raw Response:**
```json
{"product":{"id":"cmi92nox6000cduqk8zfwbj9v","brandId":"cmi92novr0009duqk00o6oxt3","categoryId":"cmi7p3dop0002dum0l9lvobac","subcategoryId":"cmi7p3dou0004dum05tdmokuy","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","description":null,"imageUrl":null,"internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"},"dynamicAttributes":{"size":"600x600","finish":"matt","roughness":"R10"},"tags":[],"isActive":true,"createdAt":"2025-11-21T16:25:52.363Z","updatedAt":"2025-11-21T16:25:52.363Z"}}
```
**Result:** ✅ Product created with id = `cmi92nox6000cduqk8zfwbj9v`

## 1. Create Project
**Request:** `POST /api/projects`
**Body:**
```json
{
  "name": "Smoke Test Project Phase 2",
  "code": "PRJ-P2-1763742352368",
  "clientName": "Client Smoke P2",
  "location": "Jakarta",
  "description": "Backend Phase 2 smoke test project"
}
```
**Status:** 201
**Raw Response:**
```json
{"project":{"id":"cmi92noy9000dduqkqkandqiw","name":"Smoke Test Project Phase 2","code":"PRJ-P2-1763742352368","clientName":"Client Smoke P2","location":"Jakarta","description":"Backend Phase 2 smoke test project","createdAt":"2025-11-21T16:25:52.401Z","updatedAt":"2025-11-21T16:25:52.401Z","itemCount":0}}
```
**Result:** ✅ Project created with id = `cmi92noy9000dduqkqkandqiw`

## 2. Get Projects List
**Request:** `GET /api/projects`
**Status:** 200
**Raw Response:**
```json
{"projects":[{"id":"cmi92noy9000dduqkqkandqiw","name":"Smoke Test Project Phase 2","code":"PRJ-P2-1763742352368","clientName":"Client Smoke P2","location":"Jakarta","description":"Backend Phase 2 smoke test project","createdAt":"2025-11-21T16:25:52.401Z","updatedAt":"2025-11-21T16:25:52.401Z","itemCount":0}]}
```
**Result:** ✅ Projects list returned, includes projectId = `cmi92noy9000dduqkqkandqiw`.

## 3. Get Project Detail
**Request:** `GET /api/projects/cmi92noy9000dduqkqkandqiw`
**Status:** 200
**Raw Response:**
```json
{"project":{"id":"cmi92noy9000dduqkqkandqiw","name":"Smoke Test Project Phase 2","code":"PRJ-P2-1763742352368","clientName":"Client Smoke P2","location":"Jakarta","description":"Backend Phase 2 smoke test project","createdAt":"2025-11-21T16:25:52.401Z","updatedAt":"2025-11-21T16:25:52.401Z","itemCount":0}}
```
**Result:** ✅ Project detail retrieved.

## 4. Update Project
**Request:** `PATCH /api/projects/cmi92noy9000dduqkqkandqiw`
**Body:**
```json
{
  "name": "Smoke Test Project Phase 2 (Updated)",
  "location": "Bandung"
}
```
**Status:** 200
**Raw Response:**
```json
{"project":{"id":"cmi92noy9000dduqkqkandqiw","name":"Smoke Test Project Phase 2 (Updated)","code":"PRJ-P2-1763742352368","clientName":"Client Smoke P2","location":"Bandung","description":"Backend Phase 2 smoke test project","createdAt":"2025-11-21T16:25:52.401Z","updatedAt":"2025-11-21T16:25:52.519Z","itemCount":0}}
```
**Result:** ✅ Project update request accepted.

## 5. Create Schedule Item A (default code = product.internalCode)
**Request:** `POST /api/projects/cmi92noy9000dduqkqkandqiw/items`
**Body:**
```json
{
  "productId": "cmi92nox6000cduqk8zfwbj9v",
  "area": "Master Bedroom",
  "locationNote": "Floor",
  "usageNote": "Main tile",
  "sortOrder": 1
}
```
**Status:** 201
**Raw Response:**
```json
{"item":{"id":"cmi92np4b000fduqkyqtsaczn","projectId":"cmi92noy9000dduqkqkandqiw","productId":"cmi92nox6000cduqk8zfwbj9v","code":"HT-05","area":"Master Bedroom","locationNote":"Floor","usageNote":"Main tile","sortOrder":1,"createdAt":"2025-11-21T16:25:52.620Z","updatedAt":"2025-11-21T16:25:52.620Z","product":{"id":"cmi92nox6000cduqk8zfwbj9v","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"}}}}
```
**Result:** ✅ Schedule item A created with id = `cmi92np4b000fduqkyqtsaczn`, code = `HT-05`.

## 6. Create Schedule Item B (explicit code)
**Request:** `POST /api/projects/cmi92noy9000dduqkqkandqiw/items`
**Body:**
```json
{
  "productId": "cmi92nox6000cduqk8zfwbj9v",
  "code": "HT-05-ALT",
  "area": "Living Room",
  "locationNote": "Wall",
  "usageNote": "Accent tile",
  "sortOrder": 2
}
```
**Status:** 201
**Raw Response:**
```json
{"item":{"id":"cmi92np72000hduqksjoeh3hu","projectId":"cmi92noy9000dduqkqkandqiw","productId":"cmi92nox6000cduqk8zfwbj9v","code":"HT-05-ALT","area":"Living Room","locationNote":"Wall","usageNote":"Accent tile","sortOrder":2,"createdAt":"2025-11-21T16:25:52.718Z","updatedAt":"2025-11-21T16:25:52.718Z","product":{"id":"cmi92nox6000cduqk8zfwbj9v","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"}}}}
```
**Result:** ✅ Schedule item B created with id = `cmi92np72000hduqksjoeh3hu`, code = `HT-05-ALT`.

## 7. List Schedule Items
**Request:** `GET /api/projects/cmi92noy9000dduqkqkandqiw/items`
**Status:** 200
**Raw Response:**
```json
{"items":[{"id":"cmi92np4b000fduqkyqtsaczn","projectId":"cmi92noy9000dduqkqkandqiw","productId":"cmi92nox6000cduqk8zfwbj9v","code":"HT-05","area":"Master Bedroom","locationNote":"Floor","usageNote":"Main tile","sortOrder":1,"createdAt":"2025-11-21T16:25:52.620Z","updatedAt":"2025-11-21T16:25:52.620Z","product":{"id":"cmi92nox6000cduqk8zfwbj9v","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"}}},{"id":"cmi92np72000hduqksjoeh3hu","projectId":"cmi92noy9000dduqkqkandqiw","productId":"cmi92nox6000cduqk8zfwbj9v","code":"HT-05-ALT","area":"Living Room","locationNote":"Wall","usageNote":"Accent tile","sortOrder":2,"createdAt":"2025-11-21T16:25:52.718Z","updatedAt":"2025-11-21T16:25:52.718Z","product":{"id":"cmi92nox6000cduqk8zfwbj9v","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"}}}]}
```
**Result:** ✅ Schedule items list includes both item A and item B.

## 8. Update Schedule Item A
**Request:** `PATCH /api/projects/cmi92noy9000dduqkqkandqiw/items/cmi92np4b000fduqkyqtsaczn`
**Body:**
```json
{
  "area": "Master Bedroom (Updated)",
  "locationNote": "Floor (Updated)"
}
```
**Status:** 200
**Raw Response:**
```json
{"item":{"id":"cmi92np4b000fduqkyqtsaczn","projectId":"cmi92noy9000dduqkqkandqiw","productId":"cmi92nox6000cduqk8zfwbj9v","code":"HT-05","area":"Master Bedroom (Updated)","locationNote":"Floor (Updated)","usageNote":"Main tile","sortOrder":1,"createdAt":"2025-11-21T16:25:52.620Z","updatedAt":"2025-11-21T16:25:52.974Z","product":{"id":"cmi92nox6000cduqk8zfwbj9v","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"}}}}
```
**Result:** ✅ Schedule item A update request accepted.

## 9. Swap Codes Between Item A and B
**Request:** `POST /api/projects/cmi92noy9000dduqkqkandqiw/items/swap-codes`
**Body:**
```json
{
  "itemIdA": "cmi92np4b000fduqkyqtsaczn",
  "itemIdB": "cmi92np72000hduqksjoeh3hu"
}
```
**Status:** 200
**Raw Response:**
```json
{"items":[{"id":"cmi92np4b000fduqkyqtsaczn","projectId":"cmi92noy9000dduqkqkandqiw","productId":"cmi92nox6000cduqk8zfwbj9v","code":"HT-05-ALT","area":"Master Bedroom (Updated)","locationNote":"Floor (Updated)","usageNote":"Main tile","sortOrder":1,"createdAt":"2025-11-21T16:25:52.620Z","updatedAt":"2025-11-21T16:25:53.102Z","product":{"id":"cmi92nox6000cduqk8zfwbj9v","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"}}},{"id":"cmi92np72000hduqksjoeh3hu","projectId":"cmi92noy9000dduqkqkandqiw","productId":"cmi92nox6000cduqk8zfwbj9v","code":"HT-05","area":"Living Room","locationNote":"Wall","usageNote":"Accent tile","sortOrder":2,"createdAt":"2025-11-21T16:25:52.718Z","updatedAt":"2025-11-21T16:25:53.101Z","product":{"id":"cmi92nox6000cduqk8zfwbj9v","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"}}}]}
```
**Result:** ✅ Swap codes request accepted. New codes: A=`HT-05-ALT`, B=`HT-05`.

## 10. Delete Schedule Item B
**Request:** `DELETE /api/projects/cmi92noy9000dduqkqkandqiw/items/cmi92np72000hduqksjoeh3hu`
**Status:** 200
**Raw Response:**
```json
{"deleted":true}
```
**Result:** ✅ Schedule item B delete request accepted.

## 11. List Schedule Items After Deletion
**Request:** `GET /api/projects/cmi92noy9000dduqkqkandqiw/items`
**Status:** 200
**Raw Response:**
```json
{"items":[{"id":"cmi92np4b000fduqkyqtsaczn","projectId":"cmi92noy9000dduqkqkandqiw","productId":"cmi92nox6000cduqk8zfwbj9v","code":"HT-05-ALT","area":"Master Bedroom (Updated)","locationNote":"Floor (Updated)","usageNote":"Main tile","sortOrder":1,"createdAt":"2025-11-21T16:25:52.620Z","updatedAt":"2025-11-21T16:25:53.102Z","product":{"id":"cmi92nox6000cduqk8zfwbj9v","sku":"P2-SMOKE-1763742352319","name":"Smoke Test Tile Phase2","internalCode":"HT-05","brand":{"id":"cmi92novr0009duqk00o6oxt3","name":"Smoke Brand Phase2"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"}}}]}
```
**Result:** ✅ Schedule item B no longer appears in the list.

## 12. Delete Project (optional cleanup)
**Request:** `DELETE /api/projects/cmi92noy9000dduqkqkandqiw`
**Status:** 200
**Raw Response:**
```json
{"deleted":true}
```
**Result:** ✅ Project delete request accepted.

---
Phase 2 smoke tests (Projects + Schedule) completed. Check the results above for PASS/FAIL details.