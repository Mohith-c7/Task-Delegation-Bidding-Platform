import React, { createContext, useContext, useState, useCallback } from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { CheckCircle2, XCircle, AlertTriangle, Info, X, type LucideIcon } from 'lucide-react'
import { cn } from '../utils'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, 'id'>) => void
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  warning: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastConfig: Record<ToastType, {
  icon: LucideIcon
  containerClass: string
  iconClass: string
}> = {
  success: {
    icon: CheckCircle2,
    containerClass: 'border-l-4 border-success bg-white',
    iconClass: 'text-success',
  },
  error: {
    icon: XCircle,
    containerClass: 'border-l-4 border-error bg-white',
    iconClass: 'text-error',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'border-l-4 border-warning bg-white',
    iconClass: 'text-amber-500',
  },
  info: {
    icon: Info,
    containerClass: 'border-l-4 border-info bg-white',
    iconClass: 'text-info',
  },
}

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    setToasts(prev => [...prev, { ...item, id }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const ctx: ToastContextValue = {
    toast: addToast,
    success: (title, description) => addToast({ type: 'success', title, description }),
    error:   (title, description) => addToast({ type: 'error',   title, description }),
    warning: (title, description) => addToast({ type: 'warning', title, description }),
    info:    (title, description) => addToast({ type: 'info',    title, description }),
  }

  return (
    <ToastContext.Provider value={ctx}>
      <ToastPrimitive.Provider swipeDirection="right" duration={4000}>
        {children}

        {toasts.map(toast => {
          const config = toastConfig[toast.type]
          const Icon = config.icon

          return (
            <ToastPrimitive.Root
              key={toast.id}
              duration={toast.duration ?? 4000}
              onOpenChange={(open) => { if (!open) removeToast(toast.id) }}
              className={cn(
                'flex items-start gap-3 p-4 rounded-xl shadow-3',
                'w-[360px] max-w-[calc(100vw-32px)]',
                'data-[state=open]:animate-slide-up',
                'data-[state=closed]:animate-fade-out',
                'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]',
                'data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
                'data-[swipe=end]:animate-fade-out',
                config.containerClass,
              )}
            >
              <Icon size={18} className={cn('shrink-0 mt-0.5', config.iconClass)} />

              <div className="flex-1 min-w-0">
                <ToastPrimitive.Title className="text-sm font-semibold text-text-primary">
                  {toast.title}
                </ToastPrimitive.Title>
                {toast.description && (
                  <ToastPrimitive.Description className="text-xs text-text-secondary mt-0.5">
                    {toast.description}
                  </ToastPrimitive.Description>
                )}
              </div>

              <ToastPrimitive.Close
                className="shrink-0 text-text-tertiary hover:text-text-primary transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </ToastPrimitive.Close>
            </ToastPrimitive.Root>
          )
        })}

        <ToastPrimitive.Viewport className={cn(
          'fixed bottom-4 right-4 z-[500]',
          'flex flex-col gap-2',
          'outline-none',
          'max-md:bottom-20 max-md:right-4 max-md:left-4',
        )} />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
