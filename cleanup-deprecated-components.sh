#!/bin/bash

# Script to remove deprecated components from the codebase
# This addresses the issue identified in the QA review

echo "Starting cleanup of deprecated components..."

# List of deprecated files to remove
DEPRECATED_FILES=(
  "src/pages/admin/TreatmentPackagesPage.jsx"
  "src/pages/admin/TreatmentPackageForm.jsx"
  "src/components/subscriptions/TreatmentPackageSelection.jsx"
  "src/apis/treatmentPackages/hooks.js"
  "src/apis/treatmentPackages/DEPRECATED.md"
  "src/pages/products/ProductManagement.jsx"
  "src/apis/products/DEPRECATED.md"
  "src/apis/services/DEPRECATED.md"
)

# Remove each file
for file in "${DEPRECATED_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Removing $file"
    rm "$file"
  else
    echo "File $file not found, skipping"
  fi
done

# Update import references in the codebase
echo "Updating import references..."

# Find all JavaScript and JSX files
JS_FILES=$(find src -type f \( -name "*.js" -o -name "*.jsx" \) -not -path "*/node_modules/*")

# Patterns to search and replace
PATTERNS=(
  "import.*from.*treatmentPackages\/hooks"
  "import.*from.*\/TreatmentPackagesPage"
  "import.*from.*\/TreatmentPackageForm"
  "import.*from.*\/TreatmentPackageSelection"
  "import.*TreatmentPackagesPage"
  "import.*TreatmentPackageForm"
  "import.*TreatmentPackageSelection"
  "<TreatmentPackageSelection"
  "<TreatmentPackagesPage"
  "<TreatmentPackageForm"
)

# Loop through each file and remove deprecated imports
for file in $JS_FILES; do
  for pattern in "${PATTERNS[@]}"; do
    # Check if the pattern exists in the file
    if grep -q "$pattern" "$file"; then
      echo "Updating references in $file"
      # Create a temporary file
      TEMP_FILE=$(mktemp)
      # Remove lines matching the pattern
      grep -v "$pattern" "$file" > "$TEMP_FILE"
      # Replace the original file
      mv "$TEMP_FILE" "$file"
    fi
  done
done

# Update route references in AppRoutes.jsx
if [ -f "src/constants/AppRoutes.jsx" ]; then
  echo "Updating route references in AppRoutes.jsx"
  TEMP_FILE=$(mktemp)
  grep -v "TreatmentPackages" "src/constants/AppRoutes.jsx" > "$TEMP_FILE"
  mv "$TEMP_FILE" "src/constants/AppRoutes.jsx"
fi

# Update sidebar references in SidebarItems.js
if [ -f "src/constants/SidebarItems.js" ]; then
  echo "Updating sidebar references in SidebarItems.js"
  TEMP_FILE=$(mktemp)
  grep -v "TreatmentPackages" "src/constants/SidebarItems.js" > "$TEMP_FILE"
  mv "$TEMP_FILE" "src/constants/SidebarItems.js"
fi

echo "Cleanup of deprecated components complete!"
echo "Note: You may need to manually update any remaining references to these components."
