import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { taskService, Task } from '../services/taskService'
import Layout from '../components/common/Layout'
import TaskCard from '../components/tasks/TaskCard'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import PlaceBidModal from '../components/bids/PlaceBidModal'
import ViewBidsModal from '../components/bids/ViewBidsModal'

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('open')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [bidModalOpen, setBidModalOpen] = useState(false)
  const [viewBidsModalOpen, setViewBidsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    loadTasks()
  }, [user, navigate, filter])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await taskService.getAllTasks(filter)
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBid = (task: Task) => {
    setSelectedTask(task)
    setBidModalOpen(true)
  }

  const handleViewBids = (task: Task) => {
    setSelectedTask(task)
    setViewBidsModalOpen(true)
  }

  const handleDeleteTask = async (task: Task) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await taskService.deleteTask(task.id)
      loadTasks()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete task')
    }
  }

  const isTaskOwner = (task: Task) => task.owner_id === user?.id

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Browse and manage tasks</p>
          </div>
          {(user?.role === 'task_owner' || user?.role === 'manager') && (
            <button
              onClick={() => setCreateModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              + Create Task
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{tasks.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Open Tasks</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {tasks.filter(t => t.status === 'open').length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Your Role</h3>
            <p className="text-xl font-bold text-purple-600 mt-2 capitalize">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Status</h3>
            <p className="text-xl font-bold text-indigo-600 mt-2">Active</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['open', 'assigned', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status.replace('_', ' ').charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {filter.charAt(0).toUpperCase() + filter.slice(1).replace('_', ' ')} Tasks
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No {filter} tasks found.</p>
            {filter === 'open' && (user?.role === 'task_owner' || user?.role === 'manager') && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Create Your First Task
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadTasks}
      />

      <PlaceBidModal
        isOpen={bidModalOpen}
        task={selectedTask}
        onClose={() => {
          setBidModalOpen(false)
          setSelectedTask(null)
        }}
        onSuccess={() => {
          loadTasks()
          alert('Bid placed successfully!')
        }}
      />

      <ViewBidsModal
        isOpen={viewBidsModalOpen}
        task={selectedTask}
        onClose={() => {
          setViewBidsModalOpen(false)
          setSelectedTask(null)
        }}
        onBidApproved={loadTasks}
      />
    </Layout>
  )
}
