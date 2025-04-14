import { createClient } from '@supabase/supabase-js';

// Use process.env for Create React App
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Basic check if variables are loaded
if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Supabase URL or Anon Key is missing. Make sure you have set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY in your .env file and restarted the server.'
  );
  // Optionally throw an error or return a dummy client to prevent further issues
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Export the URL and key for other components that might need them
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseKey; // Corrected variable name
