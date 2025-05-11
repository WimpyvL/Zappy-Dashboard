#!/bin/bash

# Apply the tasks migration to add created_by column and status enum
echo "Applying migration to add created_by column and status enum to tasks table..."

# Run the migration script
psql -d postgres://postgres:postgres@localhost:5432/postgres -f supabase/migrations/20250509000000_add_created_by_to_tasks.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
else
  echo "Error applying migration. Please check the error message above."
  exit 1
fi

echo "Tasks table has been updated with created_by column and status enum."
