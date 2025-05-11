// Script to add a test patient to the database
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from .env file
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or key is missing in .env file');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 10) + '...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test patient data
const testPatient = {
  first_name: 'Test',
  last_name: 'Patient',
  email: 'test.patient@example.com',
  phone: '555-123-4567',
  date_of_birth: '1990-01-01',
  address: '123 Test St',
  city: 'Test City',
  state: 'TS',
  zip: '12345',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function addTestPatient() {
  try {
    console.log('Adding test patient to database...');
    
    // First check if the patients table exists
    const { data: tableExists, error: tableError } = await supabase
      .from('patients')
      .select('count(*)', { count: 'exact', head: true });
    
    if (tableError) {
      console.error('Error checking patients table:', tableError);
      if (tableError.code === '42P01') { // Table doesn't exist
        console.error('The patients table does not exist. Please create it first.');
        process.exit(1);
      }
      throw tableError;
    }
    
    console.log('Patients table exists, proceeding...');
    
    // Check if test patient already exists
    const { data: existingPatients, error: searchError } = await supabase
      .from('patients')
      .select('*')
      .eq('email', testPatient.email);
    
    if (searchError) {
      console.error('Error searching for existing patient:', searchError);
      throw searchError;
    }
    
    if (existingPatients && existingPatients.length > 0) {
      console.log('Test patient already exists:', existingPatients[0]);
      return existingPatients[0];
    }
    
    // Insert test patient
    const { data, error } = await supabase
      .from('patients')
      .insert([testPatient])
      .select();
    
    if (error) {
      console.error('Error adding test patient:', error);
      throw error;
    }
    
    console.log('Test patient added successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error in addTestPatient function:', error);
    throw error;
  }
}

// Add a second test patient with a different name
const testPatient2 = {
  first_name: 'Jane',
  last_name: 'Doe',
  email: 'jane.doe@example.com',
  phone: '555-987-6543',
  date_of_birth: '1985-05-15',
  address: '456 Sample Ave',
  city: 'Sample City',
  state: 'SC',
  zip: '54321',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function addSecondTestPatient() {
  try {
    console.log('Adding second test patient to database...');
    
    // Check if second test patient already exists
    const { data: existingPatients, error: searchError } = await supabase
      .from('patients')
      .select('*')
      .eq('email', testPatient2.email);
    
    if (searchError) {
      console.error('Error searching for existing patient:', searchError);
      throw searchError;
    }
    
    if (existingPatients && existingPatients.length > 0) {
      console.log('Second test patient already exists:', existingPatients[0]);
      return existingPatients[0];
    }
    
    // Insert second test patient
    const { data, error } = await supabase
      .from('patients')
      .insert([testPatient2])
      .select();
    
    if (error) {
      console.error('Error adding second test patient:', error);
      throw error;
    }
    
    console.log('Second test patient added successfully:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error in addSecondTestPatient function:', error);
    throw error;
  }
}

// Run the functions
async function run() {
  try {
    await addTestPatient();
    await addSecondTestPatient();
    
    // List all patients to verify
    const { data: allPatients, error: listError } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (listError) {
      console.error('Error listing patients:', listError);
      throw listError;
    }
    
    console.log(`Found ${allPatients.length} patients in the database:`);
    allPatients.forEach((patient, index) => {
      console.log(`${index + 1}. ${patient.first_name} ${patient.last_name} (${patient.email})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error running script:', error);
    process.exit(1);
  }
}

run();
