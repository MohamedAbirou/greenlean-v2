/**
 * Voice Meal Logging Service
 * Speech-to-text + AI parsing for hands-free meal logging
 */

import { supabase } from '@/lib/supabase';

interface ParsedFood {
  name: string;
  quantity?: number;
  unit?: string;
  confidence: number;
}

interface VoiceParsingResult {
  parsed_foods: ParsedFood[];
  meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  confidence_score: number;
}

class VoiceLoggingService {
  private recognition: any = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  constructor() {
    // Initialize Web Speech API
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  /**
   * Check if voice recognition is supported
   */
  isSupported(): boolean {
    return this.recognition !== null;
  }

  /**
   * Start voice recording and transcription
   */
  async startVoiceRecording(): Promise<{
    success: boolean;
    error?: string;
  }> {
    if (!this.isSupported()) {
      return { success: false, error: 'Voice recognition not supported in this browser' };
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create media recorder for audio file
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };

      this.mediaRecorder.start();
      this.recognition.start();

      return { success: true };
    } catch (error: any) {
      console.error('Error starting voice recording:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop recording and get transcription
   */
  async stopVoiceRecording(): Promise<{
    success: boolean;
    transcription?: string;
    audioBlob?: Blob;
    error?: string;
  }> {
    return new Promise((resolve) => {
      if (!this.recognition || !this.mediaRecorder) {
        resolve({ success: false, error: 'Recording not started' });
        return;
      }

      // Stop media recorder
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });

        // Get transcription from recognition
        this.recognition.onresult = (event: any) => {
          const transcription = event.results[0][0].transcript;
          resolve({
            success: true,
            transcription,
            audioBlob,
          });
        };

        this.recognition.onerror = (event: any) => {
          resolve({
            success: false,
            error: event.error,
          });
        };
      };

      this.recognition.stop();
      this.mediaRecorder.stop();

      // Stop all tracks
      if (this.mediaRecorder.stream) {
        this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
      }
    });
  }

