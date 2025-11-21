import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Plus, AlertCircle } from "lucide-react"

export default function ScheduleSection() {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Project Schedule Quick View</h2>
          <p className="text-sm text-muted-foreground">
            Eksekusi view baru schedule, cek kode prefix/nomor, dan lihat swap di saat tempat.
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-3">
          <Select defaultValue="active">
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder="Pilih schedule" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active Project</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="w-full justify-start">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Status Content */}
        <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
          <p className="text-sm font-medium text-foreground mb-2">Belum ada project schedule</p>
          <p className="text-xs text-muted-foreground mb-4">Buat project baru untuk mulai merencanakan material.</p>
        </div>

        {/* Action Button */}
        <Button className="w-full" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>

        {/* Info Box */}
        <div className="bg-muted/50 border border-border rounded-lg p-3">
          <div className="flex gap-2">
            <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              Buat project schedule baru untuk mulai merencanakan material.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <Button variant="outline" size="sm" className="w-full justify-center bg-transparent">
          <Plus className="w-4 h-4 mr-2" />
          Buat Project Schedule
        </Button>
      </div>
    </Card>
  )
}
