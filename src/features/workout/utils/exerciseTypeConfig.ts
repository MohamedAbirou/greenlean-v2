/**
 * Updated Exercise Type Configuration
 * Makes tracking modes user-selectable for flexibility
 * Separates suggestion logic from config retrieval
 */

export type ExerciseTrackingMode =
  | "weight-reps" // Traditional strength: sets × reps @ weight (e.g., Bench Press, Weighted Dips)
  | "duration" // Time-based: sets × duration (e.g., Plank, Wall Sit)
  | "reps-only" // Bodyweight: sets × reps (e.g., Push-ups, Pull-ups)
  | "reps-per-side" // Unilateral: sets × reps per side (e.g., Russian Twists, Lunges)
  | "distance-time" // Cardio: distance + time (e.g., Running, Cycling)
  | "reps-duration" // Hybrid: reps + duration (e.g., Jump Rope)
  | "distance-only" // Distance-based: sets × distance (e.g., Swimming laps)
  | "amrap"; // As Many Reps As Possible in time

export interface ExerciseTypeConfig {
  mode: ExerciseTrackingMode;
  fields: {
    sets: boolean;
    reps: boolean;
    weight: boolean;
    duration: boolean;
    distance: boolean;
    perSide: boolean;
  };
  labels: {
    primary: string; // e.g., "Weight", "Duration", "Distance"
    secondary?: string; // e.g., "Reps", "Each Side"
    unit: string; // e.g., "kg", "seconds", "meters"
  };
  defaults: {
    sets: number;
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
  };
}

// Map from mode to config for quick lookup
const modeToConfig: Record<ExerciseTrackingMode, Omit<ExerciseTypeConfig, "mode">> = {
  "weight-reps": {
    fields: {
      sets: true,
      reps: true,
      weight: true,
      duration: false,
      distance: false,
      perSide: false,
    },
    labels: { primary: "Weight", secondary: "Reps", unit: "kg" },
    defaults: { sets: 3, reps: 10, weight: 20 },
  },
  duration: {
    fields: {
      sets: true,
      reps: false,
      weight: false,
      duration: true,
      distance: false,
      perSide: false,
    },
    labels: { primary: "Duration", unit: "seconds" },
    defaults: { sets: 3, duration: 30 },
  },
  "reps-only": {
    fields: {
      sets: true,
      reps: true,
      weight: false,
      duration: false,
      distance: false,
      perSide: false,
    },
    labels: { primary: "Reps", unit: "reps" },
    defaults: { sets: 3, reps: 10 },
  },
  "reps-per-side": {
    fields: {
      sets: true,
      reps: true,
      weight: false,
      duration: false,
      distance: false,
      perSide: true,
    },
    labels: { primary: "Reps", secondary: "Each Side", unit: "reps" },
    defaults: { sets: 3, reps: 15 },
  },
  "distance-time": {
    fields: {
      sets: true,
      reps: false,
      weight: false,
      duration: true,
      distance: true,
      perSide: false,
    },
    labels: { primary: "Distance", secondary: "Time", unit: "meters" },
    defaults: { sets: 1, distance: 1000, duration: 300 },
  },
  "reps-duration": {
    fields: {
      sets: true,
      reps: true,
      weight: false,
      duration: true,
      distance: false,
      perSide: false,
    },
    labels: { primary: "Reps", secondary: "Duration", unit: "reps" },
    defaults: { sets: 3, reps: 100, duration: 60 },
  },
  "distance-only": {
    fields: {
      sets: true,
      reps: false,
      weight: false,
      duration: false,
      distance: true,
      perSide: false,
    },
    labels: { primary: "Distance", unit: "meters" },
    defaults: { sets: 1, distance: 1000 },
  },
  amrap: {
    fields: {
      sets: true,
      reps: true,
      weight: false,
      duration: true,
      distance: false,
      perSide: false,
    },
    labels: { primary: "Reps", secondary: "in Time", unit: "reps" },
    defaults: { sets: 1, reps: 0, duration: 60 },
  },
};

/**
 * Get full config for a given mode
 */
export function getConfigForMode(mode: ExerciseTrackingMode): ExerciseTypeConfig {
  return {
    mode,
    ...modeToConfig[mode],
  };
}

/**
 * Suggest a tracking mode based on category, exercise name, and equipment
 * This is used for initial suggestion; user can override
 */
