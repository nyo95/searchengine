# Backend Phase 1 Smoke Test Log (Fixed Script)

Base URL: http://localhost:3000
Date: 2025-11-21T15:14:24.803Z

---
Starting Phase 1 smoke tests (Brand + Product + Search)...

## 1. Create Brand
**Request:** `POST /api/brands`
**Body:**
```json
{
  "name": "Test Brand X",
  "website": "https://example.com",
  "phone": "08123456789",
  "salesName": "Budi",
  "salesContact": "budi@example.com"
}
```
**Status:** 200
**Raw Response:**
```json
{"brand":{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:14:25.544Z","updatedAt":"2025-11-21T15:14:25.544Z"}}
```
**Result:** ✅ Brand created with id = `cmi903t6w0000duqopuahxcze`

## 2. Get Active Brands
**Request:** `GET /api/brands`
**Status:** 200
**Raw Response:**
```json
{"brands":[{"id":"cmi7o31270000dum0mdev0bqs","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-20T16:50:07.519Z","updatedAt":"2025-11-20T16:50:08.594Z"},{"id":"cmi7p3dbf0001dum0x37zk8ew","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-20T17:18:23.009Z","updatedAt":"2025-11-20T17:18:23.346Z"},{"id":"cmi8zdf210000dua846cnujlk","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T14:53:54.167Z","updatedAt":"2025-11-21T14:53:55.276Z"},{"id":"cmi8zsmpu0004dua8wrmqm0o4","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:05:43.937Z","updatedAt":"2025-11-21T15:05:44.310Z"},{"id":"cmi8zv0vd0008dua8xcax9dnn","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:07:35.593Z","updatedAt":"2025-11-21T15:07:35.903Z"},{"id":"cmi8zvseb0009dua8ypzs3nrx","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:08:11.266Z","updatedAt":"2025-11-21T15:08:11.541Z"},{"id":"cmi901lpp000adua8otw1uj4d","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:12:42.528Z","updatedAt":"2025-11-21T15:12:42.905Z"},{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:14:25.544Z","updatedAt":"2025-11-21T15:14:25.544Z"}]}
```
**Result:** ✅ Brands list returned.

## 3. Soft Delete Brand
**Request:** `PATCH /api/brands/cmi903t6w0000duqopuahxcze`
**Body:**
```json
{
  "isActive": false
}
```
**Status:** 200
**Raw Response:**
```json
{"brand":{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":false,"createdAt":"2025-11-21T15:14:25.544Z","updatedAt":"2025-11-21T15:14:26.506Z"}}
```
**Result:** ✅ Soft delete request accepted.

## 4. Get Active Brands After Soft Delete
**Request:** `GET /api/brands`
**Status:** 200
**Raw Response:**
```json
{"brands":[{"id":"cmi7o31270000dum0mdev0bqs","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-20T16:50:07.519Z","updatedAt":"2025-11-20T16:50:08.594Z"},{"id":"cmi7p3dbf0001dum0x37zk8ew","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-20T17:18:23.009Z","updatedAt":"2025-11-20T17:18:23.346Z"},{"id":"cmi8zdf210000dua846cnujlk","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T14:53:54.167Z","updatedAt":"2025-11-21T14:53:55.276Z"},{"id":"cmi8zsmpu0004dua8wrmqm0o4","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:05:43.937Z","updatedAt":"2025-11-21T15:05:44.310Z"},{"id":"cmi8zv0vd0008dua8xcax9dnn","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:07:35.593Z","updatedAt":"2025-11-21T15:07:35.903Z"},{"id":"cmi8zvseb0009dua8ypzs3nrx","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:08:11.266Z","updatedAt":"2025-11-21T15:08:11.541Z"},{"id":"cmi901lpp000adua8otw1uj4d","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:12:42.528Z","updatedAt":"2025-11-21T15:12:42.905Z"}]}
```
**Result:** ✅ Brand with id = `cmi903t6w0000duqopuahxcze` is no longer in the active list.

## 5. Revive Brand
**Request:** `PATCH /api/brands/cmi903t6w0000duqopuahxcze`
**Body:**
```json
{
  "isActive": true
}
```
**Status:** 200
**Raw Response:**
```json
{"brand":{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:14:25.544Z","updatedAt":"2025-11-21T15:14:26.675Z"}}
```
**Result:** ✅ Brand revive request accepted.

