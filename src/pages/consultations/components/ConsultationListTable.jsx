import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FixedSizeList as List } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  User,
  MoreHorizontal,
  Edit,
  Calendar,
  Archive,
  Clock,
  CheckCircle,
} from 'lucide-react';

// Import shared utilities
import { StatusBadge, formatDate } from '../../../utils/consultationUtils';

// Memoized table row component for better performance
const ConsultationRow = memo(({ 
  consultation, 
  onViewConsultation, 
  onSendEmail, 
  onArchive, 
  onUpdateStatus, 
  isMutatingStatus,
  showActionDropdown,
  toggleActionDropdown
}) => {
  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-9 w-9 rounded-full bg-accent1/10 flex items-center justify-center text-accent1 mr-3">
            <User className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              <Link to={`/patients/${consultation.patient_id}`} className="hover:text-primary transition-colors duration-150">
                {consultation.patientName || 'N/A'}
              </Link>
            </div>
            <div className="text-xs text-gray-600 mt-1">{consultation.email || '-'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(consultation.submitted_at)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consultation.service || '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(consultation.draftDate)}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{consultation.provider || '-'}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <StatusBadge status={consultation.status} />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="relative flex justify-end items-center">
          {consultation.status !== 'reviewed' && (
            <button 
              className="text-primary hover:text-primary/80 mr-4 transition-colors duration-150" 
              onClick={() => onViewConsultation(consultation)}
            >
              Review
            </button>
          )}
          <div className="relative">
            <button
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors duration-150 p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label="More actions"
              onClick={(e) => {
                e.stopPropagation();
                toggleActionDropdown(consultation.id);
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
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onViewConsultation(consultation, true); 
                      toggleActionDropdown(null); 
                    }} 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                  >
                    <Edit className="h-4 w-4 mr-2 text-gray-500" /> Edit
                  </button>
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      onSendEmail(consultation); 
                      toggleActionDropdown(null); 
                    }} 
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                    role="menuitem"
                  >
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" /> Mark for Follow-up
                  </button>
                  {consultation.status !== 'archived' && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onArchive(consultation); 
                        toggleActionDropdown(null); 
                      }} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                      role="menuitem"
                    >
                      <Archive className="h-4 w-4 mr-2 text-gray-500" /> Archive
                    </button>
                  )}
                  {consultation.status !== 'pending' && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onUpdateStatus(consultation, 'pending'); 
                        toggleActionDropdown(null); 
                      }} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                      role="menuitem"
                    >
                      <Clock className="h-4 w-4 mr-2 text-gray-500" /> Mark as Pending
                    </button>
                  )}
                  {consultation.status !== 'reviewed' && (
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        onUpdateStatus(consultation, 'reviewed'); 
                        toggleActionDropdown(null); 
                      }} 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left" 
                      role="menuitem"
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-gray-500" /> Mark as Reviewed
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
});

ConsultationRow.displayName = 'ConsultationRow';

// Virtualized row renderer for large datasets
const VirtualizedTable = memo(({ 
  consultations, 
  onViewConsultation, 
  onSendEmail, 
  onArchive, 
  onUpdateStatus, 
  isMutatingStatus,
  showActionDropdown,
  toggleActionDropdown
}) => {
  const Row = useCallback(({ index, style }) => {
    const consultation = consultations[index];
    return (
      <div style={style} className="border-b border-gray-200">
        <table className="min-w-full">
          <tbody>
            <ConsultationRow
              consultation={consultation}
              onViewConsultation={onViewConsultation}
              onSendEmail={onSendEmail}
              onArchive={onArchive}
              onUpdateStatus={onUpdateStatus}
              isMutatingStatus={isMutatingStatus}
              showActionDropdown={showActionDropdown}
              toggleActionDropdown={toggleActionDropdown}
            />
          </tbody>
        </table>
      </div>
    );
  }, [consultations, onViewConsultation, onSendEmail, onArchive, onUpdateStatus, isMutatingStatus, showActionDropdown, toggleActionDropdown]);

  Row.displayName = 'VirtualizedRow';

  return (
    <div className="flex-1 min-h-[400px]">
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            itemCount={consultations.length}
            itemSize={80} // Adjust based on your row height
            width={width}
          >
            {Row}
          </List>
        )}
      </AutoSizer>
    </div>
  );
});

VirtualizedTable.displayName = 'VirtualizedTable';

const ConsultationListTable = ({
  consultations,
  isLoading,
  onViewConsultation,
  onSendEmail,
  onArchive,
  onUpdateStatus,
  isMutatingStatus,
}) => {
  const [showActionDropdown, setShowActionDropdown] = useState(null);

  const toggleActionDropdown = useCallback((id) => {
    setShowActionDropdown(prev => prev === id ? null : id);
  }, []);

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = () => {
      if (showActionDropdown) {
        setShowActionDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showActionDropdown]);

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">Loading consultations...</p>
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6 text-center">
        <p className="text-gray-500">No consultations found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Patient / Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Date Submitted</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Service</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Draft Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Provider</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
      </table>

      {/* Use virtualization for large datasets */}
      {consultations.length > 20 ? (
        <div className="h-[600px]">
          <VirtualizedTable
            consultations={consultations}
            onViewConsultation={onViewConsultation}
            onSendEmail={onSendEmail}
            onArchive={onArchive}
            onUpdateStatus={onUpdateStatus}
            isMutatingStatus={isMutatingStatus}
            showActionDropdown={showActionDropdown}
            toggleActionDropdown={toggleActionDropdown}
          />
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <tbody className="bg-white divide-y divide-gray-200">
            {consultations.map((consultation) => (
              <ConsultationRow
                key={consultation.id}
                consultation={consultation}
                onViewConsultation={onViewConsultation}
                onSendEmail={onSendEmail}
                onArchive={onArchive}
                onUpdateStatus={onUpdateStatus}
                isMutatingStatus={isMutatingStatus}
                showActionDropdown={showActionDropdown}
                toggleActionDropdown={toggleActionDropdown}
              />
            ))}
          </tbody>
        </table>
      )}
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

export default memo(ConsultationListTable);
