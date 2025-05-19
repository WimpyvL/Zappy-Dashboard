#!/bin/bash

# Script to apply the subscription duration table migration

echo "Applying subscription duration table migration..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: supabase CLI is not installed."
    echo "Please install it by following the instructions at: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Navigate to the project root directory
cd "$(dirname "$0")"

# Apply the migration
echo "Running migration: 20240504000000_add_duration_days_to_subscription_duration.sql"
supabase db push

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
    echo "The subscription_duration table now has the following new column:"
    echo "- duration_days: Optional field for exact day-based durations (e.g., 28 days)"
    echo ""
    echo "You can now use the SubscriptionDurationsPage with the duration_days field properly connected to the database."
else
    echo "Error: Failed to apply the migration."
    echo "Please check the error message above and try again."
    exit 1
fi

echo "Done!"
