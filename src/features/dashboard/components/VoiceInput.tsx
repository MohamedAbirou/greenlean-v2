/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Voice Input Component
 * Speech-to-text meal logging using Web Speech API
 * Production-ready voice recognition with natural language processing
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { MealItem } from '@/shared/types/food.types';
import { useEffect, useRef, useState } from 'react';

interface VoiceInputProps {
  onFoodsRecognized: (items: MealItem[]) => void;
  onClose?: () => void;
}

export function VoiceInput({ onFoodsRecognized, onClose }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');           // live preview (browser STT)
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState(''); // Whisper final
  const [recognizedFoods, setRecognizedFoods] = useState<MealItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Setup browser STT for preview + check support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice preview not supported — but recording still works. Use Chrome/Edge for best experience.');
      setIsSupported(false);
    } else {
      setIsSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (e: any) => {
        let interim = '', final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const t = e.results[i][0].transcript;
          if (e.results[i].isFinal) final += t + ' ';
          else interim = t;
        }
        if (final) setTranscript(prev => prev + final);
        setInterimTranscript(interim);
      };

      rec.onerror = (event: any) => {
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
      rec.onend = () => {
        setIsListening(false);
        setInterimTranscript('');
      }

      recognitionRef.current = rec;
    }

    return () => recognitionRef.current?.stop();
  }, []);

  const startListening = async () => {
    if (!recognitionRef.current) return;
    setError('');
    setTranscript('');
    setInterimTranscript('');
    setFinalTranscript('');
    setRecognizedFoods([]);
    setProcessing(false);

    try {
      // Start browser preview if available
      recognitionRef.current.start();

      // Start real audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = e => audioChunksRef.current.push(e.data);
      recorder.start();

      mediaRecorderRef.current = recorder;
      setIsListening(true);
    } catch (err: any) {
      setError('Microphone access denied or failed. Please allow microphone.');
      console.error(err);
    }
  };

  const stopListening = async () => {
    if (!isListening) return;

    setIsListening(false);

    // Stop browser preview
    recognitionRef.current?.stop();

    // Stop & get audio blob
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await analyzeVoice(audioBlob);
      };
    }
  };

  const analyzeVoice = async (audioBlob: Blob) => {
    setProcessing(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice.webm');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/voice-process`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Processing failed');
      }

      // Whisper transcript (more accurate than browser)
      setFinalTranscript(data.transcript || transcript);

      setRecognizedFoods(data.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze voice. Try speaking more clearly.');
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (recognizedFoods.length > 0) {
      onFoodsRecognized(recognizedFoods);
    }
  };

  const handleEdit = (index: number, field: keyof MealItem, value: any) => {
    const updated = [...recognizedFoods];
    updated[index] = { ...updated[index], [field]: value };
    setRecognizedFoods(updated);
  };

  const handleRemove = (index: number) => {
    setRecognizedFoods(recognizedFoods.filter((_, i) => i !== index));
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Voice Input</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Tell us what you ate and we'll log it for you
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
                  <div className="text-6xl">{isListening ? '⏸️' : '🎤'}</div>
                </button>
              </div>


              <div className="mt-4">
                <Badge
                  variant={isListening ? 'error' : processing ? 'warning' : 'default'}
                  className="text-lg px-4 py-2"
                >
                  {isListening
                    ? 'Listening...'
                    : processing
                      ? 'Processing...'
                      : 'Tap to Start'}
                </Badge>
              </div>
            </div>

            {/* Live transcript preview */}
            {(transcript || interimTranscript) && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <h4 className="text-sm font-semibold mb-2">Transcript:</h4>
                  <p className="text-sm">
                    {transcript}
                    <span className="text-muted-foreground italic">{interimTranscript}</span>
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Recognized Foods */}
            {recognizedFoods.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Recognized Foods ({recognizedFoods.length})</h4>
                  <Button variant="ghost" size="sm" onClick={() => setRecognizedFoods([])}>
                    Clear All
                  </Button>
                </div>

                <div className="space-y-3">
                  {recognizedFoods.map((food, index) => (
                    <Card key={food.id} className="overflow-hidden">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={food.food_name}
                                onChange={(e) => handleEdit(index, 'food_name', e.target.value)}
                                className="font-semibold text-lg border-b border-transparent hover:border-border focus:border-primary-500 outline-none bg-transparent"
                              />
                              {food.confidence && (
                                <Badge
                                  variant={
                                    food.confidence > 0.8
                                      ? 'success'
                                      : food.confidence > 0.6
                                        ? 'warning'
                                        : 'default'
                                  }
                                  className="text-xs"
                                >
                                  {Math.round(food.confidence * 100)}% confident
                                </Badge>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-xs text-muted-foreground">Quantity</label>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={food.serving_qty}
                                  onChange={(e) =>
                                    handleEdit(index, 'serving_qty', parseFloat(e.target.value) || 1)
                                  }
                                  className="w-full px-2 py-1 border border-border rounded text-sm"
                                />
                              </div>
                              <div>
                                <label className="text-xs text-muted-foreground">Unit</label>
                                <input
                                  type="text"
                                  value={food.serving_unit}
                                  onChange={(e) => handleEdit(index, 'serving_unit', e.target.value)}
                                  className="w-full px-2 py-1 border border-border rounded text-sm"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-center pt-2">
                              <div>
                                <p className="text-sm font-bold text-primary-600">
                                  {food.calories}
                                </p>
                                <p className="text-xs text-muted-foreground">cal</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-purple-600">{food.protein}g</p>
                                <p className="text-xs text-muted-foreground">protein</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-green-600">{food.carbs}g</p>
                                <p className="text-xs text-muted-foreground">carbs</p>
                              </div>
                              <div>
                                <p className="text-sm font-bold text-amber-600">{food.fats}g</p>
                                <p className="text-xs text-muted-foreground">fat</p>
                              </div>
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
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button variant="primary" size="lg" fullWidth onClick={handleConfirm}>
                    Add {recognizedFoods.length} Food{recognizedFoods.length !== 1 ? 's' : ''}
                  </Button>
                  <Button variant="outline" size="lg" onClick={startListening}>
                    ↻ Try Again
                  </Button>
                </div>
              </div>
            )}

            {finalTranscript && <p>Understood: {finalTranscript}</p>}

            {/* Error */}
            {error && (
              <div className="p-4 bg-error/10 border border-error rounded-lg">
                <p className="text-sm text-error">{error}</p>
              </div>
            )}

            {/* Examples */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6">
                <h4 className="text-sm font-semibold mb-3">💡 Try saying:</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• "I had 2 eggs, 1 cup of oatmeal, and a banana"</li>
                  <li>• "I ate chicken breast with rice and broccoli"</li>
                  <li>• "1 protein shake and 2 tablespoons of peanut butter"</li>
                  <li>• "A bowl of yogurt with berries"</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}
