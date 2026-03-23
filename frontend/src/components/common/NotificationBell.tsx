import { useState, useRef, useEffect } from 'react'
import { Bell, Check, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { cn } from '../../design-system/utils'

const resourceRoutes: Record<string, string> = {
  task: '/tasks',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = async (id: string, resourceType?: string, resourceID?: string) => {
    await markRead(id)
    setOpen(false)
    if (resourceType && resourceID) {
      const base = resourceRoutes[resourceType] || '/'
      navigate(`${base}/${resourceID}`)
    }
  }

  const recent = notifications.slice(0, 8)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-full hover:bg-[var(--color-surface-variant)] transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
      >
        <Bell className="w-5 h-5 text-[var(--color-on-surface)]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 rounded-full bg-[var(--color-error)] text-white text-[10px] font-bold flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[var(--color-surface)] border border-[var(--color-outline-variant)] rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-outline-variant)]">
            <span className="font-semibold text-[var(--color-on-surface)] text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {recent.length === 0 ? (
              <div className="py-8 text-center text-sm text-[var(--color-on-surface-variant)]">
                No notifications yet
              </div>
            ) : (
              recent.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n.id, n.resource_type, n.resource_id)}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-[var(--color-surface-variant)] transition-colors border-b border-[var(--color-outline-variant)] last:border-0',
                    !n.is_read && 'bg-[var(--color-primary-container)]/20'
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.is_read && (
                      <span className="mt-1.5 w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                    )}
                    <div className={cn('flex-1', n.is_read && 'pl-4')}>
                      <p className="text-sm font-medium text-[var(--color-on-surface)] leading-tight">{n.title}</p>
                      <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5 line-clamp-2">{n.body}</p>
                    </div>
                    {n.is_read && (
                      <Check className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)] flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-[var(--color-outline-variant)]">
            <button
              onClick={() => { navigate('/notifications'); setOpen(false) }}
              className="w-full text-center text-xs text-[var(--color-primary)] hover:underline py-1"
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
