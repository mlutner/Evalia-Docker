import { useState } from "react";
import { Button } from "@/components/ui/button";
import QuestionCard from "@/components/QuestionCard";
import ProgressBar from "@/components/ProgressBar";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import type { Question } from "@/components/QuestionCard";

export default function SurveyView() {
  // TODO: remove mock functionality
  const [questions] = useState<Question[]>([
    {
      id: "1",
      type: "text",
      question: "What is your name?",
      description: "Please provide your full name",
      required: true,
    },
    {
      id: "2",
      type: "email",
      question: "What is your email address?",
      required: true,
    },
    {
      id: "3",
      type: "multiple_choice",
      question: "How would you rate the overall training quality?",
      options: ["Excellent", "Good", "Average", "Below Average", "Poor"],
      required: true,
    },
    {
      id: "4",
      type: "checkbox",
      question: "Which topics were most valuable? (Select all that apply)",
      options: [
        "Leadership Skills",
        "Communication Techniques",
        "Time Management",
        "Team Building",
        "Conflict Resolution",
      ],
      required: false,
    },
    {
      id: "5",
      type: "textarea",
      question: "What could we improve in future training sessions?",
      description: "Please be as specific as possible",
      required: false,
    },
  ]);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [isCompleted, setIsCompleted] = useState(false);

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
    console.log("Survey submitted:", answers);
    setIsCompleted(true);
  };

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
            disabled={!canGoNext()}
            data-testid="button-next"
          >
            {currentQuestion === questions.length - 1 ? (
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
