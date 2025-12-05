"""
Unit System Detection & Conversion Utilities

Handles automatic detection of user's preferred unit system (metric vs imperial)
and provides conversion utilities for weight and height measurements.

Features:
- Browser locale-based detection
- Country-to-unit-system mapping
- Weight conversions (kg ↔ lbs)
- Height conversions (cm ↔ ft/in)
- Bidirectional parsing and formatting

Author: GreenLean AI Team
Date: 2025-12-04
"""

from typing import Tuple, Literal, Optional, Dict, Any
import re

UnitSystem = Literal['metric', 'imperial']

# Countries using imperial system (only 3 countries in the world!)
IMPERIAL_COUNTRIES = {
    'US',  # United States
    'LR',  # Liberia
    'MM',  # Myanmar (Burma)
}

# Additional territories/regions often using imperial
IMPERIAL_REGIONS = {
    'US', 'PR', 'VI', 'GU', 'AS', 'MP',  # US territories
    'LR',  # Liberia
    'MM',  # Myanmar
}


def detect_unit_system_from_country(country_code: str) -> UnitSystem:
    """
    Detect appropriate unit system from country code.

    Args:
        country_code: ISO 3166-1 alpha-2 country code (e.g., 'US', 'GB', 'FR')

    Returns:
        'imperial' if country uses imperial system, 'metric' otherwise

    Examples:
        >>> detect_unit_system_from_country('US')
        'imperial'
        >>> detect_unit_system_from_country('GB')
        'metric'
        >>> detect_unit_system_from_country('FR')
        'metric'
    """
    if not country_code:
        return 'metric'  # Default to metric (used by 95% of world)

    return 'imperial' if country_code.upper() in IMPERIAL_COUNTRIES else 'metric'


def detect_unit_system_from_locale(locale: str) -> UnitSystem:
    """
    Detect unit system from browser locale string.

    Args:
        locale: Browser locale (e.g., 'en-US', 'en-GB', 'fr-FR')

    Returns:
        'imperial' if locale suggests imperial, 'metric' otherwise

    Examples:
        >>> detect_unit_system_from_locale('en-US')
        'imperial'
        >>> detect_unit_system_from_locale('en-GB')
        'metric'
        >>> detect_unit_system_from_locale('fr-FR')
        'metric'
    """
    if not locale:
        return 'metric'

    # Extract country code from locale (e.g., 'en-US' -> 'US')
    parts = locale.split('-')
    if len(parts) >= 2:
        country_code = parts[-1].upper()
        return detect_unit_system_from_country(country_code)

    return 'metric'


# ============================================
# WEIGHT CONVERSIONS
# ============================================

def kg_to_lbs(kg: float) -> float:
    """
    Convert kilograms to pounds.

    Args:
        kg: Weight in kilograms

    Returns:
        Weight in pounds (rounded to 1 decimal)

    Examples:
        >>> kg_to_lbs(70.0)
        154.3
        >>> kg_to_lbs(100.0)
        220.5
    """
    return round(kg * 2.20462, 1)


def lbs_to_kg(lbs: float) -> float:
    """
    Convert pounds to kilograms.

    Args:
        lbs: Weight in pounds

    Returns:
        Weight in kilograms (rounded to 1 decimal)

    Examples:
        >>> lbs_to_kg(154.3)
        70.0
        >>> lbs_to_kg(220.5)
        100.0
    """
    return round(lbs / 2.20462, 1)


def format_weight(value_kg: float, unit_system: UnitSystem) -> Tuple[float, str]:
    """
    Format weight value based on unit system.

    Args:
        value_kg: Weight in kilograms (internal storage format)
        unit_system: Target unit system

    Returns:
        Tuple of (converted_value, unit_label)

    Examples:
        >>> format_weight(70.0, 'metric')
        (70.0, 'kg')
        >>> format_weight(70.0, 'imperial')
        (154.3, 'lbs')
    """
    if unit_system == 'imperial':
        return kg_to_lbs(value_kg), 'lbs'
    return round(value_kg, 1), 'kg'


def parse_weight(value: float, unit: str) -> float:
    """
    Parse weight value to kilograms (internal storage format).

    Args:
        value: Weight value
        unit: Unit ('kg', 'lbs', 'lb', 'pounds')

    Returns:
        Weight in kilograms

    Examples:
        >>> parse_weight(70.0, 'kg')
        70.0
        >>> parse_weight(154.3, 'lbs')
        70.0
    """
    unit_lower = unit.lower().strip()

    if unit_lower in ['lbs', 'lb', 'pounds', 'pound']:
        return lbs_to_kg(value)

    return value  # Assume kg


# ============================================
# HEIGHT CONVERSIONS
# ============================================

