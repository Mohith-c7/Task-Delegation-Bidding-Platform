import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../design-system/utils'

export interface FilterState {
  status: string
  priority: string
  sort: string
}

interface FilterPanelProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  className?: string
}

const statusOptions = [
  { value: '', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'closed', label: 'Closed' },
]

const priorityOptions = [
  { value: '', label: 'All priorities' },
  { value: 'critical', label: 'Critical' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

const sortOptions = [
  { value: 'created_at_desc', label: 'Newest first' },
  { value: 'created_at_asc', label: 'Oldest first' },
  { value: 'deadline_asc', label: 'Deadline (soonest)' },
  { value: 'deadline_desc', label: 'Deadline (latest)' },
  { value: 'priority_desc', label: 'Priority (highest)' },
]

const selectClass = 'px-3 py-2 rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface)] text-sm text-[var(--color-on-surface)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all'

export function FilterPanel({ filters, onChange, className }: FilterPanelProps) {
  const hasActiveFilters = filters.status || filters.priority

  const reset = () => onChange({ status: '', priority: '', sort: 'created_at_desc' })

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <SlidersHorizontal className="w-4 h-4 text-[var(--color-on-surface-variant)]" />

      <select
        value={filters.status}
        onChange={e => onChange({ ...filters, status: e.target.value })}
        className={selectClass}
      >
        {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select
        value={filters.priority}
        onChange={e => onChange({ ...filters, priority: e.target.value })}
        className={selectClass}
      >
        {priorityOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      <select
        value={filters.sort}
        onChange={e => onChange({ ...filters, sort: e.target.value })}
        className={selectClass}
      >
        {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>

      {hasActiveFilters && (
        <button
          onClick={reset}
          className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs text-[var(--color-error)] hover:bg-[var(--color-error-container)] transition-colors"
        >
          <X className="w-3.5 h-3.5" /> Clear
        </button>
      )}
    </div>
  )
}
