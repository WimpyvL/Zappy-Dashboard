import { supabase } from '../lib/supabase';

/**
 * API Client that provides a RESTful interface over Supabase
 * This client translates RESTful API calls to Supabase queries
 */
const apiClient = {
  /**
   * Perform a GET request
   * @param {string} endpoint - The endpoint to fetch from (e.g., '/subscription-durations' or '/subscription-durations/123')
   * @returns {Promise<Object>} The response data
   */
  async get(endpoint) {
    // Parse endpoint to determine table and filters
    const parts = endpoint.split('/').filter(Boolean);
    const table = parts[0].replace(/-/g, '_'); // Convert kebab-case to snake_case for table names
    
    let query = supabase.from(table).select('*');
    
    // Handle ID-based requests like '/subscription-durations/123'
    if (parts.length > 1) {
      query = query.eq('id', parts[1]);
      
      // If we're querying by ID, we expect a single result
      const { data, error } = await query.single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return { data: null };
        }
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }
      
      return { data };
    } else {
      // For collection endpoints, return all results
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
      }
      
      return { data: data || [] };
    }
  },
  
  /**
   * Perform a POST request to create a new resource
   * @param {string} endpoint - The endpoint to post to (e.g., '/subscription-durations')
   * @param {Object} body - The data to send
   * @returns {Promise<Object>} The created resource
   */
  async post(endpoint, body) {
    const table = endpoint.split('/')[0].replace(/-/g, '_');
    
    const { data, error } = await supabase
      .from(table)
      .insert(body)
      .select();
      
    if (error) {
      console.error(`Error creating resource at ${endpoint}:`, error);
      throw error;
    }
    
    return { data: data[0] };
  },
  
  /**
   * Perform a PUT request to update an existing resource
   * @param {string} endpoint - The endpoint to update (e.g., '/subscription-durations/123')
   * @param {Object} body - The data to update
   * @returns {Promise<Object>} The updated resource
   */
  async put(endpoint, body) {
    const parts = endpoint.split('/').filter(Boolean);
    
    if (parts.length < 2) {
      throw new Error('PUT requests require an ID in the endpoint path');
    }
    
    const table = parts[0].replace(/-/g, '_');
    const id = parts[1];
    
    const { data, error } = await supabase
      .from(table)
      .update(body)
      .eq('id', id)
      .select();
      
    if (error) {
      console.error(`Error updating resource at ${endpoint}:`, error);
      throw error;
    }
    
    return { data: data[0] };
  },
  
  /**
   * Perform a DELETE request to remove a resource
   * @param {string} endpoint - The endpoint to delete from (e.g., '/subscription-durations/123')
   * @returns {Promise<Object>} Confirmation of deletion
   */
  async delete(endpoint) {
    const parts = endpoint.split('/').filter(Boolean);
    
    if (parts.length < 2) {
      throw new Error('DELETE requests require an ID in the endpoint path');
    }
    
    const table = parts[0].replace(/-/g, '_');
    const id = parts[1];
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error(`Error deleting resource at ${endpoint}:`, error);
      throw error;
    }
    
    return { data: { success: true } };
  }
};

export default apiClient;
