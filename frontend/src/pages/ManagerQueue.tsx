import { useQuery } from '@tanstack/react-query'
import { Calendar, CheckCircle2, ClipboardList, Clock, Gavel, AlertTriangle } from 'lucide-react'
import Layout from '../components/common/Layout'
import { Badge, Button, Card, Skeleton } from '../design-system'
import { operationsService } from '../services/operationsService'
import { bidService } from '../services/bidService'
import { useNavigate } from 'react-router-dom'

type QueueTask = {
  task_id: string
  title: string
  priority: string
  status: string
  deadline: string
  owner_name: string
  bid_count: number
}

type QueueBid = {
  bid_id: string
  task_id: string
  task_title: string
  bidder_name: string
  estimated_completion: string
}

export default function ManagerQueue() {
  const navigate = useNavigate()
  const queue = useQuery({ queryKey: ['manager-queue'], queryFn: operationsService.getManagerQueue })
  const workload = useQuery({ queryKey: ['workload-summary'], queryFn: operationsService.getWorkloadSummary })

  const refresh = () => {
    queue.refetch()
    workload.refetch()
  }

  const section = (title: string, icon: React.ReactNode, items: QueueTask[]) => (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h2 className="text-sm font-bold text-text-primary">{title}</h2>
        <Badge variant="default" size="sm">{items?.length || 0}</Badge>
      </div>
      <div className="space-y-2">
        {items?.length ? items.map(item => (
          <button key={item.task_id} onClick={() => navigate(`/tasks/${item.task_id}`)} className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/40 bg-white transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-primary line-clamp-1">{item.title}</p>
                <p className="text-xs text-text-tertiary mt-1">{item.owner_name} · {new Date(item.deadline).toLocaleDateString()}</p>
              </div>
              <Badge variant={item.priority === 'critical' ? 'error' : item.priority === 'high' ? 'warning' : 'default'} size="sm">{item.priority}</Badge>
            </div>
          </button>
        )) : <p className="text-sm text-text-tertiary py-6 text-center">Nothing waiting here.</p>}
      </div>
    </Card>
  )

  if (queue.isLoading || workload.isLoading) {
    return <Layout><div className="max-w-6xl mx-auto space-y-4"><Skeleton className="h-10 w-64" /><Skeleton className="h-48 w-full" /></div></Layout>
  }

  const data = queue.data || {}
  const load = workload.data || {}

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Manager Queue</h1>
            <p className="text-sm text-text-tertiary">Pending decisions, overdue work, and workload signals.</p>
          </div>
          <Button variant="secondary" onClick={refresh}>Refresh</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Active tasks', load.active_tasks, ClipboardList],
            ['Open bids', load.open_bids, Gavel],
            ['Completed', load.completed_work, CheckCircle2],
            ['Overdue', load.overdue_tasks, AlertTriangle],
          ].map(([label, value, Icon]: any) => (
            <Card key={label} className="p-4">
              <Icon className="w-4 h-4 text-primary mb-2" />
              <p className="text-2xl font-black text-text-primary">{value ?? 0}</p>
              <p className="text-xs text-text-tertiary">{label}</p>
            </Card>
          ))}
        </div>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gavel className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-bold text-text-primary">Pending bids</h2>
            <Badge variant="default" size="sm">{data.pending_bids?.length || 0}</Badge>
          </div>
          <div className="space-y-2">
            {data.pending_bids?.length ? data.pending_bids.map((bid: QueueBid) => (
              <div key={bid.bid_id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border bg-white">
                <div>
                  <p className="text-sm font-semibold text-text-primary">{bid.task_title}</p>
                  <p className="text-xs text-text-tertiary">{bid.bidder_name} · ETA {new Date(bid.estimated_completion).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="success" onClick={async () => { await bidService.approveBid(bid.bid_id); refresh() }}>Approve</Button>
                  <Button size="sm" variant="ghost" onClick={async () => { await bidService.rejectBid(bid.bid_id); refresh() }}>Reject</Button>
                  <Button size="sm" variant="secondary" onClick={() => navigate(`/tasks/${bid.task_id}`)}>Open</Button>
                </div>
              </div>
            )) : <p className="text-sm text-text-tertiary py-6 text-center">No pending bids.</p>}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {section('Awaiting review', <CheckCircle2 className="w-4 h-4 text-success" />, data.completed_awaiting_review || [])}
          {section('Overdue tasks', <Clock className="w-4 h-4 text-error" />, data.overdue_tasks || [])}
          {section('Revision requests', <AlertTriangle className="w-4 h-4 text-warning" />, data.revision_requests || [])}
          {section('High priority with no bids', <Calendar className="w-4 h-4 text-primary" />, data.high_priority_no_bids || [])}
        </div>
      </div>
    </Layout>
  )
}
