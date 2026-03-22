import { useQuery } from '@tanstack/react-query';
import { analyticsService, UserAnalytics } from '../services/analyticsService';
import Layout from '../components/common/Layout';
import { SkeletonStat } from '../design-system';
import { ClipboardList, Gavel, Trophy, Clock, TrendingUp, CheckCircle2, AlertTriangle, Info, Star } from 'lucide-react';

function ProgressBar({ value, color = 'bg-primary' }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-surface-3 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

function MetricRow({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <div>
        <p className="text-sm text-text-primary font-medium">{label}</p>
        {sub && <p className="text-xs text-text-tertiary mt-0.5">{sub}</p>}
      </div>
      <span className="text-sm font-bold text-text-primary">{value}</span>
    </div>
  )
}

export default function MyAnalytics() {
  const { data: analytics, isLoading } = useQuery<UserAnalytics>({
    queryKey: ['userAnalytics'],
    queryFn: analyticsService.getUserAnalytics,
  });

  const performanceScore = analytics ? (analytics.success_rate + analytics.on_time_rate) / 2 : 0
  const completionRate = analytics && analytics.tasks_posted > 0
    ? (analytics.tasks_completed / analytics.tasks_posted) * 100 : 0

  const scoreRing = performanceScore >= 70 ? 'border-success' : performanceScore >= 40 ? 'border-warning' : 'border-error'

  const stats = analytics ? [
    { label: 'Tasks Posted', value: analytics.tasks_posted, sub: `${analytics.tasks_completed} completed`, icon: ClipboardList, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Bids Placed', value: analytics.bids_placed, sub: `${analytics.bids_won} won`, icon: Gavel, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'Success Rate', value: `${analytics.success_rate.toFixed(1)}%`, sub: 'Bid approval rate', icon: Trophy, color: 'text-success', bg: 'bg-success/10' },
    { label: 'On-Time Rate', value: `${analytics.on_time_rate.toFixed(1)}%`, sub: 'Delivered on time', icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
  ] : []

  const insights = analytics ? [
    analytics.success_rate >= 70
      ? { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', title: 'Excellent Success Rate', body: 'Your bid approval rate is above 70%. Task owners love your proposals.' }
      : { icon: AlertTriangle, color: 'text-warning', bg: 'bg-warning/10', title: 'Room to Improve', body: 'Craft more detailed proposals to increase your bid success rate.' },
    analytics.on_time_rate >= 80
      ? { icon: Star, color: 'text-primary', bg: 'bg-primary/10', title: 'Reliable Delivery', body: 'You consistently deliver on time. This builds trust with task owners.' }
      : analytics.bids_won > 0
        ? { icon: Info, color: 'text-secondary', bg: 'bg-secondary/10', title: 'Focus on Deadlines', body: 'Improving on-time delivery will boost your reputation significantly.' }
        : null,
    analytics.bids_placed === 0 && analytics.tasks_posted === 0
      ? { icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10', title: 'Get Started', body: 'Post tasks or place bids to start building your performance profile.' }
      : null,
  ].filter(Boolean) : []

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">My Performance</h1>
          <p className="text-sm text-text-secondary mt-0.5">Your personal activity and performance metrics</p>
        </div>

        {/* Score hero */}
        <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white translate-y-1/2 -translate-x-1/2" />
          </div>
          <div className="relative flex items-center gap-6">
            <div className={`w-24 h-24 rounded-full border-4 ${isLoading ? 'border-white/30' : scoreRing.replace('border-', 'border-')} bg-white/10 flex flex-col items-center justify-center shrink-0`}>
              {isLoading ? (
                <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-white">{performanceScore.toFixed(0)}</span>
                  <span className="text-xs text-white/70">/ 100</span>
                </>
              )}
            </div>
            <div>
              <p className="text-white/70 text-sm font-medium mb-1">Overall Performance Score</p>
              <p className="text-3xl font-bold text-white mb-1">
                {isLoading ? '—' : performanceScore >= 70 ? 'Excellent' : performanceScore >= 40 ? 'Good' : 'Getting Started'}
              </p>
              <p className="text-white/60 text-xs">Based on success rate and on-time delivery</p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonStat key={i} />)
            : stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
              <div key={label} className="bg-surface-2 rounded-2xl p-4 border border-border">
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                  <Icon size={16} className={color} />
                </div>
                <p className="text-xs text-text-tertiary font-medium">{label}</p>
                <p className={`text-xl font-bold ${color} my-0.5`}>{value}</p>
                <p className="text-xs text-text-tertiary">{sub}</p>
              </div>
            ))
          }
        </div>

        {/* Detailed breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* As Task Owner */}
          <div className="bg-surface-2 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-text-primary">As Task Owner</h2>
            </div>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-10 bg-surface-3 rounded-xl animate-pulse" />)}</div>
            ) : (
              <>
                <MetricRow label="Tasks Posted" value={analytics?.tasks_posted ?? 0} />
                <MetricRow label="Tasks Completed" value={analytics?.tasks_completed ?? 0} />
                <MetricRow label="Completion Rate" value={`${completionRate.toFixed(1)}%`} />
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
                    <span>Completion progress</span>
                    <span>{completionRate.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={completionRate} color="bg-primary" />
                </div>
              </>
            )}
          </div>

          {/* As Bidder */}
          <div className="bg-surface-2 rounded-2xl border border-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Gavel size={16} className="text-secondary" />
              <h2 className="text-sm font-semibold text-text-primary">As Bidder</h2>
            </div>
            {isLoading ? (
              <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 bg-surface-3 rounded-xl animate-pulse" />)}</div>
            ) : (
              <>
                <MetricRow label="Total Bids Placed" value={analytics?.bids_placed ?? 0} />
                <MetricRow label="Bids Won" value={analytics?.bids_won ?? 0} />
                <MetricRow label="Win Rate" value={`${analytics?.success_rate.toFixed(1) ?? 0}%`} />
                <MetricRow label="Avg Completion Time" value={`${analytics?.average_completion_time_hours.toFixed(1) ?? 0}h`} />
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-text-tertiary mb-1.5">
                    <span>Win rate</span>
                    <span>{analytics?.success_rate.toFixed(0) ?? 0}%</span>
                  </div>
                  <ProgressBar value={analytics?.success_rate ?? 0} color="bg-success" />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Insights */}
        {!isLoading && insights.length > 0 && (
          <div className="bg-surface-2 rounded-2xl border border-border p-5">
            <h2 className="text-sm font-semibold text-text-primary mb-4">Performance Insights</h2>
            <div className="space-y-3">
              {insights.map((insight, i) => {
                if (!insight) return null
                const Icon = insight.icon
                return (
                  <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl ${insight.bg}`}>
                    <Icon size={16} className={`${insight.color} shrink-0 mt-0.5`} />
                    <div>
                      <p className={`text-sm font-semibold ${insight.color}`}>{insight.title}</p>
                      <p className="text-xs text-text-secondary mt-0.5">{insight.body}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
