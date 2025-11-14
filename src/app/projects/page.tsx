'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSchedules } from '@/hooks/use-schedules'

const USER_ID = 'anonymous'

export default function ProjectsPage() {
  const router = useRouter()
  const { schedules, isLoading, refresh, setSchedules } = useSchedules(USER_ID)
  const [showNew, setShowNew] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  useEffect(() => {
    // no-op; CSV import moved to schedule page
  }, [])

  const createProject = async () => {
    if (!name.trim()) return
    const response = await fetch('/api/schedule', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: USER_ID, name, description }),
    })
    if (response.ok) {
      const data = await response.json()
      setSchedules((prev) => [data.schedule, ...prev])
      setShowNew(false)
      setName('')
      setDescription('')
    }
  }

  // CSV import is handled inside individual schedule page

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Projects</h1>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refresh} disabled={isLoading}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Dialog open={showNew} onOpenChange={setShowNew}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus className="w-4 h-4 mr-2" /> New Project</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Project</DialogTitle>
                  <DialogDescription>Material schedule per project</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Input value={description} onChange={(e) => setDescription(e.target.value)} />
                  </div>
                  <Button onClick={createProject} disabled={!name.trim()}>Create</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Import target selection moved to schedule page */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="cursor-pointer transition" onClick={() => router.push(`/projects/${schedule.id}/schedule`)}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {schedule.name}
                  <Badge variant="outline">{schedule.itemsCount} items</Badge>
                </CardTitle>
                <CardDescription>{schedule.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">Created on {new Date(schedule.createdAt).toLocaleDateString('id-ID')}</p>
              </CardContent>
            </Card>
          ))}
          {!schedules.length && (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">No projects yet. Create one to start.</CardContent></Card>
          )}
        </div>
      </main>
    </div>
  )
}
