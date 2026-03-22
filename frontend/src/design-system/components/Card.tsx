import React from 'react'
import { cn } from '../utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevation?: 0 | 1 | 2 | 3 | 4
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hoverable?: boolean
  bordered?: boolean
}

const elevationStyles = {
  0: 'shadow-none',
  1: 'shadow-1',
  2: 'shadow-2',
  3: 'shadow-3',
  4: 'shadow-4',
}

const paddingStyles = {
  none: '',
  sm:   'p-4',
  md:   'p-6',
  lg:   'p-8',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  elevation = 1,
  padding = 'md',
  hoverable = false,
  bordered = false,
  children,
  className,
  ...props
}, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-white rounded-xl',
      elevationStyles[elevation],
      paddingStyles[padding],
      bordered && 'border border-border',
      hoverable && [
        'cursor-pointer transition-all duration-200',
        'hover:shadow-3 hover:-translate-y-0.5',
      ],
      className,
    )}
    {...props}
  >
    {children}
  </div>
))

Card.displayName = 'Card'

// Card sub-components
export const CardHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-between mb-4', className)} {...props}>
    {children}
  </div>
)

export const CardTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-base font-semibold text-text-primary', className)} {...props}>
    {children}
  </h3>
)

export const CardDescription = ({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-text-secondary', className)} {...props}>
    {children}
  </p>
)

export const CardContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
)

export const CardFooter = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center justify-between mt-4 pt-4 border-t border-border', className)} {...props}>
    {children}
  </div>
)
