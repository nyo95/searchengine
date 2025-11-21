'use client'

import { Button } from '@/components/ui/button'

export default function SystemAdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-5 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">System Admin</h1>
          <p className="text-sm text-muted-foreground">
            Kontrol akses, audit log, dan pengaturan global seperti sync katalog, backup, dan script maintenance.
          </p>
        </header>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-6 space-y-4">
          <p className="text-xs text-muted-foreground">
            Tombol di bawah menjalankan perintah maintenance—pastikan Anda punya hak akses sebelum menekan.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline">Rebuild Catalog</Button>
            <Button variant="outline">Export Logs</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
