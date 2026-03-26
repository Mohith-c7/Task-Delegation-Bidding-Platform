import { Calendar, Clock, ChevronRight, Trash2, Eye, Gavel, ExternalLink, Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Task } from '../../services/taskService'
import { Card, StatusBadge, PriorityBadge, Button } from '../../design-system'
import { cn } from '../../design-system/utils'

interface TaskCardProps {
  task: Task
  onViewBids?: (task: Task) => void
  onPlaceBid?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  showActions?: boolean
  isOwner?: boolean
}

function formatDeadline(deadline: string) {
  const date = new Date(deadline)
  const now  = new Date()
  const diff = date.getTime() - now.getTime()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

  if (days < 0)  return { label: `${Math.abs(days)}d overdue`, overdue: true }
  if (days === 0) return { label: 'Due today', overdue: false, urgent: true }
  if (days === 1) return { label: 'Due tomorrow', overdue: false, urgent: true }
  if (days <= 7)  return { label: `${days}d left`, overdue: false, urgent: true }
  return { label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), overdue: false, urgent: false }
}

export default function TaskCard({
  task,
  onViewBids,
  onPlaceBid,
  onEdit,
  onDelete,
  showActions = true,
  isOwner = false,
}: TaskCardProps) {
  const deadline = formatDeadline(task.deadline)
  const navigate = useNavigate()

  return (
    <Card
      elevation={1}
      padding="none"
      hoverable
      className="group flex flex-col overflow-hidden border border-border hover:border-primary/30 transition-all duration-200"
    >
      {/* Priority accent bar */}
      <div className={cn(
        'h-1 w-full',
        task.priority === 'critical' && 'bg-error',
        task.priority === 'high'     && 'bg-priority-high',
        task.priority === 'medium'   && 'bg-warning',
        task.priority === 'low'      && 'bg-success',
      )} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => navigate(`/tasks/${task.id}`)}
              className="text-left w-full"
            >
              <h4 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-primary transition-colors hover:underline underline-offset-2">
                {task.title}
              </h4>
            </button>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <StatusBadge status={task.status} size="sm" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed flex-1">
          {task.description}
        </p>

        {/* Skills */}
        {task.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {task.skills.slice(0, 3).map((skill, i) => (
              <span key={i} className="px-2 py-0.5 bg-primary-light text-primary text-[10px] font-medium rounded-md">
                {skill}
              </span>
            ))}
            {task.skills.length > 3 && (
              <span className="px-2 py-0.5 bg-surface-3 text-text-tertiary text-[10px] font-medium rounded-md">
                +{task.skills.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-text-tertiary mb-4">
          <div className="flex items-center gap-1">
            <PriorityBadge priority={task.priority} size="sm" />
          </div>
          <div className={cn(
            'flex items-center gap-1',
            deadline.overdue ? 'text-error' : deadline.urgent ? 'text-warning' : 'text-text-tertiary',
          )}>
            {deadline.overdue ? <Clock size={11} /> : <Calendar size={11} />}
            <span className="font-medium">{deadline.label}</span>
          </div>
        </div>

        {/* Footer */}
        {showActions && (
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            {isOwner ? (
              <>
                {onViewBids && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onViewBids(task)}
                    leftIcon={<Eye size={13} />}
                    className="flex-1"
                  >
                    View Bids
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="text-text-tertiary hover:text-primary hover:bg-primary-light"
                  title="Open task"
                >
                  <ExternalLink size={14} />
                </Button>
                {onEdit && task.status === 'open' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(task)}
                    className="text-text-tertiary hover:text-warning hover:bg-warning/10"
                    title="Edit task"
                  >
                    <Pencil size={14} />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(task)}
                    className="text-text-tertiary hover:text-error hover:bg-error-light"
                  >
                    <Trash2 size={14} />
                  </Button>
                )}
              </>
            ) : (
              <>
                {task.status === 'open' && onPlaceBid && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => onPlaceBid(task)}
                    leftIcon={<Gavel size={13} />}
                    className="flex-1"
                  >
                    Place Bid
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  rightIcon={<ChevronRight size={13} />}
                  className={task.status !== 'open' ? 'flex-1' : ''}
                >
                  Details
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
