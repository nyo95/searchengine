import Link from 'next/link'

const quickLinks = [
  { label: 'Preferences', href: '/settings/preferences' },
  { label: 'System Admin', href: '/settings/system-admin' },
]

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Atur preferensi pengguna, role, dan kontrol sistem untuk menjaga konsistensi database dan workflow scheduler.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-border/60 bg-background/80 p-4 text-sm font-medium text-primary transition hover:border-primary"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
