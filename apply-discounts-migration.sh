#!/bin/bash

# Script to apply the discounts table migration

echo "Applying discounts table migration..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Error: supabase CLI is not installed."
    echo "Please install it by following the instructions at: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Navigate to the project root directory
cd "$(dirname "$0")"

# Apply the migration
echo "Running migration: 20250507000100_add_subscription_plan_id_to_discounts.sql"
supabase db push

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo "Migration applied successfully!"
    echo "A new junction table has been created:"
    echo "- discount_subscription_plans: Links discounts to subscription plans in a many-to-many relationship"
    echo ""
    echo "You can now use the DiscountManagement page with multi-select subscription plan selection."
else
    echo "Error: Failed to apply the migration."
    echo "Please check the error message above and try again."
    exit 1
fi

echo "Done!"
