import React from 'react';
import { Link } from 'react-router-dom';
import { Edit } from 'lucide-react';

const PatientTable = ({
  patients = [],
  tags = [],
  selectedPatients = [],
  allSelected,
  onSelectPatient,
  onSelectAll,
  onEditPatient,
  loading,
  error,
}) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="flex justify-center mb-2"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div></div>
        <p className="text-sm text-gray-500">Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-500">
        Error loading patients: {error.message || 'Unknown error'}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        No patients found matching your criteria.
      </div>
    );
  }

  const getTagById = (id) => tags.find(t => t.id === id);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="pl-6 py-3 text-left" scope="col">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={allSelected}
                  onChange={onSelectAll}
                  aria-label="Select all patients"
                />
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tags</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription Plan</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Appointment</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {patients.map((patient) => (
            <tr key={patient.id} className="hover:bg-gray-50">
              <td className="pl-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  checked={selectedPatients.includes(patient.id)}
                  onChange={() => onSelectPatient(patient.id)}
                  aria-labelledby={`patient-name-${patient.id}`}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <Link
                      id={`patient-name-${patient.id}`}
                      to={`/patients/${patient.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-900 hover:underline"
                    >
                      {`${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unnamed Patient'}
                    </Link>
                    <div className="text-sm text-gray-500">{patient.email || <span className="text-xs text-gray-400">No email</span>}</div>
                    <div className="text-sm text-gray-500">{patient.mobile_phone || patient.phone || <span className="text-xs text-gray-400">No phone</span>}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1 max-w-xs"> {/* Added max-w-xs for tag wrapping */}
                  {Array.isArray(patient.related_tags) && patient.related_tags.length > 0 ? (
                    patient.related_tags.map((tagId) => {
                      const tag = getTagById(tagId);
                      return tag ? (
                        <span key={tag.id} className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800 whitespace-nowrap">
                          {tag.name}
                        </span>
                      ) : null;
                    })
                  ) : (
                    <span className="text-xs text-gray-400">No Tags</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {patient.subscriptionPlanName || <span className="text-xs text-gray-400">None</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {patient.next_session_date ? new Date(patient.next_session_date).toLocaleDateString() : <span className="text-xs text-gray-400">None scheduled</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {patient.doctor || <span className="text-xs text-gray-400">Not assigned</span>}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end">
                  <button
                    onClick={() => onEditPatient(patient)}
                    className="text-gray-500 hover:text-indigo-600 p-1 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    title="Edit Patient"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  {/* Add other row actions here if needed */}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
