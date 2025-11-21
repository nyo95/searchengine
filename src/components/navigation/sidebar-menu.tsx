import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { Search, Package, FolderKanban } from 'lucide-react';
import { cn } from '@/lib/utils';

const navGroups: NavGroup[] = [
  {
    title: 'Product Search',
    icon: Search,
    items: [{ name: 'Material Search', href: '/', description: 'Search materials, SKU, or brand' }],
  },
  {
    title: 'Catalog',
    icon: Package,
    items: [
      { name: 'Products', href: '/catalog/products', description: 'Manage product catalog' },
      { name: 'Brands', href: '/catalog/brands', description: 'Manage brands' },
    ],
  },
  {
    title: 'Projects & Schedule',
    icon: FolderKanban,
    items: [{ name: 'Projects', href: '/projects', description: 'Manage projects and schedules' }],
  },
];

type NavGroup = {
  title: string;
  icon: LucideIcon;
  items: Array<{ name: string; href: string; description: string }>;
};

export function SidebarMenu({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'hidden lg:flex lg:flex-col space-y-6 rounded-2xl bg-card/90 border border-border/50 p-5 shadow-lg shadow-slate-950/40',
        className
      )}
    >
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <div className="flex items-center gap-2">
            <group.icon className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold text-foreground">{group.title}</p>
          </div>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'block rounded-xl px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-primary/10 text-foreground'
                        : 'text-muted-foreground hover:bg-primary/10 hover:text-foreground'
                    )}
                  >
                    <div className="font-semibold">{item.name}</div>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </aside>
  );
}
