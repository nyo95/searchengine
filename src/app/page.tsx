'use client'

import { Calendar, Compass, Layers, Search } from 'lucide-react'
import { ProductCatalogTab } from '@/components/product/product-catalog-tab'
import { ProjectScheduleTab } from '@/components/projects/project-schedule-tab'
import { SidebarMenu } from '@/components/navigation/sidebar-menu'

const USER_ID = 'anonymous'

const workflowPhases = [
  {
    title: 'Discovery Phase',
    description: 'Search → Materials → Categories to lock metadata sebelum masuk planning.',
    icon: Search,
    bullets: ['Cari berdasarkan nama/SKU/brand', 'Simpan kategori/subkategori untuk mencegah duplikat'],
  },
  {
    title: 'Planning Phase',
    description: 'Projects → Templates → New Project agar satu blueprint bisa diulang.',
    icon: Layers,
    bullets: ['Pilih template, pindahkan ke proyek baru', 'Kaitkan brand + prefix subkategori'],
  },
  {
    title: 'Execution Phase',
    description: 'Project Detail → Schedule Items untuk swap kode & validasi prefix.',
    icon: Calendar,
    bullets: ['Pantau kode prefix/nomor unik', 'Swap hanya untuk material dengan prefix sama'],
  },
  {
    title: 'Resource Phase',
    description: 'Brands → Contacts → Supplier Portal untuk koordinasi vendor.',
    icon: Compass,
    bullets: ['Review data brand', 'Kelola kontak sales per subkategori'],
  },
]

const stats = [
  { title: 'Projects aktif', value: '12', meta: '2 baru ditambahkan minggu ini' },
  { title: 'Products tersimpan', value: '1.084', meta: '78 kategori terdaftar' },
  { title: 'Schedule codes', value: '214', meta: '98% prefix valid' },
  { title: 'Brand partnerships', value: '38', meta: '14 contact sales di-update' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <SidebarMenu className="lg:sticky lg:top-6" />
        <main className="space-y-6">
          <section className="space-y-3 rounded-2xl bg-card/70 border border-border/60 p-6 shadow-xl shadow-slate-900/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">Overview</p>
                <h1 className="text-3xl font-semibold">Project Control Center</h1>
                <p className="text-sm text-muted-foreground">
                  Menu diatur berdasarkan workflow (discovery → planning → execution → resource).
                </p>
              </div>
              <span className="rounded-full bg-primary/20 px-4 py-2 text-sm font-semibold text-primary">
                Sistem Online
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {stats.map((stat) => (
                <div key={stat.title} className="rounded-xl bg-background/60 p-4 shadow-inner shadow-slate-900/20">
                  <p className="text-sm uppercase text-muted-foreground">{stat.title}</p>
                  <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.meta}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <div className="glass-panel">
              <h2 className="text-lg font-semibold text-foreground">Material Catalog Snapshot</h2>
              <p className="text-sm text-muted-foreground">
                Fokus discovery: bisa cari berdasarkan kategori, brand, atau SKU untuk memastikan metadata lengkap.
              </p>
              <ProductCatalogTab userId={USER_ID} />
            </div>
            <div className="glass-panel">
              <h2 className="text-lg font-semibold text-foreground">Project Schedule Quick View</h2>
              <p className="text-sm text-muted-foreground">
                Eksekusi: view baris schedule, cek kode prefix/nomor, dan lihat fitur swap di satu tempat.
              </p>
              <ProjectScheduleTab userId={USER_ID} />
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            {workflowPhases.map((phase) => (
              <article key={phase.title} className="glass-panel">
                <div className="flex items-center gap-2">
                  <phase.icon className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">{phase.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{phase.description}</p>
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {phase.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-2">
                      <span className="h-1 w-1 rounded-full bg-primary" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </section>
        </main>
      </div>
    </div>
  )
}
