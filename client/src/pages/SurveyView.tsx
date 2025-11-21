import { useState, useEffect } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, AlertCircle, FileQuestion, X } from "lucide-react";
import type { Question } from "@/components/QuestionCard";
import type { Survey } from "@shared/schema";
import surveyCollaborationIllustration from "@assets/generated_images/three_people_collaborative_circle_line_art.png";

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
      <div className="min-h-screen flex items-center justify-center p-6 bg-background relative overflow-hidden">
        {/* Subtle Background Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent/5 rounded-full blur-2xl opacity-40"></div>
        </div>

        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-500 relative z-10">
          {/* Icon - Small, top aligned */}
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-accent" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-4 leading-snug tracking-tight px-4">
            {survey.title}
          </h1>

          {/* Subtitle/Description */}
          {survey.description && (
            <p className="text-base sm:text-lg text-muted-foreground text-center mb-12 px-4 max-w-2xl mx-auto leading-relaxed">
              {survey.description}
            </p>
          )}

          {/* Illustration - Centered */}
          <div className="mb-12 px-4">
            <div className="w-full flex justify-center">
              <img 
                src={surveyCollaborationIllustration} 
                alt="Team collaboration and feedback" 
                className="w-full max-w-lg h-auto"
              />
            </div>
          </div>

          {/* What You'll Gain Section */}
          {survey.welcomeMessage && (
            <div className="mb-12 px-4 max-w-2xl mx-auto">
              <h3 className="text-lg sm:text-xl font-semibold mb-5 text-foreground">What you'll gain:</h3>
              <ul className="space-y-3">
                {/* Parse welcome message as bullet points or use default */}
                {survey.welcomeMessage.split('\n').filter(line => line.trim()).map((point, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-muted-foreground">{point.trim()}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Survey Info & Required Fields */}
          <div className="mb-8 px-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span className="font-medium">{questions.length} {questions.length === 1 ? 'question' : 'questions'}</span>
            <span className="hidden sm:block">•</span>
            <span className="font-medium">Takes about {Math.max(1, Math.ceil(questions.length / 2))} {Math.ceil(questions.length / 2) === 1 ? 'minute' : 'minutes'}</span>
            {questions.some(q => q.required) && (
              <>
                <span className="hidden sm:block">•</span>
                <span><span className="text-destructive font-semibold">*</span> indicates required fields</span>
              </>
            )}
          </div>

          {/* CTA Button */}
          <div className="flex justify-center px-4 mb-6">
            <Button 
              size="lg" 
              onClick={handleStart}
              data-testid="button-start-survey"
              className="text-base sm:text-lg px-12 sm:px-14 py-3 sm:py-3.5 shadow-md hover:shadow-lg transition-all group font-semibold"
            >
              Start Survey
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Footer Text */}
          <p className="text-xs sm:text-sm text-muted-foreground/70 text-center px-4">
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
