// Utility to debug Supabase connection issues
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';

export const debugSupabaseConnection = () => {
  // Check if credentials are available
  console.group('Supabase Credentials');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Available' : 'Missing');
  console.log(
    'SUPABASE_ANON_KEY:',
    SUPABASE_ANON_KEY ? 'Available' : 'Missing'
  );

  // Check environment variables
  console.log('Environment Variables:');
  console.log(
    'VITE_SUPABASE_URL:',
    typeof window !== 'undefined' && window.env && window.env.VITE_SUPABASE_URL
      ? 'Available'
      : 'Missing'
  );
  console.log(
    'VITE_SUPABASE_ANON_KEY:',
    typeof window !== 'undefined' &&
      window.env &&
      window.env.VITE_SUPABASE_ANON_KEY
      ? 'Available'
      : 'Missing'
  );
  console.log(
    'process.env.SUPABASE_URL:',
    typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL
      ? 'Available'
      : 'Missing'
  );
  console.log(
    'process.env.SUPABASE_ANON_KEY:',
    typeof process !== 'undefined' &&
      process.env &&
      process.env.SUPABASE_ANON_KEY
      ? 'Available'
      : 'Missing'
  );
  console.groupEnd();

  // Check if we're using the mock client
  const isMockClient = !SUPABASE_URL || !SUPABASE_ANON_KEY;
  console.log('Using mock Supabase client:', isMockClient);

  // Log the actual URL being used (without revealing sensitive parts)
  if (SUPABASE_URL) {
    const urlParts = SUPABASE_URL.split('.');
    const maskedUrl =
      urlParts.length > 1
        ? `${urlParts[0].substring(0, 5)}...${urlParts[0].substring(urlParts[0].length - 3)}.${urlParts.slice(1).join('.')}`
        : 'Invalid URL format';
    console.log('Using Supabase URL:', maskedUrl);
  }

  return {
    credentialsAvailable: !isMockClient,
    mockClientActive: isMockClient,
    supabaseUrl: SUPABASE_URL,
    // Don't log the full key for security
    keyAvailable: !!SUPABASE_ANON_KEY,
    envVars: {
      viteSupabaseUrl: !!(
        typeof window !== 'undefined' &&
        window.env &&
        window.env.VITE_SUPABASE_URL
      ),
      viteSupabaseAnonKey: !!(
        typeof window !== 'undefined' &&
        window.env &&
        window.env.VITE_SUPABASE_ANON_KEY
      ),
      processSupabaseUrl: !!(
        typeof process !== 'undefined' &&
        process.env &&
        process.env.SUPABASE_URL
      ),
      processSupabaseAnonKey: !!(
        typeof process !== 'undefined' &&
        process.env &&
        process.env.SUPABASE_ANON_KEY
      ),
    },
  };
};
