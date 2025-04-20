import { createClient } from '@supabase/supabase-js';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Ensure the correct environment variables are used
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase configuration is missing. Please check your environment variables.'
  );
}

// Create supabase client with environment-specific config
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  db: {
    schema: 'public',
  },
});

// Schema validation helper
export async function validateSchema() {
  if (isDevelopment) {
    try {
      const { data: tables } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');
      
      if (!tables || tables.length === 0) {
        console.warn('No tables found in public schema. Run migrations first.');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Schema validation failed:', error);
      return false;
    }
  }
  return true; // Skip validation in production
}

// Helper functions remain the same as before
export const supabaseHelper = {
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

  async insert(table, data, options = {}) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    const { returning = 'minimal' } = options;
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select(returning === 'minimal' ? 'id' : '*');

    return { data: result, error };
  },

  async update(table, id, data) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    return { data: result, error };
  },

  async delete(table, id) {
    if (!supabase) return { data: null, error: new Error('Supabase client not initialized') };
    const { data, error } = await supabase.from(table).delete().eq('id', id);

    return { data, error };
  },

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

export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseKey;
