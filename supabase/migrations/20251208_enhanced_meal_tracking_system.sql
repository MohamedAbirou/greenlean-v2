-- =============================================
-- Enhanced Meal Tracking & Logging System
-- MyFitnessPal/CalAI-level features
-- Date: 2025-12-08
-- =============================================

-- =============================================
-- 1. MEAL ITEMS (Detailed Item-Level Tracking)
-- =============================================

-- Individual food items in a meal (for detailed tracking)
CREATE TABLE IF NOT EXISTS meal_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  nutrition_log_id UUID REFERENCES daily_nutrition_logs(id) ON DELETE CASCADE,

  -- Food reference
  food_id UUID REFERENCES food_database(id) ON DELETE SET NULL,
  food_name TEXT NOT NULL,
  brand_name TEXT,

  -- Serving details
  serving_qty FLOAT NOT NULL,
  serving_unit TEXT NOT NULL,

  -- Nutritional values (denormalized for performance)
  calories FLOAT NOT NULL DEFAULT 0,
  protein FLOAT NOT NULL DEFAULT 0,
  carbs FLOAT NOT NULL DEFAULT 0,
  fats FLOAT NOT NULL DEFAULT 0,
  fiber FLOAT DEFAULT 0,
  sugar FLOAT DEFAULT 0,
  sodium FLOAT DEFAULT 0,

  -- Tracking metadata
  logged_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'barcode', 'recipe', 'template', 'ai_plan', 'voice')),

  -- AI plan adherence
  from_ai_plan BOOLEAN DEFAULT FALSE,
  ai_meal_plan_id UUID REFERENCES ai_meal_plans(id) ON DELETE SET NULL,
  plan_meal_name TEXT, -- e.g., "Breakfast Day 1"

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. MEAL PLAN ADHERENCE TRACKING
-- =============================================

-- Track how well users follow their AI-generated meal plans
CREATE TABLE IF NOT EXISTS meal_plan_adherence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  meal_plan_id UUID REFERENCES ai_meal_plans(id) ON DELETE CASCADE NOT NULL,

  tracking_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Planned vs Actual
  planned_meals JSONB NOT NULL DEFAULT '[]'::jsonb, -- Meals from AI plan for this day
  logged_meals JSONB NOT NULL DEFAULT '[]'::jsonb, -- Actual logged meals

  -- Adherence metrics
  meals_followed INTEGER DEFAULT 0, -- How many planned meals were followed
  meals_total INTEGER DEFAULT 0, -- Total planned meals
  adherence_percentage FLOAT GENERATED ALWAYS AS (
    CASE WHEN meals_total > 0
    THEN (meals_followed::FLOAT / meals_total * 100)
    ELSE 0 END
  ) STORED,

  -- Macro adherence
  planned_calories INTEGER,
  actual_calories INTEGER,
  calories_variance INTEGER,

  planned_protein FLOAT,
  actual_protein FLOAT,
  protein_variance FLOAT,

  -- Notes
  skip_reason TEXT,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, meal_plan_id, tracking_date)
);

-- =============================================
-- 3. RECIPE DATABASE (Community & User Recipes)
-- =============================================

