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
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Question } from "@/components/QuestionCard";

interface SurveyPreviewDialogProps {
  questions: Question[];
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SurveyPreviewDialog({
  questions,
  title,
  open,
  onOpenChange,
}: SurveyPreviewDialogProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

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
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleClose = () => {
    setCurrentQuestion(0);
    setAnswers({});
    onOpenChange(false);
  };

  if (questions.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0" data-testid="dialog-survey-preview">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-xl">Preview: {title}</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            This is how respondents will experience your survey
          </p>
        </DialogHeader>

        <div className="px-6 py-4">
          <ProgressBar current={currentQuestion + 1} total={questions.length} />
        </div>

        <div className="flex-1 px-6 py-8 overflow-y-auto min-h-[400px] flex items-center justify-center">
          <QuestionCard
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
            initialAnswer={answers[questions[currentQuestion].id]}
          />
        </div>

        <div className="px-6 py-4 border-t bg-card/50">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentQuestion === 0}
              data-testid="button-preview-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {questions.length}
            </div>

            <Button
              onClick={handleNext}
              disabled={!canGoNext() || currentQuestion === questions.length - 1}
              data-testid="button-preview-next"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
