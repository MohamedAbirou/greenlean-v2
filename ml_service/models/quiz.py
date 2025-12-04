# ml_service/models/quiz.py

"""Pydantic models for quiz-related data structures"""

from typing import List, Optional, Union
from pydantic import BaseModel, Field


class WeightMeasurement(BaseModel):
    kg: Optional[Union[str, float]] = None
    lbs: Optional[Union[str, float]] = None


class LengthMeasurement(BaseModel):
    cm: Optional[Union[str, float]] = None
    ft: Optional[Union[str, float]] = None
    inch: Optional[Union[str, float]] = None


class QuizAnswers(BaseModel):
    age: Union[str, int]
    gender: str
    country: Optional[str] = None

    height: LengthMeasurement
    currentWeight: WeightMeasurement
    targetWeight: WeightMeasurement
    neck: Optional[LengthMeasurement] = None
    waist: Optional[LengthMeasurement] = None
    hip: Optional[LengthMeasurement] = None

    mainGoal: str
    secondaryGoals: Optional[List[str]] = None
    timeFrame: str

    lifestyle: str
    activity_level: Optional[str] = None
    groceryBudget: str
    dietaryStyle: str
    mealsPerDay: str
    motivationLevel: int = Field(ge=1, le=10)
    stressLevel: int = Field(ge=1, le=10)
    sleepQuality: str

    healthConditions: Optional[List[str]] = None
    healthConditions_other: Optional[str] = None
    medications: Optional[str] = None
    injuries: Optional[str] = None
    foodAllergies: Optional[str] = None

    exerciseFrequency: str
    preferredExercise: List[str]
    trainingEnvironment: List[str]
    equipment: Optional[List[str]] = None

    dislikedFoods: Optional[str] = None
    cookingSkill: str
    cookingTime: str

    challenges: Optional[List[str]] = None


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


class GeneratePlansRequest(BaseModel):
    user_id: str
    quiz_result_id: str
    answers: QuizAnswers
    ai_provider: str = "openai"
    model_name: str = "gpt-4o-mini"

    model_config = {
        "protected_namespaces": ()
    }


class UnifiedGeneratePlansRequest(BaseModel):
    """Unified request for new /generate-plans endpoint using progressive profiling"""
    user_id: str
    quiz_result_id: str
    quiz_data: QuickOnboardingData
    preferences: Optional[dict] = None  # {'provider': 'openai', 'model': 'gpt-4o-mini'}

    model_config = {
        "protected_namespaces": ()
    }


class PlanStatus(BaseModel):
    status: str
    message: Optional[str] = None
    error: Optional[str] = None


class QuickCalculationRequest(BaseModel):
    """Lightweight model for quick nutrition calculations (no 25+ quiz fields!)"""
    user_id: str

    # Essential fields for BMR calculation
    weight_kg: float
    height_cm: float
    age: int
    gender: str  # 'male', 'female', or 'other'

    # Goal and activity for TDEE calculation
    goal: str  # 'lose_weight', 'gain_muscle', 'maintain', 'improve_health'
    activity_level: str  # 'sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'

    # Optional fields
    target_weight_kg: Optional[float] = None
    diet_type: Optional[str] = 'balanced'  # For macro distribution

    model_config = {
        "protected_namespaces": ()
    }