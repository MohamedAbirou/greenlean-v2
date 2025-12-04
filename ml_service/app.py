"""
FastAPI application with async background plan generation.
"""

import asyncio
import time
import os
import stripe
from contextlib import asynccontextmanager
from typing import Dict, Any
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, HTTPException, BackgroundTasks, Request, Header
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from config.logging_config import logger, log_api_request, log_api_response, log_error
from prompts.json_formats.meal_plan_format import MEAL_PLAN_JSON_FORMAT
from prompts.json_formats.workout_plan_format import WORKOUT_PLAN_JSON_FORMAT
from models.quiz import GeneratePlansRequest, Calculations, Macros, QuickCalculationRequest, UnifiedGeneratePlansRequest, QuickOnboardingData
from services.ai_service import ai_service
from services.database import db_service
from services.prompt_builder import MealPlanPromptBuilder, UserProfileData
from services.workout_prompt_builder import WorkoutPlanPromptBuilder, WorkoutUserProfileData
from services.profile_completeness import ProfileCompletenessService
from utils.calculations import calculate_nutrition_profile, calculate_bmr, calculate_tdee, calculate_goal_calories, calculate_macros
from prompts.meal_plan import MEAL_PLAN_PROMPT
from prompts.workout_plan import WORKOUT_PLAN_PROMPT


def _convert_quick_to_meal_profile(quiz_data: QuickOnboardingData, nutrition: Dict[str, Any]) -> UserProfileData:
    """
    Convert QuickOnboardingData (9 fields) to UserProfileData for meal plan generation.

    Progressive profiling: Only 9 fields initially, rest filled with smart defaults.
    MealPlanPromptBuilder will determine BASIC/STANDARD/PREMIUM tier automatically.
    """
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
        daily_calories=nutrition.get('goalCalories'),
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


def _convert_quick_to_workout_profile(quiz_data: QuickOnboardingData) -> WorkoutUserProfileData:
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
        daily_calories=nutrition.get('goalCalories'),
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
    model_name: str = "gpt-4o-mini"
):
    """
    NEW: Background task to generate meal plan using PROGRESSIVE PROFILING
    Automatically uses BASIC/STANDARD/PREMIUM based on profile completeness
    """
    try:
        logger.info(f"[Unified] Starting background meal plan generation for user {user_id}")

        # Convert QuickOnboardingData to UserProfileData
        user_profile = _convert_quick_to_meal_profile(quiz_data, nutrition)

        # Use tiered prompt builder - automatically determines BASIC/STANDARD/PREMIUM
        prompt_response = MealPlanPromptBuilder.build_prompt(user_profile, requested_level='BASIC') #TODO Change this to automatically determines the level(currently it's set to BASIC by default)

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
    ai_provider: str = "openai",
    model_name: str = "gpt-4o-mini"
):
    """
    NEW: Background task to generate workout plan using PROGRESSIVE PROFILING
    Automatically uses BASIC/STANDARD/PREMIUM based on profile completeness
    Uses WorkoutPlanPromptBuilder instead of old WORKOUT_PLAN_PROMPT
    """
    try:
        logger.info(f"[Unified] Starting background workout plan generation for user {user_id}")

        # Convert QuickOnboardingData to WorkoutUserProfileData
        workout_profile = _convert_quick_to_workout_profile(quiz_data)

        # Use tiered prompt builder - automatically determines BASIC/STANDARD/PREMIUM
        prompt_response = WorkoutPlanPromptBuilder.build_prompt(workout_profile, requested_level='BASIC') #TODO Change this to automatically determines the level(currently it's set to BASIC by default)

        logger.info(
            f"[Unified] User {user_id} workout plan prompt: "
            f"Level={prompt_response.metadata.personalization_level}, "
            f"Completeness={prompt_response.metadata.data_completeness:.1f}%, "
            f"Used {len(prompt_response.metadata.used_defaults)} defaults, "
            f"Missing {len(prompt_response.metadata.missing_fields)} fields"
        )

        # Generate workout plan with AI
        workout_plan = await ai_service.generate_plan(
            prompt_response.prompt,
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

        # Save workout plan to database
        await db_service.save_workout_plan(
            user_id,
            quiz_result_id,
            workout_plan,
            [quiz_data.main_goal],  # workout_type as list #TODO Change this later to actual workout type instead of main_goal
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

        # Map activity level to exercise frequency for TDEE calculation
        activity_to_freq = {
            'sedentary': 'Never',
            'lightly_active': '1-2 times/week',
            'moderately_active': '3-4 times/week',
            'very_active': '5-6 times/week',
            'extremely_active': 'Daily',
        }
        exercise_freq = activity_to_freq.get(quiz_data.activity_level, quiz_data.exercise_frequency)

        # Calculate TDEE (Total Daily Energy Expenditure)
        tdee = calculate_tdee(
            bmr=bmr,
            exercise_freq=exercise_freq,
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        log_level=settings.LOG_LEVEL.lower()
    )
