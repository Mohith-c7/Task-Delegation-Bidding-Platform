import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsService, AnalyticsResponse } from '../services/analyticsService';
import Layout from '../components/common/Layout';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [days, setDays] = useState(30);

  const { data: analytics, isLoading, refetch } = useQuery<AnalyticsResponse>({
    queryKey: ['analytics', days],
    queryFn: () => analyticsService.getDashboardAnalytics(days),
  });

  useEffect(() => {
    refetch();
  }, [days, refetch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading analytics...</div>
        </div>
      </Layout>
    );
  }

  if (!analytics) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-red-600">Failed to load analytics</div>
        </div>
      </Layout>
    );
  }

  const { summary, task_trends, top_bidders, top_task_owners, skill_demands } = analytics;

  // Task Trends Chart Data
  const trendChartData = {
    labels: task_trends.map(t => new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
    datasets: [
      {
        label: 'Tasks Created',
        data: task_trends.map(t => t.created),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Tasks Completed',
        data: task_trends.map(t => t.completed),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Priority Distribution Chart
  const priorityChartData = {
    labels: Object.keys(summary.tasks_by_priority).map(p => p.charAt(0).toUpperCase() + p.slice(1)),
    datasets: [
      {
        data: Object.values(summary.tasks_by_priority),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
      },
    ],
  };

  // Status Distribution Chart
  const statusChartData = {
    labels: Object.keys(summary.tasks_by_status).map(s => s.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())),
    datasets: [
      {
        data: Object.values(summary.tasks_by_status),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  // Skill Demand Chart
  const skillChartData = {
    labels: skill_demands.map(s => s.skill),
    datasets: [
      {
        label: 'Tasks',
        data: skill_demands.map(s => s.task_count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Bids',
        data: skill_demands.map(s => s.bid_count),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Tasks</div>
            <div className="text-3xl font-bold text-gray-900">{summary.total_tasks}</div>
            <div className="text-sm text-green-600 mt-2">
              {summary.task_completion_rate.toFixed(1)}% completion rate
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 mb-1">Open Tasks</div>
            <div className="text-3xl font-bold text-blue-600">{summary.open_tasks}</div>
            <div className="text-sm text-gray-500 mt-2">Available for bidding</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 mb-1">Completed Tasks</div>
            <div className="text-3xl font-bold text-green-600">{summary.completed_tasks}</div>
            <div className="text-sm text-gray-500 mt-2">Successfully finished</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-sm text-gray-600 mb-1">Total Bids</div>
            <div className="text-3xl font-bold text-purple-600">{summary.total_bids}</div>
            <div className="text-sm text-gray-500 mt-2">
              Avg: {summary.average_completion_time_hours.toFixed(1)}h completion
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Task Trends */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Task Trends</h2>
            <Line data={trendChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>

          {/* Priority Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tasks by Priority</h2>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut data={priorityChartData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tasks by Status</h2>
            <div className="flex justify-center">
              <div className="w-64 h-64">
                <Doughnut data={statusChartData} options={{ responsive: true, maintainAspectRatio: true }} />
              </div>
            </div>
          </div>

          {/* Skill Demand */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Top Skills in Demand</h2>
            <Bar data={skillChartData} options={{ responsive: true, maintainAspectRatio: true }} />
          </div>
        </div>

        {/* Top Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Bidders */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Top Bidders</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Bids</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Success</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {top_bidders.slice(0, 5).map((bidder) => (
                    <tr key={bidder.bidder_id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{bidder.bidder_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bidder.total_bids}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-green-600 font-medium">{bidder.success_rate.toFixed(1)}%</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{bidder.completed_tasks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Task Owners */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Top Task Owners</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Posted</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Avg Bids</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {top_task_owners.slice(0, 5).map((owner) => (
                    <tr key={owner.owner_id}>
                      <td className="px-4 py-3 text-sm text-gray-900">{owner.owner_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{owner.tasks_posted}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{owner.tasks_completed}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{owner.average_bids_per_task.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Analytics;
