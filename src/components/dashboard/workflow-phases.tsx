import { Card } from '@/components/ui/card'
import { Search, Boxes, BarChart3, Package } from 'lucide-react'

const phases = [
  {
    title: 'Discovery Phase',
    description: 'Search and categorize materials to lock metadata.',
    tasks: ['Search by name/SKU/brand', 'Validate and document for audit'],
    icon: Search,
  },
  {
    title: 'Planning Phase',
    description: 'Create projects and select templates for blueprints.',
    tasks: ['Choose template', 'Assign squad for delivery'],
    icon: Boxes,
  },
  {
    title: 'Execution Phase',
    description: 'Manage schedule items and validate material swaps.',
    tasks: ['Monitor prefix codes', 'Swap materials with matching prefix'],
    icon: BarChart3,
  },
  {
    title: 'Resource Phase',
    description: 'Coordinate with brands and suppliers.',
    tasks: ['Review brand data', 'Manage contact sales per category'],
    icon: Package,
  },
]

export function DashboardWorkflowPhases() {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Workflow</p>
          <h3 className="text-lg font-semibold text-foreground">Process Guide</h3>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {phases.map((phase) => (
          <Card key={phase.title} className="h-full border-border/60 bg-card/70 p-5 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-lg bg-accent/10 p-2 text-accent">
                <phase.icon className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-semibold text-foreground">{phase.title}</h4>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{phase.description}</p>
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {phase.tasks.map((task) => (
                <li key={task} className="flex items-start gap-2">
                  <span className="mt-0.5 text-accent">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </section>
  )
}
