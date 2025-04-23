import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

async function checkAndAddRoleColumn() {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return;
  }

  try {
    // 1. Try to query the profiles table
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (error) {
      if (error.code === '42P01') { // Table doesn't exist
        console.error('Profiles table does not exist');
        return;
      }
      throw error;
    }

    // 2. Try to insert a record with role field
    const { error: insertError } = await supabase
      .from('profiles')
      .insert([{ role: null }], { returning: 'minimal' });

    if (!insertError) {
      console.log('Role column exists in profiles table');
      return;
    }

    // 3. If insert failed, try to add the column using SQL endpoint
    const { error: alterError } = await supabase
      .from('profiles')
      .insert([{ role: null }], { returning: 'minimal' })
      .select();

    if (alterError && alterError.code === '42703') { // Undefined column error
      // Use service role key for schema modifications
      const serviceKey = process.env.REACT_APP_SUPABASE_SERVICE_KEY;
      if (!serviceKey) {
        console.error('Service role key required for schema modifications');
        return;
      }
      
      const adminClient = createClient(supabaseUrl, serviceKey);
      const { error: sqlError } = await adminClient
        .rpc('execute_sql', {
          query: 'ALTER TABLE profiles ADD COLUMN role text'
        });

      if (sqlError) {
        console.error('Error adding role column:', sqlError);
        return;
      }
    } else if (alterError) {
      console.error('Error adding role column:', alterError);
      return;
    }

    console.log('Successfully added role column to profiles table');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkAndAddRoleColumn().catch(console.error);
