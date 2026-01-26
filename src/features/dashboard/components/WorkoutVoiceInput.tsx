/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Workout Voice Input Component
 * Speech-to-text workout logging using Web Speech API
 * Production-ready voice recognition for exercise tracking
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { useEffect, useRef, useState } from 'react';

interface RecognizedExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  confidence: number;
}

interface WorkoutVoiceInputProps {
  onExercisesRecognized: (exercises: RecognizedExercise[]) => void;
  onClose?: () => void;
}

export function WorkoutVoiceInput({ onExercisesRecognized, onClose }: WorkoutVoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [recognizedExercises, setRecognizedExercises] = useState<RecognizedExercise[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  // Check browser support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition is not supported in this browser. Try Chrome or Edge.');
      return;
    }

    // Initialize speech recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript + ' ';
        } else {
          interim += transcript;
        }
      }

      if (final) {
        setTranscript((prev) => prev + final);
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please grant permissions.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Try again.');
      } else {
        setError(`Error: ${event.error}`);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return;

    setError('');
    setTranscript('');
    setInterimTranscript('');
    setRecognizedExercises([]);

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start recognition:', err);
      setError('Failed to start speech recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  // Process transcript to extract exercises
  const processTranscript = async () => {
    if (!transcript.trim()) return;

    setProcessing(true);
    setError('');

    try {
      // Parse natural language exercise descriptions
      const exercises = parseNaturalLanguage(transcript);

      if (exercises.length === 0) {
        setError('No exercises recognized. Try being more specific (e.g., "3 sets of 10 bench press at 135 pounds")');
        setProcessing(false);
        return;
      }

      setRecognizedExercises(exercises as RecognizedExercise[]);
    } catch (err) {
      console.error('Error processing transcript:', err);
      setError('Failed to process exercises. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // Parse natural language to extract exercises
  const parseNaturalLanguage = (text: string): Partial<RecognizedExercise>[] => {
    const exercises: Partial<RecognizedExercise>[] = [];
    const lowerText = text.toLowerCase();

    // Common exercise patterns
    const patterns = [
      // "3 sets of 10 bench press at 135 pounds"
      /(\d+)\s*sets?\s*of\s*(\d+)\s*(?:reps?\s*)?(.+?)\s*(?:at|with|@)\s*(\d+)\s*(?:pounds?|lbs?|kg|kilos?)/gi,
      // "10 reps of bench press at 135 pounds" (3 sets assumed)
      /(\d+)\s*reps?\s*(?:of\s*)?(.+?)\s*(?:at|with|@)\s*(\d+)\s*(?:pounds?|lbs?|kg|kilos?)/gi,
      // "bench press 3 sets 10 reps 135 pounds"
      /(.+?)\s*(\d+)\s*sets?\s*(\d+)\s*reps?\s*(\d+)\s*(?:pounds?|lbs?|kg|kilos?)/gi,
      // "3 sets bench press 135 pounds" (10 reps assumed)
      /(\d+)\s*sets?\s*(.+?)\s*(\d+)\s*(?:pounds?|lbs?|kg|kilos?)/gi,
    ];

    // Known exercises database
    const knownExercises = [
      'bench press', 'squat', 'deadlift', 'overhead press', 'barbell row',
      'pull up', 'chin up', 'dip', 'push up', 'plank',
      'bicep curl', 'tricep extension', 'lateral raise', 'shoulder press',
      'leg press', 'leg curl', 'leg extension', 'calf raise',
      'lat pulldown', 'cable row', 'face pull',
      'incline press', 'decline press', 'dumbbell press',
    ];

    patterns.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let sets = 3;
        let reps = 10;
        let weight = 0;
        let name = '';

        // Pattern 1: "3 sets of 10 bench press at 135 pounds"
        if (pattern === patterns[0] && match.length === 5 && match[1] && match[2] && match[3] && match[4]) {
          sets = parseInt(match[1]) || 3;
          reps = parseInt(match[2]) || 10;
          name = match[3].trim();
          weight = parseInt(match[4]) || 0;
        }
        // Pattern 2: "10 reps of bench press at 135 pounds"
        else if (pattern === patterns[1] && match.length === 4 && match[1] && match[2] && match[3]) {
          reps = parseInt(match[1]) || 10;
          name = match[2].trim();
          weight = parseInt(match[3]) || 0;
          sets = 3; // Assume 3 sets
        }
        // Pattern 3: "bench press 3 sets 10 reps 135 pounds"
        else if (pattern === patterns[2] && match.length === 5 && match[1] && match[2] && match[3] && match[4]) {
          name = match[1].trim();
          sets = parseInt(match[2]) || 3;
          reps = parseInt(match[3]) || 10;
          weight = parseInt(match[4]) || 0;
        }
        // Pattern 4: "3 sets bench press 135 pounds"
        else if (pattern === patterns[3] && match.length === 4 && match[1] && match[2] && match[3]) {
          sets = parseInt(match[1]) || 3;
          name = match[2].trim();
          weight = parseInt(match[3]) || 0;
          reps = 10; // Assume 10 reps
        }

        if (name && knownExercises.some((ex) => name.includes(ex) || ex.includes(name))) {
          exercises.push({
            id: `voice-ex-${Date.now()}-${exercises.length}`,
            name: name.charAt(0).toUpperCase() + name.slice(1),
            sets,
            reps,
            weight,
            confidence: 0.85,
          });
        }
      }
    });

    // Fallback: check for exercise names without full details
    if (exercises.length === 0) {
      knownExercises.forEach((exercise) => {
        if (lowerText.includes(exercise)) {
          exercises.push({
            id: `voice-ex-${Date.now()}-${exercises.length}`,
            name: exercise.charAt(0).toUpperCase() + exercise.slice(1),
            sets: 3,
            reps: 10,
            weight: 0,
            confidence: 0.6,
          });
        }
      });
    }

    return exercises;
  };

  const handleConfirm = () => {
    if (recognizedExercises.length > 0) {
      onExercisesRecognized(recognizedExercises);
    }
  };

  const handleEdit = (index: number, field: keyof RecognizedExercise, value: any) => {
    const updated = [...recognizedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setRecognizedExercises(updated);
  };

  const handleRemove = (index: number) => {
    setRecognizedExercises(recognizedExercises.filter((_, i) => i !== index));
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Voice Workout Logging</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us what exercises you did and we'll log them for you
            </p>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {!isSupported ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎤</div>
            <h3 className="text-xl font-semibold mb-2">Browser Not Supported</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <p className="text-sm text-muted-foreground">
              Please use Chrome, Edge, or Safari for voice input.
            </p>
          </div>
        ) : (
          <>
            {/* Microphone */}
            <div className="text-center">
              <div
                className={`inline-flex items-center justify-center w-32 h-32 rounded-full transition-all ${isListening
                    ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50'
                    : 'bg-primary-500 hover:bg-primary-600'
                  }`}
              >
                <button
                  onClick={isListening ? stopListening : startListening}
                  className="text-white"
                  disabled={processing}
                >
                  <span className="text-6xl">{isListening ? '🎙️' : '🎤'}</span>
                </button>
              </div>
              <p className="mt-4 text-sm font-medium">
                {isListening ? 'Listening...' : 'Tap to start recording'}
              </p>
              {isListening && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={stopListening}
                  className="mt-2"
                >
                  Stop Recording
                </Button>
              )}
            </div>

            {/* Transcript */}
            {(transcript || interimTranscript) && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2">Transcript:</h4>
                <p className="text-sm">
                  {transcript}
                  {interimTranscript && (
                    <span className="text-muted-foreground italic">{interimTranscript}</span>
                  )}
                </p>
                {!isListening && transcript && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={processTranscript}
                    loading={processing}
                    className="mt-3"
                  >
                    Process Exercises
                  </Button>
                )}
              </div>
            )}

            {/* Recognized Exercises */}
            {recognizedExercises.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <span>💪</span> Recognized Exercises ({recognizedExercises.length})
                </h4>
                {recognizedExercises.map((exercise, index) => (
                  <Card key={exercise.id} className="border-primary-500/30">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <input
                              type="text"
                              value={exercise.name}
                              onChange={(e) => handleEdit(index, 'name', e.target.value)}
                              className="font-semibold bg-transparent border-b border-transparent hover:border-border focus:border-primary-500 outline-none"
                            />
                            <Badge
                              variant={exercise.confidence > 0.8 ? 'success' : 'warning'}
                              className="text-xs"
                            >
                              {Math.round(exercise.confidence * 100)}% confident
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(index)}
                          className="text-error"
                        >
                          🗑️
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs text-muted-foreground">Sets</label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) =>
                              handleEdit(index, 'sets', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Reps</label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.reps}
                            onChange={(e) =>
                              handleEdit(index, 'reps', parseInt(e.target.value) || 1)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Weight (kg)</label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={exercise.weight}
                            onChange={(e) =>
                              handleEdit(index, 'weight', parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 border border-border rounded text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConfirm}
                  className="mt-4"
                >
                  Add {recognizedExercises.length} Exercise{recognizedExercises.length !== 1 ? 's' : ''} to Workout
                </Button>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Examples */}
            <div className="p-4 bg-gradient-to-r from-primary-500/10 to-purple-500/10 rounded-lg border border-primary-500/20">
              <h4 className="text-sm font-semibold mb-2">💡 Example Commands</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• "3 sets of 10 bench press at 135 pounds"</li>
                <li>• "4 sets of 8 squats at 225 pounds"</li>
                <li>• "bench press 3 sets 12 reps 95 pounds"</li>
                <li>• "10 reps of deadlift at 315 pounds"</li>
                <li>• "3 sets pull ups"</li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
