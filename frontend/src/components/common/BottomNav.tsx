import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Gavel, Bell } from 'lucide-react'
import { cn } from '../../design-system/utils'
import { useNotificationStore } from '../../store/notificationStore'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/my-tasks',  label: 'Tasks',     icon: CheckSquare },
  { path: '/my-bids',   label: 'Bids',      icon: Gavel },
  { path: '/notifications', label: 'Alerts', icon: Bell },
]

export default function BottomNav() {
  const location = useLocation()
  const unreadCount = useNotificationStore(s => s.unreadCount)

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border z-[200] md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[44px] min-h-[44px] justify-center relative',
                'transition-all duration-150',
                active ? 'text-primary' : 'text-text-tertiary',
              )}
            >
              <div className="relative">
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {path === '/notifications' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--color-error)] text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', active ? 'text-primary' : 'text-text-tertiary')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
