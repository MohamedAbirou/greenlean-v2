/**
 * Voice Recognition Service
 * Web Speech API wrapper for food logging
 */

export interface VoiceRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

export interface VoiceRecognitionResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
}

export class VoiceRecognitionService {
  private recognition: any = null;
  private isSupported: boolean = false;

  constructor() {
    // Check if Web Speech API is supported
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.isSupported = true;
    }
  }

  isAvailable(): boolean {
    return this.isSupported;
  }

  start(
    options: VoiceRecognitionOptions = {},
    onResult: (result: VoiceRecognitionResult) => void,
    onError?: (error: string) => void
  ): void {
    if (!this.isSupported) {
      onError?.('Voice recognition is not supported in this browser');
      return;
    }

    // Configure recognition
    this.recognition.lang = options.lang || 'en-US';
    this.recognition.continuous = options.continuous ?? false;
    this.recognition.interimResults = options.interimResults ?? true;
    this.recognition.maxAlternatives = options.maxAlternatives || 1;

    // Handle results
    this.recognition.onresult = (event: any) => {
      const results = event.results;
      const lastResultIndex = results.length - 1;
      const result = results[lastResultIndex];

      const transcript = result[0].transcript;
      const confidence = result[0].confidence;
      const isFinal = result.isFinal;

      onResult({
        transcript,
        confidence,
        isFinal,
      });
    };

    // Handle errors
    this.recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error);
      onError?.(event.error);
    };

    // Handle end
    this.recognition.onend = () => {
      // Optional: auto-restart if continuous
      if (options.continuous) {
        this.recognition.start();
      }
    };

    // Start recognition
    try {
      this.recognition.start();
    } catch (error) {
      onError?.('Failed to start voice recognition');
    }
  }

  stop(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }

  abort(): void {
    if (this.recognition) {
      this.recognition.abort();
    }
  }
}

/**
 * Parse food voice input into structured data
 * Examples:
 * - "Pizza, 2 slices" -> { food: "pizza", quantity: "2 slices" }
 * - "Chicken breast 6 ounces" -> { food: "chicken breast", quantity: "6 ounces" }
 * - "Apple" -> { food: "apple", quantity: null }
 */
export function parseFoodVoiceInput(transcript: string): {
  food: string;
  quantity: string | null;
} {
  const cleanTranscript = transcript.toLowerCase().trim();

  // Common patterns:
  // "food, quantity"
  // "quantity food"
  // "food quantity"

  // Try comma separation first
  if (cleanTranscript.includes(',')) {
    const [food, quantity] = cleanTranscript.split(',').map(s => s.trim());
    return { food, quantity: quantity || null };
  }

  // Look for number patterns
  const numberPattern = /(\d+(\.\d+)?)\s*(oz|ounces?|g|grams?|lbs?|pounds?|slices?|cups?|tbsp|tsp|pieces?)/i;
  const match = cleanTranscript.match(numberPattern);

  if (match) {
    const quantity = match[0];
    const food = cleanTranscript.replace(quantity, '').trim();
    return { food, quantity };
  }

  // No quantity found
  return { food: cleanTranscript, quantity: null };
}

// Singleton instance
export const voiceRecognition = new VoiceRecognitionService();
