import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';

const PatientListFilters = ({
  searchTerm,
  setSearchTerm,
  searchType,
  setSearchType,
  statusFilter,
  setStatusFilter,
  tagFilter,
  setTagFilter,
  subscriptionPlanFilter,
  setSubscriptionPlanFilter,
  tags = [], // Default to empty array
  uniquePlanNames = [], // Default to empty array
  onResetFilters,
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {/* Basic Filters: Search and Status */}
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder={`Search patients by ${searchType}...`}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="order">Order #</option> {/* Keep if relevant */}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="blacklisted">Blacklisted</option>
            <option value="pending">Pending</option>
          </select>
        </div>
        <button
          className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
        >
          {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Tag:</span>
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
            >
              <option value="all">All Tags</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Plan:</span>
            <select
              className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={subscriptionPlanFilter}
              onChange={(e) => setSubscriptionPlanFilter(e.target.value)}
            >
              <option value="all">All Plans</option>
              {uniquePlanNames.map((planName) => (
                <option key={planName} value={planName}>{planName}</option>
              ))}
              <option value="none">No Plan</option>
            </select>
          </div>
          {/* Add other advanced filters here if needed */}
          <div className="flex items-center space-x-2 ml-auto">
            <button
              className="px-3 py-1 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50"
              onClick={onResetFilters}
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientListFilters;
