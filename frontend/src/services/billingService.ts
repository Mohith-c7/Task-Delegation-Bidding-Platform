import api from './api'

export interface Subscription {
  id: string
  org_id: string
  tier: 'free' | 'pro' | 'enterprise'
  started_at: string
  renews_at?: string
}

export const billingService = {
  async getSubscription(orgID: string): Promise<Subscription> {
    const res = await api.get(`/orgs/${orgID}/billing/subscription`)
    return res.data.data
  },

  async updateTier(orgID: string, tier: string): Promise<Subscription> {
    const res = await api.put(`/orgs/${orgID}/billing/subscription`, { tier })
    return res.data.data
  },
}
