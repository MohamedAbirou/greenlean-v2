/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * WorkoutTab - 2026 Premium Fitness Experience
 * Fully functional with workout_sessions and exercise_sets tables
 */

import { useAuth } from "@/features/auth";
import type {
  ExerciseDisplayData,
  SetDisplayData,
  WorkoutDisplayData,
} from "@/features/workout/api/workoutDisplayService";
import { workoutDisplayService } from "@/features/workout/api/workoutDisplayService";
import { workoutLoggingService } from "@/features/workout/api/workoutLoggingService";
import { ExerciseLibrary } from "@/features/workout/components/ExerciseLibrary";
import {
  calculateWork,
  formatSetDisplay,
  getConfigForMode,
  getSuggestedMode,
  type ExerciseTrackingMode,
} from "@/features/workout/utils/exerciseTypeConfig";
import { supabase } from "@/lib/supabase";
import { DatePicker } from "@/shared/components/DatePicker";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import type { Exercise } from "@/shared/types/workout";
import { formatDate } from "@/shared/utils/dateFormatter";
import {
  ArrowRight,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Edit2,
  Eye,
  Flame,
  Plus,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useActiveWorkoutPlan } from "../hooks/useDashboardData";

const getToday = () => new Date().toISOString().split("T")[0];

type SwapMode = "aiPlan" | "search" | "manual" | null;

const PRCard = ({
  label,
  value,
  unit,
  date,
  color,
}: {
  label: string;
  value?: number;
  unit: string;
  date?: string;
  color: string;
}) => (
  <div className={`p-4 rounded-xl bg-${color}-500/10 border border-${color}-500/30`}>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={`text-2xl font-bold text-${color}-600`}>
      {value ?? "—"} {unit}
    </p>
    {date && (
      <p className="text-xs text-muted-foreground mt-1">{new Date(date).toLocaleDateString()}</p>
    )}
  </div>
);

