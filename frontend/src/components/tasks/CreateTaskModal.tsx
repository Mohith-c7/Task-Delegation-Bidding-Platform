import { useState } from 'react'
import { taskService } from '../../services/taskService'
import { Button, Input, Textarea } from '../../design-system'
import { X, Plus, Tag, Calendar, Flag, FileText, Sparkles } from 'lucide-react'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const PRIORITY_OPTIONS = [
  { value: 'low',      label: '🟢 Low' },
  { value: 'medium',   label: '🔵 Medium' },
  { value: 'high',     label: '🟠 High' },
  { value: 'critical', label: '🔴 Critical' },
]

export default function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({ title: '', description: '', skills: '', deadline: '', priority: 'medium' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const skillsArray = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
      await taskService.createTask({ ...formData, deadline: new Date(formData.deadline).toISOString(), skills: skillsArray })
      onSuccess()
      onClose()
      setFormData({ title: '', description: '', skills: '', deadline: '', priority: 'medium' })
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-1 w-full sm:max-w-xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-surface-1 border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Create Task</h2>
              <p className="text-xs text-text-tertiary">Post a task for your team to bid on</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-3 hover:bg-surface-4 flex items-center justify-center transition-colors">
            <X size={15} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-xl">{error}</div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <FileText size={12} /> Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Fix authentication bug in login flow"
              required disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <FileText size={12} /> Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task in detail — what needs to be done, acceptance criteria, context..."
              rows={4} required disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
              <Tag size={12} /> Required Skills
              <span className="text-text-tertiary font-normal">(comma-separated)</span>
            </label>
            <Input
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g., React, TypeScript, Node.js"
              required disabled={loading}
            />
            {formData.skills && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-lg">{skill}</span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Calendar size={12} /> Deadline
              </label>
              <Input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                required disabled={loading}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5 flex items-center gap-1.5">
                <Flag size={12} /> Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                disabled={loading}
                className="w-full h-10 px-3 text-sm text-text-primary bg-white border border-border-strong rounded-lg appearance-none cursor-pointer transition-all duration-150 outline-none hover:border-primary/50 focus:border-primary disabled:bg-surface-3 disabled:cursor-not-allowed"
              >
                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" loading={loading} leftIcon={<Plus size={15} />} className="flex-1">
              Create Task
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
