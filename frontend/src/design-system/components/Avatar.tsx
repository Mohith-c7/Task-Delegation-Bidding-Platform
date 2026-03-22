import React from 'react'
import { cn } from '../utils'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name?: string
  src?: string
  size?: AvatarSize
  className?: string
  online?: boolean
}

const sizeStyles: Record<AvatarSize, { container: string; text: string; indicator: string }> = {
  xs: { container: 'w-6 h-6 text-[10px]',  text: 'font-semibold', indicator: 'w-1.5 h-1.5 border' },
  sm: { container: 'w-8 h-8 text-xs',       text: 'font-semibold', indicator: 'w-2 h-2 border' },
  md: { container: 'w-10 h-10 text-sm',     text: 'font-semibold', indicator: 'w-2.5 h-2.5 border-2' },
  lg: { container: 'w-12 h-12 text-base',   text: 'font-bold',     indicator: 'w-3 h-3 border-2' },
  xl: { container: 'w-16 h-16 text-xl',     text: 'font-bold',     indicator: 'w-3.5 h-3.5 border-2' },
}

// Generate a consistent color from a name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-indigo-500', 'bg-red-500',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export const Avatar: React.FC<AvatarProps> = ({
  name = 'User',
  src,
  size = 'md',
  className,
  online,
}) => {
  const styles = sizeStyles[size]
  const color = getAvatarColor(name)
  const initials = getInitials(name)

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div className={cn(
        'rounded-full flex items-center justify-center overflow-hidden',
        styles.container,
        !src && color,
      )}>
        {src ? (
          <img src={src} alt={name} className="w-full h-full object-cover" />
        ) : (
          <span className={cn('text-white', styles.text)}>{initials}</span>
        )}
      </div>
      {online !== undefined && (
        <span className={cn(
          'absolute bottom-0 right-0 rounded-full border-white',
          styles.indicator,
          online ? 'bg-success' : 'bg-text-tertiary',
        )} />
      )}
    </div>
  )
}

// Avatar group
interface AvatarGroupProps {
  users: { name: string; src?: string }[]
  max?: number
  size?: AvatarSize
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({ users, max = 3, size = 'sm' }) => {
  const visible = users.slice(0, max)
  const remaining = users.length - max

  return (
    <div className="flex items-center -space-x-2">
      {visible.map((user, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          <Avatar name={user.name} src={user.src} size={size} />
        </div>
      ))}
      {remaining > 0 && (
        <div className={cn(
          'ring-2 ring-white rounded-full bg-surface-3 flex items-center justify-center',
          sizeStyles[size].container,
        )}>
          <span className="text-xs font-semibold text-text-secondary">+{remaining}</span>
        </div>
      )}
    </div>
  )
}
