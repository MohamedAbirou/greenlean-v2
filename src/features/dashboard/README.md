# Dashboard Feature

## Overview

A comprehensive, professional-grade dashboard feature with complete CRUD operations, smart logging, and rich data visualization for the GreenLean fitness app.

## Features

### ✅ Complete Implementation

#### 1. **Four Main Tabs**
- **Overview**: Daily summary, weekly stats, monthly progress, quick actions
- **Nutrition**: Smart meal logging with multiple input methods
- **Workout**: Exercise tracking with PR monitoring
- **Progress**: Advanced charts and analytics with date filtering

#### 2. **Smart Logging Capabilities**

**Nutrition Logging:**
- ✏️ Manual entry
- 🎤 Voice logging
- 📷 Barcode scanner
- 📸 Photo scanning (food estimation)
- 🤖 AI meal plan integration
- 📋 Meal templates
- 🔄 Previous meals
- 🔍 USDA Food API integration

**Workout Logging:**
- ✏️ Manual exercise entry
- 🎤 Voice logging
- 🤖 AI workout plan integration
- 📋 Workout templates
- 🔄 Previous workouts
- 🔍 ExerciseDB API integration (1300+ exercises)
- 📊 Exercise history & PR tracking
- 🎯 Drag & drop exercise ordering

#### 3. **Data Management**
- Complete CRUD operations for all entities
- React Query for efficient caching and state management
- Real-time data updates
- Optimistic UI updates
- Automatic cache invalidation

#### 4. **Progress Tracking**
- Weight history with charts
- Body measurements tracking
- Nutrition trends (7-day & 30-day averages)
- Workout analytics
- Streak tracking (nutrition, workout, weigh-in)
- Personal records monitoring

#### 5. **Advanced Features**
- Date range selector with presets (today, week, month, 3mo, 6mo, year, custom)
- Infinite scroll for large data sets
- Water intake tracking
- Macro targets with progress visualization
- Meal and workout templates
- AI plan integration
- Export capabilities (via database functions)

## Architecture

### Folder Structure
```
src/features/dashboard/
├── api/              # API layer for all database operations
│   ├── nutrition.ts  # Nutrition CRUD + USDA API
│   ├── workout.ts    # Workout CRUD + ExerciseDB API
│   └── progress.ts   # Progress tracking & analytics
├── components/       # React components
│   ├── overview/
│   │   └── OverviewTab.tsx
│   ├── nutrition/
│   │   └── NutritionTab.tsx
│   ├── workout/
│   │   └── WorkoutTab.tsx
│   ├── progress/
│   │   └── ProgressTab.tsx
│   └── shared/
│       ├── DateRangeSelector.tsx
│       ├── StatCard.tsx
│       └── LoadingState.tsx
├── hooks/            # React Query hooks
│   ├── useNutrition.ts
│   ├── useWorkout.ts
│   └── useProgress.ts
├── pages/
│   └── Dashboard.tsx # Main dashboard page with tabs
├── types/
│   └── index.ts      # TypeScript interfaces
├── utils/
│   └── index.ts      # Utility functions
├── index.ts          # Feature exports
└── README.md         # This file
```

### Technology Stack
- **React** - UI components
- **TypeScript** - Type safety
- **React Query** (@tanstack/react-query) - Data fetching & caching
- **Supabase** - Backend & database
- **Tailwind CSS** - Styling
- **USDA Food API** - Nutrition data
- **ExerciseDB API** - Exercise database

## Database Schema

The dashboard integrates with 40+ database tables including:

### Core Tables
- `daily_nutrition_logs` - Daily nutrition summaries
- `meal_items` - Individual food entries
- `meal_templates` - Reusable meal templates
- `workout_sessions` - Workout sessions
- `exercise_sets` - Individual exercise sets
- `workout_templates` - Reusable workout templates
- `weight_history` - Weight tracking
- `body_measurements_simple` - Body measurements
- `user_macro_targets` - Nutrition goals
- `user_streaks` - Streak tracking
- `exercise_personal_records` - PR tracking

