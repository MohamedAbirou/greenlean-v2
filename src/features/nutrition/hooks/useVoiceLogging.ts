/**
 * useVoiceLogging Hook
 * React hook for voice-based meal logging
 */

import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { voiceLoggingService } from '../api/voiceLoggingService';

export function useVoiceLogging() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [parsedResult, setParsedResult] = useState<any>(null);
  const [voiceLogId, setVoiceLogId] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(voiceLoggingService.isSupported());

  const audioRef = useRef<{ transcription?: string; audioBlob?: Blob }>({});

  /**
   * Start voice recording
   */
  const startRecording = useCallback(async () => {
    if (!isSupported) {
      toast.error('Voice recording not supported', {
        description: 'Please use a modern browser like Chrome or Edge',
      });
      return false;
    }

    setIsSupported(true);

    const result = await voiceLoggingService.startVoiceRecording();

    if (result.success) {
      setIsRecording(true);
      toast.info('Recording started', {
        description: 'Speak your meal description',
      });
      return true;
    } else {
      toast.error('Failed to start recording', {
        description: result.error || 'Please check microphone permissions',
      });
      return false;
    }
  }, [isSupported]);

  /**
   * Stop voice recording and get transcription
   */
  const stopRecording = useCallback(async () => {
    if (!isRecording) return null;

    setIsRecording(false);
    setIsProcessing(true);

    try {
      const result = await voiceLoggingService.stopVoiceRecording();

      if (result.success && result.transcription) {
        audioRef.current = {
          transcription: result.transcription,
          audioBlob: result.audioBlob,
        };
        setTranscription(result.transcription);
        toast.success('Recording complete', {
          description: result.transcription,
        });
        return result.transcription;
      } else {
        toast.error('Failed to transcribe audio', {
          description: result.error || 'Please try again',
        });
        return null;
      }
    } catch (error: any) {
      console.error('Error stopping recording:', error);
      toast.error('Error processing recording');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isRecording]);

  /**
   * Process voice log (parse and analyze)
   */
  const processVoiceLog = useCallback(async (userId: string) => {
    if (!audioRef.current.transcription) {
      toast.error('No transcription available');
      return null;
    }

    setIsProcessing(true);

    try {
      const result = await voiceLoggingService.processVoiceMealLog(
        userId,
        audioRef.current.transcription,
        audioRef.current.audioBlob
      );

      if (result.success && result.parsedResult) {
        setParsedResult(result.parsedResult);
        setVoiceLogId(result.voiceLogId || null);
        toast.success('Meal parsed successfully!', {
          description: `Found ${result.parsedResult.parsed_foods.length} food items`,
        });
        return result.parsedResult;
      } else {
        toast.error('Failed to parse meal', {
          description: result.error || 'Please try again',
        });
        return null;
      }
    } catch (error: any) {
      console.error('Error processing voice log:', error);
      toast.error('Error processing voice log');
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  /**
   * Convert voice log to meal items
   */
  const convertToMealLog = useCallback(
    async (
      userId: string,
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
      logDate?: string
    ) => {
      if (!voiceLogId) {
        toast.error('No voice log available');
        return null;
      }

      const result = await voiceLoggingService.convertToMealLog(
        userId,
        voiceLogId,
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
    [voiceLogId]
  );

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsRecording(false);
    setIsProcessing(false);
    setTranscription(null);
    setParsedResult(null);
    setVoiceLogId(null);
    audioRef.current = {};
  }, []);

  return {
    isSupported,
    isRecording,
    isProcessing,
    transcription,
    parsedResult,
    voiceLogId,
    startRecording,
    stopRecording,
    processVoiceLog,
    convertToMealLog,
    reset,
  };
}
