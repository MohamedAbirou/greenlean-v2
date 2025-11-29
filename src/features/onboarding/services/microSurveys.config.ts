/**
 * Micro-Surveys Configuration
 * Progressive profiling - collect data contextually without overwhelming users
 */

export type MicroSurveyTrigger = 'time_based' | 'action_based' | 'context_based';
export type MicroSurveyCategory = 'nutrition' | 'fitness' | 'lifestyle' | 'health';
export type MicroSurveyPriority = 10 | 9 | 8 | 7 | 6 | 5;

export interface MicroSurvey {
  id: string;
  trigger: MicroSurveyTrigger;
  triggerCondition: string;
  question: string;
  description?: string;
  options: (string | { value: string; label: string })[];
  multiSelect?: boolean;
  category: MicroSurveyCategory;
  priority: MicroSurveyPriority; // 10 = ask ASAP, 5 = low priority
  skipIf?: string; // Condition to skip this survey
  icon?: string;
}

/**
 * All configured micro-surveys
 * Sorted by priority (highest first)
 */
export const MICRO_SURVEYS: MicroSurvey[] = [
  // ═══════════════════════════════════════════════════════════
  // HIGH PRIORITY (Ask within first 3 sessions)
  // ═══════════════════════════════════════════════════════════

  {
    id: 'dietary_restrictions',
    trigger: 'action_based',
    triggerCondition: 'user_views_meal_plan',
    question: 'Any dietary restrictions?',
    description: 'This helps us create meals that work for you',
    options: [
      { value: 'none', label: 'None' },
      { value: 'vegetarian', label: '🥕 Vegetarian' },
      { value: 'vegan', label: '🌱 Vegan' },
      { value: 'pescatarian', label: '🐟 Pescatarian' },
      { value: 'keto', label: '🥑 Keto' },
      { value: 'paleo', label: '🍖 Paleo' },
      { value: 'gluten_free', label: '🌾 Gluten-Free' },
      { value: 'dairy_free', label: '🥛 Dairy-Free' },
    ],
    multiSelect: true,
    category: 'nutrition',
    priority: 10,
    icon: '🥗',
  },

  {
    id: 'food_allergies',
    trigger: 'action_based',
    triggerCondition: 'user_views_meal_plan',
    question: 'Any food allergies we should know about?',
    description: "We'll make sure to avoid these in your meal plans",
    options: [
      { value: 'none', label: 'None' },
      { value: 'dairy', label: '🥛 Dairy' },
      { value: 'eggs', label: '🥚 Eggs' },
      { value: 'nuts', label: '🥜 Nuts' },
      { value: 'shellfish', label: '🦐 Shellfish' },
      { value: 'gluten', label: '🌾 Gluten' },
      { value: 'soy', label: '🫘 Soy' },
      { value: 'fish', label: '🐟 Fish' },
    ],
    multiSelect: true,
    category: 'nutrition',
    priority: 10,
    icon: '⚠️',
  },

  {
    id: 'cooking_time',
    trigger: 'action_based',
    triggerCondition: 'user_views_recipe',
    question: 'How much time do you usually have for cooking?',
    description: "We'll match recipes to your schedule",
    options: [
      { value: '15_or_less', label: '⚡ 15 minutes or less' },
      { value: '15_30', label: '⏰ 15-30 minutes' },
      { value: '30_45', label: '🕐 30-45 minutes' },
      { value: '45_60', label: '🕑 45-60 minutes' },
      { value: '60_plus', label: '👨‍🍳 1+ hour (I enjoy cooking!)' },
    ],
    category: 'nutrition',
    priority: 9,
    icon: '⏰',
  },

  {
    id: 'gym_access',
    trigger: 'action_based',
    triggerCondition: 'user_views_workout_plan',
    question: 'Do you have access to a gym?',
    description: "We'll tailor your workouts to your environment",
    options: [
      { value: 'full_gym', label: '🏋️ Yes, full gym access' },
      { value: 'limited_gym', label: '🏃 Yes, but limited equipment' },
      { value: 'home_only', label: '🏠 No, home workouts only' },
      { value: 'outdoor', label: '🌳 I train outdoors' },
    ],
    category: 'fitness',
    priority: 10,
    icon: '🏋️',
  },

  // ═══════════════════════════════════════════════════════════
  // MEDIUM PRIORITY (Ask after 3-5 sessions)
  // ═══════════════════════════════════════════════════════════

  {
    id: 'sleep_quality',
    trigger: 'time_based',
    triggerCondition: 'after_3_days',
    question: 'How would you rate your sleep quality lately?',
    description: 'Sleep affects recovery and progress',
    options: [
      { value: 'excellent', label: '😴 Excellent (7-9 hours, restful)' },
      { value: 'good', label: '😊 Good (6-7 hours, mostly restful)' },
      { value: 'fair', label: '😐 Fair (5-6 hours, some issues)' },
      { value: 'poor', label: '😔 Poor (< 5 hours or very disrupted)' },
    ],
    category: 'lifestyle',
    priority: 7,
    icon: '😴',
  },

  {
    id: 'stress_level',
    trigger: 'time_based',
    triggerCondition: 'after_3_days',
    question: 'How stressed have you been lately?',
    description: 'We can adjust your plan based on stress levels',
    options: [
      { value: '1', label: '1 - Very relaxed' },
      { value: '2', label: '2' },
      { value: '3', label: '3' },
      { value: '4', label: '4' },
      { value: '5', label: '5 - Moderate' },
      { value: '6', label: '6' },
      { value: '7', label: '7' },
      { value: '8', label: '8' },
      { value: '9', label: '9' },
      { value: '10', label: '10 - Extremely stressed' },
    ],
    category: 'lifestyle',
    priority: 7,
    icon: '🧘',
  },

  {
    id: 'budget',
    trigger: 'action_based',
    triggerCondition: 'user_views_shopping_list',
    question: "What's your typical weekly grocery budget?",
    description: "We'll recommend meals within your budget",
    options: [
      { value: 'low', label: '💵 Budget-friendly (< $50/week)' },
      { value: 'medium', label: '💰 Moderate ($50-100/week)' },
      { value: 'high', label: '💳 Flexible ($100-150/week)' },
      { value: 'premium', label: '💎 Premium ($150+/week)' },
    ],
    category: 'nutrition',
    priority: 8,
    icon: '💰',
  },

  {
    id: 'cooking_skill',
    trigger: 'action_based',
    triggerCondition: 'user_views_recipe',
    question: 'How would you rate your cooking skills?',
    description: "We'll match recipe complexity to your skill level",
    options: [
      { value: 'beginner', label: '🥚 Beginner (I can boil eggs)' },
      { value: 'intermediate', label: '👨‍🍳 Intermediate (I can follow recipes)' },
      { value: 'advanced', label: '👨‍🍳 Advanced (I love experimenting!)' },
    ],
    category: 'nutrition',
    priority: 8,
    icon: '👨‍🍳',
  },

  // ═══════════════════════════════════════════════════════════
  // LOW PRIORITY (Ask after 1 week)
  // ═══════════════════════════════════════════════════════════

  {
    id: 'health_conditions',
    trigger: 'time_based',
    triggerCondition: 'after_7_days',
    question: 'Any health conditions we should consider?',
    description: 'We can adapt your plan for specific health needs',
    options: [
      { value: 'none', label: 'None' },
      { value: 'diabetes', label: '🩺 Diabetes' },
      { value: 'high_blood_pressure', label: '❤️ High Blood Pressure' },
      { value: 'high_cholesterol', label: '🫀 High Cholesterol' },
      { value: 'ibs', label: '🤢 IBS/Digestive Issues' },
      { value: 'pcos', label: '🩺 PCOS' },
      { value: 'thyroid', label: '🦋 Thyroid Condition' },
      { value: 'other', label: '📋 Other' },
    ],
    multiSelect: true,
    category: 'health',
    priority: 6,
    skipIf: 'user_already_provided_health_info',
    icon: '🏥',
  },

  {
    id: 'injuries',
    trigger: 'action_based',
    triggerCondition: 'user_completes_3_workouts',
    question: 'Any injuries or physical limitations?',
    description: "We'll modify exercises to work around limitations",
    options: [
      { value: 'none', label: 'None' },
      { value: 'knee', label: '🦵 Knee Issues' },
      { value: 'back', label: '🔙 Back Pain' },
      { value: 'shoulder', label: '💪 Shoulder Problems' },
      { value: 'ankle', label: '🦶 Ankle Issues' },
      { value: 'wrist', label: '🖐️ Wrist Problems' },
      { value: 'other', label: '🤕 Other Injury' },
    ],
    multiSelect: true,
    category: 'fitness',
    priority: 6,
    icon: '🤕',
  },

  {
    id: 'meal_prep_preference',
    trigger: 'action_based',
    triggerCondition: 'user_views_meal_plan_twice',
    question: 'How do you feel about meal prep?',
    description: 'We can suggest batch cooking strategies',
    options: [
      { value: 'love_it', label: '😍 Love it! I prep everything' },
      { value: 'some_prep', label: '👍 Some prep is fine' },
      { value: 'minimal', label: '🤔 Minimal prep only' },
      { value: 'none', label: '🙅 I prefer cooking fresh' },
    ],
    category: 'nutrition',
    priority: 6,
    icon: '📦',
  },

  {
    id: 'equipment_available',
    trigger: 'action_based',
    triggerCondition: 'user_views_workout_twice',
    question: 'What equipment do you have access to?',
    description: "We'll design workouts using what you have",
    options: [
      { value: 'none', label: '🤸 Just bodyweight' },
      { value: 'dumbbells', label: '🏋️ Dumbbells' },
      { value: 'barbell', label: '🏋️‍♂️ Barbell' },
      { value: 'resistance_bands', label: '🎗️ Resistance Bands' },
      { value: 'pull_up_bar', label: '🤸 Pull-up Bar' },
      { value: 'kettlebells', label: '⚫ Kettlebells' },
      { value: 'machines', label: '🏃 Gym Machines' },
      { value: 'full_gym', label: '🏋️ Full Gym' },
    ],
    multiSelect: true,
    category: 'fitness',
    priority: 7,
    icon: '🏋️',
  },

  {
    id: 'water_goal',
    trigger: 'time_based',
    triggerCondition: 'after_5_days',
    question: 'How many glasses of water do you aim to drink daily?',
    description: "We'll help you track your hydration",
    options: [
      { value: '4', label: '💧 4 glasses (1L)' },
      { value: '6', label: '💧 6 glasses (1.5L)' },
      { value: '8', label: '💧 8 glasses (2L) - Recommended' },
      { value: '10', label: '💧 10 glasses (2.5L)' },
      { value: '12', label: '💧 12+ glasses (3L+)' },
    ],
    category: 'lifestyle',
    priority: 6,
    icon: '💧',
  },
];

/**
 * Get surveys for a specific priority level
 */
export function getSurveysByPriority(priority: MicroSurveyPriority): MicroSurvey[] {
  return MICRO_SURVEYS.filter((s) => s.priority === priority);
}

/**
 * Get surveys by category
 */
export function getSurveysByCategory(category: MicroSurveyCategory): MicroSurvey[] {
  return MICRO_SURVEYS.filter((s) => s.category === category);
}

/**
 * Get high priority surveys (9-10)
 */
export function getHighPrioritySurveys(): MicroSurvey[] {
  return MICRO_SURVEYS.filter((s) => s.priority >= 9);
}
