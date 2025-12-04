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
from models.quiz import GeneratePlansRequest, Calculations, Macros, QuickCalculationRequest
from services.ai_service import ai_service
from services.database import db_service
from services.prompt_builder import MealPlanPromptBuilder, UserProfileData
from services.profile_completeness import ProfileCompletenessService
from utils.calculations import calculate_nutrition_profile, calculate_bmr, calculate_tdee, calculate_goal_calories, calculate_macros
from prompts.meal_plan import MEAL_PLAN_PROMPT
from prompts.workout_plan import WORKOUT_PLAN_PROMPT


def _convert_to_user_profile(request: GeneratePlansRequest, nutrition: Dict[str, Any]) -> UserProfileData:
    """
    Convert GeneratePlansRequest to UserProfileData for tiered prompt system
    """
    answers = request.answers

    # Extract weight/height values
    weight_kg = answers.currentWeight.kg if hasattr(answers.currentWeight, 'kg') else answers.currentWeight
    target_kg = answers.targetWeight.kg if hasattr(answers.targetWeight, 'kg') else answers.targetWeight if hasattr(answers, 'targetWeight') else None
    height_cm = answers.height.cm if hasattr(answers.height, 'cm') else answers.height

    return UserProfileData(
        # Core info
        main_goal=answers.mainGoal,
        current_weight=float(weight_kg) if weight_kg else 70.0,
        target_weight=float(target_kg) if target_kg else None,
        age=int(answers.age) if answers.age else None,
        gender=answers.gender,
        height=float(height_cm) if height_cm else None,

        # Nutrition targets (from calculations)
        daily_calories=nutrition.get('goalCalories'),
        protein=nutrition['macros'].get('protein_g'),
        carbs=nutrition['macros'].get('carbs_g'),
        fats=nutrition['macros'].get('fat_g'),

        # Preferences
        dietary_style=answers.dietaryStyle if hasattr(answers, 'dietaryStyle') else None,
        food_allergies=[answers.foodAllergies] if hasattr(answers, 'foodAllergies') and answers.foodAllergies else None,
        cooking_skill=answers.cookingSkill if hasattr(answers, 'cookingSkill') else None,
        cooking_time=answers.cookingTime if hasattr(answers, 'cookingTime') else None,
        grocery_budget=answers.groceryBudget if hasattr(answers, 'groceryBudget') else None,
        meals_per_day=int(answers.mealsPerDay) if hasattr(answers, 'mealsPerDay') and answers.mealsPerDay else None,

        # Activity
        activity_level=answers.activity_level if hasattr(answers, 'activity_level') else None,
        workout_frequency=None,  # Not in current model
        training_environment=[answers.trainingEnvironment] if hasattr(answers, 'trainingEnvironment') and isinstance(answers.trainingEnvironment, list) else None,
        equipment=[answers.equipment] if hasattr(answers, 'equipment') and isinstance(answers.equipment, list) else None,
        injuries=[answers.injuries] if hasattr(answers, 'injuries') and answers.injuries else None,

        # Health
        health_conditions=[answers.healthConditions] if hasattr(answers, 'healthConditions') and answers.healthConditions else None,
        medications=[answers.medications] if hasattr(answers, 'medications') and answers.medications else None,
        sleep_quality=int(answers.sleepQuality) if hasattr(answers, 'sleepQuality') and isinstance(answers.sleepQuality, (int, str)) else None,
        stress_level=int(answers.stressLevel) if hasattr(answers, 'stressLevel') else None,
        country=answers.country if hasattr(answers, 'country') else None,
        disliked_foods=[answers.dislikedFoods] if hasattr(answers, 'dislikedFoods') and answers.dislikedFoods else None,
        meal_prep_preference=None,  # Not in current model
        water_intake_goal=None,  # Not in current model
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


async def _generate_meal_plan_background(
    user_id: str,
    quiz_result_id: str,
    request: GeneratePlansRequest,
    nutrition: Dict[str, Any]
):
    """
    Background task to generate meal plan using TIERED PROMPT SYSTEM
    Automatically uses BASIC/STANDARD/PREMIUM based on available data
    """
    try:
        logger.info(f"Starting background meal plan generation for user {user_id}")

        # Convert request to UserProfileData
        user_profile = _convert_to_user_profile(request, nutrition)

        # Use tiered prompt builder - it will automatically determine the right level
        prompt_response = MealPlanPromptBuilder.build_prompt(user_profile, requested_level='PREMIUM')

        logger.info(
            f"User {user_id} meal plan prompt: "
            f"Level={prompt_response.metadata.personalization_level}, "
            f"Completeness={prompt_response.metadata.data_completeness:.1f}%, "
            f"Used {len(prompt_response.metadata.used_defaults)} defaults"
        )

        # Use the tiered prompt (no more manual formatting!)
        full_prompt = prompt_response.prompt
        
        meal_plan = await ai_service.generate_plan(
            full_prompt,
            request.ai_provider,
            request.model_name,
            user_id
        )
        
        await db_service.save_meal_plan(
            user_id,
            quiz_result_id,
            meal_plan,
            nutrition["goalCalories"],
            request.answers.preferredExercise,
            request.answers.dietaryStyle
        )
        
        await db_service.update_plan_status(user_id, "meal", "completed")
        logger.info(f"Meal plan generated successfully for user {user_id}")
        
    except Exception as e:
        log_error(e, "Background meal plan generation", user_id)
        await db_service.update_plan_status(user_id, "meal", "failed", str(e))

async def _generate_workout_plan_background(
    user_id: str,
    quiz_result_id: str,
    request: GeneratePlansRequest,
    nutrition: Dict[str, Any]
):
    """Background task to generate workout plan - ENHANCED with ML inference"""
    try:
        logger.info(f"Starting background workout plan generation for user {user_id}")

        # Get profile completeness level for AI prompt complexity
        profile_level = await db_service.get_profile_completeness_level(user_id)
        micro_surveys = await db_service.get_answered_micro_surveys(user_id)

        logger.info(f"User {user_id} workout profile level: {profile_level}")

        display = nutrition["display"]
        body_fat_str = (
            f"{nutrition['bodyFatPercentage']}%"
            if nutrition.get("bodyFatPercentage")
            else "Not provided"
        )
        
        prompt = WORKOUT_PLAN_PROMPT.format(
            age=request.answers.age,
            gender=request.answers.gender,
            current_weight=display["weight"],
            target_weight=display["targetWeight"],
            height=display["height"],
            main_goal=request.answers.mainGoal,
            secondary_goals=request.answers.secondaryGoals,
            time_frame=request.answers.timeFrame,
            body_type=request.answers.bodyType,
            body_fat=body_fat_str,
            health_conditions=request.answers.healthConditions,
            health_conditions_other=request.answers.healthConditions_other,
            injuries=request.answers.injuries,
            medications=request.answers.medications,
            lifestyle=request.answers.lifestyle,
            stress_level=request.answers.stressLevel,
            sleep_quality=request.answers.sleepQuality,
            motivation_level=request.answers.motivationLevel,
            activity_level=request.answers.activity_level,
            country=request.answers.country,
            challenges=request.answers.challenges,
            exercise_frequency=request.answers.exerciseFrequency,
            preferred_exercise=request.answers.preferredExercise,
            training_environment=request.answers.trainingEnvironment,
            equipment=request.answers.equipment,
            WORKOUT_PLAN_JSON_FORMAT=WORKOUT_PLAN_JSON_FORMAT
        )

        # Enhance prompt with micro-survey data based on profile level
        enhancement = ""

        if profile_level == "STANDARD" or profile_level == "PREMIUM":
            # Add fitness-specific micro-survey insights
            survey_insights = []
            if micro_surveys.get('fitness'):
                for s in micro_surveys['fitness'][:3]:  # Top 3 fitness insights
                    survey_insights.append(f"- {s['question']}: {s['answer']}")

            if survey_insights:
                enhancement += f"\n\n**Additional User Preferences (from progressive profiling):**\n"
                enhancement += "\n".join(survey_insights)
                enhancement += "\n\n**IMPORTANT**: Incorporate these preferences into exercise selection and programming."

        if profile_level == "PREMIUM":
            # Premium users get comprehensive workout plans
            enhancement += "\n\n**PREMIUM USER - Provide:**"
            enhancement += "\n- Detailed form cues for each exercise"
            enhancement += "\n- Progressive overload recommendations"
            enhancement += "\n- Alternative exercises for each movement"
            enhancement += "\n- Deload week suggestions"
            enhancement += "\n- Mobility work recommendations"

        full_prompt = prompt + enhancement

        workout_plan = await ai_service.generate_plan(
            full_prompt,
            request.ai_provider,
            request.model_name,
            user_id
        )
        
        await db_service.save_workout_plan(
            user_id,
            quiz_result_id,
            workout_plan,
            request.answers.preferredExercise,
            request.answers.exerciseFrequency,
            5
        )
        
        await db_service.update_plan_status(user_id, "workout", "completed")
        logger.info(f"Workout plan generated successfully for user {user_id}")
        
    except Exception as e:
        log_error(e, "Background workout plan generation", user_id)
        await db_service.update_plan_status(user_id, "workout", "failed", str(e))

@app.post("/generate-plans")
async def generate_plans(
    request: GeneratePlansRequest,
    background_tasks: BackgroundTasks
) -> Dict[str, Any]:
    """
    Generate plans with instant response and background AI generation.
    
    Returns calculations immediately and kicks off background tasks for AI plans.
    """
    start_time = time.time()
    log_api_request(
        "/generate-plans",
        request.user_id,
        request.ai_provider,
        request.model_name
    )
    
    try:
        # Calculate nutrition profile immediately
        calc_result = calculate_nutrition_profile(request.answers)
        calculations = Calculations(
            bmi=calc_result["bmi"],
            bmr=calc_result["bmr"],
            tdee=calc_result["tdee"],
            bodyFatPercentage=calc_result["bodyFatPercentage"],
            macros=Macros(**calc_result["macros"]),
            goalCalories=calc_result["goalCalories"],
            goalWeight=calc_result["targetWeight"] or 0.0,
        )
        
        # Update quiz results with calculations FIRST
        await db_service.update_quiz_calculations(
            request.quiz_result_id,
            calculations.model_dump()
        )
        
        # Initialize plan status as generating
        await db_service.initialize_plan_status(
            request.user_id,
            request.quiz_result_id
        )
        
        # Schedule background tasks for AI generation
        # background_tasks.add_task(
        #     _generate_meal_plan_background,
        #     request.user_id,
        #     request.quiz_result_id,
        #     request,
        #     calc_result
        # )
        
        # background_tasks.add_task(
        #     _generate_workout_plan_background,
        #     request.user_id,
        #     request.quiz_result_id,
        #     request,
        #     calc_result
        # )

        # 3️⃣ Fire both AI generation tasks concurrently
        asyncio.create_task(
            _generate_meal_plan_background(request.user_id, request.quiz_result_id, request, calc_result)
        )
        asyncio.create_task(
            _generate_workout_plan_background(request.user_id, request.quiz_result_id, request, calc_result)
        )
        
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-plans", request.user_id, True, duration_ms)
        
        return {
            "success": True,
            "calculations": calculations.model_dump(),
            "macros": calculations.macros.model_dump(),
            "meal_plan_status": "generating",
            "workout_plan_status": "generating",
            "message": "Calculations complete. Plans are being generated in the background."
        }
        
    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/generate-plans", request.user_id, False, duration_ms)
        log_error(e, "Plan generation initialization", request.user_id)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/calculate-nutrition")
async def calculate_nutrition(request: QuickCalculationRequest) -> Dict[str, Any]:
    """
    Lightweight nutrition calculation endpoint for QuickOnboarding.

    Only requires essential fields (weight, height, age, gender, goal, activity).
    Returns calculations immediately without triggering AI generation.
    Perfect for progressive profiling!
    """
    start_time = time.time()
    log_api_request(
        "/calculate-nutrition",
        request.user_id,
        "none",  # No AI provider needed
        "none"   # No model needed
    )

    try:
        # Calculate BMI
        height_m = request.height_cm / 100
        bmi = request.weight_kg / (height_m ** 2)

        # Calculate BMR (Basal Metabolic Rate)
        bmr = calculate_bmr(
            weight_kg=request.weight_kg,
            height_cm=request.height_cm,
            age=request.age,
            gender=request.gender,
            body_fat_pct=None  # Not available in quick onboarding
        )

        # Map activity level to exercise frequency for TDEE calculation
        activity_to_freq = {
            'sedentary': 'Never',
            'lightly_active': '1-2 times/week',
            'moderately_active': '3-4 times/week',
            'very_active': '5-6 times/week',
            'extremely_active': 'Daily',
        }
        exercise_freq = activity_to_freq.get(request.activity_level, '3-4 times/week')

        # Calculate TDEE (Total Daily Energy Expenditure)
        tdee = calculate_tdee(
            bmr=bmr,
            exercise_freq=exercise_freq,
            occupation='Desk job'  # Default for now, can collect later via micro-surveys
        )

        # Calculate goal calories based on user's goal
        goal_calories = calculate_goal_calories(
            tdee=tdee,
            goal=request.goal,
            bmr=bmr,
            gender=request.gender
        )

        # Calculate macros
        macros_result = calculate_macros(
            goal_calories=goal_calories,
            weight_kg=request.weight_kg,
            goal=request.goal,
            dietary_style=request.diet_type or 'balanced'
        )

        # Build response
        calculations = Calculations(
            bmi=round(bmi, 1),
            bmr=round(bmr, 2),
            tdee=round(tdee, 2),
            bodyFatPercentage=None,  # Not calculated in quick onboarding
            macros=Macros(**macros_result),
            goalCalories=goal_calories,
            goalWeight=request.target_weight_kg or request.weight_kg,
        )

        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/calculate-nutrition", request.user_id, True, duration_ms)

        return {
            "success": True,
            "calculations": calculations.model_dump(),
            "macros": calculations.macros.model_dump(),
            "message": "Nutrition calculations complete!"
        }

    except Exception as e:
        duration_ms = (time.time() - start_time) * 1000
        log_api_response("/calculate-nutrition", request.user_id, False, duration_ms)
        log_error(e, "Quick nutrition calculation", request.user_id)
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
