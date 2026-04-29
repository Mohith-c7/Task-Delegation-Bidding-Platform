import api from './api'

export interface Task {
  id: string
  title: string
  description: string
  skills: string[]
  questions: string[]
  deadline: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'assigned' | 'in_progress' | 'submitted_for_review' | 'revision_requested' | 'disputed' | 'completed' | 'closed'
  owner_id: string
  owner_name: string
  assigned_to: string | null
  rating?: number
  points?: number
  created_at: string
  updated_at: string
}

export interface TaskSearchResult {
  tasks: Task[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface TaskSearchParams {
  q?: string
  status?: string
  org_id?: string
  priority?: string
  assigned_to?: string
  creator?: string
  skills?: string[]
  deadline_from?: string
  deadline_to?: string
  sort?: string
  page?: number
  page_size?: number
}

export interface CreateTaskRequest {
  title: string
  description: string
  skills: string[]
  questions?: string[]
  deadline: string
  priority: string
  org_id?: string
}

export interface CreateUserReviewRequest {
  rating: number
  points?: number
  comment?: string
}

export interface SubmitCompletionRequest {
  notes: string
  pr_url?: string
  demo_url?: string
  attachment_url?: string
}

export const taskService = {
  async getAllTasks(params?: TaskSearchParams): Promise<TaskSearchResult> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v))
          } else {
            searchParams.append(key, String(value))
          }
        }
      })
    }
    const response = await api.get(`/tasks?${searchParams.toString()}`)
    return response.data.data
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await api.get('/tasks/my')
    const payload = response.data.data
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.tasks)) return payload.tasks
    return []
  },

  async getTask(id: string): Promise<Task> {
    const response = await api.get(`/tasks/${id}`)
    return response.data.data
  },

  async createTask(data: CreateTaskRequest): Promise<Task> {
    const response = await api.post('/tasks', data)
    return response.data.data
  },

  async updateTask(id: string, data: Partial<CreateTaskRequest>): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data)
    return response.data.data
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`)
  },

  async rateTask(id: string, rating: number, points: number): Promise<void> {
    await api.post(`/tasks/${id}/rate`, { rating, points })
  },

  async createReview(id: string, data: CreateUserReviewRequest) {
    const response = await api.post(`/tasks/${id}/reviews`, data)
    return response.data.data
  },

  async submitCompletion(id: string, data: SubmitCompletionRequest) {
    const response = await api.post(`/tasks/${id}/submissions`, data)
    return response.data.data
  },
}
