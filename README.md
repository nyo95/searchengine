## Architecture Catalog & Material Scheduler

Localized catalog untuk material, lighting, furniture, dan hardware dengan fokus:

- search engine yang ringan dan bilingual,
- material scheduler per project yang sinkron dengan plugin SketchUp **Material Scheduler**,
- pengelolaan brand & subkategori (mis. `Material → High Pressure Laminate`).

Stack: **Next.js App Router + Prisma + PostgreSQL**. UI mengikuti scaffold Z.ai (`Search | Projects | Brands`).  
Schedule di sini adalah **daftar spesifikasi**, *bukan* alat menghitung BQ / grand total biaya.

---

### 1. Prerequisites

| Requirement    | Notes                                                   |
| -------------- | ------------------------------------------------------- |
| Node.js 18+    | Cocok dengan Next.js 15 + Turbopack                    |
| PostgreSQL 14+ | Database `catalog` dengan akses lokal (lihat `.env`)   |

Buat `.env` di root repo:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/catalog"
```

---

### 2. Install & Prepare Database

```bash
npm install
npm run db:generate     # optional, cepat
npm run db:migrate      # apply seluruh migration Prisma
npm run db:seed         # kosongkan DB & buat user 'anonymous'
```

Seed **tidak lagi** memuat demo produk/brand – katalog dimulai kosong (kelopak bunga).  
Semua data diisi lewat import CSV atau input manual dari UI.

---

### 3. Run the App

```bash
npm run dev       # menggunakan Turbopack
# buka http://localhost:3000
```

Semua traffic menggunakan user `anonymous` sehingga learning signal tetap internal.

---

### 4. Fitur Utama

#### 4.1 Search

- Input keyword + synonyms (mis. `kursi` / `chair`, `hpl` / `laminate`).
- Filter by **Category** dan **Brand**.
- Ranking berdasarkan **viewCount** + **usageCount** (jumlah item yang dipakai di schedule).
- Harga (`basePrice` / `priceRange`) hanya informasi opsional di kartu, **bukan** filter / sorting.

#### 4.2 Projects & Project Material Schedule

- Tab **Projects**:
  - Membuat project baru (ProjectSchedule).
  - Menampilkan daftar project dengan jumlah item.
- Halaman `/projects/[id]/schedule`:
  - Tabel **Items** (Project Material Schedule) dengan kolom:
    - **Material Type** – `kind_label` dari CSV atau manual input.
    - **Brand** – nama brand (bisa diubah dari dropdown).
    - **SKU / Type** – subtype / kode item.
    - **Notes** – catatan material.
  - **Import CSV**:
    - Format utama mengikuti plugin SketchUp *Material Scheduler*:
      - Header minimal: `code, kind_label, brand, subtype, notes, …`
      - Semua baris akan tampil di schedule.
      - Baris dengan `brand + subtype` lengkap:
        - otomatis membuat / menghubungkan **Brand**, **ProductType**, **Product** di katalog.
      - Baris tanpa brand/SKU lengkap:
        - tetap disimpan sebagai baris schedule (snapshot), **tanpa** membuat Product/Brand baru.
      - Import file yang sama berulang **tidak** menduplikasi baris (dedup `(scheduleId, brandName, sku)`).
  - **Add Material**:
    - Tambah satu baris material manual (Material Type, Brand, SKU, Notes).
    - Jika brand+SKU lengkap, akan di‑bind ke katalog; jika tidak, disimpan sebagai snapshot saja.
  - `quantity`, `unitOfMeasure`, `price` disimpan sebagai metadata opsional dan tidak dipakai untuk menghitung total.

#### 4.3 Brands Workspace

- Tab **Brands**:
  - Filter by kategori / subkategori dan search by nama brand.
  - Tabel brand: **Brand, Website, Email, Contact, Subcategories, Products**.
- Halaman `/brands/[id]` (Brand Detail):
  - **Brand Information** – edit website, email, contact.
  - **Subcategory Contacts**:
    - List subkategori yang sudah terhubung ke brand (mis. `High Pressure Laminate`).
    - Sales Email + Sales Contact per subkategori.
    - Input “link new subcategory”:
      - Jika nama subkategori sudah ada sebagai child `Category` di bawah kategori utama brand → hanya bind.
      - Jika belum ada → otomatis membuat `Category` baru sebagai subkategori & bind ke brand.

---

### 5. API Highlights

| Endpoint                                         | Purpose                                                                                           |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `GET /api/search?q=&userId=`                     | Catalog search dengan filter `category`, `brand`, pagination (tanpa filter harga).               |
| `GET /api/suggestions?q=`                        | Type‑ahead suggestions (products, brands, types, synonyms).                                      |
| `POST /api/activity`                             | Tracking `SEARCH`, `CLICK_PRODUCT`, `VIEW_PRODUCT`, `ADD_TO_SCHEDULE`, dll.                      |
| `GET /api/schedule?userId=`                      | List project schedules untuk user.                                                               |
| `POST /api/schedule`                             | Buat schedule/project baru.                                                                      |
| `GET/POST/PATCH/DELETE /api/schedule/items`      | Baca/tambah/update/hapus baris schedule.                                                         |
| `POST /api/schedule/items/import`                | Import CSV (format plugin Material Scheduler: `code, kind_label, brand, subtype, notes, …`).     |
| `POST /api/schedule/items/manual`                | Tambah satu baris material manual ke schedule.                                                   |
| `GET /api/catalog/meta`                          | Category + brand metadata dengan product counts (untuk filter Search).                           |
| `GET /api/catalog/categories`                    | Daftar kategori + subkategori (parent/child) untuk Brands UI.                                    |
| `GET /api/brands`                                | List brand dengan metadata + subcategory summary.                                                |
| `GET /api/brands/[id]` / `PATCH /api/brands/[id]`| Detail & update brand (website/email/contact).                                                   |
| `PATCH /api/brands/[id]/subcategory/[subId]`     | Link brand ↔ subkategori + isi Sales Email / Sales Contact.                                      |
| `GET/POST /api/products/[id]/*`                  | Edit deskripsi produk, media (gambar/datasheet/CAD), dan varian.                                |

---

### 6. Typical Workflow

1. **Buat project schedule**
   - Buka tab **Projects** → klik `New Project` → isi nama & deskripsi.
2. **Import dari SketchUp**
   - Dari SketchUp plugin *Material Scheduler*, export CSV (header minimal `code, kind_label, brand, subtype, notes`).  
   - Di halaman `/projects/[id]/schedule`, klik `Import CSV` dan pilih file tersebut.
   - Semua baris akan muncul di tabel Items; tidak ada baris yang hilang.
3. **Tambah / koreksi material**
   - Jika perlu tambahkan baris manual via `Add Material`.
   - Edit brand / notes / material type dari tabel; untuk SKU kritikal kamu bisa kaitkan ke catalog product detail lewat `Edit Product` (jika baris sudah punya `productId`).
4. **Cari & lihat detail produk**
   - Di tab **Search**, gunakan search bar + filter Category/Brand untuk menemukan produk.  
   - Klik kartu untuk masuk ke halaman detail produk (gambar, atribut, resources) dan Add to Schedule project tertentu.
5. **Kelola brand & subkategori**
   - Di tab **Brands**, klik salah satu brand untuk mengatur website/email/contact serta subkategori (mis. `High Pressure Laminate`, `Homogeneous Tile`).  
   - Gunakan field “link new subcategory” untuk menambah/bind subkategori baru.

---

### 7. Repository Notes

- Fitur yang sudah di‑drop: dashboard Insights, trending API, total biaya (grand total) di schedule, dan editor `/schedule` lama.
- Seed (`prisma/seed.ts`) hanya membersihkan database dan menyiapkan user `anonymous`; seluruh data nyata berasal dari CSV dan input user.
- UI tetap mengikuti styling Z.ai; perubahan hanya pada wiring logic dan API supaya cocok dengan workflow *Material Scheduler* + katalog produk. 

