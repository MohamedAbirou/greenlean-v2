/**
 * Meal Plan Prompt Builder - Tiered Personalization System
 * BASIC (3 data points) → STANDARD (10-15) → PREMIUM (25+)
 *
 * This is GreenLean's competitive advantage - no other app has this depth
 */

import type {
  MealPlanPromptConfig,
  AIPromptResponse,
  UserProfileData,
  PersonalizationLevel,
} from './types';

export class MealPlanPromptBuilder {
  /**
   * Build AI prompt based on available user data and personalization level
   */
  static buildPrompt(config: MealPlanPromptConfig): AIPromptResponse {
    const { userData, personalizationLevel } = config;

    // Calculate data completeness
    const completeness = this.calculateCompleteness(userData);

    // Determine actual level based on data availability
    const effectiveLevel = this.determineEffectiveLevel(
      personalizationLevel,
      completeness
    );

    let prompt: string;
    let usedDefaults: string[] = [];
    let missingFields: string[] = [];

    switch (effectiveLevel) {
      case 'BASIC':
        ({ prompt, usedDefaults, missingFields } = this.buildBasicPrompt(userData));
        break;
      case 'STANDARD':
        ({ prompt, usedDefaults, missingFields } = this.buildStandardPrompt(userData));
        break;
      case 'PREMIUM':
        ({ prompt, usedDefaults, missingFields } = this.buildPremiumPrompt(userData));
        break;
    }

    return {
      prompt,
      metadata: {
        personalizationLevel: effectiveLevel,
        dataCompleteness: completeness,
        missingFields,
        usedDefaults,
      },
    };
  }

  /**
   * BASIC PROMPT - Instant results with smart defaults
   * Uses: goal, weight, target weight
   */
  private static buildBasicPrompt(data: UserProfileData): {
    prompt: string;
    usedDefaults: string[];
    missingFields: string[];
  } {
    const defaults = this.getDefaultsForGoal(data.mainGoal);
    const usedDefaults: string[] = [];
    const missingFields: string[] = [];

    // Track what we're defaulting
    if (!data.dietaryStyle) { usedDefaults.push('dietaryStyle'); }
    if (!data.mealsPerDay) { usedDefaults.push('mealsPerDay'); }
    if (!data.cookingSkill) { usedDefaults.push('cookingSkill'); }
    if (!data.cookingTime) { usedDefaults.push('cookingTime'); }
    if (!data.groceryBudget) { usedDefaults.push('groceryBudget'); }

    const prompt = `You are a professional nutrition assistant creating a practical meal plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ESSENTIAL USER INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Goal:** ${data.mainGoal.replace('_', ' ')}
**Current Weight:** ${data.currentWeight} kg
**Target Weight:** ${data.targetWeight || 'Not specified'} kg

**Nutrition Targets:**
- Daily Calories: ${data.dailyCalories || 2000} kcal
- Protein: ${data.protein || 150}g
- Carbs: ${data.carbs || 200}g
- Fats: ${data.fats || 60}g

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEFAULT PREFERENCES (User hasn't specified yet - we're using smart defaults)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Meals per day: ${defaults.mealsPerDay}
- Cooking skill: ${defaults.cookingSkill}
- Time available: ${defaults.cookingTime}
- Dietary style: ${defaults.dietaryStyle}
- Budget: ${defaults.groceryBudget}

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
   - Quick prep time (< ${defaults.cookingTime})
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

{
  "week_plan": [
    {
      "day": "Monday",
      "meals": [
        {
          "meal_type": "Breakfast",
          "meal_name": "Oatmeal with Banana and Almonds",
          "calories": 450,
          "protein": 15,
          "carbs": 65,
          "fats": 12,
          "ingredients": [
            "1 cup rolled oats",
            "1 medium banana",
            "2 tbsp sliced almonds",
            "1 cup almond milk",
            "1 tsp honey"
          ],
          "instructions": [
            "Cook oats in almond milk for 5 minutes",
            "Top with sliced banana and almonds",
            "Drizzle with honey"
          ],
          "prep_time": "5 min",
          "cook_time": "5 min",
          "difficulty": "Easy",
          "substitutions": ["Use walnuts instead of almonds", "Use cow's milk instead of almond milk"]
        }
      ],
      "daily_totals": {
        "calories": 2000,
        "protein": 150,
        "carbs": 200,
        "fats": 60
      }
    }
  ],
  "shopping_list": {
    "proteins": ["Chicken breast (2 lbs)", "Eggs (1 dozen)"],
    "carbs": ["Brown rice (2 lbs)", "Whole wheat bread (1 loaf)"],
    "vegetables": ["Broccoli (2 heads)", "Spinach (1 bag)"],
    "fruits": ["Bananas (6)", "Apples (4)"],
    "dairy": ["Greek yogurt (32 oz)", "Almond milk (1 carton)"],
    "pantry": ["Olive oil", "Salt", "Pepper", "Garlic powder"],
    "estimated_cost": "$50-70"
  },
  "meal_prep_tips": [
    "Cook rice in bulk on Sunday for the week",
    "Pre-chop vegetables and store in containers",
    "Hard-boil eggs for quick protein"
  ],
  "notes": "This is a beginner-friendly plan. As you share more preferences, we'll personalize it further!"
}

**CRITICAL:** Return ONLY the JSON object. No markdown, no explanations, just pure JSON.`;

    return { prompt, usedDefaults, missingFields };
  }

