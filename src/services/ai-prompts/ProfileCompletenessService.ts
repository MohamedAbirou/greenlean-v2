/**
 * Profile Completeness Service
 * Tracks user profile completion and determines personalization level
 */

import type { UserProfileData, PersonalizationLevel } from './types';

export interface CompletenessReport {
  completeness: number;
  personalizationLevel: PersonalizationLevel;
  totalFields: number;
  completedFields: number;
  missingFields: {
    category: 'basic' | 'nutrition' | 'fitness' | 'health' | 'lifestyle';
    field: string;
    label: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  nextSuggestedQuestions: string[];
}

export class ProfileCompletenessService {
  /**
   * Analyze user profile and return completeness report
   */
  static analyze(userData: UserProfileData): CompletenessReport {
    const fields = this.getProfileFields();

    const completedFields = fields.filter((field) => {
      const value = userData[field.key as keyof UserProfileData];
      return value !== undefined && value !== null && value !== '';
    });

    const missingFields = fields.filter((field) => {
      const value = userData[field.key as keyof UserProfileData];
      return value === undefined || value === null || value === '';
    });

    const completeness = (completedFields.length / fields.length) * 100;
    const personalizationLevel = this.determineLevel(completeness);

    // Get next suggested questions based on priority
    const nextSuggestions = missingFields
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 5)
      .map((f) => f.label);

    return {
      completeness: Math.round(completeness),
      personalizationLevel,
      totalFields: fields.length,
      completedFields: completedFields.length,
      missingFields,
      nextSuggestedQuestions: nextSuggestions,
    };
  }

  /**
   * Determine personalization level from completeness percentage
   */
  private static determineLevel(completeness: number): PersonalizationLevel {
    if (completeness < 30) return 'BASIC';
    if (completeness < 70) return 'STANDARD';
    return 'PREMIUM';
  }

  /**
   * Get all profile fields with metadata
   */
  private static getProfileFields() {
    return [
      // BASIC - Core Info (High Priority)
      { key: 'mainGoal', category: 'basic' as const, label: "What's your main goal?", priority: 'high' as const },
      { key: 'currentWeight', category: 'basic' as const, label: 'Current weight', priority: 'high' as const },
      { key: 'targetWeight', category: 'basic' as const, label: 'Target weight', priority: 'high' as const },
      { key: 'age', category: 'basic' as const, label: 'Your age', priority: 'high' as const },
      { key: 'gender', category: 'basic' as const, label: 'Your gender', priority: 'high' as const },
      { key: 'height', category: 'basic' as const, label: 'Your height', priority: 'high' as const },

      // STANDARD - Nutrition Preferences (High Priority)
      { key: 'dietaryStyle', category: 'nutrition' as const, label: 'Dietary style preference', priority: 'high' as const },
      { key: 'foodAllergies', category: 'nutrition' as const, label: 'Food allergies or intolerances', priority: 'high' as const },
      { key: 'cookingSkill', category: 'nutrition' as const, label: 'Cooking skill level', priority: 'medium' as const },
      { key: 'cookingTime', category: 'nutrition' as const, label: 'Time available for cooking', priority: 'medium' as const },
      { key: 'groceryBudget', category: 'nutrition' as const, label: 'Weekly grocery budget', priority: 'medium' as const },
      { key: 'mealsPerDay', category: 'nutrition' as const, label: 'Preferred meals per day', priority: 'medium' as const },

      // STANDARD - Fitness Preferences (High Priority)
      { key: 'activityLevel', category: 'fitness' as const, label: 'Activity level', priority: 'high' as const },
      { key: 'workoutFrequency', category: 'fitness' as const, label: 'Workout frequency (days/week)', priority: 'high' as const },
      { key: 'trainingEnvironment', category: 'fitness' as const, label: 'Where do you train?', priority: 'high' as const },
      { key: 'equipment', category: 'fitness' as const, label: 'Available equipment', priority: 'medium' as const },
      { key: 'injuries', category: 'fitness' as const, label: 'Injuries or limitations', priority: 'high' as const },

      // PREMIUM - Health & Lifestyle (Medium/Low Priority)
      { key: 'healthConditions', category: 'health' as const, label: 'Health conditions', priority: 'medium' as const },
      { key: 'medications', category: 'health' as const, label: 'Current medications', priority: 'medium' as const },
      { key: 'sleepQuality', category: 'lifestyle' as const, label: 'Sleep quality (1-10)', priority: 'medium' as const },
      { key: 'stressLevel', category: 'lifestyle' as const, label: 'Stress level (1-10)', priority: 'medium' as const },
      { key: 'country', category: 'lifestyle' as const, label: 'Country/region', priority: 'low' as const },
      { key: 'dislikedFoods', category: 'nutrition' as const, label: 'Foods you dislike', priority: 'low' as const },
      { key: 'mealPrepPreference', category: 'nutrition' as const, label: 'Meal prep preference', priority: 'low' as const },
      { key: 'waterIntakeGoal', category: 'lifestyle' as const, label: 'Water intake goal', priority: 'low' as const },
    ];
  }