export function getSuggestedMode(
  category: string,
  exerciseName: string,
  equipment?: string | string[]
): ExerciseTrackingMode {
  const name = exerciseName.toLowerCase();
  const cat = category.toLowerCase();
  const equip = Array.isArray(equipment)
    ? equipment.map((e) => e.toLowerCase())
    : equipment?.toLowerCase() || "";

  // Prioritize weighted if equipment suggests weight
  if (
    Array.isArray(equip)
      ? equip.some((e) =>
          [
            "barbell",
            "dumbbell",
            "kettlebell",
            "machine",
            "cable",
            "plate",
            "weighted vest",
          ].includes(e)
        )
      : [
          "barbell",
          "dumbbell",
          "kettlebell",
          "machine",
          "cable",
          "plate",
          "weighted vest",
        ].includes(equip) ||
        name.includes("weighted") ||
        name.includes("press") ||
        name.includes("squat") ||
        name.includes("deadlift") ||
        name.includes("curl") ||
        name.includes("row")
  ) {
    return "weight-reps";
  }

  // Time-based exercises (isometric holds)
  if (
    name.includes("plank") ||
    name.includes("wall sit") ||
    name.includes("hold") ||
    name.includes("static")
  ) {
    return "duration";
  }

  // Unilateral exercises (per side)
  if (
    name.includes("russian twist") ||
    name.includes("side plank") ||
    name.includes("single leg") ||
    name.includes("one leg") ||
    name.includes("single arm") ||
    name.includes("one arm") ||
    name.includes("lunge") ||
    name.includes("step up")
  ) {
    // Check if it's time-based unilateral (like side plank)
    if (name.includes("plank") || name.includes("hold")) {
      return "duration";
    }
    return "reps-per-side";
  }

  // Cardio exercises with distance
  if (
    cat === "cardio" ||
    name.includes("run") ||
    name.includes("cycle") ||
    name.includes("swim") ||
    name.includes("row")
  ) {
    return "distance-time";
  }

  // Jump rope (hybrid reps + duration)
  if (
    name.includes("jump rope") ||
    name.includes("skipping") ||
    name.includes("mountain climber")
  ) {
    return "reps-duration";
  }

  // Bodyweight exercises (no weight)
  if (
    equip === "body weight" ||
    (Array.isArray(equip) && equip.includes("body weight")) ||
    name.includes("push up") ||
    name.includes("push-up") ||
    name.includes("pull up") ||
    name.includes("pull-up") ||
    name.includes("chin up") ||
    name.includes("dip") ||
    name.includes("sit up") ||
    name.includes("crunch") ||
    name.includes("burpee")
  ) {
    return "reps-only";
  }

  // Default based on category
  if (cat === "strength") {
    return "weight-reps";
  }

  return "reps-only";
}

/**
 * Format a single set for display (used in history, templates, summaries, etc.)
 */
export function formatSetDisplay(
  mode: ExerciseTrackingMode,
  set: {
    reps?: number | null;
    weight_kg?: number | null;
    duration_seconds?: number | null;
    distance_meters?: number | null;
  }
): string {
  const reps = set.reps ?? 0;
  const weight = set.weight_kg ?? 0;
  const duration = set.duration_seconds ?? 0;
  const distance = set.distance_meters ?? 0;

  switch (mode) {
    case "weight-reps":
      if (weight > 0) return `${reps} × ${weight} kg`;
      return `${reps} reps`;

    case "duration": {
      if (duration === 0) return "—";
      const min = Math.floor(duration / 60);
      const sec = duration % 60;
      return min > 0 ? `${min}:${sec.toString().padStart(2, "0")} min` : `${duration} s`;
    }

    case "reps-only":
      return `${reps} reps`;

    case "reps-per-side":
      return `${reps} each side`;

    case "distance-time": {
      const timeStr =
        duration > 0
          ? Math.floor(duration / 60) + ":" + (duration % 60).toString().padStart(2, "0")
          : "—";
      return `${distance} m in ${timeStr}`;
    }

    case "reps-duration":
      return `${reps} reps in ${duration} s`;

    case "distance-only":
      return `${distance} m`;

    case "amrap": {
      const amrapTime =
        duration > 0
          ? Math.floor(duration / 60) + ":" + (duration % 60).toString().padStart(2, "0")
          : "—";
      return `${reps} reps in ${amrapTime}`;
    }

    default:
      return "—";
  }
}

/**
 * Calculate volume/work based on tracking mode
 */
export function calculateWork(
  mode: ExerciseTrackingMode,
  set: {
    reps?: number;
    weight_kg?: number;
    duration_seconds?: number;
    distance_meters?: number;
  }
): number {
  switch (mode) {
    case "weight-reps":
      return (set.reps ?? 0) * (set.weight_kg ?? 0);

    case "duration":
      return set.duration_seconds ?? 0;

    case "reps-only":
    case "reps-per-side":
      return set.reps ?? 0;

    case "distance-time":
    case "distance-only":
      return set.distance_meters ?? 0;

    case "reps-duration":
      return (set.reps ?? 0) + (set.duration_seconds ?? 0) / 10; // Weighted combination

    case "amrap":
      return set.reps ?? 0;

    default:
      return 0;
  }
}
