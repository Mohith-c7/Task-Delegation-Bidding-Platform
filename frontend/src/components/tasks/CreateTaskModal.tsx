import { useState } from 'react'
import { taskService } from '../../services/taskService'
import { useAuthStore } from '../../store/authStore'
import { Button, Input, Textarea, Modal } from '../../design-system'
import { Plus, Tag, Calendar, Flag, FileText, Sparkles, X } from 'lucide-react'

interface CreateTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Low',      color: 'text-success',  dot: 'bg-success' },
  { value: 'medium',   label: 'Medium',   color: 'text-info',     dot: 'bg-info' },
  { value: 'high',     label: 'High',     color: 'text-warning',  dot: 'bg-warning' },
  { value: 'critical', label: 'Critical', color: 'text-error',    dot: 'bg-error' },
]

export default function CreateTaskModal({ isOpen, onClose, onSuccess }: CreateTaskModalProps) {
  const [formData, setFormData] = useState({ title: '', description: '', skills: '', deadline: '', priority: 'medium' })
  const [questions, setQuestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const orgID = useAuthStore(s => s.orgID)

  const handleAddQuestion = () => setQuestions([...questions, ''])
  const handleRemoveQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index))
  const handleQuestionChange = (index: number, value: string) => {
    const newQ = [...questions]
    newQ[index] = value
    setQuestions(newQ)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const skillsArray = formData.skills ? formData.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      const filledQuestions = questions.filter(q => q.trim() !== '')
      await taskService.createTask({
        ...formData,
        deadline: new Date(formData.deadline).toISOString(),
        skills: skillsArray,
        questions: filledQuestions,
        ...(orgID ? { org_id: orgID } : {}),
      })
      onSuccess()
      onClose()
      setFormData({ title: '', description: '', skills: '', deadline: '', priority: 'medium' })
      setQuestions([])
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const skillList = formData.skills.split(',').map(s => s.trim()).filter(Boolean)
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === formData.priority)

  return (
    <Modal open={isOpen} onClose={onClose} size="lg" hideClose>
      {/* Custom header */}
      <div className="-mx-6 -mt-6 px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent rounded-t-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Create Task</h2>
            <p className="text-xs text-text-tertiary">Post a task for your team to bid on</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-3 hover:bg-surface-2 border border-border flex items-center justify-center transition-colors">
          <X size={15} className="text-text-secondary" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-error/8 border border-error/20 text-error text-sm rounded-xl">
            <span className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
            {error}
          </div>
        )}

        {/* Title */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <FileText size={11} className="text-text-tertiary" /> Task Title
          </label>
          <Input
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g., Fix authentication bug in login flow"
            required disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <FileText size={11} className="text-text-tertiary" /> Description
          </label>
          <Textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe what needs to be done, acceptance criteria, and any relevant context..."
            rows={4} required disabled={loading}
          />
        </div>

        {/* Skills */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Tag size={11} className="text-text-tertiary" /> Required Skills
            <span className="text-text-tertiary font-normal ml-0.5">· comma-separated</span>
          </label>
          <Input
            value={formData.skills}
            onChange={e => setFormData({ ...formData, skills: e.target.value })}
            placeholder="React, TypeScript, Node.js"
            disabled={loading}
          />
          {skillList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skillList.map((skill, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/8 text-primary text-xs font-medium rounded-lg border border-primary/15">
                  <Tag size={9} />{skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Questionnaire */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <FileText size={11} className="text-text-tertiary" /> Questionnaire (Optional)
            </label>
            <Button type="button" variant="secondary" size="sm" onClick={handleAddQuestion} disabled={loading} leftIcon={<Plus size={12} />}>
              Add Question
            </Button>
          </div>
          {questions.length === 0 ? (
            <p className="text-xs text-text-tertiary">Ask bidders specific questions (e.g., "What is your approach to this task?").</p>
          ) : (
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-xs font-medium text-text-secondary shrink-0">Q{i + 1}.</span>
                  <Input
                    value={q}
                    onChange={e => handleQuestionChange(i, e.target.value)}
                    placeholder="Enter your question here"
                    className="flex-1"
                    disabled={loading}
                  />
                  <button type="button" onClick={() => handleRemoveQuestion(i)} className="text-error/70 hover:text-error p-2 shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Deadline + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Calendar size={11} className="text-text-tertiary" /> Deadline
            </label>
            <Input
              type="datetime-local"
              value={formData.deadline}
              onChange={e => setFormData({ ...formData, deadline: e.target.value })}
              required disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Flag size={11} className="text-text-tertiary" /> Priority
            </label>
            <div className="relative">
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
                disabled={loading}
                className="w-full h-10 pl-8 pr-3 text-sm font-medium bg-white border border-border-strong rounded-lg appearance-none cursor-pointer outline-none hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-surface-3 disabled:cursor-not-allowed transition-all"
              >
                {PRIORITY_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              {selectedPriority && (
                <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${selectedPriority.dot}`} />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={loading} leftIcon={<Plus size={15} />} className="flex-1">
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  )
}
