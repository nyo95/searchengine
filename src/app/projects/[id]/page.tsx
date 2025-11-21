"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, X, Plus, ArrowLeftRight, Edit } from "lucide-react";
import { format } from "date-fns";
import { useProject, useUpdateProject } from "@/hooks/useProjects";
import {
  useProjectItems,
  useCreateScheduleItem,
  useUpdateScheduleItem,
  useDeleteScheduleItem,
  useSwapCodes,
} from "@/hooks/useProjectItems";
import { AddScheduleItemDialog } from "@/components/AddScheduleItemDialog";
import { ScheduleTable } from "@/components/ScheduleTable";
import { toast } from "sonner";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const { data: project, isLoading: projectLoading } = useProject(id);
  const { data: items, isLoading: itemsLoading } = useProjectItems(id, {});

  const [isEditingProject, setIsEditingProject] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projectCode, setProjectCode] = useState("");
  const [clientName, setClientName] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const updateProject = useUpdateProject();
  const createItem = useCreateScheduleItem(id);
  const updateItem = useUpdateScheduleItem(id);
  const deleteItem = useDeleteScheduleItem(id);
  const swapCodes = useSwapCodes(id);

  useEffect(() => {
    if (project) {
      setProjectName(project.name);
      setProjectCode(project.code);
      setClientName(project.clientName || "");
      setLocation(project.location || "");
      setDescription(project.description || "");
    }
  }, [project]);

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
      setClientName(project.clientName || "");
      setLocation(project.location || "");
      setDescription(project.description || "");
    }
    setIsEditingProject(false);
  };

  const handleAddItem = async (data: any) => {
    await createItem.mutateAsync(data);
  };

  const handleUpdateItem = async (itemId: string, data: any) => {
    await updateItem.mutateAsync({ id: itemId, data });
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem.mutateAsync(itemId);
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.delete(itemId);
      return next;
    });
  };

  const handleSwap = async () => {
    if (selectedItems.size !== 2) {
      toast.error("Select exactly two items to swap");
      return;
    }
    const [first, second] = Array.from(selectedItems);
    await swapCodes.mutateAsync({ fromId: first, toId: second });
    setSelectedItems(new Set());
  };

  if (projectLoading) {
    return (
      <AppLayout>
        <div className="px-4 md:px-6 py-8 max-w-5xl mx-auto space-y-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-64 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!project) {
    return (
      <AppLayout>
        <div className="px-4 md:px-6 py-8">
          <p className="text-destructive">Project not found.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-8 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold">{project.name}</h2>
            <p className="text-sm text-muted-foreground">
              Project Code: <Badge variant="outline">{project.code}</Badge>
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex items-center justify-between gap-2">
              <div>
                <CardTitle>Project Details</CardTitle>
                <CardDescription>Update metadata</CardDescription>
              </div>
              {isEditingProject ? (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProject} disabled={updateProject.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setIsEditingProject(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Project Name</p>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    disabled={!isEditingProject}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Project Code</p>
                  <Input
                    value={projectCode}
                    onChange={(e) => setProjectCode(e.target.value)}
                    disabled={!isEditingProject}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1">Client Name</p>
                  <Input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    disabled={!isEditingProject}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Location</p>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={!isEditingProject}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Description</p>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  disabled={!isEditingProject}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Created {format(new Date(project.createdAt), "PPpp")}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Quick metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Items</span>
                <Badge variant="secondary">{project.itemCount ?? 0}</Badge>
              </div>
              <div className="text-muted-foreground">
                Last updated {format(new Date(project.updatedAt), "PPpp")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Schedule Items</CardTitle>
              <CardDescription>Manage codes for this project</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <AddScheduleItemDialog onSubmit={handleAddItem}>
                <Button size="sm" className="gap-2">
                  <Plus className="w-4 h-4" />
                  Add Item
                </Button>
              </AddScheduleItemDialog>
              <Button variant="outline" size="sm" onClick={handleSwap} disabled={selectedItems.size !== 2}>
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                Swap Codes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {itemsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <ScheduleTable
                items={items || []}
                onUpdate={handleUpdateItem}
                onDelete={handleDeleteItem}
                selectedItems={selectedItems}
                onSelectChange={setSelectedItems}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
