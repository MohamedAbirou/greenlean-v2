/**
 * Workout API Layer
 * Complete CRUD operations for all workout-related features
 */

import { supabase } from '@/lib/supabase/client';
import type {
  WorkoutSession,
  ExerciseSet,
  ExerciseLibrary,
  ExercisePersonalRecord,
  WorkoutTemplate,
  AIWorkoutPlan,
  CardioSession,
  ExerciseDBExercise,
} from '../types';

// ========== WORKOUT SESSIONS ==========

export async function getWorkoutSessions(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('workout_date', startDate);
  }

  if (endDate) {
    query = query.lte('workout_date', endDate);
  }

  const { data, error } = await query.order('workout_date', { ascending: false });

  if (error) throw error;
  return data as WorkoutSession[];
}

export async function getWorkoutSessionById(sessionId: string) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data as WorkoutSession;
}

export async function getWorkoutSessionsByDate(userId: string, date: string) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('user_id', userId)
    .eq('workout_date', date)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as WorkoutSession[];
}

export async function createWorkoutSession(session: Partial<WorkoutSession>) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert([session])
    .select()
    .single();

  if (error) throw error;
  return data as WorkoutSession;
}

export async function updateWorkoutSession(id: string, updates: Partial<WorkoutSession>) {
  const { data, error } = await supabase
    .from('workout_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as WorkoutSession;
}

export async function deleteWorkoutSession(id: string) {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', id);

  if (error) throw error;
}

export async function completeWorkoutSession(
  id: string,
  updates: {
    status: 'completed';
    duration_minutes?: number;
    calories_burned?: number;
    rating?: number;
    energy_level?: number;
    notes?: string;
  }
) {
  return updateWorkoutSession(id, updates);
}

// ========== EXERCISE SETS ==========

export async function getExerciseSetsBySession(sessionId: string) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('workout_session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as ExerciseSet[];
}

export async function getExerciseSetsByExercise(
  userId: string,
  exerciseId: string,
  limit = 50
) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ExerciseSet[];
}

export async function createExerciseSet(set: Partial<ExerciseSet>) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert([set])
    .select()
    .single();

  if (error) throw error;
  return data as ExerciseSet;
}

export async function createExerciseSets(sets: Partial<ExerciseSet>[]) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert(sets)
    .select();

  if (error) throw error;
  return data as ExerciseSet[];
}

export async function updateExerciseSet(id: string, updates: Partial<ExerciseSet>) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ExerciseSet;
}

export async function deleteExerciseSet(id: string) {
  const { error } = await supabase.from('exercise_sets').delete().eq('id', id);

  if (error) throw error;
}

export async function reorderExerciseSets(
  sessionId: string,
  setIds: string[]
) {
  // Update set_number for each set based on new order
  const updates = setIds.map((id, index) => ({
    id,
    set_number: index + 1,
  }));

  for (const update of updates) {
    await updateExerciseSet(update.id, { set_number: update.set_number });
  }
}

// ========== EXERCISE LIBRARY ==========

export async function searchExerciseLibrary(
  searchTerm: string,
  filters?: {
    category?: string;
    muscleGroup?: string;
    equipment?: string;
    difficulty?: string;
  }
) {
  let query = supabase
    .from('exercise_library')
    .select('*')
    .ilike('name', `%${searchTerm}%`);

  if (filters?.category) {
    query = query.eq('category', filters.category);
  }

  if (filters?.muscleGroup) {
    query = query.contains('muscle_groups', [filters.muscleGroup]);
  }

  if (filters?.equipment) {
    query = query.contains('equipment_needed', [filters.equipment]);
  }

  if (filters?.difficulty) {
    query = query.eq('difficulty', filters.difficulty);
  }

  const { data, error } = await query
    .order('name', { ascending: true })
    .limit(50);

  if (error) throw error;
  return data as ExerciseLibrary[];
}

