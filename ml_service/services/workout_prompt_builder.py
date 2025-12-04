"""
Workout Plan Prompt Builder - Progressive Profiling Implementation

Builds AI prompts for workout plan generation based on user's profile completeness.

Tiers:
- BASIC (< 30% completeness): Minimal data, works for anyone, smart defaults
- STANDARD (30-70% completeness): User preferences, equipment, injuries
- PREMIUM (≥ 70% completeness): Full personalization with advanced features

Author: GreenLean AI Team
Date: 2025-12-04
"""

from typing import Literal, List, Dict, Any, Optional, TypedDict
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

PersonalizationLevel = Literal['BASIC', 'STANDARD', 'PREMIUM']


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
    - STANDARD: + activity_level, exercise_frequency, training_environment, equipment, injuries (10-15 fields)
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
    
    # ============================================
    # STANDARD TIER (10-15 fields) - Enhanced with preferences
    # ============================================
    training_environment: Optional[List[str]] = None  # ["gym", "home", "outdoor"]
    available_equipment: Optional[List[str]] = None  # ["dumbbells", "barbell", "resistance_bands"]
    injuries: Optional[str] = None  # Current injuries or limitations
    preferred_exercise: Optional[List[str]] = None  # ["strength", "cardio", "yoga"]
    workout_duration_preference: Optional[str] = None  # "30-45 minutes"

    # ============================================
    # PREMIUM TIER (25+ fields) - Full personalization
    # ============================================
    health_conditions: Optional[List[str]] = None  # ["hypertension", "diabetes"]
    sleep_quality: Optional[str] = None  # "good", "fair", "poor"
    stress_level: Optional[int] = None  # 1-10 scale
    flexibility_level: Optional[str] = None  # "poor", "average", "good"
    past_workout_experience: Optional[str] = None  # "beginner", "intermediate", "advanced"
    workout_time_preference: Optional[str] = None  # "morning", "afternoon", "evening"
    motivation_level: Optional[int] = None  # 1-10 scale
    challenges: Optional[str] = None  # "Staying consistent", "Finding time"
    country: Optional[str] = None  # For cultural considerations
    lifestyle: Optional[str] = None  # "Busy professional", "Stay-at-home parent"



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
        elif effective_level == 'STANDARD':
            prompt, used_defaults, missing = cls._build_standard_prompt(user_data)
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

        prompt = f"""You are a certified personal trainer creating a BEGINNER-FRIENDLY workout plan that works for ANYONE.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER INFO (BASIC PROFILE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Goal:** {data.main_goal.replace('_', ' ').title()}
**Weight:** {data.current_weight} kg
**Target Weight:** {data.target_weight} kg
**Age:** {data.age or 'Not specified (assume 25-35)'}
**Gender:** {data.gender or 'Not specified (plan for all genders)'}
**Height:** {data.height or 'Not specified'} cm

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
- 3 workout days (Mon/Wed/Fri pattern)
- Full-body focus each session
- 4-5 bodyweight exercises per workout
- 25-35 minutes per session (including warm-up/cooldown)

**REST DAYS:**
- 4 rest days (Tue/Thu/Sat/Sun)
- Suggest light walking or stretching

**EXERCISES:**
- Bodyweight only (squats, push-ups, planks, lunges, etc.)
- Modifications for easier/harder variations
- Clear form cues to prevent injury
- Rep ranges: 8-12 reps, 2-3 sets

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON in this exact format:

{{
  "weekly_plan": [
    {{
      "day": "Monday",
      "workout_type": "Full Body Strength",
      "training_location": "Home",
      "focus": "Total body conditioning",
      "duration_minutes": 30,
      "intensity": "Beginner-Moderate",
      "exercises": [
        {{
          "name": "Bodyweight Squats",
          "category": "compound",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60,
          "instructions": "Stand feet shoulder-width apart. Lower hips back and down as if sitting in a chair. Keep chest up and knees tracking over toes. Return to standing by pushing through heels.",
          "muscle_groups": ["quads", "glutes", "core"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Chair squats (sit-to-stand with chair support)",
            "harder": "Jump squats (explosive upward movement)"
          }}
        }},
        {{
          "name": "Push-ups",
          "category": "compound",
          "sets": 3,
          "reps": "8-10",
          "rest_seconds": 60,
          "instructions": "Start in plank position, hands shoulder-width apart. Lower chest toward floor while keeping core tight and back straight. Push back up to starting position. Keep elbows at 45-degree angle.",
          "muscle_groups": ["chest", "triceps", "shoulders", "core"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Wall push-ups or knee push-ups",
            "harder": "Diamond push-ups or decline push-ups"
          }}
        }},
        {{
          "name": "Plank Hold",
          "category": "core",
          "sets": 3,
          "reps": "30-45 seconds",
          "rest_seconds": 45,
          "instructions": "Start in forearm plank position. Keep body in straight line from head to heels. Engage core, don't let hips sag or rise. Breathe steadily.",
          "muscle_groups": ["core", "shoulders"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Plank on knees",
            "harder": "Plank with leg raises"
          }}
        }},
        {{
          "name": "Walking Lunges",
          "category": "compound",
          "sets": 3,
          "reps": "10 per leg",
          "rest_seconds": 60,
          "instructions": "Step forward with right leg, lowering left knee toward ground. Both knees at 90 degrees. Push through right heel to stand. Alternate legs.",
          "muscle_groups": ["quads", "glutes", "hamstrings"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Stationary lunges with support",
            "harder": "Jumping lunges"
          }}
        }}
      ],
      "warmup": {{
        "duration_minutes": 5,
        "activities": [
          "March in place: 2 minutes",
          "Arm circles: 10 each direction",
          "Leg swings: 10 each leg",
          "Hip circles: 10 each direction",
          "Light bodyweight squats: 10 reps"
        ]
      }},
      "cooldown": {{
        "duration_minutes": 5,
        "activities": [
          "Walking in place: 2 minutes",
          "Quad stretch: 30s each leg",
          "Hamstring stretch: 30s each leg",
          "Shoulder stretch: 30s each side",
          "Deep breathing: 1 minute"
        ]
      }}
    }},
    {{
      "day": "Tuesday",
      "workout_type": "Active Recovery",
      "training_location": "Anywhere",
      "focus": "Rest and recovery",
      "duration_minutes": 20,
      "intensity": "Very Light",
      "exercises": [],
      "warmup": null,
      "cooldown": null,
      "notes": "Light walking (15-20 min) or gentle stretching. Listen to your body. Recovery is when muscles grow!"
    }},
    {{
      "day": "Wednesday",
      "workout_type": "Full Body Strength",
      "training_location": "Home",
      "focus": "Total body conditioning",
      "duration_minutes": 30,
      "intensity": "Beginner-Moderate",
      "exercises": [
        {{
          "name": "Glute Bridges",
          "category": "compound",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "instructions": "Lie on back, knees bent, feet flat. Lift hips up by squeezing glutes. Hold at top for 1 second. Lower slowly. Keep core engaged.",
          "muscle_groups": ["glutes", "hamstrings", "lower_back"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Single-leg glute bridge (one leg at a time)",
            "harder": "Single-leg glute bridge or add weight on hips"
          }}
        }},
        {{
          "name": "Tricep Dips (using chair)",
          "category": "isolation",
          "sets": 3,
          "reps": "8-10",
          "rest_seconds": 60,
          "instructions": "Sit on edge of sturdy chair. Place hands beside hips. Slide hips off chair. Lower body by bending elbows to 90 degrees. Push back up. Keep shoulders down.",
          "muscle_groups": ["triceps", "shoulders"],
          "difficulty": "beginner",
          "equipment_needed": ["chair"],
          "alternatives": {{
            "easier": "Bent-knee tricep dips",
            "harder": "Straight-leg tricep dips or elevated feet"
          }}
        }},
        {{
          "name": "Mountain Climbers",
          "category": "cardio",
          "sets": 3,
          "reps": "20 total (10 per leg)",
          "rest_seconds": 60,
          "instructions": "Start in plank position. Bring right knee toward chest, then quickly switch legs. Alternate in running motion. Keep core tight, hips level.",
          "muscle_groups": ["core", "shoulders", "legs"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Slow mountain climbers or standing knee drives",
            "harder": "Fast mountain climbers or mountain climber with twist"
          }}
        }},
        {{
          "name": "Bird Dogs",
          "category": "core",
          "sets": 3,
          "reps": "10 per side",
          "rest_seconds": 45,
          "instructions": "Start on hands and knees. Extend right arm forward and left leg back. Hold 2 seconds. Return to start. Switch sides. Keep back flat, don't rotate hips.",
          "muscle_groups": ["core", "lower_back", "glutes"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Arm or leg only (not both at once)",
            "harder": "Add holds at extension for 5 seconds"
          }}
        }}
      ],
      "warmup": {{
        "duration_minutes": 5,
        "activities": [
          "March in place: 2 minutes",
          "Arm circles: 10 each direction",
          "Cat-cow stretches: 10 reps",
          "Hip circles: 10 each direction"
        ]
      }},
      "cooldown": {{
        "duration_minutes": 5,
        "activities": [
          "Child's pose: 1 minute",
          "Figure-4 stretch: 30s each side",
          "Spinal twist: 30s each side",
          "Deep breathing: 1 minute"
        ]
      }}
    }},
    {{
      "day": "Thursday",
      "workout_type": "Active Recovery",
      "training_location": "Anywhere",
      "focus": "Rest and recovery",
      "duration_minutes": 20,
      "intensity": "Very Light",
      "exercises": [],
      "warmup": null,
      "cooldown": null,
      "notes": "Gentle yoga or stretching. Optional: 15-20 min walk. Focus on mobility and recovery."
    }},
    {{
      "day": "Friday",
      "workout_type": "Full Body Strength + Cardio",
      "training_location": "Home",
      "focus": "Total body conditioning with cardio burst",
      "duration_minutes": 35,
      "intensity": "Beginner-Moderate",
      "exercises": [
        {{
          "name": "Bodyweight Squats",
          "category": "compound",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "instructions": "Stand feet shoulder-width apart. Lower hips back and down. Keep chest up. Return to standing.",
          "muscle_groups": ["quads", "glutes", "core"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Wall squats (back against wall)",
            "harder": "Jump squats"
          }}
        }},
        {{
          "name": "Push-ups",
          "category": "compound",
          "sets": 3,
          "reps": "8-12",
          "rest_seconds": 60,
          "instructions": "Plank position, lower chest to floor, push back up. Keep core tight.",
          "muscle_groups": ["chest", "triceps", "shoulders"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Knee push-ups",
            "harder": "Decline push-ups"
          }}
        }},
        {{
          "name": "Burpees (modified)",
          "category": "cardio",
          "sets": 3,
          "reps": "6-8",
          "rest_seconds": 90,
          "instructions": "Stand, drop to squat, place hands down, step feet back to plank, step feet forward, stand up. No jump required for beginners.",
          "muscle_groups": ["full_body"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Step-out burpees (no plank)",
            "harder": "Full burpees with jump"
          }}
        }},
        {{
          "name": "Reverse Lunges",
          "category": "compound",
          "sets": 3,
          "reps": "10 per leg",
          "rest_seconds": 60,
          "instructions": "Step backward with right leg, lower knee toward ground. Push through left heel to return. Alternate legs.",
          "muscle_groups": ["quads", "glutes", "hamstrings"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Assisted lunges with chair support",
            "harder": "Jumping lunges"
          }}
        }},
        {{
          "name": "Plank to Down Dog",
          "category": "core",
          "sets": 3,
          "reps": "8-10 transitions",
          "rest_seconds": 60,
          "instructions": "Start in plank. Push hips up into down dog (inverted V). Hold 2 seconds. Return to plank. Keep core engaged throughout.",
          "muscle_groups": ["core", "shoulders", "hamstrings"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Hold plank or down dog separately",
            "harder": "Add push-up in plank position"
          }}
        }}
      ],
      "warmup": {{
        "duration_minutes": 5,
        "activities": [
          "Jumping jacks: 30 seconds",
          "High knees: 30 seconds",
          "Butt kicks: 30 seconds",
          "Arm circles: 10 each direction",
          "Leg swings: 10 each leg"
        ]
      }},
      "cooldown": {{
        "duration_minutes": 5,
        "activities": [
          "Walk in place: 2 minutes",
          "Full body stretch: quad, hamstring, chest, shoulders",
          "Deep breathing: 2 minutes"
        ]
      }}
    }},
    {{
      "day": "Saturday",
      "workout_type": "Rest Day",
      "training_location": "Anywhere",
      "focus": "Complete rest",
      "duration_minutes": 0,
      "intensity": "None",
      "exercises": [],
      "warmup": null,
      "cooldown": null,
      "notes": "Complete rest day. Your muscles grow during rest! Stay hydrated, eat well, sleep 7-9 hours."
    }},
    {{
      "day": "Sunday",
      "workout_type": "Active Recovery / Optional Light Activity",
      "training_location": "Anywhere",
      "focus": "Light movement and recovery",
      "duration_minutes": 30,
      "intensity": "Very Light",
      "exercises": [],
      "warmup": null,
      "cooldown": null,
      "notes": "Optional: Light walk, gentle yoga, or stretching. Prepare mentally for the week ahead. Review your progress!"
    }}
  ],
  "weekly_summary": {{
    "total_workout_days": 3,
    "strength_days": 3,
    "cardio_days": 0,
    "rest_days": 4,
    "total_time_minutes": 95,
    "difficulty_level": "beginner",
    "training_split": "Full Body 3x/week",
    "progression_strategy": "Add 1-2 reps per week or reduce rest time by 5-10 seconds",
    "notes": "Perfect starting point! As you share more preferences (equipment, training location, experience level), we'll personalize this plan specifically for YOU. Focus on form over speed. Listen to your body. You've got this! 💪"
  }}
}}

**CRITICAL:** Return ONLY the JSON object. No markdown, no explanations, just pure JSON.
"""

        return prompt, used_defaults, missing_fields

    @classmethod
    def _build_standard_prompt(cls, data: WorkoutUserProfileData) -> tuple[str, List[str], List[str]]:
        """
        STANDARD WORKOUT PLAN (10-15 data points)

        Characteristics:
        - Uses user's training preferences
        - Adapts to equipment availability
        - Respects injury limitations
        - Adjusts to exercise frequency
        - Matches training environment

        Returns: (prompt, used_defaults, missing_fields)
        """
        used_defaults: List[str] = []
        missing_fields: List[str] = []

        defaults = cls._get_defaults_for_goal(data.main_goal)

        # Format training environment
        environments = ', '.join(data.training_environment) if data.training_environment else 'Home'
        equipment = ', '.join(data.available_equipment) if data.available_equipment else 'Minimal equipment'
        preferred = ', '.join(data.preferred_exercise) if data.preferred_exercise else 'Mix of strength and cardio'

        # Track missing premium fields
        if not data.sleep_quality:
            missing_fields.append('sleep_quality')
        if not data.stress_level:
            missing_fields.append('stress_level')
        if not data.health_conditions:
            missing_fields.append('health_conditions')

        prompt = f"""You are a professional personal trainer creating a CUSTOMIZED workout plan based on user preferences.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER PROFILE (STANDARD PERSONALIZATION)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Personal Details:**
- Goal: {data.main_goal.replace('_', ' ').title()}
- Age: {data.age or 'Not specified'}
- Gender: {data.gender or 'Not specified'}
- Weight: {data.current_weight} kg
- Target Weight: {data.target_weight} kg
- Height: {data.height or 'Not specified'} cm

**Training Preferences:**
- Exercise Frequency: {data.exercise_frequency or defaults['exercise_frequency']}
- Training Environment: {environments}
- Available Equipment: {equipment}
- Preferred Exercise Types: {preferred}
- Workout Duration: {data.workout_duration_preference or '30-45 minutes'}
- Activity Level: {data.activity_level or 'Moderately active'}

**Limitations:**
- Injuries: {data.injuries or 'None reported'}
- Experience Level: {data.past_workout_experience or 'Intermediate'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR MISSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Create a PERSONALIZED 7-day workout plan that:

1. **Respects Equipment:** Use only {equipment}
2. **Matches Environment:** Designed for {environments}
3. **Follows Preferences:** Focus on {preferred}
4. **Respects Injuries:** Modify exercises to avoid aggravating: {data.injuries or 'N/A'}
5. **Fits Schedule:** {data.exercise_frequency or defaults['exercise_frequency']}, {data.workout_duration_preference or '30-45 min'} each
6. **Achieves Goal:** Optimize for {data.main_goal.replace('_', ' ')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PLAN STRUCTURE GUIDELINES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Workout Split:** Choose appropriate split based on frequency:
- 3 days/week → Full Body each session
- 4 days/week → Upper/Lower split
- 5+ days/week → Push/Pull/Legs or similar

**Exercise Selection:**
- Use ONLY available equipment: {equipment}
- Match training environment: {environments}
- Provide alternatives for different locations
- Include modifications for injury: {data.injuries or 'N/A'}

**Intensity & Volume:**
- Experience level: {data.past_workout_experience or 'Intermediate'}
- Rep ranges appropriate for goal: {data.main_goal}
- Progressive overload strategy
- 5-8 exercises per workout day

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Return ONLY valid JSON (same structure as BASIC tier, but with more personalized exercise selection and split based on user preferences).

{{
  "weekly_plan": [
    {{
      "day": "Monday",
      "workout_type": "Upper Body Strength",
      "training_location": "{environments.split(',')[0] if ',' in environments else environments}",
      "focus": "Chest, Back, Shoulders, Arms",
      "duration_minutes": {data.workout_duration_preference.split('-')[0] if data.workout_duration_preference and '-' in data.workout_duration_preference else 40},
      "intensity": "Moderate-High",
      "exercises": [
        // 5-8 exercises using available equipment
        // Include proper warm-up and cooldown
        // Respect injury limitations
      ]
    }}

    {{
      "day": "Monday",
      "workout_type": "Upper Body Strength",
      "training_location": "{environments.split(',')[0] if ',' in environments else environments}",
      "focus": "Chest, Back, Shoulders, Arms",
      "duration_minutes": {data.workout_duration_preference.split('-')[0] if data.workout_duration_preference and '-' in data.workout_duration_preference else 40},
      "intensity": "Moderate-High",
      "exercises": [
        // 5-8 exercises using available equipment
        // Include proper warm-up and cooldown
        // Respect injury limitations
        {{
          "name": "Glute Bridges",
          "category": "compound",
          "sets": 3,
          "reps": "12-15",
          "rest_seconds": 60,
          "instructions": "Lie on back, knees bent, feet flat. Lift hips up by squeezing glutes. Hold at top for 1 second. Lower slowly. Keep core engaged.",
          "muscle_groups": ["glutes", "hamstrings", "lower_back"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Single-leg glute bridge (one leg at a time)",
            "harder": "Single-leg glute bridge or add weight on hips"
          }}
        }},
        {{
          "name": "Tricep Dips (using chair)",
          "category": "isolation",
          "sets": 3,
          "reps": "8-10",
          "rest_seconds": 60,
          "instructions": "Sit on edge of sturdy chair. Place hands beside hips. Slide hips off chair. Lower body by bending elbows to 90 degrees. Push back up. Keep shoulders down.",
          "muscle_groups": ["triceps", "shoulders"],
          "difficulty": "beginner",
          "equipment_needed": ["chair"],
          "alternatives": {{
            "easier": "Bent-knee tricep dips",
            "harder": "Straight-leg tricep dips or elevated feet"
          }}
        }},
        {{
          "name": "Mountain Climbers",
          "category": "cardio",
          "sets": 3,
          "reps": "20 total (10 per leg)",
          "rest_seconds": 60,
          "instructions": "Start in plank position. Bring right knee toward chest, then quickly switch legs. Alternate in running motion. Keep core tight, hips level.",
          "muscle_groups": ["core", "shoulders", "legs"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Slow mountain climbers or standing knee drives",
            "harder": "Fast mountain climbers or mountain climber with twist"
          }}
        }},
        {{
          "name": "Bird Dogs",
          "category": "core",
          "sets": 3,
          "reps": "10 per side",
          "rest_seconds": 45,
          "instructions": "Start on hands and knees. Extend right arm forward and left leg back. Hold 2 seconds. Return to start. Switch sides. Keep back flat, don't rotate hips.",
          "muscle_groups": ["core", "lower_back", "glutes"],
          "difficulty": "beginner",
          "equipment_needed": ["none"],
          "alternatives": {{
            "easier": "Arm or leg only (not both at once)",
            "harder": "Add holds at extension for 5 seconds"
          }}
        }}
      ],
      "warmup": {{
        "duration_minutes": 5,
        "activities": [
          "March in place: 2 minutes",
          "Arm circles: 10 each direction",
          "Cat-cow stretches: 10 reps",
          "Hip circles: 10 each direction"
        ]
      }},
      "cooldown": {{
        "duration_minutes": 5,
        "activities": [
          "Child's pose: 1 minute",
          "Figure-4 stretch: 30s each side",
          "Spinal twist: 30s each side",
          "Deep breathing: 1 minute"
        ]
      }}
    }}
  ],
  "weekly_summary": {{
    "total_workout_days": 4,
    "strength_days": 3,
    "cardio_days": 1,
    "rest_days": 3,
    "total_time_minutes": 180,
    "difficulty_level": "intermediate",
    "training_split": "Upper/Lower Split",
    "progression_strategy": "Increase weight by 2.5-5% when completing all sets with good form",
    "notes": "Plan customized to your equipment and preferences. Track your progress! We'll continue to refine as you share more about your health, sleep, and stress levels."
  }}
}}

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

        # Format all data
        environments = ', '.join(data.training_environment) if data.training_environment else 'Home/Gym'
        equipment = ', '.join(data.available_equipment) if data.available_equipment else 'Full gym access'
        preferred = ', '.join(data.preferred_exercise) if data.preferred_exercise else 'Mix of strength and cardio'
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
- Preferred Exercise Types: {preferred}
- Workout Duration: {data.workout_duration_preference or '45-60 minutes'}
- Experience Level: {data.past_workout_experience or 'Intermediate'}
- Activity Level: {data.activity_level or 'Moderately active'}

**Health & Recovery:**
- Health Conditions: {health}
- Injuries/Limitations: {data.injuries or 'None'}
- Sleep Quality: {data.sleep_quality or 'Not tracked'}
- Stress Level (1-10): {data.stress_level or 'Not tracked'}
- Flexibility Level: {data.flexibility_level or 'Average'}

**Lifestyle & Motivation:**
- Workout Time Preference: {data.workout_time_preference or 'Flexible'}
- Motivation Level (1-10): {data.motivation_level or 7}
- Main Challenges: {data.challenges or 'Staying consistent'}
- Occupation: {data.occupation or 'Not specified'}
- Lifestyle: {data.lifestyle or 'Busy professional'}
- Country: {data.country or 'International'}

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
   - Modify for injuries: {data.injuries or 'N/A'}
   - Recovery strategies for sleep quality: {data.sleep_quality or 'good'}
   - Stress management through training volume adjustment (stress level: {data.stress_level or 5}/10)

3. **Lifestyle Integration:**
   - Optimal workout timing: {data.workout_time_preference or 'morning/evening'}
   - Busy day alternatives ({data.workout_duration_preference or '30 min'} quick workouts)
   - Travel-friendly bodyweight options
   - Work-life balance considerations: {data.lifestyle}

4. **Injury Prevention:**
   - Mobility work for flexibility level: {data.flexibility_level or 'average'}
   - Prehab exercises
   - Form cues and safety protocols
   - Red flags to watch for

5. **Nutrition-Workout Synergy:**
   - Pre-workout meal timing (based on {data.workout_time_preference or 'flexible'} schedule)
   - Post-workout nutrition window
   - Protein distribution: {data.protein}g/day{protein_pct}
   - Carb timing around workouts: {data.carbs}g/day

6. **Progression System:**
   - Clear progression rules
   - When to increase weight/reps
   - Plateau breaking strategies
   - Performance tracking metrics

7. **Motivational Coaching:**
   - Address motivation level: {data.motivation_level or 7}/10
   - Overcome challenges: {data.challenges or 'staying consistent'}
   - Build sustainable habits
   - Mental toughness strategies

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (STRICT JSON) - PREMIUM TIER WITH ALL FEATURES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
          "rest_seconds": 120,
          "tempo": "2-0-2-1 (2s down, 0s pause, 2s up, 1s squeeze)",
          "instructions": "Lie on bench, feet flat. Unrack bar over chest. Lower with control to mid-chest. Press explosively while keeping shoulder blades retracted. Full ROM.",
          "muscle_groups": ["chest", "triceps", "front_delts"],
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
          "why_this_exercise": "Compound movement for maximum chest development and strength. Targets goal: {data.main_goal}"
        }}
        // ... 6-8 total exercises with same detail level
      ],
      "warmup": {{
        "duration_minutes": 10,
        "activities": [
          "5 min light cardio (treadmill/bike) - get blood flowing",
          "Arm circles: 10 forward, 10 backward",
          "Band pull-aparts: 2x15 - activate rear delts",
          "Scapular push-ups: 2x10 - prepare shoulder stability",
          "Empty bar bench press: 2x10 - movement-specific warm-up",
          "50% working weight: 1x8, 75% working weight: 1x5"
        ]
      }},
      "cooldown": {{
        "duration_minutes": 10,
        "activities": [
          "Light walk: 3 minutes - bring heart rate down",
          "Chest doorway stretch: 60s each side",
          "Shoulder dislocations with band: 2x10",
          "Lat stretch: 60s each side",
          "Tricep stretch: 30s each arm",
          "Deep breathing exercises: 3 minutes - activate parasympathetic"
        ]
      }},
      "estimated_calories_burned": 400,
      "rpe_target": "8-9 out of 10 (hard but sustainable)",
      "success_criteria": "Complete all sets with good form, feel muscle engagement, no joint pain",
      "if_low_energy": "Reduce working sets by 1, maintain intensity on compound lifts, consider stress level {data.stress_level}/10",
      "if_feeling_good": "Add 1 drop set on final exercise or extend rest-pause set"
    }}
    // ... remaining 6 days with same level of detail
  ],
  "weekly_summary": {{
    "total_workout_days": 5,
    "strength_days": 4,
    "cardio_days": 1,
    "rest_days": 2,
    "total_time_minutes": 300,
    "difficulty_level": "{data.past_workout_experience or 'intermediate'}",
    "estimated_weekly_calories_burned": 2400,
    "training_split": "Push/Pull/Legs/Upper/Conditioning",
    "progression_strategy": "Linear periodization with weekly progressive overload. Deload every 4th week (reduce volume by 40%, maintain intensity).",
    "notes": "This premium plan is scientifically optimized for YOUR unique profile. Every exercise serves your {data.main_goal.replace('_', ' ')} goal while respecting {health}, sleep quality ({data.sleep_quality}), and stress level ({data.stress_level}/10). Consistency beats perfection - aim for 80% adherence for best results!"
  }},
  "periodization_plan": {{
    "week_1_2": "Adaptation Phase: Focus on perfect form, establish baseline strength. RPE 7-8.",
    "week_3_4": "Building Phase: Increase load 5-10%, maintain volume. RPE 8-9.",
    "week_5_6": "Intensification Phase: Peak volume and intensity. Push limits. RPE 9.",
    "week_7": "Deload Week: Reduce volume by 40%, maintain intensity. Active recovery. RPE 6-7.",
    "week_8_plus": "Repeat cycle with 5-10% higher baseline loads. Reassess and adjust based on progress."
  }},
  "exercise_library_by_location": {{
    "gym_exercises": [
      "Primary compounds: Squat, Deadlift, Bench Press, Overhead Press, Barbell Row",
      "Accessory: Cable flyes, Lat pulldowns, Leg press, Leg curl, Cable rope tricep extensions",
      "Machines: Leg extension, Hamstring curl, Chest press, Shoulder press"
    ],
    "home_exercises": [
      "Bodyweight: Push-ups (all variations), Pull-ups, Dips, Pistol squats, Nordic curls",
      "With dumbbells: Goblet squats, RDLs, Rows, Presses, Lunges",
      "With bands: Face pulls, Band rows, Band squats, Band presses"
    ],
    "outdoor_exercises": [
      "Park equipment: Pull-ups, Dips, Decline push-ups, Step-ups",
      "Running/Sprints: Hill sprints, Interval training, Tempo runs",
      "Bodyweight circuits: Burpees, Jump squats, Mountain climbers"
    ]
  }},
  "progression_tracking": {{
    "what_to_track": [
      "Weight lifted per exercise",
      "Reps completed (aim for top of rep range)",
      "RPE (Rate of Perceived Exertion) per set",
      "Energy levels before/after workout",
      "Sleep quality night before",
      "Any pain or discomfort",
      "Bodyweight weekly",
      "Progress photos monthly"
    ],
    "when_to_progress": "When you can complete ALL sets at the TOP END of the rep range with RPE 8 or below and perfect form",
    "how_much_to_add": "Upper body: +2.5kg, Lower body: +5kg. If no fractional plates, add 1 rep per set instead",
    "plateau_breakers": [
      "Deload week (reduce volume 40%, maintain intensity)",
      "Change rep ranges (strength: 4-6, hypertrophy: 8-12, endurance: 15-20)",
      "Modify exercise selection (swap similar movements)",
      "Increase training frequency for lagging body parts",
      "Address recovery: sleep, stress, nutrition"
    ],
    "regression_protocol": "If strength decreases >10%, check: sleep ({data.sleep_quality}), stress ({data.stress_level}/10), nutrition ({data.daily_calories} cal), recovery. May need deload or address underlying issue."
  }},
  "personalized_tips": [
    "🎯 Goal Alignment: Your split optimizes for {data.main_goal.replace('_', ' ')}. Expect visible results in 4-6 weeks with 80%+ adherence.",
    "💪 Protein Timing: With {data.protein}g protein{protein_pct}, aim for 25-30g per meal (4-5 meals). Post-workout within 2 hours is ideal.",
    "⏰ Workout Timing: Training {data.workout_time_preference or 'flexible schedule'}. Pre-workout meal 1-2 hours before. Avoid heavy meals <1 hour.",
    "💤 Recovery: Sleep quality rated {data.sleep_quality or 'good'}. Aim for 7-9 hours. Poor sleep = reduce volume 20%, prioritize compound lifts.",
    "😌 Stress Management: Stress level {data.stress_level or 5}/10. High stress days = lighter weights, focus on movement quality. Training is stress; manage total load.",
    "🏥 Health Considerations: {health}. Exercise selection modified accordingly. Stop if sharp pain. Consult doctor if unsure.",
    "🦵 Flexibility: Level is {data.flexibility_level or 'average'}. Daily 10-min mobility routine crucial. Yoga 1x/week highly beneficial.",
    "🔥 Motivation: At {data.motivation_level or 7}/10. Track small wins. Focus on process, not perfection. Bad workout > no workout.",
    "⚠️ Injury Prevention: {data.injuries or 'No current injuries'}. Warm-up non-negotiable. Stop at sharp pain, not dull muscle fatigue.",
    "📍 Location: {data.country or 'International'} - plan includes {environments} options for maximum flexibility.",
    "💼 Lifestyle: {data.lifestyle}. Includes 20-30 min 'busy day' workouts. Consistency over perfection for sustainable results."
  ],
  "injury_prevention": {{
    "daily_mobility_routine": "10-min morning routine: Cat-cow (10), hip circles (10 each), leg swings (10 each), arm circles (10 each), shoulder dislocations with band (10), ankle rolls (10 each). Focus on areas related to {data.injuries or 'full body'}.",
    "red_flags": [
      "STOP if: Sharp pain, dizziness, chest pain, unusual shortness of breath",
      "Modify if: Dull ache in joints, excessive soreness >3 days, fatigue despite rest",
      "Consult doctor if: Pain worsens, swelling, loss of range of motion, numbness/tingling"
    ],
    "modification_guidelines": [
      "Pain level 1-3/10: Reduce weight 20%, focus on form, increase rest",
      "Pain level 4-6/10: Switch to alternative exercise, reduce ROM, consider rest day",
      "Pain level 7+/10: Stop immediately, ice if acute, consult professional",
      "Low energy: Reduce volume 25%, maintain intensity on key lifts",
      "High stress ({data.stress_level}/10): Prioritize sleep, reduce volume, add yoga/walk"
    ],
    "pre_existing_considerations": "Health conditions: {health}. Injuries: {data.injuries or 'None'}. Exercise modifications included in alternatives. Always prioritize pain-free movement. Consult healthcare provider for specific concerns.",
    "flexibility_work": "Current level: {data.flexibility_level or 'average'}. Daily stretching post-workout (10 min). Weekly yoga or mobility class highly recommended. Focus on: hip flexors, hamstrings, thoracic spine, shoulders."
  }},
  "nutrition_timing": {{
    "pre_workout": "1-2 hours before: Carbs ({data.carbs}g daily) + Moderate protein. Example: Oatmeal with banana and protein shake. Avoid high fat/fiber <1 hour before.",
    "during_workout": "Water: Sip throughout. Workouts >90 min: Consider intra-workout carbs (sports drink). Electrolytes if sweating heavily.",
    "post_workout": "Within 2 hours (anabolic window): 25-30g protein + carbs to replenish glycogen. Example: Protein shake + fruit or chicken with rice. Critical for recovery and growth.",
    "rest_days": "Maintain protein: {data.protein}g/day. Slightly lower carbs (80% of training days). Increase healthy fats. Stay hydrated. Focus on whole foods.",
    "hydration": "Baseline: 500ml 2 hours pre-workout. During: Sip throughout. Post: 150% of sweat loss. Daily: 2-3L total. More if heavy sweating or high stress.",
    "supplements_optional": "Protein powder (if struggling to hit {data.protein}g), Creatine (5g daily, well-researched), Caffeine (pre-workout, if tolerated), Vitamin D (if deficient). Food first approach."
  }},
  "lifestyle_integration": {{
    "busy_day_workouts": [
      "20-Min Full Body HIIT: Burpees, mountain climbers, squats, push-ups - 40s work, 20s rest, 5 rounds",
      "30-Min Strength Express: 5 compound lifts, 3 sets each, minimal rest. Squat, Push, Pull, Hinge, Carry.",
      "15-Min Core & Mobility: Plank variations, bird dogs, dead bugs, cat-cow, hip flexor stretches"
    ],
    "travel_workouts": [
      "Hotel room: Bodyweight circuits, resistance band routine, yoga flow",
      "Gym access: Upper/lower split, focus on compound movements",
      "No equipment: 100 push-ups, 100 squats, 100 sit-ups, 1-mile run (break into sets)"
    ],
    "social_considerations": [
      "Workout mornings on social event days to ensure completion",
      "Keep protein shakes available for post-social-meal protein hit",
      "Don't skip workouts for social; adjust timing instead",
      "Find workout buddy for accountability and social connection"
    ],
    "work_schedule_tips": "Occupation: {data.occupation or 'Not specified'}. Optimal training time: {data.workout_time_preference or 'flexible'}. Morning workouts = more consistent (life doesn't interfere). Lunch workouts = energy boost for afternoon. Evening = highest strength potential but easier to skip. Pick what you'll ACTUALLY do consistently.",
    "consistency_strategies": [
      "Schedule workouts like meetings - non-negotiable appointments",
      "Lay out gym clothes night before",
      "Track workouts (app or notebook) - visual progress is motivating",
      "Focus on showing up - even 20 min beats 0 min",
      "Challenges: {data.challenges or 'Staying consistent'} - address these head-on",
      "Motivation level {data.motivation_level or 7}/10 - discipline > motivation"
    ]
  }}
}}

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
            'activity_level', 'exercise_frequency', 'training_environment', 'available_equipment',
            'injuries', 'preferred_exercise', 'workout_duration_preference',
            'health_conditions', 'sleep_quality', 'stress_level',
            'flexibility_level', 'past_workout_experience', 'workout_time_preference',
            'motivation_level', 'challenges', 'country', 'lifestyle'
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
                'exercise_frequency': '4-5 times/week',
                'workout_duration': '35-45 minutes',
                'training_split': 'Full Body with cardio finishers',
            },
            'gain_muscle': {
                'exercise_frequency': '4-5 times/week',
                'workout_duration': '45-60 minutes',
                'training_split': 'Push/Pull/Legs',
            },
            'improve_endurance': {
                'exercise_frequency': '4-6 times/week',
                'workout_duration': '40-60 minutes',
                'training_split': 'Cardio-focused with strength',
            },
            'improve_strength': {
                'exercise_frequency': '3-4 times/week',
                'workout_duration': '60-75 minutes',
                'training_split': 'Strength-focused compound lifts',
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
