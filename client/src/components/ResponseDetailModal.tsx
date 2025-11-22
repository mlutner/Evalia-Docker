import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Survey, SurveyResponse } from "@shared/schema";

interface ResponseDetailModalProps {
  response: SurveyResponse | null;
  survey: Survey;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResponseDetailModal({
  response,
  survey,
  open,
  onOpenChange,
}: ResponseDetailModalProps) {
  if (!response) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-response-detail">
        <DialogHeader>
          <DialogTitle>Response Details</DialogTitle>
          <DialogDescription>
            Submitted on {new Date(response.completedAt).toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {survey.questions.map((question, index) => {
            const answer = response.answers[question.id];
            const hasAnswer = answer !== undefined && answer !== null;
            
            return (
              <div key={question.id} className="pb-6 border-b last:border-b-0" data-testid={`response-question-${question.id}`}>
                <div className="mb-3">
                  <h3 className="font-semibold text-sm">Q{index + 1}: {question.question}</h3>
                  {question.description && (
                    <p className="text-xs text-muted-foreground mt-1">{question.description}</p>
                  )}
                </div>
                
                <div className="pl-4 border-l-2 border-primary/30">
                  {!hasAnswer ? (
                    <p className="text-sm text-muted-foreground italic">No response provided</p>
                  ) : Array.isArray(answer) ? (
                    <div className="space-y-2">
                      {answer.map((item, i) => (
                        <div key={i} className="bg-muted/50 p-2 rounded text-sm">
                          {item}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{answer}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
