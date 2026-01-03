/**
 * VoiceRecorder Component
 * Voice-to-text meal logging
 */

import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Loader2, Mic, MicOff, X } from 'lucide-react';
import { useState } from 'react';
import { useVoiceLogging } from '../hooks/useVoiceLogging';

interface VoiceRecorderProps {
  userId: string;
  onFoodsDetected: (foods: any[]) => void;
  onClose: () => void;
}

export function VoiceRecorder({ userId, onFoodsDetected, onClose }: VoiceRecorderProps) {
  const [recordingDuration, setRecordingDuration] = useState(0);

  const {
    isSupported,
    isRecording,
    isProcessing,
    transcription,
    parsedResult,
    startRecording,
    stopRecording,
    processVoiceLog,
    reset,
  } = useVoiceLogging();

  // Recording duration timer
  useState(() => {
    let interval: number;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingDuration(0);
    }
    return () => clearInterval(interval);
  });

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    const transcriptionResult = await stopRecording();
    if (transcriptionResult) {
      // Automatically process the transcription
      await processVoiceLog(userId);
    }
  };

  const handleUseResults = () => {
    if (!parsedResult) return;

    // Convert parsed foods to format expected by parent
    const foods = parsedResult.parsed_foods.map((food: any) => ({
      name: food.name,
      portion: food.unit ? `${food.quantity} ${food.unit}` : '1 serving',
      calories: 0, // Will be looked up from database
      protein: 0,
      carbs: 0,
      fats: 0,
      source: 'voice',
      needsLookup: true, // Flag to trigger nutrition lookup
    }));

    onFoodsDetected(foods);
    handleClose();
  };

  const handleClose = () => {
    reset();
    setRecordingDuration(0);
    onClose();
  };

  if (!isSupported) {
    return (
      <Card variant="elevated" padding="lg">
        <div className="text-center py-8">
          <MicOff className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Voice recording is not supported in your browser.
            <br />
            Please use Chrome, Edge, or Safari.
          </p>
          <Button variant="outline" onClick={onClose} className="mt-4">
            Close
          </Button>
        </div>
      </Card>
    );
  }

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
                <Mic className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold">Voice Logging</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Recording interface */}
            {!transcription && !isProcessing && (
              <div className="text-center py-8">
                {!isRecording ? (
                  <div className="space-y-4">
                    <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="w-10 h-10 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Start Voice Recording</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Describe what you ate, including quantities
                        <br />
                        <span className="text-xs">
                          Example: "I had 2 eggs, toast, and a protein shake for breakfast"
                        </span>
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={handleStartRecording}
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center"
                    >
                      <Mic className="w-10 h-10 text-destructive" />
                    </motion.div>
                    <div>
                      <h4 className="font-medium text-destructive mb-2">
                        Recording in progress...
                      </h4>
                      <p className="text-3xl font-bold mb-2">
                        {Math.floor(recordingDuration / 60)}:
                        {String(recordingDuration % 60).padStart(2, '0')}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Speak clearly and describe your meal
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="lg"
                      onClick={handleStopRecording}
                    >
                      <MicOff className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Processing */}
            {isProcessing && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="font-medium">Processing your recording...</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Analyzing speech and identifying foods
                </p>
              </div>
            )}

            {/* Results */}
            {transcription && parsedResult && !isProcessing && (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">What you said:</h4>
                  <p className="text-sm text-muted-foreground italic">
                    "{transcription}"
                  </p>
                </div>

                <div className="bg-primary/5 rounded-lg p-4">
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-success" />
                    Detected Foods ({parsedResult.parsed_foods.length})
                  </h4>
                  {parsedResult.parsed_foods.length > 0 ? (
                    <ul className="space-y-2">
                      {parsedResult.parsed_foods.map((food: any, index: number) => (
                        <li key={index} className="text-sm flex items-center justify-between">
                          <span className="font-medium">{food.name}</span>
                          <span className="text-muted-foreground">
                            {food.quantity && food.unit
                              ? `${food.quantity} ${food.unit}`
                              : '1 serving'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No foods detected. Please try recording again.
                    </p>
                  )}
                </div>

                {parsedResult.meal_type && (
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Detected meal type:</span>{' '}
                    {parsedResult.meal_type}
                  </div>
                )}

                {/* Confidence warning */}
                {parsedResult.confidence_score < 0.6 && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                    <p className="text-sm text-warning">
                      ⚠️ Low confidence detection. You may need to edit the meal details.
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
                    disabled={parsedResult.parsed_foods.length === 0}
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
