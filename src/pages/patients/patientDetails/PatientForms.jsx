// components/patients/components/PatientForms.jsx
import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import apiService from '../../../utils/apiService';
import LoadingSpinner from './common/LoadingSpinner';

const FormStatusBadge = ({ status }) => {
  return (
    <span
      className={`flex items-center px-2 py-1 text-xs font-medium rounded-full ${
        status === 'completed'
          ? 'bg-green-100 text-green-800'
          : status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : status === 'expired'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
      }`}
    >
      {status === 'completed' ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : status === 'pending' ? (
        <Clock className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const PatientForms = ({ patientId, forms, loading }) => {
  const [formFilter, setFormFilter] = useState('all');

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Filter forms based on status
  const filteredForms =
    formFilter === 'all'
      ? forms
      : forms.filter((form) => form.status === formFilter);

  // Send form reminder
  const handleSendFormReminder = async (formId) => {
    try {
      await apiService.post(
        `/api/v1/admin/patients/${patientId}/forms/${formId}/send_reminder`
      );
      toast.success('Reminder sent successfully');
    } catch (error) {
      console.error('Error sending form reminder:', error);
      toast.error('Failed to send reminder');
    }
  };

  // Resend form
  const handleResendForm = async (formId) => {
    try {
      await apiService.post(
        `/api/v1/admin/patients/${patientId}/forms/${formId}/resend`
      );
      toast.success('Form resent successfully');
    } catch (error) {
      console.error('Failed to resend form:', error);
      toast.error('Failed to resend form');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Patient Forms</h2>
        <div className="flex space-x-2">
          <select
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
            value={formFilter}
            onChange={(e) => setFormFilter(e.target.value)}
          >
            <option value="all">All Forms</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
          <button
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            onClick={() =>
              (window.location.href = `/patients/${patientId}/forms/new`)
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Send Form
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="small" />
      ) : filteredForms && filteredForms.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Form Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deadline
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completed
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredForms.map((form) => (
                <tr key={form.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {form.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(form.sentDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(form.deadlineDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <FormStatusBadge status={form.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.completedDate ? formatDate(form.completedDate) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {form.status === 'completed' ? (
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        View Responses
                      </button>
                    ) : (
                      <button
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                        onClick={() => handleSendFormReminder(form.id)}
                      >
                        Send Reminder
                      </button>
                    )}
                    <button
                      className="text-indigo-600 hover:text-indigo-900"
                      onClick={() => handleResendForm(form.id)}
                    >
                      Resend
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {formFilter === 'all'
            ? 'No forms have been sent to this patient.'
            : `No ${formFilter} forms found for this patient.`}
        </div>
      )}
    </div>
  );
};

export default PatientForms;
