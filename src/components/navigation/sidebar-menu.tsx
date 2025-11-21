import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import {
  FileText,
  Folder,
  LayoutDashboard,
  Layers,
  ListChecks,
  Map,
  Search,
  Settings,
  ShoppingBag,
  Stack,
  Users,
} from 'lucide-react'

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    description: 'Ringkasan aktifitas & status sistem.',
    icon: LayoutDashboard,
    items: [{ name: 'Dashboard', href: '/', description: 'Ringkasan KPI & workflow terakhir.' }],
  },
  {
    title: 'Material Management',
    description: 'Kelola katalog material, search & kategori.',
    icon: Search,
    items: [
      { name: 'Search & Discovery', href: '/search', description: 'Cari melalui nama, brand, SKU.' },
      { name: 'Material Catalog', href: '/materials', description: 'List SKU lengkap + atribut.' },
      { name: 'Categories', href: '/categories', description: 'Kelola kategori & prefix.' },
    ],
  },
  {
    title: 'Project Management',
    description: 'Perencanaan dan jadwal proyek.',
    icon: FileText,
    items: [
      { name: 'Active Projects', href: '/projects', description: 'Daftar proyek yang aktif.' },
      { name: 'Project Templates', href: '/projects/templates', description: 'Gunakan layout berulang.' },
      { name: 'Create Project', href: '/projects/new', description: 'Buat schedule baru.' },
      { name: 'Schedule Items', href: '/projects/demo/schedule', description: 'Kelola kode material per proyek.' },
    ],
  },
  {
    title: 'Brand & Supplier',
    description: 'Kontak brand + resource supplier.',
    icon: Users,
    items: [
      { name: 'Brand Directory', href: '/brands', description: 'Brand & status prefix.' },
      { name: 'Contact Management', href: '/brands/contact', description: 'Tim sales per subkategori.' },
      { name: 'Supplier Portal', href: '/suppliers', description: 'Dashboard vendor & approvals.' },
    ],
  },
  {
    title: 'Settings',
    description: 'Pengaturan sistem & preferensi.',
    icon: Settings,
    items: [
      { name: 'Preferences', href: '/settings/preferences', description: 'Pengaturan personal.' },
      { name: 'System Admin', href: '/settings/system-admin', description: 'Kontrol access & audit.' },
      { name: 'Admin Panel', href: '/admin', description: 'Audit, logs, role & overrides.' },
    ],
  },
]

type NavGroup = {
  title: string
  description: string
  icon: LucideIcon
  items: Array<{ name: string; href: string; description: string }>
}

export function SidebarMenu({ className }: { className?: string }) {
  return (
    <aside
      className={`${className ?? ''} hidden lg:flex lg:flex-col space-y-6 rounded-2xl bg-card/90 border border-border/50 p-5 shadow-lg shadow-slate-950/40`}
    >
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <div className="flex items-center gap-2">
            <group.icon className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-semibold text-foreground">{group.title}</p>
              <p className="text-xs text-muted-foreground">{group.description}</p>
            </div>
          </div>
          <ul className="space-y-1">
            {group.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-primary/10 hover:text-foreground"
                >
                  <div className="font-semibold">{item.name}</div>
                  <p className="text-xs text-muted-foreground">{item.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}
