#!/bin/bash

# Script to apply the invoice features migration
echo "Applying invoice features migration..."

# Get the database URL from .env file
DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL not found in .env file"
  exit 1
fi

# Apply the migration
psql "$DB_URL" -f supabase/migrations/20250508000000_add_invoice_features.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
else
  echo "Error applying migration"
  exit 1
fi

echo "Done!"
