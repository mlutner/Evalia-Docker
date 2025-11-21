import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import SurveyWelcomeTemplate from "@/components/SurveyWelcomeTemplate";
import type { Question } from "@shared/schema";

interface SurveyPreviewDialogProps {
  questions: Question[];
  title: string;
  description?: string;
  welcomeMessage?: string;
  illustration?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SurveyPreviewDialog({
  questions,
  title,
  description,
  welcomeMessage,
  illustration,
  open,
  onOpenChange,
}: SurveyPreviewDialogProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const currentQuestion = currentStep;
  const isWelcome = currentStep === -1;

  const handleAnswer = (answer: string | string[]) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: answer,
    });
  };

  const canGoNext = () => {
    if (isWelcome) return true;
    const question = questions[currentQuestion];
    const answer = answers[question.id];
    
    if (!question.required) return true;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer && answer.toString().trim().length > 0;
  };

  const handleNext = () => {
    if (isWelcome) {
      setCurrentStep(0);
    } else if (currentQuestion < questions.length - 1) {
      setCurrentStep(currentQuestion + 1);
    }
  };

  const handleBack = () => {
    if (currentQuestion === 0) {
      setCurrentStep(-1);
    } else if (currentQuestion > 0) {
      setCurrentStep(currentQuestion - 1);
    }
  };

  const handleClose = () => {
    setCurrentStep(-1);
    setAnswers({});
    onOpenChange(false);
  };

  if (questions.length === 0) return null;

  const purposePoints = welcomeMessage
    ? welcomeMessage.split("\n").filter((line) => line.trim())
    : [];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 gap-0 bg-white" data-testid="dialog-survey-preview">
        <div className="overflow-y-auto p-0" style={{ backgroundColor: '#f6f7f9' }}>
          <div style={{ padding: '40px 16px' }} className="flex items-center justify-center min-h-[90vh]">
            <div className="survey-card" style={{ maxWidth: '520px' }}>
              {isWelcome ? (
                <SurveyWelcomeTemplate
                  title={title}
                  description={description}
                  illustration={illustration}
                  welcomeMessage={welcomeMessage}
                  onStart={() => handleNext()}
                />
              ) : (
                <>
                  {/* Question Header */}
                  <header className="survey-header">
                    <h1 className="survey-title" data-testid="text-preview-question-number">
                      Question {currentQuestion + 1}
                    </h1>
                    <p className="survey-progress" data-testid="text-preview-progress">
                      {currentQuestion + 1} of {questions.length} • {Math.round(((currentQuestion + 1) / questions.length) * 100)}% complete
                    </p>
                  </header>

                  {/* Question Body */}
                  <div className="survey-body">
                    <QuestionCard
                      question={questions[currentQuestion]}
                      onAnswer={handleAnswer}
                      initialAnswer={answers[questions[currentQuestion].id]}
                    />
                  </div>
                </>
              )}

              {/* Footer */}
              {!isWelcome && (
                <footer className="survey-footer">
                  <button
                    onClick={handleBack}
                    className="survey-back"
                    type="button"
                    data-testid="button-preview-back"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={!canGoNext() || currentQuestion === questions.length - 1}
                    className="survey-primary"
                    type="button"
                    data-testid="button-preview-next"
                    style={{ opacity: (!canGoNext() || currentQuestion === questions.length - 1) ? 0.6 : 1 }}
                  >
                    {currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                  </button>
                </footer>
              )}

              <p className="survey-footnote">
                {isWelcome ? "Welcome" : `Question ${currentQuestion + 1} of ${questions.length}`}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
