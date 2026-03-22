import React from 'react'
import { cn } from '../utils'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary text-white border border-primary',
    'hover:bg-primary-hover hover:border-primary-hover hover:shadow-2',
    'active:bg-primary-dark active:scale-[0.98]',
    'disabled:bg-primary/50 disabled:border-primary/50',
    'focus-visible:shadow-focus',
  ].join(' '),

  secondary: [
    'bg-white text-primary border border-border-strong',
    'hover:bg-primary-light hover:border-primary hover:shadow-1',
    'active:bg-primary-light/70 active:scale-[0.98]',
    'disabled:text-text-disabled disabled:border-border',
    'focus-visible:shadow-focus',
  ].join(' '),

  ghost: [
    'bg-transparent text-text-secondary border border-transparent',
    'hover:bg-surface-3 hover:text-text-primary',
    'active:bg-surface-3/70 active:scale-[0.98]',
    'disabled:text-text-disabled',
    'focus-visible:shadow-focus',
  ].join(' '),

  danger: [
    'bg-error text-white border border-error',
    'hover:bg-error/90 hover:shadow-2',
    'active:bg-error/80 active:scale-[0.98]',
    'disabled:bg-error/50 disabled:border-error/50',
    'focus-visible:shadow-focus-error',
  ].join(' '),

  success: [
    'bg-success text-white border border-success',
    'hover:bg-success/90 hover:shadow-2',
    'active:bg-success/80 active:scale-[0.98]',
    'disabled:bg-success/50 disabled:border-success/50',
    'focus-visible:shadow-focus',
  ].join(' '),
}

const sizeStyles: Record<ButtonSize, string> = {
  sm:   'h-8 px-3 text-xs font-medium rounded-md gap-1.5',
  md:   'h-9 px-4 text-sm font-medium rounded-lg gap-2',
  lg:   'h-11 px-6 text-base font-semibold rounded-lg gap-2',
  icon: 'h-9 w-9 rounded-lg p-0 justify-center',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  children,
  className,
  ...props
}, ref) => {
  const isDisabled = disabled || loading

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center',
        'font-sans select-none cursor-pointer',
        'transition-all duration-150 ease-in-out',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'min-h-[44px] min-w-[44px]',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        size !== 'icon' && 'min-w-0',
        className,
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin shrink-0" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
      ) : leftIcon ? (
        <span className="shrink-0">{leftIcon}</span>
      ) : null}
      {size !== 'icon' && children && (
        <span className="truncate">{children}</span>
      )}
      {size === 'icon' && !loading && children}
      {!loading && rightIcon && (
        <span className="shrink-0">{rightIcon}</span>
      )}
    </button>
  )
})

Button.displayName = 'Button'
