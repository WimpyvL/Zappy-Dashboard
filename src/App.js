import React, { useEffect } from 'react';
import './App.css';
import AppRoutes from './constants/AppRoutes';
import { ToastContainer } from 'react-toastify';
// Import the Tempo Devtools
import { TempoDevtools } from 'tempo-devtools';
// Import the correct supabase client
import { supabase } from './lib/supabase';
// Providers and Router are now in src/index.js

function App() {
  // Initialize Tempo Devtools
  useEffect(() => {
    if (
      process.env.REACT_APP_TEMPO === 'true' ||
      process.env.TEMPO === 'true'
    ) {
      TempoDevtools.init();
    }

    // Test Supabase connection with error handling using the correct client
    const testSupabaseConnection = async () => {
      try {
        // First check if the test table exists
        // Removed unused 'data' variable from destructuring
        const { error } = await supabase
          .from('client_record')
          .select('*')
          .limit(1);

        if (error) {
          console.error('Supabase connection test error:', error.message);
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
