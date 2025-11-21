'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProjects, useDeleteProject } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/app-layout';

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteProject = useDeleteProject();

  const { data: projects, isLoading, error } = useProjects(
    searchQuery ? { q: searchQuery } : undefined
  );

  const handleDelete = async (id: string) => {
    await deleteProject.mutateAsync(id);
    setDeleteId(null);
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load projects. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage your projects</p>
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project List</CardTitle>
          <CardDescription>All projects in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      {searchQuery ? 'No projects found matching your search.' : 'No projects found. Create a new project to get started.'}
                    </TableCell>
                  </TableRow>
                ) : (
                  projects?.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-mono text-sm font-medium">{project.code}</TableCell>
                      <TableCell>
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-medium hover:underline"
                        >
                          {project.name}
                        </Link>
                      </TableCell>
                      <TableCell>{project.clientName || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>{project.location || <span className="text-muted-foreground">-</span>}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{project.itemCount}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/projects/${project.id}/items`}>
                            <Button variant="ghost" size="sm">
                              <Calendar className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/projects/${project.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <AlertDialog open={deleteId === project.id} onOpenChange={(open) => !open && setDeleteId(null)}>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteId(project.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete &quot;{project.name}&quot;? This will also delete all schedule items. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(project.id)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </AppLayout>
  );
}
