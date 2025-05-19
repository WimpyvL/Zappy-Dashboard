#!/bin/bash

# Script to apply the follow-up system migration

echo "Applying follow-up system migration..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: supabase CLI is not installed."
    echo "Please install it by following the instructions at: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Navigate to the project root directory
cd "$(dirname "$0")"

# Apply the migration
echo "Running migration: 20250520_add_follow_up_system.sql"
supabase db push

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
    echo "The follow-up system tables have been created:"
    echo "- follow_up_templates: Stores templates for different types of follow-ups"
    echo "- patient_follow_ups: Tracks scheduled follow-ups for patients"
    echo "- scheduled_notifications: Manages notifications for follow-ups"
    echo ""
    echo "Default follow-up templates have been created for:"
    echo "- Weight Management (2-week and 4-week follow-ups)"
    echo "- ED (4-week follow-up)"
else
    echo "Error: Failed to apply the migration."
    echo "Please check the error message above and try again."
    exit 1
fi

echo "Done!"
