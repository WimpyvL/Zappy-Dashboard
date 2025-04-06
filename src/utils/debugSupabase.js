// Utility to debug Supabase connection issues
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';

export const debugSupabaseConnection = () => {
  // Check if hardcoded credentials are available
  console.group('Supabase Credentials');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Available' : 'Missing');
  console.log(
    'SUPABASE_ANON_KEY:',
    SUPABASE_ANON_KEY ? 'Available' : 'Missing'
  );
  console.groupEnd();

  // Check if we're using the mock client
  const isMockClient = !SUPABASE_URL || !SUPABASE_ANON_KEY;
  console.log('Using mock Supabase client:', isMockClient);

  return {
    credentialsAvailable: !isMockClient,
    mockClientActive: isMockClient,
    supabaseUrl: SUPABASE_URL,
    // Don't log the full key for security
    keyAvailable: !!SUPABASE_ANON_KEY,
  };
};
