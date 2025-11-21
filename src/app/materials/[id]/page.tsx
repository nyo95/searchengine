type MaterialsParams = {
  params: {
    id: string
  }
}

export default function MaterialDetailPage({ params }: MaterialsParams) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border/60 bg-card/70 p-6">
        <h1 className="text-3xl font-semibold">Material Detail</h1>
        <p className="text-sm text-muted-foreground">
          Menampilkan detail material dengan ID <span className="font-mono text-primary">{params.id}</span>. Akan menampilkan atribut kategori, prefix kode, dan data produk terkait.
        </p>
      </div>
    </div>
  )
}
