import React, { useState } from 'react';
import { useAILogs } from '../../apis/ai/hooks';
import { Search, RefreshCw, ChevronDown, ChevronUp, Download, ExternalLink } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import Pagination from '../ui/Pagination';

/**
 * AILogs component
 * 
 * Displays logs of AI API calls with filtering and pagination
 * Shows input/output, tokens used, and status
 */
const AILogs = () => {
  const [filters, setFilters] = useState({
    status: 'all',
    promptId: '',
    userId: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  
  const [page, setPage] = useState(1);
  const [expandedLogId, setExpandedLogId] = useState(null);
  
  const { data, isLoading, error, refetch } = useAILogs({
    ...filters,
    page,
    limit: 10
  });
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filters change
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    refetch();
  };
  
  const toggleExpand = (logId) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const downloadLog = (log) => {
    const logData = {
      id: log.id,
      prompt_id: log.prompt_id,
      user_id: log.user_id,
      input: log.input,
      output: log.output,
      tokens_used: log.tokens_used,
      duration_ms: log.duration_ms,
      status: log.status,
      error: log.error,
      created_at: log.created_at
    };
    
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-log-${log.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
        <p className="ml-3 text-gray-600">Loading AI logs...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-lg">
        <h3 className="font-medium">Error Loading Logs</h3>
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
  
  const logs = data?.logs || [];
  const totalPages = data?.totalPages || 1;
  
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Filter Logs</h3>
        
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="processing">Processing</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prompt ID
            </label>
            <input
              type="text"
              name="promptId"
              value={filters.promptId}
              onChange={handleFilterChange}
              placeholder="Filter by prompt ID"
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User ID
            </label>
            <input
              type="text"
              name="userId"
              value={filters.userId}
              onChange={handleFilterChange}
              placeholder="Filter by user ID"
              className="w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="flex">
              <input
                type="text"
                name="searchTerm"
                value={filters.searchTerm}
                onChange={handleFilterChange}
                placeholder="Search in inputs/outputs"
                className="flex-1 border border-gray-300 rounded-l-md shadow-sm p-2"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 rounded-r-md hover:bg-blue-700"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
      </div>
      
      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium">AI Logs</h3>
          <p className="text-sm text-gray-500">Showing {logs.length} of {data?.totalLogs || 0} logs</p>
        </div>
        
        {logs.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No logs found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Prompt
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map(log => (
                  <React.Fragment key={log.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(log.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {log.prompt_name || 'Unknown Prompt'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.tokens_used || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {log.duration_ms ? `${log.duration_ms}ms` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>
                          {log.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleExpand(log.id)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                          title={expandedLogId === log.id ? "Collapse" : "Expand"}
                        >
                          {expandedLogId === log.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => downloadLog(log)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Download Log"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                    
                    {/* Expanded Row */}
                    {expandedLogId === log.id && (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 bg-gray-50">
                          <div className="space-y-4">
                            {/* Input */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Input:</h4>
                              <div className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                                <pre className="whitespace-pre-wrap">{JSON.stringify(log.input, null, 2)}</pre>
                              </div>
                            </div>
                            
                            {/* Output */}
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Output:</h4>
                              <div className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-40">
                                <pre className="whitespace-pre-wrap">{log.output}</pre>
                              </div>
                            </div>
                            
                            {/* Error (if any) */}
                            {log.error && (
                              <div>
                                <h4 className="text-sm font-medium text-red-700 mb-1">Error:</h4>
                                <div className="bg-red-50 p-3 rounded text-sm text-red-700 overflow-auto max-h-40">
                                  <pre className="whitespace-pre-wrap">{log.error}</pre>
                                </div>
                              </div>
                            )}
                            
                            {/* Details */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium text-gray-700">Log ID:</span> {log.id}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Prompt ID:</span> {log.prompt_id || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">User ID:</span> {log.user_id || 'N/A'}
                              </div>
                              <div>
                                <span className="font-medium text-gray-700">Created:</span> {formatDate(log.created_at)}
                              </div>
                            </div>
                            
                            {/* View in Dashboard Link */}
                            <div className="flex justify-end">
                              <button
                                onClick={() => window.open(`/admin/ai-logs/${log.id}`, '_blank')}
                                className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
                              >
                                View Full Details <ExternalLink className="h-4 w-4 ml-1" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
      
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 flex items-center"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Logs
        </button>
      </div>
    </div>
  );
};

export default AILogs;
