"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Upload, Trash2, Plus } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ScheduleItem {
  id: string
  projectId: string
  productId: string
  quantity: number
  notes?: string
  createdAt: string
}

interface Project {
  id: string
  name: string
  items: ScheduleItem[]
}

export default function SchedulerPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedProject, setExpandedProject] = useState<string | null>(null)
  const [newProjectName, setNewProjectName] = useState("")
  const [creatingProject, setCreatingProject] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/projects")
      const data = await response.json()
      setProjects(data.projects || [])
    } catch (err) {
      setError("Failed to fetch projects")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return
    try {
      setCreatingProject(true)
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProjectName }),
      })
      if (response.ok) {
        setNewProjectName("")
        fetchProjects()
      }
    } catch (err) {
      console.error(err)
    } finally {
      setCreatingProject(false)
    }
  }

  const handleUploadCSV = (projectId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split("\n").filter((l) => l.trim())

        // Parse CSV and create schedule items
        // This is a simplified example - adjust based on your CSV format
        for (let i = 1; i < lines.length; i++) {
          const [productCode, quantity, notes] = lines[i].split(",")
          if (productCode?.trim()) {
            await fetch(`/api/projects/${projectId}/schedule`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productCode: productCode.trim(),
                quantity: Number.parseInt(quantity) || 1,
                notes: notes?.trim() || undefined,
              }),
            })
          }
        }
        fetchProjects()
      } catch (err) {
        console.error("CSV upload error:", err)
      }
    }
    reader.readAsText(file)
  }

  return (
    <MainLayout>
      <div className="px-4 md:px-6 py-6">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Project Scheduler</h2>
          <p className="text-sm text-muted-foreground mb-6">Manage your material schedules for each project</p>

          {/* New Project Form */}
          <div className="flex gap-2 mb-6">
            <Input
              placeholder="New project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
              className="max-w-xs"
            />
            <Button
              onClick={handleCreateProject}
              disabled={!newProjectName.trim() || creatingProject}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex items-start gap-3 mb-6">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <div className="border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">No projects yet</p>
            <p className="text-xs text-muted-foreground mb-4">Create a project and import a CSV file to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <div key={project.id} className="border border-border rounded-lg">
                {/* Project Header */}
                <button
                  onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex-1 text-left">
                      <h3 className="font-medium">{project.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{project.items.length} items</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      className="px-3 py-1.5 text-xs font-medium border border-border rounded hover:bg-muted transition-colors cursor-pointer flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Import CSV
                      <input
                        type="file"
                        accept=".csv"
                        onChange={(e) => {
                          handleUploadCSV(project.id, e)
                          e.target.value = ""
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </button>

                {/* Project Items */}
                {expandedProject === project.id && project.items.length > 0 && (
                  <div className="border-t border-border overflow-hidden">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Product Code</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Notes</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {project.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-sm">{item.id}</TableCell>
                              <TableCell className="text-sm">{item.quantity}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">{item.notes || "-"}</TableCell>
                              <TableCell className="text-right">
                                <button className="p-1.5 hover:bg-destructive/10 rounded transition-colors">
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}

                {expandedProject === project.id && project.items.length === 0 && (
                  <div className="border-t border-border p-8 text-center">
                    <p className="text-sm text-muted-foreground">No items in this project yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Upload a CSV file to add items</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}
