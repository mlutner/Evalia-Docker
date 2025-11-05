import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Trash2, Plus } from "lucide-react";
import type { Question, QuestionType } from "@shared/schema";

interface QuestionEditorProps {
  question: Question;
  index: number;
  onUpdate: (question: Question) => void;
  onDelete: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export default function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
}: QuestionEditorProps) {
  const updateField = (field: keyof Question, value: any) => {
    onUpdate({ ...question, [field]: value });
  };

  const updateOption = (optIndex: number, value: string) => {
    const newOptions = [...(question.options || [])];
    newOptions[optIndex] = value;
    onUpdate({ ...question, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...(question.options || []), ""];
    onUpdate({ ...question, options: newOptions });
  };

  const removeOption = (optIndex: number) => {
    const newOptions = (question.options || []).filter((_, i) => i !== optIndex);
    onUpdate({ ...question, options: newOptions });
  };

  const questionTypes: { value: QuestionType; label: string }[] = [
    { value: "text", label: "Short Answer" },
    { value: "textarea", label: "Long Answer" },
    { value: "email", label: "Email" },
    { value: "number", label: "Number" },
    { value: "multiple_choice", label: "Multiple Choice" },
    { value: "checkbox", label: "Checkboxes" },
  ];

  const needsOptions = question.type === "multiple_choice" || question.type === "checkbox";

  return (
    <Card className="relative" data-testid={`question-editor-${question.id}`}>
      <div className="absolute left-2 top-4 cursor-move text-muted-foreground hover:text-foreground">
        <GripVertical className="w-5 h-5" />
      </div>
      
      <CardHeader className="pl-12 pr-4 pb-4">
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium text-muted-foreground shrink-0 mt-2">
            {index + 1}.
          </span>
          <div className="flex-1 space-y-4">
            <div>
              <Label htmlFor={`question-${question.id}`}>Question</Label>
              <Textarea
                id={`question-${question.id}`}
                value={question.question}
                onChange={(e) => updateField("question", e.target.value)}
                placeholder="Enter your question..."
                className="mt-1 resize-none"
                rows={2}
                data-testid="input-question-text"
              />
            </div>

            <div>
              <Label htmlFor={`description-${question.id}`}>Description (optional)</Label>
              <Input
                id={`description-${question.id}`}
                value={question.description || ""}
                onChange={(e) => updateField("description", e.target.value)}
                placeholder="Add helpful context..."
                className="mt-1"
                data-testid="input-question-description"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label htmlFor={`type-${question.id}`}>Question Type</Label>
                <Select
                  value={question.type}
                  onValueChange={(value) => updateField("type", value as QuestionType)}
                >
                  <SelectTrigger className="mt-1" data-testid="select-question-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id={`required-${question.id}`}
                  checked={question.required}
                  onCheckedChange={(checked) => updateField("required", checked)}
                  data-testid="switch-required"
                />
                <Label htmlFor={`required-${question.id}`} className="cursor-pointer">
                  Required
                </Label>
              </div>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            className="shrink-0 text-destructive hover:text-destructive"
            data-testid="button-delete-question"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      {needsOptions && (
        <CardContent className="pl-12 pr-4 pt-0 space-y-3">
          <Label>Options</Label>
          {(question.options || []).map((option, optIndex) => (
            <div key={optIndex} className="flex items-center gap-2">
              <Input
                value={option}
                onChange={(e) => updateOption(optIndex, e.target.value)}
                placeholder={`Option ${optIndex + 1}`}
                data-testid={`input-option-${optIndex}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(optIndex)}
                disabled={(question.options?.length || 0) <= 1}
                data-testid={`button-remove-option-${optIndex}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addOption}
            className="w-full"
            data-testid="button-add-option"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Option
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
