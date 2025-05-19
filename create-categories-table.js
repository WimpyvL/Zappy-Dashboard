// Script to create the categories table using Supabase JavaScript API
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createCategoriesTable() {
  console.log('Creating categories table...');

  try {
    // Check if the table already exists
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'categories');

    if (tablesError) {
      console.error('Error checking if table exists:', tablesError);
      return;
    }

    if (existingTables && existingTables.length > 0) {
      console.log('Categories table already exists.');
      return;
    }

    // Create the categories table using RPC
    const { error: rpcError } = await supabase.rpc('create_categories_table');

    if (rpcError) {
      console.error('Error creating categories table via RPC:', rpcError);
      
      // If RPC fails, try creating the table using raw SQL via functions
      console.log('Attempting to create table via SQL function...');
      
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS categories (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          description TEXT,
          category_id VARCHAR(100) NOT NULL UNIQUE,
          status VARCHAR(50) NOT NULL DEFAULT 'active',
          display_order INTEGER NOT NULL DEFAULT 0,
          icon VARCHAR(100),
          show_in_marketplace BOOLEAN NOT NULL DEFAULT TRUE,
          show_in_admin BOOLEAN NOT NULL DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_categories_category_id ON categories(category_id);
        CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status);
      `;
      
      const { error: sqlFunctionError } = await supabase.functions.invoke('execute-sql', {
        body: { sql: createTableSQL }
      });
      
      if (sqlFunctionError) {
        console.error('Error creating categories table via SQL function:', sqlFunctionError);
        return;
      }
    }

    console.log('Categories table created successfully!');

    // Add foreign key constraints to related tables
    const addForeignKeysSQL = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'products' AND column_name = 'category') THEN
          ALTER TABLE products ADD COLUMN category VARCHAR(100) REFERENCES categories(category_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'subscription_plans' AND column_name = 'category') THEN
          ALTER TABLE subscription_plans ADD COLUMN category VARCHAR(100) REFERENCES categories(category_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'services' AND column_name = 'category') THEN
          ALTER TABLE services ADD COLUMN category VARCHAR(100) REFERENCES categories(category_id);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'bundles' AND column_name = 'category') THEN
          ALTER TABLE bundles ADD COLUMN category VARCHAR(100) REFERENCES categories(category_id);
        END IF;
      END $$;
    `;

    const { error: foreignKeysError } = await supabase.functions.invoke('execute-sql', {
      body: { sql: addForeignKeysSQL }
    });

    if (foreignKeysError) {
      console.error('Error adding foreign key constraints:', foreignKeysError);
      return;
    }

    console.log('Foreign key constraints added successfully!');
    console.log('Categories setup complete!');
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createCategoriesTable()
  .then(() => {
    console.log('Script execution completed.');
  })
  .catch(error => {
    console.error('Script execution failed:', error);
  });
