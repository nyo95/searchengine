import { useState, useEffect } from 'react';

interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  location?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  schedules: Array<{
    id: string;
    name: string;
    _count: {
      scheduleItems: number;
    };
  }>;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }
      
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: {
    name: string;
    description?: string;
    client?: string;
    location?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const newProject = await response.json();
      setProjects(prev => [newProject, ...prev]);
      return newProject;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject
  };
}