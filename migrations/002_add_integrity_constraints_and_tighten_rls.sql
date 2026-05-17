-- Migration: Add CHECK constraints to enforce data integrity, and tighten RLS.
-- Applied to remote Supabase via MCP on 2026-05-17.
-- See also: pre-migration cleanup of 3 PENTEST st_transactions rows,
-- 1 PENTEST st_presets row, and backfill of 2 NULL savings_type rows to 'manual'.

-- 1. Whitelist valid category_id values on st_transactions.
ALTER TABLE st_transactions
  ADD CONSTRAINT st_transactions_category_id_check
  CHECK (category_id IN (
    'salary','side-income','other-income',
    'fixed-bills','food','transport','living','lifestyle',
    'travel','health','shopping','debt','other-expense',
    'savings','emergency_fund','debt_payment'
  ));

-- 2. Whitelist savings_type values.
ALTER TABLE st_transactions
  ADD CONSTRAINT st_transactions_savings_type_check
  CHECK (savings_type IS NULL OR savings_type IN ('manual','auto'));

-- 3. Conditional integrity: expense rows must specify funded_from.
ALTER TABLE st_transactions
  ADD CONSTRAINT st_transactions_expense_needs_funded_from
  CHECK (type <> 'expense' OR funded_from IS NOT NULL);

-- 4. Conditional integrity: savings rows must specify savings_type.
ALTER TABLE st_transactions
  ADD CONSTRAINT st_transactions_savings_needs_type
  CHECK (type <> 'savings' OR savings_type IS NOT NULL);

-- 5. Whitelist valid category_id values on st_presets too.
ALTER TABLE st_presets
  ADD CONSTRAINT st_presets_category_id_check
  CHECK (category_id IN (
    'salary','side-income','other-income',
    'fixed-bills','food','transport','living','lifestyle',
    'travel','health','shopping','debt','other-expense',
    'savings','emergency_fund','debt_payment'
  ));

-- 6. Tighten RLS: target authenticated role, explicit WITH CHECK,
--    wrap auth.uid() with (SELECT ...) for performance (init-plan optimization).
DROP POLICY IF EXISTS st_transactions_user_policy ON st_transactions;
CREATE POLICY st_transactions_user_policy ON st_transactions
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS st_presets_user_policy ON st_presets;
CREATE POLICY st_presets_user_policy ON st_presets
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage own month status" ON st_month_status;
CREATE POLICY st_month_status_user_policy ON st_month_status
  FOR ALL TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));
