-- ─────────────────────────────────────────────────────────
-- PropFlow — Supabase Schema
-- Run this in your Supabase project → SQL Editor → New Query
-- ─────────────────────────────────────────────────────────

-- Enable RLS (Row Level Security) on all tables
-- This ensures each user only sees their own data

-- ── ACCOUNTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS accounts (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  firma       TEXT NOT NULL DEFAULT 'Apex',
  plan        TEXT NOT NULL DEFAULT 'LucidFlex',
  size        INTEGER NOT NULL DEFAULT 50000,
  status      TEXT NOT NULL DEFAULT 'challenge' CHECK (status IN ('challenge','pa','lost')),
  balance     NUMERIC NOT NULL DEFAULT 0,
  cost        NUMERIC NOT NULL DEFAULT 0,
  consistency NUMERIC DEFAULT 0,
  avg_payout  NUMERIC DEFAULT 400,
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── EXPENSES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('fee','payout')),
  firma       TEXT NOT NULL DEFAULT 'Otro',
  description TEXT NOT NULL DEFAULT '',
  amount      NUMERIC NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own expenses"
  ON expenses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── AI CONFIG ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_config (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  persona     TEXT DEFAULT 'balanced',
  context     TEXT DEFAULT '',
  meta        NUMERIC DEFAULT 0,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own ai_config"
  ON ai_config FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── AUTO UPDATE updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER ai_config_updated_at
  BEFORE UPDATE ON ai_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_accounts_user_id  ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id  ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses(date DESC);
