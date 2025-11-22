import axiosClient from '@/lib/axiosClient'

export interface Project {
  id: string
  name: string
  clientName: string | null
  status: 'PLANNING' | 'ONGOING' | 'DONE'
  budget: number | null
  createdAt: string
  updatedAt: string
  itemCount?: number
}

export interface CreateProjectRequest {
  name: string
  clientName?: string
  status?: Project['status']
  budget?: number | null
}

export interface UpdateProjectRequest {
  name?: string
  clientName?: string
  status?: Project['status']
  budget?: number | null
}

export interface ProjectResponse {
  project: Project
}

export interface ProjectsListResponse {
  projects: Project[]
}

export interface SearchProjectsParams {
  q?: string
}

export const projectService = {
  create: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await axiosClient.post<ProjectResponse>('/api/projects', data)
    return response.data.project
  },

  getAll: async (params?: SearchProjectsParams): Promise<Project[]> => {
    const searchParams = new URLSearchParams()
    if (params?.q) searchParams.append('q', params.q)
    const url = searchParams.toString() ? `/api/projects?${searchParams.toString()}` : '/api/projects'
    const response = await axiosClient.get<ProjectsListResponse>(url)
    return response.data.projects
  },

  getById: async (id: string): Promise<Project> => {
    const response = await axiosClient.get<ProjectResponse>(`/api/projects/${id}`)
    return response.data.project
  },

  update: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await axiosClient.patch<ProjectResponse>(`/api/projects/${id}`, data)
    return response.data.project
  },

  delete: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/projects/${id}`)
  },
}
