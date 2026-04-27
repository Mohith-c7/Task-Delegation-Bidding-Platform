import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, ChevronRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { Card } from '../../design-system'
import { taskService } from '../../services/taskService'
import { Task } from '../../types'
import { cn } from '../../design-system/utils'

export default function RecommendedTasks() {
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    if (!user.skills || user.skills.length === 0) {
      setLoading(false)
      return
    }

    const loadRecommended = async () => {
      try {
        setLoading(true)
        // Using skills[] parameter with the task search API
        // For array params in axios, you'd typically need to format them or pass a string
        // We'll pass them properly to match the backend expectation
        const res = await taskService.getAllTasks({
          status: 'open',
          skills: user.skills
        })
        if (res && res.tasks) {
          // Take top 5
          setTasks(res.tasks.slice(0, 5))
        }
      } catch (err) {
        console.error('Failed to fetch recommended tasks', err)
      } finally {
        setLoading(false)
      }
    }

    loadRecommended()
  }, [user])

  if (!user || user.skills?.length === 0) return null
  if (loading) return null
  if (tasks.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-50 text-indigo-500">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-lg font-bold text-text-primary">Recommended for You</h2>
        </div>
      </div>
      
      <div className="flex overflow-x-auto pb-4 gap-4 snap-x hide-scrollbar">
        {tasks.map(task => (
          <Link
            key={task.id}
            to={`/tasks/${task.id}`}
            className="flex-none w-72 sm:w-80 group snap-start"
          >
            <Card className="h-full p-4 hover:border-primary/50 transition-all cursor-pointer flex flex-col hover:shadow-md">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0 pr-3">
                  <h3 className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                    {task.title}
                  </h3>
                  <p className="text-xs text-text-tertiary truncate">Posted by {task.owner_name || 'Team member'}</p>
                </div>
                <div className={cn(
                  "shrink-0 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md",
                  task.priority === 'critical' ? "bg-error/10 text-error" :
                  task.priority === 'high' ? "bg-warning/10 text-warning" :
                  task.priority === 'medium' ? "bg-blue-50 text-blue-600" :
                  "bg-surface-3 text-text-secondary"
                )}>
                  {task.priority}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mt-auto mb-4">
                {task.skills?.slice(0, 3).map(skill => (
                  <span key={skill} className={cn(
                    "px-2 py-0.5 rounded text-[10px] font-medium border",
                    user.skills?.includes(skill)
                      ? "bg-indigo-50 border-indigo-100 text-indigo-700 font-semibold"
                      : "bg-surface text-text-secondary border-border"
                  )}>
                    {skill}
                  </span>
                ))}
                {task.skills && task.skills.length > 3 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface text-text-secondary border border-border">
                    +{task.skills.length - 3}
                  </span>
                )}
              </div>

              <div className="flex items-center text-xs text-text-secondary font-medium mt-auto group-hover:text-primary transition-colors">
                View details
                <ChevronRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
