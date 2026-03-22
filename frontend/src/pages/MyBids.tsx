import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { bidService, Bid } from '../services/bidService'
import Layout from '../components/common/Layout'
import { Button, EmptyState } from '../design-system'
import { Gavel, Clock, CheckCircle2, XCircle, Calendar, ArrowRight, Trophy } from 'lucide-react'

const STATUS_META = {
  pending:  { label: 'Pending',  color: 'text-warning',   bg: 'bg-warning/10',   border: 'border-warning/20',   dot: 'bg-warning',   icon: Clock },
  approved: { label: 'Approved', color: 'text-success',   bg: 'bg-success/10',   border: 'border-success/20',   dot: 'bg-success',   icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-error',     bg: 'bg-error/10',     border: 'border-error/20',     dot: 'bg-error',     icon: XCircle },
} as const

export default function MyBids() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')

  useEffect(() => {
    if (!user) { navigate('/'); return }
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

  const counts = {
    all: bids.length,
    pending: bids.filter(b => b.status === 'pending').length,
    approved: bids.filter(b => b.status === 'approved').length,
    rejected: bids.filter(b => b.status === 'rejected').length,
  }

  const filtered = activeTab === 'all' ? bids : bids.filter(b => b.status === activeTab)

  const stats = [
    { label: 'Total Bids', value: counts.all, color: 'text-primary', bg: 'bg-primary/10', icon: Gavel },
    { label: 'Pending', value: counts.pending, color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
    { label: 'Approved', value: counts.approved, color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
    { label: 'Rejected', value: counts.rejected, color: 'text-error', bg: 'bg-error/10', icon: XCircle },
  ]

  const successRate = counts.all > 0 ? Math.round((counts.approved / counts.all) * 100) : 0

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Bids</h1>
            <p className="text-sm text-text-secondary mt-0.5">Track your bid submissions and outcomes</p>
          </div>
          {counts.approved > 0 && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-4 py-2">
              <Trophy size={16} className="text-success" />
              <span className="text-sm font-semibold text-success">{successRate}% success rate</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, value, color, bg, icon: Icon }) => (
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

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-surface-2 border border-border rounded-xl p-1 w-fit">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-150 ${
                activeTab === tab ? 'bg-primary text-white shadow-sm' : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
              }`}
            >
              {tab} {counts[tab] > 0 && <span className="ml-1 opacity-70">({counts[tab]})</span>}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-surface-2 rounded-2xl border border-border animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Gavel size={40} />}
          title={activeTab === 'all' ? "No bids yet" : `No ${activeTab} bids`}
          description={activeTab === 'all' ? "Browse the task marketplace and place your first bid." : `You don't have any ${activeTab} bids.`}
          action={activeTab === 'all' ? { label: 'Browse Tasks', onClick: () => navigate('/dashboard') } : undefined}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((bid) => {
            const meta = STATUS_META[bid.status as keyof typeof STATUS_META] ?? STATUS_META.pending
            const StatusIcon = meta.icon
            return (
              <div
                key={bid.id}
                className={`bg-surface-2 border ${meta.border} rounded-2xl p-5 hover:shadow-md transition-all duration-200 group`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${meta.dot} shrink-0`} />
                      <p className="text-xs text-text-tertiary font-mono">Task #{bid.task_id.slice(0, 8)}</p>
                    </div>
                    <p className="text-sm font-medium text-text-primary line-clamp-2 mb-3">{bid.message}</p>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        Est. {new Date(bid.estimated_completion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        Submitted {new Date(bid.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${meta.bg} shrink-0`}>
                    <StatusIcon size={13} className={meta.color} />
                    <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                  </div>
                </div>

                {bid.status === 'approved' && (
                  <div className="mt-4 pt-4 border-t border-success/20 flex items-center justify-between">
                    <p className="text-xs text-success font-medium">Your bid was selected. You can start working on this task.</p>
                    <Button variant="success" size="sm" rightIcon={<ArrowRight size={13} />} onClick={() => navigate('/dashboard')}>
                      View Task
                    </Button>
                  </div>
                )}
                {bid.status === 'rejected' && (
                  <div className="mt-4 pt-4 border-t border-error/20">
                    <p className="text-xs text-text-tertiary">This bid wasn't selected. Keep bidding on other tasks.</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </Layout>
  )
}
