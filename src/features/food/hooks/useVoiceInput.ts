/**
 * useVoiceInput Hook
 * Manages voice input for food logging
 */

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { VoiceRecognitionResult } from '../services/voiceRecognition';
import { parseFoodVoiceInput, voiceRecognition } from '../services/voiceRecognition';

export function useVoiceInput(
  onFoodDetected: (food: string, quantity: string | null) => void
) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const startListening = useCallback(() => {
    if (!voiceRecognition.isAvailable()) {
      toast.error('Voice recognition is not supported in your browser. Try Chrome or Edge!');
      return;
    }

    setIsListening(true);
    setTranscript('');
    setError(null);

    voiceRecognition.start(
      {
        lang: 'en-US',
        continuous: false,
        interimResults: true,
        maxAlternatives: 1,
      },
      (result: VoiceRecognitionResult) => {
        setTranscript(result.transcript);

        // When we get a final result, parse and execute
        if (result.isFinal) {
          const { food, quantity } = parseFoodVoiceInput(result.transcript);

          toast.success(`Heard: "${result.transcript}"`, {
            description: quantity
              ? `Searching for ${food} (${quantity})`
              : `Searching for ${food}`,
          });

          onFoodDetected(food, quantity);

          // Auto-stop after final result
          timeoutRef.current = setTimeout(() => {
            stopListening();
          }, 500);
        }
      },
      (errorMessage: string) => {
        setError(errorMessage);
        setIsListening(false);

        if (errorMessage === 'no-speech') {
          toast.error('No speech detected. Please try again.');
        } else if (errorMessage === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in your browser settings.');
        } else {
          toast.error(`Voice recognition error: ${errorMessage}`);
        }
      }
    );
  }, [onFoodDetected]);

  const stopListening = useCallback(() => {
    voiceRecognition.stop();
    setIsListening(false);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  const cancelListening = useCallback(() => {
    voiceRecognition.abort();
    setIsListening(false);
    setTranscript('');

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported: voiceRecognition.isAvailable(),
    startListening,
    stopListening,
    cancelListening,
  };
}
