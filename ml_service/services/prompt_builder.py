"""
Meal Plan Prompt Builder - Tiered Personalization System
Ported from frontend TypeScript implementation

BASIC (3 data points) → PREMIUM (25+)
This is GreenLean's competitive advantage - no other app has this depth
"""

from typing import Dict, List, Any, Optional, Literal
from dataclasses import dataclass


PersonalizationLevel = Literal['BASIC', 'PREMIUM']


@dataclass
class MealUserProfileData:
    """User profile data for AI prompt building"""
    # Core Info (BASIC level)
    main_goal: str
    current_weight: float
    target_weight: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    dietary_style: Optional[str] = None
    activity_level: Optional[str] = None
    exercise_frequency: Optional[str] = None

    # Nutrition Targets
    daily_calories: Optional[int] = None
    protein: Optional[int] = None
    carbs: Optional[int] = None
    fats: Optional[int] = None

    # Extra Info (PREMIUM level)
    cooking_skill: Optional[str] = None
    cooking_time: Optional[str] = None
    grocery_budget: Optional[str] = None
    meals_per_day: Optional[int] = None
    food_allergies: Optional[List[str]] = None
    disliked_foods: Optional[List[str]] = None
    meal_prep_preference: Optional[str] = None
    health_conditions: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    sleep_quality: Optional[int] = None
    stress_level: Optional[int] = None
    dietary_restrictions: Optional[List[str]] = None


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
        user_data: MealUserProfileData,
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
    def _build_basic_prompt(cls, data: MealUserProfileData) -> tuple[str, List[str], List[str]]:
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

        prompt = f"""You are a professional nutrition assistant and meal designer, helping create realistic, evidence-based plans.

        You guide and suggest meals — not prescribe — emphasizing flexibility and personal choice.
        Create a deeply personalized daily meal plan with 3–6 meals (depending on {defaults['meals_per_day']}), optimized for the user's preferences, goals, and calorie/macro targets, designed for sustainable progress and optimal health outcomes.

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ESSENTIAL USER INFO
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        **Goal:** {data.main_goal.replace('_', ' ')}
        **Current Weight:** {data.current_weight} kg
        **Target Weight:** {data.target_weight or 'Not specified'} kg
        **Age:** {data.age or 'Not specified'}
        **Gender:** {data.gender or 'Not specified'}
        **Activity Level:** {data.activity_level or 'Not specified'}
        **Exercise Frequency:** {data.exercise_frequency or 'Not specified'}

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
        - Dietary style: {data.dietary_style or defaults['dietary_style']}
        - Budget: {defaults['grocery_budget']}

        ⚠️  **IMPORTANT:** Since this is a quick-start plan, we're using common preferences.
        As the user answers more questions, their plan will become MORE personalized!

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        CRITICAL INSTRUCTIONS
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
          - Meet 100% accurately the calorie and macro targets
          - VERY ACCURATE meals based on macro distribution (MUST match exactly the NUTRITION TARGETS (Scientifically Calculated) which is:
            - Daily Calories: {data.daily_calories or 2000} kcal
            - Protein: {data.protein or 150}g ({protein_pct}% of calories)
            - Carbs: {data.carbs or 200}g ({carbs_pct}% of calories)
            - Fats: {data.fats or 60}g ({fats_pct}% of calories)
            **daily_totals should be filled with these exact Scientifically Calculated nutrition targets**
            )
          - Include variety of nutrients
          - 3-4 meals per day plus snacks

        6. **Goal-Specific Optimization**:
          - For "Lose fat": Create slight calorie deficit, high protein, high satiety
          - For "Build muscle": Ensure adequate protein timing, pre/post-workout nutrition
          - For "Body recomposition": Balance protein high, strategic carb timing
          - For "Maintain weight": Focus on nutrient density and sustainability

        7. **Consistency & Sustainability**:
          - Allow some meal repetition across days to support routine and consistency.
          - Favor practical, repeatable recipes over excessive novelty.

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        OUTPUT FORMAT (STRICT JSON)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Return ONLY valid JSON in this exact format:

        {{
          "meals": [
            {{
              "meal_type": "breakfast/lunch/dinner/snack",
              "meal_name": "Creative, appetizing name (e.g., 'Mediterranean Power Bowl')",
              "prep_time_minutes": 10-30,
              "difficulty": "easy/medium/advanced",
              "meal_timing": "Specific realistic range like '7:00 AM - 8:00 AM'",
              "total_calories": number,
              "total_protein": number,
              "total_carbs": number,
              "total_fats": number,
              "total_fiber": number,
              "tags": ["short descriptive tags, like 'high-protein', 'quick', 'gut-friendly'"],
              "foods": [
                {{
                  "name": "Food item name",
                  "portion": "e.g., 1 cup / 150g / 2 slices",
                  "grams": number,
                  "calories": number,
                  "protein": number,
                  "carbs": number,
                  "fats": number,
                  "fiber": number
                }}
              ],
              "recipe": "Full recipe instructions on how to exactly cook each mean written as natural text, not a list.",
              "tips": ["2-3 short practical tips about preparation, substitutions, or storage."]
            }}
          ],
          "daily_totals": {{
            "calories": {data.daily_calories or 2000},
            "protein": {data.protein or 150},
            "carbs": {data.carbs or 200},
            "fats": {data.fats or 60},
            "fiber": "calculate the fiber amount based on the food and user's data and return a number here",
            "variance": "± 5%"
          }},
          "shopping_list": {{
            "proteins": ["List of all protein items with estimated weekly quantity"],
            "vegetables": ["List of vegetables required for all meals"],
            "carbs": ["List of carbohydrate sources"],
            "fats": ["Healthy fat sources used"],
            "pantry_staples": ["Condiments, herbs, spices, sauces"],
            "estimated_cost": "Estimated weekly cost aligned with $50-70"
          }},
          "meal_prep_strategy": {{
            "batch_cooking": ["Batch ideas, e.g., cook 4 chicken breasts on Sunday", "Prep grains ahead"],
            "storage_tips": ["Storage times and methods for cooked meals"],
            "time_saving_hacks": ["Practical hacks based on {defaults["cooking_time"]} constraint"]
          }}
          "notes": "This is a beginner-friendly plan. As you share more preferences, we'll personalize it further!"
        }}

        **CRITICAL:** Return ONLY the JSON object. No markdown, no explanations, just pure JSON."""

        return prompt, used_defaults, missing_fields

    @classmethod
    def _build_premium_prompt(cls, data: MealUserProfileData) -> tuple[str, List[str], List[str]]:
        """
        PREMIUM PROMPT - Full personalization (25+ data points)
        This is THE competitive advantage!
        """
        defaults = cls._get_defaults_for_goal(data.main_goal)
        used_defaults: List[str] = []
        missing_fields: List[str] = []

        allergies_str = ', '.join(data.food_allergies) if data.food_allergies else 'None'
        disliked_str = ', '.join(data.disliked_foods) if data.disliked_foods else 'None'
        health_str = ', '.join(data.health_conditions) if data.health_conditions else 'None reported'
        meds_str = ', '.join(data.medications) if data.medications else 'None reported'

        protein_pct = round(((data.protein or 0) * 4 / (data.daily_calories or 1)) * 100)
        carbs_pct = round(((data.carbs or 0) * 4 / (data.daily_calories or 1)) * 100)
        fats_pct = round(((data.fats or 0) * 9 / (data.daily_calories or 1)) * 100)

        prompt = f"""You are a professional nutrition consultant and meal designer, helping create realistic,
        evidence-based FULLY personalized meal plans.

        You guide and suggest meals — not prescribe — emphasizing flexibility and personal choice.
        Create a deeply personalized daily meal plan with 3–5 meals (depending on {data.meals_per_day or 3}),
        optimized for the user's preferences, goals, and calorie/macro targets, designed for sustainable progress
        and optimal health outcomes.

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
        - Exercise Frequency: {data.exercise_frequency or 'Not specified'}

        **NUTRITION TARGETS (Scientifically Calculated):**
        - Daily Calories: {data.daily_calories or 2000} kcal
        - Protein: {data.protein or 150}g ({protein_pct}% of calories)
        - Carbs: {data.carbs or 200}g ({carbs_pct}% of calories)
        - Fats: {data.fats or 60}g ({fats_pct}% of calories)

        **DIETARY PREFERENCES:**
        - Dietary Style: {data.dietary_style or defaults['dietary_style']}
        - Food Allergies/Intolerances: {allergies_str}
        - Dietary Restrictions: {data.dietary_restrictions}
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

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ADVANCED CRITICAL INSTRUCTIONS - PREMIUM TIER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Create an EXCEPTIONAL, fully personalized meal plan with:

        1. **Advanced Nutritional Science:**
          - Precise macro distribution based on health conditions
          - VERY ACCURATE meals based on macro distribution (MUST match exactly the NUTRITION TARGETS (Scientifically Calculated) which is:
            - Daily Calories: {data.daily_calories or 2000} kcal
            - Protein: {data.protein or 150}g ({protein_pct}% of calories)
            - Carbs: {data.carbs or 200}g ({carbs_pct}% of calories)
            - Fats: {data.fats or 60}g ({fats_pct}% of calories)
            **daily_totals should be filled with these exact Scientifically Calculated nutrition targets**
            )
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

        6. **Goal-Specific Optimization**:
          - For "Lose fat": Create slight calorie deficit, high protein, high satiety
          - For "Build muscle": Ensure adequate protein timing, pre/post-workout nutrition
          - For "Body recomposition": Balance protein high, strategic carb timing
          - For "Maintain weight": Focus on nutrient density and sustainability

        7. **Consistency & Sustainability**:
          - Allow some meal repetition across days to support routine and consistency.
          - Favor practical, repeatable recipes over excessive novelty.

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        OUTPUT FORMAT (STRICT JSON) - PREMIUM TIER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Return ONLY valid JSON in this exact format:

        {{
          "meals": [
            {{
              "meal_type": "breakfast/lunch/dinner/snack",
              "meal_name": "Creative, appetizing name (e.g., 'Mediterranean Power Bowl')",
              "prep_time_minutes": 10-30,
              "difficulty": "easy/medium/advanced",
              "meal_timing": "Specific realistic range like '7:00 AM - 8:00 AM'",
              "total_calories": number,
              "total_protein": number,
              "total_carbs": number,
              "total_fats": number,
              "total_fiber": number,
              "tags": ["short descriptive tags, like 'high-protein', 'quick', 'gut-friendly'"],
              "key_micronutrients": {{
                "vitamin_d": "15% DV",
                "omega_3": "High",
                "magnesium": "20% DV"
              }},
              "foods": [
                {{
                  "name": "Food item name",
                  "portion": "e.g., 1 cup / 150g / 2 slices",
                  "grams": number,
                  "calories": number,
                  "protein": number,
                  "carbs": number,
                  "fats": number,
                  "fiber": number
                }}
              ],
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
              "recipe": "Full recipe instructions on how to exactly cook each mean written as natural text, not a list.",
              "tips": ["2-3 short practical tips about preparation, substitutions, or storage."],
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
            "fiber": 25,
            "variance": "± 5%"
          }},
          "shopping_list": {{
            "proteins": ["List of all protein items in the meals you'll generate with estimated weekly quantity"],
            "vegetables": ["List of vegetables required for all the meals you'll generate"],
            "fruits": ["List of fruits required for all meals you'll generate"],
            "carbs": ["List of carbohydrate sources you'll generate in meals"],
            "fats": ["Healthy fat sources used you'll generate in meals"],
            "pantry_staples": ["Condiments, herbs, spices, sauces"],
            "estimated_cost": "Estimated weekly cost aligned with {data.grocery_budget}"
          }},
          "hydration_plan": {{
            "daily_water_intake": "number of glasses or ml based on {data.gender}",
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
              "Practical hacks based on {data.cooking_time or '30-45 minutes'} constraint",
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
    def _calculate_completeness(cls, data: MealUserProfileData) -> float:
        """Calculate profile data completeness (0-100%)"""
        fields = [
            'main_goal', 'current_weight', 'target_weight', 'age', 'gender', 'height',
            'dietary_style', 'activity_level', 'exercise_frequency', 'cooking_skill', 
            'cooking_time', 'grocery_budget', 'meals_per_day', 'food_allergies', 'disliked_foods',
            'meal_prep_preference' 'health_conditions', 'medications', 'sleep_quality', 'stress_level',
            'dietary_restrictions'
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
        if completeness >= 70:
            return 'PREMIUM'
        return 'BASIC'

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
