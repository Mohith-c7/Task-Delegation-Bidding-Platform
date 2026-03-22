import { useState } from 'react'
import { Task } from '../../services/taskService'
import { bidService } from '../../services/bidService'
import { Button, Input, Textarea, StatusBadge, PriorityBadge } from '../../design-system'
import { X, Gavel, Calendar, Tag, Clock } from 'lucide-react'

interface PlaceBidModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onSuccess: () => void
}

export default function PlaceBidModal({ isOpen, task, onClose, onSuccess }: PlaceBidModalProps) {
  const [formData, setFormData] = useState({ message: '', estimated_completion: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return
    setError('')
    setLoading(true)
    try {
      await bidService.placeBid(task.id, {
        message: formData.message,
        estimated_completion: new Date(formData.estimated_completion).toISOString(),
      })
      onSuccess()
      onClose()
      setFormData({ message: '', estimated_completion: '' })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place bid')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-1 w-full sm:max-w-lg sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-surface-1 border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-success/10 flex items-center justify-center">
              <Gavel size={15} className="text-success" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Place Bid</h2>
              <p className="text-xs text-text-tertiary">Submit your proposal for this task</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-3 hover:bg-surface-4 flex items-center justify-center transition-colors">
            <X size={15} className="text-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-surface-3 rounded-2xl p-4 border border-border">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-sm font-semibold text-text-primary line-clamp-2">{task.title}</h3>
              <StatusBadge status={task.status} size="sm" />
            </div>
            <p className="text-xs text-text-secondary line-clamp-2 mb-3">{task.description}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <PriorityBadge priority={task.priority} size="sm" />
              {task.skills.slice(0, 3).map((s, i) => (
                <span key={i} className="flex items-center gap-1 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-lg font-medium">
                  <Tag size={9} />{s}
                </span>
              ))}
              <span className="flex items-center gap-1 text-[10px] text-text-tertiary ml-auto">
                <Clock size={9} />
                Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-xl">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Your Proposal</label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Explain your approach, relevant experience, and why you're the best fit..."
                rows={5} required disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                <span className="flex items-center gap-1.5"><Calendar size={12} /> Estimated Completion</span>
              </label>
              <Input
                type="datetime-local"
                value={formData.estimated_completion}
                onChange={(e) => setFormData({ ...formData, estimated_completion: e.target.value })}
                required disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="flex-1">Cancel</Button>
              <Button type="submit" variant="success" loading={loading} leftIcon={<Gavel size={15} />} className="flex-1">
                Submit Bid
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
