import { Card } from "@/components/ui/card"
import { Search, Boxes, BarChart3, Package } from "lucide-react"

export default function WorkflowPhases() {
  const phases = [
    {
      phase: "Discovery Phase",
      description: "Search and categorize materials to lock metadata",
      tasks: ["Search by name/SKU/brand", "Validate & document for audit"],
      icon: <Search className="w-5 h-5" />,
    },
    {
      phase: "Planning Phase",
      description: "Create projects and select templates for blueprints",
      tasks: ["Choose template", "Assign squad for development"],
      icon: <Boxes className="w-5 h-5" />,
    },
    {
      phase: "Execution Phase",
      description: "Manage schedule items and validate material swaps",
      tasks: ["Monitor prefix codes", "Swap materials with matching prefix"],
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      phase: "Resource Phase",
      description: "Coordinate with brands and suppliers",
      tasks: ["Review brand data", "Manage contact sales per category"],
      icon: <Package className="w-5 h-5" />,
    },
  ]

  return (
    <div>
      <h3 className="text-lg font-semibold text-foreground mb-4">Workflow Process</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {phases.map((item, i) => (
          <Card key={i} className="p-6 hover:shadow-lg hover:border-accent/50 transition-all group">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-accent/10 rounded-lg text-accent group-hover:bg-accent/20 transition-colors">
                {item.icon}
              </div>
              <h4 className="font-semibold text-sm text-foreground">{item.phase}</h4>
            </div>
            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{item.description}</p>
            <ul className="space-y-2">
              {item.tasks.map((task, j) => (
                <li key={j} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="text-accent mt-1 flex-shrink-0">•</span>
                  <span>{task}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  )
}
