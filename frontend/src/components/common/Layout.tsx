import { ReactNode, useState } from 'react'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import { cn } from '../../design-system/utils'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-surface-2">
      {/* Desktop Sidebar */}
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Main content area */}
      <main className={cn(
        'transition-all duration-300 ease-in-out',
        'min-h-screen',
        // Desktop: offset by sidebar width
        collapsed ? 'md:ml-16' : 'md:ml-sidebar',
        // Mobile: add bottom padding for bottom nav
        'pb-20 md:pb-0',
      )}>
        {/* Top header bar */}
        <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-md border-b border-border h-16 flex items-center px-6">
          <div className="flex-1" />
        </header>

        {/* Page content */}
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </div>
  )
}