export async function getExerciseById(exerciseId: string) {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .eq('id', exerciseId)
    .single();

  if (error) throw error;
  return data as ExerciseLibrary;
}

export async function getAllExercises(limit = 100, offset = 0) {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .range(offset, offset + limit - 1)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as ExerciseLibrary[];
}

// ========== EXERCISE PERSONAL RECORDS ==========

export async function getPersonalRecords(userId: string) {
  const { data, error } = await supabase
    .from('exercise_personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data as ExercisePersonalRecord[];
}

export async function getPersonalRecordByExercise(userId: string, exerciseId: string) {
  const { data, error } = await supabase
    .from('exercise_personal_records')
    .select('*')
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as ExercisePersonalRecord | null;
}

export async function getRecentPRs(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('exercise_personal_records')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as ExercisePersonalRecord[];
}

// ========== EXERCISE HISTORY ==========

export async function getExerciseHistory(
  userId: string,
  exerciseId: string,
  limit = 50
) {
  const { data, error } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      workout_sessions!inner(workout_date, workout_name)
    `)
    .eq('user_id', userId)
    .eq('exercise_id', exerciseId)
    .eq('is_warmup', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getExerciseProgressChart(
  userId: string,
  exerciseId: string,
  metricType: 'weight' | 'reps' | 'volume',
  limit = 30
) {
  const sets = await getExerciseSetsByExercise(userId, exerciseId, limit);

  return sets
    .filter(set => !set.is_warmup)
    .map(set => ({
      date: set.created_at,
      value:
        metricType === 'weight'
          ? set.weight_kg || 0
          : metricType === 'reps'
          ? set.reps
          : (set.weight_kg || 0) * set.reps,
    }));
}

// ========== WORKOUT TEMPLATES ==========

export async function getWorkoutTemplates(userId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('user_id', userId)
    .order('use_count', { ascending: false });

  if (error) throw error;
  return data as WorkoutTemplate[];
}

export async function getWorkoutTemplateById(templateId: string) {
  const { data, error } = await supabase
    .from('workout_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (error) throw error;
  return data as WorkoutTemplate;
}

export async function createWorkoutTemplate(template: Partial<WorkoutTemplate>) {
  const { data, error } = await supabase
    .from('workout_templates')
    .insert([template])
    .select()
    .single();

  if (error) throw error;
  return data as WorkoutTemplate;
}

export async function updateWorkoutTemplate(
  id: string,
  updates: Partial<WorkoutTemplate>
) {
  const { data, error } = await supabase
    .from('workout_templates')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as WorkoutTemplate;
}

export async function deleteWorkoutTemplate(id: string) {
  const { error } = await supabase
    .from('workout_templates')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function incrementTemplateUseCount(id: string) {
  const template = await getWorkoutTemplateById(id);

  if (template) {
    await updateWorkoutTemplate(id, {
      use_count: template.use_count + 1,
    });
  }
}

// ========== AI WORKOUT PLAN ==========

export async function getActiveWorkoutPlan(userId: string) {
  const { data, error } = await supabase
    .from('ai_workout_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as AIWorkoutPlan | null;
}

export async function getWorkoutPlanHistory(userId: string, limit = 10) {
  const { data, error } = await supabase
    .from('ai_workout_plans')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as AIWorkoutPlan[];
}

// ========== CARDIO SESSIONS ==========

export async function getCardioSessions(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  let query = supabase
    .from('cardio_sessions')
    .select('*')
    .eq('user_id', userId);

  if (startDate) {
    query = query.gte('created_at', startDate);
  }

  if (endDate) {
    query = query.lte('created_at', endDate);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) throw error;
  return data as CardioSession[];
}

export async function createCardioSession(session: Partial<CardioSession>) {
  const { data, error } = await supabase
    .from('cardio_sessions')
    .insert([session])
    .select()
    .single();

  if (error) throw error;
  return data as CardioSession;
}

export async function updateCardioSession(
  id: string,
  updates: Partial<CardioSession>
) {
  const { data, error } = await supabase
    .from('cardio_sessions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as CardioSession;
}

export async function deleteCardioSession(id: string) {
  const { error } = await supabase.from('cardio_sessions').delete().eq('id', id);

  if (error) throw error;
}

// ========== EXERCISE API (ExerciseDB) ==========

const EXERCISEDB_API_KEY = process.env.NEXT_PUBLIC_EXERCISEDB_API_KEY || '';
const EXERCISEDB_BASE_URL = 'https://exercisedb.p.rapidapi.com';

export async function searchExerciseDB(
  searchTerm?: string,
  bodyPart?: string,
  equipment?: string,
  limit = 20,
  offset = 0
): Promise<ExerciseDBExercise[]> {
  try {
    let url = `${EXERCISEDB_BASE_URL}/exercises`;

    if (bodyPart) {
      url = `${EXERCISEDB_BASE_URL}/exercises/bodyPart/${bodyPart}`;
    } else if (equipment) {
      url = `${EXERCISEDB_BASE_URL}/exercises/equipment/${equipment}`;
    }

    url += `?limit=${limit}&offset=${offset}`;

    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': EXERCISEDB_API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch exercises from ExerciseDB');
    }

    let data = await response.json();

    // Filter by search term if provided
    if (searchTerm) {
      data = data.filter((ex: ExerciseDBExercise) =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return data;
  } catch (error) {
    console.error('ExerciseDB API error:', error);
    return [];
  }
}

export async function getExerciseDBById(id: string): Promise<ExerciseDBExercise | null> {
  try {
    const response = await fetch(`${EXERCISEDB_BASE_URL}/exercises/exercise/${id}`, {
      headers: {
        'X-RapidAPI-Key': EXERCISEDB_API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });

    if (!response.ok) return null;

    return await response.json();
  } catch (error) {
    console.error('ExerciseDB API error:', error);
    return null;
  }
}

export async function getBodyPartList(): Promise<string[]> {
  try {
    const response = await fetch(`${EXERCISEDB_BASE_URL}/exercises/bodyPartList`, {
      headers: {
        'X-RapidAPI-Key': EXERCISEDB_API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });

    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error('ExerciseDB API error:', error);
    return [];
  }
}

export async function getEquipmentList(): Promise<string[]> {
  try {
    const response = await fetch(`${EXERCISEDB_BASE_URL}/exercises/equipmentList`, {
      headers: {
        'X-RapidAPI-Key': EXERCISEDB_API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
      },
    });

    if (!response.ok) return [];

    return await response.json();
  } catch (error) {
    console.error('ExerciseDB API error:', error);
    return [];
  }
}

// ========== ANALYTICS & STATS ==========

export async function getWorkoutStats(
  userId: string,
  startDate: string,
  endDate: string
) {
  const sessions = await getWorkoutSessions(userId, startDate, endDate);

  const totalWorkouts = sessions.filter(s => s.status === 'completed').length;
  const totalVolume = sessions.reduce((sum, s) => sum + (s.total_volume_kg || 0), 0);
  const totalTime = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  const avgDuration =
    totalWorkouts > 0 ? Math.round(totalTime / totalWorkouts) : 0;

  return {
    totalWorkouts,
    totalVolume,
    totalTime,
    avgDuration,
  };
}

export async function getExerciseFrequency(userId: string, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('exercise_sets')
    .select('exercise_id, exercise_name')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Count frequency
  const frequency: Record<string, { name: string; count: number }> = {};

  data.forEach(set => {
    if (frequency[set.exercise_id]) {
      frequency[set.exercise_id].count++;
    } else {
      frequency[set.exercise_id] = {
        name: set.exercise_name,
        count: 1,
      };
    }
  });

  return Object.entries(frequency)
    .map(([id, data]) => ({ exerciseId: id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
