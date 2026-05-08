import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: unknown) => void }> = []

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token!))
  failedQueue = []
}

// Normalize null array fields to [] to prevent .filter()/.map() crashes
const normalizeArrayFields = (obj: unknown): unknown => {
  if (Array.isArray(obj)) return obj.map(normalizeArrayFields)
  if (obj && typeof obj === 'object') {
    const o = obj as Record<string, unknown>
    for (const key of ['skills', 'questions', 'task_history', 'bid_history', 'reviews', 'activity', 'comments', 'checklist']) {
      if (key in o && o[key] === null) o[key] = []
    }
    for (const val of Object.values(o)) normalizeArrayFields(val)
  }
  return obj
}

// Handle token expiration with auto-refresh
api.interceptors.response.use(
  (response) => {
    if (response.data) normalizeArrayFields(response.data)
    return response
  },
  async (error) => {
    const original = error.config

    // Never attempt refresh for auth endpoints — avoids infinite loops
    const isAuthEndpoint = original?.url?.includes('/auth/')
    if (isAuthEndpoint) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !original._retry) {
      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        localStorage.clear()
        window.location.href = '/'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`
          return api(original)
        })
      }

      original._retry = true
      isRefreshing = true

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken })
        const newToken = res.data.data.access_token
        localStorage.setItem('access_token', newToken)
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`
        processQueue(null, newToken)
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch (refreshError) {
        processQueue(refreshError, null)
        localStorage.clear()
        window.location.href = '/'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default api
