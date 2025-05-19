#!/bin/bash

# Script to apply the messaging tables migration to the Supabase database
# This creates the necessary tables for the messaging system

echo "Applying messaging tables migration..."

# Get the database URL from .env file
if [ -f .env ]; then
  source .env
  DB_URL=$DATABASE_URL
else
  echo "Error: .env file not found. Please create it with DATABASE_URL."
  exit 1
fi

# Check if DATABASE_URL is set
if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL not set in .env file."
  exit 1
fi

# Apply the migration
psql "$DB_URL" -f supabase/migrations/20250513000000_create_messaging_tables.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Messaging tables migration applied successfully!"
else
  echo "Error: Failed to apply messaging tables migration."
  exit 1
fi

echo "Done!"
