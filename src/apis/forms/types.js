// TypeScript types for forms
// Created by reorganization script

/**
 * @typedef {Object} Form
 * @property {string} id - Unique identifier
 * @property {string} title - Form title (maps to name in database)
 * @property {string} [description] - Form description
 * @property {Object} structure - Form structure with pages and conditionals
 * @property {boolean|string} status - Form status (active/inactive)
 * @property {string} [form_type] - Type of form
 * @property {string} [slug] - URL-friendly identifier
 * @property {string} [serviceId] - Associated service ID
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 */

/**
 * @typedef {Object} FormPage
 * @property {string} id - Unique identifier
 * @property {string} title - Page title
 * @property {Array<FormElement>} elements - Form elements on this page
 */

/**
 * @typedef {Object} FormElement
 * @property {string} id - Unique identifier
 * @property {string} type - Element type (text, checkbox, etc.)
 * @property {string} label - Element label
 * @property {string} [placeholder] - Placeholder text
 * @property {boolean} [required] - Whether the element is required
 * @property {Array<FormOption>} [options] - Options for select elements
 */

/**
 * @typedef {Object} FormOption
 * @property {string} id - Unique identifier
 * @property {string} value - Option value
 */

/**
 * @typedef {Object} FormConditional
 * @property {string} id - Unique identifier
 * @property {string} elementId - ID of the element that triggers the condition
 * @property {string} operator - Comparison operator
 * @property {string|number|boolean} value - Value to compare against
 * @property {string} thenShowElementId - ID of the element to show when condition is met
 */

/**
 * @typedef {Object} FormRequest
 * @property {string} id - Unique identifier
 * @property {string} patient_id - Patient ID
 * @property {string} questionnaire_id - Form ID
 * @property {string} status - Request status (pending, completed, expired)
 * @property {string} sent_date - Date the form was sent
 * @property {string} [deadline_date] - Due date for completion
 * @property {string} [completed_date] - Date the form was completed
 * @property {Object} [response_data] - Patient's responses
 * @property {string} created_at - Creation timestamp
 * @property {string} updated_at - Last update timestamp
 * @property {string} [created_by] - User ID who created the request
 */

export {};
