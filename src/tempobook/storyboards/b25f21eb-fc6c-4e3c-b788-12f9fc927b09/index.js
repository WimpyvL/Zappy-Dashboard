import React, { useState } from 'react';
import NoteViewModal from '@/components/notes/NoteViewModal';

export default function NoteViewModalStoryboard() {
  const [isOpen, setIsOpen] = useState(true);

  const sampleNote = {
    title: 'Initial Consultation Notes',
    created_at: new Date().toISOString(),
    authorName: 'Dr. Jane Smith',
    description:
      'Patient reports experiencing mild headaches for the past two weeks, primarily in the morning. No previous history of migraines. Vital signs normal. Recommended OTC pain relief and follow-up in 2 weeks if symptoms persist.\n\nAdditional notes: Patient mentioned increased screen time due to new remote work arrangement. Discussed proper ergonomics and the 20-20-20 rule for eye strain prevention.',
  };

  const handleClose = () => {
    setIsOpen(false);
    // Reopen after a short delay for demo purposes
    setTimeout(() => setIsOpen(true), 1500);
  };

  return (
    <div className="bg-white p-4">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
        onClick={() => setIsOpen(true)}
      >
        View Note
      </button>

      <NoteViewModal note={sampleNote} isOpen={isOpen} onClose={handleClose} />
    </div>
  );
}
