import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  // Common patient statuses
  if (status === 'active') {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        Active
      </span>
    );
  } else if (status === 'inactive') {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        Inactive
      </span>
    );
  } else if (status === 'suspended') {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        Suspended
      </span>
    );
  } else if (status === 'pending') {
    return (
      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
        Pending
      </span>
    );
  } else if (status === 'approved' || status === 'completed') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  } else if (status === 'denied' || status === 'rejected' || status === 'failed') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
        <XCircle className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  }
  
  // Default for unhandled statuses
  return (
    <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
      {typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
    </span>
  );
};

export default StatusBadge;
