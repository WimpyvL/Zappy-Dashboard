// components/patients/components/PatientForms.jsx
import React, { useState } from 'react';
import { Plus, CheckCircle, Clock, XCircle, Send, RefreshCw, Loader2 } from 'lucide-react'; 
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { useGetPatientForms, useSendFormReminder, useResendForm } from '../../../apis/forms/hooks'; // Import hooks
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

const PatientForms = ({ patientId }) => { 
  const navigate = useNavigate(); // Initialize useNavigate
  const [formFilter, setFormFilter] = useState('all');

  // Fetch patient forms using the hook
  const { data: forms, isLoading: loading, error } = useGetPatientForms(patientId);

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
      ? forms || [] // Handle potential undefined initial state from hook
      : (forms || []).filter((form) => form.status === formFilter);

  const sendReminderMutation = useSendFormReminder();
  const resendFormMutation = useResendForm();

  // Send form reminder
  const handleSendFormReminder = (formId) => {
    sendReminderMutation.mutate({ patientId, formId });
  };

  // Resend form
  const handleResendForm = (formId) => {
    resendFormMutation.mutate({ patientId, formId });
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
            onClick={() => navigate(`/patients/${patientId}/forms/new`)} // Use navigate
          >
            <Plus className="h-4 w-4 mr-1" />
            Send Form
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="small" />
      ) : error ? (
         <div className="text-center py-8 text-red-500">
           Error loading forms: {error.message || 'Unknown error'}
         </div>
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
                    {formatDate(form.sent_at)} {/* Use sent_at */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(form.due_date)} {/* Use due_date */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <FormStatusBadge status={form.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {form.completed_at ? formatDate(form.completed_at) : '-'} {/* Use completed_at */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {/* TODO: Add View Responses button/logic */}
                    {form.status === 'completed' ? (
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                        View Responses
                      </button>
                    ) : (
                      <button
                        className={`text-indigo-600 hover:text-indigo-900 mr-3 inline-flex items-center ${sendReminderMutation.isLoading && sendReminderMutation.variables?.formId === form.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => handleSendFormReminder(form.id)}
                        disabled={sendReminderMutation.isLoading && sendReminderMutation.variables?.formId === form.id}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {sendReminderMutation.isLoading && sendReminderMutation.variables?.formId === form.id ? 'Sending...' : 'Send Reminder'}
                      </button>
                    )}
                    <button
                      className={`text-indigo-600 hover:text-indigo-900 inline-flex items-center ${resendFormMutation.isLoading && resendFormMutation.variables?.formId === form.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleResendForm(form.id)}
                      disabled={resendFormMutation.isLoading && resendFormMutation.variables?.formId === form.id}
                    >
                       <RefreshCw className="h-3 w-3 mr-1" />
                       {resendFormMutation.isLoading && resendFormMutation.variables?.formId === form.id ? 'Resending...' : 'Resend'}
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
