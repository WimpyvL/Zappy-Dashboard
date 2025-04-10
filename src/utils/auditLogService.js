// TODO: This service assumes the frontend is responsible for initiating log entries.
// If logging is purely backend-driven based on API requests, this service might not be needed
// or could be simplified.

// Service for logging events and errors to the backend (Supabase)
import { supabase } from './supabaseClient'; // Import Supabase client
import errorHandling from './errorHandling'; // Assuming errorHandling utility exists
// TODO: Consider importing useAuth hook or similar to get user ID if needed consistently

/**
 * Records an audit log event by sending it to the backend.
 *
 * @param {string} action - A description of the action performed (e.g., 'Patient Created', 'User Logged In').
 * @param {object} [details={}] - An optional object containing relevant details (e.g., { patientId: 123, orderStatus: 'Shipped' }).
 * @param {string} [userId] - Optional: The ID of the user performing the action.
 */
const logAuditEvent = async (action, details = {}, userId = null) => {
  // This function logs general actions to 'api_logs' if needed,
  // but currently, api_logs seems automatically populated by Supabase.
  // We might repurpose this or remove it if frontend action logging isn't required.

  // Example structure if we needed to log to api_logs manually:
  /*
  const logData = {
    user_id: userId, // || await getCurrentUserIdFromAuth(), // Fetch user ID if not provided
    method: 'FRONTEND_ACTION', // Indicate it's a frontend event
    path: action, // Use action as the path/identifier
    request_body: details, // Store details in request_body
    status_code: 200, // Assume success for action logging
    // ip_address might be harder to get from frontend
  };

  try {
    const { error } = await supabase.from('api_logs').insert(logData);
    if (error) throw error;
    console.log(`Audit event logged: ${action}`, details);
  } catch (error) {
    errorHandling.logError(error, `AuditLogService (${action})`);
  }
  */

  // For now, just log to console as the original service did (but improved)
  console.info(`[Audit Log] Action: ${action}`, { details, userId });
};

/**
 * Logs a frontend error to the dedicated 'frontend_errors' table in Supabase.
 *
 * @param {Error} error - The JavaScript error object.
 * @param {string} [componentContext='Unknown'] - Optional: Name of the component or context where the error occurred.
 * @param {object} [additionalDetails={}] - Optional: Any extra relevant information (e.g., state, props).
 * @param {string} [userId=null] - Optional: The ID of the logged-in user, if available.
 */
const logErrorEvent = async (error, componentContext = 'Unknown', additionalDetails = {}, userId = null) => {
  if (!error) return; // Don't log if no error object is provided

  // Avoid logging during development if too noisy, or use a flag
  // if (process.env.NODE_ENV === 'development') {
  //   console.error(`[Frontend Error (Dev)] Context: ${componentContext}`, { error, additionalDetails });
  //   return;
  // }

  const errorLogData = {
    user_id: userId, // Pass if available, otherwise null
    error_message: error.message || 'Unknown error message',
    stack_trace: error.stack || null,
    component_context: componentContext,
    additional_details: additionalDetails,
    // created_at is set by default in the database
  };

  try {
    const { error: insertError } = await supabase
      .from('frontend_errors')
      .insert(errorLogData);

    if (insertError) {
      throw insertError; // Throw error to be caught below
    }
    console.info('Frontend error logged successfully to Supabase.');
  } catch (dbError) {
    // Log the logging error itself to the console, but avoid infinite loops
    console.error('Failed to log frontend error to Supabase:', dbError);
    // Optionally use the original errorHandling utility for this specific failure
    // errorHandling.logError(dbError, 'AuditLogService.logErrorEvent - DB Insert Failed');
  }
};

const auditLogService = {
  log: logAuditEvent,
};

export default auditLogService;
