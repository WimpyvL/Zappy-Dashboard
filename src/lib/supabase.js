import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// S3 credentials for file storage
const s3AccessId = '8d9e3082cd81e07fb305992dbc575d7a';
const s3AccessKey = '3cbae3e6536f2e2a68feb0ff93f1336f12c10f44c5ae16adcd4a4f712ef4a95f';

// Create a single supabase client for interacting with your database
// Using null as a placeholder when credentials are missing
let supabase = null;

// Only initialize if we have valid credentials
if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      },
      db: {
        schema: 'public',
      },
      storage: {
        // Configure custom S3 storage
        customStorage: {
          url: 'https://s3.amazonaws.com', // Replace with your actual S3 endpoint if different
          credentials: {
            accessKeyId: s3AccessId,
            secretAccessKey: s3AccessKey,
          },
          // Default bucket used when no bucket is specified in storage operations
          defaultBucketName: 'patient-documents',
        }
      },
    });
  } catch (error) {
    console.error('Error initializing Supabase client:', error);
  }
} else {
  // Basic check to ensure variables are loaded
  console.error(
    'Supabase URL or Anon Key is missing. Make sure REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY environment variables are set.'
  );
  // In development, provide fallback values to prevent app from crashing
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      'Using empty fallback values for Supabase in development mode.'
    );
  }
}

// Export the client
export { supabase };

// Helper functions for common database operations
export const supabaseHelper = {
  // Check if supabase is initialized
  isInitialized() {
    return !!supabase;
  },
  // Generic fetch function
  async fetch(table, options = {}) {
    if (!supabase)
      return {
        data: null,
        error: new Error('Supabase client not initialized'),
      };
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
    if (!supabase)
      return {
        data: null,
        error: new Error('Supabase client not initialized'),
      };
    const { returning = 'minimal' } = options;
    const { data: result, error } = await supabase
      .from(table)
      .insert(data)
      .select(returning === 'minimal' ? 'id' : '*');

    return { data: result, error };
  },

  // Update data
  async update(table, id, data) {
    if (!supabase)
      return {
        data: null,
        error: new Error('Supabase client not initialized'),
      };
    const { data: result, error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select();

    return { data: result, error };
  },

  // Delete data
  async delete(table, id) {
    if (!supabase)
      return {
        data: null,
        error: new Error('Supabase client not initialized'),
      };
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

// Storage helper functions
export const supabaseStorage = {
  // Upload a file to storage
  async uploadFile(bucket, filePath, file, options = {}) {
    if (!supabase) {
      return {
        data: null,
        error: new Error('Supabase client not initialized'),
      };
    }
    
    const { upsert = false, contentType = null } = options;
    
    // Prepare upload options
    const uploadOptions = {
      cacheControl: '3600',
      upsert: upsert
    };
    
    // Add contentType if provided
    if (contentType) {
      uploadOptions.contentType = contentType;
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, uploadOptions);
      
    return { data, error };
  },
  
  // Get a public URL for a file
  getPublicUrl(bucket, filePath) {
    if (!supabase) {
      return {
        publicUrl: null,
        error: new Error('Supabase client not initialized'),
      };
    }
    
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return { publicUrl: data.publicUrl };
  },
  
  // Delete a file
  async deleteFile(bucket, filePath) {
    if (!supabase) {
      return {
        data: null,
        error: new Error('Supabase client not initialized'),
      };
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);
      
    return { data, error };
  },
  
  // List files in a bucket with an optional path prefix
  async listFiles(bucket, options = {}) {
    if (!supabase) {
      return {
        data: null,
        error: new Error('Supabase client not initialized'),
      };
    }
    
    const { path = '', limit = 100, offset = 0, sortBy = { column: 'name', order: 'asc' } } = options;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path, {
        limit,
        offset,
        sortBy
      });
      
    return { data, error };
  },
  
  // Create a signed URL (temporary access)
  async createSignedUrl(bucket, filePath, expiresIn = 60) {
    if (!supabase) {
      return {
        data: null,
        error: new Error('Supabase client not initialized'),
      };
    }
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);
      
    return { data, error };
  }
};

// Export the URL and key (primarily for debugging or specific needs, use with caution)
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
