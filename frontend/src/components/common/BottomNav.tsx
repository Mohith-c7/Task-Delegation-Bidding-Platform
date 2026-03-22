import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Gavel, BarChart3 } from 'lucide-react'
import { cn } from '../../design-system/utils'

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/my-tasks',  label: 'Tasks',     icon: CheckSquare },
  { path: '/my-bids',   label: 'Bids',      icon: Gavel },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function BottomNav() {
  const location = useLocation()

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
                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl min-w-[44px] min-h-[44px] justify-center',
                'transition-all duration-150',
                active ? 'text-primary' : 'text-text-tertiary',
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
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
