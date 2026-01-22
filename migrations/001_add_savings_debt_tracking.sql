-- Migration: Add Savings & Debt Tracking Feature
-- Run this migration in your Supabase SQL editor

-- 1. Add new columns to st_transactions table
ALTER TABLE st_transactions
ADD COLUMN IF NOT EXISTS is_auto BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS savings_type VARCHAR(10); -- 'manual' or 'auto'

-- 2. Create st_month_status table for tracking month-end processing
CREATE TABLE IF NOT EXISTS st_month_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- Format: "YYYY-MM"
  processed_at TIMESTAMP WITH TIME ZONE,
  auto_amount DECIMAL(12,2) DEFAULT 0,
  debt_amount DECIMAL(12,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month)
);

-- 3. Enable Row Level Security
ALTER TABLE st_month_status ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policy for st_month_status
CREATE POLICY "Users can manage own month status" ON st_month_status
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_month_status_user_month
ON st_month_status(user_id, month);

-- 6. Backfill existing savings transactions as 'manual'
UPDATE st_transactions
SET savings_type = 'manual'
WHERE type = 'savings' AND savings_type IS NULL;
