import React from 'react'
import { cn } from '../utils'

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' | 'purple'
type StatusVariant = 'open' | 'assigned' | 'in_progress' | 'submitted_for_review' | 'revision_requested' | 'disputed' | 'completed' | 'closed'
type PriorityVariant = 'low' | 'medium' | 'high' | 'critical'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-text-secondary',
  primary: 'bg-primary-light text-primary',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-amber-700',
  error:   'bg-error-light text-error',
  info:    'bg-info-light text-info',
  purple:  'bg-purple-100 text-purple-700',
}

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-text-tertiary',
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  error:   'bg-error',
  info:    'bg-info',
  purple:  'bg-purple-600',
}

const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-[10px] font-semibold px-1.5 py-0.5 rounded',
  md: 'text-xs font-semibold px-2 py-1 rounded-md',
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
  variant = 'default',
  size = 'md',
  dot = false,
  children,
  className,
  ...props
}, ref) => (
  <span
    ref={ref}
    className={cn(
      'inline-flex items-center gap-1.5 uppercase tracking-wide whitespace-nowrap',
      variantStyles[variant],
      sizeStyles[size],
      className,
    )}
    {...props}
  >
    {dot && (
      <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotStyles[variant])} />
    )}
    {children}
  </span>
))

Badge.displayName = 'Badge'

// Specialized status badge
const statusConfig: Record<StatusVariant, { label: string; variant: BadgeVariant }> = {
  open:        { label: 'Open',        variant: 'primary' },
  assigned:    { label: 'Assigned',    variant: 'purple' },
  in_progress: { label: 'In Progress', variant: 'warning' },
  submitted_for_review: { label: 'Submitted', variant: 'primary' },
  revision_requested:   { label: 'Revision',  variant: 'warning' },
  disputed:             { label: 'Disputed',  variant: 'error' },
  completed:   { label: 'Completed',   variant: 'success' },
  closed:      { label: 'Closed',      variant: 'default' },
}

export const StatusBadge = ({ status, size = 'md' }: { status: StatusVariant; size?: BadgeSize }) => {
  const config = statusConfig[status] ?? { label: status, variant: 'default' as BadgeVariant }
  return <Badge variant={config.variant} size={size} dot>{config.label}</Badge>
}

// Specialized priority badge
const priorityConfig: Record<PriorityVariant, { label: string; variant: BadgeVariant }> = {
  low:      { label: 'Low',      variant: 'success' },
  medium:   { label: 'Medium',   variant: 'warning' },
  high:     { label: 'High',     variant: 'error' },
  critical: { label: 'Critical', variant: 'error' },
}

export const PriorityBadge = ({ priority, size = 'md' }: { priority: PriorityVariant; size?: BadgeSize }) => {
  const config = priorityConfig[priority] ?? { label: priority, variant: 'default' as BadgeVariant }
  return <Badge variant={config.variant} size={size}>{config.label}</Badge>
}
