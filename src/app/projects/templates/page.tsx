export default function ProjectTemplatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">Project Templates</h1>
          <p className="text-sm text-muted-foreground">
            Gunakan template project sebagai kannvas untuk proyek baru. Setiap template menahan daftar schedule item + brand yang sudah diset.
          </p>
        </header>
        <div className="rounded-2xl border border-dashed border-border/60 bg-background/70 p-6 text-sm text-muted-foreground">
          <p>Template akan diatur di sini agar proses planning lebih cepat.</p>
        </div>
      </div>
    </div>
  )
}
