# Material Scheduler Catalog

Portal komprehensif untuk mengelola katalog material, brand, dan project scheduler yang menyesuaikan alur SketchUp *Material Scheduler*.

## Fokus utama

- **Katalog dinamis**: hubungkan brand → kategori → subkategori → product types → product/schedule item tanpa duplikat.
- **Project schedule**: impor CSV dari plugin SketchUp, tambah material manual, swap kode terkontrol, dan jauhkan penomoran unik.
- **Admin-ready**: pengelolaan brand/contact/sales per subkategori plus pemetaan prefix kategori untuk scheduler.
- **UX/monitoring**: dashboard minimal dengan notifikasi loading/error, responsive layout, dan kontrol akses `anonymous`.

## Setup lokal

1. Copy `.env.example` ke `.env` dan pastikan `DATABASE_URL` mengarah ke PostgreSQL lokal (contoh: `postgresql://user:password@localhost:5432/catalog`).
2. `npm install`
3. `npx prisma migrate dev` lalu `npm run db:seed`
4. `npm run dev` → buka http://localhost:3000

## Testing dan validasi

- `npm run lint`
- `npx prisma migrate dev` (setelah schema berubah)
- Manual: verifikasi penomoran kode unik, normalisasi kategori, dan rollback swap lewat `/api/*` sesuai dokumentasi

## Catatan

- Semua data bergerak lewat API di `src/app/api/*`; UI memakai `@/components/*` dan `@/hooks/*`.
- Resource visual (styles, tokens) didefinisikan di `src/app/globals.css` dengan tema gelap/terang.
- Prisma client di-`generate` dengan `npm run db:generate` bila schema berubah.
