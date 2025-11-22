"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Plus, Trash2, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useProjects, useDeleteProject } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: projects, isLoading, error, refetch } = useProjects(
    searchQuery ? { q: searchQuery } : undefined,
  );
  const deleteProject = useDeleteProject();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => projects || [], [projects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    try {
      setDeletingId(id);
      await deleteProject.mutateAsync(id);
      refetch();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Projects</h2>
            <p className="text-sm text-muted-foreground">Manage your projects and schedules</p>
          </div>
          <Link href="/projects/new">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Link>
        </div>

        <div>
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && (
          <div className="p-4 border border-destructive/30 bg-destructive/5 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-destructive">
                Failed to load projects. Please try again.
              </p>
            </div>
          </div>
        )}

        {isLoading ? (
          <Card className="border border-border">
            <CardContent className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card className="border border-border">
            <CardContent className="p-10 text-center space-y-2">
              <p className="text-muted-foreground">
                {searchQuery ? "No projects match your search." : "No projects yet."}
              </p>
              <Link href="/projects/new">
                <Button variant="outline" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create First Project
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium text-sm">
                        {project.name}
                        {project.clientName && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {project.clientName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {project.clientName || "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {project.itemCount ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/projects/${project.id}/schedule`}>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <ClipboardList className="w-4 h-4" />
                              Schedule
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive gap-2"
                            onClick={() => handleDelete(project.id)}
                            disabled={deletingId === project.id}
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