## 6. Get Active Brands After Revive
**Request:** `GET /api/brands`
**Status:** 200
**Raw Response:**
```json
{"brands":[{"id":"cmi7o31270000dum0mdev0bqs","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-20T16:50:07.519Z","updatedAt":"2025-11-20T16:50:08.594Z"},{"id":"cmi7p3dbf0001dum0x37zk8ew","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-20T17:18:23.009Z","updatedAt":"2025-11-20T17:18:23.346Z"},{"id":"cmi8zdf210000dua846cnujlk","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T14:53:54.167Z","updatedAt":"2025-11-21T14:53:55.276Z"},{"id":"cmi8zsmpu0004dua8wrmqm0o4","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:05:43.937Z","updatedAt":"2025-11-21T15:05:44.310Z"},{"id":"cmi8zv0vd0008dua8xcax9dnn","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:07:35.593Z","updatedAt":"2025-11-21T15:07:35.903Z"},{"id":"cmi8zvseb0009dua8ypzs3nrx","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:08:11.266Z","updatedAt":"2025-11-21T15:08:11.541Z"},{"id":"cmi901lpp000adua8otw1uj4d","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:12:42.528Z","updatedAt":"2025-11-21T15:12:42.905Z"},{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X","website":"https://example.com","phone":"08123456789","salesName":"Budi","salesContact":"budi@example.com","isActive":true,"createdAt":"2025-11-21T15:14:25.544Z","updatedAt":"2025-11-21T15:14:26.675Z"}]}
```
**Result:** ✅ Brand with id = `cmi903t6w0000duqopuahxcze` appears again in active list.

## 7. Create Product
**Request:** `POST /api/products`
**Body:**
```json
{
  "name": "Homogeneous Tile White 60x60",
  "sku": "HT-6060-WH-X",
  "brandId": "cmi903t6w0000duqopuahxcze",
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
{"product":{"id":"cmi8zsn5l0007dua874ntf7pg","brandId":"cmi903t6w0000duqopuahxcze","categoryId":"cmi7p3dop0002dum0l9lvobac","subcategoryId":"cmi7p3dou0004dum05tdmokuy","sku":"HT-6060-WH-X","name":"Homogeneous Tile White 60x60","description":null,"imageUrl":null,"internalCode":"HT-01","brand":{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"},"dynamicAttributes":{"size":"600x600","finish":"matt","roughness":"R10"},"tags":[],"isActive":true,"createdAt":"2025-11-21T15:05:44.505Z","updatedAt":"2025-11-21T15:14:27.021Z"}}
```
**Result:** ✅ Product created with id = `cmi8zsn5l0007dua874ntf7pg`, subcategoryId = `cmi7p3dou0004dum05tdmokuy`.

## 8. Get Product Detail
**Request:** `GET /api/products/cmi8zsn5l0007dua874ntf7pg`
**Status:** 200
**Raw Response:**
```json
{"product":{"id":"cmi8zsn5l0007dua874ntf7pg","brandId":"cmi903t6w0000duqopuahxcze","categoryId":"cmi7p3dop0002dum0l9lvobac","subcategoryId":"cmi7p3dou0004dum05tdmokuy","sku":"HT-6060-WH-X","name":"Homogeneous Tile White 60x60","description":null,"imageUrl":null,"internalCode":"HT-01","brand":{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"},"dynamicAttributes":{"size":"600x600","finish":"matt","roughness":"R10"},"tags":[],"isActive":true,"createdAt":"2025-11-21T15:05:44.505Z","updatedAt":"2025-11-21T15:14:27.021Z"}}
```
**Result:** ✅ Product detail retrieved.

