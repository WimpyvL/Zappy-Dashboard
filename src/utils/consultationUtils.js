import React from 'react';
import { Calendar, Clock, CheckCircle, Archive } from 'lucide-react';

/**
 * Formats a date string into a human-readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(date);
  } catch (e) { return 'Invalid Date Format'; }
};

/**
 * Renders a status badge with appropriate styling based on the status
 * @param {string} status - The status to display
 * @returns {JSX.Element} - The styled status badge
 */
export const StatusBadge = ({ status }) => {
  const baseClasses = "flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full";
  let statusClasses = "";

  if (status === 'followup') {
    statusClasses = "bg-accent3/10 text-accent3";
  } else if (status === 'reviewed') {
    statusClasses = "bg-green-100 text-green-800";
  } else if (status === 'pending') {
    statusClasses = "bg-accent4/10 text-accent4";
  } else if (status === 'archived') {
    statusClasses = "bg-gray-100 text-gray-800";
  } else {
    statusClasses = "bg-gray-100 text-gray-800"; // Default for unknown status
  }

  return (
    <span className={`${baseClasses} ${statusClasses}`}>
      {status === 'followup' && <Calendar className="h-3 w-3 mr-1" />}
      {status === 'reviewed' && <CheckCircle className="h-3 w-3 mr-1" />}
      {status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
      {status === 'archived' && <Archive className="h-3 w-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)} {/* Capitalize first letter */}
    </span>
  );
};