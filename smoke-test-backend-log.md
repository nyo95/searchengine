# Backend Smoke Test

Base URL: http://localhost:3000
User: smoketest-user
Date: 2025-11-21T17:55:57.355Z

---

## Catalog Meta
**Request:** `GET /api/catalog/meta`
**Status:** 200 ✅
**Response:**
```json
{
  "categories": [
    {
      "id": "cmi7p3dop0002dum0l9lvobac",
      "name": "Material",
      "nameEn": null,
      "normalizedName": "material",
      "productsCount": 5
    }
  ],
  "brands": [
    {
      "id": "cmi927j1h0007duqoq11pwd86",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "productsCount": 1
    },
    {
      "id": "cmi92gqdt000cduqoujctro3p",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "productsCount": 1
    },
    {
      "id": "cmi92njrn0000duqkpw10ul95",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "productsCount": 1
    },
    {
      "id": "cmi92novr0009duqk00o6oxt3",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "productsCount": 1
    },
    {
      "id": "cmi924ykx0002duqozxmfs409",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "productsCount": 1
    },
    {
      "id": "cmi95qwp70000du3wzqra4clk",
      "name": "TACO",
      "website": "http://www.taco.com",
      "phone": "123",
      "productsCount": 0
    }
  ]
}
```

## Categories
**Request:** `GET /api/catalog/categories`
**Status:** 200 ✅
**Response:**
```json
{
  "categories": [
    {
      "id": "cmi7p3dop0002dum0l9lvobac",
      "name": "Material",
      "children": []
    }
  ]
}
```

## Brands List
**Request:** `GET /api/brands`
**Status:** 200 ✅
**Response:**
```json
{
  "brands": [
    {
      "id": "cmi927j1h0007duqoq11pwd86",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "salesName": "Phase2",
      "salesContact": "phase2@example.com",
      "isActive": true,
      "createdAt": "2025-11-21T16:13:18.244Z",
      "updatedAt": "2025-11-21T16:13:18.244Z"
    },
    {
      "id": "cmi92gqdt000cduqoujctro3p",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "salesName": "Phase2",
      "salesContact": "phase2@example.com",
      "isActive": true,
      "createdAt": "2025-11-21T16:20:27.656Z",
      "updatedAt": "2025-11-21T16:20:27.656Z"
    },
    {
      "id": "cmi92njrn0000duqkpw10ul95",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "salesName": "Phase2",
      "salesContact": "phase2@example.com",
      "isActive": true,
      "createdAt": "2025-11-21T16:25:45.684Z",
      "updatedAt": "2025-11-21T16:25:45.684Z"
    },
    {
      "id": "cmi92novr0009duqk00o6oxt3",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "salesName": "Phase2",
      "salesContact": "phase2@example.com",
      "isActive": true,
      "createdAt": "2025-11-21T16:25:52.311Z",
      "updatedAt": "2025-11-21T16:25:52.311Z"
    },
    {
      "id": "cmi924ykx0002duqozxmfs409",
      "name": "Smoke Brand Phase2",
      "website": "https://example.com",
      "phone": "08123456789",
      "salesName": "Phase2",
      "salesContact": "phase2@example.com",
      "isActive": true,
      "createdAt": "2025-11-21T16:11:18.408Z",
      "updatedAt": "2025-11-21T17:51:22.663Z"
    },
    {
      "id": "cmi95qwp70000du3wzqra4clk",
      "name": "TACO",
      "website": "http://www.taco.com",
      "phone": "123",
      "salesName": "adi",
      "salesContact": "adi@sales.co",
      "isActive": true,
      "createdAt": "2025-11-21T17:52:21.259Z",
      "updatedAt": "2025-11-21T17:52:21.259Z"
    }
  ]
}
```

## Create Brand
**Request:** `POST /api/brands`
**Body:**
```json
{
  "name": "Smoke Brand w4nkxb",
  "website": null,
  "phone": null,
  "isActive": true
}
```
**Status:** 200 ✅
**Response:**
```json
{
  "brand": {
    "id": "cmi95vjub0002du3wlsqryvdj",
    "name": "Smoke Brand w4nkxb",
    "website": null,
    "phone": null,
    "salesName": null,
    "salesContact": null,
    "isActive": true,
    "createdAt": "2025-11-21T17:55:57.875Z",
    "updatedAt": "2025-11-21T17:55:57.875Z"
  }
}
```

