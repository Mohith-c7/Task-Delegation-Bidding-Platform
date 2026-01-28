import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { bidService, Bid } from '../services/bidService'
import Layout from '../components/common/Layout'

export default function MyBids() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/')
      return
    }
    loadBids()
  }, [user, navigate])

  const loadBids = async () => {
    try {
      setLoading(true)
      const data = await bidService.getMyBids()
      setBids(data)
    } catch (error) {
      console.error('Failed to load bids:', error)
    } finally {
      setLoading(false)
    }
  }

  const bidsByStatus = {
    pending: bids.filter(b => b.status === 'pending'),
    approved: bids.filter(b => b.status === 'approved'),
    rejected: bids.filter(b => b.status === 'rejected'),
  }

  return (
    <Layout>
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600 mt-1">Track your bid submissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Total Bids</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">{bids.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{bidsByStatus.pending.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Approved</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">{bidsByStatus.approved.length}</p>
          </div>
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-500 text-sm font-medium">Rejected</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">{bidsByStatus.rejected.length}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4">Loading your bids...</p>
        </div>
      ) : bids.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">You haven't placed any bids yet.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Browse Tasks
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(bidsByStatus).map(([status, statusBids]) => (
            statusBids.length > 0 && (
              <div key={status}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 capitalize">
                  {status} ({statusBids.length})
                </h2>
                <div className="space-y-4">
                  {statusBids.map((bid) => (
                    <div key={bid.id} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">Task ID: {bid.task_id.slice(0, 8)}...</h3>
                          <p className="text-gray-700 mb-2">{bid.message}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ml-4 ${
                          bid.status === 'approved' ? 'bg-green-100 text-green-700' :
                          bid.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {bid.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Estimated Completion:</span>
                          <p>{new Date(bid.estimated_completion).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Submitted:</span>
                          <p>{new Date(bid.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {bid.status === 'approved' && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                          🎉 Congratulations! Your bid has been approved. You can now start working on this task.
                        </div>
                      )}

                      {bid.status === 'rejected' && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                          Your bid was not selected for this task. Keep trying!
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </Layout>
  )
}
