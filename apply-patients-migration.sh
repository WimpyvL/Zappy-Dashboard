#!/bin/bash

# Script to apply the patients table migration
echo "Applying migration to create patients table..."

# Navigate to the supabase directory
cd supabase

# Apply the migration using Supabase CLI
supabase db push --db-url postgresql://postgres:postgres@localhost:54322/postgres

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo "✅ Migration applied successfully!"
else
    echo "❌ Migration failed. Please check the error message above."
    exit 1
fi

# Return to the original directory
cd ..

echo "Done!"
