import api from './api'

export interface User {
  id: string
  name: string
  email: string
  role?: string
  avatar_url?: string
  bio?: string
  skills?: string[]
  resume_url?: string
  created_at: string
}

export interface TaskHistoryItem {
  id: string
  title: string
  status: string
  priority: string
  deadline: string
  created_at: string
  assigned_to: string | null
  rating?: number
  points?: number
}

export interface BidHistoryItem {
  bid_id: string
  task_id: string
  task_title: string
  task_status: string
  task_deadline: string
  bid_status: string
  estimated_completion: string
  created_at: string
}

export interface UserReview {
  id: string
  task_id: string
  task_title: string
  reviewer_id: string
  reviewer_name: string
  reviewee_id: string
  rating: number
  points: number
  comment: string
  created_at: string
}

export interface UserProfile extends User {
  avg_rating: number
  role: string
  tasks_applied: number
  tasks_accepted: number
  overall_rating: number
  review_count: number
  rating_count: number
  total_points: number
  total_tasks_posted: number
  total_tasks_completed: number
  total_bids_placed: number
  total_bids_won: number
  success_rate: number
  task_history: TaskHistoryItem[]
  bid_history: BidHistoryItem[]
  reviews: UserReview[]
}

export interface AuthResponse {
  user: User
  access_token: string
  refresh_token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export const authService = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data)
    return response.data.data
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data)
    return response.data.data
  },

  async getMe(): Promise<User> {
    const response = await api.get('/users/me')
    return response.data.data
  },

  async getMyProfile(): Promise<UserProfile> {
    const response = await api.get('/users/me/profile')
    return response.data.data
  },

  async getPublicProfile(id: string): Promise<UserProfile> {
    const response = await api.get(`/users/${id}/profile`)
    return response.data.data
  },

  async getUserReviews(id: string): Promise<UserReview[]> {
    const response = await api.get(`/users/${id}/reviews`)
    return response.data.data
  }
}