CREATE TABLE IF NOT EXISTS recipe_database (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Recipe info
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT, -- Italian, Mexican, Asian, etc.
  meal_type TEXT[] DEFAULT ARRAY[]::TEXT[], -- breakfast, lunch, dinner, snack

  -- Ingredients (structured)
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{food_id, qty, unit, name}, ...]

  -- Instructions
  instructions JSONB NOT NULL DEFAULT '[]'::jsonb, -- ["Step 1", "Step 2", ...]
  prep_time_minutes INTEGER,
  cook_time_minutes INTEGER,
  total_time_minutes INTEGER GENERATED ALWAYS AS (
    COALESCE(prep_time_minutes, 0) + COALESCE(cook_time_minutes, 0)
  ) STORED,
  servings INTEGER NOT NULL DEFAULT 1,

  -- Nutrition (per serving)
  calories_per_serving FLOAT,
  protein_per_serving FLOAT,
  carbs_per_serving FLOAT,
  fats_per_serving FLOAT,

  -- Dietary tags
  dietary_tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- vegetarian, vegan, keto, etc.
  allergen_tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- dairy, nuts, gluten, etc.

  -- Media
  image_url TEXT,
  video_url TEXT,

  -- Community features
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public', 'friends')),
  likes_count INTEGER DEFAULT 0,
  uses_count INTEGER DEFAULT 0, -- How many times it's been used

  -- Verification
  verified BOOLEAN DEFAULT FALSE,
  source TEXT DEFAULT 'user_created' CHECK (source IN ('user_created', 'imported', 'ai_generated', 'community')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recipe likes/favorites
CREATE TABLE IF NOT EXISTS recipe_likes (
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipe_database(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

-- Recipe usage tracking
CREATE TABLE IF NOT EXISTS recipe_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipe_database(id) ON DELETE CASCADE NOT NULL,

  logged_date DATE NOT NULL DEFAULT CURRENT_DATE,
  servings_logged FLOAT NOT NULL DEFAULT 1,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. USER FAVORITE FOODS (Quick Logging)
-- =============================================

CREATE TABLE IF NOT EXISTS user_favorite_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES food_database(id) ON DELETE CASCADE NOT NULL,

  -- Custom serving preferences
  preferred_serving_qty FLOAT,
  preferred_serving_unit TEXT,

  -- Metadata
  times_logged INTEGER DEFAULT 0,
  last_logged_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, food_id)
);

-- =============================================
-- 5. NUTRITION GOALS HISTORY (Track Changes Over Time)
-- =============================================

CREATE TABLE IF NOT EXISTS nutrition_goals_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,

  effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE, -- NULL means current

  -- Daily goals
  daily_calories INTEGER NOT NULL,
  daily_protein_g FLOAT NOT NULL,
  daily_carbs_g FLOAT NOT NULL,
  daily_fats_g FLOAT NOT NULL,
  daily_fiber_g FLOAT,
  daily_water_ml INTEGER,

  -- Source
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated', 'coach', 'diet_change')),
  reason TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, effective_date)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_meal_items_user_id ON meal_items(user_id);
CREATE INDEX idx_meal_items_logged_at ON meal_items(logged_at DESC);
CREATE INDEX idx_meal_items_nutrition_log ON meal_items(nutrition_log_id);
CREATE INDEX idx_meal_items_food_id ON meal_items(food_id);
CREATE INDEX idx_meal_items_from_ai_plan ON meal_items(user_id, from_ai_plan, logged_at DESC);

CREATE INDEX idx_meal_plan_adherence_user_date ON meal_plan_adherence(user_id, tracking_date DESC);
CREATE INDEX idx_meal_plan_adherence_plan_id ON meal_plan_adherence(meal_plan_id);

CREATE INDEX idx_recipe_database_created_by ON recipe_database(created_by);
CREATE INDEX idx_recipe_database_visibility ON recipe_database(visibility) WHERE visibility = 'public';
CREATE INDEX idx_recipe_database_dietary_tags ON recipe_database USING gin(dietary_tags);
CREATE INDEX idx_recipe_database_meal_type ON recipe_database USING gin(meal_type);

CREATE INDEX idx_recipe_usage_user_id ON recipe_usage(user_id, logged_date DESC);
CREATE INDEX idx_recipe_usage_recipe_id ON recipe_usage(recipe_id);

CREATE INDEX idx_user_favorite_foods_user_id ON user_favorite_foods(user_id);
CREATE INDEX idx_user_favorite_foods_times_logged ON user_favorite_foods(times_logged DESC);

CREATE INDEX idx_nutrition_goals_history_user_id ON nutrition_goals_history(user_id, effective_date DESC);

-- =============================================
-- FUNCTIONS & TRIGGERS
-- =============================================

