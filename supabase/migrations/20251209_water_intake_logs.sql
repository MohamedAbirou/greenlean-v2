-- Water Intake Individual Logs
-- Tracks each water intake event for better UX

CREATE TABLE IF NOT EXISTS water_intake_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_water_amount CHECK (amount_ml > 0 AND amount_ml <= 5000)
);

-- Indexes
CREATE INDEX idx_water_logs_user_date ON water_intake_logs(user_id, log_date DESC);
CREATE INDEX idx_water_logs_logged_at ON water_intake_logs(logged_at DESC);

-- RLS Policies
ALTER TABLE water_intake_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own water logs"
  ON water_intake_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own water logs"
  ON water_intake_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own water logs"
  ON water_intake_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Function to auto-update daily_water_intake when logs are added
CREATE OR REPLACE FUNCTION update_daily_water_total()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert daily total
  INSERT INTO daily_water_intake (user_id, log_date, total_ml, glasses)
  VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.log_date, OLD.log_date),
    (
      SELECT COALESCE(SUM(amount_ml), 0)
      FROM water_intake_logs
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND log_date = COALESCE(NEW.log_date, OLD.log_date)
    ),
    (
      SELECT COUNT(*)
      FROM water_intake_logs
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND log_date = COALESCE(NEW.log_date, OLD.log_date)
    )
  )
  ON CONFLICT (user_id, log_date)
  DO UPDATE SET
    total_ml = EXCLUDED.total_ml,
    glasses = EXCLUDED.glasses,
    updated_at = NOW();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER water_log_insert_update_daily
  AFTER INSERT ON water_intake_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_water_total();

CREATE TRIGGER water_log_delete_update_daily
  AFTER DELETE ON water_intake_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_water_total();
