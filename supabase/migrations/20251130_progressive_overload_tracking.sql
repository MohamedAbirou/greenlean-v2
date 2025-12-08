-- Create table for tracking exercise history and progressive overload
CREATE TABLE IF NOT EXISTS workout_exercise_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight FLOAT,
  rest_seconds INTEGER,
  notes TEXT,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_workout_exercise_history_user_id
  ON workout_exercise_history(user_id);

CREATE INDEX IF NOT EXISTS idx_workout_exercise_history_exercise_id
  ON workout_exercise_history(user_id, exercise_id, completed_at DESC);

-- Enable RLS
ALTER TABLE workout_exercise_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own exercise history"
  ON workout_exercise_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exercise history"
  ON workout_exercise_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exercise history"
  ON workout_exercise_history
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exercise history"
  ON workout_exercise_history
  FOR DELETE
  USING (auth.uid() = user_id);
