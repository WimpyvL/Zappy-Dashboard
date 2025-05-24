-- Migration: Add Stripe Integration Tables and Columns
-- Description: Adds necessary database structure for Stripe payment integration
-- Date: May 26, 2025

-- Add Stripe-specific columns to patient_subscriptions
ALTER TABLE patient_subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR,
ADD COLUMN IF NOT EXISTS stripe_payment_method_id VARCHAR;

-- Add indexes for Stripe IDs
CREATE INDEX IF NOT EXISTS idx_patient_subscriptions_stripe_subscription_id
ON patient_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_patient_subscriptions_stripe_customer_id
ON patient_subscriptions(stripe_customer_id);

-- Add Stripe-specific columns to patient_invoices
ALTER TABLE patient_invoices
ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR;

-- Add indexes for Stripe invoice IDs
CREATE INDEX IF NOT EXISTS idx_patient_invoices_stripe_invoice_id
ON patient_invoices(stripe_invoice_id);

CREATE INDEX IF NOT EXISTS idx_patient_invoices_stripe_payment_intent_id
ON patient_invoices(stripe_payment_intent_id);

-- Create table for tracking Stripe webhook events
CREATE TABLE IF NOT EXISTS stripe_events (
    id BIGSERIAL PRIMARY KEY,
    event_id VARCHAR NOT NULL UNIQUE,
    event_type VARCHAR NOT NULL,
    data JSONB NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    processing_attempts INTEGER DEFAULT 0,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- New columns for error recovery
    retry_count INTEGER DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    error_context JSONB
);

-- Add index for event processing
CREATE INDEX IF NOT EXISTS idx_stripe_events_processed
ON stripe_events(processed, event_type)
WHERE processed = FALSE;

-- Create table for tracking payment recovery attempts
CREATE TABLE IF NOT EXISTS payment_recovery_attempts (
    id BIGSERIAL PRIMARY KEY,
    subscription_id VARCHAR NOT NULL,
    stripe_payment_intent_id VARCHAR,
    attempt_number INTEGER NOT NULL,
    status VARCHAR NOT NULL,
    error_message TEXT,
    amount DECIMAL(10,2) NOT NULL,
    next_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- New columns for recovery strategy and support
    recovery_strategy VARCHAR,
    last_error_type VARCHAR,
    support_ticket_id BIGINT REFERENCES payment_support_tickets(id)
);

-- Add index for upcoming recovery attempts
CREATE INDEX IF NOT EXISTS idx_payment_recovery_next_attempt
ON payment_recovery_attempts(next_attempt_at)
WHERE status = 'pending';

