import { supabase } from "@/lib/supabase";
import imageCompression from "browser-image-compression";
import type { Invoice, Profile, ProfileUpdateData, SubscriptionInfo } from "../types/profile.types";

const API_BASE_URL = import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000";

export class ProfileService {
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase.from("profiles").select("*, admin_users(role)").eq("id", userId).single();

    if (error) throw error;
    return data;
  }

  static async updateProfile(userId: string, updates: ProfileUpdateData): Promise<Profile> {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;

    // Check if fields affecting macros were updated
    const fieldsAffectingMacros = ['weight_kg', 'height_cm', 'age', 'activity_level'];
    const shouldRecalculate = Object.keys(updates).some(key =>
      fieldsAffectingMacros.includes(key)
    );

    if (shouldRecalculate) {
      // Recalculate macros in background (don't wait)
      this.recalculateMacros(userId, data).catch(err => {
        console.error('Failed to recalculate macros:', err);
      });
    }

    return data;
  }

  private static async recalculateMacros(userId: string, profile: Profile): Promise<void> {
    try {
      // Get latest goal from quiz_results
      const { data: quizResult } = await supabase
        .from('quiz_results')
        .select('quiz_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!quizResult) {
        console.log('No quiz result found, skipping macro recalculation');
        return;
      }

      const goal = quizResult.quiz_data.mainGoal || 'maintain';
      const dietType = quizResult.quiz_data.dietaryStyle || 'balanced';
      const activityLevel = profile.activity_level || 'moderately_active';

      // BMR calculation (Harris-Benedict formula)
      const weight = profile.weight_kg || 70;
      const height = profile.height_cm || 170;
      const age = profile.age || 30;
      const gender = profile.gender || 'male';

      let bmr: number;
      if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
      } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
      }

      // Activity multipliers
      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extremely_active: 1.9,
      };

      const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

      // Adjust based on goal
      let dailyCalories = tdee;
      if (goal === 'lose_weight') {
        dailyCalories = tdee - 500; // 500 cal deficit
      } else if (goal === 'gain_muscle') {
        dailyCalories = tdee + 300; // 300 cal surplus
      }

      // Macro distribution based on diet type
      let proteinRatio = 0.30;
      let carbsRatio = 0.40;
      let fatsRatio = 0.30;

      if (dietType === 'keto') {
        proteinRatio = 0.25;
        carbsRatio = 0.05;
        fatsRatio = 0.70;
      } else if (dietType === 'mediterranean') {
        proteinRatio = 0.20;
        carbsRatio = 0.40;
        fatsRatio = 0.40;
      } else if (dietType === 'vegetarian' || dietType === 'vegan') {
        proteinRatio = 0.25;
        carbsRatio = 0.45;
        fatsRatio = 0.30;
      }

      const protein = Math.round((dailyCalories * proteinRatio) / 4); // 4 cal per gram
      const carbs = Math.round((dailyCalories * carbsRatio) / 4);
      const fats = Math.round((dailyCalories * fatsRatio) / 9); // 9 cal per gram

      // Update macro targets with new effective date
      const { error: macroError } = await supabase
        .from('user_macro_targets')
        .upsert({
          user_id: userId,
          effective_date: new Date().toISOString().split('T')[0],
          daily_calories: Math.round(dailyCalories),
          daily_protein_g: protein,
          daily_carbs_g: carbs,
          daily_fats_g: fats,
          daily_water_ml: 2000,
          source: 'profile_update',
          notes: 'Auto-recalculated from profile changes',
        }, {
          onConflict: 'user_id,effective_date',
        });

      if (macroError) {
        console.error('Error updating macro targets:', macroError);
      } else {
        console.log('Macro targets recalculated successfully:', {
          calories: Math.round(dailyCalories),
          protein,
          carbs,
          fats,
        });
      }
    } catch (error) {
      console.error('Error in recalculateMacros:', error);
      throw error;
    }
  }

  static async uploadAvatar(userId: string, file: File): Promise<string> {
    // Compress the image
    const options = {
      maxSizeMB: 0.1, // 100KB max! adjust as needed
      maxWidthOrHeight: 400, // resize to 300x300 max
      useWebWorker: true,
    };

    const compressedFile = await imageCompression(file, options);

    // Construct path (first folder = userId, matches your RLS)
    const fileExt = compressedFile.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    // Upload
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, compressedFile, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

    await this.updateProfile(userId, { avatar_url: data.publicUrl });

    return data.publicUrl;
  }

  static async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
    const path = avatarUrl.split("/avatars/")[1];
    if (path) {
      await supabase.storage.from("avatars").remove([`avatars/${path}`]);
    }
    await this.updateProfile(userId, { avatar_url: null });
  }

  // Stripe-related methods
  static async getSubscription(customerId: string): Promise<SubscriptionInfo | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stripe/customer/${customerId}`);
      const result = await response.json();

      if (!result.success || !result.customer.subscriptions?.data?.length) {
        return null;
      }

      const sub = result.customer.subscriptions.data[0];
      return {
        subscription_id: sub.id,
        status: sub.status,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        plan_id: sub.items.data[0].price.id,
        plan_name: sub.items.data[0].price.nickname || "Unknown",
      };
    } catch (error) {
      console.error("Error fetching subscription:", error);
      return null;
    }
  }

  static async getInvoices(customerId: string): Promise<Invoice[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stripe/invoices?customer_id=${customerId}`);
      const result = await response.json();

      if (!result.success) return [];

      return result.invoices.map((inv: any) => ({
        id: inv.id,
        amount_due: inv.amount_due,
        amount_paid: inv.amount_paid,
        created: inv.created,
        currency: inv.currency,
        hosted_invoice_url: inv.hosted_invoice_url,
        invoice_pdf: inv.invoice_pdf,
        status: inv.status,
        period_start: inv.period_start,
        period_end: inv.period_end,
      }));
    } catch (error) {
      console.error("Error fetching invoices:", error);
      return [];
    }
  }

  static async cancelSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stripe/cancel-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_id: subscriptionId }),
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      return false;
    }
  }

  static async changePlan(subscriptionId: string, newPriceId: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/stripe/change-plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscription_id: subscriptionId,
          new_price_id: newPriceId,
        }),
      });
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error("Error changing plan:", error);
      return false;
    }
  }
}