// Exercise Detail Modal Component
const ExerciseDetailModal = ({
  exercise,
  onClose,
}: {
  exercise: ExerciseDisplayData;
  onClose: () => void;
}) => {
  const navigate = useNavigate();
  const mode = (exercise.trackingMode || "reps-only") as ExerciseTrackingMode;
  const config = getConfigForMode(mode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="py-2 px-6 border-b border-border bg-gradient-to-r from-primary-500 to-secondary-500">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{exercise.exercise_name}</h2>
              <p className="text-primary-100 mt-1">
                {config.labels.primary} {config.labels.secondary && `+ ${config.labels.secondary}`}{" "}
                • {exercise.muscle_group}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {(!exercise.personalRecord ||
            !exercise.recentHistory ||
            exercise.recentHistory.length === 0) && (
              <div className="flex flex-col items-center justify-center py-5 text-center px-4">
                {/* Animated Dumbbell + Fire Effects */}
                <div className="relative mb-8 group">
                  {/* Main Dumbbell - Pulsing + Lift Animation */}
                  <div className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl flex items-center justify-center border-4 border-primary-200/50 backdrop-blur-sm shadow-2xl animate-float">
                    <Dumbbell className="h-14 w-14 md:h-16 md:w-16 text-primary-400 drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                  </div>

                  {/* Fire Particles - Rising + Sparkle */}
                  <div className="absolute -top-4 -right-4 animate-bounce-infinite">
                    <Flame className="h-8 w-8 text-orange-500 drop-shadow-lg" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 animate-bounce delay-300">
                    <Sparkles className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-r from-warning/20 to-primary/20 rounded-full blur-xl opacity-50 animate-pulse-slow" />
                </div>

                {/* Title - Bold + Gradient */}
                <h3 className="text-2xl md:text-3xl font-black mb-3 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Ready to Crush {exercise.exercise_name}?
                </h3>

                <p className="text-xl font-semibold text-muted-foreground mb-2 max-w-md mx-auto leading-relaxed">
                  No PRs or history yet? Perfect!{" "}
                  <span className="text-primary font-bold">This is where legends begin.</span>
                </p>

                <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                  Log your first set and watch your{" "}
                  <span className="font-bold text-warning">max weight, reps, & volume</span> skyrocket
                  🚀 Track progress like a pro!
                </p>

                {/* CTA Button - Gradient + Pulse */}
                <Button
                  size="lg"
                  className="group text-lg px-8 py-7 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 shadow-2xl border-2 border-transparent hover:border-primary-300/50 text-white font-bold transform hover:scale-105 transition-all duration-300 mb-6"
                  onClick={() => {
                    onClose(); // Close modal
                    navigate("/dashboard/log-workout"); // Navigate to Log workout
                  }}
                >
                  <Plus className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                  Log First Set & Set PRs
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </div>
            )}

          {/* Personal Records */}
          {exercise.personalRecord && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" /> Best Performances
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mode.includes("weight") || mode === "reps-only" || mode === "reps-per-side" ? (
                  <>
                    <PRCard
                      label="Max Weight"
                      value={exercise.personalRecord.max_weight_kg}
                      unit="kg"
                      date={exercise.personalRecord.max_weight_date}
                      color="blue"
                    />
                    <PRCard
                      label="Max Reps"
                      value={exercise.personalRecord.max_reps}
                      unit="reps"
                      date={exercise.personalRecord.max_reps_date}
                      color="green"
                    />
                    <PRCard
                      label="Max Volume"
                      value={Math.round(exercise.personalRecord.max_volume || 0)}
                      unit="kg"
                      date={exercise.personalRecord.max_volume_date}
                      color="purple"
                    />
                  </>
                ) : mode === "duration" || mode === "amrap" ? (
                  <PRCard
                    label="Best Time"
                    value={exercise.personalRecord.best_time_seconds}
                    unit="s"
                    date={exercise.personalRecord.best_time_date}
                    color="orange"
                  />
                ) : mode.includes("distance") ? (
                  <>
                    <PRCard
                      label="Max Distance"
                      value={exercise.personalRecord.max_distance_meters}
                      unit="m"
                      date={exercise.personalRecord.max_distance_date}
                      color="cyan"
                    />
                    <PRCard
                      label="Best Time"
                      value={exercise.personalRecord.best_time_seconds}
                      unit="s"
                      date={exercise.personalRecord.best_time_date}
                      color="orange"
                    />
                  </>
                ) : null}
              </div>
            </div>
          )}

          {/* Recent History */}
          {exercise.recentHistory && exercise.recentHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" /> Recent Sessions
              </h3>
              <div className="space-y-3">
                {exercise.recentHistory.map((entry, i) => {
                  const set = {
                    reps: entry.reps,
                    weight_kg: entry?.weight_kg,
                    duration_seconds: entry?.duration_seconds,
                    distance_meters: entry?.distance_meters,
                  };
                  return (
                    <div key={i} className="p-4 rounded-xl bg-muted/50 border">
                      <p className="font-medium mb-2">{formatDate(entry.completed_at)}</p>
                      <div className="flex gap-6 text-sm">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold">
                          {formatSetDisplay(mode, set)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 🔥 Bonus: Partial Empty State - Has PRs but NO History */}
          {exercise.personalRecord &&
            (!exercise.recentHistory || exercise.recentHistory.length === 0) && (
              <div className="mt-12 pt-8 border-t border-border/50">
                <div className="flex items-center justify-center py-12 bg-muted/50 rounded-2xl">
                  <div className="text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-pulse" />
                    <h4 className="text-lg font-bold text-foreground mb-2">No Recent Workouts</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Log a session to see 7-day history 👇
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-primary/50 text-primary hover:bg-primary/10"
                      onClick={() => {
                        onClose();
                        navigate("/dashboard/log-workout"); // Navigate to Log workout
                      }}
                    >
                      Quick Log Session
                    </Button>
                  </div>
                </div>
              </div>
            )}

          {/* 🔥 Bonus: Has History but NO PRs */}
          {(!exercise.personalRecord || Object.keys(exercise.personalRecord).length === 0) &&
            exercise.recentHistory &&
            exercise.recentHistory.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border/50">
                <div className="flex items-center justify-center py-12 bg-gradient-to-r from-warning/10 to-primary/10 rounded-2xl border-2 border-warning/30">
                  <div className="text-center">
                    <Trophy className="h-12 w-12 text-warning mx-auto mb-4 animate-bounce" />
                    <h4 className="text-lg font-bold text-foreground mb-2">No PRs Set Yet!</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Keep crushing sessions - PRs update automatically!
                    </p>
                    <div className="flex gap-2 mt-4">
                      <span className="px-3 py-1 bg-warning/20 text-warning rounded-full text-xs font-bold">
                        Live Calc
                      </span>
                      <span className="px-3 py-1 bg-success/20 text-success rounded-full text-xs font-bold">
                        Auto Updates
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white hover:from-primary-700 hover:to-secondary-700"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

// Exercise Card Component
const ExerciseCard = ({
  exercise,
  onDelete,
  onEdit,
  onReplace,
  onViewDetails,
}: {
  exercise: ExerciseDisplayData;
  workoutId: string;
  onDelete: () => void;
  onEdit: () => void;
  onReplace: () => void;
  onViewDetails: () => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const mode = (exercise.trackingMode || "reps-only") as ExerciseTrackingMode;
  const config = getConfigForMode(mode);

  const hasPR = exercise.sets.some(
    (s) =>
      exercise.personalRecord &&
      (s.is_pr_weight ||
        s.is_pr_reps ||
        s.is_pr_volume ||
        s.is_pr_duration ||
        s.is_pr_distance)
  );
  const totalWork = exercise.sets.reduce((sum, set) => sum + calculateWork(mode, set), 0);

  return (
    <div className="bg-card rounded-xl border-2 border-border overflow-hidden hover:shadow-lg hover:border-primary-500/50 transition-all">
      <div
        className="p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-foreground">{exercise.exercise_name}</h4>
              {hasPR && <Badge variant="warning">PR</Badge>}
            </div>
            <div className="flex gap-3 mt-1 text-sm text-muted-foreground">
              <Badge variant="outline">{config.labels.primary}</Badge>
              <span>{exercise.sets.length} sets</span>
              <span>•</span>
              <span className="font-medium">
                {Math.round(totalWork)}{" "}
                {config.mode.includes("weight")
                  ? "kg vol"
                  : config.mode.includes("duration")
                    ? "s"
                    : "reps"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
              className="p-2 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors group"
              title="View History & PRs"
            >
              <Eye className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-2 hover:bg-secondary-100 dark:hover:bg-secondary-900/30 rounded-lg transition-colors"
              title="Edit Exercise"
            >
              <Edit2 className="h-4 w-4 text-secondary-600 dark:text-secondary-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReplace();
              }}
              className="p-2 hover:bg-accent-100 dark:hover:bg-accent-900/30 rounded-lg transition-colors"
              title="Swap Exercise"
            >
              <RefreshCw className="h-4 w-4 text-accent-600 dark:text-accent-400" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-2 hover:bg-error/20 rounded-lg transition-colors"
              title="Delete Exercise"
            >
              <Trash2 className="h-4 w-4 text-error" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Collapsed preview */}
        {!isExpanded && (
          <div className="mt-3 flex flex-wrap gap-2">
            {exercise.sets.slice(0, 3).map((set) => (
              <div key={set.id} className="px-3 py-1 bg-muted rounded text-xs">
                {formatSetDisplay(mode, set)}
              </div>
            ))}
            {exercise.sets.length > 3 && (
              <div className="px-3 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                +{exercise.sets.length - 3} more
              </div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Sets */}
      {isExpanded && (
        <div className="border-t border-border p-4 bg-muted/30">
          <div className="space-y-2">
            {exercise.sets.map((set) => {
              const isPR =
                exercise.personalRecord &&
                (set.is_pr_weight ||
                  set.is_pr_reps ||
                  set.is_pr_volume ||
                  set.is_pr_duration ||
                  set.is_pr_distance);
              return (
                <div
                  key={set.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${isPR
                    ? "bg-gradient-to-r from-warning/20 to-accent/20 border-2 border-warning/50"
                    : "bg-card border border-border"
                    }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-4">
                      <span className="font-bold w-10">Set {set.set_number}</span>
                      <span className="text-lg font-semibold text-primary">
                        {formatSetDisplay(mode, set)}
                      </span>
                    </div>
                    {isPR && (
                      <div className="flex gap-1">
                        {set.is_pr_weight && (
                          <Badge
                            variant="accent"
                          >
                            W
                          </Badge>
                        )}
                        {set.is_pr_reps && (
                          <Badge
                            variant="primary"
                          >
                            R
                          </Badge>
                        )}
                        {set.is_pr_volume && (
                          <Badge
                            variant="warning"
                          >
                            V
                          </Badge>
                        )}
                        {set.is_pr_duration && (
                          <Badge
                            variant="tip"
                          >
                            Time
                          </Badge>
                        )}
                        {set.is_pr_distance && (
                          <Badge
                            variant="secondary"
                          >
                            ∆s
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────
// Edit Modal - now dynamic based on trackingMode
// ────────────────────────────────────────────────
const EditExerciseModal = ({
  exercise,
  sets,
  onSave,
  onCancel,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: {
  exercise: ExerciseDisplayData;
  sets: any[];
  onSave: () => void;
  onCancel: () => void;
  onAddSet: () => void;
  onRemoveSet: (idx: number) => void;
  onUpdateSet: (idx: number, field: string, value: any) => void;
}) => {
  const mode = (exercise.trackingMode || "reps-only") as ExerciseTrackingMode;
  const config = getConfigForMode(mode);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onCancel}
    >
      <div
        className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
          <h3 className="text-xl font-bold">Edit {exercise.exercise_name}</h3>
          <p className="text-sm opacity-90">
            {config.labels.primary} {config.labels.secondary && `+ ${config.labels.secondary}`}
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {sets.map((set, idx) => (
            <div key={idx} className="flex gap-4 items-center mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="font-medium w-16">Set {set.set_number}</div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {config.fields.reps && (
                  <div>
                    <label className="text-xs block mb-1">
                      Reps{config.fields.perSide ? " per side" : ""}
                    </label>
                    <input
                      type="number"
                      value={set.reps ?? ""}
                      onChange={(e) =>
                        onUpdateSet(idx, "reps", e.target.value ? Number(e.target.value) : null)
                      }
                      className="w-full p-2 border rounded"
                      min="0"
                    />
                  </div>
                )}

                {config.fields.weight && (
                  <div>
                    <label className="text-xs block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      value={set.weight_kg ?? ""}
                      onChange={(e) =>
                        onUpdateSet(
                          idx,
                          "weight_kg",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      step="2.5"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}

                {config.fields.duration && (
                  <div>
                    <label className="text-xs block mb-1">
                      {config.labels.primary} ({config.labels.unit})
                    </label>
                    <input
                      type="number"
                      value={set.duration_seconds ?? ""}
                      onChange={(e) =>
                        onUpdateSet(
                          idx,
                          "duration_seconds",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}

                {config.fields.distance && (
                  <div>
                    <label className="text-xs block mb-1">
                      {config.labels.primary} ({config.labels.unit})
                    </label>
                    <input
                      type="number"
                      value={set.distance_meters ?? ""}
                      onChange={(e) =>
                        onUpdateSet(
                          idx,
                          "distance_meters",
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      className="w-full p-2 border rounded"
                    />
                  </div>
                )}
              </div>

              {sets.length > 1 && (
                <Button variant="ghost" size="icon" onClick={() => onRemoveSet(idx)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          ))}

          <Button onClick={onAddSet} variant="outline" className="w-full mt-4">
            <Plus className="h-4 w-4 mr-2" /> Add Set
          </Button>
        </div>

        <div className="p-4 border-t flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={onSave}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </div>
    </div>
  );
};

// Workout Card Component
const WorkoutCard = ({
  workout,
  onDelete,
  onEditExercise,
  onReplaceExercise,
  onDeleteExercise,
}: {
  workout: WorkoutDisplayData;
  onDelete: () => void;
  onEditExercise: (exerciseIndex: number) => void;
  onReplaceExercise: (exerciseIndex: number) => void;
  onDeleteExercise: (exerciseIndex: number) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseDisplayData | null>(null);

  const hasPRs = workout.exercises.some((ex) =>
    ex.sets.some((s) => s.is_pr_weight || s.is_pr_reps || s.is_pr_volume)
  );

  return (
    <Card className="border-2 hover:shadow-2xl transition-all duration-300 hover:border-primary-500/50 bg-gradient-to-br from-card to-muted/30 group">
      {/* Header */}
      <div
        className="p-6 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg">
                <Dumbbell className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground">{workout.workout_name}</h3>
                <p className="text-sm text-muted-foreground">{formatDate(workout.session_date)}</p>
              </div>
            </div>

            {hasPRs && (
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-warning to-accent text-white rounded-full text-xs font-bold shadow-md animate-pulse">
                <Trophy className="h-3 w-3" />
                NEW PR!
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Exercises", value: workout.total_exercises, icon: Target, color: "primary" },
            { label: "Total Sets", value: workout.total_sets, icon: Zap, color: "secondary" },
            {
              label: "Volume",
              value: `${Math.round(workout.total_volume)}kg`,
              icon: TrendingUp,
              color: "success",
            },
            {
              label: "Calories",
              value: workout.calories_burned || 0,
              icon: Flame,
              color: "accent",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="p-3 rounded-xl bg-muted/50 border border-border hover:border-primary-500/50 transition-colors"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                  <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-border bg-muted/20">
          <CardContent className="p-6 space-y-4">
            {workout.exercises.map((exercise, idx) => (
              <ExerciseCard
                key={idx}
                exercise={exercise}
                workoutId={workout.id}
                onViewDetails={() => setSelectedExercise(exercise)}
                onEdit={() => onEditExercise(idx)}
                onReplace={() => onReplaceExercise(idx)}
                onDelete={() => onDeleteExercise(idx)}
              />
            ))}
          </CardContent>
        </div>
      )}

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <ExerciseDetailModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
        />
      )}
    </Card>
  );
};

export function WorkoutTab() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [workouts, setWorkouts] = useState<WorkoutDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "strength" | "cardio" | "prs">("all");

  const { data: activeWorkoutPlan } = useActiveWorkoutPlan();

  const [editingExercise, setEditingExercise] = useState<{
    workoutId: string;
    exerciseIndex: number;
    exercise: ExerciseDisplayData;
  } | null>(null);
  const [swappingExercise, setSwappingExercise] = useState<{
    workoutId: string;
    exerciseIndex: number;
    mode: SwapMode;
    exercise: ExerciseDisplayData;
  } | null>(null);

  const [editExerciseForm, setEditExerciseForm] = useState<{
    sets: SetDisplayData[];
  }>({
    sets: [],
  });

  // Load workouts
  useEffect(() => {
    if (user?.id) {
      loadWorkouts();
    }
  }, [user?.id, selectedDate, filter]);

  const loadWorkouts = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { workouts: fetchedWorkouts } = await workoutDisplayService.getWorkoutsForDisplay(
        user.id,
        {
          startDate: selectedDate,
          endDate: selectedDate,
          limit: 50,
          workoutType: filter === "all" || filter === "prs" ? undefined : filter,
          includePRsOnly: filter === "prs",
        }
      );
      setWorkouts(fetchedWorkouts);
    } catch (error) {
      console.error("Error loading workouts:", error);
      toast.error("Failed to load workouts");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm("Delete this workout? This will remove logs and recalc PRs.")) return;
    await workoutLoggingService.deleteWorkout(id);  // New method
    loadWorkouts();
  };

  const handleDeleteExercise = async (workoutId: string, exerciseIndex: number) => {
    if (!confirm("Delete this exercise? This will recalc PRs.")) return;
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return;
    const exerciseId = workout.exercises[exerciseIndex].exercise_id;  // UUID
    await workoutLoggingService.deleteExercise(workoutId, exerciseId);
    loadWorkouts();
  };

  const startEditExercise = (workoutId: string, exerciseIndex: number) => {
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return;

    const exercise = workout.exercises[exerciseIndex];
    setEditingExercise({ workoutId, exerciseIndex, exercise });
    setEditExerciseForm({
      sets: exercise.sets.map((s) => ({
        id: s.id,
        set_number: s.set_number,
        reps: s.reps,
        weight_kg: s.weight_kg,
        duration_seconds: s.duration_seconds,
        distance_meters: s.distance_meters,
      })),
    });
  };

  const saveEditExercise = async () => {
    if (!editingExercise || !user?.id) return;

    try {
      // Identify deleted sets: Original sets that are no longer in the form
      const originalSetIds = new Set(
        editingExercise.exercise.sets.map((s) => s.id).filter(Boolean)
      );
      const currentSetIds = new Set(editExerciseForm.sets.map((s) => s.id).filter(Boolean));
      const toDeleteIds = [...originalSetIds].filter((id) => !currentSetIds.has(id));

      // Delete removed sets
      const deletePromises = toDeleteIds.map((id) =>
        supabase.from("exercise_sets").delete().eq("id", id)
      );

      // Prepare update/insert promises
      const savePromises = editExerciseForm.sets.map(async (set) => {
        if (set.id) {
          // Update existing: Include set_number in case of re-numbering
          const { error } = await supabase
            .from("exercise_sets")
            .update({
              set_number: set.set_number,
              reps: set.reps,
              weight_kg: set.weight_kg,
              duration_seconds: set.duration_seconds,
              distance_meters: set.distance_meters,
            })
            .eq("id", set.id);
          if (error) throw error;
        } else {
          // Insert new: Provide all required fields based on DB schema
          const newSet = {
            workout_session_id: editingExercise.workoutId,
            user_id: user.id,
            exercise_id: editingExercise.exercise.exercise_id, // Use the existing exercise's slug-like ID for grouping
            exercise_name: editingExercise.exercise.exercise_name,
            exercise_category: editingExercise.exercise.exercise_category || "strength", // Default if missing
            set_number: set.set_number,
            reps: set.reps,
            weight_kg: set.weight_kg,
            duration_seconds: set.duration_seconds,
            distance_meters: set.distance_meters,
            rpe: null,
            rest_seconds: null,
            tempo: null,
            is_warmup: false,
            is_dropset: false,
            is_failure: false,
            is_pr_weight: false, // Computed later by your service?
            is_pr_reps: false,
            is_pr_volume: false,
            notes: editingExercise.exercise.notes,
          };
          const { error } = await supabase.from("exercise_sets").insert(newSet);
          if (error) throw error;
        }
      });

      // Execute all operations concurrently
      await Promise.all([...deletePromises, ...savePromises]);

      toast.success("Exercise updated");
      setEditingExercise(null);
      loadWorkouts();
    } catch (error) {
      console.error("Error updating exercise:", error);
      toast.error("Failed to update exercise");
    }
  };

  const startSwapExercise = (workoutId: string, index: number, mode: SwapMode) => {
    const workout = workouts.find((w) => w.id === workoutId);
    if (!workout) return;

    const exercise = workout.exercises[index];
    setSwappingExercise({ workoutId, exerciseIndex: index, mode, exercise });
  };

  const handleSwapWithSearch = async (searchedExercise: any) => {
    if (!swappingExercise || !user?.id) return;

    try {
      await supabase
        .from("exercise_sets")
        .update({
          exercise_id: searchedExercise.id,
          exercise_name: searchedExercise.name,
          exercise_category: searchedExercise.category,
        })
        .eq("workout_session_id", swappingExercise.workoutId)
        .eq("exercise_id", swappingExercise.exercise.exercise_id);  // Old

      toast.success(`Swapped to ${searchedExercise.name}`);
      setSwappingExercise(null);
      loadWorkouts();
    } catch (error) {
      console.error("Error swapping exercise:", error);
      toast.error("Failed to swap exercise");
    }
  };

  const handleSwapWithAIPlan = async (aiExercise: any) => {
    if (!swappingExercise || !user?.id) return;

    try {
      // Create exercise object for upsert
      const exerciseObj: Exercise = {
        id: "ai-temp", // Temp for source inference
        name: aiExercise.name,
        category: aiExercise.category || "strength",
        muscle_group: aiExercise.muscle_groups?.join(", ") || "Mixed",
        trackingMode: getSuggestedMode(aiExercise.category, aiExercise.name, aiExercise.equipment_needed),
        sets: [], // Not needed for upsert
        notes: aiExercise.why_this_exercise || "",
        equipment: aiExercise.equipment_needed || "bodyweight",
        difficulty: "intermediate",
      };

      // Upsert to get UUID
      const newExerciseUuid = await workoutLoggingService.upsertExercise(user.id, exerciseObj);

      await supabase
        .from("exercise_sets")
        .update({
          exercise_id: newExerciseUuid,
          exercise_name: aiExercise.name,
          exercise_category: aiExercise.category || "strength",
        })
        .eq("workout_session_id", swappingExercise.workoutId)
        .eq("exercise_id", swappingExercise.exercise.exercise_id); // Old UUID

      toast.success(`Swapped to ${aiExercise.name}`);
      setSwappingExercise(null);
      loadWorkouts();
    } catch (error) {
      console.error("Error swapping exercise:", error);
      toast.error("Failed to swap exercise");
    }
  };

  const addSetToExercise = () => {
    const lastSet = editExerciseForm.sets[editExerciseForm.sets.length - 1];
    setEditExerciseForm({
      ...editExerciseForm,
      sets: [
        ...editExerciseForm.sets,
        {
          set_number: editExerciseForm.sets.length + 1,
          reps: lastSet?.reps || 10,
          weight_kg: lastSet?.weight_kg || 0,
          distance_meters: lastSet?.distance_meters || 0,
          duration_seconds: lastSet?.duration_seconds || 0,
          notes: lastSet?.notes,
        },
      ],
    });
  };

  const removeSetFromExercise = (setIndex: number) => {
    setEditExerciseForm({
      ...editExerciseForm,
      sets: editExerciseForm.sets
        .filter((_, i) => i !== setIndex)
        .map((set, i) => ({ ...set, set_number: i + 1 })),
    });
  };

  const updateSet = (setIndex: number, field: string, value: number) => {
    const updatedSets = [...editExerciseForm.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      [field]: value,
    };
    setEditExerciseForm({
      ...editExerciseForm,
      sets: updatedSets,
    });
  };

  // Calculate totals
  const totals = workouts.reduce(
    (acc, workout) => ({
      duration: acc.duration + (workout.duration_minutes || 0),
      calories: acc.calories + (workout.calories_burned || 0),
      exercises: acc.exercises + workout.total_exercises,
      workouts: acc.workouts + 1,
    }),
    { duration: 0, calories: 0, exercises: 0, workouts: 0 }
  );

  // Parse AI workout plan
  const planData = activeWorkoutPlan?.plan_data
    ? typeof activeWorkoutPlan.plan_data === "string"
      ? JSON.parse(activeWorkoutPlan.plan_data)
      : activeWorkoutPlan.plan_data
    : null;
  const weeklyPlan = planData?.weekly_plan || [];
  const aiPlanExercises: any[] = [];

  if (Array.isArray(weeklyPlan)) {
    weeklyPlan.forEach((workout: any) => {
      if (Array.isArray(workout.exercises)) {
        workout.exercises.forEach((ex: any) => {
          if (!aiPlanExercises.some((e) => e.name === ex.name)) {
            aiPlanExercises.push({ ...ex, workoutDay: workout.day, workoutFocus: workout.focus });
          }
        });
      }
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary-200 dark:border-primary-900"></div>
            <div className="absolute inset-0 rounded-full border-4 border-primary-600 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">Loading your workouts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Floating Action Header */}
      <div className="sticky top-0 z-30 -mx-4 px-4 py-4 backdrop-blur-xl bg-background/80 border-b border-border/50">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <DatePicker selectedDate={selectedDate} onDateChange={setSelectedDate} />
          </div>
          <Button
            onClick={() => navigate("/dashboard/log-workout")}
            className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Log Workout
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {["all", "strength", "cardio", "prs"].map((filterType) => (
          <button
            key={filterType}
            onClick={() => setFilter(filterType as any)}
            className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${filter === filterType
              ? "bg-gradient-to-r from-primary-600 to-secondary-600 text-white"
              : "bg-card text-foreground hover:shadow-md border border-border"
              }`}
          >
            {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
          </button>
        ))}
      </div>

      {/* Premium Stats Grid */}
      {workouts.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Workouts",
              value: totals.workouts,
              icon: Dumbbell,
              gradient: "from-primary-500 to-secondary-500",
              bg: "from-primary-500/20 to-secondary-500/20",
            },
            {
              label: "Minutes",
              value: totals.duration,
              icon: Clock,
              gradient: "from-secondary-500 to-accent-500",
              bg: "from-secondary-500/20 to-accent-500/20",
            },
            {
              label: "Calories",
              value: totals.calories,
              icon: Flame,
              gradient: "from-accent-500 to-error",
              bg: "from-accent-500/20 to-error/20",
            },
            {
              label: "Exercises",
              value: totals.exercises,
              icon: Target,
              gradient: "from-success to-primary-500",
              bg: "from-success/20 to-primary-500/20",
            },
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card
                key={idx}
                className={`group relative overflow-hidden border-0 bg-gradient-to-br ${stat.bg} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />
                <CardContent className="p-6 relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <TrendingUp className="h-4 w-4 text-success opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p
                    className={`text-3xl font-bold mb-1 bg-gradient-to-br ${stat.gradient} bg-clip-text text-transparent`}
                  >
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Workouts List */}
      {workouts.length === 0 ? (
        <Card className="border-2 border-dashed border-border hover:border-primary-500/50 transition-colors duration-300">
          <CardContent className="py-24 text-center">
            <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                <Dumbbell className="h-10 w-10 text-primary-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-3">No Workouts Found</h3>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {filter === "prs"
                ? "No personal records found for this date"
                : "Start your fitness journey by logging your first workout"}
            </p>
            <Button
              onClick={() => navigate("/dashboard/log-workout")}
              size="lg"
              className="bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              Log Workout
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onDelete={() => handleDeleteWorkout(workout.id)}
              onEditExercise={(idx) => startEditExercise(workout.id, idx)}
              onReplaceExercise={(idx) => startSwapExercise(workout.id, idx, null)}
              onDeleteExercise={(idx) => handleDeleteExercise(workout.id, idx)}
            />
          ))}
        </div>
      )}

      {editingExercise && (
        <EditExerciseModal
          exercise={editingExercise.exercise}
          sets={editExerciseForm.sets}
          onSave={saveEditExercise}
          onCancel={() => setEditingExercise(null)}
          onAddSet={addSetToExercise}
          onRemoveSet={removeSetFromExercise}
          onUpdateSet={updateSet}
        />
      )}

      {/* Swap Exercise Modal */}
      {swappingExercise && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSwappingExercise(null)}
        >
          <div
            className="bg-card rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-2 border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-border bg-gradient-to-r from-primary-500 to-secondary-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Swap Exercise
                </h3>
                <button
                  onClick={() => setSwappingExercise(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {!swappingExercise.mode ? (
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      mode: "aiPlan" as SwapMode,
                      icon: Sparkles,
                      label: "AI Plan",
                      gradient: "from-primary-500 to-secondary-600",
                      desc: "Choose from your AI plan",
                    },
                    {
                      mode: "search" as SwapMode,
                      icon: Search,
                      label: "Search",
                      gradient: "from-secondary-500 to-accent-600",
                      desc: "Search exercise database",
                    },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.mode}
                        onClick={() =>
                          setSwappingExercise({ ...swappingExercise, mode: option.mode })
                        }
                        className={`p-6 rounded-xl bg-gradient-to-br ${option.gradient} text-white hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-left`}
                      >
                        <Icon className="h-8 w-8 mb-3" />
                        <h4 className="font-bold text-lg mb-1">{option.label}</h4>
                        <p className="text-sm text-white/80">{option.desc}</p>
                      </button>
                    );
                  })}
                </div>
              ) : swappingExercise.mode === "search" ? (
                <ExerciseLibrary onSelectExercise={handleSwapWithSearch} selectedExercises={[]} />
              ) : swappingExercise.mode === "aiPlan" ? (
                <div className="space-y-3">
                  {aiPlanExercises.length === 0 ? (
                    <div className="text-center py-12">
                      <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No AI plan exercises found</p>
                    </div>
                  ) : (
                    aiPlanExercises.map((aiEx, i) => (
                      <button
                        key={i}
                        onClick={() => handleSwapWithAIPlan(aiEx)}
                        className="w-full text-left p-4 rounded-xl bg-muted border-2 border-border hover:border-primary-500 hover:shadow-md transition-all"
                      >
                        <p className="font-semibold text-foreground">{aiEx.name}</p>
                        {aiEx.muscle_group && (
                          <p className="text-sm text-muted-foreground mt-1">{aiEx.muscle_group}</p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