-- Create table for tracking refunds
CREATE TABLE IF NOT EXISTS stripe_refunds (
    id BIGSERIAL PRIMARY KEY,
    stripe_refund_id VARCHAR NOT NULL,
    payment_intent_id VARCHAR NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR NOT NULL,
    reason VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for tracking disputes
CREATE TABLE IF NOT EXISTS stripe_disputes (
    id BIGSERIAL PRIMARY KEY,
    stripe_dispute_id VARCHAR NOT NULL,
    payment_intent_id VARCHAR NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR NOT NULL,
    reason VARCHAR,
    evidence JSON,
    due_by TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create table for support escalation
CREATE TABLE IF NOT EXISTS payment_support_tickets (
    id BIGSERIAL PRIMARY KEY,
    payment_intent_id VARCHAR,
    subscription_id VARCHAR,
    issue_type VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    priority VARCHAR NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- Add function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_stripe_events_updated_at
    BEFORE UPDATE ON stripe_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_recovery_attempts_updated_at
    BEFORE UPDATE ON payment_recovery_attempts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments to document the tables
COMMENT ON TABLE stripe_events IS 'Tracks all incoming Stripe webhook events and their processing status';
COMMENT ON TABLE payment_recovery_attempts IS 'Tracks attempts to recover failed payments with automated retry logic';
COMMENT ON TABLE stripe_refunds IS 'Tracks Stripe refunds';
COMMENT ON TABLE stripe_disputes IS 'Tracks Stripe disputes';
COMMENT ON TABLE payment_support_tickets IS 'Tracks escalated payment issues requiring manual intervention';


COMMENT ON COLUMN patient_subscriptions.stripe_subscription_id IS 'Reference to subscription in Stripe';
COMMENT ON COLUMN patient_subscriptions.stripe_customer_id IS 'Reference to customer in Stripe';
COMMENT ON COLUMN patient_subscriptions.stripe_payment_method_id IS 'Reference to default payment method in Stripe';

COMMENT ON COLUMN patient_invoices.stripe_invoice_id IS 'Reference to invoice in Stripe';
COMMENT ON COLUMN patient_invoices.stripe_payment_intent_id IS 'Reference to payment intent in Stripe';

COMMENT ON COLUMN stripe_events.event_id IS 'Unique identifier from Stripe webhook event';
COMMENT ON COLUMN stripe_events.event_type IS 'Type of Stripe event (e.g., payment_intent.succeeded)';
COMMENT ON COLUMN stripe_events.data IS 'Complete webhook event payload from Stripe';
COMMENT ON COLUMN stripe_events.processed IS 'Whether the event has been successfully processed';
COMMENT ON COLUMN stripe_events.error_message IS 'Error message if processing failed';
COMMENT ON COLUMN stripe_events.processing_attempts IS 'Number of times processing was attempted';
COMMENT ON COLUMN stripe_events.retry_count IS 'Number of times processing was retried';
COMMENT ON COLUMN stripe_events.next_retry_at IS 'Timestamp for the next processing retry attempt';
COMMENT ON COLUMN stripe_events.error_context IS 'Additional context about the processing error';


COMMENT ON COLUMN payment_recovery_attempts.subscription_id IS 'Reference to the subscription with failed payment';
COMMENT ON COLUMN payment_recovery_attempts.stripe_payment_intent_id IS 'Reference to failed payment intent in Stripe';
COMMENT ON COLUMN payment_recovery_attempts.attempt_number IS 'Which retry attempt this represents (1-3)';
COMMENT ON COLUMN payment_recovery_attempts.status IS 'Status of recovery attempt (pending, success, failed)';
COMMENT ON COLUMN payment_recovery_attempts.amount IS 'Amount to recover in dollars';
COMMENT ON COLUMN payment_recovery_attempts.next_attempt_at IS 'When the next retry attempt should occur';
COMMENT ON COLUMN payment_recovery_attempts.recovery_strategy IS 'The strategy used for this recovery attempt';
COMMENT ON COLUMN payment_recovery_attempts.last_error_type IS 'The type of the last error encountered';
COMMENT ON COLUMN payment_recovery_attempts.support_ticket_id IS 'Reference to the support ticket created for this recovery attempt';

COMMENT ON COLUMN stripe_refunds.stripe_refund_id IS 'Unique identifier for the refund in Stripe';
COMMENT ON COLUMN stripe_refunds.payment_intent_id IS 'Reference to the payment intent associated with the refund';
COMMENT ON COLUMN stripe_refunds.amount IS 'The refunded amount';
COMMENT ON COLUMN stripe_refunds.status IS 'Status of the refund (e.g., succeeded, failed)';
COMMENT ON COLUMN stripe_refunds.reason IS 'Reason for the refund';

COMMENT ON COLUMN stripe_disputes.stripe_dispute_id IS 'Unique identifier for the dispute in Stripe';
COMMENT ON COLUMN stripe_disputes.payment_intent_id IS 'Reference to the payment intent associated with the dispute';
COMMENT ON COLUMN stripe_disputes.amount IS 'The disputed amount';
COMMENT ON COLUMN stripe_disputes.status IS 'Status of the dispute (e.g., open, won, lost)';
COMMENT ON COLUMN stripe_disputes.reason IS 'Reason for the dispute';
COMMENT ON COLUMN stripe_disputes.evidence IS 'JSON object containing dispute evidence';
COMMENT ON COLUMN stripe_disputes.due_by IS 'Timestamp when evidence is due';

COMMENT ON COLUMN payment_support_tickets.payment_intent_id IS 'Reference to the payment intent related to the ticket';
COMMENT ON COLUMN payment_support_tickets.subscription_id IS 'Reference to the subscription related to the ticket';
COMMENT ON COLUMN payment_support_tickets.issue_type IS 'Type of payment issue (e.g., failed payment, dispute)';
COMMENT ON COLUMN payment_support_tickets.status IS 'Status of the support ticket (e.g., open, pending, closed)';
COMMENT ON COLUMN payment_support_tickets.priority IS 'Priority of the support ticket (e.g., high, medium, low)';