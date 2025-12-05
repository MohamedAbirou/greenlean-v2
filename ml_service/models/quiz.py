# ml_service/models/quiz.py

"""Pydantic models for quiz-related data structures"""

from typing import List, Optional, Union
from pydantic import BaseModel, Field

class Macros(BaseModel):
    protein_g: int
    carbs_g: int
    fat_g: int
    protein_pct_of_calories: int
    carbs_pct_of_calories: int
    fat_pct_of_calories: int

class Calculations(BaseModel):
    bmi: float
    bmr: float
    tdee: float
    macros: Macros
    goalCalories: int
    goalWeight: float

class QuickOnboardingData(BaseModel):
    """
    EXACTLY what QuickOnboarding frontend sends - no more, no less!

    Progressive profiling approach: Start minimal (9 fields), grow over time via micro-surveys.
    All measurements in METRIC (kg, cm) - internal storage format.
    """
    # Core fields (what frontend ACTUALLY sends)
    main_goal: str           # "lose_weight", "gain_muscle", "maintain", "improve_health"
    dietary_style: str       # "balanced", "vegetarian", "vegan", "keto", "paleo", etc.
    exercise_frequency: str  # "3-4 times/week", "1-2 times/week", "Daily", etc.
    target_weight: float     # kg (internal storage)
    activity_level: str      # "sedentary", "lightly_active", "moderately_active", etc.
    weight: float            # kg (internal storage)
    height: float            # cm (internal storage)
    age: int
    gender: str              # "male", "female", "other"

class UnifiedGeneratePlansRequest(BaseModel):
    """Unified request for new /generate-plans endpoint using progressive profiling"""
    user_id: str
    quiz_result_id: str
    quiz_data: QuickOnboardingData
    preferences: Optional[dict] = None  # {'provider': 'openai', 'model': 'gpt-4o-mini'}

    model_config = {
        "protected_namespaces": ()
    }