  /**
   * Get next micro-survey to show user
   */
  static getNextMicroSurvey(userData: UserProfileData): {
    id: string;
    question: string;
    options: string[];
    category: string;
  } | null {
    const report = this.analyze(userData);

    // Find highest priority missing field
    const nextField = report.missingFields
      .filter(f => f.priority === 'high')
      .sort((a, b) => {
        // Prioritize nutrition and fitness over lifestyle
        const categoryOrder = { nutrition: 0, fitness: 1, health: 2, basic: 3, lifestyle: 4 };
        return categoryOrder[a.category] - categoryOrder[b.category];
      })[0];

    if (!nextField) return null;

    return this.createMicroSurvey(nextField);
  }

  /**
   * Create micro-survey from missing field
   */
  private static createMicroSurvey(field: CompletenessReport['missingFields'][0]) {
    const surveys: Record<string, any> = {
      dietaryStyle: {
        id: 'dietary_style',
        question: '🥗 What\'s your preferred dietary style?',
        options: ['Balanced', 'Keto', 'Vegetarian', 'Vegan', 'Paleo', 'Mediterranean', 'Other'],
        category: 'nutrition',
      },
      foodAllergies: {
        id: 'food_allergies',
        question: '⚠️ Any food allergies or intolerances?',
        options: ['None', 'Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Other'],
        category: 'nutrition',
      },
      cookingSkill: {
        id: 'cooking_skill',
        question: '👨‍🍳 How would you rate your cooking skills?',
        options: ['Beginner', 'Intermediate', 'Advanced'],
        category: 'nutrition',
      },
      cookingTime: {
        id: 'cooking_time',
        question: '⏰ How much time can you spend cooking per meal?',
        options: ['< 15 min', '15-30 min', '30-45 min', '45-60 min', '60+ min'],
        category: 'nutrition',
      },
      groceryBudget: {
        id: 'grocery_budget',
        question: '💰 What\'s your weekly grocery budget?',
        options: ['< $50', '$50-100', '$100-150', '$150+'],
        category: 'nutrition',
      },
      trainingEnvironment: {
        id: 'training_environment',
        question: '🏋️ Where do you prefer to train?',
        options: ['Gym', 'Home', 'Outdoor', 'Mixed'],
        category: 'fitness',
      },
      injuries: {
        id: 'injuries',
        question: '🤕 Any injuries or physical limitations?',
        options: ['None', 'Knee issues', 'Back pain', 'Shoulder problems', 'Other'],
        category: 'fitness',
      },
      healthConditions: {
        id: 'health_conditions',
        question: '🏥 Any health conditions we should know about?',
        options: ['None', 'Diabetes', 'High blood pressure', 'High cholesterol', 'IBS', 'PCOS', 'Thyroid', 'Other'],
        category: 'health',
      },
    };

    return surveys[field.field] || null;
  }
}
