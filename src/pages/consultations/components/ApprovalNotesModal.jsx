import React, { useState } from 'react';
import { X, FileCheck, Loader2 } from 'lucide-react';

/**
 * Modal for entering approval notes before approving a consultation
 */
const ApprovalNotesModal = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  isProcessing 
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onApprove(notes);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold flex items-center">
            <FileCheck className="h-5 w-5 text-green-600 mr-2" />
            Approve Consultation
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
            disabled={isProcessing}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Enter any notes about this approval. These notes will be stored with the consultation record.
            </p>
            
            <div className="mb-4">
              <label htmlFor="approvalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Approval Notes
              </label>
              <textarea
                id="approvalNotes"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                placeholder="Enter any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isProcessing}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={onClose}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Approve & Generate Invoice
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApprovalNotesModal;