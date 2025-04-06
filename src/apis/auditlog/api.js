// TODO: Determine which api client setup to use (apiService.js or utils2/api.js)
// Assuming utils2/api.js for now based on other features in src/apis/*
// import { request } from '../../utils2/api'; // Adjust path if needed - Removed unused import

/**
 * Fetches audit logs from the backend.
 * @param {object} params - Query parameters (e.g., page, limit, filters)
 * @returns {Promise<object>} Promise resolving to the API response data (likely { logs: [], total: number })
 */
export const getAuditLogs = async (params) => {
  console.log('Fetching audit logs with params:', params);
  // This function is not used directly as we're using the hooks.js implementation with Supabase
  throw new Error(
    'This function is deprecated. Use the useAuditLogs hook instead.'
  );
};

/**
 * Sends a new audit log entry to the backend.
 * NOTE: This function might live elsewhere or be called implicitly by the backend.
 * If frontend needs to explicitly send logs, implement this.
 * @param {object} logData - The data for the new log entry (e.g., { action: '...', details: '...' })
 * @returns {Promise<object>} Promise resolving to the API response data
 */
export const createAuditLog = async (logData) => {
  console.log('Creating audit log:', logData);
  // This function is not used directly as we're using the hooks.js implementation with Supabase
  throw new Error(
    'This function is deprecated. Use the Supabase client directly or implement a hook.'
  );
};
