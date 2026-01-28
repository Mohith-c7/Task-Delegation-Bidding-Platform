import { useEffect, useState } from 'react'
import { Task } from '../../services/taskService'
import { bidService, BidWithDetails } from '../../services/bidService'
import { useAuthStore } from '../../store/authStore'

interface ViewBidsModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onBidApproved: () => void
}

export default function ViewBidsModal({ isOpen, task, onClose, onBidApproved }: ViewBidsModalProps) {
  const { user } = useAuthStore()
  const [bids, setBids] = useState<BidWithDetails[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && task) {
      loadBids()
    }
  }, [isOpen, task])

  const loadBids = async () => {
    if (!task) return
    
    try {
      setLoading(true)
      const data = await bidService.getTaskBids(task.id)
      setBids(data)
    } catch (error) {
      console.error('Failed to load bids:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to approve this bid?')) return

    try {
      await bidService.approveBid(bidId)
      onBidApproved()
      onClose()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to approve bid')
    }
  }

  const handleRejectBid = async (bidId: string) => {
    if (!confirm('Are you sure you want to reject this bid?')) return

    try {
      await bidService.rejectBid(bidId)
      loadBids()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to reject bid')
    }
  }

  const isTaskOwner = task && user && task.owner_id === user.id

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Bids for Task</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">{task.title}</h3>
            <p className="text-sm text-gray-600">{task.description}</p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-500 mt-2">Loading bids...</p>
            </div>
          ) : bids.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No bids yet for this task.
            </div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div key={bid.id} className="border border-gray-200 rounded-lg p-4 bg-white">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{bid.bidder_name}</h4>
                      <p className="text-sm text-gray-500">{bid.bidder_email}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      bid.status === 'approved' ? 'bg-green-100 text-green-700' :
                      bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {bid.status}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{bid.message}</p>

                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>
                      Estimated completion: {new Date(bid.estimated_completion).toLocaleDateString()}
                    </span>
                    <span>
                      Submitted: {new Date(bid.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {isTaskOwner && bid.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleApproveBid(bid.id)}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectBid(bid.id)}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
