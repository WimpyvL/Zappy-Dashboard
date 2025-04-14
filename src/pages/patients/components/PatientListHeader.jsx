import React from 'react';
import { Plus, X, Ban, UserCheck, Calendar } from 'lucide-react';

const PatientListHeader = ({
  showBulkActions,
  selectedCount,
  onAddPatientClick,
  onClearSelection,
  // Add handlers for bulk actions if/when implemented
  // onSuspendClick,
  // onActivateClick,
  // onScheduleClick,
}) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Patients</h1>
      <div className="flex space-x-3">
        {showBulkActions && (
          <div className="bg-white rounded-md shadow px-4 py-2 flex items-center">
            <span className="text-sm font-medium text-gray-600 mr-3">
              {selectedCount} selected
            </span>
            {/* Placeholder buttons for bulk actions */}
            <button className="text-red-600 hover:text-red-900 text-sm font-medium mx-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <Ban className="h-4 w-4 mr-1" /> Suspend
            </button>
            <button className="text-green-600 hover:text-green-900 text-sm font-medium mx-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <UserCheck className="h-4 w-4 mr-1" /> Activate
            </button>
            <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium mx-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed" disabled>
              <Calendar className="h-4 w-4 mr-1" /> Schedule Follow-up
            </button>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClearSelection} title="Clear Selection">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700"
          onClick={onAddPatientClick}
        >
          <Plus className="h-5 w-5 mr-2" /> Add Patient
        </button>
      </div>
    </div>
  );
};

export default PatientListHeader;
