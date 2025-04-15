// services/auditLogServiceApi.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const ITEMS_PER_PAGE = 20; // Define items per page for pagination

/**
 * Fetches audit logs from the Supabase 'audit_logs' table.
 * @param {number} [currentPage=1] - The current page number for pagination.
 * @param {object} [filters={}] - Optional filters (e.g., { userId: '...', action: '...' }).
 * @returns {Promise<object>} Promise resolving to { data: auditLogArray, pagination: {...} }
 */
export const getAuditLogs = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('audit_logs')
    .select(`
      *,
      user:auth_users(email)
    `, { count: 'exact' }) // Join user email from auth.users table
    .range(start, end);

  // Apply filters
  if (filters.userId) {
    query = query.eq('user_id', filters.userId);
  }
  if (filters.action) {
    query = query.ilike('action', `%${filters.action}%`);
  }
  if (filters.startDate) {
    query = query.gte('created_at', filters.startDate);
  }
   if (filters.endDate) {
    query = query.lte('created_at', filters.endDate);
  }
  // Add more filters as needed (e.g., table_name, record_id)

  // Apply sorting (default: newest first)
  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching audit logs:', error);
    throw error;
  }

  return {
    data,
    pagination: {
      currentPage: currentPage,
      totalPages: Math.ceil(count / ITEMS_PER_PAGE),
      totalCount: count,
      itemsPerPage: ITEMS_PER_PAGE
    },
  };
};

/**
 * Inserts a new audit log entry into the Supabase 'audit_logs' table.
 * Called by the auditLogService.
 * @param {object} logData - The data for the new log entry (should match table columns: user_id, action, details, table_name, record_id).
 * @returns {Promise<object>} Promise resolving to the inserted log data.
 */
export const createAuditLog = async (logData) => {
  // Ensure details is a JSON object if it's not already
  const dataToInsert = {
      ...logData,
      details: typeof logData.details === 'string' ? JSON.parse(logData.details) : logData.details,
  };

  const { data, error } = await supabase
    .from('audit_logs')
    .insert(dataToInsert)
    .select()
    .single();

  if (error) {
    // Log the error but don't necessarily throw, as audit logging failure
    // might not need to block the primary user action.
    console.error('Error creating audit log:', error);
    // Depending on requirements, you might still want to throw or return the error
    // throw error;
    return { success: false, error };
  }
  // Return the created log entry
  return { success: true, data };
};
