"""
Profile Completeness Service
Tracks user profile completion and determines personalization level
Ported from frontend TypeScript implementation
"""

from typing import List, Dict, Any, Optional, Literal
from dataclasses import dataclass

from .prompt_builder import PersonalizationLevel


FieldCategory = Literal['basic', 'nutrition', 'fitness', 'health', 'lifestyle']
FieldPriority = Literal['high', 'medium', 'low']

@dataclass
class UserProfileData:
    """User profile data for profile completeles"""
    main_goal: str
    current_weight: float
    target_weight: Optional[float] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    dietary_style: Optional[str] = None
    activity_level: Optional[str] = None  # sedentary, lightly_active, etc.
    exercise_frequency: Optional[str] = None  # "3-4 times/week"

    cooking_skill: Optional[str] = None
    cooking_time: Optional[str] = None
    grocery_budget: Optional[str] = None
    meals_per_day: Optional[int] = None
    food_allergies: Optional[List[str]] = None
    disliked_foods: Optional[List[str]] = None
    meal_prep_preference: Optional[str] = None
    gym_access: Optional[bool] = None
    equipement_available: Optional[List[str]] = None
    workout_location_preference: Optional[str] = None
    injuries_limitations: Optional[List[str]] = None
    fitness_experience: Optional[str] = None
    health_conditions: Optional[List[str]] = None
    medications: Optional[List[str]] = None
    sleep_quality: Optional[int] = None
    stress_level: Optional[int] = None
    dietary_restrictions: Optional[List[str]] = None

@dataclass
class MissingField:
    """Information about a missing profile field"""
    category: FieldCategory
    field: str
    label: str
    priority: FieldPriority


@dataclass
class CompletenessReport:
    """Report on profile completeness and personalization level"""
    completeness: float
    personalization_level: PersonalizationLevel
    total_fields: int
    completed_fields: int
    missing_fields: List[MissingField]


class ProfileCompletenessService:
    """Analyze user profile and determine completeness/personalization level"""

    @classmethod
    def analyze(cls, user_data: UserProfileData) -> CompletenessReport:
        """
        Analyze user profile and return completeness report

        Args:
            user_data: User profile data to analyze

        Returns:
            CompletenessReport with detailed analysis
        """
        fields = cls._get_profile_fields()

        # Check which fields are completed
        completed_fields = [
            field for field in fields
            if cls._is_field_complete(user_data, field['key'])
        ]

        # Check which fields are missing
        missing_fields = [
            MissingField(
                category=field['category'],
                field=field['key'],
                label=field['label'],
                priority=field['priority']
            )
            for field in fields
            if not cls._is_field_complete(user_data, field['key'])
        ]

        completeness = (len(completed_fields) / len(fields)) * 100
        personalization_level = cls._determine_level(completeness)

        return CompletenessReport(
            completeness=round(completeness, 1),
            personalization_level=personalization_level,
            total_fields=len(fields),
            completed_fields=len(completed_fields),
            missing_fields=missing_fields
        )

    @classmethod
    def _is_field_complete(cls, data: UserProfileData, field_key: str) -> bool:
        """Check if a field is completed in the profile"""
        value = getattr(data, field_key, None)
        return value is not None and value != '' and value != []

    @classmethod
    def _determine_level(cls, completeness: float) -> PersonalizationLevel:
        """Determine personalization level from completeness percentage"""
        print("COMPLETENESS: ", completeness, completeness >= 70)
        if completeness >= 70:
            return 'PREMIUM'
        return 'BASIC'

    @classmethod
    def _get_profile_fields(cls) -> List[Dict[str, Any]]:
        """Get all profile fields with metadata"""
        return [
            {'key': 'main_goal', 'category': 'basic', 'label': "What's your main goal?", 'priority': 'high'},
            {'key': 'current_weight', 'category': 'basic', 'label': 'Current weight', 'priority': 'high'},
            {'key': 'target_weight', 'category': 'basic', 'label': 'Target weight', 'priority': 'high'},
            {'key': 'age', 'category': 'basic', 'label': 'Your age', 'priority': 'high'},
            {'key': 'gender', 'category': 'basic', 'label': 'Your gender', 'priority': 'high'},
            {'key': 'height', 'category': 'basic', 'label': 'Your height', 'priority': 'high'},

            {'key': 'dietary_style', 'category': 'nutrition', 'label': 'Dietary style preference', 'priority': 'high'},
            {'key': 'food_allergies', 'category': 'nutrition', 'label': 'Food allergies or intolerances', 'priority': 'high'},
            {'key': 'cooking_skill', 'category': 'nutrition', 'label': 'Cooking skill level', 'priority': 'medium'},
            {'key': 'cooking_time', 'category': 'nutrition', 'label': 'Time available for cooking', 'priority': 'medium'},
            {'key': 'grocery_budget', 'category': 'nutrition', 'label': 'Weekly grocery budget', 'priority': 'medium'},
            {'key': 'meals_per_day', 'category': 'nutrition', 'label': 'Preferred meals per day', 'priority': 'medium'},
            {'key': 'food_allergies', 'category': 'nutrition', 'label': 'Food Allergies', 'priority': 'medium'},
            {'key': 'disliked_foods', 'category': 'nutrition', 'label': 'Disliked Foods', 'priority': 'medium'},
            {'key': 'meal_prep_preference', 'category': 'nutrition', 'label': 'Meal Prep Preference', 'priority': 'medium'},
            {'key': 'dietary_restrictions', 'category': 'nutrition', 'label': 'Dietary Restrictions', 'priority': 'medium'},

            {'key': 'activity_level', 'category': 'fitness', 'label': 'Activity level', 'priority': 'high'},
            {'key': 'exercise_frequency', 'category': 'fitness', 'label': 'Workout frequency (days/week)', 'priority': 'high'},
            {'key': 'gym_access', 'category': 'fitness', 'label': 'Gym Access', 'priority': 'high'},
            {'key': 'equipement_available', 'category': 'fitness', 'label': 'Available Equipement', 'priority': 'high'},
            {'key': 'workout_location_preference', 'category': 'fitness', 'label': 'Where do you train?', 'priority': 'high'},
            {'key': 'injuries_limitations', 'category': 'fitness', 'label': 'Injuries or limitations', 'priority': 'medium'},
            {'key': 'fitness_experience', 'category': 'fitness', 'label': 'Fitness Experience', 'priority': 'high'},
            {'key': 'health_conditions', 'category': 'health', 'label': 'Health conditions', 'priority': 'medium'},
            {'key': 'medications', 'category': 'health', 'label': 'Current medications', 'priority': 'medium'},
            {'key': 'sleep_quality', 'category': 'lifestyle', 'label': 'Sleep quality (1-10)', 'priority': 'medium'},
            {'key': 'stress_level', 'category': 'lifestyle', 'label': 'Stress level (1-10)', 'priority': 'medium'},
        ]