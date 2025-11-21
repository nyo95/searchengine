import { Card } from "@/components/ui/card"
import { Package, TrendingUp, Building2, Grid3x3 } from "lucide-react"

export default function QuickStats() {
  const stats = [
    {
      label: "Total Products",
      value: "1,084",
      subtext: "78 categories",
      icon: <Package className="w-4 h-4" />,
    },
    {
      label: "Active Projects",
      value: "12",
      subtext: "2 new this week",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      label: "Brand Partners",
      value: "38",
      subtext: "14 updated recently",
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      label: "Schedule Codes",
      value: "214",
      subtext: "96% valid",
      icon: <Grid3x3 className="w-4 h-4" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 border-border hover:border-foreground/20 transition-colors">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <div className="text-muted-foreground opacity-50">{stat.icon}</div>
            </div>
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.subtext}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
