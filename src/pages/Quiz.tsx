// src/pages/Quiz.tsx

import { usePlan } from "@/core/providers/AppProviders";
import { PhaseDots } from "@/features/quiz/components/PhaseDots";
import { PhaseHeader } from "@/features/quiz/components/PhaseHeader";
import { QuizCard } from "@/features/quiz/components/QuizCard";
import { QuizLoading } from "@/features/quiz/components/QuizLoading";
import { QuizProgress } from "@/features/quiz/components/QuizProgress";
import { QuizSummary } from "@/features/quiz/components/QuizSummary";
import { useQuizState } from "@/features/quiz/hooks/useQuizState";
import { useQuizSubmission } from "@/features/quiz/hooks/useQuizSubmission";
import type { QuizAnswers } from "@/features/quiz/types";
import { UpgradeModal, useUpgradeModal } from "@/shared/components/billing/UpgradeModal";
import { AnimatePresence } from "framer-motion";
import React, { useEffect, useState } from "react";

const Quiz: React.FC = () => {
  const {
    currentPhase,
    currentQuestion,
    answers,
    heightUnit,
    weightUnit,
    errors,
    profileData,
    progressRestored,
    phase,
    question,
    progress,
    isLoading,
    isAuthenticated,
    handleAnswer,
    handleNext,
    handlePrevious,
    handleSkip,
    canProceed,
    clearProgress,
    user,
  } = useQuizState();
  const upgradeModal = useUpgradeModal();

  const { submitQuiz, isSubmitting } = useQuizSubmission();
  const {
    aiGenQuizCount,
    allowed,
    planId,
    loading: planLoading,
    // refresh: refreshPlan,
  } = usePlan();

  const [showSummary, setShowSummary] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth", // feel free to use 'auto' if you want instant
    });
  }, [currentPhase, currentQuestion]);

  const toggleMultiSelect = (questionId: keyof QuizAnswers, option: string) => {
    const current = (answers[questionId] as string[]) || [];
    const newValue = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    handleAnswer(questionId, newValue);
  };

  const handleNextWrapper = () => {
    const result = handleNext();
    if (result === "complete") {
      setShowSummary(true);
    }
  };

  const outOfQuota = !planLoading && aiGenQuizCount >= allowed;

  const handleConfirmSummary = async () => {
    setShowSummary(false);
    setCompleted(true);

    setTimeout(async () => {
      if (outOfQuota) {
        setCompleted(false);
        return;
      }
      if (profileData) {
        try {
          await submitQuiz(profileData.id, profileData, answers, clearProgress);
        } catch (err) {
          if ((err as any)?.message?.includes("limit reached")) {
            setCompleted(false);
          }
        }
      }
    }, 500);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen py-8 bg-gradient-global flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Show plan usage at top
  if (outOfQuota) {
    return (
      <UpgradeModal
        isOpen={upgradeModal.isOpen}
        onClose={upgradeModal.close}
      />
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-global">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="my-4 flex flex-col items-center">
            <div className="inline-flex items-center px-2 py-1 rounded badge-green text-xs text-muted-foreground font-medium gap-2 border border-muted-foreground/20 mb-2">
              {planLoading
                ? "Checking plan ..."
                : `AI plan usage: ${aiGenQuizCount}/${allowed} left`}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {showSummary ? (
              <QuizSummary
                answers={answers}
                onEdit={() => setShowSummary(false)}
                onConfirm={handleConfirmSummary}
              />
            ) : completed || isSubmitting ? (
              <QuizLoading />
            ) : (
              <>
                <QuizProgress
                  currentPhase={currentPhase}
                  progress={progress}
                  progressRestored={progressRestored}
                />

                <PhaseHeader phase={phase} />

                <QuizCard
                  currentPhase={currentPhase}
                  currentQuestion={currentQuestion}
                  question={question}
                  answers={answers}
                  heightUnit={heightUnit}
                  weightUnit={weightUnit}
                  errors={errors}
                  canProceed={canProceed()}
                  onAnswer={handleAnswer}
                  onToggleMultiSelect={toggleMultiSelect}
                  onPrevious={handlePrevious}
                  onSkip={handleSkip}
                  onNext={handleNextWrapper}
                />

                <PhaseDots currentPhase={currentPhase} />
              </>
            )}
          </AnimatePresence>
          <UpgradeModal
            isOpen={upgradeModal.isOpen}
            onClose={upgradeModal.close}
          />
        </div>
      </div>
    </div>
  );
};

export default Quiz;
