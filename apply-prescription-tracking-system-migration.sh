#!/bin/bash

# Script to apply the prescription tracking system migration
# This script applies the SQL migration for the prescription tracking system
# including order tracking events, email notifications, and tracking update schedules.

# Set variables
MIGRATION_FILE="supabase/migrations/20250525_add_prescription_tracking_system.sql"
DB_NAME="zappy_health"
DB_USER="postgres"
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
BACKUP_FILE="backup_before_prescription_tracking_${TIMESTAMP}.sql"

# Text colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting prescription tracking system migration...${NC}"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${RED}Error: Migration file not found: $MIGRATION_FILE${NC}"
    exit 1
fi

# Create backup before applying migration
echo -e "${YELLOW}Creating database backup before migration...${NC}"
pg_dump -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to create database backup.${NC}"
    echo -e "${YELLOW}Please check your database connection and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}Backup created successfully: $BACKUP_FILE${NC}"

# Apply migration
echo -e "${YELLOW}Applying migration...${NC}"
psql -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Migration failed.${NC}"
    echo -e "${YELLOW}You can restore the database from the backup using:${NC}"
    echo -e "psql -U $DB_USER -d $DB_NAME -f $BACKUP_FILE"
    exit 1
fi

echo -e "${GREEN}Migration applied successfully!${NC}"

# Verify migration
echo -e "${YELLOW}Verifying migration...${NC}"

# Check if tables were created
TABLES_CHECK=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_name IN ('order_tracking_events', 'email_notifications', 'tracking_update_schedule')
    AND table_schema = 'public';
")

if [ "$TABLES_CHECK" -ne "3" ]; then
    echo -e "${RED}Warning: Not all tables were created. Please check the migration log.${NC}"
else
    echo -e "${GREEN}Tables created successfully.${NC}"
fi

# Check if columns were added to orders table
COLUMNS_CHECK=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name IN ('prescription_status', 'prescription_id', 'tracking_info', 'status_history', 
                        'is_prescription', 'tracking_number', 'carrier', 'estimated_delivery_date')
    AND table_schema = 'public';
")

if [ "$COLUMNS_CHECK" -ne "8" ]; then
    echo -e "${RED}Warning: Not all columns were added to the orders table. Please check the migration log.${NC}"
else
    echo -e "${GREEN}Columns added to orders table successfully.${NC}"
fi

# Check if triggers were created
TRIGGERS_CHECK=$(psql -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*) FROM information_schema.triggers 
    WHERE trigger_name IN ('update_order_status_history_trigger', 
                          'update_prescription_status_history_trigger',
                          'update_order_prescription_status_trigger')
    AND event_object_schema = 'public';
")

if [ "$TRIGGERS_CHECK" -ne "3" ]; then
    echo -e "${RED}Warning: Not all triggers were created. Please check the migration log.${NC}"
else
    echo -e "${GREEN}Triggers created successfully.${NC}"
fi

echo -e "${GREEN}Prescription tracking system migration completed successfully!${NC}"
echo -e "${YELLOW}Please update your environment variables with the necessary API credentials for shipping carriers and SendGrid.${NC}"
