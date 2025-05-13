// components/patients/components/PatientFollowUpNotes.jsx
import React, { useState } from 'react';
import { X, Save, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import LoadingSpinner from '../../common/LoadingSpinner';
import usePatientFollowUpNotes from '../../../hooks/usePatientFollowUpNotes';

const PatientFollowUpNotes = ({ patient, selectedSession, onClose }) => {
  const [noteTitle, setNoteTitle] = useState(
    selectedSession ? `Follow-up for ${selectedSession.type} session on ${new Date(selectedSession.scheduledDate).toLocaleDateString()}` : ''
  );
  const [noteContent, setNoteContent] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpType, setFollowUpType] = useState('medical');
  const [needsFollowUp, setNeedsFollowUp] = useState(true);

  const { handleSubmit, loading } = usePatientFollowUpNotes(patient.id, selectedSession?.id, onClose);

  // Format date for inputs
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  return (
    <div>
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          {selectedSession ? 'Add Follow-up Note' : 'Add General Follow-up Note'}
        </h3>
        <button 
          className="text-gray-400 hover:text-gray-500"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6">
        {selectedSession && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Session Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-blue-700">Date</p>
                <p className="text-sm">{new Date(selectedSession.scheduledDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Type</p>
                <p className="text-sm capitalize">{selectedSession.type}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700">Provider</p>
                <p className="text-sm">{selectedSession.doctor}</p>
              </div>
            </div>
            {selectedSession.notes && (
              <div className="mt-2">
                <p className="text-xs text-blue-700">Session Notes</p>
                <p className="text-sm mt-1">{selectedSession.notes}</p>
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Title
            </label>
            <input
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Follow-up Notes
            </label>
            <textarea
              rows={6}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter detailed follow-up notes here..."
              required
            ></textarea>
          </div>
          
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="needs-followup"
                  name="needs-followup"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  checked={needsFollowUp}
                  onChange={(e) => setNeedsFollowUp(e.target.checked)}
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="needs-followup" className="font-medium text-gray-700">
                  Patient needs a follow-up session
                </label>
                <p className="text-gray-500">
                  Schedule a follow-up session for this patient
                </p>
              </div>
            </div>
          </div>
          
          {needsFollowUp && (
            <div className="pl-4 border-l-4 border-indigo-100 py-2 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date
                  </label>
                  <input
                    type="date"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    min={formatDateForInput(new Date())}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Type
                  </label>
                  <select
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    value={followUpType}
                    onChange={(e) => setFollowUpType(e.target.value)}
                  >
                    <option value="medical">Medical</option>
                    <option value="psych">Psych</option>
                    <option value="lab-review">Lab Review</option>
                    <option value="medication-check">Medication Check</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-yellow-50 rounded-md border border-yellow-200">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm text-yellow-700">
                  {followUpDate 
                    ? `A ${followUpType} session will be scheduled for ${new Date(followUpDate).toLocaleDateString()}.` 
                    : 'Please select a date to schedule the follow-up session.'}
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
            disabled={loading}
            onClick={(e) => {
              e.preventDefault();
              if (!noteContent.trim()) {
                toast.error('Please enter note content');
                return;
              }
              handleSubmit({
                title: noteTitle,
                content: noteContent,
                followUpNeeded: needsFollowUp,
                followUpDate: needsFollowUp ? followUpDate : null,
                followUpType: needsFollowUp ? followUpType : null
              });
            }}
          >
            {loading ? (
              <>
                <LoadingSpinner size="tiny" />
                <span className="ml-2">Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Follow-up Note
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientFollowUpNotes;
