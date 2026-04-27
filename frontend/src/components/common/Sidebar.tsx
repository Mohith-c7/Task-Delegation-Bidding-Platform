import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Gavel, BarChart3,
  TrendingUp, Settings, LogOut, ChevronLeft, ChevronRight,
  Zap, Trophy,
} from 'lucide-react'
import { cn } from '../../design-system/utils'
import { Avatar } from '../../design-system'
import { useAuthStore } from '../../store/authStore'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const navItems = [
  { path: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { path: '/my-tasks',     label: 'My Tasks',     icon: CheckSquare },
  { path: '/my-bids',      label: 'My Bids',      icon: Gavel },
  { path: '/analytics',    label: 'Analytics',    icon: BarChart3 },
  { path: '/my-analytics', label: 'Performance',  icon: TrendingUp },
  { path: '/leaderboard',  label: 'Leaderboard',  icon: Trophy },
]

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-full bg-white border-r border-border z-[200]',
      'flex flex-col transition-all duration-300 ease-in-out',
      'hidden md:flex',
      collapsed ? 'w-16' : 'w-sidebar',
    )}>
      {/* Logo */}
      <div className={cn(
        'flex items-center h-16 px-4 border-b border-border shrink-0',
        collapsed ? 'justify-center' : 'justify-between',
      )}>
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-text-primary">TaskFlow</span>
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className={cn(
            'w-6 h-6 rounded-full bg-surface-3 border border-border',
            'flex items-center justify-center',
            'hover:bg-primary-light hover:border-primary transition-all duration-150',
            'text-text-secondary hover:text-primary',
            collapsed && 'hidden',
          )}
        >
          <ChevronLeft size={12} />
        </button>
      </div>

      {/* Collapsed toggle */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mt-2 w-6 h-6 rounded-full bg-surface-3 border border-border flex items-center justify-center hover:bg-primary-light hover:border-primary transition-all text-text-secondary hover:text-primary"
        >
          <ChevronRight size={12} />
        </button>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              title={collapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-150 group relative',
                active
                  ? 'bg-primary-light text-primary'
                  : 'text-text-secondary hover:bg-surface-3 hover:text-text-primary',
                collapsed && 'justify-center px-2',
              )}
            >
              <Icon size={18} className={cn(
                'shrink-0 transition-colors',
                active ? 'text-primary' : 'text-text-tertiary group-hover:text-text-primary',
              )} />
              {!collapsed && <span>{label}</span>}
              {active && !collapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-4 space-y-1 border-t border-border pt-4">
        <Link
          to="/org/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-text-secondary hover:bg-surface-3 hover:text-text-primary transition-all',
            collapsed && 'justify-center px-2',
          )}
        >
          <Settings size={18} className="shrink-0 text-text-tertiary" />
          {!collapsed && <span>Org Settings</span>}
        </Link>

        {/* User profile */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl',
          'bg-surface-2 mt-2',
          collapsed && 'justify-center px-2',
        )}>
          <Avatar name={user?.name || 'User'} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleLogout}
              className="text-text-tertiary hover:text-error transition-colors p-1 rounded"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
