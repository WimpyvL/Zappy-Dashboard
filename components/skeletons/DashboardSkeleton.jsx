import React from 'react';

const Shimmer = () => (
  <div className="animate-pulse">
    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="bg-white rounded-lg shadow p-6 h-full">
    <div className="animate-pulse">
      <div className="flex items-center mb-2">
        <div className="h-5 w-5 bg-gray-300 rounded mr-2"></div>
        <div className="h-4 bg-gray-300 rounded w-24"></div>
      </div>
      <div className="h-8 bg-gray-300 rounded w-16 mt-2"></div>
      <div className="h-3 bg-gray-300 rounded w-32 mt-2"></div>
    </div>
  </div>
);

const SessionItemSkeleton = () => (
  <li className="py-4">
    <div className="animate-pulse flex items-center">
      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300"></div>
      <div className="ml-4 flex-1">
        <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-300 rounded w-24"></div>
      </div>
      <div className="h-8 w-12 bg-gray-300 rounded ml-4"></div>
    </div>
  </li>
);

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-container relative overflow-hidden pb-10">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-48"></div>
        </div>
      </div>
      
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      
      {/* Two column layout skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Sessions skeleton */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="animate-pulse flex justify-between items-center">
              <div className="h-5 bg-gray-300 rounded w-32"></div>
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </div>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3].map(i => (
                <SessionItemSkeleton key={i} />
              ))}
            </ul>
          </div>
        </div>
        
        {/* Tasks skeleton */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="animate-pulse flex justify-between items-center">
              <div className="h-5 bg-gray-300 rounded w-24"></div>
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </div>
          </div>
          <div className="p-6">
            <ul className="divide-y divide-gray-200">
              {[1, 2, 3].map(i => (
                <li key={i} className="py-4">
                  <div className="animate-pulse flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gray-300"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Bottom section skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="animate-pulse flex justify-between items-center">
                <div className="h-5 bg-gray-300 rounded w-40"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
            <div className="p-6">
              <ul className="divide-y divide-gray-200">
                {[1, 2].map(j => (
                  <SessionItemSkeleton key={j} />
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
