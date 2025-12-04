"""
Meal Plan Prompt Builder - Tiered Personalization System
Ported from frontend TypeScript implementation

BASIC (3 data points) → STANDARD (10-15) → PREMIUM (25+)
This is GreenLean's competitive advantage - no other app has this depth
"""

from typing import Dict, List, Any, Optional, Literal
from dataclasses import dataclass


PersonalizationLevel = Literal['BASIC', 'STANDARD', 'PREMIUM']


@dataclass
class UserProfileData:
    """User profile data for AI prompt building"""
    # Core Info (BASIC level)
    main_goal: str
    current_weight: float
    target_weight: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None

    # Nutrition Targets
    daily_calories: Optional[int] = None
    protein: Optional[int] = None
    carbs: Optional[int] = None
    fats: Optional[int] = None

    # STANDARD level - from micro-surveys
    dietary_style: Optional[str] = None
    food_allergies: Optional[List[str]] = None
    cooking_skill: Optional[str] = None
    cooking_time: Optional[str] = None
    grocery_budget: Optional[str] = None
    meals_per_day: Optional[int] = None

    # Workout info
    activity_level: Optional[str] = None
    workout_frequency: Optional[int] = None
    training_environment: Optional[str] = None
    equipment: Optional[List[str]] = None
    injuries: Optional[List[str]] = None

    # PREMIUM level - full profile
    health_conditions: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    sleep_quality: Optional[int] = None
    stress_level: Optional[int] = None
    country: Optional[str] = None
    disliked_foods: Optional[List[str]] = None
    meal_prep_preference: Optional[str] = None
    water_intake_goal: Optional[int] = None


@dataclass
class PromptMetadata:
    """Metadata about the generated prompt"""
    personalization_level: PersonalizationLevel
    data_completeness: float
    missing_fields: List[str]
    used_defaults: List[str]


@dataclass
class AIPromptResponse:
    """Response containing prompt and metadata"""
    prompt: str
    metadata: PromptMetadata


