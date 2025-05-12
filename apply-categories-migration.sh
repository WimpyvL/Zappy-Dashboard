#!/bin/bash

# Apply the categories migration to the Supabase database

echo "Applying categories migration..."

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
psql "$DATABASE_URL" -f supabase/migrations/20240501000000_create_categories_table.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Categories migration applied successfully!"
else
  echo "Error: Failed to apply categories migration."
  exit 1
fi

echo "Categories setup complete!"
