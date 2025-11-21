import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import leadershipIllustration from "@assets/Heading_1763750607423.png";
import SurveyLayout from "@/components/SurveyLayout";
import SurveyWelcome from "@/pages/SurveyWelcome";
import "@/components/styles/survey-welcome.css";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, AlertCircle, FileQuestion, X } from "lucide-react";
import type { Question } from "@/components/QuestionCard";
import type { Survey } from "@shared/schema";

export default function SurveyView() {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome screen, 0+ = questions
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [showBackWarning, setShowBackWarning] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);

  const { data: survey, isLoading, error } = useQuery<Survey>({
    queryKey: ["/api/surveys", id],
    enabled: !!id,
  });

  const submitMutation = useMutation({
    mutationFn: async (answers: Record<string, string | string[]>) => {
      return apiRequest("POST", `/api/surveys/${id}/responses`, { answers });
    },
    onSuccess: () => {
      setIsCompleted(true);
    },
  });

  const questions = survey?.questions || [];
  const currentQuestion = currentStep >= 0 ? questions[currentStep] : null;

  // Keyboard navigation - Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (currentStep === -1) {
          handleStart();
        } else if (canGoNext()) {
          handleNext();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, answers]);

  const handleStart = () => {
    setCurrentStep(0);
  };

  const handleAnswer = (answer: string | string[]) => {
    if (currentQuestion) {
      setAnswers({
        ...answers,
        [currentQuestion.id]: answer,
      });
    }
  };

  const canGoNext = () => {
    if (currentStep === -1) return true;
    if (!currentQuestion) return false;
    
    const answer = answers[currentQuestion.id];
    
    if (!currentQuestion.required) return true;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer && answer.toString().trim().length > 0;
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    // Show warning if user has answered any questions and is leaving the question flow
    if (currentStep >= 0 && Object.keys(answers).length > 0) {
      setShowBackWarning(true);
    } else if (currentStep > -1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const confirmBack = () => {
    setShowBackWarning(false);
    if (currentStep > -1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExit = () => {
    if (Object.keys(answers).length > 0) {
      setShowExitWarning(true);
    } else {
      window.location.href = '/';
    }
  };

  const confirmExit = () => {
    setShowExitWarning(false);
    window.location.href = '/';
  };

  const handleSubmit = () => {
    submitMutation.mutate(answers);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
          <p className="text-muted-foreground text-lg">Loading survey...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-3xl font-semibold mb-3" data-testid="text-error-title">Survey Not Found</h1>
          <p className="text-muted-foreground text-lg" data-testid="text-error-message">
            The survey you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-12 h-12 text-primary-foreground" strokeWidth={3} />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
            Thank you!
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-3 sm:mb-4 px-4" data-testid="text-thank-you-message">
            {survey.thankYouMessage || "Your responses have been recorded successfully."}
          </p>
          <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 sm:mb-10 px-4" data-testid="text-thank-you-subtitle">
            We appreciate you taking the time to share your thoughts.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.reload()} 
            data-testid="button-submit-another"
            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto mx-4"
          >
            Submit Another Response
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <FileQuestion className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-semibold mb-3" data-testid="text-no-questions-title">No Questions</h1>
          <p className="text-muted-foreground text-lg" data-testid="text-no-questions-message">
            This survey doesn't have any questions yet.
          </p>
        </div>
      </div>
    );
  }

  // Welcome Screen
  if (currentStep === -1) {
    return (
      <SurveyLayout>
        <SurveyWelcome
          survey={survey}
          onStart={handleStart}
          isLoading={false}
          illustrationImage={leadershipIllustration}
        />
      </SurveyLayout>
    );
  }

  // Question View
  return (
    <div className="survey-shell">
      <main className="survey-card" key={currentStep}>
        {/* Header */}
        <header className="survey-header">
          <div className="survey-logo" style={{ background: 'transparent', boxShadow: 'none' }}>
            <div className="text-3xl font-bold text-primary" data-testid="icon-question-counter">
              {currentStep + 1}
            </div>
          </div>
          <h1 className="survey-title" data-testid="text-question-number">
            Question {currentStep + 1}
          </h1>
          <p className="survey-progress" data-testid="text-progress">
            {currentStep + 1} of {questions.length} • {Math.round(((currentStep + 1) / questions.length) * 100)}% complete
          </p>
        </header>

        {/* Body - Question Content */}
        <div className="survey-body">
          <QuestionCard
            question={questions[currentStep]}
            onAnswer={handleAnswer}
            initialAnswer={answers[questions[currentStep].id]}
          />
        </div>

        {/* Footer */}
        <footer className="survey-footer">
          <button 
            onClick={handleBack}
            disabled={currentStep === 0}
            className="survey-back"
            type="button"
            data-testid="button-back"
            style={{ opacity: currentStep === 0 ? 0.5 : 1, cursor: currentStep === 0 ? 'default' : 'pointer' }}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext() || submitMutation.isPending}
            className="survey-primary"
            type="button"
            data-testid="button-next"
            style={{ opacity: (!canGoNext() || submitMutation.isPending) ? 0.6 : 1 }}
          >
            {submitMutation.isPending ? 'Submitting...' : (currentStep === questions.length - 1 ? 'Submit' : 'Next')}
          </button>
        </footer>

        <p className="survey-footnote" data-testid="text-exit-hint">
          {currentStep === questions.length - 1 ? 'Thank you for your responses.' : 'Press Enter to continue'}
        </p>
      </main>
    </div>
  );
}
