import React from 'react';
import { X, Download, Calendar, User, StickyNote } from 'lucide-react';

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long', // Use long month name
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const NoteViewModal = ({ note, isOpen, onClose }) => {
  if (!isOpen || !note) return null;

  const handleDownload = () => {
    // Create text content for the download
    const fileContent = `Note Title: ${note.title || 'Session Note'}\n` +
                        `Date: ${formatDate(note.created_at || note.date)}\n` +
                        `Author: ${note.authorName || 'Unknown'}\n\n` +
                        `Content:\n${'-'.repeat(40)}\n${note.description || 'No content available.'}`;
    
    // Create a Blob from the text content
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    
    // Create a temporary URL for the blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    // Sanitize title for filename
    const safeTitle = (note.title || 'note').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle}_${new Date().toISOString().split('T')[0]}.txt`; // e.g., session_summary_2025-04-08.txt
    
    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Revoke the temporary URL
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl relative overflow-hidden">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-accent4/5">
          <div className="flex items-center">
            <StickyNote className="h-5 w-5 mr-2 text-accent4" />
            <h2 className="text-lg font-semibold text-gray-900">{note.title || 'Session Note'}</h2>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Note Metadata */}
          <div className="flex flex-wrap items-center space-x-4 text-xs text-gray-500 mb-4">
            <span className="flex items-center">
              <Calendar className="h-3 w-3 mr-1" /> {formatDate(note.created_at || note.date)}
            </span>
            {note.authorName && (
              <span className="flex items-center">
                <User className="h-3 w-3 mr-1" /> By: {note.authorName}
              </span>
            )}
          </div>
          
          {/* Note Body */}
          {/* Using prose for better readability of potentially long text */}
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {note.description || 'No content available.'}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end items-center p-4 border-t border-gray-200 bg-gray-50 space-x-3">
          <button
            onClick={handleDownload}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm font-medium hover:bg-gray-100 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" /> Download
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-accent3 text-white rounded-md text-sm font-medium hover:bg-accent3/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoteViewModal;
