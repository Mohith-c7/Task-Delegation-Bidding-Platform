import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { taskService, Task } from '../services/taskService'
import Layout from '../components/common/Layout'
import TaskCard from '../components/tasks/TaskCard'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import EditTaskModal from '../components/tasks/EditTaskModal'
import ViewBidsModal from '../components/bids/ViewBidsModal'
import { Button, SkeletonCard, EmptyState, ConfirmModal } from '../design-system'
import { useToast } from '../design-system'
import { Plus, ClipboardList, CheckCircle2, Clock3, Circle } from 'lucide-react'

const STATUS_SECTIONS = [
  { key: 'open',        label: 'Open',        color: 'text-success',  dot: 'bg-success' },
  { key: 'assigned',    label: 'Assigned',    color: 'text-warning',  dot: 'bg-warning' },
  { key: 'in_progress', label: 'In Progress', color: 'text-primary',  dot: 'bg-primary' },
  { key: 'completed',   label: 'Completed',   color: 'text-secondary', dot: 'bg-secondary' },
] as const

export default function MyTasks() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewBidsModalOpen, setViewBidsModalOpen] = useState(false)
  const [editTask, setEditTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { error: toastError } = useToast()

  useEffect(() => {
    if (!user) { navigate('/'); return }
    loadTasks()
  }, [user, navigate])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await taskService.getMyTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewBids = (task: Task) => { setSelectedTask(task); setViewBidsModalOpen(true) }
  const handleDeleteTask = (task: Task) => { setDeleteTask(task) }
  const confirmDelete = async () => {
    if (!deleteTask) return
    setDeleteLoading(true)
    try { await taskService.deleteTask(deleteTask.id); loadTasks(); setDeleteTask(null) }
    catch (e: any) { toastError(e.response?.data?.error || 'Failed to delete task') }
    finally { setDeleteLoading(false) }
  }

  const grouped = STATUS_SECTIONS.reduce((acc, s) => {
    acc[s.key] = tasks.filter(t => t.status === s.key)
    return acc
  }, {} as Record<string, Task[]>)

  const stats = [
    { label: 'Total', value: tasks.length, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Open', value: grouped.open?.length ?? 0, icon: Circle, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Active', value: (grouped.assigned?.length ?? 0) + (grouped.in_progress?.length ?? 0), icon: Clock3, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Done', value: grouped.completed?.length ?? 0, icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' },
  ]

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Tasks</h1>
            <p className="text-sm text-text-secondary mt-0.5">Tasks you've posted for your team</p>
          </div>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
            Create Task
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-surface-2 rounded-2xl p-4 border border-border flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className="text-xs text-text-tertiary font-medium">{label}</p>
                <p className={`text-xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={40} />}
          title="No tasks yet"
          description="Create your first task and let your team bid on it."
          action={{ label: 'Create Task', onClick: () => setCreateModalOpen(true) }}
        />
      ) : (
        <div className="space-y-10">
          {STATUS_SECTIONS.map(({ key, label, color, dot }) => {
            const sectionTasks = grouped[key] ?? []
            if (sectionTasks.length === 0) return null
            return (
              <div key={key}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-2 h-2 rounded-full ${dot}`} />
                  <h2 className={`text-sm font-bold uppercase tracking-wider ${color}`}>{label}</h2>
                  <span className="text-xs text-text-tertiary bg-surface-3 px-2 py-0.5 rounded-full">{sectionTasks.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {sectionTasks.map((task) => (
                    <TaskCard key={task.id} task={task} isOwner onViewBids={handleViewBids} onEdit={t => setEditTask(t)} onDelete={handleDeleteTask} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <CreateTaskModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={loadTasks} />
      <EditTaskModal task={editTask} isOpen={!!editTask} onClose={() => setEditTask(null)} onSuccess={loadTasks} />
      <ViewBidsModal
        isOpen={viewBidsModalOpen} task={selectedTask}
        onClose={() => { setViewBidsModalOpen(false); setSelectedTask(null) }}
        onBidApproved={loadTasks}
      />
      <ConfirmModal
        open={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={confirmDelete}
        title="Delete task?"
        description={`"${deleteTask?.title}" will be permanently deleted.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleteLoading}
      />
    </Layout>
  )
}
