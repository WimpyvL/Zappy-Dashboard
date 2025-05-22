# Intake Form to Consultation Flow

This document describes the flow from patient intake form submission to provider consultation.

## Overview

When a patient selects a prescription product, they are directed to an intake form. After completing the form, a consultation is automatically created and assigned to a provider who is licensed in the patient's state. The provider reviews the consultation, which is prepopulated with the patient's intake form responses, and makes a decision on the prescription.

## Components

### 1. Intake Form

The intake form collects patient information, health history, and treatment preferences. It is implemented in `src/pages/intake/IntakeFormPage.jsx`.

Key features:
- Multi-step form with progress tracking
- Dynamic fields based on product category
- Address collection for provider assignment
- Payment information collection

### 2. Form Submission

When the patient submits the form, the following happens:
1. Form data is saved via `useSubmitForm` hook
2. An order is created via `useCreateOrder` hook
3. A consultation is created via `useCreateConsultation` hook
4. A provider is assigned via `useAssignProvider` hook

### 3. Provider Assignment

Providers are assigned based on:
1. State licensing (provider must be licensed in patient's state)
2. Specialization (provider should have expertise in the relevant category)
3. Workload (providers with fewer active consultations are prioritized)

### 4. Webhook Backup

A webhook handler ensures consultations are created even if the frontend logic fails:
- Located in `src/server/webhooks/formSubmissionWebhook.js`
- Triggered whenever a form submission is created
- Creates a consultation if one doesn't already exist
- Assigns a provider based on the same criteria as the frontend

## Implementation Details

### Frontend Components

- `IntakeFormPage.jsx`: Main intake form component
- `OrderConfirmationStep.jsx`: Confirmation page showing consultation status

### Backend Components

- `formSubmissionWebhook.js`: Webhook handler for form submissions
- `server.js`: Express server with webhook routes

### API Hooks

- `useSubmitForm`: Submits form data
- `useCreateOrder`: Creates an order
- `useCreateConsultation`: Creates a consultation
- `useAssignProvider`: Assigns a provider based on state and specialty

## How to Test

1. Start the server:
   ```
   cd src/server
   npm install
   npm run dev
   ```

2. Start the frontend:
   ```
   npm start
   ```

3. Navigate to the shop page and select a prescription product
4. Complete the intake form
5. Verify that a consultation is created and assigned to a provider

## Troubleshooting

If a consultation is not created:
1. Check the browser console for errors
2. Verify that the webhook server is running
3. Check the server logs for webhook errors
4. Ensure the patient's state is provided in the shipping address
5. Verify that there are providers licensed in the patient's state

## Future Improvements

1. Add real-time notifications for patients when their consultation status changes
2. Implement provider availability scheduling
3. Add support for video consultations
4. Improve load balancing algorithm for provider assignment
5. Add analytics to track conversion rates from intake to consultation