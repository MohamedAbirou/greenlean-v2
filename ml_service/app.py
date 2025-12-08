"""
FastAPI application with async background plan generation.
"""

import asyncio, json, time, os, stripe
from contextlib import asynccontextmanager
from typing import Dict, Any, Optional

from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Header
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from config.logging_config import logger, log_api_request, log_api_response, log_error
from models.quiz import Calculations, Macros, UnifiedGeneratePlansRequest, QuickOnboardingData
from services.ai_service import ai_service
from services.database import db_service
from services.prompt_builder import MealPlanPromptBuilder, MealUserProfileData
from services.workout_prompt_builder import WorkoutPlanPromptBuilder, WorkoutUserProfileData
from services.profile_completeness import ProfileCompletenessService, UserProfileData
from utils.calculations import calculate_bmr, calculate_tdee, calculate_goal_calories, calculate_macros


def _convert_quick_to_meal_profile(quiz_data: QuickOnboardingData, nutrition: Dict[str, Any]) -> MealUserProfileData:
    """
    Convert QuickOnboardingData (9 fields) to MealUserProfileData for meal plan generation.

    Progressive profiling: Only 9 fields initially, rest filled with smart defaults.
    MealPlanPromptBuilder will determine BASIC/PREMIUM tier automatically.
    """
    return MealUserProfileData(
        main_goal=quiz_data.main_goal,
        current_weight=quiz_data.weight,
        target_weight=quiz_data.target_weight,
        age=quiz_data.age,
        gender=quiz_data.gender,
        height=quiz_data.height,
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
        disliked_foods=None,
        meal_prep_preference=None,
    )

