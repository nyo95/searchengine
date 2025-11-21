export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">Category Management</h1>
          <p className="text-sm text-muted-foreground">
            Implikasi kategori dan subkategori langsung tercatat saat menambahkan produk baru. Semua kategori dipetakan dengan prefix untuk scheduler.
          </p>
        </header>
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
          <p>List kategori + subkategori akan ditampilkan di sini bersamaan dengan metadata prefix dan jumlah produk.</p>
        </div>
      </div>
    </div>
  )
}
