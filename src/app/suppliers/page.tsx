export default function SuppliersPortalPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">Supplier Portal</h1>
          <p className="text-sm text-muted-foreground">
            Dashboard khusus supplier untuk mengirimkan katalog material, update stock, dan melihat permintaan proyek.
          </p>
        </header>
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
          <p>Integrasi supplier portal akan memperlihatkan onboarding dan feed material dari vendor.</p>
        </div>
      </div>
    </div>
  )
}
