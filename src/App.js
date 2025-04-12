import React, { useEffect } from 'react';
import './App.css';
import AppRoutes from './constants/AppRoutes';
import { ToastContainer } from 'react-toastify';
// Import the Tempo Devtools
import { TempoDevtools } from 'tempo-devtools';
// Import debug utility
import { debugSupabaseConnection } from './utils/debugSupabase';
// Import supabase client to ensure it's initialized early
import { supabase } from './utils/supabaseClient';
// Providers and Router are now in src/index.js

function App() {
  // Initialize Tempo Devtools
  useEffect(() => {
    if (process.env.REACT_APP_TEMPO === 'true') {
      TempoDevtools.init();
    }

    // Debug Supabase connection on startup
    const connectionStatus = debugSupabaseConnection();
    console.log('Supabase connection status:', connectionStatus);

    // Test Supabase connection with error handling and fallback
    const testSupabaseConnection = async () => {
      try {
        // First check if the client_record table exists
        const { error } = await supabase
          .from('client_record')
          .select('*')
          .limit(1);

        if (error) {
          console.error('Supabase connection test error:', error.message);

          // If the table doesn't exist, try another table as fallback
          console.log('Trying fallback table...');
          const { error: fallbackError } = await supabase
            .from('users')
            .select('*')
            .limit(1);

          if (fallbackError) {
            console.error('Fallback table error:', fallbackError.message);
          } else {
            console.log('Supabase connection successful using fallback table');
          }
        } else {
          console.log('Supabase connection test successful');
        }
      } catch (err) {
        console.error('Supabase connection test exception:', err.message);
      }
    };

    testSupabaseConnection();
  }, []);

  // Providers and Router are now wrapping <App /> in src/index.js
  return (
    <>
      <AppRoutes />
      <ToastContainer />
    </>
  );
}

export default App;
