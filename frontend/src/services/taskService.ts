import api from './api'

export interface Task {
  id: string
  title: string
  description: string
  skills: string[]
  deadline: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'closed'
  owner_id: string
  assigned_to: string | null
  created_at: string
  updated_at: string
}

export interface CreateTaskRequest {
  title: string
  description: string
  skills: string[]
  deadline: string
  priority: string
}

export const taskService = {
  async getAllTasks(status?: string): Promise<Task[]> {
    const params = status ? { status } : {}
    const response = await api.get('/tasks', { params })
    return response.data.data
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await api.get('/tasks/my')
    return response.data.data
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
}