def _convert_quick_to_workout_profile(quiz_data: QuickOnboardingData, nutrition: Dict[str, Any]) -> WorkoutUserProfileData:
    """
    Convert QuickOnboardingData (9 fields) to WorkoutUserProfileData for workout plan generation.

    Progressive profiling: Only 4 fields initially (BASIC tier), rest filled with smart defaults.
    WorkoutPlanPromptBuilder will determine BASIC/PREMIUM tier automatically.
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
        gym_access=None,
        equipement_available=None,
        workout_location_preference=None,
        injuries_limitations=None,
        fitness_experience=None,
        health_conditions=None,
        medications=None,
        sleep_quality=None,
        stress_level=None
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


async def _track_tier_unlock_if_changed(
    user_id: str,
    plan_type: str,
    new_tier: str,
    completeness: float,
    regeneration_reason: str
):
    """Track tier unlock events when user's plan tier changes"""
    try:
        if not db_service.pool:
            return

        # Get current tier from most recent plan
        table = "ai_meal_plans" if plan_type == "meal" else "ai_workout_plans"

        async with db_service.get_connection() as conn:
            # Get previous plan tier from metadata
            prev_plan = await conn.fetchrow(
                f"""SELECT plan_data
                    FROM {table}
                    WHERE user_id = $1
                    ORDER BY created_at DESC
                    LIMIT 1 OFFSET 1""",
                user_id
            )

            old_tier = "BASIC"  # Default for new users
            if prev_plan and prev_plan['plan_data']:
                plan_json = json.loads(prev_plan['plan_data']) if isinstance(prev_plan['plan_data'], str) else prev_plan['plan_data']
                old_tier = plan_json.get('_metadata', {}).get('tier', 'BASIC')

            # Only track if tier actually changed and it's not initial generation
            if old_tier != new_tier and regeneration_reason != 'initial_generation':
                logger.info(f"[Tier Unlock] User {user_id} {plan_type} plan: {old_tier} → {new_tier}")

                # Insert tier unlock event
                meal_regen = plan_type == "meal"
                workout_regen = plan_type == "workout"

                await conn.execute(
                    """INSERT INTO tier_unlock_events
                       (user_id, old_tier, new_tier, completeness_percentage,
                        meal_plan_regenerated, workout_plan_regenerated, regeneration_accepted_at)
                       VALUES ($1, $2, $3, $4, $5, $6, NOW())""",
                    user_id,
                    old_tier,
                    new_tier,
                    completeness,
                    meal_regen,
                    workout_regen
                )

                logger.info(f"[Tier Unlock] Tracked tier unlock event for user {user_id}")

    except Exception as e:
        # Don't fail the whole generation if tier tracking fails
        logger.error(f"[Tier Unlock] Failed to track tier unlock: {str(e)}")


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
    Automatically uses BASIC/PREMIUM based on profile completeness

    Args:
        regeneration_reason: 'initial_generation', 'tier_upgrade', 'manual_request', or 'critical_field_update'
    """
    try:
        logger.info(f"[Unified] Starting background meal plan generation for user {user_id}")

        # Convert QuickOnboardingData to MealUserProfileData
        meal_profile = _convert_quick_to_meal_profile(quiz_data, nutrition)

        # Use tiered prompt builder - automatically determines BASIC/PREMIUM based on profile completeness
        prompt_response = MealPlanPromptBuilder.build_prompt(meal_profile)

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

        # Add tier metadata to plan
        meal_plan["_metadata"] = {
            "tier": prompt_response.metadata.personalization_level,
            "completeness": prompt_response.metadata.data_completeness,
            "used_defaults": prompt_response.metadata.used_defaults,
            "missing_fields": prompt_response.metadata.missing_fields,
            "generated_at": datetime.now().isoformat(),
            "regeneration_reason": regeneration_reason
        }

        # Track tier unlock if tier changed
        await _track_tier_unlock_if_changed(
            user_id,
            "meal",
            prompt_response.metadata.personalization_level,
            prompt_response.metadata.data_completeness,
            regeneration_reason
        )

        # Save meal plan to database
        await db_service.save_meal_plan(
            user_id,
            quiz_result_id,
            meal_plan,
            nutrition["goalCalories"]
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
    Automatically uses BASIC/PREMIUM based on profile completeness
    Uses WorkoutPlanPromptBuilder instead of old WORKOUT_PLAN_PROMPT

    Args:
        regeneration_reason: 'initial_generation', 'tier_upgrade', 'manual_request', or 'critical_field_update'
    """
    try:
        logger.info(f"[Unified] Starting background workout plan generation for user {user_id}")

        # Convert QuickOnboardingData to WorkoutUserProfileData
        workout_profile = _convert_quick_to_workout_profile(quiz_data, nutrition)

        # Use tiered prompt builder - automatically determines BASIC/PREMIUM based on profile completeness
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

        # Add tier metadata to plan
        workout_plan["_metadata"] = {
            "tier": meta["personalization_level"],
            "completeness": meta["data_completeness"],
            "used_defaults": meta["used_defaults"],
            "missing_fields": meta["missing_fields"],
            "generated_at": datetime.now().isoformat(),
            "regeneration_reason": regeneration_reason
        }

        # Track tier unlock if tier changed
        await _track_tier_unlock_if_changed(
            user_id,
            "workout",
            meta["personalization_level"],
            meta["data_completeness"],
            regeneration_reason
        )

        # Save workout plan to database
        await db_service.save_workout_plan(
            user_id,
            quiz_result_id,
            workout_plan,
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
    UNIFIED ENDPOINT - Progressive Profiling with QuickOnboarding

    Flow:
    1. Calculate nutrition (BMR, TDEE, macros) from 9 minimal fields
    2. Save to user_macro_targets (SOURCE OF TRUTH) and quiz_results
    3. Return calculations immediately
    4. Background: Generate BOTH meal and workout plans using progressive profiling
       - MealPlanPromptBuilder auto-determines BASIC/PREMIUM
       - WorkoutPlanPromptBuilder auto-determines BASIC/PREMIUM

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
            weight=quiz_data.weight,
            height=quiz_data.height,
            age=quiz_data.age,
            gender=quiz_data.gender
        )

        # Calculate TDEE (Total Daily Energy Expenditure)
        tdee = calculate_tdee(
            bmr=bmr,
            exercise_freq=quiz_data.exercise_frequency,
            occupation='Desk job'  # Default
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
            weight=quiz_data.weight,
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
            daily_water_ml=2500,  # Default - can customize later
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

    Returns profile completeness percentage, current tier (BASIC/PREMIUM),
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

        # Build MealUserProfileData from database
        quiz_answers = ensure_dict(profile_data.get('quiz_answers') or {})

        user_profile = UserProfileData(
            # Core from quiz
            main_goal=quiz_answers.get('mainGoal'),
            current_weight=profile_data.get('weight'),
            target_weight=profile_data.get('target_weight'),
            age=profile_data.get('age'),
            gender=profile_data.get('gender'),
            height=profile_data.get('height'),
            dietary_style=quiz_answers.get('dietaryStyle'),
            activity_level=quiz_answers.get('activityLevel'),
            exercise_frequency=quiz_answers.get('exerciseFrequency'),

            # From user_profile_extended
            cooking_skill=profile_data.get('cooking_skill'),
            cooking_time=profile_data.get('cooking_time'),
            grocery_budget=profile_data.get('grocery_budget'),
            meals_per_day=profile_data.get('meals_per_day'),
            food_allergies=profile_data.get('food_allergies'),
            disliked_foods=profile_data.get('disliked_foods'),
            meal_prep_preference=profile_data.get('meal_prep_preference'),
            gym_access=profile_data.get('gym_access'),
            equipement_available=profile_data.get('equipement_available'),
            workout_location_preference=profile_data.get('workout_location_preference'),
            injuries_limitations=profile_data.get('injuries_limitations'),
            fitness_experience=profile_data.get('fitness_experience'),
            health_conditions=profile_data.get('health_conditions'),
            medications=profile_data.get('medications'),
            sleep_quality=profile_data.get('sleep_quality'),
            stress_level=profile_data.get('stress_level'),
            dietary_restrictions=profile_data.get('dietary_restrictions'),
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
            ]
        }

    except HTTPException:
        raise
    except Exception as e:
        log_error(e, "Profile completeness", user_id)
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PLAN REGENERATION ENDPOINT
# ============================================================================

