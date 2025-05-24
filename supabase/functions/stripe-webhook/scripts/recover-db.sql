-- Recovery procedures for webhook handler database

-- Function to identify missing or inconsistent events
CREATE OR REPLACE FUNCTION find_missing_events()
RETURNS TABLE (
  payment_intent_id text,
  subscription_id text,
  event_type text,
  status text,
  created_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  -- Find payments without corresponding events
  SELECT 
    pi.stripe_payment_intent_id,
    pi.subscription_id::text,
    'payment_intent.succeeded'::text as event_type,
    pi.status,
    pi.created_at
  FROM patient_invoices pi
  LEFT JOIN stripe_events se 
    ON se.data->>'id' = pi.stripe_payment_intent_id 
    AND se.type = 'payment_intent.succeeded'
  WHERE se.id IS NULL
  AND pi.status = 'succeeded'
  
  UNION ALL
  
  -- Find subscriptions without proper event history
  SELECT 
    NULL as payment_intent_id,
    ps.id::text,
    'customer.subscription.updated'::text as event_type,
    ps.status,
    ps.created_at
  FROM patient_subscriptions ps
  LEFT JOIN stripe_events se 
    ON se.data->>'id' = ps.stripe_subscription_id 
    AND se.type LIKE 'customer.subscription.%'
  WHERE se.id IS NULL;
END;
$$ LANGUAGE plpgsql;

-- Function to reconcile payment statuses with Stripe
CREATE OR REPLACE FUNCTION reconcile_payment_status(
  p_payment_intent_id text,
  p_stripe_status text,
  p_amount integer,
  p_created_at timestamptz
)
RETURNS void AS $$
BEGIN
  -- Update payment status if different
  UPDATE patient_invoices
  SET 
    status = p_stripe_status,
    updated_at = CURRENT_TIMESTAMP,
    reconciled_at = CURRENT_TIMESTAMP
  WHERE stripe_payment_intent_id = p_payment_intent_id
  AND status != p_stripe_status;

  -- Create recovery event record
  INSERT INTO stripe_events (
    event_id,
    type,
    data,
    created,
    livemode,
    request_id,
    reconciliation
  ) VALUES (
    'evt_rec_' || substr(md5(random()::text), 1, 24),
    'payment_intent.' || p_stripe_status,
    jsonb_build_object(
      'object', jsonb_build_object(
        'id', p_payment_intent_id,
        'status', p_stripe_status,
        'amount', p_amount,
        'reconciled', true
      )
    ),
    EXTRACT(epoch FROM p_created_at)::bigint,
    false,
    'req_reconciliation',
    true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to reconcile subscription statuses with Stripe
CREATE OR REPLACE FUNCTION reconcile_subscription_status(
  p_subscription_id text,
  p_stripe_status text,
  p_current_period_end timestamptz,
  p_created_at timestamptz
)
RETURNS void AS $$
BEGIN
  -- Update subscription status if different
  UPDATE patient_subscriptions
  SET 
    status = p_stripe_status,
    current_period_end = p_current_period_end,
    updated_at = CURRENT_TIMESTAMP,
    reconciled_at = CURRENT_TIMESTAMP
  WHERE stripe_subscription_id = p_subscription_id
  AND status != p_stripe_status;

  -- Create recovery event record
  INSERT INTO stripe_events (
    event_id,
    type,
    data,
    created,
    livemode,
    request_id,
    reconciliation
  ) VALUES (
    'evt_rec_' || substr(md5(random()::text), 1, 24),
    'customer.subscription.' || 
      CASE WHEN p_stripe_status = 'canceled' THEN 'deleted'
           ELSE 'updated'
      END,
    jsonb_build_object(
      'object', jsonb_build_object(
        'id', p_subscription_id,
        'status', p_stripe_status,
        'current_period_end', 
        EXTRACT(epoch FROM p_current_period_end)::bigint,
        'reconciled', true
      )
    ),
    EXTRACT(epoch FROM p_created_at)::bigint,
    false,
    'req_reconciliation',
    true
  );
END;
$$ LANGUAGE plpgsql;

-- Function to fix orphaned recovery attempts
CREATE OR REPLACE FUNCTION fix_orphaned_recovery_attempts()
RETURNS integer AS $$
DECLARE
  fixed_count integer;
BEGIN
  WITH orphaned_attempts AS (
    SELECT pra.id
    FROM payment_recovery_attempts pra
    LEFT JOIN patient_invoices pi 
      ON pi.stripe_payment_intent_id = pra.stripe_payment_intent_id
    WHERE pi.id IS NULL
    AND pra.status = 'pending'
  )
  UPDATE payment_recovery_attempts
  SET 
    status = 'canceled',
    error_message = 'Payment intent no longer exists',
    updated_at = CURRENT_TIMESTAMP
  FROM orphaned_attempts
  WHERE payment_recovery_attempts.id = orphaned_attempts.id;
  
  GET DIAGNOSTICS fixed_count = ROW_COUNT;
  RETURN fixed_count;
END;
$$ LANGUAGE plpgsql;

-- Function to detect and fix data anomalies
CREATE OR REPLACE FUNCTION fix_data_anomalies()
RETURNS TABLE (
  table_name text,
  anomaly_type text,
  fixed_count integer
) AS $$
DECLARE
  result record;
BEGIN
  -- Fix invoices with invalid subscription references
  WITH invalid_invoices AS (
    SELECT pi.id
    FROM patient_invoices pi
    LEFT JOIN patient_subscriptions ps ON ps.id = pi.subscription_id
    WHERE ps.id IS NULL
  )
  UPDATE patient_invoices
  SET subscription_id = NULL
  FROM invalid_invoices
  WHERE patient_invoices.id = invalid_invoices.id;
  GET DIAGNOSTICS result.fixed_count = ROW_COUNT;
  
  table_name := 'patient_invoices';
  anomaly_type := 'invalid_subscription_reference';
  fixed_count := result.fixed_count;
  RETURN NEXT;

  -- Fix duplicate event records
  WITH duplicate_events AS (
    DELETE FROM stripe_events a
    USING stripe_events b
    WHERE a.event_id = b.event_id
    AND a.ctid > b.ctid
    RETURNING a.event_id
  )
  SELECT 'stripe_events', 'duplicate_events', COUNT(*)::integer
  INTO table_name, anomaly_type, fixed_count
  FROM duplicate_events;
  RETURN NEXT;

  -- Fix inconsistent payment statuses
  WITH inconsistent_payments AS (
    UPDATE patient_invoices pi
    SET status = 'succeeded'
    FROM stripe_events se
    WHERE se.data->>'id' = pi.stripe_payment_intent_id
    AND se.type = 'payment_intent.succeeded'
    AND pi.status != 'succeeded'
    RETURNING pi.id
  )
  SELECT 'patient_invoices', 'inconsistent_status', COUNT(*)::integer
  INTO table_name, anomaly_type, fixed_count
  FROM inconsistent_payments;
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql;

-- Recovery procedure to fix all issues
CREATE OR REPLACE PROCEDURE recover_webhook_data()
LANGUAGE plpgsql
AS $$
DECLARE
  missing_events record;
  anomaly record;
  fixed_attempts integer;
BEGIN
  -- Find and log missing events
  FOR missing_events IN SELECT * FROM find_missing_events()
  LOOP
    RAISE NOTICE 'Missing event found: % - % - %',
      COALESCE(missing_events.payment_intent_id, missing_events.subscription_id),
      missing_events.event_type,
      missing_events.created_at;
  END LOOP;

  -- Fix data anomalies
  FOR anomaly IN SELECT * FROM fix_data_anomalies()
  LOOP
    RAISE NOTICE 'Fixed % anomalies of type % in table %',
      anomaly.fixed_count,
      anomaly.anomaly_type,
      anomaly.table_name;
  END LOOP;

  -- Fix orphaned recovery attempts
  fixed_attempts := fix_orphaned_recovery_attempts();
  RAISE NOTICE 'Fixed % orphaned recovery attempts', fixed_attempts;

  -- Add recovery audit log
  INSERT INTO maintenance_logs (
    operation,
    details,
    executed_at
  ) VALUES (
    'webhook_data_recovery',
    jsonb_build_object(
      'missing_events', (SELECT COUNT(*) FROM find_missing_events()),
      'fixed_attempts', fixed_attempts
    ),
    CURRENT_TIMESTAMP
  );
END;
$$;

-- Comments for documentation
COMMENT ON FUNCTION find_missing_events IS 'Identifies missing webhook events by comparing payment and subscription records';
COMMENT ON FUNCTION reconcile_payment_status IS 'Updates payment status and creates reconciliation event';
COMMENT ON FUNCTION reconcile_subscription_status IS 'Updates subscription status and creates reconciliation event';
COMMENT ON FUNCTION fix_orphaned_recovery_attempts IS 'Cancels recovery attempts for non-existent payments';
COMMENT ON FUNCTION fix_data_anomalies IS 'Detects and fixes various data consistency issues';
COMMENT ON PROCEDURE recover_webhook_data IS 'Main recovery procedure that runs all fixes';