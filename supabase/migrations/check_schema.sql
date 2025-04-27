-- Schema inspection script to verify column names
-- This will help us identify the correct column names in your database

-- Check subscription_plans table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'subscription_plans'
ORDER BY 
    ordinal_position;

-- Check products table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'products'
ORDER BY 
    ordinal_position;

-- Check services table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'services'
ORDER BY 
    ordinal_position;

-- Check if service_products and service_plans tables exist
SELECT 
    table_name
FROM 
    information_schema.tables
WHERE 
    table_name IN ('service_products', 'service_plans')
    AND table_schema = 'public';