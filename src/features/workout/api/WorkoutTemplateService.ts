/**
 * Workout Template Service
 * Handles CRUD operations for workout templates
 */

import { supabase } from "@/lib/supabase/client";
import type { Exercise } from "@/shared/types/workout";

export interface WorkoutTemplate {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  workout_type: string;
  exercises: Exercise[];
  estimated_duration_minutes?: number;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  is_favorite: boolean;
  times_used: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkoutTemplateInput {
  name: string;
  description?: string;
  workout_type: string;
  exercises: Exercise[];
  estimated_duration_minutes?: number;
  difficulty_level?: "beginner" | "intermediate" | "advanced";
  is_favorite?: boolean;
}

export class WorkoutTemplateService {
  /**
   * Get all templates for a user
   */
  static async getUserTemplates(userId: string): Promise<WorkoutTemplate[]> {
    const { data, error } = await supabase
      .from("workout_templates")
      .select("*")
      .eq("user_id", userId)
      .order("is_favorite", { ascending: false })
      .order("times_used", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single template by ID
   */
  static async getTemplateById(templateId: string): Promise<WorkoutTemplate | null> {
    const { data, error } = await supabase
      .from("workout_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (error) {
      console.error("Error fetching template:", error);
      return null;
    }

    return data;
  }

  /**
   * Create a new workout template
   */
  static async createTemplate(
    userId: string,
    input: CreateWorkoutTemplateInput
  ): Promise<WorkoutTemplate> {
    const { data, error } = await supabase
      .from("workout_templates")
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        workout_type: input.workout_type,
        exercises: input.exercises,
        estimated_duration_minutes: input.estimated_duration_minutes,
        difficulty_level: input.difficulty_level || "intermediate",
        is_favorite: input.is_favorite || false,
        times_used: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating template:", error);
      throw error;
    }

    return data;
  }

  /**
   * Update a workout template
   */
  static async updateTemplate(
    templateId: string,
    updates: Partial<CreateWorkoutTemplateInput>
  ): Promise<WorkoutTemplate> {
    const { data, error } = await supabase
      .from("workout_templates")
      .update(updates)
      .eq("id", templateId)
      .select()
      .single();

    if (error) {
      console.error("Error updating template:", error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a workout template
   */
  static async deleteTemplate(templateId: string): Promise<void> {
    const { error } = await supabase.from("workout_templates").delete().eq("id", templateId);

    if (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }

  /**
   * Toggle favorite status
   */
  static async toggleFavorite(templateId: string, isFavorite: boolean): Promise<void> {
    const { error } = await supabase
      .from("workout_templates")
      .update({ is_favorite: isFavorite })
      .eq("id", templateId);

    if (error) {
      console.error("Error toggling favorite:", error);
      throw error;
    }
  }

  /**
   * Increment times used counter
   */
  static async incrementTimesUsed(templateId: string): Promise<void> {
    const { error } = await supabase.rpc("increment_template_usage", {
      template_id: templateId,
    });

    // Fallback if RPC doesn't exist
    if (error) {
      const { data } = await supabase
        .from("workout_templates")
        .select("times_used")
        .eq("id", templateId)
        .single();

      if (data) {
        await supabase
          .from("workout_templates")
          .update({
            times_used: (data.times_used || 0) + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("id", templateId);
      }
    }
  }
}
