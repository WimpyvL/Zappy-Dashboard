import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotes } from '../../apis/notes/hooks';
import { Loader2, AlertTriangle, FileText, Calendar, User, Download } from 'lucide-react'; // Added Download icon

const PatientNotesPage = () => {
  const { currentUser } = useAuth();
  // Assuming this page is intended for admin/provider view, 
  // it might need a patientId prop or context instead of using currentUser.id directly.
  // For now, using currentUser.id as a placeholder if available.
  const patientId = currentUser?.id; 

  const { data: notes, isLoading, error } = useNotes(patientId);

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Download handler function
  const handleDownload = (note) => {
    const fileContent = `Note Title: ${note.title || 'Session Note'}\n` +
                        `Date: ${formatDate(note.created_at)}\n` +
                        `Author: ${note.authorName || 'Unknown'}\n\n` +
                        `Content:\n${'-'.repeat(40)}\n${note.content || 'No content available.'}`;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = (note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle}_${new Date(note.created_at).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin text-[#F85C5C]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
        <p>Error loading notes.</p>
        <p className="text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4 mb-6">
        {/* Title might need adjustment depending on context (e.g., "Notes for [Patient Name]") */}
        <h1 className="text-2xl font-bold text-gray-900">Session Notes</h1> 
        <p className="text-sm text-gray-500 mt-1">Review summaries and notes from past sessions.</p>
      </div>

      {notes && notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
              {/* Note Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 border-b pb-2 border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-1 sm:mb-0">{note.title || 'Session Note'}</h2>
                <div className="flex items-center space-x-3 text-xs text-gray-500">
                   <span className="flex items-center">
                     <Calendar className="h-3 w-3 mr-1" /> {formatDate(note.created_at)}
                   </span>
                   <span className="flex items-center">
                     <User className="h-3 w-3 mr-1" /> By: {note.authorName || 'Unknown'}
                   </span>
                   {/* Download Button */}
                   <button 
                     onClick={() => handleDownload(note)}
                     className="flex items-center text-accent3 hover:text-accent3/80 hover:underline"
                     title="Download Note as Text File"
                   >
                     <Download className="h-3 w-3 mr-1" /> Download
                   </button>
                </div>
              </div>
              {/* Note Content */}
              {/* Using prose for better typography, show full content */}
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap"> 
                {note.content}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">No session notes found.</p>
        </div>
      )}
    </div>
  );
};

export default PatientNotesPage;
