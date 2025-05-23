-- Migration: Add Prescription Tracking System
-- Description: This migration adds the necessary tables for the prescription tracking system,
-- including order tracking events, email notifications, and tracking update schedules.
-- Date: 2025-05-25

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create order_tracking_events table
CREATE TABLE IF NOT EXISTS order_tracking_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  tracking_number TEXT,
  status TEXT NOT NULL,
  carrier TEXT,
  tracking_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_order_id ON order_tracking_events(order_id);

-- Create index on tracking_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_order_tracking_events_tracking_number ON order_tracking_events(tracking_number);

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  recipient_id UUID,
  order_id UUID,
  prescription_id UUID,
  metadata JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
  FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE SET NULL
);

-- Create index on recipient_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_notifications_recipient_id ON email_notifications(recipient_id);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_notifications_order_id ON email_notifications(order_id);

-- Create index on prescription_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_notifications_prescription_id ON email_notifications(prescription_id);

-- Create tracking_update_schedule table
CREATE TABLE IF NOT EXISTS tracking_update_schedule (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL,
  tracking_number TEXT NOT NULL,
  interval_hours INTEGER NOT NULL DEFAULT 24,
  next_update TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Create index on order_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_tracking_update_schedule_order_id ON tracking_update_schedule(order_id);

-- Create index on next_update and is_active for faster lookups by the scheduler
CREATE INDEX IF NOT EXISTS idx_tracking_update_schedule_next_update_is_active ON tracking_update_schedule(next_update, is_active);

-- Add prescription_status column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prescription_status TEXT;

-- Add prescription_id column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL;

-- Add tracking_info column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_info JSONB;

-- Add status_history column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_history JSONB[];

-- Add is_prescription column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS is_prescription BOOLEAN DEFAULT FALSE;

-- Add is_prescription column to order_items table if it doesn't exist
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS is_prescription BOOLEAN DEFAULT FALSE;

-- Add tracking_number column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;

-- Add carrier column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS carrier TEXT;

-- Add estimated_delivery_date column to orders table if it doesn't exist
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE;

-- Add prescription_events column to prescriptions table if it doesn't exist
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS prescription_events JSONB[];

-- Add next_refill_date column to prescriptions table if it doesn't exist
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS next_refill_date TIMESTAMP WITH TIME ZONE;

-- Add refills_remaining column to prescriptions table if it doesn't exist
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS refills_remaining INTEGER DEFAULT 0;

-- Add refill_history column to prescriptions table if it doesn't exist
ALTER TABLE prescriptions ADD COLUMN IF NOT EXISTS refill_history JSONB[];

-- Create function to update order status history
CREATE OR REPLACE FUNCTION update_order_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.status_history = array_append(
      COALESCE(OLD.status_history, ARRAY[]::jsonb[]),
      jsonb_build_object(
        'status', NEW.status,
        'timestamp', NOW(),
        'previous_status', OLD.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order status history
DROP TRIGGER IF EXISTS update_order_status_history_trigger ON orders;
CREATE TRIGGER update_order_status_history_trigger
BEFORE UPDATE ON orders
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_order_status_history();

-- Create function to update prescription status history
CREATE OR REPLACE FUNCTION update_prescription_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    NEW.prescription_events = array_append(
      COALESCE(OLD.prescription_events, ARRAY[]::jsonb[]),
      jsonb_build_object(
        'status', NEW.status,
        'timestamp', NOW(),
        'previous_status', OLD.status
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update prescription status history
DROP TRIGGER IF EXISTS update_prescription_status_history_trigger ON prescriptions;
CREATE TRIGGER update_prescription_status_history_trigger
BEFORE UPDATE ON prescriptions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_prescription_status_history();

-- Create function to update order prescription status when prescription status changes
CREATE OR REPLACE FUNCTION update_order_prescription_status()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE orders
  SET prescription_status = NEW.status
  WHERE prescription_id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update order prescription status
DROP TRIGGER IF EXISTS update_order_prescription_status_trigger ON prescriptions;
CREATE TRIGGER update_order_prescription_status_trigger
AFTER UPDATE ON prescriptions
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION update_order_prescription_status();
