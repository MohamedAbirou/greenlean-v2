/**
 * VoiceInputButton Component
 * Beautiful animated microphone button for voice food logging
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useVoiceInput } from '../../hooks/useVoiceInput';

interface VoiceInputButtonProps {
  onFoodDetected: (food: string, quantity: string | null) => void;
  disabled?: boolean;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  showText?: boolean;
}

export function VoiceInputButton({
  onFoodDetected,
  disabled = false,
  variant = 'outline',
  size = 'icon',
  showText = false,
}: VoiceInputButtonProps) {
  const {
    isListening,
    transcript,
    isSupported,
    startListening,
    stopListening,
  } = useVoiceInput(onFoodDetected);

  if (!isSupported) {
    return null; // Don't show button if not supported
  }

  const handleClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleClick}
        disabled={disabled}
        variant={isListening ? 'default' : variant}
        size={size}
        className={`
          relative overflow-hidden transition-all
          ${isListening ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
          ${showText ? 'gap-2' : ''}
        `}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center gap-2"
            >
              <MicOff className="w-4 h-4" />
              {showText && <span>Stop</span>}
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="flex items-center gap-2"
            >
              <Mic className="w-4 h-4" />
              {showText && <span>Voice Input</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse animation when listening */}
        {isListening && (
          <>
            <motion.div
              className="absolute inset-0 bg-red-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.div
              className="absolute inset-0 bg-red-400 rounded-full"
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.3, 0, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.3,
              }}
            />
          </>
        )}
      </Button>

      {/* Transcript Display */}
      <AnimatePresence>
        {isListening && transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
          >
            <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-red-600" />
                <span className="text-sm font-medium">{transcript}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
