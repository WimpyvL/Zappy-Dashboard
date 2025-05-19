import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
  const baseClasses = "flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full"; // Adjusted padding and font size
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
    <div className="bg-white shadow overflow-hidden rounded-lg overflow-x-auto border border-gray-200"> {/* Added border */}
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100"> {/* Changed header background */}
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Patient / Email</th> {/* Adjusted padding, text color */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date Submitted</th> {/* Adjusted padding, text color */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Service</th> {/* Adjusted padding, text color */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Draft Date</th> {/* Adjusted padding, text color */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Provider</th> {/* Adjusted padding, text color */}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th> {/* Adjusted padding, text color */}
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th> {/* Adjusted padding, text color */}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {isLoading ? (
            <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">Loading...</td></tr> // Adjusted padding
          ) : consultations.length > 0 ? (
            consultations.map((consultation) => (
              <tr key={consultation.id} className="hover:bg-gray-50 transition-colors duration-150"> {/* Added transition */}
                <td className="px-6 py-4 whitespace-nowrap"> {/* Adjusted padding */}
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-9 w-9 rounded-full bg-accent1/10 flex items-center justify-center text-accent1 mr-3"> {/* Adjusted size and margin */}
                      <User className="h-5 w-5" /> {/* Adjusted icon size */}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        <Link to={`/patients/${consultation.patient_id}`} className="hover:text-primary transition-colors duration-150">{consultation.patientName || 'N/A'}</Link> {/* Added transition */}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{consultation.email || '-'}</div> {/* Adjusted text color */}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(consultation.submitted_at)}</td> {/* Adjusted padding, text color */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consultation.service || '-'}</td> {/* Adjusted padding, text color */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(consultation.draftDate)}</td> {/* Adjusted padding, text color */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consultation.provider || '-'}</td> {/* Adjusted padding, text color */}
                <td className="px-6 py-4 whitespace-nowrap"> {/* Adjusted padding */}
                  <StatusBadge status={consultation.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"> {/* Adjusted padding */}
                  <div className="relative flex justify-end items-center"> {/* Added items-center */}
                    {consultation.status !== 'reviewed' && (
                      <button className="text-primary hover:text-primary/80 mr-4 transition-colors duration-150" onClick={() => onViewConsultation(consultation)}>Review</button>
                    )}
                    <div className="relative">
                      <button
                        className="text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors duration-150 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                        aria-label="More actions"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionDropdown(showActionDropdown === consultation.id ? null : consultation.id);
                        }}
                        disabled={isMutatingStatus}
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                      {showActionDropdown === consultation.id && (
                        <div className="absolute w-48 rounded-lg border border-gray-200 shadow-xl bg-white z-[100]" style={{
                          top: '-50px',
                          right: '100%',
                          marginRight: '10px',
                        }}>
                          <div className="py-2" role="menu" aria-orientation="vertical">
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
            <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No consultations found matching your criteria.</td></tr> // Adjusted padding
          )}
        </tbody>
      </table>
    </div>
  );
};

ConsultationListTable.propTypes = {
  consultations: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      patient_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      patientName: PropTypes.string,
      email: PropTypes.string,
      submitted_at: PropTypes.string,
      service: PropTypes.string,
      draftDate: PropTypes.string,
      provider: PropTypes.string,
      status: PropTypes.string,
    })
  ).isRequired,
  isLoading: PropTypes.bool,
  onViewConsultation: PropTypes.func.isRequired,
  onSendEmail: PropTypes.func.isRequired,
  onArchive: PropTypes.func.isRequired,
  onUpdateStatus: PropTypes.func.isRequired,
  isMutatingStatus: PropTypes.bool,
};

export default ConsultationListTable;
