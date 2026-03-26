import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Users, Mail, CreditCard, Shield, UserMinus, Send, X,
  Crown, Briefcase, User, Building2, CheckCircle2, Zap,
  ChevronDown, Search, UserCog, Clock, Star, TrendingUp,
  AlertCircle,
} from 'lucide-react'
import Layout from '../components/common/Layout'
import CreateOrgModal from '../components/common/CreateOrgModal'
import { Button, Card, Badge, Input, Avatar, ConfirmModal } from '../design-system'
import { useAuthStore } from '../store/authStore'
import { useRBAC } from '../hooks/useRBAC'
import { orgService, Member, Invitation, Organization } from '../services/orgService'
import { billingService, Subscription } from '../services/billingService'
import { cn } from '../design-system/utils'
import { useToast } from '../design-system'

type Tab = 'overview' | 'members' | 'invitations' | 'billing'

const ROLE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode; desc: string }> = {
  org_admin: { label: 'Admin',    color: 'text-error',   bg: 'bg-error/10',   icon: <Crown className="w-3.5 h-3.5" />,    desc: 'Full access to all settings' },
  manager:   { label: 'Manager',  color: 'text-warning', bg: 'bg-warning/10', icon: <Briefcase className="w-3.5 h-3.5" />, desc: 'Can manage tasks and invite members' },
  employee:  { label: 'Employee', color: 'text-primary', bg: 'bg-primary/10', icon: <User className="w-3.5 h-3.5" />,      desc: 'Can bid and complete tasks' },
}

const TIER_META = {
  free:       { color: 'text-text-secondary', bg: 'bg-surface-3',    border: 'border-border',         label: 'Free',       memberLimit: 5,  taskLimit: 20 },
  pro:        { color: 'text-primary',        bg: 'bg-primary/10',   border: 'border-primary/30',     label: 'Pro',        memberLimit: 50, taskLimit: 999 },
  enterprise: { color: 'text-success',        bg: 'bg-success/10',   border: 'border-success/30',     label: 'Enterprise', memberLimit: 999, taskLimit: 999 },
}

