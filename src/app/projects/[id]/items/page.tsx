'use client';

import { use } from 'react';
import Link from 'next/link';
import { useProject } from '@/hooks/useProjects';
import {
  useProjectItems,
  useCreateScheduleItem,
  useUpdateScheduleItem,
  useDeleteScheduleItem,
  useSwapCodes,
} from '@/hooks/useProjectItems';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';
import { AddScheduleItemDialog } from '@/components/AddScheduleItemDialog';
import { SwapCodesDialog } from '@/components/SwapCodesDialog';
import { ScheduleTable } from '@/components/ScheduleTable';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

export default function ProjectScheduleItemsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const projectId = resolvedParams.id;
  const [searchQuery, setSearchQuery] = useState('');

  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: items, isLoading: itemsLoading } = useProjectItems(projectId, {
    q: searchQuery || undefined,
  });

  const createItem = useCreateScheduleItem(projectId);
  const updateItem = useUpdateScheduleItem(projectId);
  const deleteItem = useDeleteScheduleItem(projectId);
  const swapCodes = useSwapCodes(projectId);

  const handleCreate = async (data: any) => {
    await createItem.mutateAsync(data);
  };

  const handleUpdate = async (itemId: string, data: any) => {
    await updateItem.mutateAsync({ itemId, data });
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this schedule item?')) {
      await deleteItem.mutateAsync(itemId);
    }
  };

  const handleSwap = async (itemIdA: string, itemIdB: string) => {
    await swapCodes.mutateAsync({ itemIdA, itemIdB });
  };

  if (projectLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive">Project not found</p>
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
          <Link href={`/projects/${projectId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Schedule Items</h1>
            <p className="text-muted-foreground">{project.name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {items && items.length >= 2 && (
            <SwapCodesDialog
              items={items}
              onSwap={handleSwap}
              isLoading={swapCodes.isPending}
            />
          )}
          <AddScheduleItemDialog
            projectId={projectId}
            onSubmit={handleCreate}
            isLoading={createItem.isPending}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule Builder</CardTitle>
          <CardDescription>
            Manage schedule items for this project. Click Edit on any row to update inline.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search schedule items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {itemsLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <ScheduleTable
              items={items || []}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isUpdating={updateItem.isPending}
              isDeleting={deleteItem.isPending}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

