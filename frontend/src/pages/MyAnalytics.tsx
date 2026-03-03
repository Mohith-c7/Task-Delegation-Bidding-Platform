import { useQuery } from '@tanstack/react-query';
import { analyticsService, UserAnalytics } from '../services/analyticsService';
import Layout from '../components/common/Layout';

const MyAnalytics = () => {
  const { data: analytics, isLoading } = useQuery<UserAnalytics>({
    queryKey: ['userAnalytics'],
    queryFn: analyticsService.getUserAnalytics,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading your analytics...</div>
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

  const performanceScore = (analytics.success_rate + analytics.on_time_rate) / 2;

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Performance</h1>

        {/* Performance Score */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg shadow-lg text-white">
          <div className="text-center">
            <div className="text-lg mb-2">Overall Performance Score</div>
            <div className="text-6xl font-bold mb-2">{performanceScore.toFixed(1)}%</div>
            <div className="text-sm opacity-90">
              Based on success rate and on-time delivery
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Tasks Posted</div>
            <div className="text-3xl font-bold text-gray-900">{analytics.tasks_posted}</div>
            <div className="text-sm text-gray-500 mt-2">
              {analytics.tasks_completed} completed
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Bids Placed</div>
            <div className="text-3xl font-bold text-gray-900">{analytics.bids_placed}</div>
            <div className="text-sm text-green-600 mt-2">
              {analytics.bids_won} won
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <div className="text-sm text-gray-600 mb-1">Success Rate</div>
            <div className="text-3xl font-bold text-gray-900">{analytics.success_rate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500 mt-2">
              Bid approval rate
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <div className="text-sm text-gray-600 mb-1">On-Time Rate</div>
            <div className="text-3xl font-bold text-gray-900">{analytics.on_time_rate.toFixed(1)}%</div>
            <div className="text-sm text-gray-500 mt-2">
              Delivered on time
            </div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* As Task Owner */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">As Task Owner</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="text-gray-700">Total Tasks Posted</span>
                <span className="text-2xl font-bold text-blue-600">{analytics.tasks_posted}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="text-gray-700">Tasks Completed</span>
                <span className="text-2xl font-bold text-green-600">{analytics.tasks_completed}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="text-gray-700">Completion Rate</span>
                <span className="text-2xl font-bold text-purple-600">
                  {analytics.tasks_posted > 0 
                    ? ((analytics.tasks_completed / analytics.tasks_posted) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* As Bidder */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">As Bidder</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="text-gray-700">Total Bids Placed</span>
                <span className="text-2xl font-bold text-blue-600">{analytics.bids_placed}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="text-gray-700">Bids Won</span>
                <span className="text-2xl font-bold text-green-600">{analytics.bids_won}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="text-gray-700">Win Rate</span>
                <span className="text-2xl font-bold text-purple-600">
                  {analytics.success_rate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded">
                <span className="text-gray-700">Avg Completion Time</span>
                <span className="text-2xl font-bold text-orange-600">
                  {analytics.average_completion_time_hours.toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Performance Insights</h2>
          <div className="space-y-3">
            {analytics.success_rate >= 70 ? (
              <div className="flex items-start p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-green-800">Excellent Success Rate!</div>
                  <div className="text-sm text-green-700">Your bid approval rate is above 70%. Keep up the great work!</div>
                </div>
              </div>
            ) : (
              <div className="flex items-start p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                <svg className="w-6 h-6 text-yellow-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-yellow-800">Room for Improvement</div>
                  <div className="text-sm text-yellow-700">Consider improving your bid proposals to increase your success rate.</div>
                </div>
              </div>
            )}

            {analytics.on_time_rate >= 80 ? (
              <div className="flex items-start p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-green-800">Reliable Delivery!</div>
                  <div className="text-sm text-green-700">You consistently deliver tasks on time. Task owners trust you!</div>
                </div>
              </div>
            ) : analytics.bids_won > 0 && (
              <div className="flex items-start p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-blue-800">Focus on Deadlines</div>
                  <div className="text-sm text-blue-700">Try to improve your on-time delivery rate to build more trust with task owners.</div>
                </div>
              </div>
            )}

            {analytics.bids_placed === 0 && analytics.tasks_posted === 0 && (
              <div className="flex items-start p-4 bg-gray-50 border-l-4 border-gray-500 rounded">
                <svg className="w-6 h-6 text-gray-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <div className="font-semibold text-gray-800">Get Started!</div>
                  <div className="text-sm text-gray-700">Start posting tasks or placing bids to see your performance metrics.</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MyAnalytics;
