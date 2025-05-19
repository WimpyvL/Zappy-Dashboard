#!/bin/bash

# Script to apply the note templates migration to the Supabase database

# Set colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Applying Note Templates Migration...${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
    echo "Please install it by following the instructions at: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if the migration file exists
if [ ! -f "supabase/migrations/20250521_add_note_templates.sql" ]; then
    echo -e "${RED}Error: Migration file not found.${NC}"
    echo "Please ensure the file 'supabase/migrations/20250521_add_note_templates.sql' exists."
    exit 1
fi

# Apply the migration
echo "Applying migration: 20250521_add_note_templates.sql"
supabase db push --db-url postgresql://postgres:postgres@localhost:54322/postgres

# Check if the migration was successful
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Migration applied successfully!${NC}"
    echo -e "The following tables have been created:"
    echo -e "  - note_templates: Templates for patient notes"
    echo -e "  - template_placeholders: Available placeholders for templates"
    echo -e "  - consultation_notes: Notes sent to patients"
    echo -e "\nYou can now manage note templates in the admin panel at: /admin/note-templates"
else
    echo -e "${RED}Migration failed.${NC}"
    echo "Please check the error message above and try again."
    exit 1
fi

# Make the script executable
chmod +x apply-note-templates-migration.sh

echo -e "\n${YELLOW}Next steps:${NC}"
echo "1. Add the Note Templates page to your routes in src/constants/AppRoutes.jsx"
echo "2. Add a link to the Note Templates page in your admin sidebar"
echo "3. Update the InitialConsultationNotes.jsx to use the new template system"

exit 0
