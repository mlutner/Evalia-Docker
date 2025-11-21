import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import surveyIllustration from "@/assets/survey-illustration.png";
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', background: '#f9fafb' }}>
        <div style={{ background: '#ffffff', maxWidth: '520px', width: '100%', padding: '40px 32px 36px', borderRadius: '16px', boxShadow: '0 18px 45px rgba(15, 23, 42, 0.12)', textAlign: 'center' }}>
          {/* Logo mark */}
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <div style={{ width: '18px', height: '18px', borderRadius: '4px', border: '2px solid #ffffff', position: 'relative' }}></div>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: '30px', lineHeight: '1.15', letterSpacing: '-0.02em', marginBottom: '10px', color: '#071a32' }}>
            {survey.title}
          </h1>

          {/* Subtitle */}
          {survey.description && (
            <p style={{ fontSize: '15px', lineHeight: '1.5', color: '#42526b', marginBottom: '28px' }}>
              {survey.description}
            </p>
          )}

          {/* Illustration */}
          <div style={{ marginBottom: '28px' }}>
            <img
              src={surveyIllustration}
              alt="Survey illustration"
              style={{ width: '210px', maxWidth: '100%' }}
            />
          </div>

          {/* What You'll Gain Section */}
          {survey.welcomeMessage && (
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '14px', color: '#071a32' }}>What you'll gain:</h2>
              <ul style={{ listStyle: 'none', textAlign: 'left', maxWidth: '420px', margin: '0 auto 28px', paddingLeft: '0' }}>
                {survey.welcomeMessage.split('\n').filter(line => line.trim()).map((point, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', fontSize: '15px', lineHeight: '1.5', color: '#42526b', marginBottom: '8px' }}>
                    <span style={{ color: '#42526b', fontSize: '18px', marginRight: '8px', lineHeight: '1.2', flexShrink: 0 }}>•</span>
                    <span>{point.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleStart}
            data-testid="button-start-survey"
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '13px 24px', borderRadius: '999px', border: 'none', outline: 'none', cursor: 'pointer', background: '#22c55e', color: '#ffffff', fontWeight: '600', fontSize: '15px', boxShadow: '0 10px 25px rgba(34, 197, 94, 0.35)', transition: 'transform 0.08s ease, box-shadow 0.08s ease, background 0.1s ease', width: '100%', maxWidth: '260px' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 16px 35px rgba(34, 197, 94, 0.4)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#22c55e'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px rgba(34, 197, 94, 0.35)'; }}
          >
            Start Survey
          </button>

          {/* Helper text */}
          <p style={{ marginTop: '10px', fontSize: '13px', color: '#42526b' }}>
            Fast, confidential, and designed for your growth.
          </p>
        </div>
      </div>
    );
  }

  // Question View
  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <ProgressBar current={currentStep + 1} total={questions.length} />
      
      {/* Question Counter & Exit Button */}
      <div className="fixed top-4 sm:top-6 left-4 sm:left-6 right-4 sm:right-6 z-40 flex items-center justify-between">
        <div className="text-xs sm:text-sm font-medium text-muted-foreground bg-background/80 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border shadow-sm" data-testid="text-question-counter">
          <span className="text-foreground font-semibold">
            {currentStep + 1}
          </span>
          <span> of {questions.length}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleExit}
          data-testid="button-exit-survey"
          title="Exit survey"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 pt-20 sm:pt-24 pb-28 sm:pb-32 overflow-y-auto">
        <div key={currentStep} className="w-full max-w-2xl">
          <QuestionCard
            question={questions[currentStep]}
            onAnswer={handleAnswer}
            initialAnswer={answers[questions[currentStep].id]}
          />
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 bg-background/95 backdrop-blur-md border-t shadow-lg">
        <div className="container mx-auto max-w-4xl flex items-center justify-between gap-2 sm:gap-4">
          <Button
            variant="ghost"
            size="lg"
            onClick={handleBack}
            disabled={currentStep === 0}
            data-testid="button-back"
            className="text-sm sm:text-base md:text-lg"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Back</span>
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
            className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 shadow-md hover:shadow-lg transition-shadow"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                <span className="hidden xs:inline">Submitting...</span>
              </>
            ) : currentStep === questions.length - 1 ? (
              <>
                Submit
                <Check className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Back Button Warning Dialog */}
      <AlertDialog open={showBackWarning} onOpenChange={setShowBackWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Go back?</AlertDialogTitle>
            <AlertDialogDescription>
              Your current answer will be saved, but you can review or change it if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-back">Stay Here</AlertDialogCancel>
            <AlertDialogAction onClick={confirmBack} data-testid="button-confirm-back">
              Go Back
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Exit Warning Dialog */}
      <AlertDialog open={showExitWarning} onOpenChange={setShowExitWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit survey?</AlertDialogTitle>
            <AlertDialogDescription>
              You have started answering this survey. Are you sure you want to exit? Your answers will not be saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-exit">Keep Answering</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-exit">
              Exit Survey
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