  /**
   * STANDARD PROMPT - Medium personalization (10-15 data points)
   * Includes dietary preferences, cooking skills, some restrictions
   */
  private static buildStandardPrompt(data: UserProfileData): {
    prompt: string;
    usedDefaults: string[];
    missingFields: string[];
  } {
    const usedDefaults: string[] = [];
    const missingFields: string[] = [];

    const prompt = `You are a professional nutrition assistant creating a personalized meal plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER PROFILE (PARTIAL - GROWING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**KNOWN PREFERENCES:**

**Goal:** ${data.mainGoal.replace('_', ' ')}
**Physical Stats:**
- Current Weight: ${data.currentWeight} kg
- Target Weight: ${data.targetWeight || 'Not specified'} kg
- Age: ${data.age || 'Not specified'}
- Gender: ${data.gender || 'Not specified'}

**Dietary Preferences:**
- Style: ${data.dietaryStyle || 'Balanced'}
- Food Allergies: ${data.foodAllergies?.length ? data.foodAllergies.join(', ') : 'None reported'}
- Cooking Skill: ${data.cookingSkill || 'Intermediate'}
- Time Available: ${data.cookingTime || '30-45 minutes'}
- Budget: ${data.groceryBudget || 'Medium ($50-100/week)'}
- Meals per Day: ${data.mealsPerDay || 3}

**Nutrition Targets:**
- Calories: ${data.dailyCalories} kcal
- Protein: ${data.protein}g
- Carbs: ${data.carbs}g
- Fats: ${data.fats}g

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STILL LEARNING ABOUT USER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

We don't yet know about:
${!data.healthConditions ? '- Specific health conditions (assume healthy)' : ''}
${!data.country ? '- Cultural food preferences (use international variety)' : ''}
${!data.dislikedFoods ? '- Disliked foods (avoid only confirmed allergens)' : ''}
${!data.mealPrepPreference ? '- Meal prep preferences' : ''}

💡 **As we learn more, plans will become even more tailored!**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a personalized meal plan that:

1. **Respects Known Preferences:**
   - Follow ${data.dietaryStyle || 'balanced'} dietary style
   - AVOID all listed allergies: ${data.foodAllergies?.join(', ') || 'none'}
   - Match cooking skill level: ${data.cookingSkill || 'intermediate'}
   - Stay within budget: ${data.groceryBudget || 'medium'}
   - Prep time ≤ ${data.cookingTime || '30-45 minutes'} per meal

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

[... OUTPUT FORMAT - Same JSON structure as BASIC ...]

Return ONLY valid JSON. No markdown, no extra text.`;

    return { prompt, usedDefaults, missingFields };
  }

