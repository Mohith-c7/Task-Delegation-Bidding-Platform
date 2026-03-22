import { useEffect, useState } from 'react'
import { Task } from '../../services/taskService'
import { bidService, BidWithDetails } from '../../services/bidService'
import { useAuthStore } from '../../store/authStore'
import { Button, Avatar, StatusBadge } from '../../design-system'
import { X, Eye, CheckCircle2, XCircle, Clock, Calendar, Users } from 'lucide-react'

interface ViewBidsModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onBidApproved: () => void
}

const BID_STATUS = {
  pending:  { label: 'Pending',  color: 'text-warning', bg: 'bg-warning/10', icon: Clock },
  approved: { label: 'Approved', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-error',   bg: 'bg-error/10',   icon: XCircle },
} as const

export default function ViewBidsModal({ isOpen, task, onClose, onBidApproved }: ViewBidsModalProps) {
  const { user } = useAuthStore()
  const [bids, setBids] = useState<BidWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && task) loadBids()
  }, [isOpen, task])

  const loadBids = async () => {
    if (!task) return
    try {
      setLoading(true)
      setBids(await bidService.getTaskBids(task.id))
    } catch (e) {
      console.error('Failed to load bids:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (bidId: string) => {
    if (!confirm('Approve this bid? Other pending bids will be rejected.')) return
    setActionLoading(bidId)
    try { await bidService.approveBid(bidId); onBidApproved(); onClose() }
    catch (e: any) { alert(e.response?.data?.error || 'Failed to approve bid') }
    finally { setActionLoading(null) }
  }

  const handleReject = async (bidId: string) => {
    if (!confirm('Reject this bid?')) return
    setActionLoading(bidId)
    try { await bidService.rejectBid(bidId); loadBids() }
    catch (e: any) { alert(e.response?.data?.error || 'Failed to reject bid') }
    finally { setActionLoading(null) }
  }

  const isOwner = task && user && task.owner_id === user.id

  if (!isOpen || !task) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-1 w-full sm:max-w-2xl sm:rounded-3xl rounded-t-3xl shadow-2xl max-h-[92vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-surface-1 border-b border-border px-6 py-4 flex items-center justify-between rounded-t-3xl z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Eye size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Bids</h2>
              <p className="text-xs text-text-tertiary line-clamp-1 max-w-xs">{task.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface-3 rounded-xl px-3 py-1.5">
              <Users size={12} className="text-text-tertiary" />
              <span className="text-xs font-semibold text-text-secondary">{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-xl bg-surface-3 hover:bg-surface-4 flex items-center justify-center transition-colors">
              <X size={15} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Task summary */}
        <div className="px-6 py-3 bg-surface-2 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <StatusBadge status={task.status} size="sm" />
            <span className="text-xs text-text-tertiary">·</span>
            <span className="text-xs text-text-tertiary">
              Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>

        {/* Bids list */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-surface-3 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : bids.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-3">
                <Users size={20} className="text-text-tertiary" />
              </div>
              <p className="text-sm font-medium text-text-secondary">No bids yet</p>
              <p className="text-xs text-text-tertiary mt-1">Share this task to attract bidders</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bids.map((bid) => {
                const meta = BID_STATUS[bid.status as keyof typeof BID_STATUS] ?? BID_STATUS.pending
                const StatusIcon = meta.icon
                return (
                  <div
                    key={bid.id}
                    className={`bg-surface-2 border rounded-2xl p-4 transition-all ${
                      bid.status === 'approved' ? 'border-success/30' :
                      bid.status === 'rejected' ? 'border-error/20 opacity-60' : 'border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={bid.bidder_name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{bid.bidder_name}</p>
                          <p className="text-xs text-text-tertiary">{bid.bidder_email}</p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl ${meta.bg} shrink-0`}>
                        <StatusIcon size={11} className={meta.color} />
                        <span className={`text-xs font-semibold ${meta.color}`}>{meta.label}</span>
                      </div>
                    </div>

                    <p className="text-sm text-text-secondary mb-3 leading-relaxed">{bid.message}</p>

                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        Est. {new Date(bid.estimated_completion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(bid.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {isOwner && bid.status === 'pending' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                        <Button
                          variant="success" size="sm"
                          onClick={() => handleApprove(bid.id)}
                          loading={actionLoading === bid.id}
                          leftIcon={<CheckCircle2 size={13} />}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => handleReject(bid.id)}
                          loading={actionLoading === bid.id}
                          leftIcon={<XCircle size={13} />}
                          className="flex-1 text-error hover:bg-error/10 hover:text-error"
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
