/**
 * Dashboard Mutations Hooks
 * Updated to work with workout_sessions and exercise_sets tables
 */

import { supabase } from "@/lib/supabase";

/**
 * Add weight entry
 */
export async function addWeightEntry(
  user_id: string,
  log_date: string,
  weight: number,
  notes?: string
) {
  try {
    const { data, error } = await supabase
      .from("weight_history")
      .insert({
        user_id,
        log_date,
        weight,
        notes,
      })
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Error adding weight entry:", error);
    throw error;
  }
}

/**
 * Update weight entry
 */
export async function updateWeightEntry(id: string, set: any) {
  try {
    const { data, error } = await supabase
      .from("weight_history")
      .update(set)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Error updating weight entry:", error);
    throw error;
  }
}

/**
 * Delete weight entry
 */
export async function deleteWeightEntry(id: string) {
  try {
    const { error } = await supabase.from("weight_history").delete().eq("id", id);

    if (error) throw error;
    return { data: { success: true } };
  } catch (error) {
    console.error("Error deleting weight entry:", error);
    throw error;
  }
}

/**
 * Upsert daily water intake
 */
export async function upsertWaterIntake(user_id: string, log_date: string, amount_ml: number) {
  try {
    const { data, error } = await supabase
      .from("daily_water_intake")
      .upsert(
        {
          user_id,
          log_date,
          amount_ml,
        },
        {
          onConflict: "user_id,log_date",
        }
      )
      .select()
      .single();

    if (error) throw error;
    return { data };
  } catch (error) {
    console.error("Error upserting water intake:", error);
    throw error;
  }
}