def _convert_full_to_meal_profile(profile_data: UserProfileData, nutrition: Dict[str, Any]) -> MealUserProfileData:
    quiz_answers = ensure_dict(profile_data.get('quiz_answers') or {})
    return MealUserProfileData(
        # Core from quiz
        main_goal=quiz_answers.get('mainGoal'),
        current_weight=profile_data.get('weight'),
        target_weight=profile_data.get('target_weight'),
        age=profile_data.get('age'),
        gender=profile_data.get('gender'),
        height=profile_data.get('height'),
        dietary_style=quiz_answers.get('dietaryStyle'),
        activity_level=quiz_answers.get('activityLevel'),
        exercise_frequency=quiz_answers.get('exerciseFrequency'),

        # Nutrition targets (from calculations)
        daily_calories=nutrition['goalCalories'],
        protein=nutrition['macros'].get('protein_g'),
        carbs=nutrition['macros'].get('carbs_g'),
        fats=nutrition['macros'].get('fat_g'),

        food_allergies=profile_data.get('food_allergies'),
        cooking_skill=profile_data.get('cooking_skill'),
        cooking_time=profile_data.get('cooking_time'),
        grocery_budget=profile_data.get('grocery_budget'),
        meals_per_day=profile_data.get('meals_per_day'),
        health_conditions=profile_data.get('health_conditions'),
        medications=profile_data.get('medications'),
        sleep_quality=profile_data.get('sleep_quality'),
        stress_level=profile_data.get('stress_level'),
        disliked_foods=profile_data.get('disliked_foods'),
        meal_prep_preference=profile_data.get('meal_prep_preference'),
        dietary_restrictions=profile_data.get('dietary_restrictions')
    )

def _convert_full_to_workout_profile(profile_data: UserProfileData, nutrition: Dict[str, Any]) -> WorkoutUserProfileData:
    quiz_answers = ensure_dict(profile_data.get('quiz_answers') or {})
    return WorkoutUserProfileData(
        main_goal=quiz_answers.get('mainGoal'),
        current_weight=profile_data.get('weight'),
        target_weight=profile_data.get('target_weight'),
        age=profile_data.get('age'),
        gender=profile_data.get('gender'),
        height=profile_data.get('height'),
        activity_level=quiz_answers.get('activityLevel'),
        exercise_frequency=quiz_answers.get('exerciseFrequency'),
        
        # Nutrition targets (from calculations)
        daily_calories=nutrition['goalCalories'],
        protein=nutrition['macros'].get('protein_g'),
        carbs=nutrition['macros'].get('carbs_g'),
        fats=nutrition['macros'].get('fat_g'),

        gym_access=profile_data.get('gym_access'),
        equipement_available=profile_data.get('equipement_available'),
        workout_location_preference=profile_data.get('workout_location_preference'),
        injuries_limitations=profile_data.get('injuries_limitations'),
        fitness_experience=profile_data.get('fitness_experience'),
        health_conditions=profile_data.get('health_conditions'),
        medications=profile_data.get('medications'),
        sleep_quality=profile_data.get('sleep_quality'),
        stress_level=profile_data.get('stress_level')
    )

