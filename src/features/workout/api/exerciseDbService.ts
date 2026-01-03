/**
 * ExerciseDB API Service
 * Provides access to 1,300+ exercises with GIF demonstrations
 * API: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb
 */

const EXERCISEDB_API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY || "";
const EXERCISEDB_HOST = "exercisedb.p.rapidapi.com";
const EXERCISEDB_BASE_URL = "https://exercisedb.p.rapidapi.com";

export interface ExerciseDbExercise {
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  id: string;
  name: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export interface Exercise {
  id: string;
  name: string;
  category: string; // strength, cardio, flexibility, balance
  muscle_group: string; // chest, back, legs, shoulders, arms, core, cardio
  equipment: string | string[]; // barbell, dumbbell, bodyweight, machine, cable, etc.
  description?: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  gif_url?: string;
  youtube_url?: string;
  instructions: string[];
  secondary_muscles?: string[];
  calories_per_minute?: number;
}

export class ExerciseDbService {
  /**
   * Make API request to ExerciseDB
   */
  private static async makeRequest<T>(endpoint: string): Promise<T | null> {
    if (!EXERCISEDB_API_KEY) {
      console.warn("ExerciseDB API key not configured");
      return null;
    }

    try {
      const response = await fetch(`${EXERCISEDB_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": EXERCISEDB_API_KEY,
          "X-RapidAPI-Host": EXERCISEDB_HOST,
        },
      });

      if (!response.ok) {
        throw new Error(`ExerciseDB API error: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("ExerciseDB API request failed:", error);
      return null;
    }
  }

  /**
   * Get all exercises (paginated)
   */
  static async getAllExercises(total = 500): Promise<ExerciseDbExercise[]> {
    const pageSize = 10; // ExerciseDB max per page
    const pages = Math.ceil(total / pageSize);

    let all: ExerciseDbExercise[] = [];

    for (let i = 0; i < pages; i++) {
      const offset = i * pageSize;

      const page = await this.makeRequest<ExerciseDbExercise[]>(
        `/exercises?limit=${pageSize}&offset=${offset}`
      );

      if (!page || page.length === 0) break;

      all = [...all, ...page];
    }

    return all.slice(0, total);
  }

  // static async getAllExercises(limit = 100, offset = 0): Promise<ExerciseDbExercise[]> {
  //   const data = await this.makeRequest<ExerciseDbExercise[]>(
  //     `/exercises?limit=${limit}&offset=${offset}`
  //   );
  //   return data || [];
  // }

  /**
   * Get exercise by ID
   */
  static async getExerciseById(id: string): Promise<ExerciseDbExercise | null> {
    return await this.makeRequest<ExerciseDbExercise>(`/exercises/exercise/${id}`);
  }

  /**
   * Search exercises by name
   */
  static async searchExercises(query: string): Promise<ExerciseDbExercise[]> {
    const data = await this.makeRequest<ExerciseDbExercise[]>(
      `/exercises/name/${encodeURIComponent(query)}`
    );
    return data || [];
  }

  /**
   * Get exercises by body part
   */
  static async getExercisesByBodyPart(bodyPart: string): Promise<ExerciseDbExercise[]> {
    const data = await this.makeRequest<ExerciseDbExercise[]>(
      `/exercises/bodyPart/${encodeURIComponent(bodyPart)}`
    );
    return data || [];
  }

  /**
   * Get exercises by target muscle
   */
  static async getExercisesByTarget(target: string): Promise<ExerciseDbExercise[]> {
    const data = await this.makeRequest<ExerciseDbExercise[]>(
      `/exercises/target/${encodeURIComponent(target)}`
    );
    return data || [];
  }

  /**
   * Get exercises by equipment
   */
  static async getExercisesByEquipment(equipment: string): Promise<ExerciseDbExercise[]> {
    const data = await this.makeRequest<ExerciseDbExercise[]>(
      `/exercises/equipment/${encodeURIComponent(equipment)}`
    );
    return data || [];
  }

  /**
   * Get list of all body parts
   */
  static async getBodyPartsList(): Promise<string[]> {
    const data = await this.makeRequest<string[]>("/exercises/bodyPartList");
    return data || [];
  }

  /**
   * Get list of all target muscles
   */
  static async getTargetMusclesList(): Promise<string[]> {
    const data = await this.makeRequest<string[]>("/exercises/targetList");
    return data || [];
  }

  /**
   * Get list of all equipment types
   */
  static async getEquipmentList(): Promise<string[]> {
    const data = await this.makeRequest<string[]>("/exercises/equipmentList");
    return data || [];
  }

  /**
   * Convert ExerciseDB format to our Exercise format
   */
  static toExercise(dbExercise: ExerciseDbExercise): Exercise {
    // Map body part to category
    const categoryMap: Record<string, string> = {
      chest: "strength",
      back: "strength",
      legs: "strength",
      shoulders: "strength",
      arms: "strength",
      waist: "strength", // core
      cardio: "cardio",
      neck: "strength",
    };

    // Map body part to muscle group
    const muscleGroupMap: Record<string, string> = {
      chest: "chest",
      back: "back",
      "lower legs": "legs",
      "upper legs": "legs",
      shoulders: "shoulders",
      "upper arms": "arms",
      "lower arms": "arms",
      waist: "core",
      cardio: "cardio",
      neck: "shoulders",
    };

    // Estimate difficulty based on equipment
    const difficultyMap: Record<string, "beginner" | "intermediate" | "advanced"> = {
      "body weight": "beginner",
      assisted: "beginner",
      dumbbell: "intermediate",
      barbell: "advanced",
      cable: "intermediate",
      machine: "beginner",
      band: "beginner",
      kettlebell: "intermediate",
      "medicine ball": "intermediate",
      "stability ball": "beginner",
      "foam roll": "beginner",
      "ez barbell": "advanced",
      "olympic barbell": "advanced",
      "leverage machine": "intermediate",
      weighted: "intermediate",
      rope: "intermediate",
      "skierg machine": "intermediate",
      "smith machine": "intermediate",
      "sled machine": "advanced",
      "stationary bike": "beginner",
      tire: "advanced",
      "trap bar": "advanced",
      "wheel roller": "intermediate",
    };

    const category = categoryMap[dbExercise.bodyPart] || "strength";
    const muscleGroup = muscleGroupMap[dbExercise.bodyPart] || "core";
    const difficulty = difficultyMap[dbExercise.equipment] || "intermediate";

    // Estimate calories per minute based on category and intensity
    let caloriesPerMinute = 5; // default
    if (category === "cardio") caloriesPerMinute = 10;
    else if (difficulty === "advanced") caloriesPerMinute = 8;
    else if (difficulty === "beginner") caloriesPerMinute = 4;

    return {
      id: dbExercise.id,
      name: dbExercise.name,
      category,
      muscle_group: muscleGroup,
      equipment: dbExercise.equipment,
      difficulty,
      gif_url: dbExercise.gifUrl,
      instructions: dbExercise.instructions,
      secondary_muscles: dbExercise.secondaryMuscles,
      calories_per_minute: caloriesPerMinute,
    };
  }

  /**
   * Check if API is configured
   */
  static isConfigured(): boolean {
    return Boolean(EXERCISEDB_API_KEY);
  }

  /**
   * Get API configuration status
   */
  static getConfigStatus(): string {
    if (!EXERCISEDB_API_KEY) {
      return "ExerciseDB API key not configured. Add VITE_EXERCISEDB_API_KEY to your .env file. Get your key at: https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb";
    }
    return "ExerciseDB API configured";
  }

  /**
   * Search exercises by muscle group (uses static database)
   */
  async searchByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    // Use static database for now
    return STATIC_EXERCISES.filter((ex) => ex.muscle_group === muscleGroup);
  }
}

/**
 * Static exercise database fallback
 * Used when API is not configured or offline
 */
export const STATIC_EXERCISES: Exercise[] = [
  // Chest exercises
  {
    id: "push-up",
    name: "Push-up",
    category: "strength",
    muscle_group: "chest",
    equipment: "body weight",
    difficulty: "beginner",
    instructions: [
      "Start in a plank position with hands shoulder-width apart",
      "Lower your body until your chest nearly touches the floor",
      "Push yourself back up to the starting position",
      "Keep your core engaged throughout the movement",
    ],
    calories_per_minute: 7,
  },
  {
    id: "bench-press",
    name: "Barbell Bench Press",
    category: "strength",
    muscle_group: "chest",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Lie on a flat bench with feet on the floor",
      "Grip the barbell slightly wider than shoulder-width",
      "Lower the bar to your chest with control",
      "Press the bar back up to starting position",
    ],
    calories_per_minute: 8,
  },
  // Back exercises
  {
    id: "pull-up",
    name: "Pull-up",
    category: "strength",
    muscle_group: "back",
    equipment: "body weight",
    difficulty: "intermediate",
    instructions: [
      "Hang from a pull-up bar with an overhand grip",
      "Pull yourself up until your chin is above the bar",
      "Lower yourself back down with control",
      "Keep your core tight and avoid swinging",
    ],
    calories_per_minute: 8,
  },
  {
    id: "deadlift",
    name: "Barbell Deadlift",
    category: "strength",
    muscle_group: "back",
    equipment: "barbell",
    difficulty: "advanced",
    instructions: [
      "Stand with feet hip-width apart, bar over mid-foot",
      "Bend at hips and knees to grip the bar",
      "Lift the bar by extending hips and knees",
      "Lower the bar back to the ground with control",
    ],
    calories_per_minute: 10,
  },
  // Leg exercises
  {
    id: "squat",
    name: "Barbell Squat",
    category: "strength",
    muscle_group: "legs",
    equipment: "barbell",
    difficulty: "intermediate",
    instructions: [
      "Position the barbell on your upper back",
      "Stand with feet shoulder-width apart",
      "Lower your body by bending knees and hips",
      "Push through heels to return to starting position",
    ],
    calories_per_minute: 9,
  },
  {
    id: "lunge",
    name: "Walking Lunge",
    category: "strength",
    muscle_group: "legs",
    equipment: "body weight",
    difficulty: "beginner",
    instructions: [
      "Stand upright with feet hip-width apart",
      "Step forward with one leg and lower your hips",
      "Push off the back foot to bring it forward",
      "Alternate legs as you move forward",
    ],
    calories_per_minute: 7,
  },
  // Shoulder exercises
  {
    id: "shoulder-press",
    name: "Dumbbell Shoulder Press",
    category: "strength",
    muscle_group: "shoulders",
    equipment: "dumbbell",
    difficulty: "intermediate",
    instructions: [
      "Sit or stand with dumbbells at shoulder height",
      "Press the weights overhead until arms are extended",
      "Lower the weights back to shoulder height",
      "Keep your core engaged throughout",
    ],
    calories_per_minute: 7,
  },
  // Arm exercises
  {
    id: "bicep-curl",
    name: "Dumbbell Bicep Curl",
    category: "strength",
    muscle_group: "arms",
    equipment: "dumbbell",
    difficulty: "beginner",
    instructions: [
      "Stand with dumbbells at your sides, palms forward",
      "Curl the weights up toward your shoulders",
      "Lower the weights back down with control",
      "Keep your elbows stationary",
    ],
    calories_per_minute: 5,
  },
  {
    id: "tricep-dip",
    name: "Tricep Dip",
    category: "strength",
    muscle_group: "arms",
    equipment: "body weight",
    difficulty: "beginner",
    instructions: [
      "Position hands shoulder-width on a bench behind you",
      "Extend legs in front with heels on ground",
      "Lower your body by bending elbows",
      "Push back up to starting position",
    ],
    calories_per_minute: 6,
  },
  // Core exercises
  {
    id: "plank",
    name: "Plank",
    category: "strength",
    muscle_group: "core",
    equipment: "body weight",
    difficulty: "beginner",
    instructions: [
      "Start in a forearm plank position",
      "Keep your body in a straight line from head to heels",
      "Engage your core and hold the position",
      "Breathe steadily throughout",
    ],
    calories_per_minute: 5,
  },
  {
    id: "crunch",
    name: "Abdominal Crunch",
    category: "strength",
    muscle_group: "core",
    equipment: "body weight",
    difficulty: "beginner",
    instructions: [
      "Lie on your back with knees bent",
      "Place hands behind your head",
      "Lift your shoulders off the ground",
      "Lower back down with control",
    ],
    calories_per_minute: 4,
  },
  // Cardio exercises
  {
    id: "running",
    name: "Running",
    category: "cardio",
    muscle_group: "cardio",
    equipment: "body weight",
    difficulty: "beginner",
    instructions: [
      "Start at a comfortable pace",
      "Maintain good posture with shoulders back",
      "Land on mid-foot and push off with toes",
      "Swing arms naturally at your sides",
    ],
    calories_per_minute: 12,
  },
  {
    id: "jumping-jacks",
    name: "Jumping Jacks",
    category: "cardio",
    muscle_group: "cardio",
    equipment: "body weight",
    difficulty: "beginner",
    instructions: [
      "Start standing with feet together, arms at sides",
      "Jump and spread legs while raising arms overhead",
      "Jump back to starting position",
      "Maintain a steady rhythm",
    ],
    calories_per_minute: 10,
  },
  {
    id: "burpee",
    name: "Burpee",
    category: "cardio",
    muscle_group: "cardio",
    equipment: "body weight",
    difficulty: "intermediate",
    instructions: [
      "Start in a standing position",
      "Drop into a squat and place hands on ground",
      "Kick feet back into a plank position",
      "Do a push-up, then jump feet back to squat",
      "Explode up into a jump",
    ],
    calories_per_minute: 15,
  },
];