## 9. Update Product (PATCH)
**Request:** `PATCH /api/products/cmi8zsn5l0007dua874ntf7pg`
**Body:**
```json
{
  "name": "Homogeneous Tile White 60x60 (Updated)",
  "dynamicAttributes": {
    "size": "600x600",
    "finish": "glossy",
    "roughness": "R10"
  }
}
```
**Status:** 200
**Raw Response:**
```json
{"product":{"id":"cmi8zsn5l0007dua874ntf7pg","brandId":"cmi903t6w0000duqopuahxcze","categoryId":"cmi7p3dop0002dum0l9lvobac","subcategoryId":"cmi7p3dou0004dum05tdmokuy","sku":"HT-6060-WH-X","name":"Homogeneous Tile White 60x60 (updated)","description":null,"imageUrl":null,"internalCode":"HT-01","brand":{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"},"dynamicAttributes":{"size":"600x600","finish":"glossy","roughness":"R10"},"tags":[],"isActive":true,"createdAt":"2025-11-21T15:05:44.505Z","updatedAt":"2025-11-21T15:14:27.987Z"}}
```
**Result:** ✅ Product update request accepted.

## 10. Search Products (q=tile)
**Request:** `GET /api/search/products?q=tile`
**Status:** 200
**Raw Response:**
```json
{"items":[{"id":"cmi8zsn5l0007dua874ntf7pg","brandId":"cmi903t6w0000duqopuahxcze","categoryId":"cmi7p3dop0002dum0l9lvobac","subcategoryId":"cmi7p3dou0004dum05tdmokuy","sku":"HT-6060-WH-X","name":"Homogeneous Tile White 60x60 (updated)","description":null,"imageUrl":null,"internalCode":"HT-01","brand":{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"},"dynamicAttributes":{"size":"600x600","finish":"glossy","roughness":"R10"},"tags":[],"isActive":true,"createdAt":"2025-11-21T15:05:44.505Z","updatedAt":"2025-11-21T15:14:27.987Z"}],"total":1,"page":1,"pageSize":20,"hasMore":false}
```
**Result:** ✅ Created product (id=cmi8zsn5l0007dua874ntf7pg) appears in search results.

## 11. Deactivate Product
**Request:** `PATCH /api/products/cmi8zsn5l0007dua874ntf7pg`
**Body:**
```json
{
  "isActive": false
}
```
**Status:** 200
**Raw Response:**
```json
{"product":{"id":"cmi8zsn5l0007dua874ntf7pg","brandId":"cmi903t6w0000duqopuahxcze","categoryId":"cmi7p3dop0002dum0l9lvobac","subcategoryId":"cmi7p3dou0004dum05tdmokuy","sku":"HT-6060-WH-X","name":"Homogeneous Tile White 60x60 (updated)","description":null,"imageUrl":null,"internalCode":"HT-01","brand":{"id":"cmi903t6w0000duqopuahxcze","name":"Test Brand X"},"category":{"id":"cmi7p3dop0002dum0l9lvobac","name":"Material"},"subcategory":{"id":"cmi7p3dou0004dum05tdmokuy","name":"Homogeneous Tile","prefix":"HT"},"dynamicAttributes":{"size":"600x600","finish":"glossy","roughness":"R10"},"tags":[],"isActive":false,"createdAt":"2025-11-21T15:05:44.505Z","updatedAt":"2025-11-21T15:14:28.404Z"}}
```
**Result:** ✅ Product deactivation request accepted.

## 12. Search Products After Deactivation (q=tile)
**Request:** `GET /api/search/products?q=tile`
**Status:** 200
**Raw Response:**
```json
{"items":[],"total":0,"page":1,"pageSize":20,"hasMore":false}
```
**Result:** ✅ Deactivated product (id=cmi8zsn5l0007dua874ntf7pg) no longer appears in search results.

## 13. Search Products by Brand
**Request:** `GET /api/search/products?q=tile&brandId=cmi903t6w0000duqopuahxcze`
**Status:** 200
**Raw Response:**
```json
{"items":[],"total":0,"page":1,"pageSize":20,"hasMore":false}
```
**Result:** ✅ Search by brand request succeeded.

## 14. Search Products by Subcategory
**Request:** `GET /api/search/products?q=tile&subcategoryId=cmi7p3dou0004dum05tdmokuy`
**Status:** 200
**Raw Response:**
```json
{"items":[],"total":0,"page":1,"pageSize":20,"hasMore":false}
```
**Result:** ✅ Search by subcategory request succeeded.

## 15. Search Suggestions (q=tile)
**Request:** `GET /api/search/suggestions?q=tile`
**Status:** 200
**Raw Response:**
```json
{"suggestions":[]}
```
**Result:** ✅ Suggestions request succeeded.

---
Phase 1 smoke tests (fixed script) completed. Check the results above for PASS/FAIL details.
