import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, CheckSquare, Square, Activity,
  Clock, User, Tag, ChevronRight, Send, Loader2, Star
} from 'lucide-react'
import api from '../services/api'
import Layout from '../components/common/Layout'
import { Badge, Button, Card, Skeleton } from '../design-system'
import { useRBAC } from '../hooks/useRBAC'
import { useAuthStore } from '../store/authStore'
import { taskService } from '../services/taskService'
import { cn } from '../design-system/utils'

interface TaskDetailData {
  id: string; title: string; description: string; skills: string[]
  deadline: string; priority: string; status: string
  owner_id: string; owner_name: string; assigned_to?: string; org_id?: string
  rating?: number; points?: number
  created_at: string; updated_at: string
  activity: Array<{ id: string; event_type: string; field_name?: string; old_value?: string; new_value?: string; actor_name?: string; created_at: string }>
  comments: Array<{ id: string; author_id: string; author_name?: string; body: string; created_at: string }>
  checklist: Array<{ id: string; title: string; is_done: boolean; position: number }>
}

const priorityColors: Record<string, string> = {
  critical: 'error', high: 'warning', medium: 'primary', low: 'success'
}

const statusColors: Record<string, string> = {
  open: 'primary', assigned: 'purple', in_progress: 'warning', completed: 'success', closed: 'default'
}

