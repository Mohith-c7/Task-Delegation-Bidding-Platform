import { useState } from 'react'
import { Task } from '../../services/taskService'
import { bidService } from '../../services/bidService'
import { Button, Input, Textarea, Modal, StatusBadge, PriorityBadge } from '../../design-system'
import { Gavel, Calendar, Tag, Clock, X } from 'lucide-react'

interface PlaceBidModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onSuccess: () => void
}

export default function PlaceBidModal({ isOpen, task, onClose, onSuccess }: PlaceBidModalProps) {
  const [formData, setFormData] = useState({ message: '', estimated_completion: '' })
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnswerChange = (question: string, value: string) => {
    setAnswers(prev => ({ ...prev, [question]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return
    setError('')
    setLoading(true)
    try {
      await bidService.placeBid(task.id, {
        message: formData.message,
        estimated_completion: new Date(formData.estimated_completion).toISOString(),
        answers: Object.keys(answers).length > 0 ? answers : undefined,
      })
      onSuccess()
      onClose()
      setFormData({ message: '', estimated_completion: '' })
      setAnswers({})
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to place bid')
    } finally {
      setLoading(false)
    }
  }

  if (!task) return null

  return (
    <Modal open={isOpen} onClose={onClose} size="md" hideClose>
      {/* Header */}
      <div className="-mx-6 -mt-6 px-6 py-5 border-b border-border bg-gradient-to-r from-success/5 to-transparent rounded-t-2xl flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-success/10 flex items-center justify-center">
            <Gavel size={18} className="text-success" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Place a Bid</h2>
            <p className="text-xs text-text-tertiary">Submit your proposal for this task</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-surface-3 hover:bg-surface-2 border border-border flex items-center justify-center transition-colors"
        >
          <X size={15} className="text-text-secondary" />
        </button>
      </div>

      {/* Task preview card */}
      <div className="bg-surface-2 border border-border rounded-2xl p-4 mb-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 flex-1">{task.title}</h3>
          <StatusBadge status={task.status} size="sm" />
        </div>
        <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">{task.description}</p>
        <div className="flex items-center gap-2 flex-wrap">
          <PriorityBadge priority={task.priority} size="sm" />
          {task.skills?.slice(0, 3).map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-[10px] text-primary bg-primary/8 border border-primary/15 px-2 py-0.5 rounded-lg font-medium">
              <Tag size={8} />{s}
            </span>
          ))}
          <span className="ml-auto flex items-center gap-1 text-[10px] text-text-tertiary">
            <Clock size={9} />
            Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-error/8 border border-error/20 text-error text-sm rounded-xl mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Questionnaire provided by Task Owner */}
        {task.questions && task.questions.length > 0 && (
          <div className="space-y-3 bg-primary/5 p-4 rounded-xl border border-primary/10 mb-4">
            <h4 className="text-xs font-bold text-primary flex items-center gap-1.5">Task Questionnaire</h4>
            {task.questions.map((q, i) => (
              <div key={i} className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary">Q{i + 1}. {q}</label>
                <Textarea
                  value={answers[q] || ''}
                  onChange={e => handleAnswerChange(q, e.target.value)}
                  placeholder="Your answer..."
                  rows={2}
                  required
                  disabled={loading}
                  className="bg-white"
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-text-secondary">Your Proposal / Cover Letter</label>
          <Textarea
            value={formData.message}
            onChange={e => setFormData({ ...formData, message: e.target.value })}
            placeholder="Explain your approach, relevant experience, and why you're the best fit for this task..."
            rows={task.questions?.length ? 3 : 5} required disabled={loading}
          />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Calendar size={11} className="text-text-tertiary" /> Estimated Completion Date
          </label>
          <Input
            type="datetime-local"
            value={formData.estimated_completion}
            onChange={e => setFormData({ ...formData, estimated_completion: e.target.value })}
            required disabled={loading}
          />
        </div>

        <div className="flex gap-3 pt-2 border-t border-border mt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="success" loading={loading} leftIcon={<Gavel size={15} />} className="flex-1">
            Submit Bid
          </Button>
        </div>
      </form>
    </Modal>
  )
}
