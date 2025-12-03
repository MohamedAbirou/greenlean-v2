/**
 * MicroSurveyDialog Component
 * Non-intrusive dialog for progressive profiling
 */

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { MicroSurvey } from '../services/microSurveys.config';

interface MicroSurveyDialogProps {
  survey: MicroSurvey | null;
  isLoading?: boolean;
  onAnswer: (surveyId: string, answer: string | string[]) => Promise<void>;
  onSkip: (surveyId: string) => void;
  onDismiss: () => void;
}

export function MicroSurveyDialog({
  survey,
  isLoading = false,
  onAnswer,
  onSkip,
  onDismiss,
}: MicroSurveyDialogProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!survey) return null;

  const isMultiSelect = survey.multiSelect === true;

  const handleOptionClick = (value: string) => {
    if (isMultiSelect) {
      setSelectedOptions((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    } else {
      // Single select - submit immediately
      handleSubmit(value);
    }
  };

  const handleSubmit = async (singleValue?: string) => {
    const answer = singleValue || selectedOptions;

    if (Array.isArray(answer) && answer.length === 0) {
      toast.error('Please select at least one option');
      return;
    }

    setIsSubmitting(true);

    try {
      await onAnswer(survey.id, answer);
      toast.success("Thanks! We've updated your plan.");
      setSelectedOptions([]);
    } catch (error) {
      toast.error('Failed to save answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipClick = () => {
    onSkip(survey.id);
    setSelectedOptions([]);
  };

  const getPriorityBadge = () => {
    if (survey.priority >= 9) {
      return (
        <Badge variant="default" className="bg-accent-500">
          ⚡ High Priority
        </Badge>
      );
    }
    if (survey.priority >= 7) {
      return <Badge variant="secondary">Recommended</Badge>;
    }
    return <Badge variant="outline">Optional</Badge>;
  };

  const getCategoryColor = () => {
    switch (survey.category) {
      case 'nutrition':
        return 'from-primary-600 to-primary-500';
      case 'fitness':
        return 'from-secondary-600 to-secondary-500';
      case 'health':
        return 'from-error-600 to-error-500';
      case 'lifestyle':
        return 'from-accent-600 to-accent-500';
      default:
        return 'from-primary-600 to-primary-500';
    }
  };

  return (
    <Dialog open={!!survey} onOpenChange={() => !isLoading && onDismiss()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start justify-between mb-2">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getCategoryColor()} flex items-center justify-center text-2xl`}
              >
                {survey.icon || <Sparkles className="w-5 h-5 text-white" />}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  Help us personalize your experience
                </DialogTitle>
                {getPriorityBadge()}
              </div>
            </motion.div>
          </div>

          <DialogDescription className="text-base">
            <span className="text-xl font-medium text-foreground block mb-2">
              {survey.question}
            </span>
            {survey.description && (
              <span className="text-sm text-muted-foreground">
                {survey.description}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 max-h-96 overflow-y-auto py-2">
          <AnimatePresence mode="popLayout">
            {survey.options.map((option, index) => {
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              const isSelected = isMultiSelect
                ? selectedOptions.includes(value)
                : false;

              return (
                <motion.div
                  key={value}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div
                    role="button"
                    onClick={() => handleOptionClick(value)}
                    className={`
                      w-full p-4 rounded-lg border-2 text-left transition-all
                      hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-950
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                      disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950'
                          : 'border-border bg-background'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{label}</span>
                      {isMultiSelect && (
                        <Checkbox checked={isSelected} readOnly />
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <DialogFooter className="sm:justify-between flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleSkipClick}
            disabled={isSubmitting || isLoading}
          >
            Skip for now
          </Button>

          <div className="flex gap-2">
            {isMultiSelect && (
              <Button
                type="button"
                onClick={() => handleSubmit()}
                disabled={
                  isSubmitting || isLoading || selectedOptions.length === 0
                }
                className="min-w-[120px]"
              >
                {isSubmitting ? 'Saving...' : 'Continue'}
              </Button>
            )}
          </div>
        </DialogFooter>

        {survey.priority >= 8 && (
          <div className="mt-4 p-3 bg-info-50 dark:bg-info-950 rounded-lg border border-info-200 dark:border-info-800">
            <p className="text-xs text-info-700 dark:text-info-300">
              💡 <strong>Why we ask:</strong> This helps us create better plans
              for you. Your plan will automatically update after you answer.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

/**
 * MicroSurveyProvider Component
 * Drop this into your app layout to enable micro-surveys globally
 */
export function MicroSurveyProvider({ children }: { children: React.ReactNode }) {
  const { pendingSurvey, isLoading, handleAnswer, handleSkip, handleDismiss } =
    useMicroSurveys();

  return (
    <>
      {children}
      <MicroSurveyDialog
        survey={pendingSurvey}
        isLoading={isLoading}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
        onDismiss={handleDismiss}
      />
    </>
  );
}

// Hook import
import { useMicroSurveys } from '../hooks/useMicroSurveys';

