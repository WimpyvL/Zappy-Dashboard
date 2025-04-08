import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase credentials
// CRA requires prefixing env vars with REACT_APP_
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Basic check to ensure variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables are set.'
  );
  // Optionally throw an error or handle appropriately
  // throw new Error('Supabase environment variables are not set.');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Helper functions for common database operations (Optional, but kept for consistency if used elsewhere)
export const supabaseHelper = {
  // Generic fetch function
  async fetch(table, options = {}) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    const {
      select = '*',
      filters = [],
      order = null,
      limit = null,
      single = false,
    } = options;

    let query = supabase.from(table).select(select);

    filters.forEach((filter) => {
      const { column, operator, value } = filter;
      query = query.filter(column, operator, value);
    });

    if (order) {
      const { column, ascending = true } = order;
      query = query.order(column, { ascending });
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (single) {
      const { data, error } = await query.single();
      return { data, error };
    } else {
      const { data, error } = await query;
      return { data, error };
    }
  },

  // Insert data
  async insert(table, data, options = {}) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    const { returning = 'minimal' } = options;
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select(returning === 'minimal' ? 'id' : '*');

    return { data: result, error };
  },

  // Update data
  async update(table, id, data) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    return { data: result, error };
  },

  // Delete data
  async delete(table, id) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    const { data, error } = await supabase.from(table).delete().eq('id', id);

    return { data, error };
  },

  // Real-time subscription
  subscribe(table, callback, event = '*') {
    if (!supabase) {
       console.error('Supabase client not initialized for subscription');
       return null;
    }
    return supabase
      .channel(`${table}-changes`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
        },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe();
  },
};

// Export the URL and key (primarily for debugging or specific needs, use with caution)
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
