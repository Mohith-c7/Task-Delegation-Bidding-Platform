import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import Layout from '../components/common/Layout'
import { Button, Card, Badge } from '../design-system'
import { useNotifications } from '../hooks/useNotifications'
import { cn } from '../design-system/utils'

const PAGE_SIZE = 20

const typeColors: Record<string, string> = {
  bid_placed: 'primary', bid_approved: 'success', bid_rejected: 'error',
  task_assigned: 'warning', task_updated: 'default', comment_added: 'primary',
  deadline_soon: 'error', invitation: 'default',
}

const resourceRoutes: Record<string, string> = {
  task: '/tasks',
}

export default function Notifications() {
  const [page, setPage] = useState(1)
  const navigate = useNavigate()
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()

  const totalPages = Math.ceil(notifications.length / PAGE_SIZE)
  const paged = notifications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const handleClick = async (id: string, resourceType?: string, resourceID?: string) => {
    await markRead(id)
    if (resourceType && resourceID) {
      const base = resourceRoutes[resourceType] || '/'
      navigate(`${base}/${resourceID}`)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-[var(--color-on-surface-variant)] mt-0.5">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="secondary" size="sm" onClick={markAllRead} className="flex items-center gap-2">
              <CheckCheck className="w-4 h-4" /> Mark all read
            </Button>
          )}
        </div>

        <Card className="overflow-hidden">
          {paged.length === 0 ? (
            <div className="py-16 flex flex-col items-center gap-3 text-[var(--color-on-surface-variant)]">
              <Bell className="w-12 h-12 opacity-30" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-outline-variant)]">
              {paged.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n.id, n.resource_type, n.resource_id)}
                  className={cn(
                    'w-full text-left px-5 py-4 hover:bg-[var(--color-surface-variant)] transition-colors',
                    !n.is_read && 'bg-[var(--color-primary-container)]/10'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {!n.is_read && (
                      <span className="mt-2 w-2 h-2 rounded-full bg-[var(--color-primary)] flex-shrink-0" />
                    )}
                    <div className={cn('flex-1 min-w-0', n.is_read && 'pl-5')}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">{n.title}</p>
                        <Badge variant={typeColors[n.type] as any} className="text-[10px] px-1.5 py-0.5 flex-shrink-0">
                          {n.type.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-[var(--color-on-surface-variant)] line-clamp-2">{n.body}</p>
                      <p className="text-xs text-[var(--color-on-surface-variant)] mt-1">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <span className="text-sm text-[var(--color-on-surface-variant)]">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  )
}
