/**
 * usePhotoScanning Hook
 * React hook for meal photo scanning with AI analysis
 */

import { useState, useCallback } from 'react';
import { photoScanningService } from '../api/photoScanningService';
import { toast } from 'sonner';

export function usePhotoScanning() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [photoLogId, setPhotoLogId] = useState<string | null>(null);

  /**
   * Analyze a meal photo
   */
  const analyzeMealPhoto = useCallback(async (userId: string, photoFile: File) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await photoScanningService.analyzeMealPhoto(userId, photoFile);

      if (result.success && result.analysis) {
        setAnalysisResult(result.analysis);
        setPhotoLogId(result.photoLogId || null);
        toast.success('Photo analyzed successfully!', {
          description: `Found ${result.analysis.detected_foods.length} food items`,
        });
        return result.analysis;
      } else {
        toast.error('Failed to analyze photo', {
          description: result.error || 'Please try again',
        });
        return null;
      }
    } catch (error: any) {
      console.error('Error analyzing photo:', error);
      toast.error('Error analyzing photo', {
        description: error.message || 'Please try again',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Verify and edit analysis results
   */
  const verifyAnalysis = useCallback(
    async (
      verified: boolean,
      edits?: {
        final_calories?: number;
        final_protein?: number;
        final_carbs?: number;
        final_fats?: number;
      }
    ) => {
      if (!photoLogId) return false;

      const success = await photoScanningService.verifyPhotoAnalysis(
        photoLogId,
        verified,
        edits
      );

      if (success) {
        toast.success('Analysis updated');
      }

      return success;
    },
    [photoLogId]
  );

  /**
   * Convert photo log to meal items
   */
  const convertToMealLog = useCallback(
    async (
      userId: string,
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
      logDate?: string
    ) => {
      if (!photoLogId) {
        toast.error('No photo analysis available');
        return null;
      }

      const result = await photoScanningService.convertToMealLog(
        userId,
        photoLogId,
        mealType,
        logDate
      );

      if (result.success) {
        toast.success('Meal logged successfully!');
        return result.nutritionLogId;
      } else {
        toast.error('Failed to log meal');
        return null;
      }
    },
    [photoLogId]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setAnalysisResult(null);
    setPhotoLogId(null);
  }, []);

  return {
    isAnalyzing,
    analysisResult,
    photoLogId,
    analyzeMealPhoto,
    verifyAnalysis,
    convertToMealLog,
    reset,
  };
}
