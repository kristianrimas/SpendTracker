-- Migration: Add data shape bounds to prevent abuse / typos.
-- Applied to remote Supabase via MCP on 2026-05-17.
-- Pre-migration cleanup: 8 fake @example.invalid pentest accounts deleted
-- from auth.users (FK cascade removed any orphan rows).

-- Generous bounds so legitimate use is unaffected:
--   amount: positive, up to 10 million
--   date:   2020-01-01 through 2035-12-31
--   note:   up to 500 chars
--   subcategory: up to 100 chars
--   preset name: 1-50 chars

ALTER TABLE st_transactions
  ADD CONSTRAINT st_transactions_amount_positive
  CHECK (amount > 0 AND amount <= 10000000);

ALTER TABLE st_transactions
  ADD CONSTRAINT st_transactions_date_sensible
  CHECK (date >= DATE '2020-01-01' AND date <= DATE '2035-12-31');

ALTER TABLE st_transactions
  ADD CONSTRAINT st_transactions_note_length
  CHECK (note IS NULL OR length(note) <= 500);

ALTER TABLE st_transactions
  ADD CONSTRAINT st_transactions_subcategory_length
  CHECK (subcategory IS NULL OR length(subcategory) <= 100);

ALTER TABLE st_presets
  ADD CONSTRAINT st_presets_amount_positive
  CHECK (amount > 0 AND amount <= 10000000);

ALTER TABLE st_presets
  ADD CONSTRAINT st_presets_name_length
  CHECK (length(name) > 0 AND length(name) <= 50);

ALTER TABLE st_presets
  ADD CONSTRAINT st_presets_note_length
  CHECK (note IS NULL OR length(note) <= 500);

ALTER TABLE st_presets
  ADD CONSTRAINT st_presets_subcategory_length
  CHECK (subcategory IS NULL OR length(subcategory) <= 100);