  /**
   * PREMIUM PROMPT - Full personalization (25+ data points)
   * This is THE competitive advantage!
   */
  private static buildPremiumPrompt(data: UserProfileData): {
    prompt: string;
    usedDefaults: string[];
    missingFields: string[];
  } {
    const usedDefaults: string[] = [];
    const missingFields: string[] = [];

    const prompt = `You are an expert nutrition consultant creating a FULLY personalized meal plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE USER PROFILE - PREMIUM PERSONALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**PERSONAL DETAILS:**
- Goal: ${data.mainGoal.replace('_', ' ')}
- Age: ${data.age || 'Not specified'}
- Gender: ${data.gender || 'Not specified'}
- Current Weight: ${data.currentWeight} kg
- Target Weight: ${data.targetWeight || 'Not specified'} kg
- Height: ${data.height || 'Not specified'} cm
- Activity Level: ${data.activityLevel || 'Not specified'}

**NUTRITION TARGETS (Scientifically Calculated):**
- Daily Calories: ${data.dailyCalories} kcal
- Protein: ${data.protein}g (${Math.round(((data.protein || 0) * 4 / (data.dailyCalories || 1)) * 100)}% of calories)
- Carbs: ${data.carbs}g (${Math.round(((data.carbs || 0) * 4 / (data.dailyCalories || 1)) * 100)}% of calories)
- Fats: ${data.fats}g (${Math.round(((data.fats || 0) * 9 / (data.dailyCalories || 1)) * 100)}% of calories)

**DIETARY PREFERENCES:**
- Dietary Style: ${data.dietaryStyle || 'Balanced'}
- Food Allergies/Intolerances: ${data.foodAllergies?.length ? data.foodAllergies.join(', ') : 'None'}
- Disliked Foods: ${data.dislikedFoods?.length ? data.dislikedFoods.join(', ') : 'None'}
- Cooking Skill: ${data.cookingSkill || 'Intermediate'}
- Available Cooking Time: ${data.cookingTime || '30-45 minutes'}
- Grocery Budget: ${data.groceryBudget || 'Medium'}
- Meals Per Day: ${data.mealsPerDay || 3}
- Meal Prep Preference: ${data.mealPrepPreference || 'Some prep'}

**HEALTH CONSIDERATIONS:**
- Health Conditions: ${data.healthConditions?.length ? data.healthConditions.join(', ') : 'None reported'}
- Current Medications: ${data.medications?.length ? data.medications.join(', ') : 'None reported'}
- Sleep Quality (1-10): ${data.sleepQuality || 'Not tracked'}
- Stress Level (1-10): ${data.stressLevel || 'Not tracked'}

**LIFESTYLE & LOCATION:**
- Country/Region: ${data.country || 'International'}
- Water Intake Goal: ${data.waterIntakeGoal || 8} glasses/day

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVANCED INSTRUCTIONS - PREMIUM TIER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create an EXCEPTIONAL, fully personalized meal plan that:

1. **Medical & Health Optimization:**
   ${data.healthConditions?.includes('diabetes') ? '- Use low-GI carbs, balance throughout day for blood sugar stability' : ''}
   ${data.healthConditions?.includes('IBS') ? '- Avoid FODMAP triggers, include gut-friendly foods' : ''}
   ${data.healthConditions?.includes('high_blood_pressure') ? '- Limit sodium, emphasize potassium-rich foods' : ''}
   ${data.healthConditions?.includes('PCOS') ? '- Focus on low-GI carbs, anti-inflammatory foods' : ''}
   - Consider medication interactions if applicable
   - Optimize for sleep quality and stress reduction

2. **Cultural & Regional Customization:**
   ${data.country ? `- Include traditional ${data.country} ingredients and dishes` : '- Use international variety'}
   - Use seasonally available produce
   - Respect cultural eating patterns
   - Suggest local alternatives when needed

3. **Advanced Nutritional Science:**
   - Nutrient timing for optimal energy
   - Meal frequency matched to metabolism
   - Strategic carb cycling if appropriate
   - Supplement recommendations (vitamin D, omega-3, etc.)
   - Hydration strategy

4. **Precision Macros & Micros:**
   - Hit targets within ±5% accuracy
   - Ensure adequate fiber (25-30g)
   - Include variety for micronutrients
   - Balance sodium/potassium ratio
   - Optimize protein timing

5. **Lifestyle Integration:**
   - Match meal timing to user's schedule
   - Include budget-conscious options
   - Provide restaurant alternatives
   - Account for social situations
   - Include emergency backup meals

6. **Behavioral Psychology:**
   - Build sustainable habits
   - Include "treat" meals if appropriate
   - Prevent diet fatigue with variety
   - Make adherence realistic
   - Include motivational tips

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ENHANCED OUTPUT FORMAT (PREMIUM)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "personalization_summary": {
    "level": "PREMIUM",
    "data_points_used": 25,
    "health_considerations": ["List any conditions addressed"],
    "cultural_customizations": ["Regional adaptations made"]
  },
  "week_plan": [
    {
      "day": "Monday",
      "theme": "Energy & Focus",
      "meals": [
        {
          "meal_type": "Breakfast",
          "meal_name": "...",
          "timing": "7:00 AM",
          "calories": 450,
          "protein": 30,
          "carbs": 45,
          "fats": 12,
          "fiber": 8,
          "ingredients": [...],
          "instructions": [...],
          "prep_time": "10 min",
          "cook_time": "10 min",
          "difficulty": "Easy",
          "meal_prep_notes": "Can be prepped night before",
          "nutritional_benefits": "High protein for satiety, complex carbs for sustained energy",
          "substitutions": [...],
          "allergen_free_version": "..."
        }
      ],
      "daily_totals": {
        "calories": ${data.dailyCalories},
        "protein": ${data.protein},
        "carbs": ${data.carbs},
        "fats": ${data.fats},
        "fiber": 30,
        "water_reminder": "${data.waterIntakeGoal || 8} glasses"
      },
      "daily_tips": "Front-load carbs for morning energy, taper in evening for better sleep"
    }
  ],
  "shopping_list": {
    "proteins": [...],
    "carbs": [...],
    "vegetables": [...],
    "fruits": [...],
    "dairy": [...],
    "pantry": [...],
    "estimated_cost": "$XX-YY",
    "budget_saving_tips": [...]
  },
  "meal_prep_guide": {
    "sunday_prep": ["Steps for batch cooking"],
    "weekly_storage": ["How to store prepped meals"],
    "time_saving_tips": [...]
  },
  "supplement_recommendations": [
    {
      "supplement": "Vitamin D3",
      "dosage": "2000 IU daily",
      "reason": "If limited sun exposure",
      "timing": "With breakfast (fat-soluble)"
    }
  ],
  "progress_optimization": {
    "week_1_focus": "Habit formation and adherence",
    "adjustments_after_week_2": "Monitor weight trend, adjust calories if needed",
    "expected_progress": "0.5-1kg per week if goal is weight loss"
  },
  "restaurant_alternatives": [
    {
      "restaurant_type": "Italian",
      "recommended_orders": ["Grilled chicken caesar salad", "Zucchini noodles with marinara"],
      "macro_estimates": {...}
    }
  ],
  "success_tips": [
    "Prep on Sundays to save 3+ hours during the week",
    "Use a food scale for first 2 weeks to learn portions",
    "Drink 500ml water before each meal to support fullness"
  ]
}

**CRITICAL:** Return ONLY the JSON object. No markdown, no extra text, just pure valid JSON.`;

    return { prompt, usedDefaults, missingFields };
  }

