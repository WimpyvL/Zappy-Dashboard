#!/bin/bash

# Script to apply the invoice tables migration

# Set the path to the migration file
MIGRATION_FILE="supabase/migrations/20250522_add_invoice_tables.sql"

# Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "Error: Migration file not found at $MIGRATION_FILE"
  exit 1
fi

# Apply the migration using the Supabase CLI
echo "Applying migration: $MIGRATION_FILE"
supabase db push

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
else
  echo "Error: Failed to apply migration"
  exit 1
fi

echo "Migration process completed!"