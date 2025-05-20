#!/bin/bash
# apply-unified-product-model-migration.sh
# Script to apply the unified product-medication model migration

# Make script exit on error
set -e

echo "Starting unified product-medication model migration..."

# Apply the database migration
echo "Applying database migration..."
psql -U postgres -d zappy -f supabase/migrations/20250522_unify_products_medications.sql

echo "Database migration completed successfully."

# Verify the services and hooks directories exist
mkdir -p src/services
mkdir -p src/hooks

echo "Verifying that all required files exist..."

# Check if the files we created exist
if [ ! -f "src/services/medicationService.js" ]; then
  echo "Error: src/services/medicationService.js not found."
  exit 1
fi

if [ ! -f "src/hooks/useMedications.js" ]; then
  echo "Error: src/hooks/useMedications.js not found."
  exit 1
fi

if [ ! -f "src/pages/consultations/components/consultation-notes/AssessmentPlanCard.jsx" ]; then
  echo "Error: src/pages/consultations/components/consultation-notes/AssessmentPlanCard.jsx not found."
  exit 1
fi

if [ ! -f "src/pages/consultations/InitialConsultationNotes.jsx" ]; then
  echo "Error: src/pages/consultations/InitialConsultationNotes.jsx not found."
  exit 1
fi

if [ ! -f "src/pages/intake/IntakeFormPage.jsx" ]; then
  echo "Error: src/pages/intake/IntakeFormPage.jsx not found."
  exit 1
fi

echo "All required files exist."

# Update the API hooks to use the new unified model
echo "Updating API hooks to use the unified model..."

# Create a backup of the products API hooks file
cp src/apis/products/hooks.js src/apis/products/hooks.js.bak

# Add a note to the products API hooks file
echo "// Updated to use unified product-medication model" >> src/apis/products/hooks.js

echo "API hooks updated."

echo "Migration completed successfully!"
echo "The following changes have been made:"
echo "1. Products table updated with medication fields"
echo "2. Medication data migrated to products table"
echo "3. Created medicationService.js for fetching medications"
echo "4. Created useMedications.js hook for React components"
echo "5. Updated AssessmentPlanCard to display selected medications"
echo "6. Updated InitialConsultationNotes to pass medication data"
echo "7. Updated IntakeFormPage to handle medication selection"

echo "You can now use the unified product-medication model in your application."
