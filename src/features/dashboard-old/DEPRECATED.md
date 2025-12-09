# ⚠️ DEPRECATED - DO NOT USE

This entire `dashboard-old` folder is **DEPRECATED** and should not be used.

## Reason for Deprecation

This dashboard has been completely replaced by the new production-ready dashboard located at:
`src/features/dashboard/`

## New Dashboard Features

The new dashboard includes:

- **Time-proof architecture**: View data from any historical period (yesterday, last week, last month, last year)
- **Scaling-proof pagination**: Handles millions of records with proper pagination and infinite scroll
- **AI-powered tracking**: Integrated with AI-generated meal and workout plans
- **Complete tracking system**: Meals, workouts, progress, and journey timeline
- **MyFitnessPal/CalAI-level UX**: Professional-grade user experience
- **Real-time updates**: Live data updates with Supabase
- **Photo scanning**: AI-powered meal photo analysis
- **Voice logging**: Natural language meal logging
- **Progress charts**: Interactive charts for weight, nutrition, and workout trends
- **Journey timeline**: Complete fitness journey visualization with milestones

## Migration Notes

If you need to migrate any functionality from the old dashboard:

1. Check if the feature already exists in the new dashboard (it probably does)
2. Review the new implementation patterns in `src/features/dashboard/`
3. Use the new service layer for data access:
   - `mealTrackingService` for nutrition
   - `workoutTrackingService` for workouts
   - `progressTrackingService` for progress tracking

## When to Delete

This folder should be deleted once:
- All features have been verified to work in the new dashboard
- All team members are aware of the migration
- No active development is referencing this code

---

**Last Updated**: 2025-12-09
**Replaced By**: `src/features/dashboard/`
