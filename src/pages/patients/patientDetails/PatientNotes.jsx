// components/patients/components/PatientNotes.jsx
import React, { useState, useMemo } from "react"; // Added useMemo
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react"; // Added icons
import { Link } from "react-router-dom"; // Added Link
import LoadingSpinner from "./common/LoadingSpinner";
import { useNotes, useDeleteNote } from "../../../apis/notes/hooks"; // Import notes hooks
import { toast } from "react-toastify";
import { useQueryClient } from '@tanstack/react-query';

// Format date utility
const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
          year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
        }).format(date);
    } catch (e) {
        return "Invalid Date";
    }
};

// Note Card Component - Updated to use new fields
const NoteCard = ({ note, onOpenFollowupNotes, onDelete }) => {
  const date = formatDate(note.created_at);
  const noteTypeLabel = note.note_type ? note.note_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';

  // Basic category styling (can be expanded)
  const categoryStyle = note.note_type === "follow_up"
      ? "bg-indigo-100 text-indigo-800"
      : "bg-gray-100 text-gray-800";

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start mb-2">
        {/* Use note type as title or add a title field to notes table */}
        <h3 className="text-md font-medium text-gray-900">{noteTypeLabel} Note</h3>
        <div className="flex items-center">
          <span className="text-xs text-gray-500 mr-2">{date}</span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryStyle}`}>
            {noteTypeLabel}
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600 whitespace-pre-line mb-2">
        {note.content}
      </p>
      <div className="mt-2 flex justify-between items-center">
        <div className="text-xs text-gray-500">By: {note.author?.email || 'Unknown'}</div>
        <div className="flex space-x-2">
           {/* TODO: Add Edit Note functionality */}
           {/* <button className="text-gray-500 hover:text-indigo-600"><Edit2 className="h-4 w-4"/></button> */}
           <button
             className="text-gray-500 hover:text-red-600"
             onClick={() => onDelete(note.id)}
             title="Delete Note"
            >
             <Trash2 className="h-4 w-4"/>
           </button>
           {/* Keep follow-up logic if needed, adapt based on note_type */}
           {note.note_type === "follow_up" && (
             <button
               className="text-indigo-600 text-sm font-medium"
               onClick={() => onOpenFollowupNotes(note)} // Pass the note object
             >
               View Details
             </button>
           )}
        </div>
      </div>
    </div>
  );
};


const PatientNotes = ({ patientId, onOpenFollowupNotes }) => { // Removed notes, loading props
  const [noteTypeFilter, setNoteTypeFilter] = useState("all"); // Renamed state
  const [currentPage, setCurrentPage] = useState(1); // Add pagination state
  const queryClient = useQueryClient();

  // Memoize filters
  const filters = useMemo(() => {
      const activeFilters = { patientId };
      if (noteTypeFilter !== 'all') {
          activeFilters.noteType = noteTypeFilter;
      }
      return activeFilters;
  }, [patientId, noteTypeFilter]);

  // Fetch notes using the hook
  const {
    data: notesData,
    isLoading,
    error,
    isFetching,
  } = useNotes(currentPage, filters);

  const notes = notesData?.data || [];
  const pagination = notesData?.pagination || { totalPages: 1 };

  // Initialize delete mutation hook
  const deleteNoteMutation = useDeleteNote({
      onSuccess: () => {
          toast.success("Note deleted successfully.");
          // Invalidate notes query for the current patient/filter
          queryClient.invalidateQueries({ queryKey: ['notes', currentPage, filters] });
      },
      onError: (err) => {
          toast.error(`Failed to delete note: ${err.message}`);
      }
  });

  const handleDeleteNote = (noteId) => {
      if (window.confirm("Are you sure you want to delete this note?")) {
          deleteNoteMutation.mutate(noteId);
      }
  };

   const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Patient Notes</h2>
        <div className="flex space-x-2">
          {/* Update filter options based on schema */}
          <select
            className="text-sm border border-gray-300 rounded-md px-3 py-1"
            value={noteTypeFilter}
            onChange={(e) => { setNoteTypeFilter(e.target.value); setCurrentPage(1); }} // Reset page on filter change
          >
            <option value="all">All Note Types</option>
            <option value="general">General</option>
            <option value="follow_up">Follow-up</option>
            <option value="consultation">Consultation</option>
            <option value="phone_call">Phone Call</option>
            {/* Add other note types as needed */}
          </select>
          {/* TODO: Link to a dedicated Add Note page/modal */}
          <Link
            to={`/patients/${patientId}/notes/new`} // Example route
            className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Note
          </Link>
        </div>
      </div>

      {isLoading ? ( // Use hook's loading state
        <LoadingSpinner message="Loading notes..." />
      ) : error ? ( // Use hook's error state
         <div className="text-center py-8 text-red-500">
            Error loading notes: {error.message}
         </div>
      ) : notes.length > 0 ? (
        <>
          <div className="space-y-4">
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onOpenFollowupNotes={onOpenFollowupNotes}
                onDelete={handleDeleteNote} // Pass delete handler
              />
            ))}
          </div>
           {/* Pagination Controls */}
           {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center pt-4 border-t mt-4">
               <span className="text-sm text-gray-700">
                 Page {currentPage} of {pagination.totalPages}
               </span>
               <div className="flex space-x-1">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className={`relative inline-flex items-center px-2 py-1 rounded border border-gray-300 bg-white text-sm font-medium ${currentPage > 1 ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= pagination.totalPages}
                    className={`relative inline-flex items-center px-2 py-1 rounded border border-gray-300 bg-white text-sm font-medium ${currentPage < pagination.totalPages ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
               </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {noteTypeFilter === "all"
            ? "No notes found for this patient."
            : `No '${noteTypeFilter.replace(/_/g, ' ')}' notes found.`}
        </div>
      )}
    </div>
  );
};

export default PatientNotes;
