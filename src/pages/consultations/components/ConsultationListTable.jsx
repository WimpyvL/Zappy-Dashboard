import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  CheckCircle,
  Archive,
  User,
  MoreHorizontal,
  Edit,
} from 'lucide-react';

// StatusBadge component (copied from InitialConsultations.js, consider moving to shared UI)
const StatusBadge = ({ status }) => {
  if (status === 'followup') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-accent3/10 text-accent3">
        <Calendar className="h-3 w-3 mr-1" />
        Follow-up
      </span>
    );
  } else if (status === 'reviewed') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
        <CheckCircle className="h-3 w-3 mr-1" />
        Reviewed
      </span>
    );
  } else if (status === 'pending') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-accent4/10 text-accent4">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </span>
    );
  } else if (status === 'archived') {
    return (
      <span className="flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
        <Archive className="h-3 w-3 mr-1" />
        Archived
      </span>
    );
  }
  return null;
};

// Format date function (copied from InitialConsultations.js, consider moving to utils)
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    }).format(date);
  } catch (e) { return 'Invalid Date Format'; }
};

const ConsultationListTable = ({
  consultations,
  isLoading,
  onViewConsultation,
  onSendEmail,
  onArchive,
  onUpdateStatus,
  isMutatingStatus, // Pass mutation loading state
}) => {
  const [showActionDropdown, setShowActionDropdown] = useState(null); // Local state for dropdown visibility

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient / Email</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Submitted</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Draft Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr><td colSpan="7" className="px-4 py-4 text-center text-gray-500">Loading...</td></tr>
          ) : consultations.length > 0 ? (
            consultations.map((consultation) => (
              <tr key={consultation.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-accent1/10 flex items-center justify-center text-accent1"><User className="h-4 w-4" /></div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/patients/${consultation.patient_id}`} className="hover:text-primary">{consultation.patientName || 'N/A'}</Link>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{consultation.email || '-'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(consultation.submitted_at)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{consultation.service || '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(consultation.draftDate)}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{consultation.provider || '-'}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <StatusBadge status={consultation.status} />
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative flex justify-end">
                    {consultation.status !== 'reviewed' && (
                      <button className="text-primary hover:text-primary/80 mr-3" onClick={() => onViewConsultation(consultation)}>Review</button>
                    )}
                    <div className="relative">
                      <button
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionDropdown(showActionDropdown === consultation.id ? null : consultation.id);
                        }}
                        disabled={isMutatingStatus}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      {showActionDropdown === consultation.id && (
                        <div className="absolute w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-[100]" style={{ 
                          top: '-50px',
                          right: '100%',
                          marginRight: '10px'
                        }}>
                          <div className="py-1" role="menu" aria-orientation="vertical">
                            <button onClick={(e) => { e.stopPropagation(); onViewConsultation(consultation, true); setShowActionDropdown(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem">
                              <Edit className="h-4 w-4 mr-2 text-gray-500" /> Edit
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); onSendEmail(consultation); setShowActionDropdown(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" /> Mark for Follow-up
                            </button>
                            {consultation.status !== 'archived' && (
                              <button onClick={(e) => { e.stopPropagation(); onArchive(consultation); setShowActionDropdown(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem">
                                <Archive className="h-4 w-4 mr-2 text-gray-500" /> Archive
                              </button>
                            )}
                            {consultation.status !== 'pending' && (
                                <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(consultation, 'pending'); setShowActionDropdown(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem">
                                  <Clock className="h-4 w-4 mr-2 text-gray-500" /> Mark as Pending
                                </button>
                            )}
                             {consultation.status !== 'reviewed' && (
                                <button onClick={(e) => { e.stopPropagation(); onUpdateStatus(consultation, 'reviewed'); setShowActionDropdown(null); }} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" role="menuitem">
                                  <CheckCircle className="h-4 w-4 mr-2 text-gray-500" /> Mark as Reviewed
                                </button>
                            )}
                            {/* Add other status actions if needed */}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="7" className="px-4 py-4 text-center text-gray-500">No consultations found matching your criteria.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ConsultationListTable;
