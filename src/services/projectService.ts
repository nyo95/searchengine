import axiosClient from '@/lib/axiosClient';

// Types based on smoke test logs and API routes
export interface Project {
  id: string;
  name: string;
  code: string;
  clientName: string | null;
  location: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface CreateProjectRequest {
  name: string;
  code: string;
  clientName?: string;
  location?: string;
  description?: string;
}

export interface UpdateProjectRequest {
  name?: string;
  code?: string;
  clientName?: string;
  location?: string;
  description?: string;
}

export interface ProjectResponse {
  project: Project;
}

export interface ProjectsListResponse {
  projects: Project[];
}

export interface SearchProjectsParams {
  q?: string;
}

export const projectService = {
  // Create project
  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await axiosClient.post<ProjectResponse>('/api/projects', data);
    return response.data.project;
  },

  // Get all projects
  getAll: async (params?: SearchProjectsParams): Promise<Project[]> => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.append('q', params.q);

    const url = searchParams.toString()
      ? `/api/projects?${searchParams.toString()}`
      : '/api/projects';
    const response = await axiosClient.get<ProjectsListResponse>(url);
    return response.data.projects;
  },

  // Get project by ID
  getById: async (id: string): Promise<Project> => {
    const response = await axiosClient.get<ProjectResponse>(`/api/projects/${id}`);
    return response.data.project;
  },

  // Update project
  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await axiosClient.patch<ProjectResponse>(`/api/projects/${id}`, data);
    return response.data.project;
  },

  // Delete project
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/projects/${id}`);
  },
};

