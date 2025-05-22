#!/bin/bash

# Script to apply the subscription plan enhancements migration
# Date: May 21, 2025

echo "Applying subscription plan enhancements migration..."

# Navigate to the project directory
cd "$(dirname "$0")"

# Run the migration using Supabase CLI
npx supabase migration up --file 20250521000000_enhance_subscription_plans.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "✅ Migration applied successfully!"
  echo "New fields added to subscription_plans table:"
  echo "  - is_default: Indicates if this is the default recommended plan"
  echo "  - is_featured: Indicates if this plan should be featured/highlighted in comparisons"
  echo "  - comparison_order: Order in which plans should appear in comparison views"
  echo "  - availability_rules: Rules for plan availability (user groups, regions, etc.)"
  
  echo ""
  echo "A trigger has been created to ensure only one plan can be default per category."
  echo ""
  echo "You can now use these fields in the ProductManagement.jsx and PlanComparisonView.jsx components."
else
  echo "❌ Migration failed. Please check the error message above."
  exit 1
fi

echo ""
echo "To verify the migration, you can run:"
echo "npx supabase db diff"