import { useEffect, useState } from 'react'
import { Task } from '../../services/taskService'
import { bidService, BidWithDetails } from '../../services/bidService'
import { useAuthStore } from '../../store/authStore'
import { Button, Avatar, StatusBadge, Modal } from '../../design-system'
import { Eye, CheckCircle2, XCircle, Clock, Calendar, Users, X } from 'lucide-react'
import { cn } from '../../design-system/utils'

interface ViewBidsModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
  onBidApproved: () => void
}

const BID_STATUS = {
  pending:  { label: 'Pending',  color: 'text-warning',  bg: 'bg-warning/10  border-warning/20',  icon: Clock },
  approved: { label: 'Approved', color: 'text-success',  bg: 'bg-success/10  border-success/20',  icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'text-error',    bg: 'bg-error/10    border-error/20',    icon: XCircle },
} as const

export default function ViewBidsModal({ isOpen, task, onClose, onBidApproved }: ViewBidsModalProps) {
  const { user } = useAuthStore()
  const [bids, setBids] = useState<BidWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'approve' | 'reject'; bidId: string } | null>(null)

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
    setActionLoading(bidId)
    setConfirmAction(null)
    try { await bidService.approveBid(bidId); onBidApproved(); onClose() }
    catch (e: any) { console.error(e) }
    finally { setActionLoading(null) }
  }

  const handleReject = async (bidId: string) => {
    setActionLoading(bidId)
    setConfirmAction(null)
    try { await bidService.rejectBid(bidId); loadBids() }
    catch (e: any) { console.error(e) }
    finally { setActionLoading(null) }
  }

  const isOwner = task && user && task.owner_id === user.id
  if (!task) return null

  const pendingCount = bids.filter(b => b.status === 'pending').length

  return (
    <>
      <Modal open={isOpen} onClose={onClose} size="xl" hideClose>
        {/* Header */}
        <div className="-mx-6 -mt-6 px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-transparent rounded-t-2xl flex items-center justify-between mb-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Eye size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Bids</h2>
              <p className="text-xs text-text-tertiary line-clamp-1 max-w-[260px]">{task.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {bids.length > 0 && (
              <div className="flex items-center gap-1.5 bg-surface-3 border border-border rounded-xl px-3 py-1.5">
                <Users size={12} className="text-text-tertiary" />
                <span className="text-xs font-semibold text-text-secondary">
                  {bids.length} bid{bids.length !== 1 ? 's' : ''}
                  {pendingCount > 0 && <span className="text-warning ml-1">· {pendingCount} pending</span>}
                </span>
              </div>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-surface-3 hover:bg-surface-2 border border-border flex items-center justify-center transition-colors"
            >
              <X size={15} className="text-text-secondary" />
            </button>
          </div>
        </div>

        {/* Task meta strip */}
        <div className="-mx-6 px-6 py-2.5 bg-surface-2 border-b border-border flex items-center gap-3 mb-5">
          <StatusBadge status={task.status} size="sm" />
          <span className="text-xs text-text-tertiary">·</span>
          <span className="text-xs text-text-tertiary">
            Due {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
        </div>

        {/* Bids list */}
        <div className="max-h-[420px] overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="space-y-3 py-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-28 bg-surface-3 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : bids.length === 0 ? (
            <div className="text-center py-14">
              <div className="w-14 h-14 rounded-2xl bg-surface-3 border border-border flex items-center justify-center mx-auto mb-3">
                <Users size={22} className="text-text-tertiary" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">No bids yet</p>
              <p className="text-xs text-text-tertiary mt-1">Share this task to attract bidders</p>
            </div>
          ) : (
            <div className="space-y-3 py-1">
              {bids.map((bid) => {
                const meta = BID_STATUS[bid.status as keyof typeof BID_STATUS] ?? BID_STATUS.pending
                const StatusIcon = meta.icon
                const isRejected = bid.status === 'rejected'
                const isApproved = bid.status === 'approved'

                return (
                  <div
                    key={bid.id}
                    className={cn(
                      'border rounded-2xl p-4 transition-all',
                      isApproved && 'bg-success/3 border-success/25',
                      isRejected && 'bg-surface-2 border-border opacity-55',
                      !isApproved && !isRejected && 'bg-white border-border hover:border-primary/30 hover:shadow-1',
                    )}
                  >
                    {/* Bidder row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={bid.bidder_name} size="sm" />
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{bid.bidder_name}</p>
                          <p className="text-xs text-text-tertiary">{bid.bidder_email}</p>
                        </div>
                      </div>
                      <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-semibold shrink-0', meta.bg, meta.color)}>
                        <StatusIcon size={11} />
                        {meta.label}
                      </span>
                    </div>

                    {/* Message */}
                    <p className="text-sm text-text-secondary leading-relaxed mb-3">{bid.message}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        Est. {new Date(bid.estimated_completion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={10} />
                        Submitted {new Date(bid.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Actions */}
                    {isOwner && bid.status === 'pending' && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-border">
                        <Button
                          variant="success" size="sm"
                          onClick={() => setConfirmAction({ type: 'approve', bidId: bid.id })}
                          loading={actionLoading === bid.id}
                          leftIcon={<CheckCircle2 size={13} />}
                          className="flex-1"
                        >
                          Approve
                        </Button>
                        <Button
                          variant="ghost" size="sm"
                          onClick={() => setConfirmAction({ type: 'reject', bidId: bid.id })}
                          loading={actionLoading === bid.id}
                          leftIcon={<XCircle size={13} />}
                          className="flex-1 text-error hover:bg-error/8 hover:text-error border border-transparent hover:border-error/20"
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

        {/* Footer close */}
        <div className="pt-4 mt-2 border-t border-border -mx-6 px-6">
          <Button variant="ghost" onClick={onClose} className="w-full">Close</Button>
        </div>
      </Modal>

      {/* Inline confirm overlay */}
      {confirmAction && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setConfirmAction(null)} />
          <div className="relative bg-white rounded-2xl shadow-4 p-6 w-full max-w-sm animate-scale-in">
            <div className={cn(
              'w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4',
              confirmAction.type === 'approve' ? 'bg-success/10' : 'bg-error/10'
            )}>
              {confirmAction.type === 'approve'
                ? <CheckCircle2 size={22} className="text-success" />
                : <XCircle size={22} className="text-error" />
              }
            </div>
            <h3 className="text-base font-bold text-text-primary text-center mb-1">
              {confirmAction.type === 'approve' ? 'Approve this bid?' : 'Reject this bid?'}
            </h3>
            <p className="text-sm text-text-secondary text-center mb-6">
              {confirmAction.type === 'approve'
                ? 'All other pending bids will be automatically rejected.'
                : 'The bidder will be notified that their bid was rejected.'
              }
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setConfirmAction(null)} className="flex-1">Cancel</Button>
              <Button
                variant={confirmAction.type === 'approve' ? 'success' : 'danger'}
                onClick={() => confirmAction.type === 'approve'
                  ? handleApprove(confirmAction.bidId)
                  : handleReject(confirmAction.bidId)
                }
                className="flex-1"
              >
                {confirmAction.type === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
