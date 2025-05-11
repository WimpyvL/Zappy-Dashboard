#!/bin/bash

# Script to apply the provider table updates migration

echo "Applying provider table updates migration..."

# Run the migration file
psql -f supabase/migrations/20250510000000_update_providers_table.sql

echo "Migration completed successfully!"
echo "Provider table has been updated with new fields for professional details and availability."
echo "Row-level security policies have been applied for role-based access control."
