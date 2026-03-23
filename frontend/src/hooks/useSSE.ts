import { useEffect, useRef } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNotificationStore } from '../store/notificationStore'
import { Notification } from '../store/notificationStore'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

export function useSSE() {
  const token = useAuthStore((s) => s.token)
  const addNotification = useNotificationStore((s) => s.addNotification)
  const esRef = useRef<EventSource | null>(null)
  const retryDelay = useRef(1000)
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!token) return

    const connect = () => {
      const url = `${BASE_URL}/notifications/stream?token=${token}`
      const es = new EventSource(url)
      esRef.current = es

      es.onmessage = (e) => {
        try {
          const notif: Notification = JSON.parse(e.data)
          addNotification(notif)
          retryDelay.current = 1000 // reset on success
        } catch {
          // ignore parse errors
        }
      }

      es.onerror = () => {
        es.close()
        esRef.current = null
        // If we get a 401-like failure on first connect, the token is invalid — stop retrying
        // Exponential backoff: 1s → 2s → 4s → ... → 30s max
        const delay = Math.min(retryDelay.current, 30000)
        retryDelay.current = Math.min(delay * 2, 30000)
        // Cap retries — if token is bad, don't hammer the server
        if (retryDelay.current >= 30000) return
        retryTimer.current = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      esRef.current?.close()
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [token, addNotification])
}
