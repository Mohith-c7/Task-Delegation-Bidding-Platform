import React from 'react'
import { Task } from '../../services/taskService'
import TaskCard from '../tasks/TaskCard'
import { Card } from '../../design-system'
import { cn } from '../../design-system/utils'

interface KanbanBoardProps {
  tasks: Task[]
  onPlaceBid: (task: Task) => void
  onViewBids: (task: Task) => void
  onDelete: (task: Task) => void
  isOwner: (task: Task) => boolean
}

const COLUMNS = [
  { id: 'open', label: 'Open', color: 'border-t-success' },
  { id: 'assigned', label: 'Assigned', color: 'border-t-info' },
  { id: 'in_progress', label: 'In Progress', color: 'border-t-warning' },
  { id: 'completed', label: 'Completed', color: 'border-t-secondary' },
  { id: 'closed', label: 'Closed', color: 'border-t-text-tertiary' },
]

export default function KanbanBoard({ tasks, onPlaceBid, onViewBids, onDelete, isOwner }: KanbanBoardProps) {
  const getTasksByStatus = (status: string) => {
    return tasks.filter(t => t.status === status)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px] snap-x">
      {COLUMNS.map(column => {
        const columnTasks = getTasksByStatus(column.id)
        return (
          <div key={column.id} className="flex-none w-80 snap-start flex flex-col h-full">
            <div className={cn(
              "flex items-center justify-between px-3 py-2 bg-surface-2 rounded-t-xl border-t-2 mb-3",
              column.color
            )}>
              <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                {column.label}
                <span className="bg-surface-3 text-text-tertiary text-[10px] px-1.5 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </h3>
            </div>
            
            <div className={cn(
              "flex-1 space-y-3 p-2 bg-surface-2/30 rounded-b-xl border border-border/50 overflow-y-auto max-h-[calc(100vh-400px)] custom-scrollbar",
              columnTasks.length === 0 && "flex items-center justify-center border-dashed"
            )}>
              {columnTasks.length === 0 ? (
                <p className="text-[10px] text-text-tertiary uppercase tracking-widest font-medium">No tasks</p>
              ) : (
                columnTasks.map(task => (
                  <div key={task.id} className="transition-transform duration-200 hover:-translate-y-1">
                    <TaskCard
                      task={task}
                      isOwner={isOwner(task)}
                      showDescription={false}
                      compact
                      onPlaceBid={onPlaceBid}
                      onViewBids={onViewBids}
                      onDelete={onDelete}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
