// TODO: This service assumes the frontend is responsible for initiating log entries.
// If logging is purely backend-driven based on API requests, this service might not be needed
// or could be simplified.

// TODO: Decide whether to call the API directly or use the mutation hook.
// Using the API directly might be simpler here if we don't need mutation state (isLoading, etc.)
// in the place where the log is triggered.
import { createAuditLog } from '../apis/auditlog/api';
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
    console.error("Failed to get user for audit log:", e);
  }
  return 'unknown@system.com';
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
  //   return;
  // }

  const logData = {
    action: action,
    details: JSON.stringify(details), // Send details as a JSON string or structured object based on backend expectation
    user: userId || getCurrentUserEmail(), // Get user identifier
    timestamp: new Date().toISOString(), // Timestamp can also be set by backend
  };

  try {
    // Call the API function directly
    // We might not need the full mutation hook state management here
    await createAuditLog(logData);
    console.log(`Audit event logged: ${action}`, details); // Log success locally for debugging
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