-- Update meal_items totals when items are added/updated
CREATE OR REPLACE FUNCTION update_nutrition_log_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_nutrition_log_id UUID;
  v_total_calories FLOAT;
  v_total_protein FLOAT;
  v_total_carbs FLOAT;
  v_total_fats FLOAT;
BEGIN
  -- Get nutrition_log_id from NEW or OLD record
  v_nutrition_log_id := COALESCE(NEW.nutrition_log_id, OLD.nutrition_log_id);

  IF v_nutrition_log_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate new totals
  SELECT
    COALESCE(SUM(calories), 0),
    COALESCE(SUM(protein), 0),
    COALESCE(SUM(carbs), 0),
    COALESCE(SUM(fats), 0)
  INTO
    v_total_calories,
    v_total_protein,
    v_total_carbs,
    v_total_fats
  FROM meal_items
  WHERE nutrition_log_id = v_nutrition_log_id;

  -- Update parent daily_nutrition_logs record
  UPDATE daily_nutrition_logs
  SET
    total_calories = v_total_calories,
    total_protein = v_total_protein,
    total_carbs = v_total_carbs,
    total_fats = v_total_fats
  WHERE id = v_nutrition_log_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on meal_items INSERT/UPDATE/DELETE
DROP TRIGGER IF EXISTS trigger_update_nutrition_log_totals_insert ON meal_items;
CREATE TRIGGER trigger_update_nutrition_log_totals_insert
  AFTER INSERT ON meal_items
  FOR EACH ROW EXECUTE FUNCTION update_nutrition_log_totals();

DROP TRIGGER IF EXISTS trigger_update_nutrition_log_totals_update ON meal_items;
CREATE TRIGGER trigger_update_nutrition_log_totals_update
  AFTER UPDATE ON meal_items
  FOR EACH ROW EXECUTE FUNCTION update_nutrition_log_totals();

DROP TRIGGER IF EXISTS trigger_update_nutrition_log_totals_delete ON meal_items;
CREATE TRIGGER trigger_update_nutrition_log_totals_delete
  AFTER DELETE ON meal_items
  FOR EACH ROW EXECUTE FUNCTION update_nutrition_log_totals();

-- Update recipe likes count
CREATE OR REPLACE FUNCTION update_recipe_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE recipe_database
    SET likes_count = likes_count + 1
    WHERE id = NEW.recipe_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE recipe_database
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.recipe_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_recipe_likes_count ON recipe_likes;
CREATE TRIGGER trigger_update_recipe_likes_count
  AFTER INSERT OR DELETE ON recipe_likes
  FOR EACH ROW EXECUTE FUNCTION update_recipe_likes_count();

-- Update recipe usage count
CREATE OR REPLACE FUNCTION update_recipe_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE recipe_database
  SET uses_count = uses_count + 1
  WHERE id = NEW.recipe_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_recipe_usage_count ON recipe_usage;
CREATE TRIGGER trigger_update_recipe_usage_count
  AFTER INSERT ON recipe_usage
  FOR EACH ROW EXECUTE FUNCTION update_recipe_usage_count();

-- Update timestamp triggers
CREATE TRIGGER update_meal_plan_adherence_timestamp
  BEFORE UPDATE ON meal_plan_adherence
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_recipe_database_timestamp
  BEFORE UPDATE ON recipe_database
  FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals_history ENABLE ROW LEVEL SECURITY;

-- Meal items policies
CREATE POLICY "Users can manage own meal items" ON meal_items
  FOR ALL USING (auth.uid() = user_id);

-- Meal plan adherence policies
CREATE POLICY "Users can manage own meal plan adherence" ON meal_plan_adherence
  FOR ALL USING (auth.uid() = user_id);

-- Recipe database policies
CREATE POLICY "Users can view public recipes" ON recipe_database
  FOR SELECT USING (visibility = 'public' OR created_by = auth.uid());

CREATE POLICY "Users can manage own recipes" ON recipe_database
  FOR ALL USING (auth.uid() = created_by);

