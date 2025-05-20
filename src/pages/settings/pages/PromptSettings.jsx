import React from 'react';
import AIPromptSettingsPage from '../../admin/AIPromptSettingsPage';

/**
 * AI Prompt Settings
 * 
 * This component now uses the enhanced AIPromptSettingsPage component
 * which provides a more comprehensive prompt management system with:
 * - Better UI for managing AI prompts
 * - Support for adding, editing, and deleting prompts
 * - Integration with the database
 */
const PromptSettings = () => {
  return <AIPromptSettingsPage />;
};

export default PromptSettings;
