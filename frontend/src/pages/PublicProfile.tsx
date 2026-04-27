import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { User, ClipboardList, Loader2, ArrowLeft } from 'lucide-react'
import Layout from '../components/common/Layout'
import { Card } from '../design-system'
import { authService } from '../services/authService'
import { cn } from '../design-system/utils'

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>()
  
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ['publicProfile', id],
    queryFn: () => authService.getPublicProfile(id as string),
    enabled: !!id,
  })

  type TabType = 'overview' | 'task_history'
  const [activeSection, setActiveSection] = useState<TabType>('overview')

  const sections = [
    { id: 'overview' as const, label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'task_history' as const, label: 'Task History', icon: <ClipboardList className="w-4 h-4" /> },
  ]

  if (isLoading) {
    return <Layout><div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></Layout>
  }

  if (isError || !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold text-text-primary">Profile not found</h2>
            <p className="text-text-secondary mt-2">The requested user profile does not exist or has been removed.</p>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors mb-2">
          <ArrowLeft size={16} /> Back
        </Link>
        
        {/* Avatar & Stats hero */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-surface" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-4xl font-bold text-white shadow-md border-4 border-surface">
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">{profile?.name}</h1>
                <p className="text-text-secondary">Platform Member</p>
                {profile?.bio && <p className="text-sm text-text-tertiary mt-2 max-w-lg">{profile.bio}</p>}
                
                {profile?.resume_url && (
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-sm text-primary hover:underline font-medium">
                    View Portfolio / Resume &rarr;
                  </a>
                )}
                
                {profile?.skills && profile.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {profile.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container text-xs font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-4 p-4 bg-surface-2 rounded-2xl border border-border">
              <div className="text-center px-4 border-r border-border">
                <p className="text-xs text-text-tertiary mb-1">Avg Rating</p>
                <p className="text-xl font-bold text-primary">{profile?.avg_rating ? profile.avg_rating.toFixed(1) : '-'}</p>
                <p className="text-[10px] text-text-tertiary">({profile?.rating_count} reviews)</p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-text-tertiary mb-1">Success Rate</p>
                <p className="text-xl font-bold text-success">
                  {profile?.success_rate ? `${(profile.success_rate * 100).toFixed(0)}%` : '-'}
                </p>
                <p className="text-[10px] text-text-tertiary">Won bids / Total</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Section tabs */}
        <div className="flex gap-1 p-1 bg-surface-2 border border-border rounded-xl w-fit overflow-x-auto">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                activeSection === s.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-3'
              )}
            >
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h2 className="font-bold text-lg text-text-primary border-b border-border pb-2">Delegation Stats</h2>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-text-secondary">Total Tasks Posted</span>
                <span className="font-semibold text-text-primary">{profile?.total_tasks_posted || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-text-secondary">Tasks Completed</span>
                <span className="font-semibold text-text-primary">{profile?.total_tasks_completed || 0}</span>
              </div>
            </Card>
            <Card className="p-6 space-y-4">
              <h2 className="font-bold text-lg text-text-primary border-b border-border pb-2">Bidding Stats</h2>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-text-secondary">Bids Placed</span>
                <span className="font-semibold text-text-primary">{profile?.total_bids_placed || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-text-secondary">Bids Won</span>
                <span className="font-semibold text-text-primary">{profile?.total_bids_won || 0}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Task History Tab */}
        {activeSection === 'task_history' && (
          <Card className="p-6">
            <h2 className="font-bold text-lg text-text-primary mb-4 pb-2 border-b border-border">Task History</h2>
            {(!profile?.task_history || profile.task_history.length === 0) ? (
              <p className="text-text-tertiary text-center py-8">No tasks posted yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.task_history.map(task => (
                  <div key={task.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-surface-2 rounded-xl border border-border">
                    <div className="flex-1">
                      <Link to={`/tasks/${task.id}`} className="font-medium text-text-primary hover:text-primary transition-colors inline-block">{task.title}</Link>
                      <p className="text-xs text-text-tertiary mt-1">Created: {new Date(task.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2 sm:mt-0">
                      <span className="px-2.5 py-1 bg-surface-3 rounded-lg text-xs font-semibold capitalize text-text-secondary">{task.status.replace('_', ' ')}</span>
                      {task.rating && (
                        <div className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-md text-xs font-bold">
                          ★ {task.rating}/5
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  )
}
