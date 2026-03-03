import api from './api';

export interface AnalyticsSummary {
  total_tasks: number;
  open_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  total_bids: number;
  average_completion_time_hours: number;
  task_completion_rate: number;
  tasks_by_priority: Record<string, number>;
  tasks_by_status: Record<string, number>;
}

export interface TaskTrend {
  date: string;
  created: number;
  completed: number;
}

export interface BidderPerformance {
  bidder_id: string;
  bidder_name: string;
  bidder_email: string;
  total_bids: number;
  approved_bids: number;
  completed_tasks: number;
  success_rate: number;
  average_completion_time_hours: number;
  on_time_completions: number;
  late_completions: number;
}

export interface TaskOwnerStats {
  owner_id: string;
  owner_name: string;
  owner_email: string;
  tasks_posted: number;
  tasks_completed: number;
  average_bids_per_task: number;
}

export interface SkillDemand {
  skill: string;
  task_count: number;
  bid_count: number;
}

export interface AnalyticsResponse {
  summary: AnalyticsSummary;
  task_trends: TaskTrend[];
  top_bidders: BidderPerformance[];
  top_task_owners: TaskOwnerStats[];
  skill_demands: SkillDemand[];
  generated_at: string;
}

export interface UserAnalytics {
  user_id: string;
  tasks_posted: number;
  tasks_completed: number;
  bids_placed: number;
  bids_won: number;
  success_rate: number;
  average_completion_time_hours: number;
  on_time_rate: number;
}

export const analyticsService = {
  getDashboardAnalytics: async (days: number = 30): Promise<AnalyticsResponse> => {
    const response = await api.get(`/analytics/dashboard?days=${days}`);
    return response.data.data;
  },

  getUserAnalytics: async (): Promise<UserAnalytics> => {
    const response = await api.get('/analytics/me');
    return response.data.data;
  },
};
