/**
 * Dashboard Mutations Hooks
 * Updated to work with workout_sessions and exercise_sets tables
 */

import {
  DeleteNutritionDocument,
  GetDailyNutritionLogsDocument,
  LogNutritionDocument,
  UpdateNutritionDocument,
} from "@/generated/graphql";
import { supabase } from "@/lib/supabase";
import { useMutation } from "@apollo/client/react";

/**
 * Create meal item (nutrition log)
 */
export function useCreateMealItem() {
  return useMutation(LogNutritionDocument, {
    refetchQueries: [GetDailyNutritionLogsDocument],
  });
}

/**
 * Update meal item
 */
export function useUpdateMealItem() {
  return useMutation(UpdateNutritionDocument, {
    refetchQueries: [GetDailyNutritionLogsDocument],
  });
}

/**
 * Delete meal item
 */
export function useDeleteMealItem() {
  return useMutation(DeleteNutritionDocument, {
    refetchQueries: [GetDailyNutritionLogsDocument],
  });
}

/**
 * Add weight entry
 */
export function useAddWeightEntry() {
  const mutate = async (variables: {
    user_id: string;
    log_date: string;
    weight: number;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from("weight_history")
        .insert(variables)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error("Error adding weight entry:", error);
      throw error;
    }
  };

  return [mutate, { loading: false }] as const;
}

/**
 * Update weight entry
 */
export function useUpdateWeightEntry() {
  const mutate = async (variables: { id: string; set: any }) => {
    try {
      const { data, error } = await supabase
        .from("weight_history")
        .update(variables.set)
        .eq("id", variables.id)
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error("Error updating weight entry:", error);
      throw error;
    }
  };

  return [mutate, { loading: false }] as const;
}

/**
 * Delete weight entry
 */
export function useDeleteWeightEntry() {
  const mutate = async (variables: { id: string }) => {
    try {
      const { error } = await supabase.from("weight_history").delete().eq("id", variables.id);

      if (error) throw error;
      return { data: { success: true } };
    } catch (error) {
      console.error("Error deleting weight entry:", error);
      throw error;
    }
  };

  return [mutate, { loading: false }] as const;
}

/**
 * Upsert daily water intake
 */
export function useUpsertWaterIntake() {
  const mutate = async (variables: { user_id: string; log_date: string; amount_ml: number }) => {
    try {
      const { data, error } = await supabase
        .from("daily_water_intake")
        .upsert(variables, {
          onConflict: "user_id,log_date",
        })
        .select()
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error("Error upserting water intake:", error);
      throw error;
    }
  };

  return [mutate, { loading: false }] as const;
}
