'use client';

import { use } from 'react';
import Link from 'next/link';
import { useProject } from '@/hooks/useProjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const id = resolvedParams.id;
  const { data: project, isLoading, error } = useProject(id);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Failed to load project. Please try again.</p>
            <Link href="/projects">
              <Button variant="outline" className="mt-4">
                Back to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          {isLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <div>
              <h1 className="text-3xl font-bold">{project?.name}</h1>
              <p className="text-muted-foreground">Project details</p>
            </div>
          )}
        </div>
        {project && (
          <div className="flex gap-2">
            <Link href={`/projects/${project.id}/items`}>
              <Button>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Items
              </Button>
            </Link>
            <Link href={`/projects/${project.id}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : project ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-mono font-medium">{project.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{project.name}</p>
              </div>
              {project.clientName && (
                <div>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p>{project.clientName}</p>
                </div>
              )}
              {project.location && (
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p>{project.location}</p>
                </div>
              )}
              {project.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="whitespace-pre-wrap">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Schedule Items</p>
                <Badge variant="outline" className="text-lg">
                  {project.itemCount}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p>{format(new Date(project.createdAt), 'PPp')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p>{format(new Date(project.updatedAt), 'PPp')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Project not found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
