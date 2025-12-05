"""
Micro-Survey Service
Progressive Profiling: Threshold-Based Approach

Handles:
- Trigger detection (time/action/context-based)
- Question selection
- Response processing
- Tier threshold detection
- Profile completeness calculation
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import UUID

from services.database import DatabaseService


class MicroSurveyService:
    def __init__(self, db_service: DatabaseService):
        self.db = db_service

    async def check_and_trigger_surveys(self, user_id: str) -> List[Dict[str, Any]]:
        """
        Check all trigger conditions and activate micro-surveys for user.

        Returns list of newly triggered surveys.
        """
        triggered = []

        # Check time-based triggers
        time_triggered = await self._check_time_based_triggers(user_id)
        triggered.extend(time_triggered)

        # Check action-based triggers
        action_triggered = await self._check_action_based_triggers(user_id)
        triggered.extend(action_triggered)

        # Check context-based triggers
        context_triggered = await self._check_context_based_triggers(user_id)
        triggered.extend(context_triggered)

        return triggered

    async def get_next_survey(self, user_id: str) -> Optional[Dict[str, Any]]:
        """
        Get the next micro-survey question for user.

        Returns highest priority triggered but not yet answered question.
        """
        query = """
            SELECT
                q.id, q.question_text, q.question_type, q.field_name,
                q.affects, q.options, t.trigger_type
            FROM micro_survey_questions q
            INNER JOIN micro_survey_triggers t ON q.id = t.question_id
            WHERE t.user_id = $1
              AND t.triggered_at IS NOT NULL
              AND t.shown_at IS NULL
              AND t.dismissed_at IS NULL
              AND q.id NOT IN (
                  SELECT question_id
                  FROM micro_survey_responses
                  WHERE user_id = $1
              )
            ORDER BY q.priority DESC, t.triggered_at ASC
            LIMIT 1
        """

        result = await self.db.pool.fetchrow(query, UUID(user_id))

        if result:
            # Mark as shown
            await self._mark_survey_shown(user_id, str(result['id']))
            return dict(result)

        return None

    async def save_response(
        self,
        user_id: str,
        question_id: str,
        response_value: str,
        response_metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Save user's response to micro-survey and update profile.

        Returns:
            {
                "success": true,
                "threshold_crossed": false,
                "old_tier": "STANDARD",
                "new_tier": "STANDARD",
                "old_completeness": 40.9,
                "new_completeness": 45.5
            }
        """
        # Get question details
        question = await self._get_question(question_id)
        if not question:
            raise ValueError(f"Question {question_id} not found")

        # Calculate old completeness
        old_completeness = await self._calculate_completeness(user_id)
        old_tier = self._determine_tier(old_completeness)

        # Update user profile with response
        await self._update_profile_field(
            user_id,
            question['field_name'],
            response_value,
            question['question_type']
        )

        # Calculate new completeness
        new_completeness = await self._calculate_completeness(user_id)
        new_tier = self._determine_tier(new_completeness)

        # Check if threshold crossed
        threshold_crossed = self._check_threshold_crossed(old_tier, new_tier)

        # Save response
        await self._save_response_record(
            user_id=user_id,
            question_id=question_id,
            response_value=response_value,
            response_metadata=response_metadata,
            field_updated=question['field_name'],
            old_completeness=old_completeness,
            new_completeness=new_completeness,
            old_tier=old_tier,
            new_tier=new_tier,
            threshold_crossed=threshold_crossed
        )

        # If threshold crossed, create tier unlock event
        if threshold_crossed:
            await self._create_tier_unlock_event(
                user_id=user_id,
                old_tier=old_tier,
                new_tier=new_tier,
                completeness=new_completeness,
                affects=question['affects']
            )

        return {
            "success": True,
            "threshold_crossed": threshold_crossed,
            "old_tier": old_tier,
            "new_tier": new_tier,
            "old_completeness": round(old_completeness, 2),
            "new_completeness": round(new_completeness, 2),
            "affects": question['affects']
        }

    async def get_pending_tier_unlocks(self, user_id: str) -> List[Dict[str, Any]]:
        """Get tier unlock events that haven't been acknowledged."""
        query = """
            SELECT *
            FROM tier_unlock_events
            WHERE user_id = $1
              AND regeneration_accepted_at IS NULL
              AND regeneration_dismissed_at IS NULL
            ORDER BY created_at DESC
        """

        rows = await self.db.pool.fetch(query, UUID(user_id))
        return [dict(row) for row in rows]

    async def acknowledge_tier_unlock(
        self,
        user_id: str,
        unlock_event_id: str,
        action: str,  # 'accept' or 'dismiss'
        regenerate_diet: bool = False,
        regenerate_workout: bool = False
    ) -> Dict[str, Any]:
        """
        User acknowledges tier unlock and chooses whether to regenerate plans.

        Args:
            action: 'accept' to regenerate, 'dismiss' to skip
        """
        if action == 'accept':
            query = """
                UPDATE tier_unlock_events
                SET regeneration_accepted_at = NOW(),
                    meal_plan_regenerated = $3,
                    workout_plan_regenerated = $4
                WHERE id = $1 AND user_id = $2
                RETURNING *
            """
            result = await self.db.pool.fetchrow(
                query,
                UUID(unlock_event_id),
                UUID(user_id),
                regenerate_diet,
                regenerate_workout
            )
        else:
            query = """
                UPDATE tier_unlock_events
                SET regeneration_dismissed_at = NOW()
                WHERE id = $1 AND user_id = $2
                RETURNING *
            """
            result = await self.db.pool.fetchrow(
                query,
                UUID(unlock_event_id),
                UUID(user_id)
            )

        return dict(result) if result else {}

    # ============================================================================
    # PRIVATE HELPER METHODS
    # ============================================================================

    async def _check_time_based_triggers(self, user_id: str) -> List[Dict[str, Any]]:
        """Check time-based trigger conditions."""
        # Get user signup date
        signup_query = "SELECT created_at FROM profiles WHERE id = $1"
        profile = await self.db.pool.fetchrow(signup_query, UUID(user_id))

        if not profile:
            return []

        signup_date = profile['created_at']
        days_since_signup = (datetime.now(timezone.utc) - signup_date).days

        # Get time-based questions
        questions_query = """
            SELECT id, trigger_condition
            FROM micro_survey_questions
            WHERE trigger_type = 'time_based' AND is_active = TRUE
        """
        questions = await self.db.pool.fetch(questions_query)

        triggered = []
        for q in questions:
            condition = q['trigger_condition']
            required_days = condition.get('days_after_signup', 999)

            if days_since_signup >= required_days:
                # Check if not already triggered
                exists = await self._trigger_exists(user_id, str(q['id']))
                if not exists:
                    await self._create_trigger(user_id, str(q['id']), 'time_based')
                    triggered.append(dict(q))

        return triggered

    async def _check_action_based_triggers(self, user_id: str) -> List[Dict[str, Any]]:
        """Check action-based trigger conditions."""
        # Get user action counts
        counts = await self._get_user_action_counts(user_id)

        # Get action-based questions
        questions_query = """
            SELECT id, trigger_condition
            FROM micro_survey_questions
            WHERE trigger_type = 'action_based' AND is_active = TRUE
        """
        questions = await self.db.pool.fetch(questions_query)

        triggered = []
        for q in questions:
            condition = q['trigger_condition']

            # Check various action thresholds
            if 'workout_count' in condition and counts.get('workouts', 0) >= condition['workout_count']:
                if not await self._trigger_exists(user_id, str(q['id'])):
                    await self._create_trigger(user_id, str(q['id']), 'action_based')
                    triggered.append(dict(q))

            if 'meal_log_count' in condition and counts.get('meals', 0) >= condition['meal_log_count']:
                if not await self._trigger_exists(user_id, str(q['id'])):
                    await self._create_trigger(user_id, str(q['id']), 'action_based')
                    triggered.append(dict(q))

            if 'plan_view_count' in condition and counts.get('plan_views', 0) >= condition['plan_view_count']:
                if not await self._trigger_exists(user_id, str(q['id'])):
                    await self._create_trigger(user_id, str(q['id']), 'action_based')
                    triggered.append(dict(q))

        return triggered

    async def _check_context_based_triggers(self, user_id: str) -> List[Dict[str, Any]]:
        """Check context-based trigger conditions."""
        # Get user context signals
        context = await self._get_user_context_signals(user_id)

        # Get context-based questions
        questions_query = """
            SELECT id, trigger_condition
            FROM micro_survey_questions
            WHERE trigger_type = 'context_based' AND is_active = TRUE
        """
        questions = await self.db.pool.fetch(questions_query)

        triggered = []
        for q in questions:
            condition = q['trigger_condition']

            if 'meal_disliked_count' in condition and context.get('meal_dislikes', 0) >= condition['meal_disliked_count']:
                if not await self._trigger_exists(user_id, str(q['id'])):
                    await self._create_trigger(user_id, str(q['id']), 'context_based')
                    triggered.append(dict(q))

            if 'workout_skipped_count' in condition and context.get('workout_skips', 0) >= condition['workout_skipped_count']:
                if not await self._trigger_exists(user_id, str(q['id'])):
                    await self._create_trigger(user_id, str(q['id']), 'context_based')
                    triggered.append(dict(q))

            if 'low_energy_count' in condition and context.get('low_energy_days', 0) >= condition['low_energy_count']:
                if not await self._trigger_exists(user_id, str(q['id'])):
                    await self._create_trigger(user_id, str(q['id']), 'context_based')
                    triggered.append(dict(q))

        return triggered

    async def _get_user_action_counts(self, user_id: str) -> Dict[str, int]:
        """Get user's action counts (workouts, meals, plan views)."""
        # This would query your existing tables
        # Simplified implementation:
        return {
            "workouts": 0,  # Query workout_entries table
            "meals": 0,     # Query meal_logs table
            "plan_views": 0  # Query analytics/tracking table
        }

    async def _get_user_context_signals(self, user_id: str) -> Dict[str, int]:
        """Get user's context signals (dislikes, skips, low energy)."""
        # This would analyze user behavior
        # Simplified implementation:
        return {
            "meal_dislikes": 0,     # Count meals marked as disliked
            "workout_skips": 0,      # Count scheduled workouts skipped
            "low_energy_days": 0     # Count days with low energy logged
        }

    async def _calculate_completeness(self, user_id: str) -> float:
        """Calculate profile completeness percentage."""
        query = "SELECT calculate_profile_completeness($1) as completeness"
        result = await self.db.pool.fetchrow(query, UUID(user_id))
        return result['completeness'] if result else 0.0

    def _determine_tier(self, completeness: float) -> str:
        """Determine tier from completeness percentage."""
        if completeness < 30:
            return 'BASIC'
        elif completeness < 70:
            return 'STANDARD'
        else:
            return 'PREMIUM'

    def _check_threshold_crossed(self, old_tier: str, new_tier: str) -> bool:
        """Check if tier threshold was crossed."""
        tiers = ['BASIC', 'STANDARD', 'PREMIUM']
        old_index = tiers.index(old_tier)
        new_index = tiers.index(new_tier)
        return new_index > old_index

    async def _get_question(self, question_id: str) -> Optional[Dict[str, Any]]:
        """Get question details."""
        query = "SELECT * FROM micro_survey_questions WHERE id = $1"
        result = await self.db.pool.fetchrow(query, UUID(question_id))
        return dict(result) if result else None

    async def _update_profile_field(
        self,
        user_id: str,
        field_name: str,
        value: str,
        question_type: str
    ):
        """Update user_profile_extended with response value."""
        # Ensure user_profile_extended record exists
        await self._ensure_profile_extended_exists(user_id)

        # Handle different question types
        if question_type == 'multi_choice':
            # Parse comma-separated values into array
            values = [v.strip() for v in value.split(',')]
            query = f"""
                UPDATE user_profile_extended
                SET {field_name} = $2, updated_at = NOW()
                WHERE user_id = $1
            """
            await self.db.pool.execute(query, UUID(user_id), values)

        elif question_type == 'scale' or question_type == 'numeric':
            # Store as integer
            query = f"""
                UPDATE user_profile_extended
                SET {field_name} = $2::integer, updated_at = NOW()
                WHERE user_id = $1
            """
            await self.db.pool.execute(query, UUID(user_id), int(value))

        elif question_type == 'single_choice':
            # Handle boolean fields
            if field_name == 'gym_access':
                bool_value = value.lower() == 'true'
                query = f"""
                    UPDATE user_profile_extended
                    SET {field_name} = $2, updated_at = NOW()
                    WHERE user_id = $1
                """
                await self.db.pool.execute(query, UUID(user_id), bool_value)
            else:
                # Store as text
                query = f"""
                    UPDATE user_profile_extended
                    SET {field_name} = $2, updated_at = NOW()
                    WHERE user_id = $1
                """
                await self.db.pool.execute(query, UUID(user_id), value)

        else:  # text
            query = f"""
                UPDATE user_profile_extended
                SET {field_name} = ARRAY[$2]::text[], updated_at = NOW()
                WHERE user_id = $1
            """
            await self.db.pool.execute(query, UUID(user_id), value)

    async def _ensure_profile_extended_exists(self, user_id: str):
        """Ensure user_profile_extended record exists for user."""
        query = """
            INSERT INTO user_profile_extended (user_id)
            VALUES ($1)
            ON CONFLICT (user_id) DO NOTHING
        """
        await self.db.pool.execute(query, UUID(user_id))

    async def _save_response_record(self, **kwargs):
        """Save response to micro_survey_responses table."""
        query = """
            INSERT INTO micro_survey_responses (
                user_id, question_id, response_value, response_metadata,
                field_updated, old_completeness, new_completeness,
                old_tier, new_tier, threshold_crossed
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (user_id, question_id)
            DO UPDATE SET
                response_value = $3,
                response_metadata = $4,
                new_completeness = $7,
                new_tier = $9,
                threshold_crossed = $10,
                responded_at = NOW()
        """
        await self.db.pool.execute(
            query,
            UUID(kwargs['user_id']),
            UUID(kwargs['question_id']),
            kwargs['response_value'],
            kwargs.get('response_metadata'),
            kwargs['field_updated'],
            kwargs['old_completeness'],
            kwargs['new_completeness'],
            kwargs['old_tier'],
            kwargs['new_tier'],
            kwargs['threshold_crossed']
        )

    async def _create_tier_unlock_event(self, **kwargs):
        """Create tier unlock event."""
        query = """
            INSERT INTO tier_unlock_events (
                user_id, old_tier, new_tier, completeness_percentage
            ) VALUES ($1, $2, $3, $4)
            RETURNING id
        """
        result = await self.db.pool.fetchrow(
            query,
            UUID(kwargs['user_id']),
            kwargs['old_tier'],
            kwargs['new_tier'],
            kwargs['completeness']
        )
        return str(result['id']) if result else None

    async def _trigger_exists(self, user_id: str, question_id: str) -> bool:
        """Check if trigger already exists."""
        query = """
            SELECT 1 FROM micro_survey_triggers
            WHERE user_id = $1 AND question_id = $2
        """
        result = await self.db.pool.fetchrow(query, UUID(user_id), UUID(question_id))
        return result is not None

    async def _create_trigger(self, user_id: str, question_id: str, trigger_type: str):
        """Create trigger record."""
        query = """
            INSERT INTO micro_survey_triggers (user_id, question_id, trigger_type, triggered_at)
            VALUES ($1, $2, $3, NOW())
        """
        await self.db.pool.execute(query, UUID(user_id), UUID(question_id), trigger_type)

    async def _mark_survey_shown(self, user_id: str, question_id: str):
        """Mark survey as shown to user."""
        query = """
            UPDATE micro_survey_triggers
            SET shown_at = NOW()
            WHERE user_id = $1 AND question_id = $2
        """
        await self.db.pool.execute(query, UUID(user_id), UUID(question_id))
