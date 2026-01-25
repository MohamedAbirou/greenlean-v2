/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI Photo Analysis Component - Production Ready
 * Uses Claude Vision API via Supabase Edge Function
 * Supports camera capture and file upload
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Progress } from '@/shared/components/ui/progress';
import type { MealItem } from '@/shared/types/food.types';
import imageCompression from 'browser-image-compression';
import { useRef, useState } from 'react';

interface PhotoAnalysisProps {
  onFoodsRecognized: (items: MealItem[]) => void;
  onClose: () => void;
}

export function PhotoAnalysis({ onFoodsRecognized, onClose }: PhotoAnalysisProps) {
  const [captureMode, setCaptureMode] = useState<'camera' | 'upload' | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [recognizedFoods, setRecognizedFoods] = useState<MealItem[]>([]);
  const [error, setError] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check camera support
  const isCameraSupported =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    !!navigator.mediaDevices.getUserMedia;

  // Start camera
  const startCamera = async () => {
    if (!isCameraSupported) {
      setError('Camera not supported on this device');
      return;
    }

    try {
      setError('');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(err => {
            console.error('Error playing video:', err);
            setError('Failed to start video preview');
          });
        };
      }

      streamRef.current = stream;
      setCaptureMode('camera');
    } catch (err: any) {
      console.error('Camera error:', err);
      setError(`Failed to access camera: ${err.message}. Please grant camera permissions.`);
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCaptureMode(null);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageData);
      stopCamera();
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    try {
      // Compress image before processing
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        setCaptureMode('upload');
        setError('');
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error('Error processing image:', err);
      setError('Failed to process image');
    }
  };

  // Analyze image with AI via Supabase Edge Function
  const analyzeImage = async () => {
    if (!capturedImage) return;

    setAnalyzing(true);
    setAnalysisProgress(0);
    setError('');

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Call Supabase Edge Function for photo analysis
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/photo-analysis`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ imageBase64: capturedImage }),
        }
      );

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      const data = await response.json();

      if (data.success && data.items) {
        setRecognizedFoods(data.items);
      } else {
        setError(data.error || 'Failed to analyze image. Please try again.');
      }
    } catch (err: any) {
      console.error('Analysis error:', err);
      setError('Failed to analyze image. Please try again.');
    } finally {
      setAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  // Edit recognized food
  const handleEditFood = (index: number, field: string, value: any) => {
    const updated = [...recognizedFoods];
    (updated[index] as any)[field] = value;
    setRecognizedFoods(updated);
  };

  // Remove recognized food
  const handleRemoveFood = (index: number) => {
    setRecognizedFoods(recognizedFoods.filter((_, i) => i !== index));
  };

  // Confirm and add items
  const handleConfirmFoods = () => {
    if (recognizedFoods.length === 0) return;
    onFoodsRecognized(recognizedFoods);
    onClose();
  };

  // Reset to initial state
  const handleReset = () => {
    setCapturedImage(null);
    setRecognizedFoods([]);
    setCaptureMode(null);
    setError('');
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>AI Photo Analysis</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Take or upload a photo of your meal for AI-powered nutrition analysis
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕ Close
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Initial Options */}
        {!capturedImage && !captureMode && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📸</div>
              <h3 className="text-xl font-semibold mb-2">Capture Your Meal</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Take a photo or upload an image, and our AI will identify items and estimate
                nutrition values.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isCameraSupported && (
                <Button variant="primary" size="lg" onClick={startCamera} fullWidth>
                  📷 Take Photo
                </Button>
              )}
              <Button
                variant="outline"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                fullWidth
              >
                📁 Upload Photo
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {/* Tips */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Tips for Best Results:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Capture the entire plate with all items visible</li>
                <li>• Use good lighting - natural light works best</li>
                <li>• Take photo from directly above the plate</li>
                <li>• Include common items (fork, coin) for scale reference</li>
                <li>• Avoid shadows and reflections</li>
              </ul>
            </div>
          </div>
        )}

        {/* Camera View */}
        {captureMode === 'camera' && !capturedImage && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ minHeight: '400px' }}>
              <video
                ref={videoRef}
                className="w-full h-auto"
                playsInline
                muted
                autoPlay
                style={{
                  maxHeight: '500px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
              <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="flex gap-3">
              <Button variant="primary" size="lg" onClick={capturePhoto} fullWidth>
                📸 Capture Photo
              </Button>
              <Button variant="outline" size="lg" onClick={stopCamera}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Captured Image Preview */}
        {capturedImage && recognizedFoods.length === 0 && (
          <div className="space-y-4">
            <div className="relative rounded-lg overflow-hidden border-2 border-border">
              <img
                src={capturedImage}
                alt="Captured meal"
                className="w-full h-auto max-h-[400px] object-contain bg-black"
              />
            </div>

            {analyzing ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-primary-500 border-t-transparent"></div>
                  <span className="text-sm font-medium">Analyzing image with AI...</span>
                </div>
                <Progress value={analysisProgress} className="h-2" />
                <p className="text-xs text-center text-muted-foreground">
                  Recognizing items and estimating portions...
                </p>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={analyzeImage}
                  fullWidth
                  disabled={analyzing}
                >
                  🤖 Analyze with AI
                </Button>
                <Button variant="outline" size="lg" onClick={handleReset}>
                  Retake
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Recognized Foods */}
        {recognizedFoods.length > 0 && (
          <div className="space-y-4">
            {/* Thumbnail */}
            {capturedImage && (
              <div className="relative rounded-lg overflow-hidden border border-border">
                <img
                  src={capturedImage}
                  alt="Analyzed meal"
                  className="w-full h-32 object-cover"
                />
                <Badge
                  variant="success"
                  className="absolute top-2 right-2 backdrop-blur"
                >
                  ✓ {recognizedFoods.length} Food{recognizedFoods.length !== 1 ? 's' : ''}{' '}
                  Detected
                </Badge>
              </div>
            )}

            {/* Recognized Foods List */}
            <div>
              <h4 className="font-semibold mb-3">Recognized Foods</h4>
              <div className="space-y-3">
                {recognizedFoods.map((food, index) => (
                  <Card key={food.id} className="border-primary-500/30">
                    <CardContent className="pt-4 space-y-3">
                      {/* Food Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              value={food.food_name}
                              onChange={(e) => handleEditFood(index, 'name', e.target.value)}
                              className="font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary-500 outline-none"
                            />
                            {food.confidence && (
                              <Badge
                                variant={food.confidence > 0.8 ? 'success' : 'warning'}
                                className="text-xs"
                              >
                                {Math.round(food.confidence * 100)}% confident
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Estimated: {food.portion_estimate}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFood(index)}
                          className="text-error"
                        >
                          🗑️
                        </Button>
                      </div>

                      {/* Quantity */}
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium">Quantity:</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={food.serving_qty}
                          onChange={(e) =>
                            handleEditFood(index, 'quantity', parseFloat(e.target.value) || 1)
                          }
                          className="w-20 px-2 py-1 border border-border rounded text-sm"
                        />
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          value={food.serving_unit}
                          onChange={(e) =>
                            handleEditFood(index, 'serving_unit', parseFloat(e.target.value) || 1)
                          }
                          className="w-20 px-2 py-1 border border-border rounded text-sm"
                        />
                        <span className="text-sm text-muted-foreground">x {food.serving_unit}</span>
                      </div>

                      {/* Nutrition */}
                      <div className="grid grid-cols-4 gap-2 text-center p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {Math.round(food.calories * food.serving_qty)}
                          </p>
                          <p className="text-xs text-muted-foreground">cal</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                            {Math.round(food.protein * food.serving_qty)}g
                          </p>
                          <p className="text-xs text-muted-foreground">protein</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {Math.round(food.carbs * food.serving_qty)}g
                          </p>
                          <p className="text-xs text-muted-foreground">carbs</p>
                        </div>
                        <div>
                          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                            {Math.round(food.fats * food.serving_qty)}g
                          </p>
                          <p className="text-xs text-muted-foreground">fat</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button variant="primary" size="lg" onClick={handleConfirmFoods} fullWidth>
                Add {recognizedFoods.length} Food{recognizedFoods.length !== 1 ? 's' : ''} to Meal
              </Button>
              <Button variant="outline" size="lg" onClick={handleReset}>
                Retake
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-error/10 border border-error rounded-lg">
            <p className="text-sm text-error">{error}</p>
          </div>
        )}

        {/* Info */}
        <div className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/20">
          <h4 className="text-sm font-semibold mb-2">🤖 AI-Powered Recognition</h4>
          <p className="text-xs text-muted-foreground mb-2">
            Our AI analyzes your photo to identify items, estimate portion sizes, and calculate
            nutrition values. You can edit any recognized items before adding them.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Claude Vision API
          </p>
        </div>
      </CardContent>
    </Card>
  );
}