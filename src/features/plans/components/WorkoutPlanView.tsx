/**
 * WorkoutPlanView Component - Adaptive UI Based on Progressive Profiling Tier
 * Renders workout plan with tier-appropriate features:
 * - BASIC: Simple weekly plan, basic summary, generic tips
 * - PREMIUM: + periodization plan, injury prevention, nutrition timing, lifestyle integration
 */

import { Card } from '@/shared/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Award,
  Calendar,
  Clock,
  Dumbbell,
  Flame,
  Heart,
  Info,
  Lightbulb,
  MapPin,
  Target,
  TrendingUp,
  Utensils,
  Zap,
} from 'lucide-react';
import { useState } from 'react';

interface WorkoutPlanViewProps {
  plan: any; // JSONB workout plan data from database
  tier: 'BASIC' | 'PREMIUM';
}

export function WorkoutPlanView({ plan, tier }: WorkoutPlanViewProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);

  console.log("Tier: ", tier);

  if (!plan) {
    return (
      <Card padding="lg" className="text-center">
        <p className="text-muted-foreground">No workout plan data available</p>
      </Card>
    );
  }

  const weeklyPlan = plan.weekly_plan || [];
  const weeklySummary = plan.weekly_summary || {};
  const tips = plan.personalized_tips || []; // PREMIUM
  const progressionTracking = plan.progression_tracking; // PREMIUM
  const periodization = plan.periodization_plan; // PREMIUM
  const injuryPrevention = plan.injury_prevention; // PREMIUM
  const nutritionTiming = plan.nutrition_timing; // PREMIUM
  const lifestyleIntegration = plan.lifestyle_integration; // PREMIUM

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <Card variant="elevated" padding="lg">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold text-foreground">Weekly Summary</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Workout Days</p>
            <p className="text-2xl font-bold text-purple-600">{weeklySummary.total_workout_days || 0}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold text-blue-600">{weeklySummary.total_time_minutes || 0} min</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Calories Burned</p>
            <p className="text-2xl font-bold text-orange-600">{weeklySummary.estimated_weekly_calories_burned || 0}</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg">
            <p className="text-sm text-muted-foreground">Difficulty</p>
            <p className="text-2xl font-bold text-green-600 capitalize">{weeklySummary.difficulty_level || 'Medium'}</p>
          </div>
        </div>
        {weeklySummary.training_split && (
          <div className="mt-4 p-3 bg-accent/10 rounded-lg">
            <p className="text-sm">
              <strong>Training Split:</strong> {weeklySummary.training_split}
            </p>
          </div>
        )}
        {weeklySummary.progression_strategy && (
          <div className="mt-2 p-3 bg-primary/10 rounded-lg">
            <p className="text-sm">
              <strong>Progression Strategy:</strong> {weeklySummary.progression_strategy}
            </p>
          </div>
        )}
      </Card>

      {/* Weekly Plan */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">Your Weekly Plan</h2>
          <span className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full">
            {weeklyPlan.length} days
          </span>
        </div>

        {weeklyPlan.map((day: any, dayIndex: number) => {
          const isExpanded = expandedDay === dayIndex;
          const exercises = day.exercises || [];

          return (
            <motion.div
              key={dayIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIndex * 0.1 }}
            >
              <Card
                variant="elevated"
                padding="md"
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setExpandedDay(isExpanded ? null : dayIndex)}
              >
                {/* Day Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary text-white text-sm font-semibold rounded">
                        {day.day}
                      </span>
                      {day.optional && (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-600 text-xs rounded">
                          Optional
                        </span>
                      )}
                      <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {day.duration_minutes} min
                      </span>
                      <span className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {day.training_location}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{day.workout_type}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      <Target className="w-4 h-4 inline mr-1" />
                      Focus: {day.focus}
                    </p>
                    <div className="flex gap-4 text-sm">
                      <span className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        Intensity: <strong>{day.intensity}</strong>
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        <strong>{day.estimated_calories_burned}</strong> cal
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        RPE: <strong>{day.rpe_target}</strong>
                      </span>
                    </div>
                  </div>
                  <TrendingUp className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-4 pt-4 border-t border-border"
                    >
                      {/* Warmup */}
                      {day.warmup && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-orange-600">
                            <Zap className="w-4 h-4" />
                            Warmup ({day.warmup.duration_minutes} min)
                          </h4>
                          <ul className="space-y-1 bg-orange-500/20 p-3 rounded-lg">
                            {day.warmup.activities?.map((activity: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-orange-600">•</span>
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Exercises */}
                      <div className="mb-4">
                        <h4 className="font-semibold mb-3 flex items-center gap-2">
                          <Dumbbell className="w-4 h-4" />
                          Exercises ({exercises.length})
                        </h4>
                        <div className="space-y-3">
                          {exercises.map((exercise: any, exIndex: number) => {
                            const exerciseKey = `${dayIndex}-${exIndex}`;
                            const isExerciseExpanded = expandedExercise === exerciseKey;

                            return (
                              <div
                                key={exIndex}
                                className="bg-muted/50 p-3 rounded-lg cursor-pointer hover:bg-muted/70 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedExercise(isExerciseExpanded ? null : exerciseKey);
                                }}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="font-semibold text-foreground">{exIndex + 1}. {exercise.name}</span>
                                      <span className={`px-2 py-0.5 text-xs rounded ${
                                        exercise.category === 'compound' ? 'bg-purple-500/20 text-purple-500' :
                                        'bg-blue-100 dark:bg-blue-900 text-blue-500'
                                      }`}>
                                        {exercise.category}
                                      </span>
                                      {exercise.difficulty && (
                                        <span className={`px-2 py-0.5 text-xs rounded ${
                                          exercise.difficulty === 'beginner' ? 'bg-green-500/20 text-green-500' :
                                          exercise.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-500' :
                                          'bg-red-500/20 text-red-500'
                                        }`}>
                                          {exercise.difficulty}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex gap-4 text-sm text-muted-foreground">
                                      <span><strong>{exercise.sets}</strong> sets</span>
                                      <span><strong>{exercise.reps}</strong> reps</span>
                                      <span><strong>{exercise.rest_seconds}s</strong> rest</span>
                                      {exercise.tempo && <span>Tempo: <strong>{exercise.tempo}</strong></span>}
                                    </div>
                                    {exercise.muscle_groups && exercise.muscle_groups.length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-2">
                                        {exercise.muscle_groups.map((muscle: string, i: number) => (
                                          <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded">
                                            {muscle}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <Info className="w-4 h-4 text-muted-foreground" />
                                </div>

                                {/* Exercise Details */}
                                <AnimatePresence>
                                  {isExerciseExpanded && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="mt-3 pt-3 border-t border-border space-y-2"
                                    >
                                      {/* Instructions */}
                                      {exercise.instructions && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1">Instructions:</p>
                                          <p className="text-sm">{exercise.instructions}</p>
                                        </div>
                                      )}

                                      {/* Equipment */}
                                      {exercise.equipment_needed && exercise.equipment_needed.length > 0 && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1">Equipment:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {exercise.equipment_needed.map((eq: string, i: number) => (
                                              <span key={i} className="px-2 py-0.5 bg-accent/20 text-accent-foreground text-xs rounded">
                                                {eq}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Alternatives */}
                                      {exercise.alternatives && (
                                        <div>
                                          <p className="text-xs font-semibold text-muted-foreground mb-1">Alternatives:</p>
                                          <div className="grid grid-cols-2 gap-2 text-xs">
                                            {exercise.alternatives.home && (
                                              <div>
                                                <strong>Home:</strong> {exercise.alternatives.home}
                                              </div>
                                            )}
                                            {exercise.alternatives.easier && (
                                              <div>
                                                <strong>Easier:</strong> {exercise.alternatives.easier}
                                              </div>
                                            )}
                                            {exercise.alternatives.harder && (
                                              <div>
                                                <strong>Harder:</strong> {exercise.alternatives.harder}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}

                                      {/* Progression */}
                                      {exercise.progression && (
                                        <div className="p-2 bg-green-500/20 rounded">
                                          <p className="text-xs font-semibold text-green-500">Progression:</p>
                                          <p className="text-xs text-green-600">{exercise.progression}</p>
                                        </div>
                                      )}

                                      {/* Safety */}
                                      {exercise.safety_notes && (
                                        <div className="p-2 bg-red-500/20 rounded">
                                          <p className="text-xs font-semibold text-red-500">Safety:</p>
                                          <p className="text-xs text-red-600">{exercise.safety_notes}</p>
                                        </div>
                                      )}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Cooldown */}
                      {day.cooldown && (
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-600">
                            <Heart className="w-4 h-4" />
                            Cooldown ({day.cooldown.duration_minutes} min)
                          </h4>
                          <ul className="space-y-1 bg-blue-500/20 p-3 rounded-lg">
                            {day.cooldown.activities?.map((activity: string, i: number) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <span className="text-blue-600">•</span>
                                {activity}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Success Criteria */}
                      {day.success_criteria && (
                        <div className="p-3 bg-green-500/20 rounded-lg">
                          <p className="text-sm flex items-start gap-2">
                            <Award className="w-4 h-4 text-green-600 mt-0.5" />
                            <span><strong>Success Criteria:</strong> {day.success_criteria}</span>
                          </p>
                        </div>
                      )}

                      {/* Low Energy Modification */}
                      {day.if_low_energy && (
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                          <p className="text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                            <span><strong>If Low Energy:</strong> {day.if_low_energy}</span>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Personalized Tips - Always Show */}
      {tips.length > 0 && (
        <Card variant="elevated" padding="lg">
          <div className="flex items-center gap-3 mb-4">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-foreground">Personalized Tips</h2>
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-500 text-sm rounded-full">
              {tips.length} tips
            </span>
          </div>
          <div className="space-y-3">
            {tips.map((tip: string, i: number) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg"
              >
                <p className="text-sm text-foreground">{tip}</p>
              </motion.div>
            ))}
          </div>
        </Card>
      )}

      {/* Progression Tracking - CONDITIONAL (PREMIUM) */}
      {progressionTracking && (
        <Card variant="elevated" padding="lg" className="border-2 border-blue-500/20">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <h2 className="text-2xl font-bold text-foreground">Progression Tracking</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold rounded-full">
              PREMIUM
            </span>
          </div>
          <div className="space-y-4">
            {progressionTracking.what_to_track && (
              <div>
                <h4 className="font-semibold mb-2 text-blue-600">What to Track</h4>
                <ul className="space-y-1">
                  {progressionTracking.what_to_track.map((item: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-blue-600">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {progressionTracking.when_to_progress && (
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <p className="text-sm"><strong>When to Progress:</strong> {progressionTracking.when_to_progress}</p>
              </div>
            )}
            {progressionTracking.how_much_to_add && (
              <div className="p-3 bg-green-500/20 rounded-lg">
                <p className="text-sm"><strong>How Much to Add:</strong> {progressionTracking.how_much_to_add}</p>
              </div>
            )}
            {progressionTracking.plateau_breakers && (
              <div>
                <h4 className="font-semibold mb-2 text-orange-600">Plateau Breakers</h4>
                <ul className="space-y-1">
                  {progressionTracking.plateau_breakers.map((item: string, i: number) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="text-orange-600">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Periodization Plan - CONDITIONAL (PREMIUM) */}
      {periodization && (
        <Card variant="elevated" padding="lg" className="border-2 border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-purple-500" />
            <h2 className="text-2xl font-bold text-foreground">Periodization Plan</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
              PREMIUM FEATURE
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(periodization).map(([phase, description], i) => (
              <div key={i} className="p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg">
                <p className="font-semibold text-purple-500 mb-1">
                  {phase.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-sm">{description as string}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Injury Prevention - CONDITIONAL (PREMIUM) */}
      {injuryPrevention && (
        <Card variant="elevated" padding="lg" className="border-2 border-red-500/20">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h2 className="text-2xl font-bold text-foreground">Injury Prevention</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-semibold rounded-full">
              PREMIUM FEATURE
            </span>
          </div>
          <div className="space-y-4">
            {injuryPrevention.mobility_work && (
              <div className="p-3 bg-red-500/20 rounded-lg">
                <p className="font-semibold text-red-500 mb-1">Mobility Work</p>
                <p className="text-sm">{injuryPrevention.mobility_work}</p>
              </div>
            )}
            {injuryPrevention.red_flags && (
              <div className="p-3 bg-orange-500/20 rounded-lg">
                <p className="font-semibold text-orange-500 mb-1">⚠️ Red Flags</p>
                <p className="text-sm">{injuryPrevention.red_flags}</p>
              </div>
            )}
            {injuryPrevention.modification_guidelines && (
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <p className="font-semibold text-yellow-500 mb-1">Modification Guidelines</p>
                <p className="text-sm">{injuryPrevention.modification_guidelines}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Nutrition Timing - CONDITIONAL (PREMIUM) */}
      {nutritionTiming && (
        <Card variant="elevated" padding="lg" className="border-2 border-green-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Utensils className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold text-foreground">Nutrition Timing</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full">
              PREMIUM FEATURE
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(nutritionTiming).map(([timing, description], i) => (
              <div key={i} className="p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg">
                <p className="font-semibold text-green-700 dark:text-green-300 mb-1">
                  {timing.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-sm">{description as string}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Lifestyle Integration - CONDITIONAL (PREMIUM) */}
      {lifestyleIntegration && (
        <Card variant="elevated" padding="lg" className="border-2 border-indigo-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-6 h-6 text-indigo-500" />
            <h2 className="text-2xl font-bold text-foreground">Lifestyle Integration</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-semibold rounded-full">
              PREMIUM FEATURE
            </span>
          </div>
          <div className="space-y-3">
            {Object.entries(lifestyleIntegration).map(([category, description], i) => (
              <div key={i} className="p-3 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg">
                <p className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                  {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </p>
                <p className="text-sm">{description as string}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
