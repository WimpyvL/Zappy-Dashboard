#!/bin/bash

# Apply the bundles migration to the Supabase database

echo "Applying bundles migration..."

# Get the database URL from the .env file if it exists
if [ -f .env ]; then
  source .env
fi

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set. Please set it in your .env file or environment."
  exit 1
fi

# Apply the migration
psql "$DATABASE_URL" -f supabase/migrations/20250515000000_create_bundles_table.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Bundles migration applied successfully!"
else
  echo "Error: Failed to apply bundles migration."
  exit 1
fi

echo "Bundles setup complete!"
