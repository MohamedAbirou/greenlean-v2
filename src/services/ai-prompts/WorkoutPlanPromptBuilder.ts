/**
 * Workout Plan Prompt Builder - Tiered Personalization System
 * BASIC (minimal data) → STANDARD (mid-level) → PREMIUM (full profile)
 */

import type {
  WorkoutPlanPromptConfig,
  AIPromptResponse,
  UserProfileData,
  PersonalizationLevel,
} from './types';

export class WorkoutPlanPromptBuilder {
  /**
   * Build AI prompt for workout plan based on user data
   */
  static buildPrompt(config: WorkoutPlanPromptConfig): AIPromptResponse {
    const { userData, personalizationLevel } = config;

    const completeness = this.calculateCompleteness(userData);
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
   * BASIC PROMPT - Quick-start workout plan
   */
  private static buildBasicPrompt(data: UserProfileData): {
    prompt: string;
    usedDefaults: string[];
    missingFields: string[];
  } {
    const defaults = this.getDefaultsForGoal(data.mainGoal);
    const usedDefaults: string[] = [];

    if (!data.trainingEnvironment) usedDefaults.push('trainingEnvironment');
    if (!data.equipment) usedDefaults.push('equipment');
    if (!data.workoutFrequency) usedDefaults.push('workoutFrequency');

    const prompt = `You are a certified fitness trainer creating a beginner-friendly workout plan.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER INFO - QUICK START PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Goal:** ${data.mainGoal.replace('_', ' ')}
**Activity Level:** ${data.activityLevel || 'Beginner'}

**DEFAULT SETTINGS (we'll personalize as we learn more):**
- Training Environment: ${defaults.trainingEnvironment}
- Available Equipment: ${defaults.equipment.join(', ')}
- Workout Frequency: ${defaults.frequency} days/week
- Session Duration: ${defaults.duration} minutes

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a safe, effective workout plan that:

1. **Is Beginner-Friendly:**
   - Start with basic compound movements
   - Focus on form over weight
   - Include proper warm-up and cool-down
   - Progress gradually

2. **Requires Minimal Equipment:**
   - Primarily bodyweight exercises
   - Use ${defaults.equipment.join(' or ')}
   - Provide equipment-free alternatives

3. **Fits Busy Schedules:**
   - ${defaults.duration} minute sessions
   - ${defaults.frequency} days per week
   - Can be done ${defaults.trainingEnvironment}

4. **Is Sustainable:**
   - Not overwhelming for beginners
   - Build healthy habits
   - Leave room for progression

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

{
  "week_plan": [
    {
      "day": "Monday",
      "workout_type": "Full Body Strength",
      "duration_minutes": ${defaults.duration},
      "difficulty": "Beginner",
      "warm_up": {
        "duration": "5 min",
        "exercises": ["Light cardio", "Dynamic stretching"]
      },
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "instructions": ["Start in plank", "Lower chest to ground", "Push back up"],
          "form_tips": ["Keep core tight", "Elbows at 45°"],
          "modifications": {
            "easier": "Knee push-ups",
            "harder": "Decline push-ups"
          },
          "equipment": "None",
          "target_muscles": ["chest", "triceps", "shoulders"]
        }
      ],
      "cool_down": {
        "duration": "5 min",
        "exercises": ["Static stretching", "Deep breathing"]
      }
    }
  ],
  "weekly_summary": {
    "total_workouts": ${defaults.frequency},
    "total_time_minutes": ${defaults.duration * defaults.frequency},
    "workout_split": "Full body 3x/week",
    "rest_days": ["Tuesday", "Thursday", "Saturday", "Sunday"]
  },
  "progression_plan": {
    "week_1_2": "Focus on learning form",
    "week_3_4": "Increase reps by 2-3",
    "week_5_6": "Add an extra set",
    "week_7_8": "Consider adding light weights"
  },
  "beginner_tips": [
    "Rest is when muscles grow - don't skip rest days",
    "If exercise causes sharp pain, stop immediately",
    "Film yourself to check form"
  ]
}

Return ONLY valid JSON. No markdown, no explanations.`;

    return { prompt, usedDefaults, missingFields: [] };
  }

  /**
   * STANDARD PROMPT - Personalized workout plan
   */
  private static buildStandardPrompt(data: UserProfileData): {
    prompt: string;
    usedDefaults: string[];
    missingFields: string[];
  } {
    const usedDefaults: string[] = [];

    const prompt = `You are a certified personal trainer creating a personalized workout program.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER PROFILE - PERSONALIZED PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Goal:** ${data.mainGoal.replace('_', ' ')}
**Activity Level:** ${data.activityLevel || 'Moderate'}

**Training Details:**
- Environment: ${data.trainingEnvironment || 'Mixed'}
- Available Equipment: ${data.equipment?.join(', ') || 'Basic'}
- Workout Frequency: ${data.workoutFrequency || 3} days/week
- Injuries/Limitations: ${data.injuries?.join(', ') || 'None reported'}

**Physical Stats:**
- Age: ${data.age || 'Not specified'}
- Gender: ${data.gender || 'Not specified'}
- Current Weight: ${data.currentWeight} kg

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INSTRUCTIONS - PERSONALIZED APPROACH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a workout plan that:

1. **Matches Training Environment:**
   - Optimize for ${data.trainingEnvironment || 'available space'}
   - Use equipment: ${data.equipment?.join(', ') || 'bodyweight'}
   - Provide alternatives for missing equipment

2. **Respects Physical Limitations:**
   ${data.injuries?.map(injury => `- Modify exercises for ${injury}`).join('\n   ') || '- No known limitations'}
   - Include injury prevention strategies
   - Suggest physical therapy exercises if needed

3. **Optimizes for Goal:**
   ${data.mainGoal === 'lose_weight' ? '- Focus on compound movements, higher rep ranges' : ''}
   ${data.mainGoal === 'gain_muscle' ? '- Hypertrophy-focused with progressive overload' : ''}
   - Include cardio recommendation
   - Balance strength and conditioning

4. **Fits Lifestyle:**
   - ${data.workoutFrequency || 3} day split
   - Realistic time commitment
   - Sustainable long-term

[... Same JSON output format as BASIC with additional fields ...]

Include progressive overload scheme and exercise alternatives.`;

    return { prompt, usedDefaults, missingFields: [] };
  }

  /**
   * PREMIUM PROMPT - Expert-level personalization
   */
  private static buildPremiumPrompt(data: UserProfileData): {
    prompt: string;
    usedDefaults: string[];
    missingFields: string[];
  } {
    const usedDefaults: string[] = [];

    const prompt = `You are an expert strength & conditioning coach creating a FULLY personalized training program.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPLETE ATHLETE PROFILE - PREMIUM PERSONALIZATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Primary Goal:** ${data.mainGoal.replace('_', ' ')}

**Physical Profile:**
- Age: ${data.age} | Gender: ${data.gender}
- Weight: ${data.currentWeight} kg | Target: ${data.targetWeight} kg
- Height: ${data.height} cm
- Activity Level: ${data.activityLevel}

**Training Setup:**
- Environment: ${data.trainingEnvironment}
- Equipment: ${data.equipment?.join(', ')}
- Frequency: ${data.workoutFrequency} days/week

**Medical & Injury History:**
- Injuries/Limitations: ${data.injuries?.join(', ') || 'None'}
- Health Conditions: ${data.healthConditions?.join(', ') || 'None'}
- Medications: ${data.medications?.join(', ') || 'None'}

**Lifestyle Factors:**
- Sleep Quality: ${data.sleepQuality}/10
- Stress Level: ${data.stressLevel}/10
- Recovery Capacity: ${this.assessRecoveryCapacity(data)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ADVANCED PROGRAMMING INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create an EXCEPTIONAL training program with:

1. **Periodization Strategy:**
   - 4-week mesocycle with progressive overload
   - Deload week every 4th week
   - Undulating daily volume/intensity

2. **Injury-Specific Modifications:**
   ${data.injuries?.map(injury => this.getInjuryProtocol(injury)).join('\n   ') || '- No modifications needed'}

3. **Recovery Optimization:**
   - Adjust volume based on sleep quality (${data.sleepQuality}/10)
   - Stress management: ${data.stressLevel}/10 → ${this.getStressRecoveryAdvice(data.stressLevel || 5)}
   - Active recovery protocols

4. **Advanced Techniques:**
   - Tempo prescriptions (e.g., 3-0-1-0)
   - RPE-based autoregulation
   - Movement quality focus
   - Mobility/flexibility integration

5. **Performance Tracking:**
   - Progressive overload metrics
   - Volume landmarks (sets × reps × weight)
   - Recovery indicators

[... Enhanced JSON output with tempo, RPE, alternatives, video links ...]`;

    return { prompt, usedDefaults, missingFields: [] };
  }

  // Helper methods
  private static calculateCompleteness(data: UserProfileData): number {
    const fields = [
      'mainGoal',
      'activityLevel',
      'workoutFrequency',
      'trainingEnvironment',
      'equipment',
      'injuries',
      'age',
      'gender',
      'healthConditions',
      'sleepQuality',
      'stressLevel',
    ];

    const filledFields = fields.filter((field) => {
      const value = data[field as keyof UserProfileData];
      return value !== undefined && value !== null && value !== '';
    });

    return (filledFields.length / fields.length) * 100;
  }

  private static determineEffectiveLevel(
    requested: PersonalizationLevel,
    completeness: number
  ): PersonalizationLevel {
    if (completeness < 30) return 'BASIC';
    if (completeness < 70) return 'STANDARD';
    return 'PREMIUM';
  }

  private static getDefaultsForGoal(goal: string) {
    const defaults = {
      lose_weight: {
        trainingEnvironment: 'home or gym',
        equipment: ['dumbbells', 'resistance bands'],
        frequency: 3,
        duration: 30,
      },
      gain_muscle: {
        trainingEnvironment: 'gym',
        equipment: ['barbells', 'dumbbells', 'machines'],
        frequency: 4,
        duration: 60,
      },
      maintain: {
        trainingEnvironment: 'anywhere',
        equipment: ['bodyweight'],
        frequency: 3,
        duration: 30,
      },
      improve_health: {
        trainingEnvironment: 'anywhere',
        equipment: ['bodyweight', 'light dumbbells'],
        frequency: 3,
        duration: 30,
      },
    };

    return defaults[goal as keyof typeof defaults] || defaults.maintain;
  }

  private static assessRecoveryCapacity(data: UserProfileData): string {
    const sleep = data.sleepQuality || 5;
    const stress = data.stressLevel || 5;
    const age = data.age || 30;

    let score = sleep - stress + (age < 30 ? 2 : age > 50 ? -2 : 0);

    if (score > 7) return 'Excellent';
    if (score > 4) return 'Good';
    if (score > 2) return 'Moderate';
    return 'Limited';
  }

  private static getInjuryProtocol(injury: string): string {
    const protocols: Record<string, string> = {
      knee: 'Avoid deep squats, use leg press instead, focus on VMO strengthening',
      back: 'Neutral spine emphasis, avoid spinal flexion under load, include core stability',
      shoulder: 'Limit overhead pressing, focus on scapular stability, include rotator cuff work',
      ankle: 'Modify jumping movements, include balance training, use ankle mobilization',
    };

    const key = Object.keys(protocols).find(k => injury.toLowerCase().includes(k));
    return key ? protocols[key] : `Modify as needed for ${injury}`;
  }

  private static getStressRecoveryAdvice(stressLevel: number): string {
    if (stressLevel > 7) return 'Reduce training volume by 20%, prioritize sleep';
    if (stressLevel > 5) return 'Monitor recovery closely, add extra rest day if needed';
    return 'Standard recovery protocols sufficient';
  }
}
