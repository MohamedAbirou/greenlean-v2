/**
 * PhotoScanner Component
 * AI-powered meal photo analysis
 */

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, Check, Edit3, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { usePhotoScanning } from '../hooks/usePhotoScanning';

interface PhotoScannerProps {
  userId: string;
  onFoodsDetected: (foods: any[]) => void;
  onClose: () => void;
}

export function PhotoScanner({ userId, onFoodsDetected, onClose }: PhotoScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<any>(null);

  const {
    isAnalyzing,
    analysisResult,
    analyzeMealPhoto,
    verifyAnalysis,
    reset,
  } = usePhotoScanning();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large', {
        description: 'Please select an image smaller than 10MB',
      });
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze photo
    await analyzeMealPhoto(userId, file);
  };

  const handleUseResults = async () => {
    if (!analysisResult) return;

    // Verify with edits if any
    if (editedValues) {
      await verifyAnalysis(true, editedValues);
    } else {
      await verifyAnalysis(true);
    }

    // Convert detected foods to format expected by parent
    const foods = analysisResult.detected_foods.map((food: any) => ({
      name: food.name,
      portion: food.serving_size || '1 serving',
      calories: editedValues?.final_calories || food.estimated_calories || 0,
      protein: editedValues?.final_protein || food.estimated_protein || 0,
      carbs: editedValues?.final_carbs || food.estimated_carbs || 0,
      fats: editedValues?.final_fats || food.estimated_fats || 0,
      confidence: food.confidence,
      source: 'photo',
    }));

    onFoodsDetected(foods);
    handleClose();
  };

  const handleClose = () => {
    reset();
    setPhotoPreview(null);
    setEditedValues(null);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full"
      >
        <Card variant="elevated" padding="lg">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Scan Meal Photo</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Photo upload */}
            {!photoPreview && !isAnalyzing && (
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Take Photo or Upload
                </Button>
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  AI will analyze your meal and estimate calories & macros
                </p>
              </div>
            )}

            {/* Photo preview */}
            {photoPreview && (
              <div className="relative">
                <img
                  src={photoPreview}
                  alt="Meal preview"
                  className="w-full h-48 object-cover rounded-lg"
                />
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                    <div className="text-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                      <p className="text-sm">Analyzing your meal...</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analysis results */}
            {analysisResult && !isAnalyzing && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Detected Foods ({analysisResult.detected_foods.length})
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.detected_foods.map((food: any, index: number) => (
                      <li
                        key={index}
                        className="text-sm flex items-center justify-between"
                      >
                        <span>{food.name}</span>
                        <span className="text-muted-foreground">
                          {Math.round(food.confidence * 100)}% confident
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nutrition totals */}
                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Estimated Nutrition</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-calories">Calories</Label>
                      <Input
                        id="edit-calories"
                        type="number"
                        defaultValue={analysisResult.total_calories}
                        onChange={(e) =>
                          setEditedValues({
                            ...editedValues,
                            final_calories: parseInt(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-protein">Protein (g)</Label>
                      <Input
                        id="edit-protein"
                        type="number"
                        defaultValue={analysisResult.total_protein}
                        onChange={(e) =>
                          setEditedValues({
                            ...editedValues,
                            final_protein: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-carbs">Carbs (g)</Label>
                      <Input
                        id="edit-carbs"
                        type="number"
                        defaultValue={analysisResult.total_carbs}
                        onChange={(e) =>
                          setEditedValues({
                            ...editedValues,
                            final_carbs: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-fats">Fats (g)</Label>
                      <Input
                        id="edit-fats"
                        type="number"
                        defaultValue={analysisResult.total_fats}
                        onChange={(e) =>
                          setEditedValues({
                            ...editedValues,
                            final_fats: parseFloat(e.target.value),
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" />
                    Adjust values if needed before adding
                  </p>
                </div>

                {/* Confidence indicator */}
                {analysisResult.confidence_score < 0.7 && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <p className="text-sm text-warning">
                      ⚠️ Low confidence detection. Please verify the values above.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleUseResults}
                    className="flex-1"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Add to Meal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
