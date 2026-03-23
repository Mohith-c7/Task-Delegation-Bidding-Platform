import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../design-system/utils'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-[var(--color-on-surface-variant)]">
        Showing {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === 1
              ? 'text-[var(--color-on-surface-variant)] opacity-40 cursor-not-allowed'
              : 'hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let p: number
          if (totalPages <= 5) p = i + 1
          else if (page <= 3) p = i + 1
          else if (page >= totalPages - 2) p = totalPages - 4 + i
          else p = page - 2 + i
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={cn(
                'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                p === page
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]'
              )}
            >
              {p}
            </button>
          )
        })}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className={cn(
            'p-2 rounded-lg transition-colors',
            page === totalPages
              ? 'text-[var(--color-on-surface-variant)] opacity-40 cursor-not-allowed'
              : 'hover:bg-[var(--color-surface-variant)] text-[var(--color-on-surface)]'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
