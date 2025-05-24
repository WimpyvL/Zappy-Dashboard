-- Maintenance and cleanup procedures for Stripe webhook tables

-- Function to clean up old events
CREATE OR REPLACE FUNCTION cleanup_old_events(retention_days integer)
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM stripe_events
  WHERE created < (CURRENT_TIMESTAMP - (retention_days * interval '1 day'))
  AND type NOT IN (
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted'
  );
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to archive old events to a partition
CREATE OR REPLACE FUNCTION archive_events(cutoff_date timestamp)
RETURNS integer AS $$
DECLARE
  archived_count integer;
BEGIN
  INSERT INTO stripe_events_archive
  SELECT *
  FROM stripe_events
  WHERE created < cutoff_date;
  
  DELETE FROM stripe_events
  WHERE created < cutoff_date;
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up failed recovery attempts
CREATE OR REPLACE FUNCTION cleanup_recovery_attempts()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM payment_recovery_attempts
  WHERE status = 'failed'
  AND attempt_number >= 3
  AND updated_at < (CURRENT_TIMESTAMP - interval '30 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to analyze table statistics
CREATE OR REPLACE FUNCTION analyze_tables()
RETURNS void AS $$
BEGIN
  ANALYZE VERBOSE stripe_events;
  ANALYZE VERBOSE patient_invoices;
  ANALYZE VERBOSE payment_recovery_attempts;
END;
$$ LANGUAGE plpgsql;

-- Function to get table statistics
CREATE OR REPLACE FUNCTION get_table_stats(table_name text)
RETURNS TABLE (
  row_count bigint,
  total_bytes bigint,
  index_bytes bigint,
  dead_rows bigint
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    reltuples::bigint AS row_count,
    pg_total_relation_size(c.oid) AS total_bytes,
    pg_indexes_size(c.oid) AS index_bytes,
    (SELECT n_dead_tup FROM pg_stat_user_tables WHERE relname = table_name)::bigint AS dead_rows
  FROM pg_class c
  WHERE c.relname = table_name;
END;
$$ LANGUAGE plpgsql;

-- Function to get table performance metrics
CREATE OR REPLACE FUNCTION get_table_performance(
  table_name text,
  hours integer DEFAULT 24
)
RETURNS TABLE (
  avg_query_time float,
  error_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(AVG(EXTRACT(MILLISECOND FROM duration)), 0) AS avg_query_time,
    COUNT(*) FILTER (WHERE error IS NOT NULL)::integer AS error_count
  FROM pg_stat_statements s
  WHERE query ILIKE '%' || table_name || '%'
  AND calls > 0
  AND query NOT ILIKE '%pg_stat_statements%'
  AND query_start > (CURRENT_TIMESTAMP - (hours * interval '1 hour'));
END;
$$ LANGUAGE plpgsql;

-- Maintenance procedure to run all cleanup tasks
CREATE OR REPLACE PROCEDURE maintain_webhook_tables(
  event_retention_days integer DEFAULT 90,
  archive_cutoff_days integer DEFAULT 180
)
LANGUAGE plpgsql
AS $$
DECLARE
  events_cleaned integer;
  events_archived integer;
  attempts_cleaned integer;
BEGIN
  -- Clean up old events
  events_cleaned := cleanup_old_events(event_retention_days);
  RAISE NOTICE 'Cleaned up % old events', events_cleaned;

  -- Archive older events
  events_archived := archive_events(CURRENT_TIMESTAMP - (archive_cutoff_days * interval '1 day'));
  RAISE NOTICE 'Archived % events', events_archived;

  -- Clean up failed recovery attempts
  attempts_cleaned := cleanup_recovery_attempts();
  RAISE NOTICE 'Cleaned up % failed recovery attempts', attempts_cleaned;

  -- Analyze tables for query optimization
  PERFORM analyze_tables();
  RAISE NOTICE 'Table statistics updated';

  -- Vacuum tables if needed
  VACUUM ANALYZE stripe_events;
  VACUUM ANALYZE patient_invoices;
  VACUUM ANALYZE payment_recovery_attempts;
  RAISE NOTICE 'Vacuum complete';
END;
$$;

-- Create maintenance schedule
SELECT cron.schedule(
  'webhook-maintenance',
  '0 2 * * *',  -- Run at 2 AM daily
  $$
  CALL maintain_webhook_tables();
  $$
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stripe_events_created ON stripe_events(created);
CREATE INDEX IF NOT EXISTS idx_stripe_events_type ON stripe_events(type);
CREATE INDEX IF NOT EXISTS idx_payment_recovery_status ON payment_recovery_attempts(status);
CREATE INDEX IF NOT EXISTS idx_patient_invoices_payment_intent ON patient_invoices(stripe_payment_intent_id);

-- Comments for documentation
COMMENT ON FUNCTION cleanup_old_events IS 'Removes old webhook events based on retention period';
COMMENT ON FUNCTION archive_events IS 'Moves old events to archive table';
COMMENT ON FUNCTION cleanup_recovery_attempts IS 'Removes failed recovery attempts older than 30 days';
COMMENT ON FUNCTION analyze_tables IS 'Updates table statistics for query optimization';
COMMENT ON FUNCTION get_table_stats IS 'Returns current table statistics';
COMMENT ON FUNCTION get_table_performance IS 'Returns performance metrics for specified table';
COMMENT ON PROCEDURE maintain_webhook_tables IS 'Runs all maintenance tasks for webhook tables';