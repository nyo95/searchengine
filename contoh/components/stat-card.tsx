import { Card } from "@/components/ui/card"
import type { ReactNode } from "react"
import { ArrowUpRight, ArrowDownLeft } from "lucide-react"

interface StatCardProps {
  label: string
  value: string
  change: string
  icon: ReactNode
  trend: "up" | "down" | "neutral"
}

export default function StatCard({ label, value, change, icon, trend }: StatCardProps) {
  const trendColor = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-muted-foreground",
  }

  const bgColor = {
    up: "bg-green-100 dark:bg-green-900/20",
    down: "bg-red-100 dark:bg-red-900/20",
    neutral: "bg-accent/10",
  }

  const trendIcon = {
    up: <ArrowUpRight className="w-3 h-3" />,
    down: <ArrowDownLeft className="w-3 h-3" />,
    neutral: null,
  }

  return (
    <Card className="p-6 hover:shadow-md hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-lg ${bgColor[trend]}`}>
          <div className="text-accent">{icon}</div>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        <p className={`text-xs mt-3 flex items-center gap-1 ${trendColor[trend]}`}>
          {trendIcon[trend]}
          <span>{change}</span>
        </p>
      </div>
    </Card>
  )
}
