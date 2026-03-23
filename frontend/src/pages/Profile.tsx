import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { User, Lock, Bell, Camera, Plus, X, Loader2, CheckCircle } from 'lucide-react'
import Layout from '../components/common/Layout'
import { Button, Card, Input } from '../design-system'
import { useAuthStore } from '../store/authStore'
import { useToast } from '../design-system'
import api from '../services/api'
import { cn } from '../design-system/utils'

export default function Profile() {
  const { user, setAuth, token } = useAuthStore()
  const { success: toastSuccess, error: toastError } = useToast()
  const [activeSection, setActiveSection] = useState<'profile' | 'password' | 'notifications'>('profile')

  // Profile form
  const [name, setName] = useState(user?.name || '')
  const [avatarURL, setAvatarURL] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')

  // Password form
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  // Notification prefs
  const [notifPrefs, setNotifPrefs] = useState({
    bid_placed: true, bid_approved: true, bid_rejected: true,
    task_assigned: true, task_comment: true, deadline: true,
  })

  const updateProfile = useMutation({
    mutationFn: () => api.put('/users/me', { name, avatar_url: avatarURL, skills }),
    onSuccess: (res) => {
      if (token) setAuth(res.data.data, token)
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

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
      setSkillInput('')
    }
  }

  const sections = [
    { id: 'profile' as const, label: 'Profile', icon: <User className="w-4 h-4" /> },
    { id: 'password' as const, label: 'Password', icon: <Lock className="w-4 h-4" /> },
    { id: 'notifications' as const, label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  ]

  const pwdStrength = newPwd.length === 0 ? 0 : newPwd.length < 8 ? 1 : newPwd.length < 12 ? 2 : 3
  const pwdColors = ['', 'bg-[var(--color-error)]', 'bg-[var(--color-warning)]', 'bg-[var(--color-success)]']
  const pwdLabels = ['', 'Weak', 'Fair', 'Strong']

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Profile</h1>
          <p className="text-[var(--color-on-surface-variant)] mt-1">Manage your account settings</p>
        </div>

        {/* Avatar hero */}
        <Card className="p-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-tertiary)] flex items-center justify-center text-3xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[var(--color-surface)] border-2 border-[var(--color-outline)] flex items-center justify-center hover:bg-[var(--color-surface-variant)] transition-colors">
                <Camera className="w-3.5 h-3.5 text-[var(--color-on-surface-variant)]" />
              </button>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--color-on-surface)]">{user?.name}</h2>
              <p className="text-sm text-[var(--color-on-surface-variant)]">{user?.email}</p>
            </div>
          </div>
        </Card>

        {/* Section tabs */}
        <div className="flex gap-1 p-1 bg-[var(--color-surface-variant)] rounded-xl w-fit">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                activeSection === s.id
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                  : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
              )}
            >
              {s.icon}{s.label}
            </button>
          ))}
        </div>

        {/* Profile section */}
        {activeSection === 'profile' && (
          <Card className="p-6 space-y-5">
            <h2 className="font-semibold text-[var(--color-on-surface)]">Edit Profile</h2>
            <Input label="Display Name" value={name} onChange={e => setName(e.target.value)} />
            <Input label="Avatar URL" value={avatarURL} onChange={e => setAvatarURL(e.target.value)} placeholder="https://..." />

            <div>
              <label className="block text-sm font-medium text-[var(--color-on-surface)] mb-2">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map(s => (
                  <span key={s} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)] text-sm">
                    {s}
                    <button onClick={() => setSkills(skills.filter(sk => sk !== s))} className="hover:text-[var(--color-error)]">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSkill()}
                  placeholder="Add a skill..."
                  className="flex-1"
                />
                <Button variant="secondary" size="sm" onClick={addSkill}>
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
            <h2 className="font-semibold text-[var(--color-on-surface)]">Change Password</h2>
            <Input label="Current Password" type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
            <div>
              <Input label="New Password" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
              {newPwd && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map(i => (
                      <div key={i} className={cn('h-1 flex-1 rounded-full transition-all', i <= pwdStrength ? pwdColors[pwdStrength] : 'bg-[var(--color-surface-variant)]')} />
                    ))}
                  </div>
                  <p className="text-xs text-[var(--color-on-surface-variant)]">{pwdLabels[pwdStrength]}</p>
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
            <h2 className="font-semibold text-[var(--color-on-surface)]">Notification Preferences</h2>
            <div className="space-y-3">
              {Object.entries(notifPrefs).map(([key, val]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm text-[var(--color-on-surface)] capitalize">{key.replace(/_/g, ' ')}</span>
                  <div
                    onClick={() => setNotifPrefs(p => ({ ...p, [key]: !val }))}
                    className={cn(
                      'relative w-11 h-6 rounded-full transition-colors cursor-pointer',
                      val ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-variant)]'
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
