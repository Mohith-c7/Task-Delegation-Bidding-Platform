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
  const stopped = useRef(false)

  useEffect(() => {
    if (!token) return
    stopped.current = false
    retryDelay.current = 1000

    const connect = () => {
      if (stopped.current) return

      // Token passed as query param — EventSource doesn't support custom headers
      const url = `${BASE_URL}/notifications/stream?token=${encodeURIComponent(token)}`
      const es = new EventSource(url)
      esRef.current = es

      es.onmessage = (e) => {
        try {
          const notif: Notification = JSON.parse(e.data)
          addNotification(notif)
          retryDelay.current = 1000 // reset backoff on success
        } catch {
          // ignore parse errors
        }
      }

      es.onerror = () => {
        es.close()
        esRef.current = null
        if (stopped.current) return
        // Exponential backoff capped at 30s — always retry (network may recover)
        const delay = retryDelay.current
        retryDelay.current = Math.min(delay * 2, 30000)
        retryTimer.current = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      stopped.current = true
      esRef.current?.close()
      if (retryTimer.current) clearTimeout(retryTimer.current)
    }
  }, [token, addNotification])
}
