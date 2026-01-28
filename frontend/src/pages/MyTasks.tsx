import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { taskService, Task } from '../services/taskService'
import Layout from '../components/common/Layout'
import TaskCard from '../components/tasks/TaskCard'
import CreateTaskModal from '../components/tasks/CreateTaskModal'
import ViewBidsModal from '../components/bids/ViewBidsModal'

export default function MyTasks() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [viewBidsModalOpen, setViewBidsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
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

  const tasksByStatus = {
    open: tasks.filter(t => t.status === 'open'),
    assigned: tasks.filter(t => t.status === 'assigned'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
            <p className="text-gray-600 mt-1">Tasks you've created</p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
          >
            + Create Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{tasks.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Open</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{tasksByStatus.open.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">In Progress</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {tasksByStatus.assigned.length + tasksByStatus.in_progress.length}
            </p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Completed</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">{tasksByStatus.completed.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading your tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">You haven't created any tasks yet.</p>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Create Your First Task
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            statusTasks.length > 0 && (
              <div key={status}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
                  {status.replace('_', ' ')} ({statusTasks.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {statusTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      isOwner={true}
                      onViewBids={handleViewBids}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}

      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadTasks}
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
