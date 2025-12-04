/**
 * MicroSurveyCard Component
 * Subtle, non-intrusive micro-survey card for progressive profiling
 */

import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Slider } from '@/shared/components/ui/slider';
import { motion } from 'framer-motion';
import { Lightbulb, X, Utensils, Dumbbell, Heart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface MicroSurveyCardProps {
  currentSurvey: {
    id: string;
    question_text: string;
    question_type: 'single_choice' | 'multi_choice' | 'text' | 'numeric' | 'scale';
    field_name: string;
    affects: string[];
    options?: Array<{ value: string; label: string }>;
  } | null;
  submitting: boolean;
  submitResponse: (questionId: string, responseValue: string) => Promise<any>;
  dismissSurvey: () => void;
}

export function MicroSurveyCard({
  currentSurvey,
  submitting,
  submitResponse,
  dismissSurvey,
}: MicroSurveyCardProps) {
  const [selectedValue, setSelectedValue] = useState<string>('');
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [scaleValue, setScaleValue] = useState<number[]>([5]);
  const [textValue, setTextValue] = useState<string>('');

  if (!currentSurvey) return null;

  const handleSubmit = async () => {
    let responseValue = '';

    switch (currentSurvey.question_type) {
      case 'single_choice':
        if (!selectedValue) {
          toast.error('Please select an option');
          return;
        }
        responseValue = selectedValue;
        break;
      case 'multi_choice':
        if (selectedMultiple.length === 0) {
          toast.error('Please select at least one option');
          return;
        }
        responseValue = selectedMultiple.join(',');
        break;
      case 'scale':
        responseValue = scaleValue[0].toString();
        break;
      case 'text':
        if (!textValue.trim()) {
          toast.error('Please enter a response');
          return;
        }
        responseValue = textValue.trim();
        break;
      default:
        return;
    }

    await submitResponse(currentSurvey.id, responseValue);

    // Reset state
    setSelectedValue('');
    setSelectedMultiple([]);
    setScaleValue([5]);
    setTextValue('');
  };

  const toggleMultipleChoice = (value: string) => {
    if (selectedMultiple.includes(value)) {
      setSelectedMultiple(selectedMultiple.filter((v) => v !== value));
    } else {
      setSelectedMultiple([...selectedMultiple, value]);
    }
  };

  // Determine icon based on affects
  const Icon = currentSurvey.affects.includes('diet')
    ? Utensils
    : currentSurvey.affects.includes('workout')
    ? Dumbbell
    : currentSurvey.affects.includes('both')
    ? Heart
    : Lightbulb;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        variant="elevated"
        padding="lg"
        className="bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 border-2 border-primary/20 relative overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />

        {/* Close button */}
        <button
          onClick={dismissSurvey}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted transition-colors"
          aria-label="Ask me later"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Quick Question</h4>
                <p className="text-xs text-muted-foreground">
                  Help us personalize your experience
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground mb-4 leading-relaxed">
              {currentSurvey.question_text}
            </p>

            {/* Single Choice */}
            {currentSurvey.question_type === 'single_choice' && currentSurvey.options && (
              <div className="space-y-2 mb-4">
                {currentSurvey.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedValue(option.value)}
                    disabled={submitting}
                    className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                      selectedValue === option.value
                        ? 'border-primary bg-primary/10 text-foreground font-medium'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50 text-foreground'
                    } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          selectedValue === option.value
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedValue === option.value && (
                          <div className="w-2 h-2 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Multiple Choice */}
            {currentSurvey.question_type === 'multi_choice' && currentSurvey.options && (
              <div className="space-y-2 mb-4">
                {currentSurvey.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => toggleMultipleChoice(option.value)}
                    disabled={submitting}
                    className={`w-full p-3 text-left border-2 rounded-lg transition-all ${
                      selectedMultiple.includes(option.value)
                        ? 'border-primary bg-primary/10 text-foreground font-medium'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50 text-foreground'
                    } ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                          selectedMultiple.includes(option.value)
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        }`}
                      >
                        {selectedMultiple.includes(option.value) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-sm">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Scale */}
            {currentSurvey.question_type === 'scale' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">Low</span>
                  <span className="text-lg font-bold text-primary">{scaleValue[0]}</span>
                  <span className="text-xs text-muted-foreground">High</span>
                </div>
                <Slider
                  value={scaleValue}
                  onValueChange={setScaleValue}
                  min={1}
                  max={10}
                  step={1}
                  disabled={submitting}
                  className="w-full"
                />
                <div className="flex justify-between mt-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <span key={num} className="text-xs text-muted-foreground">
                      {num}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Text Input */}
            {currentSurvey.question_type === 'text' && (
              <div className="mb-4">
                <textarea
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  disabled={submitting}
                  placeholder="Type your answer here..."
                  className="w-full p-3 border-2 border-border rounded-lg focus:border-primary focus:outline-none resize-none bg-background text-foreground"
                  rows={3}
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-white"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </Button>
              <button
                onClick={dismissSurvey}
                disabled={submitting}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Later
              </button>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
