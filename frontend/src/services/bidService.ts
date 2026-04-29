import api from './api'

export interface Bid {
  id: string
  task_id: string
  task_title?: string
  bidder_id: string
  message: string
  estimated_completion: string
  status: 'pending' | 'approved' | 'rejected'
  answers?: Record<string, string>
  approved_by: string | null
  created_at: string
  updated_at: string
}

export interface BidWithDetails extends Bid {
  bidder_name: string
  bidder_email: string
  bidder_skills?: string[]
  bidder_avg_rating?: number
  bidder_total_bids?: number
  bidder_approved_bids?: number
  bidder_active_tasks?: number
  match_score?: number
  match_factors?: Record<string, number>
}

export interface CreateBidRequest {
  message: string
  estimated_completion: string
  answers?: Record<string, string>
}

export const bidService = {
  async placeBid(taskId: string, data: CreateBidRequest): Promise<Bid> {
    const response = await api.post(`/tasks/${taskId}/bids`, data)
    return response.data.data
  },

  async getTaskBids(taskId: string): Promise<BidWithDetails[]> {
    const response = await api.get(`/tasks/${taskId}/bids`)
    return response.data.data
  },

  async getMyBids(): Promise<Bid[]> {
    const response = await api.get('/bids/my')
    return response.data.data
  },

  async approveBid(bidId: string): Promise<void> {
    await api.patch(`/bids/${bidId}/approve`)
  },

  async rejectBid(bidId: string): Promise<void> {
    await api.patch(`/bids/${bidId}/reject`)
  },
}