  /**
   * Process voice meal log
   */
  async processVoiceMealLog(
    userId: string,
    transcription?: string,
    audioBlob?: Blob
  ): Promise<{
    success: boolean;
    voiceLogId?: string;
    parsedResult?: VoiceParsingResult;
    error?: string;
  }> {
    try {
      let audioUrl = null;
      let audioPath = null;

      // Upload audio if provided
      if (audioBlob) {
        const fileName = `${userId}/${Date.now()}_voice.webm`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('voice-logs')
          .upload(fileName, audioBlob, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('voice-logs')
          .getPublicUrl(fileName);

        audioUrl = publicUrl;
        audioPath = fileName;
      }

      // If no transcription, try to transcribe using an API
      let finalTranscription = transcription;
      if (!finalTranscription && audioBlob) {
        finalTranscription = await this.transcribeAudio(audioBlob);
      }

      if (!finalTranscription) {
        throw new Error('No transcription available');
      }

      // Create voice log record
      const { data: voiceLog, error: logError } = await supabase
        .from('voice_meal_logs')
        .insert({
          user_id: userId,
          audio_url: audioUrl,
          audio_storage_path: audioPath,
          transcription: finalTranscription,
          status: 'parsing',
        })
        .select('id')
        .single();

      if (logError) throw logError;

      // Parse transcription into meal data
      try {
        const parsedResult = await this.parseTranscription(finalTranscription);

        // Update voice log with parsed data
        await supabase
          .from('voice_meal_logs')
          .update({
            parsed_foods: parsedResult.parsed_foods,
            parsed_meal_type: parsedResult.meal_type,
            confidence_score: parsedResult.confidence_score,
            status: 'completed',
            processed_at: new Date().toISOString(),
          })
          .eq('id', voiceLog.id);

        return {
          success: true,
          voiceLogId: voiceLog.id,
          parsedResult,
        };
      } catch (parseError: any) {
        // Update status to failed
        await supabase
          .from('voice_meal_logs')
          .update({
            status: 'failed',
            error_message: parseError.message || 'Parsing failed',
          })
          .eq('id', voiceLog.id);

        throw parseError;
      }
    } catch (error: any) {
      console.error('Error processing voice meal log:', error);
      return {
        success: false,
        error: error.message || 'Failed to process voice log',
      };
    }
  }

  /**
   * Transcribe audio using free API
   */
  private async transcribeAudio(audioBlob: Blob): Promise<string> {
    // For now, we'll use the browser's built-in speech recognition
    // In production, you could use:
    // - OpenAI Whisper API
    // - Google Cloud Speech-to-Text (free tier)
    // - AssemblyAI (free tier)

    throw new Error('Audio transcription requires browser speech recognition or external API');
  }

  /**
   * Parse transcription into structured meal data using AI
   */
  private async parseTranscription(transcription: string): Promise<VoiceParsingResult> {
    // Use OpenAI or similar to parse natural language into structured data
    // Example: "I had a chicken breast with rice and broccoli for lunch"
    // -> [{name: "chicken breast", quantity: 1, unit: "serving"}, ...]

    try {
      // Try OpenAI first (if API key available)
      const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (openaiKey) {
        return await this.parseWithOpenAI(transcription, openaiKey);
      }

      // Fallback to rule-based parsing
      return this.parseWithRules(transcription);
    } catch (error) {
      console.error('Error parsing transcription:', error);
      return this.parseWithRules(transcription);
    }
  }

  /**
   * Parse with OpenAI
   */
  private async parseWithOpenAI(transcription: string, apiKey: string): Promise<VoiceParsingResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition assistant. Parse meal descriptions into structured JSON.
            Return format: {"foods": [{"name": "food name", "quantity": 1, "unit": "serving"}], "meal_type": "breakfast|lunch|dinner|snack"}
            Extract all foods, quantities, and estimate the meal type based on context.`,
          },
          {
            role: 'user',
            content: transcription,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);

    return {
      parsed_foods: parsed.foods.map((f: any) => ({
        name: f.name,
        quantity: f.quantity,
        unit: f.unit,
        confidence: 0.8, // High confidence for AI parsing
      })),
      meal_type: parsed.meal_type,
      confidence_score: 0.8,
    };
  }

  /**
   * Simple rule-based parsing fallback
   */
  private parseWithRules(transcription: string): VoiceParsingResult {
    const text = transcription.toLowerCase();

    // Detect meal type
    let mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined;
    if (text.includes('breakfast')) mealType = 'breakfast';
    else if (text.includes('lunch')) mealType = 'lunch';
    else if (text.includes('dinner')) mealType = 'dinner';
    else if (text.includes('snack')) mealType = 'snack';

    // Common food keywords
    const foodKeywords = [
      'chicken', 'beef', 'fish', 'salmon', 'tuna',
      'rice', 'pasta', 'bread', 'potato',
      'egg', 'eggs',
      'salad', 'vegetables', 'broccoli', 'spinach',
      'apple', 'banana', 'orange',
      'yogurt', 'milk', 'cheese',
      'protein shake', 'shake',
      'sandwich', 'burger', 'pizza',
    ];

    const parsedFoods: ParsedFood[] = [];

    for (const food of foodKeywords) {
      if (text.includes(food)) {
        // Try to extract quantity
        const quantityMatch = text.match(new RegExp(`(\\d+|one|two|three)\\s+${food}`, 'i'));
        let quantity = 1;

        if (quantityMatch) {
          const qtyText = quantityMatch[1].toLowerCase();
          if (qtyText === 'one') quantity = 1;
          else if (qtyText === 'two') quantity = 2;
          else if (qtyText === 'three') quantity = 3;
          else quantity = parseInt(qtyText) || 1;
        }

        parsedFoods.push({
          name: food,
          quantity,
          unit: 'serving',
          confidence: 0.6, // Lower confidence for rule-based
        });
      }
    }

    // If no foods detected, try to extract any nouns
    if (parsedFoods.length === 0) {
      const words = text.split(' ').filter(w => w.length > 3);
      if (words.length > 0) {
        parsedFoods.push({
          name: words[0],
          quantity: 1,
          unit: 'serving',
          confidence: 0.4,
        });
      }
    }

    return {
      parsed_foods: parsedFoods,
      meal_type: mealType,
      confidence_score: parsedFoods.length > 0 ? 0.5 : 0.2,
    };
  }

  /**
   * Convert voice log to meal items
   */
  async convertToMealLog(
    userId: string,
    voiceLogId: string,
    mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack',
    logDate: string = new Date().toISOString().split('T')[0]
  ): Promise<{ success: boolean; nutritionLogId?: string }> {
    try {
      // Get voice log
      const { data: voiceLog, error: fetchError } = await supabase
        .from('voice_meal_logs')
        .select('*')
        .eq('id', voiceLogId)
        .single();

      if (fetchError) throw fetchError;

      // Create nutrition log
      const { data: nutritionLog, error: logError } = await supabase
        .from('daily_nutrition_logs')
        .insert({
          user_id: userId,
          log_date: logDate,
          meal_type: mealType,
        })
        .select('id')
        .single();

      if (logError) throw logError;

      // Get nutrition data for each parsed food
      const mealItems = await Promise.all(
        (voiceLog.parsed_foods as ParsedFood[]).map(async (food) => {
          // Look up nutrition data
          const { data: foodData } = await supabase
            .from('food_database')
            .select('*')
            .ilike('food_name', `%${food.name}%`)
            .limit(1)
            .maybeSingle();

          const quantity = food.quantity || 1;

          return {
            user_id: userId,
            nutrition_log_id: nutritionLog.id,
            food_name: food.name,
            serving_qty: quantity,
            serving_unit: food.unit || 'serving',
            calories: (foodData?.calories || 100) * quantity,
            protein: (foodData?.protein || 5) * quantity,
            carbs: (foodData?.carbs || 15) * quantity,
            fats: (foodData?.fats || 3) * quantity,
            source: 'voice',
            voice_log_id: voiceLogId,
          };
        })
      );

      const { error: itemsError } = await supabase
        .from('meal_items')
        .insert(mealItems);

      if (itemsError) throw itemsError;

      // Link voice log to nutrition log
      await supabase
        .from('voice_meal_logs')
        .update({ nutrition_log_id: nutritionLog.id })
        .eq('id', voiceLogId);

      return { success: true, nutritionLogId: nutritionLog.id };
    } catch (error) {
      console.error('Error converting voice log to meal:', error);
      return { success: false };
    }
  }

  /**
   * Get user's voice logs
   */
  async getVoiceLogs(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<any[]> {
    const { data, error } = await supabase
      .from('voice_meal_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching voice logs:', error);
      return [];
    }

    return data || [];
  }
}

export const voiceLoggingService = new VoiceLoggingService();
