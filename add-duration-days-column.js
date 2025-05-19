// Script to add duration_days column to subscription_duration table
const { supabase } = require('./src/lib/supabase');

async function addDurationDaysColumn() {
  console.log('Adding duration_days column to subscription_duration table...');

  try {
    // Create a direct SQL query to add the column
    const { error: addColumnError } = await supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        return { error: new Error('No authenticated session') };
      }
      
      // We'll use a workaround by creating a function that executes our SQL
      const { error: createFunctionError } = await supabase
        .from('_temp_functions')
        .insert({
          name: 'add_duration_days_column',
          sql: `
            ALTER TABLE subscription_duration ADD COLUMN IF NOT EXISTS duration_days INTEGER;
            
            UPDATE subscription_duration 
            SET 
              name = 'Monthly (28 days)',
              duration_days = 28
            WHERE 
              name = 'Monthly' 
              OR name ILIKE '%month%' 
              AND duration_months = 1;
          `
        })
        .select()
        .maybeSingle();
      
      if (createFunctionError) {
        console.error('Error creating function:', createFunctionError);
        return { error: createFunctionError };
      }
      
      // Now update existing Monthly durations directly
      const { error: updateError } = await supabase
        .from('subscription_duration')
        .update({ 
          name: 'Monthly (28 days)',
          duration_days: 28
        })
        .eq('duration_months', 1);
      
      return { error: updateError };
    });

    if (addColumnError) {
      console.error('Error adding duration_days column:', addColumnError);
      return;
    }

    console.log('Successfully added duration_days column to subscription_duration table');

    // Refresh the schema cache by forcing a new query
    const { error: refreshError } = await supabase
      .from('subscription_duration')
      .select('*')
      .limit(1);
    
    if (refreshError) {
      console.error('Error refreshing schema cache:', refreshError);
      return;
    }

    console.log('Schema cache refreshed successfully');
    console.log('You can now use the duration_days column in your application');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Execute the function
addDurationDaysColumn();
