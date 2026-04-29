import { useState, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { User, Lock, Bell, Plus, X, Loader2, CheckCircle, Edit3, ClipboardList, TrendingUp, MessageSquare, Star, FileText, Calendar } from 'lucide-react'
import Layout from '../components/common/Layout'
import { Button, Card, Input } from '../design-system'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../design-system'
import api from '../services/api'
import { authService, type AvailabilityEntry } from '../services/authService'
import { cn } from '../design-system/utils'

export default function Profile() {
  const { user, setAuth, token } = useAuthStore()
  const { success: toastSuccess, error: toastError } = useToast()
  
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['myProfile'],
    queryFn: () => authService.getMyProfile(),
    enabled: !!user?.id,
  })

  // We use the full profile type
  type TabType = 'overview' | 'settings' | 'password' | 'notifications' | 'task_history' | 'bid_history' | 'reviews' | 'availability'
  const [activeSection, setActiveSection] = useState<TabType>('overview')
  const availability = useQuery({
    queryKey: ['availability'],
    queryFn: () => authService.getAvailability(),
    enabled: !!user?.id,
  })

  // Profile form
  const [name, setName] = useState(user?.name || '')
  const [avatarURL, setAvatarURL] = useState('')
  const [bio, setBio] = useState('')
  const [resumeURL, setResumeURL] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [avatarFailed, setAvatarFailed] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name || '')
      setAvatarURL(profile.avatar_url || '')
      setBio(profile.bio || '')
      setResumeURL(profile.resume_url || '')
      setSkills(profile.skills || [])
      setAvatarFailed(false)
    }
  }, [profile])

  // Password form
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    bid_placed: true, bid_approved: true, bid_rejected: true,
    task_assigned: true, task_comment: true, deadline: true,
  })
  const [availabilityForm, setAvailabilityForm] = useState({
    start_at: '',
    end_at: '',
    status: 'unavailable' as AvailabilityEntry['status'],
    note: '',
  })

  const updateProfile = useMutation({
    mutationFn: () => api.put('/users/me', { name, avatar_url: avatarURL, bio, resume_url: resumeURL, skills }),
    onSuccess: (res) => {
      if (token) setAuth(res.data.data, token)
      refetch()
      toastSuccess('Profile updated')
    },
    onError: () => toastError('Failed to update profile'),
  })

  const changePassword = useMutation({
    mutationFn: () => api.put('/users/me/password', { current_password: currentPwd, new_password: newPwd }),
    onSuccess: () => {
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('')
      toastSuccess('Password changed')
    },
    onError: (err: any) => toastError(err?.response?.data?.message || 'Failed to change password'),
  })

  const updateNotifPrefs = useMutation({
    mutationFn: () => api.put('/users/me/notifications', notifPrefs),
    onSuccess: () => toastSuccess('Preferences saved'),
  })

  const createAvailability = useMutation({
    mutationFn: () => authService.createAvailability({
      start_at: new Date(availabilityForm.start_at).toISOString(),
      end_at: new Date(availabilityForm.end_at).toISOString(),
      status: availabilityForm.status,
      note: availabilityForm.note,
    }),
    onSuccess: () => {
      setAvailabilityForm({ start_at: '', end_at: '', status: 'unavailable', note: '' })
      availability.refetch()
      toastSuccess('Availability added')
    },
    onError: (err: any) => toastError(err?.response?.data?.message || 'Failed to add availability'),
  })

  const deleteAvailability = useMutation({
    mutationFn: (id: string) => authService.deleteAvailability(id),
    onSuccess: () => {
      availability.refetch()
      toastSuccess('Availability removed')
    },
  })

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.some(skill => skill.toLowerCase() === s.toLowerCase())) {
      setSkills([...skills, s])
      setSkillInput('')
    }
  }

  const sections = [
    { id: 'overview' as const, label: 'Overview', icon: <User className="w-4 h-4" /> },
    { id: 'task_history' as const, label: 'Task History', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'bid_history' as const, label: 'Bid History', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'reviews' as const, label: 'Reviews', icon: <MessageSquare className="w-4 h-4" /> },
    { id: 'availability' as const, label: 'Availability', icon: <Calendar className="w-4 h-4" /> },
    { id: 'settings' as const, label: 'Settings', icon: <Edit3 className="w-4 h-4" /> },
    { id: 'password' as const, label: 'Password', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ]

  const pwdStrength = newPwd.length === 0 ? 0 : newPwd.length < 8 ? 1 : newPwd.length < 12 ? 2 : 3
  const pwdColors = ['', 'bg-[var(--color-error)]', 'bg-[var(--color-warning)]', 'bg-[var(--color-success)]']
  const pwdLabels = ['', 'Weak', 'Fair', 'Strong']

  if (isLoading) {
    return <Layout><div className="flex items-center justify-center p-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div></Layout>
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Avatar & Stats hero */}
        <Card className="p-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="relative">
                {profile?.avatar_url && !avatarFailed ? (
                  <img src={profile.avatar_url} alt="Avatar" onError={() => setAvatarFailed(true)} className="w-24 h-24 rounded-full object-cover border-4 border-surface" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-tertiary flex items-center justify-center text-4xl font-bold text-white shadow-md border-4 border-surface">
                    {profile?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-text-primary">{profile?.name}</h1>
                <p className="text-text-secondary">{profile?.email}</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary mt-1">{profile?.role || 'Member'}</p>
                <p className="text-xs text-text-tertiary mt-1">
                  Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}
                </p>
                {profile?.bio && <p className="text-sm text-text-tertiary mt-2 max-w-lg">{profile.bio}</p>}
                {profile?.resume_url && (
                  <a href={profile.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 mt-3 text-sm text-primary hover:underline font-medium">
                    <FileText className="w-4 h-4" /> View Resume
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
                <p className="text-xl font-bold text-primary">{profile?.review_count ? (profile.overall_rating || profile.avg_rating).toFixed(1) : 'Not rated'}</p>
                <p className="text-[10px] text-text-tertiary">({profile?.review_count || 0} reviews)</p>
              </div>
              <div className="text-center px-4 border-r border-border">
                <p className="text-xs text-text-tertiary mb-1">Success Rate</p>
                <p className="text-xl font-bold text-success">
                  {profile?.total_bids_placed ? `${(profile.success_rate * 100).toFixed(0)}%` : '0%'}
                </p>
                <p className="text-[10px] text-text-tertiary">Won bids / Total</p>
              </div>
              <div className="text-center px-4">
                <p className="text-xs text-text-tertiary mb-1">Points</p>
                <p className="text-xl font-bold text-warning">{profile?.total_points || 0}</p>
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
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-text-secondary">Overall Rating</span>
                <span className="font-semibold text-text-primary">{profile?.review_count ? `${(profile.overall_rating || profile.avg_rating).toFixed(1)} / 5` : 'Not rated yet'}</span>
              </div>
            </Card>
            <Card className="p-6 space-y-4">
              <h2 className="font-bold text-lg text-text-primary border-b border-border pb-2">Bidding Stats</h2>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-text-secondary">Tasks Applied</span>
                <span className="font-semibold text-text-primary">{profile?.tasks_applied ?? profile?.total_bids_placed ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-text-secondary">Tasks Accepted</span>
                <span className="font-semibold text-text-primary">{profile?.tasks_accepted ?? profile?.total_bids_won ?? 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-text-secondary">Success Rate</span>
                <span className="font-semibold text-text-primary">{profile?.total_bids_placed ? `${(profile.success_rate * 100).toFixed(0)}%` : '0%'}</span>
              </div>
            </Card>
          </div>
        )}

        {/* Task History Tab */}
        {activeSection === 'task_history' && (
          <Card className="p-6">
            <h2 className="font-bold text-lg text-text-primary mb-4 pb-2 border-b border-border">Task History</h2>
            {profile?.task_history?.length === 0 ? (
              <p className="text-text-tertiary text-center py-8">No tasks posted yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-tertiary border-b border-border">
                      <th className="py-2 pr-4">Task</th>
                      <th className="py-2 pr-4">Priority</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Deadline</th>
                      <th className="py-2 pr-4">Posted</th>
                      <th className="py-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile?.task_history?.map(task => (
                      <tr key={task.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-medium text-text-primary">{task.title}</td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-surface-3 capitalize">{task.priority}</span>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-0.5 rounded text-xs bg-surface-3 capitalize">{task.status.replace('_', ' ')}</span>
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{new Date(task.deadline).toLocaleDateString()}</td>
                        <td className="py-3 pr-4 text-text-secondary">{new Date(task.created_at).toLocaleDateString()}</td>
                        <td className="py-3 text-text-secondary">{task.rating ? `★ ${task.rating}/5` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Bid History Tab */}
        {activeSection === 'bid_history' && (
          <Card className="p-6">
            <h2 className="font-bold text-lg text-text-primary mb-4 pb-2 border-b border-border">Bid History</h2>
            {profile?.bid_history?.length === 0 ? (
              <p className="text-text-tertiary text-center py-8">No bids placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-text-tertiary border-b border-border">
                      <th className="py-2 pr-4">Task</th>
                      <th className="py-2 pr-4">Task Status</th>
                      <th className="py-2 pr-4">Bid Status</th>
                      <th className="py-2 pr-4">Est. Completion</th>
                      <th className="py-2">Date Bid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profile?.bid_history?.map(bid => (
                      <tr key={bid.bid_id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-medium text-text-primary">{bid.task_title}</td>
                        <td className="py-3 pr-4 text-text-secondary capitalize">{bid.task_status.replace('_', ' ')}</td>
                        <td className="py-3 pr-4">
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-semibold capitalize",
                            bid.bid_status === 'approved' ? "bg-success/10 text-success" :
                            bid.bid_status === 'rejected' ? "bg-error/10 text-error" :
                            "bg-warning/10 text-warning"
                          )}>
                            {bid.bid_status}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-text-secondary">{new Date(bid.estimated_completion).toLocaleDateString()}</td>
                        <td className="py-3 text-text-secondary">{new Date(bid.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )}

        {/* Reviews Tab */}
        {activeSection === 'reviews' && (
          <Card className="p-6">
            <h2 className="font-bold text-lg text-text-primary mb-4 pb-2 border-b border-border">Reviews by Customers</h2>
            {(!profile?.reviews || profile.reviews.length === 0) ? (
              <p className="text-text-tertiary text-center py-8">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.reviews.map(review => (
                  <div key={review.id} className="rounded-xl border border-border p-4 bg-surface-2">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-text-primary">{review.reviewer_name}</p>
                        <p className="text-sm text-text-secondary">{review.task_title}</p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="inline-flex items-center gap-1 font-semibold text-primary"><Star className="w-4 h-4 fill-current" /> {review.rating}/5</span>
                        <span className="text-text-tertiary">+{review.points} pts</span>
                      </div>
                    </div>
                    {review.comment && <p className="mt-3 text-sm text-text-secondary leading-relaxed">{review.comment}</p>}
                    <p className="mt-3 text-xs text-text-tertiary">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Availability Tab */}
        {activeSection === 'availability' && (
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="font-bold text-lg text-text-primary">Availability Calendar</h2>
              <p className="text-sm text-text-tertiary mt-1">Publish busy, leave, or unavailable windows so owners can plan assignments responsibly.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Start" type="datetime-local" value={availabilityForm.start_at} onChange={e => setAvailabilityForm(f => ({ ...f, start_at: e.target.value }))} />
              <Input label="End" type="datetime-local" value={availabilityForm.end_at} onChange={e => setAvailabilityForm(f => ({ ...f, end_at: e.target.value }))} />
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Status</label>
                <select
                  value={availabilityForm.status}
                  onChange={e => setAvailabilityForm(f => ({ ...f, status: e.target.value as any }))}
                  className="w-full h-10 px-3 text-sm bg-white border border-border-strong rounded-lg outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="available">Available</option>
                  <option value="busy">Busy</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="leave">Leave</option>
                </select>
              </div>
              <Input label="Note" value={availabilityForm.note} onChange={e => setAvailabilityForm(f => ({ ...f, note: e.target.value }))} placeholder="Optional context" />
            </div>

            <Button
              onClick={() => createAvailability.mutate()}
              disabled={!availabilityForm.start_at || !availabilityForm.end_at || createAvailability.isPending}
            >
              {createAvailability.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Availability
            </Button>

            <div className="space-y-2">
              {availability.isLoading ? (
                <p className="text-sm text-text-tertiary">Loading availability...</p>
              ) : availability.data?.length ? availability.data.map(entry => (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3">
                  <div>
                    <p className="text-sm font-semibold text-text-primary capitalize">{entry.status}</p>
                    <p className="text-xs text-text-tertiary">
                      {new Date(entry.start_at).toLocaleString()} - {new Date(entry.end_at).toLocaleString()}
                    </p>
                    {entry.note && <p className="text-xs text-text-secondary mt-1">{entry.note}</p>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => deleteAvailability.mutate(entry.id)}>Remove</Button>
                </div>
              )) : (
                <p className="text-sm text-text-tertiary text-center py-8">No upcoming availability entries.</p>
              )}
            </div>
          </Card>
        )}

        {/* Settings section */}
        {activeSection === 'settings' && (
          <Card className="p-6 space-y-5">
            <h2 className="font-semibold text-text-primary">Edit Profile Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Display Name" value={name} onChange={e => setName(e.target.value)} />
              <Input label="Avatar URL" value={avatarURL} onChange={e => setAvatarURL(e.target.value)} placeholder="https://..." />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-primary">Bio</label>
                <textarea 
                  className="w-full bg-surface border border-outline rounded-xl p-3 text-sm text-text-primary focus:outline-none focus:border-primary transition-colors min-h-[100px]"
                  value={bio} onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <Input label="Resume URL" value={resumeURL} onChange={e => setResumeURL(e.target.value)} placeholder="https://linkedin.com/in/... or drive link" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-container text-sm">
                    {s}
                    <button onClick={() => setSkills(skills.filter(sk => sk !== s))} className="hover:text-error transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Add a skill..."
                  className="flex-1"
                />
                <Button variant="secondary" size="sm" onClick={(e) => { e.preventDefault(); addSkill(); }}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button onClick={() => updateProfile.mutate()} disabled={updateProfile.isPending} className="flex items-center gap-2">
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Save Changes
            </Button>
          </Card>
        )}

        {/* Password section */}
        {activeSection === 'password' && (
          <Card className="p-6 space-y-5">
            <h2 className="font-semibold text-text-primary">Change Password</h2>
            <Input label="Current Password" type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
            <div>
              <Input label="New Password" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              {newPwd && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i <= pwdStrength ? pwdColors[pwdStrength] : 'bg-surface-variant')} />
                    ))}
                  </div>
                  <p className="text-xs text-text-tertiary">{pwdLabels[pwdStrength]}</p>
                </div>
              )}
            </div>
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              error={confirmPwd && confirmPwd !== newPwd ? "Passwords don't match" : undefined}
            />
            <Button
              onClick={() => changePassword.mutate()}
              disabled={!currentPwd || !newPwd || newPwd !== confirmPwd || changePassword.isPending}
              className="flex items-center gap-2"
            >
              {changePassword.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </Button>
          </Card>
        )}

        {/* Notifications section */}
        {activeSection === 'notifications' && (
          <Card className="p-6 space-y-5">
            <h2 className="font-semibold text-text-primary">Notification Preferences</h2>
            <div className="space-y-3">
              {Object.entries(notifPrefs).map(([key, val]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-text-primary capitalize">{key.replace(/_/g, ' ')}</span>
                  <div
                    onClick={() => setNotifPrefs(p => ({ ...p, [key]: !val }))}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors cursor-pointer',
                      val ? 'bg-primary' : 'bg-surface-variant'
                    )}
                  >
                    <div className={cn(
                      'absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform',
                      val ? 'translate-x-6' : 'translate-x-1'
                    )} />
                  </div>
                </label>
              ))}
            </div>
            <Button onClick={() => updateNotifPrefs.mutate()} disabled={updateNotifPrefs.isPending} className="flex items-center gap-2">
              {updateNotifPrefs.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
              Save Preferences
            </Button>
          </Card>
        )}
      </div>
    </Layout>
  )
}
