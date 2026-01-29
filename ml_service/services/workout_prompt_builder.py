"""
Workout Plan Prompt Builder - Progressive Profiling Implementation

Builds AI prompts for workout plan generation based on user's profile completeness.

Tiers:
- BASIC (< 30% completeness): Minimal data, works for anyone, smart defaults
- PREMIUM (100% completeness): Full personalization with advanced features

Author: GreenLean AI Team
Date: 2025-12-04
"""

from typing import Literal, List, Dict, Any, Optional, TypedDict
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

PersonalizationLevel = Literal['BASIC', 'PREMIUM']


class AIPromptMetadata(TypedDict):
    """Metadata about the generated prompt"""
    personalization_level: PersonalizationLevel
    data_completeness: float
    fields_used: int
    missing_fields: List[str]
    used_defaults: List[str]


class AIPromptResponse(TypedDict):
    """Complete AI prompt response with metadata"""
    prompt: str
    metadata: AIPromptMetadata


@dataclass
class WorkoutUserProfileData:
    """
    User profile data for workout plan generation.

    Fields are organized by personalization tier:
    - BASIC: main_goal, current_weight, age, gender (3-4 fields)
    - PREMIUM: + health conditions, sleep, stress, flexibility, experience, preferences (25+ fields)
    """
    # ============================================
    # BASIC TIER (3-4 fields) - Works immediately
    # ============================================
    main_goal: str  # lose_weight, gain_muscle, improve_endurance, etc.
    current_weight: float  # kg
    target_weight: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    activity_level: Optional[str] = None  # sedentary, lightly_active, etc.
    exercise_frequency: Optional[str] = None  # "3-4 times/week"

    # Nutrition tracking (for workout-nutrition synergy)
    daily_calories: Optional[int] = None
    protein: Optional[float] = None
    carbs: Optional[float] = None
    fats: Optional[float] = None

    gym_access: Optional[bool] = None,
    equipment_available: Optional[List[str]] = None,
    workout_location_preference: Optional[str] = None,
    injuries_limitations: Optional[List[str]] = None,
    fitness_experience: Optional[str] = None,
    health_conditions: Optional[List[str]] = None,
    medications: Optional[List[str]] = None,
    sleep_quality: Optional[int] = None,
    stress_level: Optional[int] = None