class MealPlanPromptBuilder:
    """Build AI prompts based on available user data and personalization level"""

    @classmethod
    def build_prompt(
        cls,
        user_data: UserProfileData,
        requested_level: PersonalizationLevel = 'BASIC'
    ) -> AIPromptResponse:
        """
        Build AI prompt based on available data and requested level

        Args:
            user_data: User profile data
            requested_level: Requested personalization level

        Returns:
            AIPromptResponse with prompt and metadata
        """
        # Calculate data completeness
        completeness = cls._calculate_completeness(user_data)

        # Determine actual level based on data availability
        effective_level = cls._determine_effective_level(requested_level, completeness)

        # Build prompt for the effective level
        if effective_level == 'BASIC':
            prompt, used_defaults, missing_fields = cls._build_basic_prompt(user_data)
        elif effective_level == 'STANDARD':
            prompt, used_defaults, missing_fields = cls._build_standard_prompt(user_data)
        else:  # PREMIUM
            prompt, used_defaults, missing_fields = cls._build_premium_prompt(user_data)

        metadata = PromptMetadata(
            personalization_level=effective_level,
            data_completeness=completeness,
            missing_fields=missing_fields,
            used_defaults=used_defaults
        )

        return AIPromptResponse(prompt=prompt, metadata=metadata)

    @classmethod
    def _build_basic_prompt(cls, data: UserProfileData) -> tuple[str, List[str], List[str]]:
        """
        BASIC PROMPT - Instant results with smart defaults
        Uses: goal, weight, target weight
        """
        defaults = cls._get_defaults_for_goal(data.main_goal)
        used_defaults: List[str] = []
        missing_fields: List[str] = []

        # Track what we're defaulting
        if not data.dietary_style:
            used_defaults.append('dietaryStyle')
        if not data.meals_per_day:
            used_defaults.append('mealsPerDay')
        if not data.cooking_skill:
            used_defaults.append('cookingSkill')
        if not data.cooking_time:
            used_defaults.append('cookingTime')
        if not data.grocery_budget:
            used_defaults.append('groceryBudget')

        prompt = f"""You are a professional nutrition assistant creating a practical meal plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESSENTIAL USER INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Goal:** {data.main_goal.replace('_', ' ')}
**Current Weight:** {data.current_weight} kg
**Target Weight:** {data.target_weight or 'Not specified'} kg

**Nutrition Targets:**
- Daily Calories: {data.daily_calories or 2000} kcal
- Protein: {data.protein or 150}g
- Carbs: {data.carbs or 200}g
- Fats: {data.fats or 60}g

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFAULT PREFERENCES (User hasn't specified yet - we're using smart defaults)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Meals per day: {defaults['meals_per_day']}
- Cooking skill: {defaults['cooking_skill']}
- Time available: {defaults['cooking_time']}
- Dietary style: {defaults['dietary_style']}
- Budget: {defaults['grocery_budget']}

⚠️  **IMPORTANT:** Since this is a quick-start plan, we're using common preferences.
As the user answers more questions, their plan will become MORE personalized!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a **simple, practical meal plan** that:

1. **Uses Common Ingredients:**
   - Foods available at any grocery store
   - Popular proteins: chicken, eggs, fish, tofu
   - Common carbs: rice, pasta, bread, potatoes
   - Basic vegetables and fruits
   - Avoid exotic or hard-to-find items

2. **Is Budget-Friendly:**
   - Reasonably priced ingredients
   - Seasonal produce
   - Bulk-friendly options

3. **Easy to Prepare:**
   - Recipes with < 10 steps
   - Beginner-friendly techniques
   - Quick prep time (< {defaults['cooking_time']})
   - Minimal equipment needed

4. **Flexible & Adaptable:**
   - Suggest simple substitutions
   - Note common allergen-free swaps
   - Include make-ahead tips

5. **Nutritionally Balanced:**
   - Meet the calorie and macro targets
   - Include variety of nutrients
   - 3-4 meals per day plus snacks

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON in this exact format:

{{
  "week_plan": [
    {{
      "day": "Monday",
      "meals": [
        {{
          "meal_type": "Breakfast",
          "meal_name": "Oatmeal with Banana and Almonds",
          "calories": 450,
          "protein": 15,
          "carbs": 65,
          "fats": 12,
          "ingredients": [
            "1 cup rolled oats",
            "1 medium banana",
            "2 tbsp sliced almonds"
          ],
          "instructions": [
            "Cook oats for 5 minutes",
            "Top with banana and almonds"
          ],
          "prep_time": "5 min",
          "cook_time": "5 min",
          "difficulty": "Easy",
          "substitutions": ["Use walnuts instead of almonds"]
        }}
      ],
      "daily_totals": {{
        "calories": {data.daily_calories or 2000},
        "protein": {data.protein or 150},
        "carbs": {data.carbs or 200},
        "fats": {data.fats or 60}
      }}
    }}
  ],
  "shopping_list": {{
    "proteins": ["Chicken breast (2 lbs)"],
    "carbs": ["Brown rice (2 lbs)"],
    "vegetables": ["Broccoli (2 heads)"],
    "fruits": ["Bananas (6)"],
    "dairy": ["Greek yogurt (32 oz)"],
    "pantry": ["Olive oil", "Salt"],
    "estimated_cost": "$50-70"
  }},
  "meal_prep_tips": [
    "Cook rice in bulk on Sunday",
    "Pre-chop vegetables"
  ],
  "notes": "This is a beginner-friendly plan. As you share more preferences, we'll personalize it further!"
}}

**CRITICAL:** Return ONLY the JSON object. No markdown, no explanations, just pure JSON."""

        return prompt, used_defaults, missing_fields

    @classmethod
    def _build_standard_prompt(cls, data: UserProfileData) -> tuple[str, List[str], List[str]]:
        """
        STANDARD PROMPT - Medium personalization (10-15 data points)
        Includes dietary preferences, cooking skills, some restrictions
        """
        used_defaults: List[str] = []
        missing_fields: List[str] = []

        allergies_str = ', '.join(data.food_allergies) if data.food_allergies else 'None reported'

        prompt = f"""You are a professional nutrition assistant creating a personalized meal plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER PROFILE (PARTIAL - GROWING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**KNOWN PREFERENCES:**

**Goal:** {data.main_goal.replace('_', ' ')}
**Physical Stats:**
- Current Weight: {data.current_weight} kg
- Target Weight: {data.target_weight or 'Not specified'} kg
- Age: {data.age or 'Not specified'}
- Gender: {data.gender or 'Not specified'}

**Dietary Preferences:**
- Style: {data.dietary_style or 'Balanced'}
- Food Allergies: {allergies_str}
- Cooking Skill: {data.cooking_skill or 'Intermediate'}
- Time Available: {data.cooking_time or '30-45 minutes'}
- Budget: {data.grocery_budget or 'Medium ($50-100/week)'}
- Meals per Day: {data.meals_per_day or 3}

**Nutrition Targets:**
- Calories: {data.daily_calories} kcal
- Protein: {data.protein}g
- Carbs: {data.carbs}g
- Fats: {data.fats}g

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STILL LEARNING ABOUT USER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We don't yet know about:
{'' if data.health_conditions else '- Specific health conditions (assume healthy)'}
{'' if data.country else '- Cultural food preferences (use international variety)'}
{'' if data.disliked_foods else '- Disliked foods (avoid only confirmed allergens)'}
{'' if data.meal_prep_preference else '- Meal prep preferences'}

💡 **As we learn more, plans will become even more tailored!**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a personalized meal plan that:

1. **Respects Known Preferences:**
   - Follow {data.dietary_style or 'balanced'} dietary style
   - AVOID all listed allergies: {allergies_str}
   - Match cooking skill level: {data.cooking_skill or 'intermediate'}
   - Stay within budget: {data.grocery_budget or 'medium'}
   - Prep time ≤ {data.cooking_time or '30-45 minutes'} per meal

2. **Nutritionally Optimized:**
   - Hit macro targets precisely
   - Include micronutrient variety
   - Suggest supplements if needed
   - Balance energy throughout day

3. **Practical & Realistic:**
   - Use readily available ingredients
   - Include batch cooking tips
   - Suggest meal prep strategies
   - Provide realistic portion sizes

4. **Progressive & Educational:**
   - Explain macro distribution
   - Include nutrition tips
   - Suggest healthy swaps
   - Build good habits

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON in this exact format:

{{
  "week_plan": [
    {{
      "day": "Monday",
      "meals": [
        {{
          "meal_type": "Breakfast",
          "meal_name": "High-Protein Greek Yogurt Bowl",
          "calories": 450,
          "protein": 25,
          "carbs": 55,
          "fats": 12,
          "ingredients": [
            "1 cup Greek yogurt (2% fat)",
            "1/2 cup granola",
            "1/2 cup mixed berries",
            "1 tbsp honey",
            "2 tbsp sliced almonds"
          ],
          "instructions": [
            "Add Greek yogurt to bowl",
            "Top with granola and berries",
            "Drizzle honey and sprinkle almonds"
          ],
          "prep_time": "5 min",
          "cook_time": "0 min",
          "difficulty": "Easy",
          "tags": ["high-protein", "quick", "vegetarian"],
          "meal_timing": "7:00-9:00 AM",
          "substitutions": [
            "Use cottage cheese instead of Greek yogurt for more protein",
            "Replace honey with maple syrup for vegan option"
          ]
        }}
      ],
      "daily_totals": {{
        "calories": {data.daily_calories or 2000},
        "protein": {data.protein or 150},
        "carbs": {data.carbs or 200},
        "fats": {data.fats or 60}
      }}
    }}
  ],
  "shopping_list": {{
    "proteins": ["Greek yogurt (32 oz)", "Chicken breast (3 lbs)", "Eggs (12)"],
    "carbs": ["Brown rice (2 lbs)", "Whole wheat bread", "Granola"],
    "vegetables": ["Broccoli (2 heads)", "Spinach (1 bag)", "Bell peppers (3)"],
    "fruits": ["Mixed berries (2 cups)", "Bananas (6)", "Apples (4)"],
    "fats": ["Olive oil", "Almonds (8 oz)", "Avocado (2)"],
    "pantry_staples": ["Honey", "Salt", "Black pepper", "Garlic powder"],
    "estimated_cost": "$65-85"
  }},
  "meal_prep_strategy": {{
    "batch_cooking": [
      "Cook all rice for the week on Sunday (saves 30 min daily)",
      "Grill 3 chicken breasts at once (meal prep for 3 days)"
    ],
    "storage_tips": [
      "Store cooked rice in airtight containers (lasts 5 days)",
      "Pre-portion snacks into small containers"
    ],
    "time_saving_hacks": [
      "Use pre-washed salad greens",
      "Buy pre-chopped vegetables if budget allows"
    ]
  }},
  "notes": "This plan respects your dietary preferences and cooking skill level. Track your progress and share more about your preferences for even better personalization!"
}}

**CRITICAL:** Return ONLY the JSON object. No markdown, no explanations, just pure JSON."""

        return prompt, used_defaults, missing_fields

    @classmethod
    def _build_premium_prompt(cls, data: UserProfileData) -> tuple[str, List[str], List[str]]:
        """
        PREMIUM PROMPT - Full personalization (25+ data points)
        This is THE competitive advantage!
        """
        used_defaults: List[str] = []
        missing_fields: List[str] = []

        allergies_str = ', '.join(data.food_allergies) if data.food_allergies else 'None'
        disliked_str = ', '.join(data.disliked_foods) if data.disliked_foods else 'None'
        health_str = ', '.join(data.health_conditions) if data.health_conditions else 'None reported'
        meds_str = ', '.join(data.medications) if data.medications else 'None reported'

        protein_pct = round(((data.protein or 0) * 4 / (data.daily_calories or 1)) * 100)
        carbs_pct = round(((data.carbs or 0) * 4 / (data.daily_calories or 1)) * 100)
        fats_pct = round(((data.fats or 0) * 9 / (data.daily_calories or 1)) * 100)

        prompt = f"""You are an expert nutrition consultant creating a FULLY personalized meal plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE USER PROFILE - PREMIUM PERSONALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PERSONAL DETAILS:**
- Goal: {data.main_goal.replace('_', ' ')}
- Age: {data.age or 'Not specified'}
- Gender: {data.gender or 'Not specified'}
- Current Weight: {data.current_weight} kg
- Target Weight: {data.target_weight or 'Not specified'} kg
- Height: {data.height or 'Not specified'} cm
- Activity Level: {data.activity_level or 'Not specified'}

**NUTRITION TARGETS (Scientifically Calculated):**
- Daily Calories: {data.daily_calories} kcal
- Protein: {data.protein}g ({protein_pct}% of calories)
- Carbs: {data.carbs}g ({carbs_pct}% of calories)
- Fats: {data.fats}g ({fats_pct}% of calories)

**DIETARY PREFERENCES:**
- Dietary Style: {data.dietary_style or 'Balanced'}
- Food Allergies/Intolerances: {allergies_str}
- Disliked Foods: {disliked_str}
- Cooking Skill: {data.cooking_skill or 'Intermediate'}
- Available Cooking Time: {data.cooking_time or '30-45 minutes'}
- Grocery Budget: {data.grocery_budget or 'Medium'}
- Meals Per Day: {data.meals_per_day or 3}
- Meal Prep Preference: {data.meal_prep_preference or 'Some prep'}

**HEALTH CONSIDERATIONS:**
- Health Conditions: {health_str}
- Current Medications: {meds_str}
- Sleep Quality (1-10): {data.sleep_quality or 'Not tracked'}
- Stress Level (1-10): {data.stress_level or 'Not tracked'}

**LIFESTYLE & LOCATION:**
- Country/Region: {data.country or 'International'}
- Water Intake Goal: {data.water_intake_goal or 8} glasses/day

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVANCED INSTRUCTIONS - PREMIUM TIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create an EXCEPTIONAL, fully personalized meal plan with:

1. **Advanced Nutritional Science:**
   - Precise macro distribution based on health conditions
   - Micronutrient optimization (vitamins, minerals)
   - Meal timing for energy and recovery
   - Hydration strategy with electrolyte considerations

2. **Cultural & Personal Customization:**
   - Incorporate regional/cultural food preferences
   - Respect all food allergies and dislikes
   - Match cooking skill and time constraints perfectly
   - Budget-conscious without sacrificing nutrition

3. **Health Condition Optimization:**
   - Adapt for health conditions (diabetes, hypertension, IBS, etc.)
   - Consider medication interactions with foods
   - Support sleep quality and stress management through nutrition
   - Anti-inflammatory focus if needed

4. **Lifestyle Integration:**
   - Practical meal prep strategies for busy schedules
   - Social eating guidance
   - Travel-friendly options
   - Restaurant alternatives

5. **Educational & Empowering:**
   - Explain WHY each meal supports their goals
   - Teach sustainable habits
   - Provide evidence-based nutrition tips
   - Build long-term food relationship

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON) - PREMIUM TIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON in this exact format:

{{
  "week_plan": [
    {{
      "day": "Monday",
      "meals": [
        {{
          "meal_type": "Breakfast",
          "meal_name": "Mediterranean Power Bowl with Omega-3 Boost",
          "calories": 480,
          "protein": 28,
          "carbs": 52,
          "fats": 16,
          "fiber": 8,
          "key_micronutrients": {{
            "vitamin_d": "15% DV",
            "omega_3": "High",
            "magnesium": "20% DV"
          }},
          "ingredients": [
            "2 whole eggs + 2 egg whites",
            "1/2 cup quinoa (cooked)",
            "1/2 cup spinach",
            "1/4 avocado",
            "2 tbsp feta cheese",
            "5 cherry tomatoes",
            "1 tsp olive oil",
            "Fresh herbs (parsley, dill)"
          ],
          "instructions": [
            "Cook quinoa according to package (or use pre-cooked)",
            "Scramble eggs with spinach in olive oil",
            "Plate quinoa, top with eggs, tomatoes, avocado, feta",
            "Garnish with fresh herbs"
          ],
          "prep_time": "8 min",
          "cook_time": "10 min",
          "difficulty": "Easy-Medium",
          "tags": ["high-protein", "mediterranean", "anti-inflammatory", "brain-food"],
          "meal_timing": "7:30-8:30 AM (within 1 hour of waking for optimal metabolism)",
          "why_this_meal": "Combines complete protein, healthy fats, and complex carbs. Omega-3s and antioxidants support brain health and reduce inflammation. Perfect post-workout if training in the morning.",
          "substitutions": [
            "Vegetarian: Replace eggs with tofu scramble + nutritional yeast",
            "Lower carb: Replace quinoa with cauliflower rice",
            "Budget-friendly: Use regular cheese instead of feta"
          ],
          "allergen_info": "Contains: Eggs, Dairy. Gluten-free."
        }}
      ],
      "daily_totals": {{
        "calories": {data.daily_calories or 2000},
        "protein": {data.protein or 150},
        "carbs": {data.carbs or 200},
        "fats": {data.fats or 60},
        "fiber": 30
      }}
    }}
  ],
  "shopping_list": {{
    "proteins": [
      "Organic eggs (18 count) - $6",
      "Wild-caught salmon (1 lb) - $12",
      "Greek yogurt 2% (32 oz) - $7",
      "Chicken breast (2 lbs) - $10"
    ],
    "carbs": [
      "Quinoa (1 lb) - $5",
      "Sweet potatoes (3 lbs) - $4",
      "Whole grain bread - $4",
      "Brown rice (2 lbs) - $3"
    ],
    "vegetables": [
      "Spinach (1 bag) - $3",
      "Broccoli (2 heads) - $4",
      "Bell peppers (3) - $4",
      "Cherry tomatoes (1 pint) - $3",
      "Cauliflower (1 head) - $3"
    ],
    "fruits": [
      "Mixed berries (2 cups) - $6",
      "Bananas (6) - $2",
      "Apples (4) - $3"
    ],
    "fats": [
      "Extra virgin olive oil - $8",
      "Avocados (4) - $6",
      "Raw almonds (8 oz) - $5",
      "Feta cheese (8 oz) - $5"
    ],
    "pantry_staples": [
      "Himalayan pink salt",
      "Black pepper",
      "Turmeric",
      "Garlic powder",
      "Fresh herbs (parsley, dill)"
    ],
    "estimated_cost": "$95-115 (Premium quality, nutrient-dense ingredients)"
  }},
  "hydration_plan": {{
    "daily_water_intake": "{data.water_intake_goal or 8} glasses (2-2.5 liters)",
    "timing": [
      "Morning: 2 glasses upon waking (rehydrate after sleep)",
      "Pre-workout: 1 glass 30 min before exercise",
      "During workout: Sip 1 glass throughout",
      "With meals: 1 glass with each main meal",
      "Evening: 1 glass 2 hours before bed (avoid sleep disruption)"
    ],
    "electrolyte_needs": "Add pinch of Himalayan salt to morning water for electrolyte balance. Consider electrolyte supplement if training > 60 min.",
    "hydration_tips": [
      "Track urine color (pale yellow = well hydrated)",
      "Increase intake on workout days",
      "Herbal teas count toward daily intake",
      "Eat water-rich foods (cucumber, watermelon)"
    ]
  }},
  "personalized_tips": [
    "🎯 Goal Alignment: Your meal plan creates a 500 kcal deficit for sustainable fat loss while preserving muscle (0.5-1 kg/week).",
    "💪 Protein Distribution: 25-30g protein per meal optimizes muscle protein synthesis throughout the day.",
    "🧠 Brain Food: Omega-3s from salmon and walnuts support cognitive function and mood (important given your stress level).",
    "💤 Sleep Optimization: Avoid heavy meals 3 hours before bed. Magnesium-rich foods (spinach, almonds) support sleep quality.",
    "🔥 Metabolism: Eating breakfast within 1 hour of waking kickstarts metabolism and regulates hunger hormones.",
    "🩺 Health Condition Support: Anti-inflammatory foods (turmeric, berries, leafy greens) help manage {health_str}.",
    "📍 Cultural Touch: Mediterranean-inspired meals align with your {data.country or 'international'} food preferences while maximizing nutrition."
  ],
  "meal_prep_strategy": {{
    "batch_cooking": [
      "Sunday: Cook all grains (quinoa, rice) for the week (3 cups each) - 30 min",
      "Sunday: Grill 4 chicken breasts and bake 3 sweet potatoes - 40 min",
      "Monday: Hard boil 12 eggs for quick protein - 15 min"
    ],
    "storage_tips": [
      "Cooked grains: Airtight containers, fridge (5 days) or freeze (3 months)",
      "Proteins: Portion and freeze in meal-sized bags",
      "Pre-chop veggies: Store in water (peppers, carrots) or damp paper towel (leafy greens)",
      "Make-ahead sauces: Prep tahini dressing, pesto in bulk"
    ],
    "time_saving_hacks": [
      "Invest in quality meal prep containers with compartments",
      "Use slow cooker or instant pot for hands-off cooking",
      "Buy pre-washed greens and frozen berries (equally nutritious)",
      "Double recipes and freeze half for busy weeks",
      "Prep snack portions in advance (nuts, fruits) for grab-and-go"
    ],
    "weekly_schedule": {{
      "Sunday": "2 hours meal prep (cook proteins, grains, chop veggies)",
      "Weekdays": "15-20 min assembly per meal (most work done!)",
      "Mid-week": "30 min refresh (cook fresh proteins if needed)"
    }}
  }},
  "notes": "This premium plan is scientifically optimized for YOUR unique profile. Every meal serves your {data.main_goal.replace('_', ' ')} goal while respecting your health conditions, preferences, and lifestyle. Consistency is key - aim for 80% adherence for best results!"
}}

**CRITICAL:** Return ONLY the JSON object. No markdown, no explanations, just pure JSON."""

        return prompt, used_defaults, missing_fields

    @classmethod
    def _calculate_completeness(cls, data: UserProfileData) -> float:
        """Calculate profile data completeness (0-100%)"""
        fields = [
            'main_goal', 'current_weight', 'target_weight', 'age', 'gender', 'height',
            'dietary_style', 'food_allergies', 'cooking_skill', 'cooking_time',
            'grocery_budget', 'meals_per_day', 'activity_level', 'health_conditions',
            'medications', 'sleep_quality', 'stress_level', 'country',
            'disliked_foods', 'meal_prep_preference', 'water_intake_goal'
        ]

        filled = sum(1 for field in fields if getattr(data, field, None) is not None)
        return (filled / len(fields)) * 100

    @classmethod
    def _determine_effective_level(
        cls,
        requested: PersonalizationLevel,
        completeness: float
    ) -> PersonalizationLevel:
        """Determine effective personalization level based on data availability"""
        if completeness < 30:
            return 'BASIC'
        if completeness < 70:
            return 'STANDARD'
        return 'PREMIUM'

    @classmethod
    def _get_defaults_for_goal(cls, goal: str) -> Dict[str, Any]:
        """Get smart defaults based on user's goal"""
        defaults = {
            'lose_weight': {
                'meals_per_day': 3,
                'cooking_skill': 'beginner',
                'cooking_time': '30 minutes',
                'dietary_style': 'balanced',
                'grocery_budget': 'medium',
            },
            'gain_muscle': {
                'meals_per_day': 4,
                'cooking_skill': 'intermediate',
                'cooking_time': '45 minutes',
                'dietary_style': 'high-protein',
                'grocery_budget': 'medium-high',
            },
            'maintain': {
                'meals_per_day': 3,
                'cooking_skill': 'beginner',
                'cooking_time': '30 minutes',
                'dietary_style': 'balanced',
                'grocery_budget': 'medium',
            },
            'improve_health': {
                'meals_per_day': 3,
                'cooking_skill': 'beginner',
                'cooking_time': '30 minutes',
                'dietary_style': 'mediterranean',
                'grocery_budget': 'medium',
            },
        }

        return defaults.get(goal, defaults['maintain'])
