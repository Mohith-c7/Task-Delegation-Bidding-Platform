import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Mail, CreditCard, Shield, UserMinus, Send, X, Crown, Briefcase, User } from 'lucide-react'
import Layout from '../components/common/Layout'
import { Button, Card, Badge, Input } from '../design-system'
import { useAuthStore } from '../store/authStore'
import { useRBAC } from '../hooks/useRBAC'
import { orgService, Member, Invitation } from '../services/orgService'
import { billingService, Subscription } from '../services/billingService'
import { cn } from '../design-system/utils'
import { useToast } from '../design-system'

type Tab = 'members' | 'invitations' | 'billing'

const roleIcons: Record<string, React.ReactNode> = {
  org_admin: <Crown className="w-3.5 h-3.5" />,
  manager: <Briefcase className="w-3.5 h-3.5" />,
  employee: <User className="w-3.5 h-3.5" />,
}

const roleColors: Record<string, string> = {
  org_admin: 'error', manager: 'warning', employee: 'default'
}

const tierColors: Record<string, string> = {
  free: 'default', pro: 'primary', enterprise: 'success'
}

export default function OrgSettings() {
  const [tab, setTab] = useState<Tab>('members')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('employee')
  const orgID = useAuthStore(s => s.orgID)
  const { isOrgAdmin, isManager } = useRBAC()
  const qc = useQueryClient()
  const { success: showSuccess, error: showError } = useToast()
  const showToast = (msg: string, type: 'success' | 'error') =>
    type === 'success' ? showSuccess(msg) : showError(msg)

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

  const removeMember = useMutation({
    mutationFn: (userID: string) => orgService.removeMember(orgID!, userID),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['members', orgID] }); showToast('Member removed', 'success') },
    onError: () => showToast('Failed to remove member', 'error'),
  })

  const sendInvite = useMutation({
    mutationFn: () => orgService.sendInvitation(orgID!, inviteEmail, inviteRole),
    onSuccess: () => {
      setInviteEmail('')
      qc.invalidateQueries({ queryKey: ['invitations', orgID] })
      showToast('Invitation sent', 'success')
    },
    onError: () => showToast('Failed to send invitation', 'error'),
  })

  const revokeInvite = useMutation({
    mutationFn: (invID: string) => orgService.revokeInvitation(orgID!, invID),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['invitations', orgID] }); showToast('Invitation revoked', 'success') },
  })

  const upgradeTier = useMutation({
    mutationFn: (tier: string) => billingService.updateTier(orgID!, tier),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscription', orgID] }); showToast('Plan updated', 'success') },
  })

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'members', label: 'Members', icon: <Users className="w-4 h-4" /> },
    { id: 'invitations', label: 'Invitations', icon: <Mail className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-on-surface)]">Organization Settings</h1>
          <p className="text-[var(--color-on-surface-variant)] mt-1">Manage your team, invitations, and billing</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-[var(--color-surface-variant)] rounded-xl w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                tab === t.id
                  ? 'bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm'
                  : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
              )}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {/* Members Tab */}
        {tab === 'members' && (
          <Card className="overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-outline-variant)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--color-on-surface)]">Team Members</h2>
              <Badge variant="default">{members.length} members</Badge>
            </div>
            {loadingMembers ? (
              <div className="p-8 text-center text-[var(--color-on-surface-variant)]">Loading...</div>
            ) : (
              <div className="divide-y divide-[var(--color-outline-variant)]">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-primary-container)] flex items-center justify-center text-sm font-bold text-[var(--color-on-primary-container)] flex-shrink-0">
                      {m.user_name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">{m.user_name}</p>
                      <p className="text-xs text-[var(--color-on-surface-variant)] truncate">{m.user_email}</p>
                    </div>
                    <Badge variant={roleColors[m.role] as any} className="flex items-center gap-1">
                      {roleIcons[m.role]}{m.role.replace('_', ' ')}
                    </Badge>
                    {isOrgAdmin && (
                      <button
                        onClick={() => removeMember.mutate(m.user_id)}
                        className="p-1.5 rounded-lg hover:bg-[var(--color-error-container)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors"
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Invitations Tab */}
        {tab === 'invitations' && (
          <div className="space-y-4">
            {(isOrgAdmin || isManager) && (
              <Card className="p-5">
                <h2 className="font-semibold text-[var(--color-on-surface)] mb-4">Send Invitation</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="flex-1"
                  />
                  <select
                    value={inviteRole}
                    onChange={e => setInviteRole(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-[var(--color-outline)] bg-[var(--color-surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Manager</option>
                    {isOrgAdmin && <option value="org_admin">Admin</option>}
                  </select>
                  <Button
                    onClick={() => sendInvite.mutate()}
                    disabled={!inviteEmail || sendInvite.isPending}
                    className="flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Send
                  </Button>
                </div>
              </Card>
            )}

            <Card className="overflow-hidden">
              <div className="px-5 py-4 border-b border-[var(--color-outline-variant)]">
                <h2 className="font-semibold text-[var(--color-on-surface)]">Pending Invitations</h2>
              </div>
              {loadingInvitations ? (
                <div className="p-8 text-center text-[var(--color-on-surface-variant)]">Loading...</div>
              ) : invitations.filter(i => i.status === 'pending').length === 0 ? (
                <div className="p-8 text-center text-[var(--color-on-surface-variant)]">No pending invitations</div>
              ) : (
                <div className="divide-y divide-[var(--color-outline-variant)]">
                  {invitations.filter(i => i.status === 'pending').map(inv => (
                    <div key={inv.id} className="flex items-center gap-4 px-5 py-3">
                      <Mail className="w-4 h-4 text-[var(--color-on-surface-variant)] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-on-surface)] truncate">{inv.email}</p>
                        <p className="text-xs text-[var(--color-on-surface-variant)]">Expires {new Date(inv.expires_at).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={roleColors[inv.role] as any}>{inv.role}</Badge>
                      {isOrgAdmin && (
                        <button
                          onClick={() => revokeInvite.mutate(inv.id)}
                          className="p-1.5 rounded-lg hover:bg-[var(--color-error-container)] text-[var(--color-on-surface-variant)] hover:text-[var(--color-error)] transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Billing Tab */}
        {tab === 'billing' && (
          <div className="space-y-4">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-[var(--color-on-surface)]">Current Plan</h2>
                {subscription && <Badge variant={tierColors[subscription.tier] as any} className="text-sm px-3 py-1">{subscription.tier.toUpperCase()}</Badge>}
              </div>
              {subscription && (
                <div className="text-sm text-[var(--color-on-surface-variant)] space-y-1">
                  <p>Started: {new Date(subscription.started_at).toLocaleDateString()}</p>
                  {subscription.renews_at && <p>Renews: {new Date(subscription.renews_at).toLocaleDateString()}</p>}
                </div>
              )}
            </Card>

            {isOrgAdmin && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { tier: 'free', label: 'Free', price: '$0/mo', features: ['5 members', '20 tasks', 'Basic analytics'] },
                  { tier: 'pro', label: 'Pro', price: '$29/mo', features: ['50 members', 'Unlimited tasks', 'Advanced analytics', 'Trends'] },
                  { tier: 'enterprise', label: 'Enterprise', price: '$99/mo', features: ['Unlimited members', 'Unlimited tasks', 'Full analytics', 'CSV export', 'Audit log'] },
                ].map(plan => (
                  <Card
                    key={plan.tier}
                    className={cn('p-5 cursor-pointer transition-all', subscription?.tier === plan.tier && 'ring-2 ring-[var(--color-primary)]')}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-[var(--color-on-surface)]">{plan.label}</h3>
                      {subscription?.tier === plan.tier && <Badge variant="primary">Current</Badge>}
                    </div>
                    <p className="text-2xl font-bold text-[var(--color-primary)] mb-3">{plan.price}</p>
                    <ul className="space-y-1 mb-4">
                      {plan.features.map(f => (
                        <li key={f} className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1.5">
                          <Shield className="w-3 h-3 text-[var(--color-primary)]" />{f}
                        </li>
                      ))}
                    </ul>
                    {subscription?.tier !== plan.tier && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full"
                        onClick={() => upgradeTier.mutate(plan.tier)}
                        disabled={upgradeTier.isPending}
                      >
                        {subscription && ['pro', 'enterprise'].indexOf(plan.tier) > ['pro', 'enterprise'].indexOf(subscription.tier) ? 'Upgrade' : 'Downgrade'}
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}