class WorkoutPlanPromptBuilder:
    """
    Builds progressive workout plan prompts based on user profile completeness.

    Usage:
        user_data = WorkoutUserProfileData(main_goal="lose_weight", current_weight=80.0, age=30)
        response = WorkoutPlanPromptBuilder.build_prompt(user_data, requested_level='PREMIUM')

        # response.prompt → Full AI prompt
        # response.metadata → Completeness info, effective tier, missing fields
    """

    @classmethod
    def build_prompt(
        cls,
        user_data: WorkoutUserProfileData,
        requested_level: PersonalizationLevel = 'PREMIUM'
    ) -> AIPromptResponse:
        """
        Build appropriate workout plan prompt based on data availability.

        Args:
            user_data: User profile data
            requested_level: Desired personalization level

        Returns:
            AIPromptResponse with prompt and metadata
        """
        # Calculate profile completeness
        completeness = cls._calculate_completeness(user_data)

        # Determine effective level (requested level may not be achievable with available data)
        effective_level = cls._determine_effective_level(requested_level, completeness)

        logger.info(f"Building workout prompt: completeness={completeness:.1f}%, "
                   f"requested={requested_level}, effective={effective_level}")

        # Build appropriate prompt
        if effective_level == 'BASIC':
            prompt, used_defaults, missing = cls._build_basic_prompt(user_data)
        else:  # PREMIUM
            prompt, used_defaults, missing = cls._build_premium_prompt(user_data)

        return AIPromptResponse(
            prompt=prompt,
            metadata=AIPromptMetadata(
                personalization_level=effective_level,
                data_completeness=completeness,
                fields_used=21 - len(missing),  # Total tracked fields
                missing_fields=missing,
                used_defaults=used_defaults
            )
        )

    @classmethod
    def _build_basic_prompt(cls, data: WorkoutUserProfileData) -> tuple[str, List[str], List[str]]:
        """
        BASIC WORKOUT PLAN (3-4 data points)

        Characteristics:
        - Works IMMEDIATELY with minimal data
        - Generic but effective full-body plan
        - No equipment required (bodyweight focus)
        - Beginner-friendly exercises
        - 3 workout days per week
        - Simple, clear instructions

        Returns: (prompt, used_defaults, missing_fields)
        """
        used_defaults: List[str] = []
        missing_fields: List[str] = []

        # Get smart defaults based on goal
        defaults = cls._get_defaults_for_goal(data.main_goal)
        used_defaults.extend(defaults.keys())

        # Track missing fields
        if not data.age:
            missing_fields.append('age')
        if not data.gender:
            missing_fields.append('gender')
        if not data.activity_level:
            missing_fields.append('activity_level')

        prompt = f"""You are a certified fitness coach, exercise physiologist, and strength & conditioning specialist. Create a comprehensive, 7-day BEGINNER-FRIENDLY workout plan that works for ANYONE.

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        USER INFO (BASIC PROFILE)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        DEMOGRAPHICS & PHYSIQUE:
        - Age: {data.age or 'Not specified (assume 25-35)'} years | Gender: {data.gender or 'Not specified (plan for all genders)'}
        - Height: {data.height or 'Not specified'} cm | Current Weight: {data.current_weight} kg
        - Target Weight: {data.target_weight} kg

        TRAINING PROFILE:
        - Primary Goal: {data.main_goal.replace('_', ' ').title()}
        - Exercise Frequency: {data.exercise_frequency or defaults['exercise_frequency']}
        - Activity Level: {data.activity_level or 'Moderately active'}

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        SMART DEFAULTS (we don't know user's preferences yet)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        - Exercise Frequency: {data.exercise_frequency or defaults['exercise_frequency']}
        - Activity Level : {data.activity_level or 'Moderately active'}
        - Training Environment: Home or gym
        - Equipment: Minimal/None (use household items if needed)
        - Experience Level: Beginner
        - Workout Duration: {defaults['workout_duration']}

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        YOUR MISSION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Create a **SIMPLE, SAFE, EFFECTIVE** 7-day workout plan that:

        1. **Works for ANYONE** - either having a gym membership and equipment or at home
        2. **Gets Results** - Targets their goal: {data.main_goal.replace('_', ' ')}
        3. **Builds Confidence** - Focus on proper form over intensity
        4. **Prevents Injury** - Gentle progression, clear safety cues
        5. **Easy to Follow** - Clear instructions, beginner-friendly language

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        PLAN STRUCTURE
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        **WORKOUT DAYS:**
        - workout days based on this exercise frequency: {data.exercise_frequency or defaults['exercise_frequency']}
        - Training split based on the goal: {defaults['training_split']}
        - 25-35 minutes per session (including warm-up/cooldown)

        **REST DAYS:**
        - decide the optimal rest days based on the user profile and the training split
        - Suggest light walking or stretching

        **EXERCISES:**
        - Bodyweight and gym compound
        - Modifications for easier/harder variations
        - Clear form cues to prevent injury
        - Rep ranges: 8-12 reps, 2-3 sets

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        OUTPUT FORMAT (STRICT JSON)
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        LIMITATIONS:
        - Maximum of 5 workout days OR adjust based on Training Split: {defaults['training_split']}.
        - Minimum of 5 and Maxiumum of 6 (from 4 to 6 exercises) detailed and variant exercises per workout day targeting muscle groups depending on training environment and split per day.
        - Maximum 1 paragraph (max 180 characters) for instructions.

        Return ONLY valid JSON in this exact format:

        {{
          "weekly_plan": [
            {{
              "day": "Monday",
              "workout_type": "Upper Body Strength",
              "training_location": "Gym",
              "focus": "Chest, Back, Shoulders",
              "duration_minutes": 60,
              "intensity": "Moderate-High",
              "exercises": [
                {{
                  "name": "Barbell Bench Press",
                  "category": "compound",
                  "sets": 4,
                  "reps": "8-10",
                  "rest_seconds": 90,
                  "tempo": "2-0-2-0",
                  "instructions": "Clear, safe execution cues. Form > weight. Control eccentric.",
                  "muscle_groups": ["chest", "triceps", "shoulders"],
                  "difficulty": "intermediate",
                  "equipment_needed": ["barbell", "bench"],
                  "alternatives": {{
                    "home": "Push-ups with elevation",
                    "outdoor": "Decline push-ups on bench",
                    "easier": "Dumbbell press",
                    "harder": "Incline barbell press"
                  }},
                }}
              ],
              "warmup": {{
                "duration_minutes": 10,
                "activities": [
                  "5 min light cardio (treadmill/bike)",
                  "Arm circles: 10 each direction",
                  "Band pull-aparts: 2x15",
                  "Push-up plus: 2x10",
                  "Specific warm-up sets for first exercise"
                ]
              }},
              "cooldown": {{
                "duration_minutes": 10,
                "activities": [
                  "Child's pose: 60 seconds",
                  "Chest doorway stretch: 60s each side",
                  "Shoulder dislocations with band: 2x10",
                  "Deep breathing exercises: 3 minutes"
                ]
              }}
            }},
          ],
          "weekly_summary": {{
            "total_workout_days": "should match the total days generated",
            "strength_days": "should match the user information and the training split",
            "cardio_days": "should match the user information and the training split",
            "rest_days": "should match the user information and the training split",
            "total_time_minutes": "should match the time minutes of all exercises generated",
            "total_exercises": "should match the total exercises generated",
            "difficulty_level": "should be based on the weekly workout exercises",
            "estimated_weekly_calories_burned": "should be as accurate as possible based on the weekly workout exercises.",
            "training_split": "Upper/Lower/Full Body + Conditioning",
            "progression_strategy": "Linear progression with deload every 4th week"",
            "notes": "Perfect starting point! As you share more preferences (equipment, training location, experience level), we'll personalize this plan specifically for YOU. Focus on form over speed. Listen to your body. You've got this! 💪"
          }}
        }}

        All strings MUST be short and MUST NOT contain line breaks or unescaped quotes.

        **CRITICAL:** Return ONLY the JSON object. No markdown, no explanations, just pure JSON.
        """

        return prompt, used_defaults, missing_fields

    @classmethod
    def _build_premium_prompt(cls, data: WorkoutUserProfileData) -> tuple[str, List[str], List[str]]:
        """
        PREMIUM WORKOUT PLAN (25+ data points)

        THIS IS THE COMPETITIVE ADVANTAGE!

        Characteristics:
        - Full periodization planning
        - Exercise library by location
        - Progression tracking system
        - Injury prevention protocols
        - Nutrition timing recommendations
        - Lifestyle integration strategies
        - Recovery optimization
        - Motivational coaching

        Returns: (prompt, used_defaults, missing_fields)
        """
        used_defaults: List[str] = []
        missing_fields: List[str] = []

        # Get smart defaults based on goal
        defaults = cls._get_defaults_for_goal(data.main_goal)
        used_defaults.extend(defaults.keys())

        # Format all data
        environments = ', '.join(data.workout_location_preference) if data.workout_location_preference else 'Home/Gym'
        equipment = ', '.join(data.equipment_available) if data.equipment_available else 'Full gym access'
        health = ', '.join(data.health_conditions) if data.health_conditions else 'None reported'

        # Calculate macro percentages if available
        protein_pct = ''
        if data.daily_calories and data.protein:
            protein_pct = f" ({round((data.protein * 4 / data.daily_calories) * 100)}% of calories)"

        prompt = f"""You are an ELITE strength & conditioning coach creating a FULLY PERSONALIZED, science-based workout program.

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        COMPLETE USER PROFILE - PREMIUM PERSONALIZATION
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        **Personal Details:**
        - Goal: {data.main_goal.replace('_', ' ').title()}
        - Age: {data.age or 'Not specified'}
        - Gender: {data.gender or 'Not specified'}
        - Weight: {data.current_weight} kg
        - Target Weight: {data.target_weight} kg
        - Height: {data.height or 'Not specified'} cm

        **Training Profile:**
        - Exercise Frequency: {data.exercise_frequency or defaults['exercise_frequency']}
        - Training Environment: {environments}
        - Available Equipment: {equipment}
        - Experience Level: {data.fitness_experience or 'Intermediate'}
        - Activity Level: {data.activity_level or 'Moderately active'}

        **Health & Recovery:**
        - Health Conditions: {health}
        - Injuries/Limitations: {data.injuries_limitations or 'None'}
        - Sleep Quality: {data.sleep_quality or 'Not tracked'}
        - Stress Level (1-10): {data.stress_level or 'Not tracked'}

        **Nutrition Context:**
        - Daily Calories: {data.daily_calories or 'Not tracked'} kcal
        - Protein: {data.protein or 'Not tracked'}g{protein_pct}
        - Carbs: {data.carbs or 'Not tracked'}g
        - Fats: {data.fats or 'Not tracked'}g

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        ADVANCED INSTRUCTIONS - PREMIUM TIER
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        Create an EXCEPTIONAL, fully personalized workout plan with:

        1. **Advanced Programming:**
          - Periodization strategy (progressive overload)
          - Deload weeks every 4th week
          - Volume and intensity cycling
          - Movement-specific progressions

        2. **Health Optimization:**
          - Adapt for health conditions: {health}
          - Modify for injuries: {data.injuries_limitations or 'N/A'}
          - Recovery strategies for sleep quality: {data.sleep_quality or 'good'}
          - Stress management through training volume adjustment (stress level: {data.stress_level or 5}/10)

        3. **Nutrition-Workout Synergy:**
          - Post-workout nutrition window
          - Protein distribution: {data.protein}g/day{protein_pct}
          - Carb timing around workouts: {data.carbs}g/day

        4. **Progression System:**
          - Clear progression rules
          - When to increase weight/reps
          - Plateau breaking strategies
          - Performance tracking metrics

        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        OUTPUT FORMAT (STRICT JSON) - PREMIUM TIER WITH ALL FEATURES
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

        LIMITATIONS:
        - Maximum of 5 workout days OR adjust based on Training Split: {defaults['training_split']}.
        - Minimum of 5 and Maxiumum of 6 (from 4 to 6 exercises) detailed and variant exercises per workout day targeting muscle groups depending on training environment and split per day.
        - Maximum 1 paragraph (max 180 characters) for instructions.

        Return ONLY valid JSON with THIS complete structure:

        {{
          "weekly_plan": [
            {{
              "day": "Monday",
              "workout_type": "Upper Body Hypertrophy",
              "training_location": "Gym",
              "focus": "Chest, Back, Shoulders, Arms",
              "duration_minutes": 60,
              "intensity": "High",
              "exercises": [
                {{
                  "name": "Barbell Bench Press",
                  "category": "compound",
                  "sets": 4,
                  "reps": "8-10",
                  "rest_seconds": 90,
                  "tempo": "2-0-2-0",
                  "instructions": "Clear, safe execution cues. Form > weight. Control eccentric.",
                  "muscle_groups": ["chest", "triceps", "shoulders"],
                  "difficulty": "intermediate",
                  "equipment_needed": ["barbell", "bench"],
                  "alternatives": {{
                    "home": "Push-ups with resistance band",
                    "outdoor": "Decline push-ups on bench",
                    "easier": "Dumbbell press",
                    "harder": "Pause bench press (3s pause at bottom)",
                    "injury_modified": "Machine chest press (shoulder-friendly)"
                  }},
                  "progression": "Add 2.5kg when completing 4x10 with perfect form",
                  "safety_notes": "Keep wrists straight, avoid flaring elbows past 45 degrees, use spotter for heavy sets",
                  "why_this_exercise": "Compound movement for maximum chest development and strength. Targets goal: {data.main_goal.replace('_', ' ').title()}"
                }}
              ],
              "warmup": {{
                "duration_minutes": 10,
                "activities": [
                  "5 min light cardio (treadmill/bike)",
                  "Arm circles: 10 each direction",
                  "Band pull-aparts: 2x15",
                  "Push-up plus: 2x10",
                  "Specific warm-up sets for first exercise"
                ]
              }},
              "cooldown": {{
                "duration_minutes": 10,
                "activities": [
                  "Child's pose: 60 seconds",
                  "Chest doorway stretch: 60s each side",
                  "Shoulder dislocations with band: 2x10",
                  "Deep breathing exercises: 3 minutes"
                ]
              }},
              "estimated_calories_burned": 400,
              "rpe_target": "8-9 out of 10 (hard but sustainable)",
              "success_criteria": "Complete all sets with good form, feel muscle engagement, no joint pain",
              "if_low_energy": "Reduce working sets by 1, maintain intensity on compound lifts, consider stress level {data.stress_level}/10",
              "if_feeling_good": "Add 1 drop set on final exercise or extend rest-pause set"
            }}
          ],
          "weekly_summary": {{
            "total_workout_days": "should match the total days generated",
            "strength_days": "should match the user information and the training split",
            "cardio_days": "should match the user information and the training split",
            "rest_days": "should match the user information and the training split",
            "total_time_minutes": "should match the time minutes of all exercises generated",
            "total_exercises": "should match the total exercises generated",
            "difficulty_level": "should be based on the weekly workout exercises",
            "estimated_weekly_calories_burned": "should be as accurate as possible based on the weekly workout exercises.",
            "training_split": "Push/Pull/Legs/Upper/Conditioning",
            "progression_strategy": "Linear periodization with weekly progressive overload. Deload every 4th week (reduce volume by 40%, maintain intensity).",
            "notes": "This premium plan is scientifically optimized for YOUR unique profile. Every exercise serves your {data.main_goal.replace('_', ' ').title()} goal while respecting {health}, sleep quality ({data.sleep_quality}), and stress level ({data.stress_level}/10). Consistency beats perfection - aim for 80% adherence for best results!"
          }},
          "periodization_plan": {{
            "week_1_2": "Adaptation: Focus on form, establish baseline",
            "week_3_4": "Build: Increase load 5-10%, maintain volume",
            "week_5_6": "Peak: Max volume, push intensity",
            "week_7": "Deload: Reduce volume by 40%, maintain intensity",
            "week_8_plus": "Repeat cycle with higher baseline"
          }},
          "progression_tracking": {{
            "what_to_track": ["Weight lifted", "Reps completed", "RPE", "Energy levels"],
            "when_to_progress": "When you can complete top end of rep range for all sets",
            "how_much_to_add": "2.5-5kg for upper body, 5-10kg for lower body",
            "plateau_breakers": ["Deload week", "Change rep ranges", "Modify exercise selection"]
          }},
          "personalized_tips": [
            "🎯 Goal Alignment: Your split optimizes for {data.main_goal.replace('_', ' ').title()}. Expect visible results in 4-6 weeks with 80%+ adherence.",
            "💪 Protein Timing: With {data.protein}g protein{protein_pct}, aim for 25-30g per meal (4-5 meals). Post-workout within 2 hours is ideal.",
            "⏰ Workout Timing: Training 'flexible schedule'. Pre-workout meal 1-2 hours before. Avoid heavy meals <1 hour.",
            "💤 Recovery: Sleep quality rated {data.sleep_quality or 'good'}. Aim for 7-9 hours. Poor sleep = reduce volume 20%, prioritize compound lifts.",
            "😌 Stress Management: Stress level {data.stress_level or 5}/10. High stress days = lighter weights, focus on movement quality. Training is stress; manage total load.",
            "🏥 Health Considerations: {health}. Exercise selection modified accordingly. Stop if sharp pain. Consult doctor if unsure.",
            "🦵 Flexibility: Daily 10-min mobility routine crucial. Yoga 1x/week highly beneficial.",
            "🔥 Motivation: Track small wins. Focus on process, not perfection. Bad workout > no workout.",
            "⚠️ Injury Prevention: {data.injuries_limitations or 'No current injuries'}. Warm-up non-negotiable. Stop at sharp pain, not dull muscle fatigue.",
          ],
          "injury_prevention": {{
            "mobility_work": "Daily 10-min routine focusing on weak points",
            "red_flags": "Stop if sharp pain, dizziness, or unusual symptoms",
            "modification_guidelines": "How to adjust based on how you feel",
          }},
          "nutrition_timing": {{
            "pre_workout": "Eat 1-2 hours before, focus on carbs + moderate protein",
            "post_workout": "Within 2 hours, protein + carbs for recovery",
            "rest_days": "Maintain protein, slightly lower carbs",
            "hydration": "Drink 500ml 2 hours before, sip during workout"
          }},
          "lifestyle_integration": {{
            "busy_day_workouts": "Quick 20-30 min options",
            "travel_workouts": "Hotel room/minimal equipment routines",
            "social_considerations": "How to maintain consistency with social life",
            "work_schedule_tips": "Best times to train based on {data.activity_level or 'Moderately active'}"
          }}
        }}

        ⚠️ For each workout day in "weekly_plan":
        - Include a realistic split name (e.g., Push, Pull, Legs, Full Body, Conditioning)
        - Alternate muscle groups logically across the week, meaning:
          - if the split is full body, then we can do e.g. monday: whole chest workout and triceps, tuesday: whole back and biceps, wednesday: full leg workout, thursday: whole shoulders and forearms, friday or saturday (depends on the workout days split), we do arms day or cardio or stretch or rest.
          - if it is other training split, then you know what to do! What matters is to train every muscle group and never forget some muscle untrained, that's how a real workout plan should be!
        All strings MUST be short and MUST NOT contain line breaks or unescaped quotes.

        **CRITICAL:** Return ONLY the JSON object. No markdown, no explanations, just pure JSON. Ensure all strings are properly closed.
        """

        return prompt, used_defaults, missing_fields

    @classmethod
    def _calculate_completeness(cls, data: WorkoutUserProfileData) -> float:
        """Calculate profile data completeness (0-100%)"""
        # Nutrition tracking (for workout-nutrition synergy)
        daily_calories: Optional[int] = None
        protein: Optional[float] = None
        carbs: Optional[float] = None
        fats: Optional[float] = None

        fields = [
            'main_goal', 'current_weight', 'target_weight', 'age', 'gender', 'height',
            'activity_level', 'exercise_frequency', 'gym_access', 'equipment_available',
            'workout_location_preference', 'injuries_limitations', 'fitness_experience',
            'health_conditions', 'medications', 'sleep_quality', 'stress_level'
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
                'exercise_frequency': '4-5 times/week',
                'workout_duration': '35-45 minutes',
                'training_split': 'Full Body with cardio finishers',
            },
            'gain_muscle': {
                'exercise_frequency': '4-5 times/week',
                'workout_duration': '45-60 minutes',
                'training_split': 'Push/Pull/Legs',
            },
            'maintain': {
                'exercise_frequency': '3 times/week',
                'workout_duration': '30-40 minutes',
                'training_split': 'Full Body maintenance',
            },
            'improve_health': {
                'exercise_frequency': '3-4 times/week',
                'workout_duration': '30-45 minutes',
                'training_split': 'Full Body with mobility work',
            },
        }

        return defaults.get(goal, defaults['maintain'])
