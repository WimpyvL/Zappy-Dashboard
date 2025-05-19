// Script to create a test category directly using Supabase JavaScript API
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestCategory() {
  console.log('Creating test category...');

  try {
    // First, try to create the categories table if it doesn't exist
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
    `;

    // Try to execute the SQL directly
    const { error: createTableError } = await supabase
      .rpc('exec_sql', { sql: createTableSQL });

    if (createTableError) {
      console.log('Could not create table via RPC, will try direct insert anyway:', createTableError);
    } else {
      console.log('Categories table created or already exists.');
    }

    // Now try to insert a test category
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: 'Test Category',
        description: 'This is a test category created via API',
        category_id: 'test-category',
        status: 'active',
        display_order: 0,
        icon: 'test',
        show_in_marketplace: true,
        show_in_admin: true
      })
      .select();

    if (error) {
      console.error('Error creating test category:', error);
      return;
    }

    console.log('Test category created successfully:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the function
createTestCategory()
  .then(() => {
    console.log('Script execution completed.');
  })
  .catch(error => {
    console.error('Script execution failed:', error);
  });
