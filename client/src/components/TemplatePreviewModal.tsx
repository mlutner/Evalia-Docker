import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, FileText } from "lucide-react";
import type { SurveyTemplate } from "@shared/templates";

interface TemplatePreviewModalProps {
  template: SurveyTemplate | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUse: () => void;
}

export default function TemplatePreviewModal({
  template,
  open,
  onOpenChange,
  onUse,
}: TemplatePreviewModalProps) {
  if (!template) return null;

  const getQuestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      text: "Short Answer",
      textarea: "Long Answer",
      multiple_choice: "Multiple Choice",
      checkbox: "Checkboxes",
      email: "Email",
      number: "Number",
    };
    return labels[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]" data-testid="modal-template-preview">
        <DialogHeader>
          <DialogTitle className="text-2xl">{template.title}</DialogTitle>
          <DialogDescription className="text-base">
            {template.description}
          </DialogDescription>
          <div className="flex gap-4 pt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{template.timing}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{template.audience}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="w-4 h-4" />
              <span>{template.questionCount} questions</span>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {template.questions.map((question, index) => (
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
                {index < template.questions.length - 1 && <Separator className="mt-4" />}
              </div>
            ))}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-close-preview">
            Close
          </Button>
          <Button onClick={onUse} data-testid="button-use-from-preview">
            Use This Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
