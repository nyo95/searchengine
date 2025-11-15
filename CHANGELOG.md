# Changelog

## Fase 1 – UX Designer
- Tambahan metadata kategori/subkategori di API katalog sehingga Project Schedule bisa menampilkan hierarki produk.
- Project Schedule Tab diperbarui: ada input nama material, dropdown kategori, dan filtering tipe material agar designer cukup mengisi data minimal (nama, kategori, subkategori, brand, SKU).
- Tombol aksi dinonaktifkan saat data belum lengkap atau sedang disimpan; tampilan diberi penjelasan agar alur designer mirip plugin material schedule.

## Fase 2 – Admin Dashboard
- Endpoint `POST /api/products` kini menerima field lengkap (kategori, nama EN, base price, keywords) serta validasi brand/type agar siap dipakai kurator.
- Halaman baru `/admin` menyediakan dashboard dengan tab “Daftar Produk” (daftar + pencarian cepat) dan “Tambah Produk” (form lengkap, atribut, variant awal, upload media).
- Form admin otomatis memuat metadata brand/kategori/subkategori, mem-filter tipe berdasarkan pilihan brand & kategori, serta mengunggah gambar ke endpoint bawaan.

## Fase 3 – Sinkronisasi Role & Data
- Schedule Items sekarang menjaga referensi katalog secara ketat: API `POST /api/schedule/items` memverifikasi brand & tipe produk, sedangkan `PATCH` menolak penulisan SKU bebas.
- Modal “Add to Schedule” hanya mengirim ID katalog (brand/product type) + atribut varian; API yang menghitung prefix kode atau nama produk memegang otoritas.
- Project Schedule Tab menambahkan mode toggle Designer/Admin dengan deskripsi berbeda; walau UI masih seragam, flow ini mempersiapkan role separation tanpa login.
