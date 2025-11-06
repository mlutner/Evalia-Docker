import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import type { Question } from "@/components/QuestionCard";
import type { Survey } from "@shared/schema";

export default function SurveyView() {
  const { id } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  // Fetch survey data
  const { data: survey, isLoading, error } = useQuery<Survey>({
    queryKey: ["/api/surveys", id],
    enabled: !!id,
  });

  // Submit response mutation
  const submitMutation = useMutation({
    mutationFn: async (answers: Record<string, string | string[]>) => {
      return apiRequest("POST", `/api/surveys/${id}/responses`, { answers });
    },
    onSuccess: () => {
      setIsCompleted(true);
    },
  });

  const questions = survey?.questions || [];

  const handleAnswer = (answer: string | string[]) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: answer,
    });
  };

  const canGoNext = () => {
    const question = questions[currentQuestion];
    const answer = answers[question.id];
    
    if (!question.required) return true;
    if (Array.isArray(answer)) return answer.length > 0;
    return answer && answer.toString().trim().length > 0;
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    submitMutation.mutate(answers);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading survey...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-2">Survey Not Found</h1>
          <p className="text-muted-foreground">
            The survey you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  // Completion state
  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-semibold mb-4">Thank you!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your responses have been recorded successfully.
          </p>
          <Button size="lg" onClick={() => window.location.reload()} data-testid="button-submit-another">
            Submit Another Response
          </Button>
        </div>
      </div>
    );
  }

  // No questions check
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-2">No Questions</h1>
          <p className="text-muted-foreground">
            This survey doesn't have any questions yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="w-full">
        <ProgressBar current={currentQuestion + 1} total={questions.length} />
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <QuestionCard
          question={questions[currentQuestion]}
          onAnswer={handleAnswer}
          initialAnswer={answers[questions[currentQuestion].id]}
        />
      </div>

      <div className="p-6 border-t bg-card/50">
        <div className="container mx-auto max-w-3xl flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentQuestion === 0}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter</kbd> or click Next
          </div>

          <Button
            onClick={handleNext}
            disabled={!canGoNext() || submitMutation.isPending}
            data-testid="button-next"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : currentQuestion === questions.length - 1 ? (
              <>
                Submit
                <Check className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
