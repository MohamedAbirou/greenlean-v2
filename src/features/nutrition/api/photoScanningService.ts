/**
 * Meal Photo Scanning Service
 * AI-powered food recognition and macro estimation
 * Uses free APIs: Clarifai Food Model or similar
 */

import { supabase } from "@/lib/supabase";

interface DetectedFood {
  name: string;
  confidence: number;
  estimated_calories?: number;
  estimated_protein?: number;
  estimated_carbs?: number;
  estimated_fats?: number;
  serving_size?: string;
}

interface PhotoAnalysisResult {
  detected_foods: DetectedFood[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fats: number;
  confidence_score: number;
  ai_model_used: string;
}

class PhotoScanningService {
  private readonly CLARIFAI_API_KEY = import.meta.env.VITE_CLARIFAI_API_KEY || "";
  // private readonly FOOD_MODEL_ID = 'food-item-recognition';

  /**
   * Upload meal photo and analyze with AI
   */
  async analyzeMealPhoto(
    userId: string,
    photoFile: File
  ): Promise<{
    success: boolean;
    photoLogId?: string;
    analysis?: PhotoAnalysisResult;
    error?: string;
  }> {
    try {
      // 1. Upload photo to Supabase Storage
      const fileName = `${userId}/${Date.now()}_${photoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("meal-photos")
        .upload(fileName, photoFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("meal-photos").getPublicUrl(fileName);

      // 2. Create photo log record
      const { data: photoLog, error: logError } = await supabase
        .from("meal_photo_logs")
        .insert({
          user_id: userId,
          photo_url: publicUrl,
          photo_storage_path: fileName,
          status: "processing",
        })
        .select("id")
        .single();

      if (logError) throw logError;

      // 3. Analyze photo with AI
      try {
        const analysis = await this.analyzeWithAI(publicUrl);

        // 4. Update photo log with results
        await supabase
          .from("meal_photo_logs")
          .update({
            detected_foods: analysis.detected_foods,
            estimated_calories: analysis.total_calories,
            estimated_protein: analysis.total_protein,
            estimated_carbs: analysis.total_carbs,
            estimated_fats: analysis.total_fats,
            confidence_score: analysis.confidence_score,
            ai_model_used: analysis.ai_model_used,
            status: "completed",
            processed_at: new Date().toISOString(),
          })
          .eq("id", photoLog.id);

        return {
          success: true,
          photoLogId: photoLog.id,
          analysis,
        };
      } catch (aiError: any) {
        // Update status to failed
        await supabase
          .from("meal_photo_logs")
          .update({
            status: "failed",
            error_message: aiError.message || "AI analysis failed",
          })
          .eq("id", photoLog.id);

        throw aiError;
      }
    } catch (error: any) {
      console.error("Error analyzing meal photo:", error);
      return {
        success: false,
        error: error.message || "Failed to analyze photo",
      };
    }
  }

  /**
   * Analyze photo using AI services
   * Try multiple services as fallback
   */
  private async analyzeWithAI(imageUrl: string): Promise<PhotoAnalysisResult> {
    // Try Clarifai first
    if (this.CLARIFAI_API_KEY) {
      try {
        return await this.analyzeWithClarifai(imageUrl);
      } catch (error) {
        console.warn("Clarifai failed, trying fallback...", error);
      }
    }

    // Fallback: Use LogMeal API (free tier)
    try {
      return await this.analyzeWithLogMeal(imageUrl);
    } catch (error) {
      console.warn("LogMeal failed, using basic estimation...", error);
    }

    // Last resort: Basic estimation based on image analysis
    return this.basicEstimation();
  }

  /**
   * Analyze with Clarifai Food Model
   */
  private async analyzeWithClarifai(imageUrl: string): Promise<PhotoAnalysisResult> {
    const response = await fetch(
      "https://api.clarifai.com/v2/models/food-item-recognition/outputs",
      {
        method: "POST",
        headers: {
          Authorization: `Key ${this.CLARIFAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: [
            {
              data: {
                image: { url: imageUrl },
              },
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.statusText}`);
    }

    const data = await response.json();
    const concepts = data.outputs[0].data.concepts || [];

    // Get nutritional data for detected foods
    const detectedFoods: DetectedFood[] = await Promise.all(
      concepts.slice(0, 5).map(async (concept: any) => {
        const nutrition = await this.estimateNutrition(concept.name);
        return {
          name: concept.name,
          confidence: concept.value,
          ...nutrition,
        };
      })
    );

    // Calculate totals
    const totals = detectedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.estimated_calories || 0),
        protein: acc.protein + (food.estimated_protein || 0),
        carbs: acc.carbs + (food.estimated_carbs || 0),
        fats: acc.fats + (food.estimated_fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    // Calculate average confidence
    const avgConfidence =
      detectedFoods.reduce((sum, food) => sum + food.confidence, 0) / detectedFoods.length;

    return {
      detected_foods: detectedFoods,
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein * 10) / 10,
      total_carbs: Math.round(totals.carbs * 10) / 10,
      total_fats: Math.round(totals.fats * 10) / 10,
      confidence_score: avgConfidence,
      ai_model_used: "clarifai",
    };
  }

  /**
   * Analyze with LogMeal API (free tier)
   */
  private async analyzeWithLogMeal(imageUrl: string): Promise<PhotoAnalysisResult> {
    // LogMeal offers free tier with image URL
    const response = await fetch("https://api.logmeal.es/v2/image/segmentation/complete", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_LOGMEAL_API_KEY || ""}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: imageUrl,
      }),
    });

    if (!response.ok) {
      throw new Error(`LogMeal API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse LogMeal response
    const detectedFoods: DetectedFood[] = (data.recognition?.dishes || []).map((dish: any) => ({
      name: dish.name,
      confidence: dish.prob,
      estimated_calories: dish.nutrition?.calories || 0,
      estimated_protein: dish.nutrition?.protein || 0,
      estimated_carbs: dish.nutrition?.carbs || 0,
      estimated_fats: dish.nutrition?.fat || 0,
    }));

    const totals = detectedFoods.reduce(
      (acc, food) => ({
        calories: acc.calories + (food.estimated_calories || 0),
        protein: acc.protein + (food.estimated_protein || 0),
        carbs: acc.carbs + (food.estimated_carbs || 0),
        fats: acc.fats + (food.estimated_fats || 0),
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    const avgConfidence =
      detectedFoods.reduce((sum, food) => sum + food.confidence, 0) / detectedFoods.length;

    return {
      detected_foods: detectedFoods,
      total_calories: Math.round(totals.calories),
      total_protein: Math.round(totals.protein * 10) / 10,
      total_carbs: Math.round(totals.carbs * 10) / 10,
      total_fats: Math.round(totals.fats * 10) / 10,
      confidence_score: avgConfidence,
      ai_model_used: "logmeal",
    };
  }

  /**
   * Basic estimation fallback
   */
  private async basicEstimation(): Promise<PhotoAnalysisResult> {
    // Very basic estimation - should be improved with better ML
    return {
      detected_foods: [
        {
          name: "Mixed meal",
          confidence: 0.5,
          estimated_calories: 500,
          estimated_protein: 25,
          estimated_carbs: 50,
          estimated_fats: 15,
        },
      ],
      total_calories: 500,
      total_protein: 25,
      total_carbs: 50,
      total_fats: 15,
      confidence_score: 0.5,
      ai_model_used: "basic_estimation",
    };
  }

  /**
   * Estimate nutrition for a food name
   */
  private async estimateNutrition(foodName: string): Promise<{
    estimated_calories: number;
    estimated_protein: number;
    estimated_carbs: number;
    estimated_fats: number;
  }> {
    try {
      // Try to find in our food database first
      // TODO: food_database should not be used, use USDA food database instead.
      const { data, error } = await supabase
        .from("food_database")
        .select("calories, protein, carbs, fats")
        .ilike("food_name", `%${foodName}%`)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          estimated_calories: data.calories || 0,
          estimated_protein: data.protein || 0,
          estimated_carbs: data.carbs || 0,
          estimated_fats: data.fats || 0,
        };
      }

      // Fallback: Use USDA FoodData Central (free, no key required)
      const usdaResponse = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(foodName)}&pageSize=1&api_key=DEMO_KEY`
      );

      if (usdaResponse.ok) {
        const usdaData = await usdaResponse.json();
        const food = usdaData.foods?.[0];

        if (food) {
          const nutrients = food.foodNutrients || [];
          const getNutrient = (name: string) =>
            nutrients.find((n: any) => n.nutrientName.includes(name))?.value || 0;

          return {
            estimated_calories: getNutrient("Energy"),
            estimated_protein: getNutrient("Protein"),
            estimated_carbs: getNutrient("Carbohydrate"),
            estimated_fats: getNutrient("Total lipid"),
          };
        }
      }

      // Last resort: Basic estimates based on food type
      return this.getBasicEstimate(foodName);
    } catch (error) {
      console.error("Error estimating nutrition:", error);
      return this.getBasicEstimate(foodName);
    }
  }

  /**
   * Get basic estimate based on common food categories
   */
  private getBasicEstimate(foodName: string): {
    estimated_calories: number;
    estimated_protein: number;
    estimated_carbs: number;
    estimated_fats: number;
  } {
    const name = foodName.toLowerCase();

    // Protein-rich foods
    if (name.includes("chicken") || name.includes("beef") || name.includes("fish")) {
      return {
        estimated_calories: 200,
        estimated_protein: 30,
        estimated_carbs: 0,
        estimated_fats: 8,
      };
    }

    // Carb-rich foods
    if (name.includes("rice") || name.includes("pasta") || name.includes("bread")) {
      return {
        estimated_calories: 150,
        estimated_protein: 5,
        estimated_carbs: 30,
        estimated_fats: 1,
      };
    }

    // Vegetables
    if (name.includes("salad") || name.includes("vegetable") || name.includes("broccoli")) {
      return {
        estimated_calories: 50,
        estimated_protein: 3,
        estimated_carbs: 10,
        estimated_fats: 0,
      };
    }

    // Fruits
    if (name.includes("fruit") || name.includes("apple") || name.includes("banana")) {
      return {
        estimated_calories: 80,
        estimated_protein: 1,
        estimated_carbs: 20,
        estimated_fats: 0,
      };
    }

    // Default
    return {
      estimated_calories: 100,
      estimated_protein: 5,
      estimated_carbs: 15,
      estimated_fats: 3,
    };
  }

  /**
   * Verify and edit photo analysis
   */
  async verifyPhotoAnalysis(
    photoLogId: string,
    verified: boolean,
    edits?: {
      final_calories?: number;
      final_protein?: number;
      final_carbs?: number;
      final_fats?: number;
    }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("meal_photo_logs")
        .update({
          user_verified: verified,
          user_edited: !!edits,
          ...edits,
        })
        .eq("id", photoLogId);

      return !error;
    } catch (error) {
      console.error("Error verifying photo analysis:", error);
      return false;
    }
  }

  /**
   * Convert photo log to meal items
   */
  async convertToMealLog(
    userId: string,
    photoLogId: string,
    mealType: "breakfast" | "lunch" | "dinner" | "snack",
    logDate: string = new Date().toISOString().split("T")[0]
  ): Promise<{ success: boolean; nutritionLogId?: string }> {
    try {
      // Get photo log
      const { data: photoLog, error: fetchError } = await supabase
        .from("meal_photo_logs")
        .select("*")
        .eq("id", photoLogId)
        .single();

      if (fetchError) throw fetchError;

      // Use user-edited values if available, otherwise use AI estimates
      const calories = photoLog.final_calories || photoLog.estimated_calories;
      const protein = photoLog.final_protein || photoLog.estimated_protein;
      const carbs = photoLog.final_carbs || photoLog.estimated_carbs;
      const fats = photoLog.final_fats || photoLog.estimated_fats;

      // Create nutrition log
      const { data: nutritionLog, error: logError } = await supabase
        .from("daily_nutrition_logs")
        .insert({
          user_id: userId,
          log_date: logDate,
          meal_type: mealType,
        })
        .select("id")
        .single();

      if (logError) throw logError;

      // Create meal items from detected foods
      const mealItems = (photoLog.detected_foods as any[]).map((food) => ({
        user_id: userId,
        nutrition_log_id: nutritionLog.id,
        food_name: food.name,
        serving_qty: 1,
        serving_unit: "serving",
        calories: photoLog.user_edited ? calories : food.estimated_calories || 0,
        protein: photoLog.user_edited ? protein : food.estimated_protein || 0,
        carbs: photoLog.user_edited ? carbs : food.estimated_carbs || 0,
        fats: photoLog.user_edited ? fats : food.estimated_fats || 0,
        source: "photo",
        photo_log_id: photoLogId,
      }));

      const { error: itemsError } = await supabase.from("meal_items").insert(mealItems);

      if (itemsError) throw itemsError;

      // Link photo log to nutrition log
      await supabase
        .from("meal_photo_logs")
        .update({ nutrition_log_id: nutritionLog.id })
        .eq("id", photoLogId);

      return { success: true, nutritionLogId: nutritionLog.id };
    } catch (error) {
      console.error("Error converting photo to meal log:", error);
      return { success: false };
    }
  }

  /**
   * Get user's photo logs
   */
  async getPhotoLogs(userId: string, limit: number = 20, offset: number = 0): Promise<any[]> {
    const { data, error } = await supabase
      .from("meal_photo_logs")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching photo logs:", error);
      return [];
    }

    return data || [];
  }
}

export const photoScanningService = new PhotoScanningService();
