import { Task } from '../../services/taskService'

interface TaskCardProps {
  task: Task
  onViewBids?: (task: Task) => void
  onPlaceBid?: (task: Task) => void
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  showActions?: boolean
  isOwner?: boolean
}

export default function TaskCard({ 
  task, 
  onViewBids, 
  onPlaceBid, 
  onEdit, 
  onDelete,
  showActions = true,
  isOwner = false 
}: TaskCardProps) {
  const priorityColors = {
    low: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700',
  }

  const statusColors = {
    open: 'bg-blue-100 text-blue-700',
    assigned: 'bg-purple-100 text-purple-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    closed: 'bg-gray-100 text-gray-700',
  }

  return (
    <div className="border border-gray-200 rounded-lg p-5 hover:shadow-lg transition bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h4>
          <div className="flex gap-2 mb-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
              {task.status.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-sm text-gray-500">
            Due: {new Date(task.deadline).toLocaleDateString()}
          </p>
        </div>
      </div>

      <p className="text-gray-600 mb-3 line-clamp-2">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {task.skills.map((skill, idx) => (
          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200">
            {skill}
          </span>
        ))}
      </div>

      {showActions && (
        <div className="flex gap-2 pt-3 border-t border-gray-200">
          {isOwner ? (
            <>
              {onViewBids && (
                <button
                  onClick={() => onViewBids(task)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                >
                  View Bids
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(task)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(task)}
                  className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition"
                >
                  Delete
                </button>
              )}
            </>
          ) : (
            <>
              {task.status === 'open' && onPlaceBid && (
                <button
                  onClick={() => onPlaceBid(task)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                >
                  Place Bid
                </button>
              )}
              {onViewBids && (
                <button
                  onClick={() => onViewBids(task)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition"
                >
                  View Details
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