def _calculate_nutrition(profile_data: UserProfileData) -> Dict[str, Any]:
    quiz_answers = ensure_dict(profile_data.get('quiz_answers') or {})

    # Calculate BMI
    height_m = profile_data.get('height') / 100
    bmi = profile_data.get('weight') / (height_m ** 2)

    # Calculate BMR (Basal Metabolic Rate)
    bmr = calculate_bmr(
        weight=profile_data.get('weight'),
        height=profile_data.get('height'),
        age=profile_data.get('age'),
        gender=profile_data.get('gender')
    )

    # Calculate TDEE (Total Daily Energy Expenditure)
    tdee = calculate_tdee(
        bmr=bmr,
        exercise_freq=quiz_answers.get('exerciseFrequency'),
        occupation='Desk job'  # Default
    )

    # Calculate goal calories based on user's goal
    goal_calories = calculate_goal_calories(
        tdee=tdee,
        goal=quiz_answers.get('mainGoal'),
        bmr=bmr,
        gender=profile_data.get('gender')
    )

    # Calculate macros
    macros_result = calculate_macros(
        goal_calories=goal_calories,
        weight=profile_data.get('weight'),
        goal=quiz_answers.get('mainGoal'),
        dietary_style=quiz_answers.get('dietaryStyle')
    )

    # Build Calculations object
    calculations = Calculations(
        bmi=round(bmi, 1),
        bmr=round(bmr, 2),
        tdee=round(tdee, 2),
        macros=Macros(**macros_result),
        goalCalories=goal_calories,
        goalWeight=profile_data.get('target_weight'),
    )

    # Prepare nutrition dict for background tasks
    return {
        'bmi': calculations.bmi,
        'bmr': calculations.bmr,
        'tdee': calculations.tdee,
        'goalCalories': calculations.goalCalories,
        'targetWeight': calculations.goalWeight,
        'macros': macros_result
    }


async def _generate_premium_meal_plan(
    user_id: str,
    quiz_result_id: str,
    profile_data: UserProfileData,
    nutrition: Dict[str, Any],
    ai_provider: str = "openai",
    model_name: str = "gpt-4o-mini",
    regeneration_reason: str = "initial_generation"
):
    """
    NEW: Background task to generate meal plan using PROGRESSIVE PROFILING
    Automatically uses BASIC/PREMIUM based on profile completeness

    Args:
        regeneration_reason: 'initial_generation', 'tier_upgrade', 'manual_request', or 'critical_field_update'
    """
    try:
        logger.info(f"Starting premium meal plan regeneration for user {user_id}")

        # Convert QuickOnboardingData to MealUserProfileData
        meal_profile = _convert_full_to_meal_profile(profile_data, nutrition)

        # Use tiered prompt builder - automatically determines BASIC/PREMIUM based on profile completeness
        prompt_response = MealPlanPromptBuilder.build_prompt(meal_profile)

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

        # Add tier metadata to plan
        meal_plan["_metadata"] = {
            "tier": prompt_response.metadata.personalization_level,
            "completeness": prompt_response.metadata.data_completeness,
            "used_defaults": prompt_response.metadata.used_defaults,
            "missing_fields": prompt_response.metadata.missing_fields,
            "generated_at": datetime.now().isoformat(),
            "regeneration_reason": regeneration_reason
        }

        # Track tier unlock if tier changed
        await _track_tier_unlock_if_changed(
            user_id,
            "meal",
            prompt_response.metadata.personalization_level,
            prompt_response.metadata.data_completeness,
            regeneration_reason
        )

        # Save meal plan to database
        await db_service.save_meal_plan(
            user_id,
            quiz_result_id,
            meal_plan,
            nutrition["goalCalories"]
        )

        await db_service.update_plan_status(user_id, "meal", "completed")
        logger.info(f"Meal plan regenerated successfully for user {user_id}")

    except Exception as e:
        log_error(e, "Background meal plan regeneration", user_id)
        await db_service.update_plan_status(user_id, "meal", "failed", str(e))

