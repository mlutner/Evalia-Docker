import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, AlertCircle, FileQuestion } from "lucide-react";
import type { Question } from "@/components/QuestionCard";
import type { Survey } from "@shared/schema";

export default function SurveyView() {
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome screen, 0+ = questions
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);

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
    if (currentStep > -1) {
      setCurrentStep(currentStep - 1);
    }
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-primary/5 to-primary/10">
        <div className="text-center max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Check className="w-12 h-12 text-white" strokeWidth={3} />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Thank you!
          </h1>
          <p className="text-2xl text-muted-foreground mb-4" data-testid="text-thank-you-message">
            {survey.thankYouMessage || "Your responses have been recorded successfully."}
          </p>
          <p className="text-lg text-muted-foreground/80 mb-10" data-testid="text-thank-you-subtitle">
            We appreciate you taking the time to share your thoughts.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.reload()} 
            data-testid="button-submit-another"
            className="text-lg px-8 py-6"
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
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-primary/5 to-background">
        <div className="text-center max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="mb-8">
            <Sparkles className="w-16 h-16 text-primary mx-auto mb-6 animate-pulse" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            {survey.title}
          </h1>
          {survey.description && (
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              {survey.description}
            </p>
          )}
          {survey.welcomeMessage && (
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto" data-testid="text-welcome-message">
              {survey.welcomeMessage}
            </p>
          )}
          <div className="flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              onClick={handleStart}
              data-testid="button-start-survey"
              className="text-xl px-10 py-7 shadow-lg hover:shadow-xl transition-shadow"
            >
              Start Survey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-muted-foreground" data-testid="text-survey-info">
              {questions.length} {questions.length === 1 ? 'question' : 'questions'} · Takes about {Math.max(1, Math.ceil(questions.length / 2))} {Math.ceil(questions.length / 2) === 1 ? 'minute' : 'minutes'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Question View
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/10">
      <ProgressBar current={currentStep + 1} total={questions.length} />
      
      {/* Question Counter */}
      <div className="fixed top-6 left-6 z-40">
        <div className="text-sm font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm" data-testid="text-question-counter">
          {currentStep + 1} of {questions.length}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 pt-20">
        <div key={currentStep} className="w-full">
          <QuestionCard
            question={questions[currentStep]}
            onAnswer={handleAnswer}
            initialAnswer={answers[questions[currentStep].id]}
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="sticky bottom-0 p-6 bg-background/95 backdrop-blur-md border-t shadow-lg">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 0}
            data-testid="button-back"
            className="text-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
            <kbd className="px-2 py-1 bg-background rounded text-xs font-mono border shadow-sm">Enter ↵</kbd>
            <span>to continue</span>
          </div>

          <Button
            size="lg"
            onClick={handleNext}
            disabled={!canGoNext() || submitMutation.isPending}
            data-testid="button-next"
            className="text-lg px-8 shadow-md hover:shadow-lg transition-shadow"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Submitting...
              </>
            ) : currentStep === questions.length - 1 ? (
              <>
                Submit
                <Check className="w-5 h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
