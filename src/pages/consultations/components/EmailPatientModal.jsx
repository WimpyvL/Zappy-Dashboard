import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const EmailPatientModal = ({ isOpen, onClose, consultation }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (consultation) {
      // Pre-fill subject and message when consultation data is available
      setSubject(`Consultation Follow-up for ${consultation.patientName || 'Patient'}`);
      setMessage(
        `Dear ${consultation.patientName || 'Patient'},\n\nThank you for your recent consultation submission. We're writing to inform you about the next steps in your treatment plan.\n\n[Add specific details here]\n\nSincerely,\nThe Medical Team`
      );
    }
  }, [consultation]);

  const handleSendEmail = () => {
    if (!consultation?.email) {
      toast.error("Patient email is missing.");
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast.error("Subject and message cannot be empty.");
      return;
    }

    console.log(`Sending email to ${consultation.email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);

    // TODO: Implement actual email sending logic via API call
    // Example: sendEmailMutation.mutate({ to: consultation.email, subject, body: message });

    toast.success("Email sent successfully! (Placeholder)");
    onClose(); // Close modal after sending
  };

  if (!isOpen || !consultation) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Send Email to Patient
            </h3>
            <p className="text-sm text-gray-500">
              To: {consultation.email || 'N/A'}
            </p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              rows={10}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-primary rounded-md text-sm font-medium text-white hover:bg-primary/90"
            onClick={handleSendEmail}
          >
            Send Email
          </button>
        </div>
      </div>
    </div>
  );
};

EmailPatientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  consultation: PropTypes.shape({
    email: PropTypes.string,
    patientName: PropTypes.string,
    // Add other fields as needed
  }),
};

export default EmailPatientModal;
