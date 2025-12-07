"""
FastAPI application with async background plan generation.
"""

import asyncio, json, time, os, stripe
from contextlib import asynccontextmanager
from typing import Dict, Any
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Header
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from config.logging_config import logger, log_api_request, log_api_response, log_error
from prompts.json_formats.meal_plan_format import MEAL_PLAN_JSON_FORMAT
from prompts.json_formats.workout_plan_format import WORKOUT_PLAN_JSON_FORMAT
from models.quiz import Calculations, Macros, UnifiedGeneratePlansRequest, QuickOnboardingData
from services.ai_service import ai_service
from services.database import db_service
from services.prompt_builder import MealPlanPromptBuilder, UserProfileData
from services.workout_prompt_builder import WorkoutPlanPromptBuilder, WorkoutUserProfileData
from services.profile_completeness import ProfileCompletenessService
from services.micro_survey_service import MicroSurveyService
from utils.calculations import calculate_nutrition_profile, calculate_bmr, calculate_tdee, calculate_goal_calories, calculate_macros
from prompts.meal_plan import MEAL_PLAN_PROMPT
from prompts.workout_plan import WORKOUT_PLAN_PROMPT


def _convert_quick_to_meal_profile(quiz_data: QuickOnboardingData, nutrition: Dict[str, Any]) -> UserProfileData:
    """
    Convert QuickOnboardingData (9 fields) to UserProfileData for meal plan generation.

    Progressive profiling: Only 9 fields initially, rest filled with smart defaults.
    MealPlanPromptBuilder will determine BASIC/STANDARD/PREMIUM tier automatically.
    """
    print("Nutrition: ", nutrition)
    return UserProfileData(
        # Core info (from QuickOnboarding)
        main_goal=quiz_data.main_goal,
        current_weight=quiz_data.weight,
        target_weight=quiz_data.target_weight,
        age=quiz_data.age,
        gender=quiz_data.gender,
        height=quiz_data.height,

        # Preferences (from QuickOnboarding)
        dietary_style=quiz_data.dietary_style,
        activity_level=quiz_data.activity_level,
        exercise_frequency=quiz_data.exercise_frequency,

        # Nutrition targets (from calculations)
        daily_calories=nutrition['goalCalories'],
        protein=nutrition['macros'].get('protein_g'),
        carbs=nutrition['macros'].get('carbs_g'),
        fats=nutrition['macros'].get('fat_g'),

        # All other fields None - will use smart defaults in prompt builder
        food_allergies=None,
        cooking_skill=None,
        cooking_time=None,
        grocery_budget=None,
        meals_per_day=None,
        health_conditions=None,
        medications=None,
        sleep_quality=None,
        stress_level=None,
        country=None,
        disliked_foods=None,
        meal_prep_preference=None,
        water_intake_goal=None,
    )


