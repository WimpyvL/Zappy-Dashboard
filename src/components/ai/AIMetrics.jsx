import React from 'react';
import { useAIMetrics } from '../../apis/ai/hooks';
import { RefreshCw, BarChart, PieChart } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';

/**
 * AIMetrics component
 * 
 * Displays metrics and analytics for AI usage including:
 * - Total prompts and logs
 * - Usage by category
 * - Daily usage trends
 * - Token consumption
 */
const AIMetrics = () => {
  const { data: metrics, isLoading, error, refetch } = useAIMetrics();
  
  // Colors for charts
  const COLORS = ['#4F46E5', '#F85C5C', '#22C55E', '#F59E0B', '#8B5CF6'];
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <p className="ml-3 text-gray-600">Loading AI metrics...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg">
        <h3 className="font-medium">Error Loading Metrics</h3>
        <p>{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 px-4 py-2 bg-white border border-red-300 rounded-md text-red-600 hover:bg-red-50"
        >
          <RefreshCw className="h-4 w-4 inline mr-2" />
          Retry
        </button>
      </div>
    );
  }
  
  // If no metrics data yet
  if (!metrics) {
    return (
      <div className="p-6 bg-gray-50 text-gray-600 rounded-lg text-center">
        <p>No AI metrics data available yet.</p>
        <p className="text-sm mt-2">Metrics will appear here once AI features are used.</p>
      </div>
    );
  }
  
  // Format category data for pie chart
  const categoryData = Object.entries(metrics.categoryCounts || {}).map(([name, value]) => ({
    name,
    value
  }));
  
  // Format daily data for bar chart
  const dailyData = Object.entries(metrics.dailyData || {}).map(([date, data]) => ({
    date,
    count: data.count,
    tokens: data.tokens
  })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-14); // Last 14 days
  
  // Format dates for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Prompts</h3>
          <p className="text-3xl font-bold mt-2">{metrics.totalPrompts || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total API Calls</h3>
          <p className="text-3xl font-bold mt-2">{metrics.totalLogs || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Tokens Used</h3>
          <p className="text-3xl font-bold mt-2">{metrics.totalTokens || 0}</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-accent3" />
            Usage by Category
          </h3>
          
          {categoryData.length > 0 ? (
            <div className="h-64 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categoryData.map((category, index) => {
                    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
                    const percentage = ((category.value / total) * 100).toFixed(1);
                    
                    return (
                      <tr key={`category-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.value} calls</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{percentage}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No category data available
            </div>
          )}
        </div>
        
        {/* Daily Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <BarChart className="h-5 w-5 mr-2 text-accent1" />
            Daily Usage (Last 14 Days)
          </h3>
          
          {dailyData.length > 0 ? (
            <div className="h-64 overflow-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">API Calls</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dailyData.map((day, index) => (
                    <tr key={`day-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatDate(day.date)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.count}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No daily usage data available
            </div>
          )}
        </div>
      </div>
      
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Metrics
        </button>
      </div>
    </div>
  );
};

export default AIMetrics;
