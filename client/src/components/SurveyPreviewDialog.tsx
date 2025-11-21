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
import logoImage from "@assets/Untitled design (3)_1763756722973.png";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
                <>
                  {/* Welcome Header */}
                  <header className="survey-header">
                    <div className="survey-logo">
                      <img 
                        src={logoImage} 
                        alt="Survey logo" 
                        data-testid="icon-survey-logo"
                      />
                    </div>
                    <h1 className="survey-title" data-testid="text-preview-title">
                      {title}
                    </h1>
                  </header>

                  {/* Welcome Subtitle */}
                  {description && (
                    <p className="hero-subtitle" data-testid="text-preview-description">
                      {description}
                    </p>
                  )}

                  {/* Welcome Body */}
                  <div className="survey-body">
                    {illustration && (
                      <div className="hero-illustration">
                        <img
                          src={illustration}
                          alt="Survey illustration"
                          data-testid="img-preview-illustration"
                        />
                      </div>
                    )}

                    {purposePoints.length > 0 && (
                      <>
                        <h2 className="hero-section-title text-[20px]" data-testid="text-survey-purpose">
                          The purpose of the survey:
                        </h2>
                        <ul className="hero-benefits">
                          {purposePoints.map((point, idx) => (
                            <li key={idx} data-testid={`text-purpose-${idx}`}>
                              {point.trim()}
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Question Header */}
                  <header className="survey-header">
                    <div className="survey-logo">
                      <img 
                        src={logoImage} 
                        alt="Survey logo" 
                        data-testid="icon-survey-logo"
                      />
                    </div>
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
              <footer className="survey-footer">
                <button
                  onClick={handleBack}
                  disabled={isWelcome}
                  className="survey-back"
                  type="button"
                  data-testid="button-preview-back"
                  style={{ opacity: isWelcome ? 0.5 : 1 }}
                >
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canGoNext() || (currentQuestion === questions.length - 1 && !isWelcome)}
                  className="survey-primary"
                  type="button"
                  data-testid="button-preview-next"
                  style={{ opacity: (!canGoNext() || (currentQuestion === questions.length - 1 && !isWelcome)) ? 0.6 : 1 }}
                >
                  {isWelcome ? "Begin Survey" : currentQuestion === questions.length - 1 ? "Finish" : "Next"}
                </button>
              </footer>

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
