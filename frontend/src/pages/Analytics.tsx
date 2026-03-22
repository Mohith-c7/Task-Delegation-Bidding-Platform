import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsResponse } from '../services/analyticsService';
import Layout from '../components/common/Layout';
import { SkeletonStat } from '../design-system';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, CheckCircle2, Layers, Gavel, Users, Award, ChevronDown } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const CHART_COLORS = {
  primary:   { solid: '#6750A4', alpha: 'rgba(103,80,164,0.15)' },
  success:   { solid: '#4CAF50', alpha: 'rgba(76,175,80,0.15)' },
  warning:   { solid: '#FF9800', alpha: 'rgba(255,152,0,0.15)' },
  error:     { solid: '#F44336', alpha: 'rgba(244,67,54,0.15)' },
  secondary: { solid: '#625B71', alpha: 'rgba(98,91,113,0.15)' },
}

const chartDefaults = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { font: { family: 'Inter, sans-serif', size: 11 }, color: '#79747E', boxWidth: 12 } } },
}

export default function Analytics() {
  const [days, setDays] = useState(30);

  const { data: analytics, isLoading } = useQuery<AnalyticsResponse>({
    queryKey: ['analytics', days],
    queryFn: () => analyticsService.getDashboardAnalytics(days),
  });

  const summary = analytics?.summary
  const task_trends = analytics?.task_trends ?? []
  const top_bidders = analytics?.top_bidders ?? []
  const top_task_owners = analytics?.top_task_owners ?? []
  const skill_demands = analytics?.skill_demands ?? []

  const trendData = {
    labels: task_trends.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Created',
        data: task_trends.map(t => t.created),
        borderColor: CHART_COLORS.primary.solid,
        backgroundColor: CHART_COLORS.primary.alpha,
        tension: 0.4, fill: true, pointRadius: 3,
      },
      {
        label: 'Completed',
        data: task_trends.map(t => t.completed),
        borderColor: CHART_COLORS.success.solid,
        backgroundColor: CHART_COLORS.success.alpha,
        tension: 0.4, fill: true, pointRadius: 3,
      },
    ],
  }

  const priorityData = {
    labels: summary ? Object.keys(summary.tasks_by_priority).map(p => p.charAt(0).toUpperCase() + p.slice(1)) : [],
    datasets: [{
      data: summary ? Object.values(summary.tasks_by_priority) : [],
      backgroundColor: [CHART_COLORS.success.solid, CHART_COLORS.primary.solid, CHART_COLORS.warning.solid, CHART_COLORS.error.solid],
      borderWidth: 0, hoverOffset: 6,
    }],
  }

  const statusData = {
    labels: summary ? Object.keys(summary.tasks_by_status).map(s => s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())) : [],
    datasets: [{
      data: summary ? Object.values(summary.tasks_by_status) : [],
      backgroundColor: [CHART_COLORS.primary.solid, CHART_COLORS.warning.solid, CHART_COLORS.secondary.solid, CHART_COLORS.success.solid, '#9E9E9E'],
      borderWidth: 0, hoverOffset: 6,
    }],
  }

  const skillData = {
    labels: skill_demands.map(s => s.skill),
    datasets: [
      { label: 'Tasks', data: skill_demands.map(s => s.task_count), backgroundColor: CHART_COLORS.primary.solid, borderRadius: 6 },
      { label: 'Bids', data: skill_demands.map(s => s.bid_count), backgroundColor: CHART_COLORS.success.solid, borderRadius: 6 },
    ],
  }

  const statCards = summary ? [
    { label: 'Total Tasks', value: summary.total_tasks, sub: `${summary.task_completion_rate.toFixed(1)}% completion`, icon: Layers, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Open Tasks', value: summary.open_tasks, sub: 'Available for bidding', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
    { label: 'Completed', value: summary.completed_tasks, sub: 'Successfully finished', icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Total Bids', value: summary.total_bids, sub: `Avg ${summary.average_completion_time_hours.toFixed(1)}h completion`, icon: Gavel, color: 'text-warning', bg: 'bg-warning/10' },
  ] : []

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Analytics</h1>
            <p className="text-sm text-text-secondary mt-0.5">Platform-wide insights and performance metrics</p>
          </div>
          <div className="relative">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="appearance-none bg-surface-2 border border-border text-text-primary text-sm rounded-xl px-4 py-2 pr-9 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
            : statCards.map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className="bg-surface-2 rounded-2xl p-5 border border-border">
                <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-xs text-text-tertiary font-medium mb-1">{label}</p>
                <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
                <p className="text-xs text-text-tertiary">{sub}</p>
              </div>
            ))
          }
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 bg-surface-2 rounded-2xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Task Trends</h2>
            <div className="h-56">
              {isLoading ? <div className="h-full bg-surface-3 rounded-xl animate-pulse" /> : <Line data={trendData} options={chartDefaults} />}
            </div>
          </div>
          <div className="bg-surface-2 rounded-2xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">By Priority</h2>
            <div className="h-56 flex items-center justify-center">
              {isLoading ? <div className="w-40 h-40 rounded-full bg-surface-3 animate-pulse" /> : <Doughnut data={priorityData} options={{ ...chartDefaults, cutout: '65%' }} />}
            </div>
          </div>
        </div>

        {/* Charts row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="bg-surface-2 rounded-2xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">By Status</h2>
            <div className="h-56 flex items-center justify-center">
              {isLoading ? <div className="w-40 h-40 rounded-full bg-surface-3 animate-pulse" /> : <Doughnut data={statusData} options={{ ...chartDefaults, cutout: '65%' }} />}
            </div>
          </div>
          <div className="lg:col-span-2 bg-surface-2 rounded-2xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Top Skills in Demand</h2>
            <div className="h-56">
              {isLoading ? <div className="h-full bg-surface-3 rounded-xl animate-pulse" /> : <Bar data={skillData} options={{ ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { ...chartDefaults.plugins.legend } } }} />}
            </div>
          </div>
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Top Bidders */}
          <div className="bg-surface-2 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-text-primary">Top Bidders</h2>
            </div>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-surface-3 rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2">
                {top_bidders.slice(0, 5).map((b, i) => (
                  <div key={b.bidder_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-3 transition-colors">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-warning/20 text-warning' : 'bg-surface-3 text-text-tertiary'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{b.bidder_name}</p>
                      <p className="text-xs text-text-tertiary">{b.total_bids} bids · {b.completed_tasks} completed</p>
                    </div>
                    <span className="text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-lg">{b.success_rate.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Task Owners */}
          <div className="bg-surface-2 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Award size={16} className="text-secondary" />
              <h2 className="text-sm font-semibold text-text-primary">Top Task Owners</h2>
            </div>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 bg-surface-3 rounded-xl animate-pulse" />)}</div>
            ) : (
              <div className="space-y-2">
                {top_task_owners.slice(0, 5).map((o, i) => (
                  <div key={o.owner_id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-surface-3 transition-colors">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${i === 0 ? 'bg-warning/20 text-warning' : 'bg-surface-3 text-text-tertiary'}`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">{o.owner_name}</p>
                      <p className="text-xs text-text-tertiary">{o.tasks_posted} posted · {o.tasks_completed} done</p>
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-lg">{o.average_bids_per_task.toFixed(1)} bids/task</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
