'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useProject, useUpdateProject } from '@/hooks/useProjects';
import {
  useProjectItems,
  useCreateScheduleItem,
  useUpdateScheduleItem,
  useDeleteScheduleItem,
  useSwapCodes,
} from '@/hooks/useProjectItems';
import { AppLayout } from '@/components/layout/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus, ArrowLeftRight } from 'lucide-react';
import { format } from 'date-fns';
import { AddScheduleItemDialog } from '@/components/AddScheduleItemDialog';
import { ScheduleTable } from '@/components/ScheduleTable';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const resolvedParams = 'then' in params ? use(params) : params;
  const id = resolvedParams.id;
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: items, isLoading: itemsLoading } = useProjectItems(id, {});

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectName, setProjectName] = useState(project?.name || '');
  const [projectCode, setProjectCode] = useState(project?.code || '');
  const [clientName, setClientName] = useState(project?.clientName || '');
  const [location, setLocation] = useState(project?.location || '');
  const [description, setDescription] = useState(project?.description || '');

  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const updateProject = useUpdateProject();
  const createItem = useCreateScheduleItem(id);
  const updateItem = useUpdateScheduleItem(id);
  const deleteItem = useDeleteScheduleItem(id);
  const swapCodes = useSwapCodes(id);

  // Update form when project loads
  if (project && !isEditingProject) {
    if (projectName !== project.name) {
      setProjectName(project.name);
      setProjectCode(project.code);
      setClientName(project.clientName || '');
      setLocation(project.location || '');
      setDescription(project.description || '');
    }
  }

  const handleSaveProject = async () => {
    await updateProject.mutateAsync({
      id,
      data: {
        name: projectName,
        code: projectCode,
        clientName: clientName || undefined,
        location: location || undefined,
        description: description || undefined,
      },
    });
    setIsEditingProject(false);
  };

  const handleCancelEdit = () => {
    if (project) {
      setProjectName(project.name);
      setProjectCode(project.code);
      setClientName(project.clientName || '');
      setLocation(project.location || '');
      setDescription(project.description || '');
    }
    setIsEditingProject(false);
  };

  const handleCreateItem = async (data: any) => {
    await createItem.mutateAsync(data);
  };

  const handleUpdateItem = async (itemId: string, data: any) => {
    await updateItem.mutateAsync({ itemId, data });
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this schedule item?')) {
      await deleteItem.mutateAsync(itemId);
      setSelectedItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleSwapCodes = async () => {
    if (selectedItems.size !== 2) {
      toast.error('Please select exactly 2 items to swap codes');
      return;
    }
    const [itemIdA, itemIdB] = Array.from(selectedItems);
    await swapCodes.mutateAsync({ itemIdA, itemIdB });
    setSelectedItems(new Set());
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        if (next.size >= 2) {
          toast.error('You can only select 2 items for swapping');
          return prev;
        }
        next.add(itemId);
      }
      return next;
    });
  };

  if (projectLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
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
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 space-y-6 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/projects">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{project.name}</h1>
              <p className="text-muted-foreground">Project details and schedule</p>
            </div>
          </div>
        </div>

        {/* Project Header Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Project Information</CardTitle>
              {!isEditingProject && (
                <Button variant="outline" size="sm" onClick={() => setIsEditingProject(true)}>
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditingProject ? (
              <>
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Code *</label>
                  <Input
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Client Name</label>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Location</label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSaveProject} disabled={updateProject.isPending}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
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
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p>{format(new Date(project.createdAt), 'PPp')}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Schedule Items Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Schedule Items</CardTitle>
                <CardDescription>
                  Manage schedule items for this project. Select 2 items to swap codes.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {selectedItems.size === 2 && (
                  <Button onClick={handleSwapCodes} disabled={swapCodes.isPending}>
                    <ArrowLeftRight className="mr-2 h-4 w-4" />
                    Swap Codes
                  </Button>
                )}
                <AddScheduleItemDialog
                  projectId={id}
                  onSubmit={handleCreateItem}
                  isLoading={createItem.isPending}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : items && items.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Select items to swap codes:</span>
                  <Badge variant="outline">{selectedItems.size} selected</Badge>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-3 text-left w-12"></th>
                        <th className="p-3 text-left">Code</th>
                        <th className="p-3 text-left">Product</th>
                        <th className="p-3 text-left">Area</th>
                        <th className="p-3 text-left">Location Note</th>
                        <th className="p-3 text-left">Usage Note</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">
                            <Checkbox
                              checked={selectedItems.has(item.id)}
                              onCheckedChange={() => toggleItemSelection(item.id)}
                            />
                          </td>
                          <td className="p-3 font-mono text-sm font-medium">{item.code}</td>
                          <td className="p-3">
                            <div className="space-y-1">
                              <p className="font-medium text-sm">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {item.product.sku} • {item.product.brand.name}
                              </p>
                            </div>
                          </td>
                          <td className="p-3">{item.area || <span className="text-muted-foreground">-</span>}</td>
                          <td className="p-3">{item.locationNote || <span className="text-muted-foreground">-</span>}</td>
                          <td className="p-3">{item.usageNote || <span className="text-muted-foreground">-</span>}</td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: Open edit dialog for schedule item
                                  // For now, use the existing ScheduleRow edit functionality
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteItem(item.id)}
                                disabled={deleteItem.isPending}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No schedule items yet. Add your first item to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
