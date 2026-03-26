import { useState, useEffect } from 'react'
import { taskService, Task } from '../../services/taskService'
import { Button, Input, Textarea, Modal } from '../../design-system'
import { Save, Tag, Calendar, Flag, FileText, X } from 'lucide-react'
import { useToast } from '../../design-system'

interface EditTaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const PRIORITY_OPTIONS = [
  { value: 'low',      label: 'Low',      dot: 'bg-success' },
  { value: 'medium',   label: 'Medium',   dot: 'bg-info' },
  { value: 'high',     label: 'High',     dot: 'bg-warning' },
  { value: 'critical', label: 'Critical', dot: 'bg-error' },
]

function toLocalDatetime(iso: string) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function EditTaskModal({ task, isOpen, onClose, onSuccess }: EditTaskModalProps) {
  const { success: toastSuccess, error: toastError } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', skills: '', deadline: '', priority: 'medium' })

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description,
        skills: (task.skills || []).join(', '),
        deadline: toLocalDatetime(task.deadline),
        priority: task.priority,
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return
    setLoading(true)
    try {
      const skillsArray = form.skills ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : []
      await taskService.updateTask(task.id, {
        title: form.title,
        description: form.description,
        skills: skillsArray,
        deadline: new Date(form.deadline).toISOString() as any,
        priority: form.priority as any,
      })
      toastSuccess('Task updated')
      onSuccess()
      onClose()
    } catch (e: any) {
      toastError(e.response?.data?.error || 'Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const skillList = form.skills.split(',').map(s => s.trim()).filter(Boolean)
  const selectedPriority = PRIORITY_OPTIONS.find(p => p.value === form.priority)

  return (
    <Modal open={isOpen} onClose={onClose} size="lg" hideClose>
      <div className="-mx-6 -mt-6 px-6 py-5 border-b border-border bg-gradient-to-r from-warning/5 to-transparent rounded-t-2xl flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-warning/10 flex items-center justify-center">
            <FileText size={18} className="text-warning" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary">Edit Task</h2>
            <p className="text-xs text-text-tertiary truncate max-w-[240px]">{task?.title}</p>
          </div>
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-3 hover:bg-surface-2 border border-border flex items-center justify-center transition-colors">
          <X size={15} className="text-text-secondary" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <FileText size={11} className="text-text-tertiary" /> Title
          </label>
          <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required disabled={loading} />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <FileText size={11} className="text-text-tertiary" /> Description
          </label>
          <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4} required disabled={loading} />
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
            <Tag size={11} className="text-text-tertiary" /> Skills
            <span className="text-text-tertiary font-normal ml-0.5">· comma-separated</span>
          </label>
          <Input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, TypeScript..." disabled={loading} />
          {skillList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {skillList.map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary/8 text-primary text-xs font-medium rounded-lg border border-primary/15">
                  <Tag size={9} />{s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Calendar size={11} className="text-text-tertiary" /> Deadline
            </label>
            <Input type="datetime-local" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required disabled={loading} />
          </div>
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary">
              <Flag size={11} className="text-text-tertiary" /> Priority
            </label>
            <div className="relative">
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value })}
                disabled={loading}
                className="w-full h-10 pl-8 pr-3 text-sm font-medium bg-white border border-border-strong rounded-lg appearance-none cursor-pointer outline-none hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-surface-3 transition-all"
              >
                {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {selectedPriority && <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${selectedPriority.dot}`} />}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2 border-t border-border">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading} className="flex-1">Cancel</Button>
          <Button type="submit" variant="primary" loading={loading} leftIcon={<Save size={15} />} className="flex-1">Save Changes</Button>
        </div>
      </form>
    </Modal>
  )
}
