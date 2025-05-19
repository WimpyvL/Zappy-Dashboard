#!/bin/bash

# Script to apply the patient notifications migration to the Supabase database
# This script should be run from the project root directory

echo "Applying patient notifications migration..."

# Check if SUPABASE_URL and SUPABASE_SERVICE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "Loading environment variables from .env.development..."
  export $(grep -v '^#' .env.development | xargs)
fi

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment or .env.development file"
  exit 1
fi

# Apply the migration
echo "Applying migration: 20250519_add_patient_notifications.sql"
psql "$SUPABASE_URL" -f supabase/migrations/20250519_add_patient_notifications.sql

if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
  echo "Patient notifications tables and functions have been created."
  echo ""
  echo "This migration adds:"
  echo "- patient_notifications table"
  echo "- notification_deliveries table"
  echo "- is_published_to_patient column to consultations table"
  echo "- Functions for creating and managing notifications"
  echo "- Row-level security policies for notifications"
else
  echo "Error applying migration. Please check the error message above."
fi
