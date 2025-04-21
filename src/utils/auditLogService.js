// TODO: This service assumes the frontend is responsible for initiating log entries.
// If logging is purely backend-driven based on API requests, this service might not be needed
// or could be simplified.

import { createAuditLog } from '../apis/auditlog/api'; // Use the direct API call
import errorHandling from './errorHandling'; // Assuming errorHandling utility exists

// Get user info (example - adapt based on actual AuthContext structure)
// This is a placeholder; ideally, get user info from AuthContext
const getCurrentUserEmail = () => {
  try {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user?.email || 'unknown@example.com'; // Adjust property name if needed
    }
  } catch (e) {
    // Avoid logging errors just for getting the user email for an audit log
  }
  return 'unknown@system.com'; // Fallback user
};

/**
 * Records an audit log event by sending it to the backend.
 *
 * @param {string} action - A description of the action performed (e.g., 'Patient Created', 'User Logged In').
 * @param {object} [details={}] - An optional object containing relevant details (e.g., { patientId: 123, orderStatus: 'Shipped' }).
 * @param {string} [userId] - Optional: The ID or identifier of the user performing the action. Defaults to trying to get from context/storage.
 */
const logAuditEvent = async (action, details = {}, userId = null) => {
  // Avoid logging during development if noisy, or use a flag
  // if (process.env.NODE_ENV === 'development') {
  //   console.log(`[Audit Log (Dev)] Action: ${action}`, details);
  // }

  const logData = {
    action: action,
    details: JSON.stringify(details), // Send details as a JSON string or structured object based on backend expectation
    user_identifier: userId || getCurrentUserEmail(), // Get user identifier (adjust field name based on backend)
    // timestamp: new Date().toISOString(), // Timestamp is likely set by the backend/database
  };

  try {
    // Call the API function directly
    await createAuditLog(logData);
    // Optional: Add a local log for successful logging in development?
    // if (process.env.NODE_ENV === 'development') {
    //   console.log(`Audit event logged via API: ${action}`, details);
    // }
  } catch (error) {
    errorHandling.logError(error, `AuditLogService (${action})`);
    // Decide if the user needs to be notified about logging failure
    // toast.error("Failed to record audit event."); // Maybe only for critical logs?
  }
};

const auditLogService = {
  log: logAuditEvent,
};

export default auditLogService;
