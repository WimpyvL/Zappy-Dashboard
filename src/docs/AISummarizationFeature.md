# AI Summarization Feature

This document describes the AI summarization feature for intake forms and consultations.

## Overview

The AI summarization feature automatically generates treatment recommendations and reasoning based on patient intake form data. These summaries are displayed to providers in the consultation interface, helping them make informed decisions more efficiently.

## Components

### 1. AI Summary Service

The AI summary service (`src/apis/ai/summaryService.js`) is responsible for generating summaries from intake form data. It:

- Retrieves the appropriate AI prompt for the consultation category, type, and section
- Analyzes the patient's intake form data
- Generates treatment recommendations with confidence scores
- Provides reasoning for the recommendations
- Saves the summary to the database

### 2. AI Summary Hooks

The AI summary hooks (`src/apis/ai/summaryHooks.js`) provide React hooks for interacting with the AI summary service:

- `useAISummary`: Fetches an existing summary for a consultation
- `useGenerateAISummary`: Generates a new summary from intake form data
- `useGenerateAIAssessment`: Generates an assessment from intake form data
- `useGenerateAIPlan`: Generates a treatment plan from intake form data
- `useSaveAISummary`: Saves a summary to the database
- `useGenerateAndSaveAISummary`: Combines generation and saving in one step
- `useGenerateAllAIContent`: Generates summary, assessment, and plan in one step

### 3. AI Panel Component

The AI Panel component (`src/pages/consultations/components/consultation-notes/AIPanel.jsx`) displays AI-generated summaries to providers. It:

- Fetches existing summaries from the database
- Generates new summaries if needed
- Displays recommendations with confidence scores
- Shows the reasoning behind the recommendations
- Allows providers to regenerate summaries
- Supports both initial and follow-up consultations

### 4. Database Schema

The AI summarization feature uses the following database tables:

- `ai_summaries`: Stores generated summaries for consultations
- `ai_prompts`: Stores prompts used for generating summaries
- `ai_settings`: Stores configuration for the AI service
- `ai_logs`: Stores logs of AI API calls

## How It Works

1. **Intake Form Submission**:
   - Patient completes an intake form
   - Form data is saved to the database
   - A consultation is created for a provider

2. **Consultation Creation**:
   - When a provider opens the consultation
   - The AI Panel fetches or generates a summary
   - The summary is displayed to the provider

3. **Summary Generation**:
   - The system retrieves the appropriate prompt for the category, type, and section
   - The prompt and form data are sent to the AI service
   - The AI service generates recommendations and reasoning
   - The summary is saved to the database

4. **Provider Review**:
   - Provider reviews the AI-generated summary
   - Provider can regenerate the summary if needed
   - Provider makes treatment decisions based on the summary and their clinical judgment

5. **Follow-up Consultations**:
   - When a provider opens a follow-up consultation
   - The AI Panel generates follow-up specific recommendations
   - These recommendations take into account the patient's progress and response to treatment

## Prompt Types and Sections

The AI prompts are organized by:

1. **Category**: The medical category (e.g., weight_management, ed, hair_loss)
2. **Type**: The consultation type (initial or followup)
3. **Section**: The section of the consultation (summary, assessment, plan, patient_message)

This organization allows for highly specific prompts that generate targeted content for each part of the consultation.

## Configuration

AI summarization can be configured in the Settings > AI Prompts section:

- **Prompts**: Customize prompts for different categories, types, and sections
- **Settings**: Configure AI provider, model, and other settings
- **Logs**: View logs of AI API calls

## Best Practices

1. **Review AI Summaries**: AI-generated summaries are meant to assist providers, not replace their clinical judgment. Always review summaries before making treatment decisions.

2. **Customize Prompts**: Customize prompts for different categories, types, and sections to improve the quality of summaries.

3. **Monitor Usage**: Monitor AI API usage to control costs and ensure the system is working as expected.

## Troubleshooting

If AI summaries are not generating correctly:

1. Check that the AI settings are configured correctly
2. Verify that the appropriate prompt exists for the category, type, and section
3. Check the AI logs for errors
4. Ensure the intake form data is complete and well-structured

## Future Improvements

Planned improvements for the AI summarization feature:

1. **Enhanced Prompts**: Develop more sophisticated prompts for different medical conditions
2. **Patient-Specific Learning**: Improve recommendations based on patient outcomes
3. **Multi-Modal Input**: Incorporate lab results and other data sources
4. **Interactive Summaries**: Allow providers to ask follow-up questions about the summary