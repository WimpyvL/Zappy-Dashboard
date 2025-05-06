#!/bin/bash

# Script to apply the orders table migration

echo "Applying orders table migration..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: supabase CLI is not installed."
    echo "Please install it by following the instructions at: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Navigate to the project root directory
cd "$(dirname "$0")"

# Apply the migration
echo "Running migration: 20250507000000_add_missing_columns_to_orders.sql"
supabase db push

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
    echo "The orders table now has the following new columns:"
    echo "- pharmacy_id: Links to the pharmacy record"
    echo "- linked_session_id: Links to the related session record"
    echo "- hold_reason: Reason for holding a pending order"
    echo "- tracking_number: Tracking number for shipped orders"
    echo "- estimated_delivery: Estimated delivery date for shipped orders"
    echo ""
    echo "You can now use the CreateOrderModal with all its fields properly connected to the database."
else
    echo "Error: Failed to apply the migration."
    echo "Please check the error message above and try again."
    exit 1
fi

echo "Done!"
