import React, { useState, useEffect } from 'react';
import {
  Clock,
  Save,
  Plus,
  Tag,
  Check,
  AlertTriangle,
  Edit,
  Trash2,
  User,
  FileText,
  Loader2, // Added
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import {
  useNotes,
  useAddNote,
  useUpdateNote,
  useDeleteNote,
} from '../../apis/notes/hooks'; // Import note hooks
import { toast } from 'react-toastify'; // For notifications

// Sample note categories (can remain as is)
const noteCategories = [
  {
    id: 'symptom',
    name: 'Symptom',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle,
  },
  {
    id: 'medication',
    name: 'Medication',
    color: 'bg-blue-100 text-blue-800',
    icon: Tag,
  },
  {
    id: 'lab',
    name: 'Lab Result',
    color: 'bg-green-100 text-green-800',
    icon: Check,
  },
  {
    id: 'general',
    name: 'General Note',
    color: 'bg-gray-100 text-gray-800',
    icon: Clock,
  },
];

const MedicalNotes = ({ patientId }) => {
  // Fetch notes using React Query
  const {
    data: notesData,
    isLoading: isLoadingNotes,
    error: errorNotes,
  } = useNotes(patientId);
  const notes = notesData?.data || notesData || []; // Adapt based on API response structure

  // Get current user for attribution
  const { currentUser } = useAuth();
  const createdByName = currentUser?.name || 'Provider'; // Fallback name

  // Mutation hooks
  const addNoteMutation = useAddNote({
    onSuccess: () => {
      resetFormAndClose();
      // Invalidation is handled by the hook
    },
    onError: (error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });
  const updateNoteMutation = useUpdateNote({
    onSuccess: () => {
      resetFormAndClose();
    },
    onError: (error) => {
      toast.error(`Failed to update note: ${error.message}`);
    },
  });
  const deleteNoteMutation = useDeleteNote({
    onError: (error) => {
      toast.error(`Failed to delete note: ${error.message}`);
    },
  });

  // Local state for UI control and form
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null); // Stores the ID of the note being edited
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
  });

  // Reset form and close modal/form view
  const resetFormAndClose = () => {
    setNewNote({ title: '', content: '', category: 'general' });
    setEditingNoteId(null);
    setShowAddNote(false);
  };

  // Handle input changes for new/editing note
  const handleNoteInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  // Handle saving (add or update) a note using mutations
  const handleSaveNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) {
      toast.warn('Title and content are required.');
      return;
    }

    const notePayload = {
      ...newNote,
      createdBy: createdByName, // Add creator name
      // `createdAt` and `updatedAt` should ideally be handled by the backend
    };

    if (editingNoteId !== null) {
      // Update existing note
      updateNoteMutation.mutate({
        noteId: editingNoteId,
        patientId: patientId,
        ...notePayload,
      });
    } else {
      // Add a new note
      addNoteMutation.mutate({ patientId: patientId, ...notePayload });
    }
  };

  // Start editing a note
  const handleEditNote = (note) => {
    // Pre-fill form with existing note data, excluding fields managed by backend/context
    setNewNote({
      title: note.title || '',
      content: note.content || '',
      category: note.category || 'general',
      // Don't pre-fill createdBy or createdAt as they shouldn't be edited
    });
    setEditingNoteId(note.id);
    setShowAddNote(true); // Show the form
  };

  // Delete a note using mutation
  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate({ noteId, patientId });
    }
  };

  // Get category information (remains the same)
  const getCategoryInfo = (categoryId) => {
    return (
      noteCategories.find((cat) => cat.id === categoryId) || noteCategories[3]
    );
  };

  // --- Render Logic ---

  // Loading state
  if (isLoadingNotes) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  // Error state
  if (errorNotes) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
        <AlertTriangle className="h-6 w-6 mx-auto mb-2" />
        Error loading notes: {errorNotes.message}
      </div>
    );
  }

  // Component for rendering a single note (minor update for mutation state)
  const Note = ({ note }) => {
    const category = getCategoryInfo(note.category);
    const CategoryIcon = category.icon;
    const isDeleting =
      deleteNoteMutation.isLoading &&
      deleteNoteMutation.variables?.noteId === note.id;

    return (
      <div
        className={`bg-white p-4 rounded-lg shadow mb-4 border-l-4 ${isDeleting ? 'opacity-50' : ''}`}
        style={{
          /* ... border color style ... */
          borderLeftColor: category.color.startsWith('bg-red')
            ? '#fecaca'
            : category.color.startsWith('bg-blue')
              ? '#bfdbfe'
              : category.color.startsWith('bg-green')
                ? '#bbf7d0'
                : '#e5e7eb',
        }}
      >
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-full ${category.color.split(' ')[0]} mr-3`}
            >
              <CategoryIcon
                className={`h-4 w-4 ${category.color.split(' ')[1]}`}
              />
            </div>
            <div>
              <h3 className="font-medium text-lg">{note.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(note.createdAt).toLocaleDateString()} by{' '}
                {note.createdBy}
                {note.updatedAt &&
                  ` (Updated: ${new Date(note.updatedAt).toLocaleDateString()})`}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleEditNote(note)}
              className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
              title="Edit Note"
              disabled={isDeleting}
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteNote(note.id)}
              className="text-red-600 hover:text-red-900 disabled:opacity-50"
              title="Delete Note"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
        </div>
      </div>
    );
  };

  const isSaving = addNoteMutation.isLoading || updateNoteMutation.isLoading;

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Medical Notes</h2>
        <button
          className="px-3 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700 text-sm"
          onClick={() => {
            setEditingNoteId(null);
            setNewNote({ title: '', content: '', category: 'general' }); // Reset form for new note
            setShowAddNote(!showAddNote);
          }}
        >
          {showAddNote ? (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </>
          )}
        </button>
      </div>

      {/* Add/Edit Note Form */}
      {showAddNote && (
        <div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
          {/* ... Form inputs remain the same ... */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Title *
            </label>
            <input
              type="text"
              name="title"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={newNote.title}
              onChange={handleNoteInputChange}
              placeholder="Brief title for the note"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Category
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {noteCategories.map((category) => (
                <div
                  key={category.id}
                  className={`flex items-center p-2 rounded cursor-pointer border ${newNote.category === category.id ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200 hover:bg-gray-50'}`}
                  onClick={() =>
                    setNewNote({ ...newNote, category: category.id })
                  }
                >
                  <div
                    className={`p-1 rounded-full ${category.color.split(' ')[0]}`}
                  >
                    <category.icon
                      className={`h-4 w-4 ${category.color.split(' ')[1]}`}
                    />
                  </div>
                  <span className="ml-2 text-sm font-medium">
                    {category.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note Content *
            </label>
            <textarea
              name="content"
              rows="4"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={newNote.content}
              onChange={handleNoteInputChange}
              placeholder="Detailed medical notes, observations, or instructions..."
            ></textarea>
          </div>
          <div className="flex justify-end">
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center justify-center hover:bg-indigo-700 text-sm disabled:opacity-50"
              onClick={handleSaveNote} // Changed handler name
              disabled={
                !newNote.title.trim() || !newNote.content.trim() || isSaving
              }
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {editingNoteId !== null ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {notes.length > 0 ? (
        notes
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((note) => <Note key={note.id} note={note} />)
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900">
            No medical notes
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No medical notes have been added for this patient yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicalNotes;
