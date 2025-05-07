// TODO: This service assumes the frontend is responsible for initiating log entries.
// If logging is purely backend-driven based on API requests, this service might not be needed
// or could be simplified.

// Service for logging events and errors to the backend (Supabase)
// import { supabase } from '../lib/supabase'; // Removed unused supabase import
// import errorHandling from './errorHandling'; // Removed unused import
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

// Removed unused logErrorEvent function

const auditLogService = {
  log: logAuditEvent,
};

export default auditLogService;
