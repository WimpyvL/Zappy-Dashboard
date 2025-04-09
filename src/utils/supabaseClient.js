import { createClient } from '@supabase/supabase-js';

// Use hardcoded credentials instead of environment variables
const supabaseUrl = 'https://htvivqlvivmxgrbpwrje.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0dml2cWx2aXZteGdyYnB3cmplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIxNTM0MjcsImV4cCI6MjA1NzcyOTQyN30.WxsjlBlh7XfHzoeEFSrkGnyn738jihRfLOL4xsQRLJU';

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Export the URL and key for other components that might need them
export const SUPABASE_URL = supabaseUrl;
export const SUPABASE_ANON_KEY = supabaseAnonKey;