async def _generate_premium_workout_plan(
    user_id: str,
    quiz_result_id: str,
    profile_data: UserProfileData,
    nutrition: Dict[str, Any],
    ai_provider: str = "openai",
    model_name: str = "gpt-4o",
    regeneration_reason: str = "initial_generation"
):
    """
    NEW: Background task to generate workout plan using PROGRESSIVE PROFILING
    Automatically uses BASIC/PREMIUM based on profile completeness
    Uses WorkoutPlanPromptBuilder instead of old WORKOUT_PLAN_PROMPT

    Args:
        regeneration_reason: 'initial_generation', 'tier_upgrade', 'manual_request', or 'critical_field_update'
    """
    try:
        logger.info(f"Starting premium workout plan regeneration for user {user_id}")

        # Convert QuickOnboardingData to WorkoutUserProfileData
        workout_profile = _convert_full_to_workout_profile(profile_data, nutrition)

        # Use tiered prompt builder - automatically determines BASIC/PREMIUM based on profile completeness
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

        # Add tier metadata to plan
        workout_plan["_metadata"] = {
            "tier": meta["personalization_level"],
            "completeness": meta["data_completeness"],
            "used_defaults": meta["used_defaults"],
            "missing_fields": meta["missing_fields"],
            "generated_at": datetime.now().isoformat(),
            "regeneration_reason": regeneration_reason
        }

        # Track tier unlock if tier changed
        await _track_tier_unlock_if_changed(
            user_id,
            "workout",
            meta["personalization_level"],
            meta["data_completeness"],
            regeneration_reason
        )

        # Save workout plan to database
        await db_service.save_workout_plan(
            user_id,
            quiz_result_id,
            workout_plan,
        )

        await db_service.update_plan_status(user_id, "workout", "completed")
        logger.info(f"Workout plan regenerated successfully for user {user_id}")

    except Exception as e:
        log_error(e, "Background workout plan regeneration", user_id)
        await db_service.update_plan_status(user_id, "workout", "failed", str(e))


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
    - tier_upgrade: Automatic, doesn't count against limits (when user unlocks PREMIUM)
    - critical_field_update: Automatic, doesn't count against limits (allergies, injuries, health conditions)
    - manual_request: User-triggered, counts against monthly limits
    """
    user_id = request.get('user_id')
    regenerate_meal = request.get('regenerate_meal', False)
    regenerate_workout = request.get('regenerate_workout', False)
    reason = request.get('reason', 'manual_request')

    try:
        logger.info(f"[Regenerate] Request for {user_id}: meal={regenerate_meal}, workout={regenerate_workout}, reason={reason}")

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

        # Build MealUserProfileData from database
        quiz_answers = ensure_dict(profile_data.get('quiz_answers') or {})

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

        latest_quiz = await db_service.pool.fetchrow(
            "SELECT id FROM quiz_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
            user_id
        )

        if not latest_quiz:
            raise HTTPException(status_code=404, detail="No quiz data found for user")

        # Update status to "generating" before starting regeneration
        if regenerate_meal:
            await db_service.update_plan_status(user_id, "meal", "generating")

        if regenerate_workout:
            await db_service.update_plan_status(user_id, "workout", "generating")

        nutrition_dict = _calculate_nutrition(profile_data)

        # Fire regeneration tasks
        if regenerate_meal:
            asyncio.create_task(
                _generate_premium_meal_plan(
                    user_id,
                    str(latest_quiz['id']),
                    profile_data,
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
                _generate_premium_workout_plan(
                    user_id,
                    str(latest_quiz['id']),
                    profile_data,
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


@app.get("/plan-tiers/{user_id}")
async def get_plan_tiers(user_id: str) -> Dict[str, Any]:
    """
    Get current tier levels for user's meal and workout plans.
    Returns tier from plan metadata to show/hide upgrade buttons.
    """
    try:
        async with db_service.get_connection() as conn:
            # Get meal plan tier
            meal_plan = await conn.fetchrow(
                """SELECT plan_data
                   FROM ai_meal_plans
                   WHERE user_id = $1
                   ORDER BY created_at DESC
                   LIMIT 1""",
                user_id
            )

            # Get workout plan tier
            workout_plan = await conn.fetchrow(
                """SELECT plan_data
                   FROM ai_workout_plans
                   WHERE user_id = $1
                   ORDER BY created_at DESC
                   LIMIT 1""",
                user_id
            )

            meal_tier = "BASIC"
            meal_completeness = 0.0
            if meal_plan and meal_plan['plan_data']:
                plan_json = json.loads(meal_plan['plan_data']) if isinstance(meal_plan['plan_data'], str) else meal_plan['plan_data']
                metadata = plan_json.get('_metadata', {})
                meal_tier = metadata.get('tier', 'BASIC')
                meal_completeness = metadata.get('completeness', 0.0)

            workout_tier = "BASIC"
            workout_completeness = 0.0
            if workout_plan and workout_plan['plan_data']:
                plan_json = json.loads(workout_plan['plan_data']) if isinstance(workout_plan['plan_data'], str) else workout_plan['plan_data']
                metadata = plan_json.get('_metadata', {})
                workout_tier = metadata.get('tier', 'BASIC')
                workout_completeness = metadata.get('completeness', 0.0)

            return {
                "meal_tier": meal_tier,
                "workout_tier": workout_tier,
                "meal_completeness": meal_completeness,
                "workout_completeness": workout_completeness,
                "can_upgrade_to_standard": meal_completeness >= 50 and meal_tier == "BASIC",
                "can_upgrade_to_premium": meal_completeness == 70 and meal_tier != "PREMIUM"
            }

    except Exception as e:
        log_error(e, "Get plan tiers", user_id)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
