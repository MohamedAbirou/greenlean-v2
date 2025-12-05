"""
Profile Completeness Service
Tracks user profile completion and determines personalization level
Ported from frontend TypeScript implementation
"""

from typing import List, Dict, Any, Optional, Literal
from dataclasses import dataclass

from .prompt_builder import UserProfileData, PersonalizationLevel


FieldCategory = Literal['basic', 'nutrition', 'fitness', 'health', 'lifestyle']
FieldPriority = Literal['high', 'medium', 'low']


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
    next_suggested_questions: List[str]


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

        # Get next suggested questions based on priority
        next_suggestions = cls._get_next_suggestions(missing_fields)

        return CompletenessReport(
            completeness=round(completeness, 1),
            personalization_level=personalization_level,
            total_fields=len(fields),
            completed_fields=len(completed_fields),
            missing_fields=missing_fields,
            next_suggested_questions=next_suggestions
        )

    @classmethod
    def _is_field_complete(cls, data: UserProfileData, field_key: str) -> bool:
        """Check if a field is completed in the profile"""
        value = getattr(data, field_key, None)
        return value is not None and value != '' and value != []

    @classmethod
    def _determine_level(cls, completeness: float) -> PersonalizationLevel:
        """Determine personalization level from completeness percentage"""
        if completeness < 30:
            return 'BASIC'
        if completeness < 70:
            return 'STANDARD'
        return 'PREMIUM'

    @classmethod
    def _get_profile_fields(cls) -> List[Dict[str, Any]]:
        """Get all profile fields with metadata"""
        return [
            # BASIC - Core Info (High Priority)
            {'key': 'main_goal', 'category': 'basic', 'label': "What's your main goal?", 'priority': 'high'},
            {'key': 'current_weight', 'category': 'basic', 'label': 'Current weight', 'priority': 'high'},
            {'key': 'target_weight', 'category': 'basic', 'label': 'Target weight', 'priority': 'high'},
            {'key': 'age', 'category': 'basic', 'label': 'Your age', 'priority': 'high'},
            {'key': 'gender', 'category': 'basic', 'label': 'Your gender', 'priority': 'high'},
            {'key': 'height', 'category': 'basic', 'label': 'Your height', 'priority': 'high'},

            # STANDARD - Nutrition Preferences (High Priority)
            {'key': 'dietary_style', 'category': 'nutrition', 'label': 'Dietary style preference', 'priority': 'high'},
            {'key': 'food_allergies', 'category': 'nutrition', 'label': 'Food allergies or intolerances', 'priority': 'high'},
            {'key': 'cooking_skill', 'category': 'nutrition', 'label': 'Cooking skill level', 'priority': 'medium'},
            {'key': 'cooking_time', 'category': 'nutrition', 'label': 'Time available for cooking', 'priority': 'medium'},
            {'key': 'grocery_budget', 'category': 'nutrition', 'label': 'Weekly grocery budget', 'priority': 'medium'},
            {'key': 'meals_per_day', 'category': 'nutrition', 'label': 'Preferred meals per day', 'priority': 'medium'},

            # STANDARD - Fitness Preferences (High Priority)
            {'key': 'activity_level', 'category': 'fitness', 'label': 'Activity level', 'priority': 'high'},
            {'key': 'workout_frequency', 'category': 'fitness', 'label': 'Workout frequency (days/week)', 'priority': 'high'},
            {'key': 'training_environment', 'category': 'fitness', 'label': 'Where do you train?', 'priority': 'high'},
            {'key': 'equipment', 'category': 'fitness', 'label': 'Available equipment', 'priority': 'medium'},
            {'key': 'injuries', 'category': 'fitness', 'label': 'Injuries or limitations', 'priority': 'high'},

            # PREMIUM - Health & Lifestyle (Medium/Low Priority)
            {'key': 'health_conditions', 'category': 'health', 'label': 'Health conditions', 'priority': 'medium'},
            {'key': 'medications', 'category': 'health', 'label': 'Current medications', 'priority': 'medium'},
            {'key': 'sleep_quality', 'category': 'lifestyle', 'label': 'Sleep quality (1-10)', 'priority': 'medium'},
            {'key': 'stress_level', 'category': 'lifestyle', 'label': 'Stress level (1-10)', 'priority': 'medium'},
            {'key': 'country', 'category': 'lifestyle', 'label': 'Country/region', 'priority': 'low'},
            {'key': 'disliked_foods', 'category': 'nutrition', 'label': 'Foods you dislike', 'priority': 'low'},
            {'key': 'meal_prep_preference', 'category': 'nutrition', 'label': 'Meal prep preference', 'priority': 'low'},
            {'key': 'water_intake_goal', 'category': 'lifestyle', 'label': 'Water intake goal', 'priority': 'low'},
        ]

    @classmethod
    def _get_next_suggestions(cls, missing_fields: List[MissingField], limit: int = 5) -> List[str]:
        """Get next suggested questions based on priority"""
        # Sort by priority (high > medium > low)
        priority_order = {'high': 0, 'medium': 1, 'low': 2}

        sorted_fields = sorted(
            missing_fields,
            key=lambda f: priority_order[f.priority]
        )

        return [field.label for field in sorted_fields[:limit]]

    @classmethod
    def get_next_micro_survey(cls, user_data: UserProfileData) -> Optional[Dict[str, Any]]:
        """
        Get next micro-survey to show user based on profile gaps

        Args:
            user_data: User profile data

        Returns:
            Micro-survey dict or None if no gaps
        """
        report = cls.analyze(user_data)

        # Find highest priority missing field
        high_priority_missing = [
            f for f in report.missing_fields
            if f.priority == 'high'
        ]

        if not high_priority_missing:
            return None

        # Prioritize nutrition and fitness over lifestyle
        category_order = {'nutrition': 0, 'fitness': 1, 'health': 2, 'basic': 3, 'lifestyle': 4}

        next_field = sorted(
            high_priority_missing,
            key=lambda f: category_order.get(f.category, 999)
        )[0]

        return cls._create_micro_survey(next_field)

    @classmethod
    def _create_micro_survey(cls, field: MissingField) -> Optional[Dict[str, Any]]:
        """Create micro-survey from missing field"""
        surveys = {
            'dietary_style': {
                'id': 'dietary_style',
                'question': '🥗 What\'s your preferred dietary style?',
                'options': ['Balanced', 'Keto', 'Vegetarian', 'Vegan', 'Paleo', 'Mediterranean', 'Other'],
                'category': 'nutrition',
            },
            'food_allergies': {
                'id': 'food_allergies',
                'question': '⚠️ Any food allergies or intolerances?',
                'options': ['None', 'Dairy', 'Gluten', 'Nuts', 'Shellfish', 'Eggs', 'Soy', 'Other'],
                'category': 'nutrition',
            },
            'cooking_skill': {
                'id': 'cooking_skill',
                'question': '👨‍🍳 How would you rate your cooking skills?',
                'options': ['Beginner', 'Intermediate', 'Advanced'],
                'category': 'nutrition',
            },
            'cooking_time': {
                'id': 'cooking_time',
                'question': '⏰ How much time can you spend cooking per meal?',
                'options': ['< 15 min', '15-30 min', '30-45 min', '45-60 min', '60+ min'],
                'category': 'nutrition',
            },
            'grocery_budget': {
                'id': 'grocery_budget',
                'question': '💰 What\'s your weekly grocery budget?',
                'options': ['< $50', '$50-100', '$100-150', '$150+'],
                'category': 'nutrition',
            },
            'training_environment': {
                'id': 'training_environment',
                'question': '🏋️ Where do you prefer to train?',
                'options': ['Gym', 'Home', 'Outdoor', 'Mixed'],
                'category': 'fitness',
            },
            'injuries': {
                'id': 'injuries',
                'question': '🤕 Any injuries or physical limitations?',
                'options': ['None', 'Knee issues', 'Back pain', 'Shoulder problems', 'Other'],
                'category': 'fitness',
            },
            'health_conditions': {
                'id': 'health_conditions',
                'question': '🏥 Any health conditions we should know about?',
                'options': ['None', 'Diabetes', 'High blood pressure', 'High cholesterol', 'IBS', 'PCOS', 'Thyroid', 'Other'],
                'category': 'health',
            },
        }

        return surveys.get(field.field)
