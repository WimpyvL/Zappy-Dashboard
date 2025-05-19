import React from 'react';
import NoteTemplatesPage from '../../admin/NoteTemplatesPage';

/**
 * Patient Note Template Settings
 * 
 * This component now uses the enhanced NoteTemplatesPage component
 * which provides a more comprehensive template management system with:
 * - Categories and encounter types
 * - Advanced filtering and searching
 * - AI-assisted content generation
 * - Integration with the database
 */
const PatientNoteTemplateSettings = () => {
  return <NoteTemplatesPage />;
};

export default PatientNoteTemplateSettings;
