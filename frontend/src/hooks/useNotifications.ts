import { useEffect } from 'react'
import { useNotificationStore } from '../store/notificationStore'
import { notificationService } from '../services/notificationService'
import { useAuthStore } from '../store/authStore'

export function useNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated())
  const { notifications, unreadCount, markRead, markAllRead, setHistory } = useNotificationStore()

  useEffect(() => {
    if (!isAuthenticated) return
    notificationService.getHistory(20, 0).then(setHistory).catch(() => {})
  }, [isAuthenticated, setHistory])

  const handleMarkRead = async (id: string) => {
    markRead(id)
    await notificationService.markRead(id).catch(() => {})
  }

  const handleMarkAllRead = async () => {
    markAllRead()
    await notificationService.markAllRead().catch(() => {})
  }

  return { notifications, unreadCount, markRead: handleMarkRead, markAllRead: handleMarkAllRead }
}
