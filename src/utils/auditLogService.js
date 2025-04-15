// TODO: This service assumes the frontend is responsible for initiating log entries.
// If logging is purely backend-driven based on API requests, this service might not be needed
// or could be simplified.

// TODO: Decide whether to call the API directly or use the mutation hook.
// Using the API directly might be simpler here if we don't need mutation state (isLoading, etc.)
// in the place where the log is triggered.
import { createAuditLog } from '../apis/auditlog/api';
import errorHandling from './errorHandling'; // Assuming errorHandling utility exists
import { supabase } from '../lib/supabaseClient'; // Import supabase client to get user

/**
 * Records an audit log event by sending it to the Supabase backend.
 *
 * @param {string} action - A description of the action performed (e.g., 'Patient Created', 'User Logged In').
 * @param {object} [details={}] - An optional object containing relevant details (e.g., { patientId: 123, orderStatus: 'Shipped' }).
 * @param {string} [table_name] - Optional: The name of the primary table affected.
 * @param {string} [record_id] - Optional: The ID of the record affected.
 */
const logAuditEvent = async (action, details = {}, table_name = null, record_id = null) => {
  // Avoid logging during development if noisy, or use a flag
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(`[Audit Log (Dev)] Action: ${action}`, details);
  //   return;
  // }

  let userId = null;
  try {
    // Get current user ID from Supabase session
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id || null;
  } catch (e) {
      console.error("Failed to get user for audit log:", e);
  }

  const logData = {
    user_id: userId, // Use the actual user ID from Supabase auth
    action: action,
    details: details, // Pass details as an object, api.js will handle stringify if needed by backend (though jsonb is preferred)
    table_name: table_name,
    record_id: record_id,
    // created_at is set by the database default
  };

  try {
    // Call the refactored API function directly
    const result = await createAuditLog(logData);
    if (result.success) {
        console.log(`Audit event logged: ${action}`, details); // Log success locally for debugging
    } else {
        // Error was already logged in api.js, but we could add more handling here if needed
        console.warn(`Failed to log audit event "${action}" to database.`);
    }
  } catch (error) {
    // Catch any unexpected errors during the service call itself
    errorHandling.logError(error, `AuditLogService (${action})`);
  }
};

const auditLogService = {
  log: logAuditEvent,
};

export default auditLogService;
