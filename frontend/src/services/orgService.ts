import api from './api'

export interface Organization {
  id: string
  name: string
  slug: string
  logo_url?: string
  onboarding_status: 'incomplete' | 'complete' | 'skipped'
  onboarding_step: number
  created_at: string
}

export interface Member {
  id: string
  org_id: string
  user_id: string
  role: 'org_admin' | 'manager' | 'employee'
  user_name: string
  user_email: string
  created_at: string
}

export interface Invitation {
  id: string
  org_id: string
  email: string
  role: string
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  expires_at: string
  inviter_name?: string
}

export const orgService = {
  async createOrg(name: string, logoURL?: string): Promise<Organization> {
    const res = await api.post('/orgs', { name, logo_url: logoURL })
    return res.data.data
  },

  async getOrg(id: string): Promise<Organization> {
    const res = await api.get(`/orgs/${id}`)
    return res.data.data
  },

  async updateOrg(id: string, data: Partial<Organization>): Promise<Organization> {
    const res = await api.put(`/orgs/${id}`, data)
    return res.data.data
  },

  async listMembers(orgID: string): Promise<Member[]> {
    const res = await api.get(`/orgs/${orgID}/members`)
    return res.data.data
  },

  async removeMember(orgID: string, userID: string): Promise<void> {
    await api.delete(`/orgs/${orgID}/members/${userID}`)
  },

  async changeRole(orgID: string, userID: string, role: string): Promise<void> {
    await api.patch(`/orgs/${orgID}/members/${userID}/role`, { role })
  },

  async sendInvitation(orgID: string, email: string, role: string): Promise<Invitation> {
    const res = await api.post(`/orgs/${orgID}/invitations`, { email, role })
    return res.data.data
  },

  async listInvitations(orgID: string): Promise<Invitation[]> {
    const res = await api.get(`/orgs/${orgID}/invitations`)
    return res.data.data
  },

  async revokeInvitation(orgID: string, invID: string): Promise<void> {
    await api.delete(`/orgs/${orgID}/invitations/${invID}`)
  },

  async acceptInvitation(token: string): Promise<void> {
    await api.post('/orgs/accept-invitation', { token })
  },

  async updateOnboarding(orgID: string, status: string): Promise<Organization> {
    const res = await api.patch(`/orgs/${orgID}/onboarding`, { status })
    return res.data.data
  },
}
