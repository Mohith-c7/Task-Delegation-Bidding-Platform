import api from './api'

export interface User {
  id: string
  name: string
  email: string
  created_at: string
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
}