def _convert_quick_to_workout_profile(quiz_data: QuickOnboardingData, nutrition: Dict[str, Any]) -> WorkoutUserProfileData:
    """
    Convert QuickOnboardingData (9 fields) to WorkoutUserProfileData for workout plan generation.

    Progressive profiling: Only 4 fields initially (BASIC tier), rest filled with smart defaults.
    WorkoutPlanPromptBuilder will determine BASIC/STANDARD/PREMIUM tier automatically.
    """
    return WorkoutUserProfileData(
        # BASIC tier fields (from QuickOnboarding)
        main_goal=quiz_data.main_goal,
        current_weight=quiz_data.weight,
        target_weight=quiz_data.target_weight,
        age=quiz_data.age,
        height=quiz_data.height,
        gender=quiz_data.gender,
        activity_level=quiz_data.activity_level,
        exercise_frequency=quiz_data.exercise_frequency,
        
        # Nutrition targets (from calculations)
        daily_calories=nutrition['goalCalories'],
        protein=nutrition['macros'].get('protein_g'),
        carbs=nutrition['macros'].get('carbs_g'),
        fats=nutrition['macros'].get('fat_g'),

        # All other fields None - will use smart defaults in prompt builder
        training_environment=None,
        available_equipment=None,
        injuries=None,
        preferred_exercise=None,
        workout_duration_preference=None,
        health_conditions=None,
        sleep_quality=None,
        stress_level=None,
        flexibility_level=None,
        past_workout_experience=None,
        workout_time_preference=None,
        motivation_level=None,  # 1-10 scale
        challenges=None,  # "Staying consistent", "Finding time"
        country=None,  # For cultural considerations
        lifestyle=None,  # "Busy professional", "Stay-at-home parent"
    )


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown events"""
    logger.info(f"Starting {settings.APP_TITLE} v{settings.APP_VERSION}")

    try:
        await db_service.initialize()
    except Exception as e:
        logger.warning(f"Database initialization failed: {e}. Continuing without database.")

    yield

    logger.info("Shutting down application...")
    await db_service.close()
    logger.info("Application shutdown complete")

app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.APP_TITLE,
        "version": settings.APP_VERSION,
        "ai_providers": {
            "openai": settings.has_openai,
            "anthropic": settings.has_anthropic,
            "gemini": settings.has_gemini,
            "llama": settings.has_llama,
        },
        "database": db_service.pool is not None
    }


async def _generate_meal_plan_background_unified(
    user_id: str,
    quiz_result_id: str,
    quiz_data: QuickOnboardingData,
    nutrition: Dict[str, Any],
    ai_provider: str = "openai",
    model_name: str = "gpt-4o-mini",
    regeneration_reason: str = "initial_generation"
):
    """
    NEW: Background task to generate meal plan using PROGRESSIVE PROFILING
    Automatically uses BASIC/STANDARD/PREMIUM based on profile completeness

    Args:
        regeneration_reason: 'initial_generation', 'tier_upgrade', 'manual_request', or 'critical_field_update'
    """
    try:
        logger.info(f"[Unified] Starting background meal plan generation for user {user_id}")

        # Convert QuickOnboardingData to UserProfileData
        user_profile = _convert_quick_to_meal_profile(quiz_data, nutrition)

        # Use tiered prompt builder - automatically determines BASIC/STANDARD/PREMIUM based on profile completeness
        prompt_response = MealPlanPromptBuilder.build_prompt(user_profile)

        logger.info(
            f"[Unified] User {user_id} meal plan prompt: "
            f"Level={prompt_response.metadata.personalization_level}, "
            f"Completeness={prompt_response.metadata.data_completeness:.1f}%, "
            f"Used {len(prompt_response.metadata.used_defaults)} defaults, "
            f"Missing {len(prompt_response.metadata.missing_fields)} fields"
        )

        # Generate meal plan with AI
        meal_plan = await ai_service.generate_plan(
            prompt_response.prompt,
            ai_provider,
            model_name,
            user_id
        )

        # Save meal plan to database
        await db_service.save_meal_plan(
            user_id,
            quiz_result_id,
            meal_plan,
            nutrition["goalCalories"],
            [],  # No preferredExercise in QuickOnboarding
            quiz_data.dietary_style
        )

        await db_service.update_plan_status(user_id, "meal", "completed")
        logger.info(f"[Unified] Meal plan generated successfully for user {user_id}")

    except Exception as e:
        log_error(e, "[Unified] Background meal plan generation", user_id)
        await db_service.update_plan_status(user_id, "meal", "failed", str(e))

async def _generate_workout_plan_background_unified(
    user_id: str,
    quiz_result_id: str,
    quiz_data: QuickOnboardingData,
    nutrition: Dict[str, Any],
    ai_provider: str = "openai",
    model_name: str = "gpt-4o-mini",
    regeneration_reason: str = "initial_generation"
):
    """
    NEW: Background task to generate workout plan using PROGRESSIVE PROFILING
    Automatically uses BASIC/STANDARD/PREMIUM based on profile completeness
    Uses WorkoutPlanPromptBuilder instead of old WORKOUT_PLAN_PROMPT

    Args:
        regeneration_reason: 'initial_generation', 'tier_upgrade', 'manual_request', or 'critical_field_update'
    """
    try:
        logger.info(f"[Unified] Starting background workout plan generation for user {user_id}")

        # Convert QuickOnboardingData to WorkoutUserProfileData
        workout_profile = _convert_quick_to_workout_profile(quiz_data, nutrition)

        # Use tiered prompt builder - automatically determines BASIC/STANDARD/PREMIUM based on profile completeness
        prompt_response = WorkoutPlanPromptBuilder.build_prompt(workout_profile)

        meta = prompt_response["metadata"]

        logger.info(
            f"[Unified] User {user_id} workout plan prompt: "
            f"Level={meta['personalization_level']}, "
            f"Completeness={meta['data_completeness']:.1f}%, "
            f"Used {len(meta['used_defaults'])} defaults, "
            f"Missing {len(meta['missing_fields'])} fields"
        )

        # Generate workout plan with AI
        workout_plan = await ai_service.generate_plan(
            prompt_response["prompt"],
            ai_provider,
            model_name,
            user_id
        )

        # Parse exercise frequency to get frequency per week (e.g., "3-4 times/week" -> 4)
        freq_map = {
            'Never': 0,
            '1-2 times/week': 2,
            '3-4 times/week': 4,
            '5-6 times/week': 6,
            'Daily': 7
        }
        frequency_per_week = freq_map.get(quiz_data.exercise_frequency, 4)

        # Map main_goal to appropriate workout types
        workout_type_map = {
            'lose_weight': ['cardio', 'strength'],
            'gain_muscle': ['strength', 'hypertrophy'],
            'improve_health': ['balanced', 'flexibility'],
            'maintain': ['balanced', 'general_fitness'],
            'improve_athletic_performance': ['athletic', 'power']
        }
        workout_types = workout_type_map.get(quiz_data.main_goal, ['balanced'])

        # Save workout plan to database
        await db_service.save_workout_plan(
            user_id,
            quiz_result_id,
            workout_plan,
            workout_types,  # Proper workout types based on goal
            quiz_data.exercise_frequency,
            frequency_per_week
        )

        await db_service.update_plan_status(user_id, "workout", "completed")
        logger.info(f"[Unified] Workout plan generated successfully for user {user_id}")

    except Exception as e:
        log_error(e, "[Unified] Background workout plan generation", user_id)
        await db_service.update_plan_status(user_id, "workout", "failed", str(e))

@app.post("/generate-plans")
async def generate_plans_unified(
    request: UnifiedGeneratePlansRequest
) -> Dict[str, Any]:
    """
    NEW UNIFIED ENDPOINT - Progressive Profiling with QuickOnboarding (9 fields)

    Replaces both /calculate-nutrition and /generate-plans (old) endpoints.

    Flow:
    1. Calculate nutrition (BMR, TDEE, macros) from 9 minimal fields
    2. Save to user_macro_targets (SOURCE OF TRUTH) and quiz_results
    3. Return calculations immediately
    4. Background: Generate BOTH meal and workout plans using progressive profiling
       - MealPlanPromptBuilder auto-determines BASIC/STANDARD/PREMIUM
       - WorkoutPlanPromptBuilder auto-determines BASIC/STANDARD/PREMIUM

    Field Sync: 100% aligned with frontend QuickOnboarding.tsx and database schema!
    """
    start_time = time.time()

    # Extract AI provider from preferences (with defaults)
    ai_provider = "openai"
    model_name = "gpt-4o-mini"
    if request.preferences:
        ai_provider = request.preferences.get('provider', 'openai')
        model_name = request.preferences.get('model', 'gpt-4o-mini')

    log_api_request(
        "/generate-plans [unified]",
        request.user_id,
        ai_provider,
        model_name
    )

    try:
        quiz_data = request.quiz_data

        # ===================================================================
        # STEP 1: Calculate Nutrition (BMR, TDEE, Macros) from 9 fields
        # ===================================================================
        logger.info(f"[Unified] Calculating nutrition for user {request.user_id}")

        # Calculate BMI
        height_m = quiz_data.height / 100
        bmi = quiz_data.weight / (height_m ** 2)

        # Calculate BMR (Basal Metabolic Rate)
        bmr = calculate_bmr(
            weight_kg=quiz_data.weight,
            height_cm=quiz_data.height,
            age=quiz_data.age,
            gender=quiz_data.gender
        )

        # Calculate TDEE (Total Daily Energy Expenditure)
        tdee = calculate_tdee(
            bmr=bmr,
            exercise_freq=quiz_data.exercise_frequency,
            occupation='Desk job'  # Default - can collect later via micro-surveys
        )

        # Calculate goal calories based on user's goal
        goal_calories = calculate_goal_calories(
            tdee=tdee,
            goal=quiz_data.main_goal,
            bmr=bmr,
            gender=quiz_data.gender
        )

        # Calculate macros
        macros_result = calculate_macros(
            goal_calories=goal_calories,
            weight_kg=quiz_data.weight,
            goal=quiz_data.main_goal,
            dietary_style=quiz_data.dietary_style
        )

        # Build Calculations object
        calculations = Calculations(
            bmi=round(bmi, 1),
            bmr=round(bmr, 2),
            tdee=round(tdee, 2),
            macros=Macros(**macros_result),
            goalCalories=goal_calories,
            goalWeight=quiz_data.target_weight,
        )

        # Prepare nutrition dict for background tasks
        nutrition_dict = {
            'bmi': calculations.bmi,
            'bmr': calculations.bmr,
            'tdee': calculations.tdee,
            'goalCalories': calculations.goalCalories,
            'targetWeight': calculations.goalWeight,
            'macros': macros_result
        }

        # ===================================================================
        # STEP 2: Save to Database (SOURCE OF TRUTH!)
        # ===================================================================
        logger.info(f"[Unified] Saving calculations for user {request.user_id}")

        # 2a. Save to quiz_results.calculations (JSONB)
        await db_service.update_quiz_calculations(
            request.quiz_result_id,
            calculations.model_dump()
        )

        # 2b. Save to user_macro_targets (SOURCE OF TRUTH for current macros!)
        await db_service.save_macro_targets(
            user_id=request.user_id,
            daily_calories=calculations.goalCalories,
            daily_protein_g=macros_result['protein_g'],
            daily_carbs_g=macros_result['carbs_g'],
            daily_fats_g=macros_result['fat_g'],
            daily_water_ml=2000,  # Default - can customize later
            source='ai_generated',
            notes=f'Generated from QuickOnboarding - Goal: {quiz_data.main_goal}'
        )

        # 2c. Initialize plan generation status
        await db_service.initialize_plan_status(
            request.user_id,
            request.quiz_result_id
        )

        # ===================================================================
        # STEP 3: Background - Generate BOTH Plans (Meal + Workout)
        # ===================================================================
        logger.info(f"[Unified] Starting background plan generation for user {request.user_id}")

        # Fire both AI generation tasks concurrently (Fire and Forget pattern)
        asyncio.create_task(
            _generate_meal_plan_background_unified(
                request.user_id,
                request.quiz_result_id,
                quiz_data,
                nutrition_dict,
                ai_provider,
                model_name
            )
        )
        asyncio.create_task(
            _generate_workout_plan_background_unified(
                request.user_id,
                request.quiz_result_id,
                quiz_data,
                nutrition_dict,
                ai_provider,
                model_name
            )
        )

        # ===================================================================
        # STEP 4: Return Immediately to Frontend
        # ===================================================================
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-plans [unified]", request.user_id, True, duration_ms)

        return {
            "success": True,
            "calculations": calculations.model_dump(),
            "macros": calculations.macros.model_dump(),
            "meal_plan_status": "generating",
            "workout_plan_status": "generating",
            "message": "Nutrition calculated! Generating personalized plans...",
            "metadata": {
                "field_count": 9,
                "progressive_profiling": True,
                "calculation_time_ms": round(duration_ms, 2)
            }
        }

    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-plans [unified]", request.user_id, False, duration_ms)
        log_error(e, "[Unified] Plan generation initialization", request.user_id)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/plan-status/{user_id}")
async def get_plan_status(user_id: str) -> Dict[str, Any]:
    """Check status of plan generation for a user"""
    try:
        status = await db_service.get_plan_status(user_id)
        
        if not status:
            raise HTTPException(status_code=404, detail="No plan generation found for user")
        
        return {
            "success": True,
            "meal_plan_status": status["meal_plan_status"],
            "workout_plan_status": status["workout_plan_status"],
            "meal_plan_error": status.get("meal_plan_error"),
            "workout_plan_error": status.get("workout_plan_error")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "Plan status check", user_id)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# MICRO-SURVEY ENDPOINTS - Progressive Profiling
# ============================================================================

# Initialize micro-survey service
micro_survey_service = MicroSurveyService(db_service)

@app.post("/micro-surveys/check-triggers/{user_id}")
async def check_micro_survey_triggers(user_id: str) -> Dict[str, Any]:
    """
    Check all trigger conditions and activate micro-surveys for user.

    Call this when user views dashboard or completes actions.
    """
    try:
        triggered = await micro_survey_service.check_and_trigger_surveys(user_id)

        return {
            "success": True,
            "triggered_count": len(triggered),
            "triggered_surveys": triggered
        }

    except Exception as e:
        log_error(e, "Micro-survey trigger check", user_id)
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/micro-surveys/next/{user_id}")
async def get_next_micro_survey(user_id: str) -> Dict[str, Any]:
    """
    Get the next micro-survey question for user.

    Returns highest priority triggered but not yet answered question.
    """
    try:
        survey = await micro_survey_service.get_next_survey(user_id)

        if survey:
            return {
                "success": True,
                "has_survey": True,
                "survey": survey
            }
        else:
            return {
                "success": True,
                "has_survey": False,
                "survey": None
            }

    except Exception as e:
        log_error(e, "Get next micro-survey", user_id)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/micro-surveys/respond")
async def respond_to_micro_survey(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Save user's response to micro-survey and update profile.

    Request body:
    {
        "user_id": "uuid",
        "question_id": "uuid",
        "response_value": "intermediate",
        "response_metadata": {} // optional
    }

    Response:
    {
        "success": true,
        "threshold_crossed": false,
        "old_tier": "STANDARD",
        "new_tier": "STANDARD",
        "old_completeness": 40.9,
        "new_completeness": 45.5,
        "affects": ["diet"]
    }
    """
    try:
        user_id = request.get('user_id')
        question_id = request.get('question_id')
        response_value = request.get('response_value')
        response_metadata = request.get('response_metadata')

        if not user_id or not question_id or not response_value:
            raise HTTPException(status_code=400, detail="Missing required fields")

        result = await micro_survey_service.save_response(
            user_id=user_id,
            question_id=question_id,
            response_value=response_value,
            response_metadata=response_metadata
        )

        logger.info(
            f"[Micro-Survey] User {user_id} responded to {question_id}: "
            f"{result['old_tier']}({result['old_completeness']}%) → "
            f"{result['new_tier']}({result['new_completeness']}%)"
        )

        return result

    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "Micro-survey response", request.get('user_id', 'unknown'))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/micro-surveys/tier-unlocks/{user_id}")
