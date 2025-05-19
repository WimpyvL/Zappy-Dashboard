#!/bin/bash

# Script to apply the educational resources migration to the database

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
  echo "Loaded environment variables from .env file"
else
  echo "Error: .env file not found"
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  exit 1
fi

# Apply the migration
echo "Applying educational resources migration..."
psql "$DATABASE_URL" -f supabase/migrations/20240505000000_create_educational_resources.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
  echo "Educational resources tables have been created and sample data has been inserted."
  echo "The application will now use real data from the database instead of mock data."
else
  echo "Error: Failed to apply migration"
  echo "Make sure PostgreSQL client tools are installed and the DATABASE_URL is correct."
  echo "Alternatively, you can apply the migration manually through the Supabase dashboard."
  exit 1
fi

echo "Done!"