## Products List
**Request:** `GET /api/products`
**Status:** 405 ❌

## Search Products
**Request:** `GET /api/search/products?q=tile`
**Status:** 200 ✅
**Response:**
```json
{
  "items": [
    {
      "id": "cmi92nox6000cduqk8zfwbj9v",
      "brandId": "cmi92novr0009duqk00o6oxt3",
      "categoryId": "cmi7p3dop0002dum0l9lvobac",
      "subcategoryId": "cmi7p3dou0004dum05tdmokuy",
      "sku": "P2-SMOKE-1763742352319",
      "name": "Smoke Test Tile Phase2",
      "description": null,
      "imageUrl": null,
      "internalCode": "HT-05",
      "brand": {
        "id": "cmi92novr0009duqk00o6oxt3",
        "name": "Smoke Brand Phase2"
      },
      "category": {
        "id": "cmi7p3dop0002dum0l9lvobac",
        "name": "Material"
      },
      "subcategory": {
        "id": "cmi7p3dou0004dum05tdmokuy",
        "name": "Homogeneous Tile",
        "prefix": "HT"
      },
      "dynamicAttributes": {
        "size": "600x600",
        "finish": "matt",
        "roughness": "R10"
      },
      "tags": [],
      "isActive": true,
      "createdAt": "2025-11-21T16:25:52.363Z",
      "updatedAt": "2025-11-21T16:25:52.363Z"
    },
    {
      "id": "cmi92njzv0003duqkbqtlmbao",
      "brandId": "cmi92njrn0000duqkpw10ul95",
      "categoryId": "cmi7p3dop0002dum0l9lvobac",
      "subcategoryId": "cmi7p3dou0004dum05tdmokuy",
      "sku": "P2-SMOKE-1763742345697",
      "name": "Smoke Test Tile Phase2",
      "description": null,
      "imageUrl": null,
      "internalCode": "HT-04",
      "brand": {
        "id": "cmi92njrn0000duqkpw10ul95",
        "name": "Smoke Brand Phase2"
      },
      "category": {
        "id": "cmi7p3dop0002dum0l9lvobac",
        "name": "Material"
      },
      "subcategory": {
        "id": "cmi7p3dou0004dum05tdmokuy",
        "name": "Homogeneous Tile",
        "prefix": "HT"
      },
      "dynamicAttributes": {
        "size": "600x600",
        "finish": "matt",
        "roughness": "R10"
      },
      "tags": [],
      "isActive": true,
      "createdAt": "2025-11-21T16:25:45.979Z",
      "updatedAt": "2025-11-21T16:25:45.979Z"
    },
    {
      "id": "cmi92gqfg000fduqo7lhu6ga4",
      "brandId": "cmi92gqdt000cduqoujctro3p",
      "categoryId": "cmi7p3dop0002dum0l9lvobac",
      "subcategoryId": "cmi7p3dou0004dum05tdmokuy",
      "sku": "P2-SMOKE-1763742027674",
      "name": "Smoke Test Tile Phase2",
      "description": null,
      "imageUrl": null,
      "internalCode": "HT-03",
      "brand": {
        "id": "cmi92gqdt000cduqoujctro3p",
        "name": "Smoke Brand Phase2"
      },
      "category": {
        "id": "cmi7p3dop0002dum0l9lvobac",
        "name": "Material"
      },
      "subcategory": {
        "id": "cmi7p3dou0004dum05tdmokuy",
        "name": "Homogeneous Tile",
        "prefix": "HT"
      },
      "dynamicAttributes": {
        "size": "600x600",
        "finish": "matt",
        "roughness": "R10"
      },
      "tags": [],
      "isActive": true,
      "createdAt": "2025-11-21T16:20:27.725Z",
      "updatedAt": "2025-11-21T16:20:27.725Z"
    },
    {
      "id": "cmi927j34000aduqoc0zc4thc",
      "brandId": "cmi927j1h0007duqoq11pwd86",
      "categoryId": "cmi7p3dop0002dum0l9lvobac",
      "subcategoryId": "cmi7p3dou0004dum05tdmokuy",
      "sku": "P2-SMOKE-1763741598252",
      "name": "Smoke Test Tile Phase2",
      "description": null,
      "imageUrl": null,
      "internalCode": "HT-02",
      "brand": {
        "id": "cmi927j1h0007duqoq11pwd86",
        "name": "Smoke Brand Phase2"
      },
      "category": {
        "id": "cmi7p3dop0002dum0l9lvobac",
        "name": "Material"
      },
      "subcategory": {
        "id": "cmi7p3dou0004dum05tdmokuy",
        "name": "Homogeneous Tile",
        "prefix": "HT"
      },
      "dynamicAttributes": {
        "size": "600x600",
        "finish": "matt",
        "roughness": "R10"
      },
      "tags": [],
      "isActive": true,
      "createdAt": "2025-11-21T16:13:18.304Z",
      "updatedAt": "2025-11-21T16:13:18.304Z"
    },
    {
      "id": "cmi924ymr0005duqofs1i7gn1",
      "brandId": "cmi924ykx0002duqozxmfs409",
      "categoryId": "cmi7p3dop0002dum0l9lvobac",
      "subcategoryId": "cmi7p3dou0004dum05tdmokuy",
      "sku": "P2-SMOKE-1763741478427",
      "name": "Smoke Test Tile Phase2",
      "description": null,
      "imageUrl": null,
      "internalCode": "HT-01",
      "brand": {
        "id": "cmi924ykx0002duqozxmfs409",
        "name": "Smoke Brand Phase2"
      },
      "category": {
        "id": "cmi7p3dop0002dum0l9lvobac",
        "name": "Material"
      },
      "subcategory": {
        "id": "cmi7p3dou0004dum05tdmokuy",
        "name": "Homogeneous Tile",
        "prefix": "HT"
      },
      "dynamicAttributes": {
        "size": "600x600",
        "finish": "matt",
        "roughness": "R10"
      },
      "tags": [],
      "isActive": true,
      "createdAt": "2025-11-21T16:11:18.484Z",
      "updatedAt": "2025-11-21T16:11:18.484Z"
    }
  ],
  "total": 5,
  "page": 1,
  "pageSize": 20,
  "hasMore": false
}
```

