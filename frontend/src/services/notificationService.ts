import api from './api'
import { Notification } from '../store/notificationStore'

export const notificationService = {
  async getHistory(limit = 20, offset = 0): Promise<Notification[]> {
    const res = await api.get('/notifications', { params: { limit, offset } })
    return res.data.data || []
  },

  async markRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`)
  },

  async markAllRead(): Promise<void> {
    await api.patch('/notifications/read-all')
  },
}
