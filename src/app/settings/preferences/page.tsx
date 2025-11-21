'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function PreferencesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">Preferences</h1>
          <p className="text-sm text-muted-foreground">
            Set personalize view—fokus awal ke search atau schedule, atur notifikasi, dan preferensi bahasa/X.
          </p>
        </header>
        <div className="rounded-2xl border border-border/60 bg-card/60 p-5 space-y-4">
          <div>
            <Label>Default tab</Label>
            <Input placeholder="Contoh: Catalog" />
          </div>
          <div>
            <Label>Notifikasi email</Label>
            <Input placeholder="Pilih frekuensi" />
          </div>
        </div>
      </div>
    </div>
  )
}
