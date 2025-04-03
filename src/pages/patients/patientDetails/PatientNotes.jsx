// components/patients/components/PatientNotes.jsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import LoadingSpinner from './common/LoadingSpinner';

const NoteCard = ({ note, onOpenFollowupNotes }) => {
  const date = new Date(note.createdAt).toLocaleDateString();

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-md font-medium text-gray-900">{note.title}</h3>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">{date}</span>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              note.category === 'follow-up'
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {note.category === 'follow-up' ? 'Follow-up' : note.category}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-line">
        {note.content}
      </p>
      <div className="mt-2 flex justify-between items-center">
        <div className="text-xs text-gray-500">By: {note.createdBy}</div>
        {note.category === 'follow-up' && (
          <button
            className="text-indigo-600 text-sm font-medium"
            onClick={() => onOpenFollowupNotes()}
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};

const PatientNotes = ({ patientId, notes, loading, onOpenFollowupNotes }) => {
  const [noteType, setNoteType] = useState('all');

  // Filter notes based on selected type
  const filteredNotes =
    noteType === 'all'
      ? notes
      : notes.filter((note) => note.category === noteType);

  // Separate follow-up notes for special section
  const standardNotes = filteredNotes.filter(
    (note) => note.category !== 'follow-up'
  );
  const followupNotes =
    noteType === 'follow-up' || noteType === 'all'
      ? filteredNotes.filter((note) => note.category === 'follow-up')
      : [];

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Medical Notes</h2>
        <div className="flex space-x-2">
          <select
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value)}
          >
            <option value="all">All Notes</option>
            <option value="medical">Medical</option>
            <option value="admin">Admin</option>
            <option value="follow-up">Follow-up</option>
            <option value="initial-consult">Initial Consult</option>
          </select>
          <button
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            onClick={() =>
              (window.location.href = `/patients/${patientId}/notes/new`)
            }
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="small" />
      ) : filteredNotes.length > 0 ? (
        <div>
          {/* Standard Notes */}
          {standardNotes.length > 0 && (
            <div className="space-y-4">
              {standardNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onOpenFollowupNotes={onOpenFollowupNotes}
                />
              ))}
            </div>
          )}

          {/* Follow-up Notes Section */}
          {followupNotes.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-md font-medium text-gray-900 mb-2">
                Follow-up Notes
              </h3>
              <div className="space-y-4">
                {followupNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onOpenFollowupNotes={onOpenFollowupNotes}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {noteType === 'all'
            ? 'No medical notes found for this patient.'
            : `No ${noteType} notes found for this patient.`}
        </div>
      )}
    </div>
  );
};

export default PatientNotes;