export default function OrgSettings() {
  const [tab, setTab] = useState<Tab>('overview')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('employee')
  const [memberSearch, setMemberSearch] = useState('')
  const [roleChangeTarget, setRoleChangeTarget] = useState<Member | null>(null)
  const [removeTarget, setRemoveTarget] = useState<Member | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [orgName, setOrgName] = useState('')
  const [createOrgOpen, setCreateOrgOpen] = useState(false)

  const orgID = useAuthStore(s => s.orgID)
  const { user } = useAuthStore()
  const { isOrgAdmin, isManager } = useRBAC()
  const qc = useQueryClient()
  const { success, error: toastError } = useToast()

  const { data: org } = useQuery<Organization>({
    queryKey: ['org', orgID],
    queryFn: () => orgService.getOrg(orgID!),
    enabled: !!orgID,
  })

  // Sync org name to edit state when loaded
  const orgData = org as Organization | undefined

  const { data: members = [], isLoading: loadingMembers } = useQuery<Member[]>({
    queryKey: ['members', orgID],
    queryFn: () => orgService.listMembers(orgID!),
    enabled: !!orgID,
  })

  const { data: invitations = [], isLoading: loadingInvitations } = useQuery<Invitation[]>({
    queryKey: ['invitations', orgID],
    queryFn: () => orgService.listInvitations(orgID!),
    enabled: !!orgID && (isOrgAdmin || isManager),
  })

  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['subscription', orgID],
    queryFn: () => billingService.getSubscription(orgID!),
    enabled: !!orgID,
  })

  const updateOrg = useMutation({
    mutationFn: () => orgService.updateOrg(orgID!, { name: orgName }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org', orgID] }); success('Organization updated'); setEditingName(false) },
    onError: () => toastError('Failed to update organization'),
  })

  const removeMember = useMutation({
    mutationFn: (userID: string) => orgService.removeMember(orgID!, userID),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members', orgID] }); success('Member removed'); setRemoveTarget(null) },
    onError: () => toastError('Failed to remove member'),
  })

  const changeRole = useMutation({
    mutationFn: ({ userID, role }: { userID: string; role: string }) => orgService.changeRole(orgID!, userID, role),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members', orgID] }); success('Role updated'); setRoleChangeTarget(null) },
    onError: () => toastError('Failed to update role'),
  })

  const sendInvite = useMutation({
    mutationFn: () => orgService.sendInvitation(orgID!, inviteEmail, inviteRole),
    onSuccess: () => {
      setInviteEmail('')
      qc.invalidateQueries({ queryKey: ['invitations', orgID] })
      success('Invitation sent')
    },
    onError: () => toastError('Failed to send invitation'),
  })

  const revokeInvite = useMutation({
    mutationFn: (invID: string) => orgService.revokeInvitation(orgID!, invID),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invitations', orgID] }); success('Invitation revoked') },
    onError: () => toastError('Failed to revoke invitation'),
  })

  const upgradeTier = useMutation({
    mutationFn: (tier: string) => billingService.updateTier(orgID!, tier),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription', orgID] }); success('Plan updated') },
    onError: () => toastError('Failed to update plan'),
  })

  const filteredMembers = members.filter(m =>
    m.user_name.toLowerCase().includes(memberSearch.toLowerCase()) ||
    m.user_email.toLowerCase().includes(memberSearch.toLowerCase())
  )

  const pendingInvites = invitations.filter(i => i.status === 'pending')
  const tier = subscription?.tier || 'free'
  const tierMeta = TIER_META[tier]
  const memberUsage = tierMeta.memberLimit === 999 ? 0 : Math.round((members.length / tierMeta.memberLimit) * 100)

  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview',     label: 'Overview',     icon: <Building2 className="w-4 h-4" /> },
    { id: 'members',      label: 'Members',      icon: <Users className="w-4 h-4" />,      badge: members.length },
    { id: 'invitations',  label: 'Invitations',  icon: <Mail className="w-4 h-4" />,       badge: pendingInvites.length || undefined },
    { id: 'billing',      label: 'Billing',      icon: <CreditCard className="w-4 h-4" /> },
  ]

  if (!orgID) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto mt-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface-3 flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-text-tertiary" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">No organization yet</h2>
          <p className="text-text-secondary mb-6">Create an organization to manage your team, invite members, and collaborate on tasks.</p>
          <Button variant="primary" leftIcon={<Zap size={16} />} onClick={() => setCreateOrgOpen(true)}>
            Create Organization
          </Button>
        </div>
        <CreateOrgModal
          open={createOrgOpen}
          onClose={() => setCreateOrgOpen(false)}
          onSuccess={() => window.location.reload()}
        />
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white text-xl font-bold shadow-2">
              {orgData?.name?.[0]?.toUpperCase() || 'O'}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{orgData?.name || 'Organization'}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', tierMeta.bg, tierMeta.color)}>
                  {tierMeta.label} Plan
                </span>
                <span className="text-xs text-text-tertiary">·</span>
                <span className="text-xs text-text-tertiary">{members.length} member{members.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-3 rounded-xl w-fit border border-border">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative',
                tab === t.id
                  ? 'bg-white text-primary shadow-1'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
              )}
            >
              {t.icon}
              {t.label}
              {t.badge ? (
                <span className={cn(
                  'min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center',
                  tab === t.id ? 'bg-primary text-white' : 'bg-surface-3 text-text-secondary'
                )}>{t.badge}</span>
              ) : null}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-5">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Members', value: members.length, icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Pending Invites', value: pendingInvites.length, icon: Mail, color: 'text-warning', bg: 'bg-warning/10' },
                { label: 'Admins', value: members.filter(m => m.role === 'org_admin').length, icon: Crown, color: 'text-error', bg: 'bg-error/10' },
                { label: 'Managers', value: members.filter(m => m.role === 'manager').length, icon: Briefcase, color: 'text-success', bg: 'bg-success/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-surface-2 rounded-2xl p-4 border border-border flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
                    <Icon size={18} className={color} />
                  </div>
                  <div>
                    <p className="text-xs text-text-tertiary font-medium">{label}</p>
                    <p className={cn('text-xl font-bold', color)}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Org details card */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-semibold text-text-primary">Organization Details</h2>
                {isOrgAdmin && !editingName && (
                  <Button variant="ghost" size="sm" onClick={() => setEditingName(true)}>Edit</Button>
                )}
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Organization Name</label>
                  {editingName ? (
                    <div className="flex gap-2">
                      <Input value={orgName} onChange={e => setOrgName(e.target.value)} className="flex-1" />
                      <Button size="sm" onClick={() => updateOrg.mutate()} loading={updateOrg.isPending}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingName(false); setOrgName(orgData?.name || '') }}>Cancel</Button>
                    </div>
                  ) : (
                    <p className="text-sm text-text-primary font-medium">{orgData?.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Slug</label>
                  <div className="flex items-center gap-2">
                    <code className="text-sm text-text-secondary bg-surface-3 px-3 py-1.5 rounded-lg border border-border">{orgData?.slug}</code>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Created</label>
                  <p className="text-sm text-text-primary">{orgData?.created_at ? new Date(orgData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-text-secondary mb-1.5 block">Onboarding Status</label>
                  <div className="flex items-center gap-2">
                    {orgData?.onboarding_status === 'complete' ? (
                      <span className="flex items-center gap-1.5 text-sm text-success"><CheckCircle2 size={14} /> Complete</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-sm text-warning"><AlertCircle size={14} /> {orgData?.onboarding_status || 'Incomplete'}</span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent members */}
            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h2 className="font-semibold text-text-primary">Recent Members</h2>
                <Button variant="ghost" size="sm" onClick={() => setTab('members')}>View all</Button>
              </div>
              <div className="divide-y divide-border">
                {members.slice(0, 5).map(m => {
                  const meta = ROLE_META[m.role] || ROLE_META.employee
                  return (
                    <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                      <Avatar name={m.user_name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{m.user_name}</p>
                        <p className="text-xs text-text-tertiary truncate">{m.user_email}</p>
                      </div>
                      <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg', meta.bg, meta.color)}>
                        {meta.icon}{meta.label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>
        )}

        {/* MEMBERS TAB */}
        {tab === 'members' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              {(isOrgAdmin || isManager) && (
                <Button variant="primary" size="sm" leftIcon={<Send size={14} />} onClick={() => setTab('invitations')}>
                  Invite Member
                </Button>
              )}
            </div>

            <Card className="overflow-hidden">
              <div className="px-5 py-3.5 border-b border-border bg-surface-2 grid grid-cols-12 gap-3 text-xs font-semibold text-text-tertiary uppercase tracking-wide">
                <span className="col-span-5">Member</span>
                <span className="col-span-3">Role</span>
                <span className="col-span-2">Joined</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>
              {loadingMembers ? (
                <div className="space-y-0">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="px-5 py-4 border-b border-border flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-surface-3 animate-pulse" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 bg-surface-3 rounded animate-pulse w-32" />
                        <div className="h-2.5 bg-surface-3 rounded animate-pulse w-48" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="py-12 text-center">
                  <Users size={32} className="text-text-tertiary mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-text-secondary">{memberSearch ? 'No members match your search' : 'No members yet'}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredMembers.map(m => {
                    const meta = ROLE_META[m.role] || ROLE_META.employee
                    const isCurrentUser = m.user_id === user?.id
                    return (
                      <div key={m.id} className="grid grid-cols-12 gap-3 items-center px-5 py-3.5 hover:bg-surface-2 transition-colors group">
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <Avatar name={m.user_name} size="sm" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-sm font-medium text-text-primary truncate">{m.user_name}</p>
                              {isCurrentUser && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-semibold">You</span>}
                            </div>
                            <p className="text-xs text-text-tertiary truncate">{m.user_email}</p>
                          </div>
                        </div>
                        <div className="col-span-3">
                          <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg', meta.bg, meta.color)}>
                            {meta.icon}{meta.label}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <p className="text-xs text-text-tertiary">{new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                        <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isOrgAdmin && !isCurrentUser && (
                            <>
                              <button
                                onClick={() => setRoleChangeTarget(m)}
                                className="p-1.5 rounded-lg hover:bg-primary/10 text-text-tertiary hover:text-primary transition-colors"
                                title="Change role"
                              >
                                <UserCog size={14} />
                              </button>
                              <button
                                onClick={() => setRemoveTarget(m)}
                                className="p-1.5 rounded-lg hover:bg-error/10 text-text-tertiary hover:text-error transition-colors"
                                title="Remove member"
                              >
                                <UserMinus size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* INVITATIONS TAB */}
        {tab === 'invitations' && (
          <div className="space-y-4">
            {(isOrgAdmin || isManager) && (
              <Card className="p-5">
                <h2 className="font-semibold text-text-primary mb-1">Invite a team member</h2>
                <p className="text-xs text-text-tertiary mb-4">They'll receive an invitation link to join your organization.</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && inviteEmail && sendInvite.mutate()}
                    leftIcon={<Mail size={15} />}
                    className="flex-1"
                  />
                  <div className="relative">
                    <select
                      value={inviteRole}
                      onChange={e => setInviteRole(e.target.value)}
                      className="h-10 pl-3 pr-8 text-sm font-medium bg-white border border-border-strong rounded-lg appearance-none cursor-pointer outline-none hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      {isOrgAdmin && <option value="org_admin">Admin</option>}
                    </select>
                    <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
                  </div>
                  <Button
                    onClick={() => sendInvite.mutate()}
                    disabled={!inviteEmail || sendInvite.isPending}
                    loading={sendInvite.isPending}
                    leftIcon={<Send size={14} />}
                  >
                    Send Invite
                  </Button>
                </div>
                {/* Role descriptions */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  {Object.entries(ROLE_META).map(([key, meta]) => (
                    <div key={key} className={cn('p-3 rounded-xl border transition-all cursor-pointer', inviteRole === key ? `${meta.bg} border-current` : 'border-border hover:border-border-strong')}
                      onClick={() => setInviteRole(key)}>
                      <div className={cn('flex items-center gap-1.5 text-xs font-semibold mb-1', meta.color)}>
                        {meta.icon}{meta.label}
                      </div>
                      <p className="text-[11px] text-text-tertiary">{meta.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-text-primary">Pending Invitations</h2>
                  <p className="text-xs text-text-tertiary mt-0.5">{pendingInvites.length} awaiting response</p>
                </div>
                {pendingInvites.length > 0 && (
                  <Badge variant="warning">{pendingInvites.length} pending</Badge>
                )}
              </div>
              {loadingInvitations ? (
                <div className="p-8 text-center text-text-tertiary">Loading...</div>
              ) : pendingInvites.length === 0 ? (
                <div className="py-12 text-center">
                  <Mail size={32} className="text-text-tertiary mx-auto mb-2 opacity-40" />
                  <p className="text-sm text-text-secondary">No pending invitations</p>
                  <p className="text-xs text-text-tertiary mt-1">Invite team members above to get started</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {pendingInvites.map(inv => {
                    const meta = ROLE_META[inv.role] || ROLE_META.employee
                    const expiresAt = new Date(inv.expires_at)
                    const hoursLeft = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 3600000))
                    const isExpiringSoon = hoursLeft < 24
                    return (
                      <div key={inv.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2 transition-colors group">
                        <div className="w-9 h-9 rounded-full bg-surface-3 border border-border flex items-center justify-center shrink-0">
                          <Mail size={15} className="text-text-tertiary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">{inv.email}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={cn('inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded', meta.bg, meta.color)}>
                              {meta.icon}{meta.label}
                            </span>
                            <span className={cn('flex items-center gap-1 text-[10px]', isExpiringSoon ? 'text-error' : 'text-text-tertiary')}>
                              <Clock size={9} />
                              {isExpiringSoon ? `Expires in ${hoursLeft}h` : `Expires ${expiresAt.toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                        {isOrgAdmin && (
                          <button
                            onClick={() => revokeInvite.mutate(inv.id)}
                            className="p-1.5 rounded-lg hover:bg-error/10 text-text-tertiary hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                            title="Revoke invitation"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* BILLING TAB */}
        {tab === 'billing' && (
          <div className="space-y-5">
            {/* Current plan hero */}
            <div className={cn('rounded-2xl p-6 border-2', tierMeta.border, tierMeta.bg)}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn('text-xs font-bold uppercase tracking-wider', tierMeta.color)}>Current Plan</span>
                  </div>
                  <h2 className="text-2xl font-bold text-text-primary">{tierMeta.label}</h2>
                  {subscription && (
                    <p className="text-sm text-text-secondary mt-1">
                      Active since {new Date(subscription.started_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      {subscription.renews_at && ` · Renews ${new Date(subscription.renews_at).toLocaleDateString()}`}
                    </p>
                  )}
                </div>
                <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', tierMeta.bg)}>
                  {tier === 'enterprise' ? <Star size={22} className={tierMeta.color} /> :
                   tier === 'pro' ? <Zap size={22} className={tierMeta.color} /> :
                   <Shield size={22} className={tierMeta.color} />}
                </div>
              </div>

              {/* Usage meters */}
              {tierMeta.memberLimit !== 999 && (
                <div className="mt-5 space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-text-secondary font-medium">Members</span>
                      <span className={cn('font-semibold', memberUsage >= 80 ? 'text-error' : 'text-text-primary')}>
                        {members.length} / {tierMeta.memberLimit}
                      </span>
                    </div>
                    <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', memberUsage >= 80 ? 'bg-error' : memberUsage >= 60 ? 'bg-warning' : 'bg-primary')}
                        style={{ width: `${Math.min(100, memberUsage)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Plan cards */}
            {isOrgAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    tier: 'free', label: 'Free', price: '$0', period: '/month',
                    desc: 'Perfect for small teams getting started',
                    features: ['Up to 5 members', '20 active tasks', 'Basic analytics', 'Email notifications', 'Community support'],
                    cta: 'Downgrade to Free',
                  },
                  {
                    tier: 'pro', label: 'Pro', price: '$29', period: '/month',
                    desc: 'For growing teams that need more power',
                    features: ['Up to 50 members', 'Unlimited tasks', 'Advanced analytics', 'Trend reports', 'Priority support', 'CSV export'],
                    cta: 'Upgrade to Pro',
                    popular: true,
                  },
                  {
                    tier: 'enterprise', label: 'Enterprise', price: '$99', period: '/month',
                    desc: 'For large organizations with full control',
                    features: ['Unlimited members', 'Unlimited tasks', 'Full analytics suite', 'Audit log', 'Custom contracts', 'Dedicated support', 'SLA guarantee'],
                    cta: 'Upgrade to Enterprise',
                  },
                ].map(plan => {
                  const isCurrent = tier === plan.tier
                  const isUpgrade = ['free','pro','enterprise'].indexOf(plan.tier) > ['free','pro','enterprise'].indexOf(tier)
                  return (
                    <Card
                      key={plan.tier}
                      className={cn(
                        'p-5 flex flex-col transition-all relative overflow-hidden',
                        isCurrent && 'ring-2 ring-primary',
                        plan.popular && !isCurrent && 'border-primary/30',
                      )}
                    >
                      {plan.popular && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-bold bg-primary text-white px-2 py-0.5 rounded-full">POPULAR</span>
                        </div>
                      )}
                      <div className="mb-4">
                        <h3 className="font-bold text-text-primary text-base">{plan.label}</h3>
                        <p className="text-xs text-text-tertiary mt-0.5">{plan.desc}</p>
                        <div className="flex items-baseline gap-0.5 mt-3">
                          <span className="text-3xl font-bold text-text-primary">{plan.price}</span>
                          <span className="text-sm text-text-tertiary">{plan.period}</span>
                        </div>
                      </div>
                      <ul className="space-y-2 flex-1 mb-5">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-xs text-text-secondary">
                            <CheckCircle2 size={13} className="text-success shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                      {isCurrent ? (
                        <div className="flex items-center justify-center gap-1.5 py-2 text-sm font-semibold text-primary">
                          <CheckCircle2 size={15} /> Current plan
                        </div>
                      ) : (
                        <Button
                          variant={isUpgrade ? 'primary' : 'secondary'}
                          size="sm"
                          className="w-full"
                          onClick={() => upgradeTier.mutate(plan.tier)}
                          loading={upgradeTier.isPending}
                          leftIcon={isUpgrade ? <TrendingUp size={13} /> : undefined}
                        >
                          {plan.cta}
                        </Button>
                      )}
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Role change modal */}
        {roleChangeTarget && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRoleChangeTarget(null)} />
            <div className="relative bg-white rounded-2xl shadow-4 p-6 w-full max-w-sm animate-scale-in">
              <h3 className="text-base font-bold text-text-primary mb-1">Change Role</h3>
              <p className="text-sm text-text-secondary mb-5">Update role for <span className="font-semibold">{roleChangeTarget.user_name}</span></p>
              <div className="space-y-2 mb-5">
                {Object.entries(ROLE_META).map(([key, meta]) => (
                  <button
                    key={key}
                    onClick={() => changeRole.mutate({ userID: roleChangeTarget.user_id, role: key })}
                    disabled={roleChangeTarget.role === key || changeRole.isPending}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                      roleChangeTarget.role === key ? `${meta.bg} border-current` : 'border-border hover:border-border-strong hover:bg-surface-2',
                      'disabled:opacity-60'
                    )}
                  >
                    <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center', meta.bg, meta.color)}>{meta.icon}</span>
                    <div>
                      <p className={cn('text-sm font-semibold', meta.color)}>{meta.label}</p>
                      <p className="text-xs text-text-tertiary">{meta.desc}</p>
                    </div>
                    {roleChangeTarget.role === key && <CheckCircle2 size={15} className="ml-auto text-primary" />}
                  </button>
                ))}
              </div>
              <Button variant="ghost" className="w-full" onClick={() => setRoleChangeTarget(null)}>Cancel</Button>
            </div>
          </div>
        )}

        {/* Remove member confirm */}
        <ConfirmModal
          open={!!removeTarget}
          onClose={() => setRemoveTarget(null)}
          onConfirm={() => removeTarget && removeMember.mutate(removeTarget.user_id)}
          title="Remove member?"
          description={`${removeTarget?.user_name} will lose access to this organization and all its tasks.`}
          confirmLabel="Remove"
          variant="danger"
          loading={removeMember.isPending}
        />
      </div>
    </Layout>
  )
}
