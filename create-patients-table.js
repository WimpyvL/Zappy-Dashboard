// Script to create the patients table directly using pg
const { Pool } = require('pg');
require('dotenv').config();

// Get Supabase URL from .env
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
if (!supabaseUrl) {
  console.error('Supabase URL is missing in .env file');
  process.exit(1);
}

// Extract database connection info from Supabase URL
// Format: https://[project-ref].supabase.co
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
if (!projectRef) {
  console.error('Could not extract project reference from Supabase URL');
  process.exit(1);
}

// Connect to local Supabase instance
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 54322, // Default Supabase local port
});

async function createPatientsTable() {
  const client = await pool.connect();
  
  try {
    console.log('Connected to database');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Check if uuid-ossp extension exists
    console.log('Ensuring uuid-ossp extension is available...');
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    
    // Check if patients table exists
    console.log('Checking if patients table exists...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'patients'
      );
    `);
    
    const tableExists = tableCheck.rows[0].exists;
    
    if (!tableExists) {
      console.log('Patients table does not exist. Creating it...');
      
      // Create patients table
      await client.query(`
        CREATE TABLE patients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          first_name VARCHAR(100),
          last_name VARCHAR(100),
          email VARCHAR(255),
          phone VARCHAR(50),
          date_of_birth DATE,
          address TEXT,
          city VARCHAR(100),
          state VARCHAR(50),
          zip VARCHAR(20),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index on patient name for faster searching
        CREATE INDEX idx_patients_name ON patients(first_name, last_name);
        
        -- Create index on patient email for faster searching
        CREATE INDEX idx_patients_email ON patients(email);
      `);
      
      console.log('Patients table created successfully');
    } else {
      console.log('Patients table already exists');
    }
    
    // Insert test patients
    console.log('Adding test patients...');
    
    await client.query(`
      INSERT INTO patients (first_name, last_name, email, phone, date_of_birth, address, city, state, zip)
      VALUES 
        ('Test', 'Patient', 'test.patient@example.com', '555-123-4567', '1990-01-01', '123 Test St', 'Test City', 'TS', '12345'),
        ('Jane', 'Doe', 'jane.doe@example.com', '555-987-6543', '1985-05-15', '456 Sample Ave', 'Sample City', 'SC', '54321')
      ON CONFLICT (email) DO NOTHING;
    `);
    
    // Commit transaction
    await client.query('COMMIT');
    
    // Check if patients were added
    const patientCount = await client.query('SELECT COUNT(*) FROM patients');
    console.log(`There are now ${patientCount.rows[0].count} patients in the database`);
    
    // List all patients
    const patients = await client.query('SELECT * FROM patients');
    console.log('Patients in database:');
    patients.rows.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.first_name} ${patient.last_name} (${patient.email})`);
    });
    
    console.log('Database setup completed successfully');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    // Release client
    client.release();
    // Close pool
    await pool.end();
  }
}

// Run the function
createPatientsTable().catch(err => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
