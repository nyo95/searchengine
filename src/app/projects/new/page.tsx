"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCreateProject } from "@/hooks/useProjects";
import { ProjectForm } from "@/components/ProjectForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";

export default function NewProjectPage() {
  const router = useRouter();
  const createProject = useCreateProject();

  const handleSubmit = async (data: any) => {
    await createProject.mutateAsync(data);
    router.push("/projects");
  };

  return (
    <AppLayout>
      <div className="px-4 md:px-6 py-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold">New Project</h2>
            <p className="text-sm text-muted-foreground">Create a new project</p>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <ProjectForm
              onSubmit={handleSubmit}
              isLoading={createProject.isPending}
              submitLabel="Create Project"
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