  /**
   * Calculate profile data completeness (0-100%)
   */
  private static calculateCompleteness(data: UserProfileData): number {
    const fields = [
      'mainGoal',
      'currentWeight',
      'targetWeight',
      'age',
      'gender',
      'height',
      'dietaryStyle',
      'foodAllergies',
      'cookingSkill',
      'cookingTime',
      'groceryBudget',
      'mealsPerDay',
      'activityLevel',
      'healthConditions',
      'medications',
      'sleepQuality',
      'stressLevel',
      'country',
      'dislikedFoods',
      'mealPrepPreference',
      'waterIntakeGoal',
    ];

    const filledFields = fields.filter((field) => {
      const value = data[field as keyof UserProfileData];
      return value !== undefined && value !== null && value !== '';
    });

    return (filledFields.length / fields.length) * 100;
  }

  /**
   * Determine effective personalization level based on data availability
   */
  private static determineEffectiveLevel(
    requested: PersonalizationLevel,
    completeness: number
  ): PersonalizationLevel {
    if (completeness < 30) return 'BASIC';
    if (completeness < 70) return 'STANDARD';
    return 'PREMIUM';
  }

  /**
   * Get smart defaults based on user's goal
   */
  private static getDefaultsForGoal(goal: string) {
    const defaults = {
      lose_weight: {
        mealsPerDay: 3,
        cookingSkill: 'beginner',
        cookingTime: '30 minutes',
        dietaryStyle: 'balanced',
        groceryBudget: 'medium',
      },
      gain_muscle: {
        mealsPerDay: 4,
        cookingSkill: 'intermediate',
        cookingTime: '45 minutes',
        dietaryStyle: 'high-protein',
        groceryBudget: 'medium-high',
      },
      maintain: {
        mealsPerDay: 3,
        cookingSkill: 'beginner',
        cookingTime: '30 minutes',
        dietaryStyle: 'balanced',
        groceryBudget: 'medium',
      },
      improve_health: {
        mealsPerDay: 3,
        cookingSkill: 'beginner',
        cookingTime: '30 minutes',
        dietaryStyle: 'mediterranean',
        groceryBudget: 'medium',
      },
    };

    return defaults[goal as keyof typeof defaults] || defaults.maintain;
  }
}
