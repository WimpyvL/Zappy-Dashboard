-- Create PostgreSQL Functions for Service Management
-- Date: April 27, 2025

-- Function to get a service with all its relationships in a single query
CREATE OR REPLACE FUNCTION get_service_with_relationships(service_id uuid)
RETURNS jsonb 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    service_data jsonb;
    associated_products jsonb;
    available_plans jsonb;
BEGIN
    -- Get basic service data
    SELECT to_jsonb(s) INTO service_data
    FROM services s
    WHERE s.id = service_id;
    
    IF service_data IS NULL THEN
        RETURN NULL;
    END IF;
    
    -- Get associated products
    SELECT jsonb_agg(p.product_id) INTO associated_products
    FROM service_products p
    WHERE p.service_id = service_id;
    
    -- Get available plans with configuration
    SELECT jsonb_agg(
        jsonb_build_object(
            'planId', sp.plan_id,
            'duration', sp.duration,
            'requiresSubscription', sp.requires_subscription,
            'plan', to_jsonb(pl)
        )
    ) INTO available_plans
    FROM service_plans sp
    JOIN subscription_plans pl ON sp.plan_id = pl.id
    WHERE sp.service_id = service_id;
    
    -- Combine all data
    RETURN jsonb_set(
        jsonb_set(
            service_data, 
            '{associatedProducts}', 
            COALESCE(associated_products, '[]'::jsonb)
        ),
        '{availablePlans}', 
        COALESCE(available_plans, '[]'::jsonb)
    );
END;
$$;
COMMENT ON FUNCTION get_service_with_relationships(uuid) IS 'Gets a service by ID with its associated products and subscription plans in a single query';

-- Function to list services with relationships, supporting pagination and filtering
CREATE OR REPLACE FUNCTION list_services_with_relationships(
    page_number integer DEFAULT 1,
    page_size integer DEFAULT 10,
    search_term text DEFAULT NULL,
    is_active boolean DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    services_data jsonb;
    services_count integer;
    service_ids uuid[];
    products_data jsonb;
    plans_data jsonb;
    result jsonb;
    offset_val integer;
BEGIN
    -- Calculate offset
    offset_val := (page_number - 1) * page_size;
    
    -- Get filtered services with pagination
    WITH filtered_services AS (
        SELECT s.id 
        FROM services s
        WHERE 
            (is_active IS NULL OR s.is_active = is_active)
            AND (
                search_term IS NULL 
                OR s.name ILIKE '%' || search_term || '%'
                OR s.description ILIKE '%' || search_term || '%'
            )
        ORDER BY s.name
        LIMIT page_size OFFSET offset_val
    )
    SELECT array_agg(id) INTO service_ids FROM filtered_services;
    
    -- Count total matching records (without pagination)
    SELECT COUNT(*) INTO services_count
    FROM services s
    WHERE 
        (is_active IS NULL OR s.is_active = is_active)
        AND (
            search_term IS NULL 
            OR s.name ILIKE '%' || search_term || '%'
            OR s.description ILIKE '%' || search_term || '%'
        );
    
    -- If no services found, return empty result
    IF service_ids IS NULL OR array_length(service_ids, 1) IS NULL THEN
        RETURN jsonb_build_object(
            'data', '[]'::jsonb,
            'meta', jsonb_build_object(
                'total', services_count,
                'per_page', page_size,
                'current_page', page_number,
                'last_page', CEIL(services_count::numeric / page_size)
            )
        );
    END IF;
    
    -- Get basic service data
    SELECT jsonb_agg(to_jsonb(s)) INTO services_data
    FROM services s
    WHERE s.id = ANY(service_ids)
    ORDER BY s.name;
    
    -- Get all associated products for these services in one query
    SELECT jsonb_object_agg(
        sp.service_id,
        jsonb_agg(sp.product_id)
    ) INTO products_data
    FROM service_products sp
    WHERE sp.service_id = ANY(service_ids)
    GROUP BY sp.service_id;
    
    -- Get all available plans for these services in one query
    WITH plan_data AS (
        SELECT 
            sp.service_id,
            jsonb_build_object(
                'planId', sp.plan_id,
                'duration', sp.duration,
                'requiresSubscription', sp.requires_subscription
            ) as plan_config
        FROM service_plans sp
        WHERE sp.service_id = ANY(service_ids)
    )
    SELECT jsonb_object_agg(
        service_id,
        jsonb_agg(plan_config)
    ) INTO plans_data
    FROM plan_data
    GROUP BY service_id;
    
    -- Combine service data with relationships
    WITH enriched_services AS (
        SELECT 
            jsonb_set(
                jsonb_set(
                    s, 
                    '{associatedProducts}', 
                    COALESCE(products_data->>(s->>'id'), '[]'::jsonb)
                ),
                '{availablePlans}', 
                COALESCE(plans_data->>(s->>'id'), '[]'::jsonb)
            ) as service
        FROM jsonb_array_elements(services_data) s
    )
    SELECT jsonb_agg(service) INTO result
    FROM enriched_services;
    
    -- Return final paginated result with metadata
    RETURN jsonb_build_object(
        'data', COALESCE(result, '[]'::jsonb),
        'meta', jsonb_build_object(
            'total', services_count,
            'per_page', page_size,
            'current_page', page_number,
            'last_page', CEIL(services_count::numeric / page_size)
        )
    );
END;
$$;
COMMENT ON FUNCTION list_services_with_relationships(integer, integer, text, boolean) IS 'Lists services with associated products and subscription plans, supporting pagination and filtering';

-- Create secure access policies for these functions
DO $$
BEGIN
    -- Grant execute permission to authenticated users
    EXECUTE 'GRANT EXECUTE ON FUNCTION get_service_with_relationships(uuid) TO authenticated';
    EXECUTE 'GRANT EXECUTE ON FUNCTION list_services_with_relationships(integer, integer, text, boolean) TO authenticated';
END
$$;