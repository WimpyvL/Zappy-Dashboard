#!/bin/bash

# Script to apply the AI summaries migration to the Supabase database

# Set variables
MIGRATION_FILE="supabase/migrations/20250521_add_ai_summaries.sql"
DB_URL=${SUPABASE_DB_URL:-"postgresql://postgres:postgres@localhost:54322/postgres"}

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "Applying AI summaries migration..."

# Apply migration
psql "$DB_URL" -f "$MIGRATION_FILE"

# Check if migration was successful
if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
    
    # Add migration to applied_migrations table if it exists
    psql "$DB_URL" -c "INSERT INTO applied_migrations (name, applied_at) VALUES ('20250521_add_ai_summaries', NOW()) ON CONFLICT DO NOTHING;" 2>/dev/null
    
    echo "AI summaries tables and default data have been created."
    echo "You can now use the AI summarization features in the application."
else
    echo "Error: Failed to apply migration."
    exit 1
fi