const allowedTransitions: Record<string, string[]> = {
  open: ['assigned', 'closed'],
  assigned: ['in_progress'],
  in_progress: ['completed'],
  completed: ['closed'],
}

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  useRBAC()
  const { user } = useAuthStore()
  const [comment, setComment] = useState('')
  const [activeTab, setActiveTab] = useState<'activity' | 'comments' | 'checklist'>('activity')
  const [rating, setRating] = useState(0)
  const [points, setPoints] = useState(100)

  const { data: task, isLoading } = useQuery<TaskDetailData>({
    queryKey: ['task-detail', id],
    queryFn: async () => {
      const res = await api.get(`/tasks/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })

  const transitionMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/tasks/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-detail', id] }),
  })

  const commentMutation = useMutation({
    mutationFn: (body: string) => api.post(`/tasks/${id}/comments`, { body }),
    onSuccess: () => {
      setComment('')
      qc.invalidateQueries({ queryKey: ['task-detail', id] })
    },
  })

  const checklistMutation = useMutation({
    mutationFn: (items: TaskDetailData['checklist']) => api.put(`/tasks/${id}/checklist`, { items }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-detail', id] }),
  })

  const rateMutation = useMutation({
    mutationFn: ({ rating, points }: { rating: number, points: number }) => taskService.rateTask(id!, rating, points),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['task-detail', id] }),
  })

  const toggleChecklist = (itemId: string) => {
    if (!task) return
    const updated = task.checklist.map(ci =>
      ci.id === itemId ? { ...ci, is_done: !ci.is_done } : ci
    )
    checklistMutation.mutate(updated)
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    )
  }

  if (!task) return <Layout><div className="text-center py-20 text-[var(--color-on-surface-variant)]">Task not found</div></Layout>

  const nextStatuses = allowedTransitions[task.status] || []
  const completedChecklist = task.checklist.filter(ci => ci.is_done).length

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back + Title */}
        <div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] mb-3 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex flex-wrap items-start gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-on-surface)] flex-1">{task.title}</h1>
            <Badge variant={statusColors[task.status] as any}>{task.status.replace('_', ' ')}</Badge>
            <Badge variant={priorityColors[task.priority] as any}>{task.priority}</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-2">Description</h2>
              <p className="text-[var(--color-on-surface)] leading-relaxed">{task.description}</p>
            </Card>

            {/* Tabs */}
            <Card className="overflow-hidden">
              <div className="flex border-b border-[var(--color-outline-variant)]">
                {(['activity', 'comments', 'checklist'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 py-3 text-sm font-medium capitalize transition-colors',
                      activeTab === tab
                        ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                        : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
                    )}
                  >
                    {tab === 'checklist' && task.checklist.length > 0
                      ? `Checklist (${completedChecklist}/${task.checklist.length})`
                      : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>

              <div className="p-4">
                {activeTab === 'activity' && (
                  <div className="space-y-3">
                    {task.activity.length === 0 ? (
                      <p className="text-sm text-[var(--color-on-surface-variant)] text-center py-6">No activity yet</p>
                    ) : task.activity.map(a => (
                      <div key={a.id} className="flex gap-3 text-sm">
                        <Activity className="w-4 h-4 text-[var(--color-primary)] mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-[var(--color-on-surface)]">{a.actor_name || 'Someone'}</span>
                          {' '}<span className="text-[var(--color-on-surface-variant)]">{a.event_type.replace(/_/g, ' ')}</span>
                          {a.field_name && <span className="text-[var(--color-on-surface-variant)]"> · {a.field_name}: <span className="line-through">{a.old_value}</span> → {a.new_value}</span>}
                          <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">{new Date(a.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'comments' && (
                  <div className="space-y-4">
                    {task.comments.map(c => (
                      <div key={c.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center text-xs font-bold text-[var(--color-on-primary-container)] flex-shrink-0">
                          {(c.author_name || 'U')[0].toUpperCase()}
                        </div>
                        <div className="flex-1 bg-[var(--color-surface-variant)] rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-[var(--color-on-surface)]">{c.author_name || 'User'}</span>
                            <span className="text-xs text-[var(--color-on-surface-variant)]">{new Date(c.created_at).toLocaleString()}</span>
                          </div>
                          <p className="text-sm text-[var(--color-on-surface)]">{c.body}</p>
                        </div>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-4">
                      <input
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && comment.trim() && commentMutation.mutate(comment.trim())}
                        placeholder="Add a comment..."
                        className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                      />
                      <Button
                        size="sm"
                        onClick={() => comment.trim() && commentMutation.mutate(comment.trim())}
                        disabled={!comment.trim() || commentMutation.isPending}
                      >
                        {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'checklist' && (
                  <div className="space-y-2">
                    {task.checklist.length === 0 ? (
                      <p className="text-sm text-[var(--color-on-surface-variant)] text-center py-6">No checklist items</p>
                    ) : task.checklist.map(ci => (
                      <button
                        key={ci.id}
                        onClick={() => toggleChecklist(ci.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--color-surface-variant)] transition-colors text-left"
                      >
                        {ci.is_done
                          ? <CheckSquare className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" />
                          : <Square className="w-5 h-5 text-[var(--color-on-surface-variant)] flex-shrink-0" />
                        }
                        <span className={cn('text-sm', ci.is_done && 'line-through text-[var(--color-on-surface-variant)]')}>
                          {ci.title}
                        </span>
                      </button>
                    ))}
                    {task.checklist.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-outline-variant)]">
                        <div className="flex items-center justify-between text-xs text-[var(--color-on-surface-variant)] mb-1">
                          <span>Progress</span>
                          <span>{completedChecklist}/{task.checklist.length}</span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-surface-variant)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[var(--color-primary)] rounded-full transition-all"
                            style={{ width: `${(completedChecklist / task.checklist.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status transitions */}
            {nextStatuses.length > 0 && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-3">Transition Status</h3>
                <div className="space-y-2">
                  {nextStatuses.map(s => (
                    <Button
                      key={s}
                      variant="secondary"
                      size="sm"
                      className="w-full justify-between"
                      onClick={() => transitionMutation.mutate(s)}
                      disabled={transitionMutation.isPending}
                    >
                      {s.replace('_', ' ')}
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </Card>
            )}

            {/* Rating submission */}
            {task.status === 'completed' && task.owner_id === user?.id && !task.rating && (
              <Card className="p-4">
                <h3 className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wide mb-3">Rate completed task</h3>
                <div className="space-y-3 text-sm">
                  <div className="space-y-1">
                    <label className="text-[var(--color-on-surface-variant)]">Rating (1-5)</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={cn("p-1 rounded-md transition-colors", rating >= star ? "text-[var(--color-primary)]" : "text-[var(--color-outline-variant)]")}
                        >
                          <Star className={cn("w-6 h-6", rating >= star && "fill-current")} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[var(--color-on-surface-variant)]">Points to award</label>
                    <input
                      type="number"
                      min="0"
                      value={points}
                      onChange={e => setPoints(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => rateMutation.mutate({ rating, points })}
                    disabled={rateMutation.isPending || rating === 0}
                  >
                    Submit Rating
                  </Button>
                </div>
              </Card>
            )}

            {/* Display Rating & Points if already rated */}
            {task.rating && (
              <Card className="p-5 bg-[var(--color-primary-container)] text-[var(--color-on-primary-container)] border-none shadow-md">
                <div className="flex items-center justify-between mb-3 border-b border-[var(--color-primary)]/20 pb-3">
                   <div className="flex items-center gap-2">
                     <Star className="w-5 h-5 fill-current text-[var(--color-primary)]"/>
                     <span className="text-sm font-bold uppercase tracking-wider">Rating</span>
                   </div>
                   <span className="text-xl font-black">{task.rating}/5</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className="text-sm font-bold uppercase tracking-wider">Points</span>
                   <Badge variant="primary" className="text-sm font-black px-3 py-1">+{task.points}</Badge>
                </div>
              </Card>
            )}

            {/* Meta */}
            <Card className="p-4 space-y-3">
              <h3 className="text-sm font-semibold text-[var(--color-on-surface-variant)] uppercase tracking-wide">Details</h3>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
                <span className="text-[var(--color-on-surface-variant)]">Deadline:</span>
                <span className="text-[var(--color-on-surface)] font-medium">{new Date(task.deadline).toLocaleDateString()}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Tag className="w-4 h-4 text-[var(--color-on-surface-variant)] mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {task.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] text-xs">{s}</span>
                  ))}
                </div>
              </div>
              {task.owner_id && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
                  <span className="text-[var(--color-on-surface-variant)]">Posted by:</span>
                  <button 
                    onClick={() => navigate(`/profile/${task.owner_id}`)}
                    className="text-[var(--color-primary)] font-medium truncate hover:underline"
                  >
                    {task.owner_name || 'User'}
                  </button>
                </div>
              )}
              {task.assigned_to && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-[var(--color-on-surface-variant)]" />
                  <span className="text-[var(--color-on-surface-variant)]">Assigned to:</span>
                  <button 
                    onClick={() => navigate(`/profile/${task.assigned_to}`)}
                    className="text-[var(--color-primary)] font-medium truncate hover:underline"
                  >
                    {task.assigned_to}
                  </button>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
