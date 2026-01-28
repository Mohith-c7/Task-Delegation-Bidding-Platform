import { useState } from 'react'
import { Task } from '../../services/taskService'
import { bidService } from '../../services/bidService'

interface PlaceBidModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onSuccess: () => void
}

export default function PlaceBidModal({ isOpen, task, onClose, onSuccess }: PlaceBidModalProps) {
  const [formData, setFormData] = useState({
    message: '',
    estimated_completion: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!task) return

    setError('')
    setLoading(true)

    try {
      // Convert datetime-local format to ISO 8601 with timezone
      const completionISO = new Date(formData.estimated_completion).toISOString()
      
      await bidService.placeBid(task.id, {
        message: formData.message,
        estimated_completion: completionISO,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Place Bid</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Proposal *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Explain why you're the best fit for this task..."
                rows={5}
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Completion Date *
              </label>
              <input
                type="datetime-local"
                value={formData.estimated_completion}
                onChange={(e) => setFormData({ ...formData, estimated_completion: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Bid'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
