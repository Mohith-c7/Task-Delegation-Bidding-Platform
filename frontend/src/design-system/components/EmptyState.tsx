import React from 'react'
import { cn } from '../utils'
import { Button } from './Button'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon?: LucideIcon | React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void; icon?: React.ReactNode }
  secondaryAction?: { label: string; onClick: () => void }
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: { icon: 32, container: 'py-8',  title: 'text-base', desc: 'text-sm' },
  md: { icon: 48, container: 'py-12', title: 'text-lg',   desc: 'text-sm' },
  lg: { icon: 64, container: 'py-16', title: 'text-xl',   desc: 'text-base' },
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}) => {
  const styles = sizeStyles[size]

  const renderIcon = () => {
    if (!Icon) return null
    if (React.isValidElement(Icon)) {
      return <div className="mb-4 p-4 bg-surface-3 rounded-2xl text-text-tertiary">{Icon}</div>
    }
    const LIcon = Icon as LucideIcon
    return (
      <div className="mb-4 p-4 bg-surface-3 rounded-2xl">
        <LIcon size={styles.icon} className="text-text-tertiary" strokeWidth={1.5} />
      </div>
    )
  }

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', styles.container, className)}>
      {renderIcon()}

      <h3 className={cn('font-semibold text-text-primary mb-2', styles.title)}>{title}</h3>

      {description && (
        <p className={cn('text-text-secondary max-w-sm mb-6', styles.desc)}>{description}</p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button variant="primary" onClick={action.onClick} leftIcon={action.icon}>
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="secondary" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
