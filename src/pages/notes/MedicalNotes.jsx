import React, { useState } from 'react';
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
  FileText
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// Sample note categories with their corresponding icons and colors
const noteCategories = [
  { id: 'symptom', name: 'Symptom', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  { id: 'medication', name: 'Medication', color: 'bg-blue-100 text-blue-800', icon: Tag },
  { id: 'lab', name: 'Lab Result', color: 'bg-green-100 text-green-800', icon: Check },
  { id: 'general', name: 'General Note', color: 'bg-gray-100 text-gray-800', icon: Clock }
];

const MedicalNotes = ({ patientId, initialNotes = [] }) => {
  const { loading } = useAppContext();
  const [notes, setNotes] = useState(initialNotes);
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    category: 'general',
    createdBy: 'Dr. Thompson',
    createdAt: new Date().toISOString()
  });

  // Handle input changes for new/editing note
  const handleNoteInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote({
      ...newNote,
      [name]: value
    });
  };

  // Add a new note
  const handleAddNote = () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;

    // If editing an existing note
    if (editingNoteId !== null) {
      setNotes(notes.map(note => 
        note.id === editingNoteId 
          ? { ...note, ...newNote, updatedAt: new Date().toISOString() }
          : note
      ));
      setEditingNoteId(null);
    } else {
      // Add a new note
      const noteToAdd = {
        ...newNote,
        id: `note_${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      setNotes([noteToAdd, ...notes]);
    }

    // Reset form
    setNewNote({
      title: '',
      content: '',
      category: 'general',
      createdBy: 'Dr. Thompson',
      createdAt: new Date().toISOString()
    });
    setShowAddNote(false);
  };

  // Start editing a note
  const handleEditNote = (note) => {
    setNewNote({ ...note });
    setEditingNoteId(note.id);
    setShowAddNote(true);
  };

  // Delete a note
  const handleDeleteNote = (noteId) => {
    setNotes(notes.filter(note => note.id !== noteId));
  };

  // Get category information
  const getCategoryInfo = (categoryId) => {
    const category = noteCategories.find(cat => cat.id === categoryId) || noteCategories[3]; // Default to general
    return category;
  };

  // Component for rendering a single note
  const Note = ({ note }) => {
    const category = getCategoryInfo(note.category);
    const CategoryIcon = category.icon;

    return (
      <div className="bg-white p-4 rounded-lg shadow mb-4 border-l-4" style={{ borderLeftColor: category.color.split(' ')[0].replace('bg', 'border') }}>
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <div className={`p-2 rounded-full ${category.color.split(' ')[0]} mr-3`}>
              <CategoryIcon className={`h-4 w-4 ${category.color.split(' ')[1]}`} />
            </div>
            <div>
              <h3 className="font-medium text-lg">{note.title}</h3>
              <p className="text-sm text-gray-500">
                {new Date(note.createdAt).toLocaleDateString()} by {note.createdBy}
                {note.updatedAt && ` (Updated: ${new Date(note.updatedAt).toLocaleDateString()})`}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleEditNote(note)}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleDeleteNote(note.id)}
              className="text-red-600 hover:text-red-900"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-3">
          <p className="text-gray-700 whitespace-pre-line">{note.content}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Medical Notes</h2>
        <button 
          className="px-3 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700 text-sm"
          onClick={() => {
            setEditingNoteId(null);
            setNewNote({
              title: '',
              content: '',
              category: 'general',
              createdBy: 'Dr. Thompson',
              createdAt: new Date().toISOString()
            });
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
              {noteCategories.map(category => (
                <div 
                  key={category.id}
                  className={`flex items-center p-2 rounded cursor-pointer border ${
                    newNote.category === category.id 
                      ? 'ring-2 ring-indigo-500 border-indigo-500' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setNewNote({...newNote, category: category.id})}
                >
                  <div className={`p-1 rounded-full ${category.color}`}>
                    <category.icon className="h-4 w-4" />
                  </div>
                  <span className="ml-2 text-sm font-medium">{category.name}</span>
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
              className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700 text-sm"
              onClick={handleAddNote}
              disabled={!newNote.title.trim() || !newNote.content.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              {editingNoteId !== null ? 'Update Note' : 'Save Note'}
            </button>
          </div>
        </div>
      )}

      {/* Notes List */}
      {loading?.patients ? (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow mb-4">
              <div className="flex items-start">
                <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : notes.length > 0 ? (
        notes.map(note => <Note key={note.id} note={note} />)
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900">No medical notes</h3>
          <p className="mt-1 text-sm text-gray-500">
            No medical notes have been added for this patient yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicalNotes;