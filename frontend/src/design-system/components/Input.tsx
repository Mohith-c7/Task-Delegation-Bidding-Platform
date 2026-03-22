import React from 'react'
import { cn } from '../utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  helperText?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  fullWidth = true,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const hasError = !!error

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text-primary"
        >
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-text-tertiary pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full h-10 px-3 text-sm text-text-primary',
            'bg-white border rounded-lg',
            'placeholder:text-text-tertiary',
            'transition-all duration-150',
            'outline-none',
            // Normal state
            !hasError && [
              'border-border-strong',
              'hover:border-primary/50',
              'focus:border-primary focus:shadow-focus',
            ],
            // Error state
            hasError && [
              'border-error',
              'focus:border-error focus:shadow-focus-error',
            ],
            // Disabled state
            'disabled:bg-surface-3 disabled:text-text-disabled disabled:cursor-not-allowed',
            leftIcon  && 'pl-10',
            rightIcon && 'pr-10',
            className,
          )}
          {...props}
        />

        {rightIcon && (
          <span className="absolute right-3 text-text-tertiary flex items-center">
            {rightIcon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <p className={cn(
          'text-xs',
          hasError ? 'text-error' : 'text-text-secondary',
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  helperText,
  error,
  fullWidth = true,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const hasError = !!error

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <textarea
        ref={ref}
        id={inputId}
        className={cn(
          'w-full px-3 py-2.5 text-sm text-text-primary',
          'bg-white border rounded-lg resize-none',
          'placeholder:text-text-tertiary',
          'transition-all duration-150 outline-none',
          !hasError && 'border-border-strong hover:border-primary/50 focus:border-primary focus:shadow-focus',
          hasError  && 'border-error focus:border-error focus:shadow-focus-error',
          'disabled:bg-surface-3 disabled:text-text-disabled disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      />

      {(error || helperText) && (
        <p className={cn('text-xs', hasError ? 'text-error' : 'text-text-secondary')}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Textarea.displayName = 'Textarea'

// Select variant
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  fullWidth = true,
  options,
  placeholder,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
  const hasError = !!error

  return (
    <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      <select
        ref={ref}
        id={inputId}
        className={cn(
          'w-full h-10 px-3 text-sm text-text-primary',
          'bg-white border rounded-lg appearance-none cursor-pointer',
          'transition-all duration-150 outline-none',
          !hasError && 'border-border-strong hover:border-primary/50 focus:border-primary focus:shadow-focus',
          hasError  && 'border-error focus:border-error focus:shadow-focus-error',
          'disabled:bg-surface-3 disabled:text-text-disabled disabled:cursor-not-allowed',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>

      {(error || helperText) && (
        <p className={cn('text-xs', hasError ? 'text-error' : 'text-text-secondary')}>
          {error || helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
