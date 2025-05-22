#!/bin/bash

# Apply the product recommendation rules migration
echo "Applying product recommendation rules migration..."
psql -U postgres -d zappy_telehealth -f supabase/migrations/20250524_add_product_recommendation_rules.sql

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration applied successfully!"
else
  echo "Error applying migration."
  exit 1
fi

echo "Done!"