-- Recipe likes policies
CREATE POLICY "Users can manage own recipe likes" ON recipe_likes
  FOR ALL USING (auth.uid() = user_id);

-- Recipe usage policies
CREATE POLICY "Users can manage own recipe usage" ON recipe_usage
  FOR ALL USING (auth.uid() = user_id);

-- Favorite foods policies
CREATE POLICY "Users can manage own favorite foods" ON user_favorite_foods
  FOR ALL USING (auth.uid() = user_id);

-- Nutrition goals history policies
CREATE POLICY "Users can manage own nutrition goals history" ON nutrition_goals_history
  FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Get current nutrition goals for a user (most recent effective goal)
CREATE OR REPLACE FUNCTION get_current_nutrition_goals(p_user_id UUID)
RETURNS TABLE (
  daily_calories INTEGER,
  daily_protein_g FLOAT,
  daily_carbs_g FLOAT,
  daily_fats_g FLOAT,
  daily_fiber_g FLOAT,
  daily_water_ml INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ngh.daily_calories,
    ngh.daily_protein_g,
    ngh.daily_carbs_g,
    ngh.daily_fats_g,
    ngh.daily_fiber_g,
    ngh.daily_water_ml
  FROM nutrition_goals_history ngh
  WHERE ngh.user_id = p_user_id
    AND ngh.effective_date <= CURRENT_DATE
    AND (ngh.end_date IS NULL OR ngh.end_date >= CURRENT_DATE)
  ORDER BY ngh.effective_date DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE;

-- Calculate meal plan adherence for a specific date
CREATE OR REPLACE FUNCTION calculate_meal_plan_adherence(
  p_user_id UUID,
  p_meal_plan_id UUID,
  p_date DATE
)
RETURNS VOID AS $$
DECLARE
  v_planned_meals JSONB;
  v_logged_meals JSONB;
  v_meals_followed INTEGER := 0;
  v_meals_total INTEGER;
BEGIN
  -- Get planned meals for this date from AI meal plan
  -- This is simplified - you'd parse the plan_data to get meals for specific day
  v_planned_meals := '[]'::jsonb;

  -- Get logged meals for this date
  SELECT jsonb_agg(
    jsonb_build_object(
      'meal_type', meal_type,
      'calories', total_calories,
      'from_ai_plan', EXISTS(
        SELECT 1 FROM meal_items mi
        WHERE mi.nutrition_log_id = dnl.id
        AND mi.from_ai_plan = TRUE
      )
    )
  )
  INTO v_logged_meals
  FROM daily_nutrition_logs dnl
  WHERE user_id = p_user_id
    AND log_date = p_date;

  v_logged_meals := COALESCE(v_logged_meals, '[]'::jsonb);
  v_meals_total := jsonb_array_length(v_planned_meals);

  -- Count how many planned meals were followed
  -- (Simplified logic - would need more complex matching in production)

  -- Insert or update adherence record
  INSERT INTO meal_plan_adherence (
    user_id,
    meal_plan_id,
    tracking_date,
    planned_meals,
    logged_meals,
    meals_followed,
    meals_total
  )
  VALUES (
    p_user_id,
    p_meal_plan_id,
    p_date,
    v_planned_meals,
    v_logged_meals,
    v_meals_followed,
    v_meals_total
  )
  ON CONFLICT (user_id, meal_plan_id, tracking_date)
  DO UPDATE SET
    logged_meals = v_logged_meals,
    meals_followed = v_meals_followed,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

COMMENT ON TABLE meal_items IS 'Detailed item-level meal tracking for comprehensive nutrition logging';
COMMENT ON TABLE meal_plan_adherence IS 'Track user adherence to AI-generated meal plans';
COMMENT ON TABLE recipe_database IS 'User and community recipe database with nutrition info';
COMMENT ON TABLE user_favorite_foods IS 'Quick access to frequently logged foods';
COMMENT ON TABLE nutrition_goals_history IS 'Historical tracking of nutrition goal changes';
