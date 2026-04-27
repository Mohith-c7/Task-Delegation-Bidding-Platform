import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { taskService, Task } from '../services/taskService'
import Layout from '../components/common/Layout'
import TaskCard from '../components/tasks/TaskCard'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import PlaceBidModal from '../components/bids/PlaceBidModal'
import ViewBidsModal from '../components/bids/ViewBidsModal'
import { Button, SkeletonCard, EmptyState, ConfirmModal } from '../design-system'
import { useToast } from '../design-system'
import { Plus, LayoutGrid, List, TrendingUp, CheckCircle2, Clock3, Layers, AlertCircle, Search, Filter, X } from 'lucide-react'

const STATUS_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

// Hardcoded seed tasks shown when API returns empty or fails
const SEED_TASKS: Task[] = [
  {
    id: 'seed-1',
    title: 'Build a real-time chat feature for our SaaS dashboard',
    description: 'We need a real-time chat module integrated into our existing React dashboard. Requirements: WebSocket support, message history, online presence indicators, typing indicators, and mobile-responsive UI. Must integrate with our existing auth system.',
    skills: ['React', 'TypeScript', 'WebSockets', 'Node.js'],
    questions: [],
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    priority: 'high',
    status: 'open',
    owner_id: '00000000-0000-0000-0000-000000000001',
    owner_name: 'Seed User',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-2',
    title: 'Migrate PostgreSQL database to multi-tenant architecture',
    description: 'Our single-tenant Postgres DB needs to be migrated to a multi-tenant schema using row-level security (RLS). Must maintain zero downtime, write migration scripts, update all queries, and document the new schema thoroughly.',
    skills: ['PostgreSQL', 'Go', 'Database Design', 'RLS'],
    questions: [],
    deadline: new Date(Date.now() + 21 * 86400000).toISOString(),
    priority: 'critical',
    status: 'open',
    owner_id: '00000000-0000-0000-0000-000000000002',
    owner_name: 'Seed User',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-3',
    title: 'Design and implement a mobile-first onboarding flow',
    description: 'Create a beautiful 5-step onboarding wizard for new users. Steps: account setup, team invite, first task creation, notification preferences, and completion celebration. Must work on iOS and Android via React Native.',
    skills: ['React Native', 'UI/UX', 'Figma', 'TypeScript'],
    questions: [],
    deadline: new Date(Date.now() + 10 * 86400000).toISOString(),
    priority: 'medium',
    status: 'open',
    owner_id: '00000000-0000-0000-0000-000000000003',
    owner_name: 'Seed User',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-4',
    title: 'Set up CI/CD pipeline with GitHub Actions and Kubernetes',
    description: 'Implement a full CI/CD pipeline: automated testing on PR, Docker image build and push to ECR, blue-green deployment to EKS, Slack notifications on deploy, and rollback capability. Include staging and production environments.',
    skills: ['DevOps', 'Kubernetes', 'GitHub Actions', 'Docker', 'AWS'],
    questions: [],
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    priority: 'high',
    status: 'open',
    owner_id: '00000000-0000-0000-0000-000000000004',
    owner_name: 'Seed User',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-5',
    title: 'Implement Stripe payment integration with escrow',
    description: 'Integrate Stripe Connect for marketplace payments. Features: task budget setting, escrow on bid approval, automatic release on completion, dispute handling, payout to workers, and invoice generation. Must be PCI compliant.',
    skills: ['Node.js', 'Stripe', 'TypeScript', 'PostgreSQL'],
    questions: [],
    deadline: new Date(Date.now() + 18 * 86400000).toISOString(),
    priority: 'critical',
    status: 'open',
    owner_id: '00000000-0000-0000-0000-000000000005',
    owner_name: 'Seed User',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-6',
    title: 'Security audit and penetration testing',
    description: 'Conduct a comprehensive security audit: SQL injection testing, XSS vulnerability scan, CSRF protection review, JWT security analysis, rate limiting verification, and dependency vulnerability scan. Provide detailed report with fixes.',
    skills: ['Security', 'Penetration Testing', 'Go', 'PostgreSQL'],
    questions: [],
    deadline: new Date(Date.now() + 11 * 86400000).toISOString(),
    priority: 'critical',
    status: 'open',
    owner_id: '00000000-0000-0000-0000-000000000006',
    owner_name: 'Seed User',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-7',
    title: 'Build ML model for task priority prediction',
    description: 'Train a machine learning model that predicts the optimal priority level for new tasks based on title, description, historical data, and team workload. Expose as a REST API endpoint. Use Python with scikit-learn or PyTorch.',
    skills: ['Python', 'Machine Learning', 'scikit-learn', 'REST API'],
    questions: [],
    deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
    priority: 'medium',
    status: 'open',
    owner_id: '00000000-0000-0000-0000-000000000007',
    owner_name: 'Seed User',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-8',
    title: 'Fix authentication bug causing session expiry on mobile',
    description: 'Users on mobile devices are being logged out after 15 minutes despite selecting "remember me". Root cause appears to be in the JWT refresh token flow. Needs investigation and fix across iOS, Android, and mobile web.',
    skills: ['React Native', 'JWT', 'Node.js', 'Debugging'],
    questions: [],
    deadline: new Date(Date.now() + 3 * 86400000).toISOString(),
    priority: 'critical',
    status: 'in_progress',
    owner_id: '00000000-0000-0000-0000-000000000001',
    owner_name: 'Seed User',
    assigned_to: '00000000-0000-0000-0000-000000000003',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'seed-9',
    title: 'Implement dark mode with system preference detection',
    description: 'Add full dark mode support to the React frontend. Must respect system preference, allow manual toggle, persist preference, and ensure all components look great in both modes. Use CSS custom properties.',
    skills: ['React', 'CSS', 'TypeScript', 'UI/UX'],
    questions: [],
    deadline: new Date(Date.now() + 6 * 86400000).toISOString(),
    priority: 'low',
    status: 'open',
    owner_id: '00000000-0000-0000-0000-000000000008',
    owner_name: 'Seed User',
    assigned_to: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [viewBidsModalOpen, setViewBidsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { error: toastError } = useToast()

  // Advanced search state
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('')
  const [timeframeFilter, setTimeframeFilter] = useState('') // 'today', 'week', 'month'

  useEffect(() => {
    if (!user) { navigate('/'); return }
    const delayDebounce = setTimeout(() => {
      loadTasks()
    }, 300)
    return () => clearTimeout(delayDebounce)
  }, [user, navigate, filter, searchQuery, priorityFilter, timeframeFilter])

  const loadTasks = async () => {
    try {
      setLoading(true)
      setApiError(null)

      let deadline_from, deadline_to
      if (timeframeFilter === 'today') {
        deadline_from = new Date().toISOString()
        deadline_to = new Date(Date.now() + 86400000).toISOString()
      } else if (timeframeFilter === 'week') {
        deadline_from = new Date().toISOString()
        deadline_to = new Date(Date.now() + 7 * 86400000).toISOString()
      } else if (timeframeFilter === 'month') {
        deadline_from = new Date().toISOString()
        deadline_to = new Date(Date.now() + 30 * 86400000).toISOString()
      }

      const data = await taskService.getAllTasks({ 
        status: filter === 'all' ? undefined : filter,
        q: searchQuery || undefined,
        priority: priorityFilter || undefined,
        deadline_from,
        deadline_to
      })
      // Merge API tasks with seed tasks (API tasks take precedence, seeds fill the rest)
      if (data && data.tasks && data.tasks.length > 0) {
        setTasks(data.tasks)
      } else {
        // API returned empty — show seed tasks filtered by status
        const filtered = filter === 'all'
          ? SEED_TASKS
          : SEED_TASKS.filter(t => t.status === filter)
        setTasks(filtered)
      }
    } catch (error: any) {
      console.error('Failed to load tasks:', error)
      const msg = error?.response?.data?.error || error?.message || 'Failed to load tasks'
      setApiError(msg)
      // Still show seed data so the dashboard doesn't look empty
      const filtered = filter === 'all'
        ? SEED_TASKS
        : SEED_TASKS.filter(t => t.status === filter)
      setTasks(filtered)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBid = (task: Task) => {
    if (task.id.startsWith('seed-')) { toastError('This is a demo task — create a real task to bid on it'); return }
    setSelectedTask(task); setBidModalOpen(true)
  }
  const handleViewBids = (task: Task) => {
    if (task.id.startsWith('seed-')) { toastError('This is a demo task — create a real task to view bids'); return }
    setSelectedTask(task); setViewBidsModalOpen(true)
  }
  const handleDeleteTask = async (task: Task) => {
    if (task.id.startsWith('seed-')) { toastError('Demo tasks cannot be deleted'); return }
    setDeleteTask(task)
  }
  const confirmDelete = async () => {
    if (!deleteTask) return
    setDeleteLoading(true)
    try { await taskService.deleteTask(deleteTask.id); loadTasks(); setDeleteTask(null) }
    catch (e: any) { toastError(e.response?.data?.error || 'Failed to delete task') }
    finally { setDeleteLoading(false) }
  }

  const isTaskOwner = (task: Task) => task.owner_id === user?.id

  const safeTasks = Array.isArray(tasks) ? tasks : []

  const stats = [
    { label: 'Total Tasks', value: safeTasks.length, icon: Layers, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Open', value: safeTasks.filter(t => t.status === 'open').length, icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'In Progress', value: safeTasks.filter(t => t.status === 'assigned' || t.status === 'in_progress').length, icon: Clock3, color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Completed', value: safeTasks.filter(t => t.status === 'completed').length, icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' },
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

        {/* API error banner */}
        {apiError && (
          <div className="flex items-center gap-2 mb-4 px-4 py-3 bg-error/8 border border-error/20 rounded-xl text-sm text-error">
            <AlertCircle size={15} className="shrink-0" />
            <span><strong>API issue:</strong> {apiError} — showing demo tasks below.</span>
          </div>
        )}

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

        {/* Filter + view toggle + search bar */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-surface-2 border border-border rounded-xl p-1 overflow-x-auto w-full sm:w-auto">
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
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..." 
                  className="w-full pl-9 pr-4 py-2 bg-surface-2 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 border rounded-xl transition-all ${showFilters ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-surface-2 border-border text-text-secondary hover:text-text-primary'}`}
              >
                <Filter className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 bg-surface-2 border border-border rounded-xl p-1 shrink-0 hidden sm:flex">
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

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="p-4 bg-surface-2 border border-border rounded-xl animate-in slide-in-from-top-2 flex flex-wrap gap-4 items-end">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Priority</label>
                <select 
                  value={priorityFilter} 
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full sm:w-40 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="">All Priorities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-secondary">Timeframe</label>
                <select 
                  value={timeframeFilter} 
                  onChange={(e) => setTimeframeFilter(e.target.value)}
                  className="w-full sm:w-40 bg-surface border border-border rounded-lg px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-primary"
                >
                  <option value="">Any Time</option>
                  <option value="today">Due Today</option>
                  <option value="week">Due This Week</option>
                  <option value="month">Due This Month</option>
                </select>
              </div>
              <button 
                onClick={() => { setPriorityFilter(''); setTimeframeFilter(''); setSearchQuery('') }}
                className="text-xs font-medium text-text-tertiary hover:text-text-primary underline px-2 py-2"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : safeTasks.length === 0 ? (
        <EmptyState
          icon={<Layers size={40} />}
          title="No tasks found"
          description={filter === 'open' ? 'Be the first to create a task for your team.' : `No ${filter.replace('_', ' ')} tasks right now.`}
          action={filter === 'open' ? { label: 'Create Task', onClick: () => setCreateModalOpen(true) } : undefined}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5' : 'space-y-3'}>
          {safeTasks.map((task) => (
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
      <ConfirmModal
        open={!!deleteTask}
        onClose={() => setDeleteTask(null)}
        onConfirm={confirmDelete}
        title="Delete task?"
        description={`"${deleteTask?.title}" will be permanently deleted. This cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        loading={deleteLoading}
      />
    </Layout>
  )
}