## Search Suggestions
**Request:** `GET /api/search/suggestions?q=tile`
**Status:** 200 ✅
**Response:**
```json
{
  "suggestions": [
    {
      "code": "HT-05",
      "name": "Smoke Test Tile Phase2",
      "brandName": "Smoke Brand Phase2"
    },
    {
      "code": "HT-04",
      "name": "Smoke Test Tile Phase2",
      "brandName": "Smoke Brand Phase2"
    },
    {
      "code": "HT-03",
      "name": "Smoke Test Tile Phase2",
      "brandName": "Smoke Brand Phase2"
    },
    {
      "code": "HT-02",
      "name": "Smoke Test Tile Phase2",
      "brandName": "Smoke Brand Phase2"
    },
    {
      "code": "HT-01",
      "name": "Smoke Test Tile Phase2",
      "brandName": "Smoke Brand Phase2"
    }
  ]
}
```

## Create Project
**Request:** `POST /api/projects`
**Body:**
```json
{
  "name": "Smoke Project 3c6y3b",
  "code": "SMK-CSF554",
  "clientName": "Smoke Client",
  "description": "Smoke test project"
}
```
**Status:** 201 ✅
**Response:**
```json
{
  "project": {
    "id": "cmi95vkfe0003du3wx7hdxcs8",
    "name": "Smoke Project 3c6y3b",
    "code": "SMK-CSF554",
    "clientName": "Smoke Client",
    "location": null,
    "description": "Smoke test project",
    "createdAt": "2025-11-21T17:55:58.634Z",
    "updatedAt": "2025-11-21T17:55:58.634Z",
    "itemCount": 0
  }
}
```

