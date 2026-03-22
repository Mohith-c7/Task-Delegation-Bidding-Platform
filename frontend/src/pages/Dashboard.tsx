import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { taskService, Task } from '../services/taskService'
import Layout from '../components/common/Layout'
import TaskCard from '../components/tasks/TaskCard'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import PlaceBidModal from '../components/bids/PlaceBidModal'
import ViewBidsModal from '../components/bids/ViewBidsModal'
import { Button, SkeletonCard, EmptyState } from '../design-system'
import { Plus, LayoutGrid, List, TrendingUp, CheckCircle2, Clock3, Layers } from 'lucide-react'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('open')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [viewBidsModalOpen, setViewBidsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!user) { navigate('/'); return }
    loadTasks()
  }, [user, navigate, filter])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await taskService.getAllTasks(filter === 'all' ? '' : filter)
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBid = (task: Task) => { setSelectedTask(task); setBidModalOpen(true) }
  const handleViewBids = (task: Task) => { setSelectedTask(task); setViewBidsModalOpen(true) }
  const handleDeleteTask = async (task: Task) => {
    if (!confirm('Delete this task?')) return
    try { await taskService.deleteTask(task.id); loadTasks() }
    catch (e: any) { alert(e.response?.data?.error || 'Failed to delete task') }
  }

  const isTaskOwner = (task: Task) => task.owner_id === user?.id

  const stats = [
    { label: 'Total Tasks', value: tasks.length, icon: Layers, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Open', value: tasks.filter(t => t.status === 'open').length, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'In Progress', value: tasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length, icon: Clock3, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Completed', value: tasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' },
  ]

  return (
    <Layout>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Task Marketplace</h1>
            <p className="text-sm text-text-secondary mt-0.5">Discover and bid on tasks from your team</p>
          </div>
          <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setCreateModalOpen(true)}>
            Create Task
          </Button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
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

        {/* Filter + view toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-xl p-1 overflow-x-auto">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  filter === value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 bg-surface-2 border border-border rounded-xl p-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-text-tertiary hover:text-text-primary'}`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<Layers size={40} />}
          title="No tasks found"
          description={filter === 'open' ? 'Be the first to create a task for your team.' : `No ${filter.replace('_', ' ')} tasks right now.`}
          action={filter === 'open' ? { label: 'Create Task', onClick: () => setCreateModalOpen(true) } : undefined}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              isOwner={isTaskOwner(task)}
              onPlaceBid={handlePlaceBid}
              onViewBids={handleViewBids}
              onDelete={handleDeleteTask}
            />
          ))}
        </div>
      )}

      <CreateTaskModal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} onSuccess={loadTasks} />
      <PlaceBidModal
        isOpen={bidModalOpen} task={selectedTask}
        onClose={() => { setBidModalOpen(false); setSelectedTask(null) }}
        onSuccess={() => { loadTasks() }}
      />
      <ViewBidsModal
        isOpen={viewBidsModalOpen} task={selectedTask}
        onClose={() => { setViewBidsModalOpen(false); setSelectedTask(null) }}
        onBidApproved={loadTasks}
      />
    </Layout>
  )
}