async def get_pending_tier_unlocks(user_id: str) -> Dict[str, Any]:
    """
    Get tier unlock events that haven't been acknowledged.

    Returns list of tier unlocks waiting for user to decide on regeneration.
    """
    try:
        unlocks = await micro_survey_service.get_pending_tier_unlocks(user_id)

        return {
            "success": True,
            "has_unlocks": len(unlocks) > 0,
            "unlocks": unlocks
        }

    except Exception as e:
        log_error(e, "Get tier unlocks", user_id)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/micro-surveys/acknowledge-tier-unlock")
async def acknowledge_tier_unlock(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    User acknowledges tier unlock and chooses whether to regenerate plans.

    Request body:
    {
        "user_id": "uuid",
        "unlock_event_id": "uuid",
        "action": "accept" or "dismiss",
        "regenerate_diet": true,
        "regenerate_workout": false
    }

    If action is "accept" and regenerate flags are true, this will trigger
    background regeneration of the specified plans with the new tier.
    """
    try:
        user_id = request.get('user_id')
        unlock_event_id = request.get('unlock_event_id')
        action = request.get('action', 'dismiss')
        regenerate_diet = request.get('regenerate_diet', False)
        regenerate_workout = request.get('regenerate_workout', False)

        if not user_id or not unlock_event_id:
            raise HTTPException(status_code=400, detail="Missing required fields")

        # Acknowledge the unlock
        result = await micro_survey_service.acknowledge_tier_unlock(
            user_id=user_id,
            unlock_event_id=unlock_event_id,
            action=action,
            regenerate_diet=regenerate_diet,
            regenerate_workout=regenerate_workout
        )

        # If user accepted, trigger regeneration
        if action == 'accept' and (regenerate_diet or regenerate_workout):
            logger.info(f"[Tier Unlock] User {user_id} accepted regeneration: diet={regenerate_diet}, workout={regenerate_workout}")

            # Trigger actual plan regeneration if user accepted
            if regenerate_diet or regenerate_workout:
                logger.info(f"[Tier Unlock] Triggering regeneration: meal={regenerate_diet}, workout={regenerate_workout}")

                # Get latest quiz data for regeneration
                latest_quiz = await db_service.pool.fetchrow(
                    "SELECT id, answers, calculations FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
                    user_id
                )

                if latest_quiz:
                    # Fetch profile data
                    profile = await db_service.pool.fetchrow(
                        """SELECT weight_kg, target_weight_kg, height_cm, age, gender, activity_level
                           FROM profiles WHERE user_id = $1""",
                        user_id
                    )

                    if not profile:
                        logger.error(f"[Tier Unlock] No profile found for user {user_id}")
                        return {"status": "error", "message": "Profile not found"}

                    quiz_data_dict = latest_quiz['answers']

                    # Map camelCase quiz answers to snake_case and combine with profile data
                    quiz_data = QuickOnboardingData(
                        main_goal=quiz_data_dict.get('mainGoal'),
                        dietary_style=quiz_data_dict.get('dietaryStyle'),
                        exercise_frequency=quiz_data_dict.get('exerciseFrequency'),
                        target_weight=quiz_data_dict.get('targetWeight') or profile['target_weight_kg'],
                        activity_level=quiz_data_dict.get('activityLevel') or profile['activity_level'],
                        weight=profile['weight_kg'],
                        height=profile['height_cm'],
                        age=profile['age'],
                        gender=profile['gender']
                    )
                    nutrition_dict = latest_quiz['calculations'] or {}

                    # Fire regeneration tasks with tier_upgrade reason
                    if regenerate_diet:
                        asyncio.create_task(
                            _generate_meal_plan_background_unified(
                                user_id,
                                str(latest_quiz['id']),
                                quiz_data,
                                nutrition_dict,
                                ai_provider="openai",
                                model_name="gpt-4o-mini",
                                regeneration_reason="tier_upgrade"
                            )
                        )

                    if regenerate_workout:
                        asyncio.create_task(
                            _generate_workout_plan_background_unified(
                                user_id,
                                str(latest_quiz['id']),
                                quiz_data,
                                nutrition_dict,
                                ai_provider="openai",
                                model_name="gpt-4o-mini",
                                regeneration_reason="tier_upgrade"
                            )
                        )

        return {
            "success": True,
            "action": action,
            "event": result
        }

    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "Acknowledge tier unlock", request.get('user_id', 'unknown'))
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PROFILE COMPLETENESS ENDPOINT
# ============================================================================

def ensure_dict(value):
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except Exception:
            return {}
    return {}


@app.get("/user/{user_id}/profile-completeness")
async def get_profile_completeness(user_id: str) -> Dict[str, Any]:
    """
    Get user's profile completeness and personalization level.

    Returns profile completeness percentage, current tier (BASIC/STANDARD/PREMIUM),
    missing fields, and suggested next questions.
    """
    try:
        # Fetch user profile data from database
        profile_query = """
            SELECT
                p.*,
                upe.*,
                qr.answers as quiz_answers
            FROM profiles p
            LEFT JOIN user_profile_extended upe ON p.id = upe.user_id
            LEFT JOIN LATERAL (
                SELECT answers FROM quiz_results
                WHERE user_id = p.id
                ORDER BY created_at DESC
                LIMIT 1
            ) qr ON true
            WHERE p.id = $1
        """

        profile_data = await db_service.pool.fetchrow(profile_query, user_id)

        if not profile_data:
            raise HTTPException(status_code=404, detail="User profile not found")

        # Build UserProfileData from database
        quiz_answers = ensure_dict(profile_data.get('quiz_answers') or {})

        user_profile = UserProfileData(
            # Core from quiz
            main_goal=quiz_answers.get('mainGoal'),
            current_weight=profile_data.get('weight_kg'),
            target_weight=profile_data.get('target_weight_kg'),
            age=profile_data.get('age'),
            gender=profile_data.get('gender'),
            height=profile_data.get('height_cm'),
            dietary_style=quiz_answers.get('dietaryStyle'),
            activity_level=quiz_answers.get('activityLevel'),
            exercise_frequency=quiz_answers.get('exerciseFrequency'),

            # Nutrition targets (from calculations)
            daily_calories=None,  # We'll get from macro targets if needed
            protein=None,
            carbs=None,
            fats=None,

            # From user_profile_extended (micro surveys)
            food_allergies=profile_data.get('food_allergies'),
            cooking_skill=profile_data.get('cooking_skill'),
            cooking_time=profile_data.get('cooking_time'),
            grocery_budget=profile_data.get('grocery_budget'),
            meals_per_day=profile_data.get('meals_per_day'),
            health_conditions=profile_data.get('health_conditions'),
            medications=profile_data.get('medications'),
            sleep_quality=profile_data.get('sleep_quality'),
            stress_level=profile_data.get('stress_level'),
            country=profile_data.get('country'),
            disliked_foods=profile_data.get('disliked_foods'),
            meal_prep_preference=profile_data.get('meal_prep_preference'),
            water_intake_goal=profile_data.get('water_intake_goal'),
        )

        # Analyze with ProfileCompletenessService
        report = ProfileCompletenessService.analyze(user_profile)

        return {
            "completeness": report.completeness,
            "personalization_level": report.personalization_level,
            "total_fields": report.total_fields,
            "completed_fields": report.completed_fields,
            "missing_fields": [
                {
                    "field": f.field,
                    "label": f.label,
                    "category": f.category,
                    "priority": f.priority
                }
                for f in report.missing_fields
            ],
            "next_suggestions": report.next_suggested_questions
        }

    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "Profile completeness", user_id)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PLAN REGENERATION ENDPOINT
# ============================================================================

@app.post("/regenerate-plans")
async def regenerate_plans(request: Dict[str, Any]) -> Dict[str, Any]:
    """
    Regenerate meal/workout plans for user with updated profile data.

    Request body:
    {
        "user_id": "uuid",
        "regenerate_meal": true,
        "regenerate_workout": false,
        "reason": "tier_upgrade" | "manual_request" | "critical_field_update"
    }

    Regeneration types:
    - tier_upgrade: Automatic, doesn't count against limits (when user unlocks STANDARD/PREMIUM)
    - critical_field_update: Automatic, doesn't count against limits (allergies, injuries, health conditions)
    - manual_request: User-triggered, counts against monthly limits
    """
    user_id = request.get('user_id')
    regenerate_meal = request.get('regenerate_meal', False)
    regenerate_workout = request.get('regenerate_workout', False)
    reason = request.get('reason', 'manual_request')

    try:
        logger.info(f"[Regenerate] Request for {user_id}: meal={regenerate_meal}, workout={regenerate_workout}, reason={reason}")

        # Check if user can regenerate (based on subscription tier)
        if reason == 'manual_request':
            # Check limits for meal plan
            if regenerate_meal:
                can_regen_meal = await db_service.pool.fetchval(
                    "SELECT can_regenerate_plan($1, 'meal', 'manual')",
                    user_id
                )
                if not can_regen_meal:
                    raise HTTPException(
                        status_code=403,
                        detail="Regeneration limit reached. Upgrade to Pro for unlimited regenerations."
                    )

            # Check limits for workout plan
            if regenerate_workout:
                can_regen_workout = await db_service.pool.fetchval(
                    "SELECT can_regenerate_plan($1, 'workout', 'manual')",
                    user_id
                )
                if not can_regen_workout:
                    raise HTTPException(
                        status_code=403,
                        detail="Regeneration limit reached. Upgrade to Pro for unlimited regenerations."
                    )

        # Fetch latest quiz data
        latest_quiz = await db_service.pool.fetchrow(
            "SELECT id, answers, calculations FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
            user_id
        )

        if not latest_quiz:
            raise HTTPException(status_code=404, detail="No quiz data found for user")

        # Fetch profile data
        profile = await db_service.pool.fetchrow(
            """SELECT weight_kg, target_weight_kg, height_cm, age, gender
               FROM profiles WHERE id = $1""",
            user_id
        )

        if not profile:
            raise HTTPException(status_code=404, detail="No profile data found for user")

        raw_answers = latest_quiz['answers']

        # Ensure dict
        if isinstance(raw_answers, str):
            quiz_data_dict = json.loads(raw_answers)
        else:
            quiz_data_dict = raw_answers

        # Map camelCase quiz answers to snake_case and combine with profile data
        quiz_data = QuickOnboardingData(
            main_goal=quiz_data_dict.get('mainGoal'),
            dietary_style=quiz_data_dict.get('dietaryStyle'),
            exercise_frequency=quiz_data_dict.get('exerciseFrequency'),
            target_weight=quiz_data_dict.get('targetWeight') or profile['target_weight_kg'],
            activity_level=quiz_data_dict.get('activityLevel'),
            weight=profile['weight_kg'],
            height=profile['height_cm'],
            age=profile['age'],
            gender=profile['gender']
        )

        # Get nutrition calculations
        nutrition_dict = latest_quiz['calculations'] or {}

        if isinstance(nutrition_dict, str):
            nutrition_dict = json.loads(nutrition_dict)

        # Fire regeneration tasks
        if regenerate_meal:
            asyncio.create_task(
                _generate_meal_plan_background_unified(
                    user_id,
                    str(latest_quiz['id']),
                    quiz_data,
                    nutrition_dict,
                    ai_provider="openai",
                    model_name="gpt-4o-mini",
                    regeneration_reason=reason
                )
            )

            # Track usage if manual request
            if reason == 'manual_request':
                await db_service.pool.execute(
                    "SELECT track_regeneration($1, 'meal', 'manual')",
                    user_id
                )

        if regenerate_workout:
            asyncio.create_task(
                _generate_workout_plan_background_unified(
                    user_id,
                    str(latest_quiz['id']),
                    quiz_data,
                    nutrition_dict,
                    ai_provider="openai",
                    model_name="gpt-4o-mini",
                    regeneration_reason=reason
                )
            )

            # Track usage if manual request
            if reason == 'manual_request':
                await db_service.pool.execute(
                    "SELECT track_regeneration($1, 'workout', 'manual')",
                    user_id
                )

        return {
            "success": True,
            "message": "Plan regeneration started",
            "meal_regenerating": regenerate_meal,
            "workout_regenerating": regenerate_workout,
            "reason": reason
        }

    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "Plan regeneration", user_id)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CHECK REGENERATION ELIGIBILITY
# ============================================================================

@app.get("/can-regenerate/{user_id}")
async def check_can_regenerate(user_id: str) -> Dict[str, Any]:
    """
    Check if user can regenerate plans based on subscription tier and usage.

    Returns eligibility status and remaining regenerations for the current month.
    """
    try:
        # Get user's subscription tier
        tier_query = """
            SELECT s.tier, st.ai_generations_per_month
            FROM subscriptions s
            JOIN subscription_tiers st ON s.tier = st.tier
            WHERE s.user_id = $1 AND s.status = 'active'
        """
        tier_data = await db_service.pool.fetchrow(tier_query, user_id)

        tier = tier_data['tier'] if tier_data else 'free'
        monthly_limit = tier_data['ai_generations_per_month'] if tier_data else 1

        # Get current month's usage
        period_start = datetime.now(timezone.utc).replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        usage_query = """
            SELECT
                COALESCE(meal_plan_regenerations, 0) as meal_regens,
                COALESCE(workout_plan_regenerations, 0) as workout_regens
            FROM plan_regeneration_usage
            WHERE user_id = $1 AND period_start = $2
        """
        usage_data = await db_service.pool.fetchrow(usage_query, user_id, period_start)

        meal_usage = usage_data['meal_regens'] if usage_data else 0
        workout_usage = usage_data['workout_regens'] if usage_data else 0

        # Pro/Premium have unlimited (999999)
        can_regenerate_meal = meal_usage < monthly_limit
        can_regenerate_workout = workout_usage < monthly_limit

        return {
            "can_regenerate_meal": can_regenerate_meal,
            "can_regenerate_workout": can_regenerate_workout,
            "tier": tier,
            "monthly_limit": monthly_limit,
            "meal_regenerations_used": meal_usage,
            "workout_regenerations_used": workout_usage,
            "remaining_meal_regenerations": max(0, monthly_limit - meal_usage),
            "remaining_workout_regenerations": max(0, monthly_limit - workout_usage),
            "requires_upgrade": tier == 'free' and (not can_regenerate_meal or not can_regenerate_workout)
        }

    except Exception as e:
        log_error(e, "Check regeneration eligibility", user_id)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