## List Projects
**Request:** `GET /api/projects`
**Status:** 200 ✅
**Response:**
```json
{
  "projects": [
    {
      "id": "cmi95vkfe0003du3wx7hdxcs8",
      "name": "Smoke Project 3c6y3b",
      "code": "SMK-CSF554",
      "clientName": "Smoke Client",
      "location": null,
      "description": "Smoke test project",
      "createdAt": "2025-11-21T17:55:58.634Z",
      "updatedAt": "2025-11-21T17:55:58.634Z",
      "itemCount": 0
    },
    {
      "id": "cmi95sle00001du3wpaqbmvht",
      "name": "Anomali Depok",
      "code": "205-123",
      "clientName": "YOGYA",
      "location": "Depok",
      "description": null,
      "createdAt": "2025-11-21T17:53:39.912Z",
      "updatedAt": "2025-11-21T17:53:39.912Z",
      "itemCount": 0
    }
  ]
}
```

## Update Project
**Request:** `PATCH /api/projects/cmi95vkfe0003du3wx7hdxcs8`
**Body:**
```json
{
  "name": "Smoke Project 3c6y3b (updated)"
}
```
**Status:** 200 ✅
**Response:**
```json
{
  "project": {
    "id": "cmi95vkfe0003du3wx7hdxcs8",
    "name": "Smoke Project 3c6y3b (updated)",
    "code": "SMK-CSF554",
    "clientName": "Smoke Client",
    "location": null,
    "description": "Smoke test project",
    "createdAt": "2025-11-21T17:55:58.634Z",
    "updatedAt": "2025-11-21T17:55:58.727Z",
    "itemCount": 0
  }
}
```

## Project Detail
**Request:** `GET /api/projects/cmi95vkfe0003du3wx7hdxcs8`
**Status:** 200 ✅
**Response:**
```json
{
  "project": {
    "id": "cmi95vkfe0003du3wx7hdxcs8",
    "name": "Smoke Project 3c6y3b (updated)",
    "code": "SMK-CSF554",
    "clientName": "Smoke Client",
    "location": null,
    "description": "Smoke test project",
    "createdAt": "2025-11-21T17:55:58.634Z",
    "updatedAt": "2025-11-21T17:55:58.727Z",
    "itemCount": 0
  }
}
```

## Create Schedule
**Request:** `POST /api/schedule`
**Body:**
```json
{
  "name": "Smoke Schedule n17ko0",
  "description": "Smoke schedule",
  "userId": "smoketest-user"
}
```
**Status:** 201 ✅
**Response:**
```json
{
  "schedule": {
    "id": "acb4975d-a47f-4c6a-aab2-65b9deb0f174",
    "name": "Smoke Schedule n17ko0",
    "description": "Smoke schedule",
    "userId": "smoketest-user",
    "createdAt": "2025-11-21T17:55:58.812Z",
    "updatedAt": "2025-11-21T17:55:58.812Z"
  }
}
```

## List Schedules
**Request:** `GET /api/schedule?userId=smoketest-user`
**Status:** 200 ✅
**Response:**
```json
{
  "schedules": [
    {
      "id": "acb4975d-a47f-4c6a-aab2-65b9deb0f174",
      "name": "Smoke Schedule n17ko0",
      "description": "Smoke schedule",
      "userId": "smoketest-user",
      "createdAt": "2025-11-21T17:55:58.812Z",
      "updatedAt": "2025-11-21T17:55:58.812Z",
      "itemsCount": 0
    }
  ]
}
```

## Add Schedule Item
**Request:** `POST /api/schedule/items`
**Body:**
```json
{
  "scheduleId": "acb4975d-a47f-4c6a-aab2-65b9deb0f174",
  "code": "CODE-3pw3ov",
  "quantity": 1,
  "unitOfMeasure": "pcs"
}
```
**Status:** 201 ✅
**Response:**
```json
{
  "item": {
    "id": "e4c963c2-0d20-4115-a5a5-6529ef17f15a",
    "scheduleId": "acb4975d-a47f-4c6a-aab2-65b9deb0f174",
    "productId": null,
    "code": "CODE-3pw3ov",
    "quantity": 1,
    "unitOfMeasure": "pcs"
  }
}
```

---
Smoke test complete.