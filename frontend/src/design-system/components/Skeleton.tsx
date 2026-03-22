import React from 'react'
import { cn } from '../utils'

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number
  height?: string | number
  rounded?: boolean
  circle?: boolean
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height,
  rounded = false,
  circle = false,
  className,
  style,
  ...props
}) => (
  <div
    className={cn(
      'skeleton-pulse',
      circle ? 'rounded-full' : rounded ? 'rounded-full' : 'rounded-md',
      className,
    )}
    style={{
      width:  width  ? (typeof width  === 'number' ? `${width}px`  : width)  : undefined,
      height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      ...style,
    }}
    {...props}
  />
)

// Pre-built skeleton patterns
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        height={14}
        className={cn('w-full', i === lines - 1 && 'w-3/4')}
      />
    ))}
  </div>
)

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-xl p-6 shadow-1 space-y-4', className)}>
    <div className="flex items-center gap-3">
      <Skeleton circle width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton height={14} className="w-1/3" />
        <Skeleton height={12} className="w-1/4" />
      </div>
    </div>
    <SkeletonText lines={3} />
    <div className="flex gap-2">
      <Skeleton height={24} className="w-16" rounded />
      <Skeleton height={24} className="w-20" rounded />
    </div>
  </div>
)

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 5,
  cols = 4,
}) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex gap-4 pb-3 border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <Skeleton key={i} height={12} className="flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 items-center py-2">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} height={14} className={cn('flex-1', j === 0 && 'w-8 flex-none')} />
        ))}
      </div>
    ))}
  </div>
)

export const SkeletonStat: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('bg-white rounded-xl p-6 shadow-1 space-y-3', className)}>
    <div className="flex items-center justify-between">
      <Skeleton height={14} className="w-24" />
      <Skeleton circle width={36} height={36} />
    </div>
    <Skeleton height={32} className="w-20" />
    <Skeleton height={12} className="w-32" />
  </div>
)
