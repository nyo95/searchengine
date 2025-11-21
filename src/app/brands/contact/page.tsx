export default function BrandContactsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">Contact Management</h1>
          <p className="text-sm text-muted-foreground">
            Kelola sales per brand + subkategori, termasuk email & contact sales yang bertanggung jawab setiap wilayah.
          </p>
        </header>
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
          <p>Form contact management akan muncul di sini agar tim sales bisa terhubung dengan scheduler.</p>
        </div>
      </div>
    </div>
  )
}
