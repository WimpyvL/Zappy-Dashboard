#!/bin/bash

# Apply the subscription durations migration
echo "Applying subscription durations migration..."

# Navigate to the supabase directory
cd supabase

# Run the migration
psql -U postgres -d postgres -f migrations/20250523_add_subscription_durations.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "✅ Subscription durations migration applied successfully!"
else
  echo "❌ Error applying subscription durations migration."
  exit 1
fi

# Return to the original directory
cd ..

echo "Migration process completed."