### AI Integration Tables
- `ai_meal_plans` - Generated meal plans
- `ai_workout_plans` - Generated workout plans

### Supporting Tables
- `voice_meal_logs` - Voice input logs
- `meal_photo_logs` - Photo scan logs
- `water_intake_logs` - Water tracking
- `nutrition_trends` - Analytics
- `workout_analytics` - Analytics

## Key Functions

### Nutrition
- `getDailyNutritionLog()` - Get nutrition logs by date
- `createMealItem()` - Log a meal item
- `searchUSDAFoods()` - Search USDA database
- `searchFoodByBarcode()` - Barcode lookup
- `getMealTemplates()` - Get user templates
- `getActiveMealPlan()` - Get current AI meal plan

### Workout
- `getWorkoutSessions()` - Get workout sessions
- `createExerciseSet()` - Log an exercise set
- `searchExerciseDB()` - Search exercise database
- `getExerciseHistory()` - Get exercise history
- `getPersonalRecords()` - Get all PRs
- `getWorkoutTemplates()` - Get user templates

### Progress
- `getWeightHistory()` - Weight tracking
- `getDashboardStats()` - Comprehensive stats
- `getProgressSummary()` - Period summary
- `getUserStreaks()` - Streak data

## Usage

### Basic Usage
```typescript
import { Dashboard } from '@/features/dashboard';

function App() {
  return <Dashboard />;
}
```

### Using Individual Tabs
```typescript
import {
  OverviewTab,
  NutritionTab,
  WorkoutTab,
  ProgressTab
} from '@/features/dashboard';
```

### Using Hooks
```typescript
import {
  useDailyNutritionLog,
  useWorkoutSessions,
  useDashboardStats
} from '@/features/dashboard';

function MyComponent() {
  const { data: nutrition } = useDailyNutritionLog('2025-12-11');
  const { data: workouts } = useWorkoutSessions('2025-12-01', '2025-12-11');
  const { data: stats } = useDashboardStats('2025-12-11');
}
```

### Using API Directly
```typescript
import { nutritionApi, workoutApi, progressApi } from '@/features/dashboard';

// Create a meal item
await nutritionApi.createMealItem({
  user_id: 'xxx',
  food_name: 'Chicken Breast',
  calories: 165,
  protein: 31,
  carbs: 0,
  fats: 3.6,
  // ...
});

// Search exercises
const exercises = await workoutApi.searchExerciseDB('bench press');

// Get weight history
const weights = await progressApi.getWeightHistory(userId, startDate, endDate);
```

## Environment Variables

Required for full functionality:

```env
# Supabase (required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Optional APIs
NEXT_PUBLIC_USDA_API_KEY=your_usda_api_key
NEXT_PUBLIC_EXERCISEDB_API_KEY=your_exercisedb_api_key
```

## Performance Optimizations

1. **React Query Caching**
   - 5-minute stale time for dashboard stats
   - 30-minute stale time for meal/workout plans
   - 1-hour stale time for food/exercise searches

2. **Lazy Loading**
   - Components loaded on-demand
   - Large lists use pagination/infinite scroll

3. **Optimistic Updates**
   - Immediate UI updates
   - Background sync with server

4. **Efficient Queries**
   - Only fetch needed data
   - Use database functions for complex operations
   - Proper indexing on date columns

## Future Enhancements

Areas for further development:

1. **Voice & Image Processing**
   - Integrate voice-to-text API
   - Food image recognition ML model
   - Barcode scanning implementation

2. **Advanced Charts**
   - Chart.js or Recharts integration
   - Interactive data visualizations
   - Trend predictions

3. **Social Features**
   - Share meals/workouts
   - Challenge friends
   - Leaderboards

4. **Offline Support**
   - Service workers
   - Local storage sync
   - PWA capabilities

5. **Export & Reporting**
   - PDF reports
   - CSV exports
   - Email summaries

## Testing

Run tests:
```bash
npm test
```

Build for production:
```bash
npm run build
```

## Support

For issues or questions, refer to the main project documentation or create an issue in the repository.

---

**Built with ❤️ for GreenLean by an experienced MyFitnessPal & CalAI engineer**