def cm_to_feet_inches(cm: float) -> Tuple[int, int]:
    """
    Convert centimeters to feet and inches.

    Args:
        cm: Height in centimeters

    Returns:
        Tuple of (feet, inches)

    Examples:
        >>> cm_to_feet_inches(170.0)
        (5, 7)
        >>> cm_to_feet_inches(183.0)
        (6, 0)
    """
    total_inches = cm / 2.54
    feet = int(total_inches // 12)
    inches = round(total_inches % 12)

    # Handle edge case: 5'12" should become 6'0"
    if inches == 12:
        feet += 1
        inches = 0

    return feet, inches


def feet_inches_to_cm(feet: int, inches: float) -> float:
    """
    Convert feet and inches to centimeters.

    Args:
        feet: Height in feet
        inches: Additional inches

    Returns:
        Height in centimeters (rounded to 1 decimal)

    Examples:
        >>> feet_inches_to_cm(5, 7)
        170.2
        >>> feet_inches_to_cm(6, 0)
        182.9
    """
    total_inches = (feet * 12) + inches
    return round(total_inches * 2.54, 1)


def format_height(value_cm: float, unit_system: UnitSystem) -> Tuple[Any, str]:
    """
    Format height value based on unit system.

    Args:
        value_cm: Height in centimeters (internal storage format)
        unit_system: Target unit system

    Returns:
        Tuple of (converted_value, unit_label)
        - For metric: (170.0, 'cm')
        - For imperial: ((5, 7), 'ft/in') where (5, 7) means 5 feet 7 inches

    Examples:
        >>> format_height(170.0, 'metric')
        (170.0, 'cm')
        >>> format_height(170.0, 'imperial')
        ((5, 7), 'ft/in')
    """
    if unit_system == 'imperial':
        feet, inches = cm_to_feet_inches(value_cm)
        return (feet, inches), 'ft/in'
    return round(value_cm, 1), 'cm'


def parse_height(value: Any, unit: str) -> float:
    """
    Parse height value to centimeters (internal storage format).

    Supports multiple input formats:
    - Single value in cm: parse_height(170, 'cm') -> 170.0
    - Single value in inches: parse_height(67, 'in') -> 170.2
    - Feet and inches as tuple: parse_height((5, 7), 'ft/in') -> 170.2
    - Feet and inches as dict: parse_height({'feet': 5, 'inches': 7}, 'ft/in') -> 170.2

    Args:
        value: Height value (float, tuple, or dict)
        unit: Unit ('cm', 'in', 'ft/in', 'ft')

    Returns:
        Height in centimeters

    Examples:
        >>> parse_height(170.0, 'cm')
        170.0
        >>> parse_height(67, 'in')
        170.2
        >>> parse_height((5, 7), 'ft/in')
        170.2
        >>> parse_height({'feet': 5, 'inches': 7}, 'ft/in')
        170.2
    """
    unit_lower = unit.lower().strip()

    # Centimeters - direct passthrough
    if unit_lower == 'cm':
        return float(value)

    # Inches only
    if unit_lower in ['in', 'inch', 'inches']:
        return round(float(value) * 2.54, 1)

    # Feet and inches (multiple formats)
    if unit_lower in ['ft/in', 'ft', 'feet']:
        # Tuple format: (5, 7)
        if isinstance(value, (tuple, list)) and len(value) == 2:
            feet, inches = value
            return feet_inches_to_cm(int(feet), float(inches))

        # Dict format: {'feet': 5, 'inches': 7}
        if isinstance(value, dict):
            feet = value.get('feet', 0)
            inches = value.get('inches', 0)
            return feet_inches_to_cm(int(feet), float(inches))

        # Single value in feet (e.g., 5.58 feet)
        if isinstance(value, (int, float)):
            feet = int(value)
            inches = (value - feet) * 12
            return feet_inches_to_cm(feet, inches)

    # Default: assume cm
    return float(value)


# ============================================
# PARSING FROM STRINGS (for form inputs)
# ============================================

def parse_weight_string(input_str: str) -> Tuple[float, str]:
    """
    Parse weight from user input string.

    Supports formats:
    - "70 kg"
    - "154.3 lbs"
    - "70kg"
    - "154.3"

    Args:
        input_str: Weight input string

    Returns:
        Tuple of (value, detected_unit)

    Examples:
        >>> parse_weight_string("70 kg")
        (70.0, 'kg')
        >>> parse_weight_string("154.3 lbs")
        (154.3, 'lbs')
        >>> parse_weight_string("70")
        (70.0, 'kg')
    """
    input_str = input_str.strip().lower()

    # Extract number
    number_match = re.search(r'(\d+\.?\d*)', input_str)
    if not number_match:
        raise ValueError(f"No valid number found in: {input_str}")

    value = float(number_match.group(1))

    # Detect unit
    if 'lb' in input_str or 'pound' in input_str:
        unit = 'lbs'
    elif 'kg' in input_str or 'kilo' in input_str:
        unit = 'kg'
    else:
        # Default based on typical ranges
        # Weight > 200 is likely lbs, < 200 could be either
        unit = 'lbs' if value > 200 else 'kg'

    return value, unit


def parse_height_string(input_str: str) -> Tuple[float, str]:
    """
    Parse height from user input string.

    Supports formats:
    - "170 cm"
    - "5'7\""
    - "5 feet 7 inches"
    - "5ft 7in"
    - "170"

    Args:
        input_str: Height input string

    Returns:
        Tuple of (value_in_cm, detected_unit)

    Examples:
        >>> parse_height_string("170 cm")
        (170.0, 'cm')
        >>> parse_height_string("5'7\\"")
        (170.2, 'ft/in')
        >>> parse_height_string("5 feet 7 inches")
        (170.2, 'ft/in')
    """
    input_str = input_str.strip().lower()

    # Check for feet/inches format (e.g., "5'7\"", "5ft 7in", "5 feet 7 inches")
    feet_inches_pattern = r"(\d+)['\s]*(?:feet|ft)?['\s]*(\d+)?['\"]?(?:\s*(?:inches|in))?"
    match = re.search(feet_inches_pattern, input_str)

    if match:
        feet = int(match.group(1))
        inches = int(match.group(2)) if match.group(2) else 0
        cm = feet_inches_to_cm(feet, inches)
        return cm, 'ft/in'

    # Check for cm format
    if 'cm' in input_str or 'centimeter' in input_str:
        number_match = re.search(r'(\d+\.?\d*)', input_str)
        if number_match:
            return float(number_match.group(1)), 'cm'

    # Check for inches only
    if 'in' in input_str and 'ft' not in input_str:
        number_match = re.search(r'(\d+\.?\d*)', input_str)
        if number_match:
            inches = float(number_match.group(1))
            cm = round(inches * 2.54, 1)
            return cm, 'in'

    # Default: assume cm
    number_match = re.search(r'(\d+\.?\d*)', input_str)
    if number_match:
        value = float(number_match.group(1))
        # If value is small (< 10), likely feet; if large (< 250), likely cm; if > 250, likely in
        if value < 10:
            # Likely feet, convert to cm
            return feet_inches_to_cm(int(value), 0), 'ft/in'
        elif value > 250:
            # Likely inches, convert to cm
            return round(value * 2.54, 1), 'in'
        else:
            # Likely cm
            return value, 'cm'

    raise ValueError(f"Could not parse height from: {input_str}")


# ============================================
# FRONTEND HELPER (for API responses)
# ============================================

def format_measurement_for_frontend(
    value_kg_or_cm: float,
    measurement_type: Literal['weight', 'height'],
    unit_system: UnitSystem
) -> Dict[str, Any]:
    """
    Format measurement for frontend display with all conversion info.

    Args:
        value_kg_or_cm: Value in internal storage format (kg for weight, cm for height)
        measurement_type: Type of measurement
        unit_system: Target unit system

    Returns:
        Dict with display values and conversion info

    Examples:
        >>> format_measurement_for_frontend(70.0, 'weight', 'imperial')
        {
            'value': 154.3,
            'unit': 'lbs',
            'display': '154.3 lbs',
            'internal_value': 70.0,
            'internal_unit': 'kg'
        }

        >>> format_measurement_for_frontend(170.0, 'height', 'imperial')
        {
            'value': {'feet': 5, 'inches': 7},
            'unit': 'ft/in',
            'display': '5\\'7"',
            'internal_value': 170.0,
            'internal_unit': 'cm'
        }
    """
    if measurement_type == 'weight':
        converted_value, unit = format_weight(value_kg_or_cm, unit_system)
        display = f"{converted_value} {unit}"

        return {
            'value': converted_value,
            'unit': unit,
            'display': display,
            'internal_value': value_kg_or_cm,
            'internal_unit': 'kg'
        }

    else:  # height
        converted_value, unit = format_height(value_kg_or_cm, unit_system)

        if unit == 'ft/in':
            feet, inches = converted_value
            display = f"{feet}'{inches}\""
            return {
                'value': {'feet': feet, 'inches': inches},
                'unit': unit,
                'display': display,
                'internal_value': value_kg_or_cm,
                'internal_unit': 'cm'
            }
        else:
            display = f"{converted_value} {unit}"
            return {
                'value': converted_value,
                'unit': unit,
                'display': display,
                'internal_value': value_kg_or_cm,
                'internal_unit': 'cm'
            }


# ============================================
# VALIDATION
# ============================================

def validate_weight(value_kg: float) -> bool:
    """
    Validate weight value is within reasonable bounds.

    Args:
        value_kg: Weight in kilograms

    Returns:
        True if valid, False otherwise

    Valid range: 20-300 kg (44-661 lbs)
    """
    return 20 <= value_kg <= 300


def validate_height(value_cm: float) -> bool:
    """
    Validate height value is within reasonable bounds.

    Args:
        value_cm: Height in centimeters

    Returns:
        True if valid, False otherwise

    Valid range: 100-250 cm (3'3" - 8'2")
    """
    return 100 <= value_cm <= 250
