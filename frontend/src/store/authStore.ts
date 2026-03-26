import { create } from 'zustand'
import { User } from '../services/authService'

export type OrgRole = 'org_admin' | 'manager' | 'employee'
export type SubscriptionTier = 'free' | 'pro' | 'enterprise'

interface AuthState {
  user: User | null
  token: string | null
  orgID: string | null
  role: OrgRole | null
  subscriptionTier: SubscriptionTier
  setAuth: (user: User, token: string, orgID?: string, role?: OrgRole, tier?: SubscriptionTier, refreshToken?: string) => void
  logout: () => void
  isAuthenticated: () => boolean
  setOrg: (orgID: string, role: OrgRole, tier?: SubscriptionTier) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('access_token'),
  orgID: localStorage.getItem('org_id'),
  role: (localStorage.getItem('org_role') as OrgRole) || null,
  subscriptionTier: (localStorage.getItem('subscription_tier') as SubscriptionTier) || 'free',

  setAuth: (user, token, orgID, role, tier = 'free', refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('access_token', token)
    if (refreshToken) localStorage.setItem('refresh_token', refreshToken)
    if (orgID) localStorage.setItem('org_id', orgID)
    if (role) localStorage.setItem('org_role', role)
    localStorage.setItem('subscription_tier', tier)
    set({ user, token, orgID: orgID || null, role: role || null, subscriptionTier: tier })
  },
  setOrg: (orgID, role, tier = 'free') => {
    localStorage.setItem('org_id', orgID)
    localStorage.setItem('org_role', role)
    localStorage.setItem('subscription_tier', tier)
    set({ orgID, role, subscriptionTier: tier })
  },

  logout: () => {
    localStorage.removeItem('user')
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('org_id')
    localStorage.removeItem('org_role')
    localStorage.removeItem('subscription_tier')
    set({ user: null, token: null, orgID: null, role: null, subscriptionTier: 'free' })
  },

  isAuthenticated: () => !!get().token,
}))
