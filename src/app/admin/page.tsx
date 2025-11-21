export default function AdminPanelPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl space-y-5 px-4 py-6">
        <header className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h1 className="text-2xl font-semibold">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Monitoring sistem, audit logs, dan kontrol role-based access (RBAC) agar backlog bisa dikendalikan.
          </p>
        </header>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-card/60 p-5 text-sm text-muted-foreground">
            <p>Audit logs (user, schedule, catalog): di sini akan ditampilkan ringkasan log.</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card/60 p-5 text-sm text-muted-foreground">
            <p>Role management: ganti akses admin, curators, reviewer, dan guest.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
