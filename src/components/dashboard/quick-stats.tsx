import { Package, TrendingUp, Building2, Grid3x3 } from 'lucide-react'
import { Card } from '@/components/ui/card'

const stats = [
  { label: 'Total Products', value: '1,084', meta: '78 categories', icon: Package },
  { label: 'Active Projects', value: '12', meta: '2 new this week', icon: TrendingUp },
  { label: 'Brand Partners', value: '38', meta: '14 updated recently', icon: Building2 },
  { label: 'Schedule Codes', value: '214', meta: '96% valid', icon: Grid3x3 },
]

export function DashboardQuickStats() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="border-border/60 bg-card/70 p-5 shadow-sm shadow-slate-900/10">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</p>
              <p className="text-3xl font-semibold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.meta}</p>
            </div>
            <div className="rounded-full bg-accent/10 p-2 text-accent">
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </section>
  )
}
