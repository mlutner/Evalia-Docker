import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, FileText } from "lucide-react";
import type { Question } from "@shared/schema";

interface SurveyOutlinePreviewProps {
  questions: Question[];
  title: string;
  description?: string;
  estimatedMinutes?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SurveyOutlinePreview({
  questions,
  title,
  description,
  estimatedMinutes,
  open,
  onOpenChange,
}: SurveyOutlinePreviewProps) {
  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Short Answer",
      textarea: "Long Answer",
      multiple_choice: "Multiple Choice",
      checkbox: "Checkboxes",
      email: "Email",
      number: "Number",
      rating: "Rating",
      nps: "NPS",
      date: "Date",
      section: "Section",
      matrix: "Matrix",
      ranking: "Ranking",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]" data-testid="modal-survey-outline-preview">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-base">
              {description}
            </DialogDescription>
          )}
          <div className="flex gap-4 pt-2">
            {estimatedMinutes && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{estimatedMinutes} min</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{questions.length} questions</span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={question.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-sm font-medium text-muted-foreground shrink-0 mt-1">
                    {index + 1}.
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-medium">
                        {question.question}
                        {question.required && <span className="text-destructive ml-1">*</span>}
                      </p>
                      <Badge variant="outline" className="shrink-0">
                        {getQuestionTypeLabel(question.type)}
                      </Badge>
                    </div>
                    {question.description && (
                      <p className="text-sm text-muted-foreground">{question.description}</p>
                    )}
                    {question.options && question.options.length > 0 && (
                      <div className="pl-4 space-y-1">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40" />
                            <span>{option}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {index < questions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)} 
            className="w-full"
            data-testid="button-close-outline-preview"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
