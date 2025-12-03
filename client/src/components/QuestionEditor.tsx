import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GripVertical, Trash2, Plus } from "lucide-react";
import type { Question, QuestionType } from "@shared/schema";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { theme } from "@/theme";
import QuestionQualityFeedback from "@/components/QuestionQualityFeedback";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    setShowDeleteConfirm(false);
    onDelete();
  };

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

  const questionTypes: { value: QuestionType; label: string; category: string }[] = [
    // Text inputs
    { value: "text", label: "Short Answer", category: "Text" },
    { value: "textarea", label: "Long Answer", category: "Text" },
    { value: "email", label: "Email", category: "Text" },
    { value: "phone", label: "Phone Number", category: "Text" },
    { value: "url", label: "Website URL", category: "Text" },
    { value: "number", label: "Number", category: "Text" },
    // Selection
    { value: "multiple_choice", label: "Multiple Choice", category: "Selection" },
    { value: "checkbox", label: "Checkboxes", category: "Selection" },
    { value: "dropdown", label: "Dropdown", category: "Selection" },
    { value: "yes_no", label: "Yes / No", category: "Selection" },
    // Rating & Scales
    { value: "rating", label: "Rating Scale", category: "Rating" },
    { value: "nps", label: "Net Promoter Score (0-10)", category: "Rating" },
    { value: "likert", label: "Likert Scale", category: "Rating" },
    { value: "opinion_scale", label: "Opinion Scale", category: "Rating" },
    { value: "slider", label: "Slider", category: "Rating" },
    // Advanced
    { value: "matrix", label: "Matrix / Grid", category: "Advanced" },
    { value: "ranking", label: "Ranking", category: "Advanced" },
    { value: "constant_sum", label: "Point Distribution", category: "Advanced" },
    // Date & Time
    { value: "date", label: "Date Picker", category: "Date & Time" },
    { value: "time", label: "Time Picker", category: "Date & Time" },
    // Structural
    { value: "section", label: "Section Divider", category: "Structural" },
    { value: "statement", label: "Information Text", category: "Structural" },
    { value: "legal", label: "Consent / Legal", category: "Structural" },
  ];

  const needsOptions = ["multiple_choice", "checkbox", "dropdown", "ranking", "constant_sum"].includes(question.type);
  const isRatingType = question.type === "rating";
  const isLikertType = question.type === "likert";
  const isSliderType = question.type === "slider";
  const isOpinionScale = question.type === "opinion_scale";
  const isMatrixType = question.type === "matrix";
  const isYesNoType = question.type === "yes_no";
  const isConstantSum = question.type === "constant_sum";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className="relative" 
      data-testid={`question-editor-${question.id}`}
    >
      <div 
        {...attributes}
        {...listeners}
        className="absolute left-2 top-4 cursor-move touch-none"
        style={{ color: theme.colors.lime }}
      >
        <GripVertical className="w-5 h-5" />
      </div>
      
      <CardHeader className="pl-12 pr-4 pb-4">
        <div className="flex items-start gap-3">
          <span className="text-sm font-medium shrink-0 mt-2" style={{ color: theme.colors.textSecondary }}>
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
              <QuestionQualityFeedback
                question={question.question}
                questionType={question.type}
                options={question.options}
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

            <div>
              <Label htmlFor={`scoring-category-${question.id}`}>Scoring Category (optional)</Label>
              <Input
                id={`scoring-category-${question.id}`}
                value={question.scoringCategory || ""}
                onChange={(e) => updateField("scoringCategory", e.target.value || undefined)}
                placeholder="e.g., Autocratic, Democratic"
                className="mt-1"
                data-testid="input-scoring-category"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Assign this question to a scoring category for assessment results
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
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

      {/* Rating Type Options */}
      {isRatingType && (
        <CardContent className="pl-12 pr-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`rating-style-${question.id}`}>Display Style</Label>
              <Select
                value={question.ratingStyle || "number"}
                onValueChange={(value) => updateField("ratingStyle", value)}
              >
                <SelectTrigger className="mt-1" data-testid="select-rating-style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Number Scale</SelectItem>
                  <SelectItem value="star">Stars ★</SelectItem>
                  <SelectItem value="emoji">Emoji 😐</SelectItem>
                  <SelectItem value="heart">Hearts ♥</SelectItem>
                  <SelectItem value="thumb">Thumbs 👍</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`rating-scale-${question.id}`}>Scale (1 to...)</Label>
              <Select
                value={String(question.ratingScale || 5)}
                onValueChange={(value) => updateField("ratingScale", parseInt(value, 10))}
              >
                <SelectTrigger className="mt-1" data-testid="select-rating-scale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 (1-3)</SelectItem>
                  <SelectItem value="5">5 (1-5)</SelectItem>
                  <SelectItem value="7">7 (1-7)</SelectItem>
                  <SelectItem value="10">10 (1-10)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`rating-label-low-${question.id}`}>Low Label</Label>
              <Input
                id={`rating-label-low-${question.id}`}
                value={question.ratingLabels?.low || ""}
                onChange={(e) => updateField("ratingLabels", { 
                  ...question.ratingLabels, 
                  low: e.target.value || undefined 
                })}
                placeholder="Strongly Disagree"
                className="mt-1"
                data-testid="input-rating-label-low"
              />
            </div>

            <div>
              <Label htmlFor={`rating-label-high-${question.id}`}>High Label</Label>
              <Input
                id={`rating-label-high-${question.id}`}
                value={question.ratingLabels?.high || ""}
                onChange={(e) => updateField("ratingLabels", { 
                  ...question.ratingLabels, 
                  high: e.target.value || undefined 
                })}
                placeholder="Strongly Agree"
                className="mt-1"
                data-testid="input-rating-label-high"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Customize how the rating scale appears to respondents
          </p>
        </CardContent>
      )}

      {/* Likert Scale Options */}
      {isLikertType && (
        <CardContent className="pl-12 pr-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`likert-type-${question.id}`}>Scale Type</Label>
              <Select
                value={question.likertType || "agreement"}
                onValueChange={(value) => updateField("likertType", value)}
              >
                <SelectTrigger className="mt-1" data-testid="select-likert-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="agreement">Agreement (Strongly Disagree → Strongly Agree)</SelectItem>
                  <SelectItem value="frequency">Frequency (Never → Always)</SelectItem>
                  <SelectItem value="importance">Importance (Not Important → Extremely Important)</SelectItem>
                  <SelectItem value="satisfaction">Satisfaction (Very Dissatisfied → Very Satisfied)</SelectItem>
                  <SelectItem value="quality">Quality (Very Poor → Excellent)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`likert-points-${question.id}`}>Number of Points</Label>
              <Select
                value={String(question.likertPoints || 5)}
                onValueChange={(value) => updateField("likertPoints", parseInt(value, 10))}
              >
                <SelectTrigger className="mt-1" data-testid="select-likert-points">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5-point scale</SelectItem>
                  <SelectItem value="7">7-point scale</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Pre-configured scales with standard labels for consistent responses
          </p>
        </CardContent>
      )}

      {/* Slider Options */}
      {isSliderType && (
        <CardContent className="pl-12 pr-4 pt-0 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`slider-min-${question.id}`}>Minimum</Label>
              <Input
                id={`slider-min-${question.id}`}
                type="number"
                value={question.min || 0}
                onChange={(e) => updateField("min", parseInt(e.target.value, 10) || 0)}
                className="mt-1"
                data-testid="input-slider-min"
              />
            </div>

            <div>
              <Label htmlFor={`slider-max-${question.id}`}>Maximum</Label>
              <Input
                id={`slider-max-${question.id}`}
                type="number"
                value={question.max || 100}
                onChange={(e) => updateField("max", parseInt(e.target.value, 10) || 100)}
                className="mt-1"
                data-testid="input-slider-max"
              />
            </div>

            <div>
              <Label htmlFor={`slider-step-${question.id}`}>Step</Label>
              <Input
                id={`slider-step-${question.id}`}
                type="number"
                value={question.step || 1}
                onChange={(e) => updateField("step", parseInt(e.target.value, 10) || 1)}
                className="mt-1"
                data-testid="input-slider-step"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`slider-unit-${question.id}`}>Unit (optional)</Label>
              <Input
                id={`slider-unit-${question.id}`}
                value={question.unit || ""}
                onChange={(e) => updateField("unit", e.target.value || undefined)}
                placeholder="%, $, years, etc."
                className="mt-1"
                data-testid="input-slider-unit"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                id={`slider-show-value-${question.id}`}
                checked={question.showValue !== false}
                onCheckedChange={(checked) => updateField("showValue", checked)}
                data-testid="switch-slider-show-value"
              />
              <Label htmlFor={`slider-show-value-${question.id}`} className="cursor-pointer">
                Show current value
              </Label>
            </div>
          </div>
        </CardContent>
      )}

      {/* Opinion Scale Options */}
      {isOpinionScale && (
        <CardContent className="pl-12 pr-4 pt-0 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor={`opinion-scale-${question.id}`}>Scale Size</Label>
              <Select
                value={String(question.ratingScale || 5)}
                onValueChange={(value) => updateField("ratingScale", parseInt(value, 10))}
              >
                <SelectTrigger className="mt-1" data-testid="select-opinion-scale">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 points</SelectItem>
                  <SelectItem value="7">7 points</SelectItem>
                  <SelectItem value="10">10 points</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`opinion-left-${question.id}`}>Left Label</Label>
              <Input
                id={`opinion-left-${question.id}`}
                value={question.leftLabel || ""}
                onChange={(e) => updateField("leftLabel", e.target.value || undefined)}
                placeholder="Low / Cold / Bad"
                className="mt-1"
                data-testid="input-opinion-left"
              />
            </div>

            <div>
              <Label htmlFor={`opinion-right-${question.id}`}>Right Label</Label>
              <Input
                id={`opinion-right-${question.id}`}
                value={question.rightLabel || ""}
                onChange={(e) => updateField("rightLabel", e.target.value || undefined)}
                placeholder="High / Hot / Good"
                className="mt-1"
                data-testid="input-opinion-right"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id={`opinion-numbers-${question.id}`}
              checked={question.showNumbers !== false}
              onCheckedChange={(checked) => updateField("showNumbers", checked)}
              data-testid="switch-opinion-numbers"
            />
            <Label htmlFor={`opinion-numbers-${question.id}`} className="cursor-pointer">
              Show numbers on scale
            </Label>
          </div>
        </CardContent>
      )}

      {/* Yes/No Options */}
      {isYesNoType && (
        <CardContent className="pl-12 pr-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`yes-label-${question.id}`}>Yes Label</Label>
              <Input
                id={`yes-label-${question.id}`}
                value={question.yesLabel || ""}
                onChange={(e) => updateField("yesLabel", e.target.value || undefined)}
                placeholder="Yes"
                className="mt-1"
                data-testid="input-yes-label"
              />
            </div>

            <div>
              <Label htmlFor={`no-label-${question.id}`}>No Label</Label>
              <Input
                id={`no-label-${question.id}`}
                value={question.noLabel || ""}
                onChange={(e) => updateField("noLabel", e.target.value || undefined)}
                placeholder="No"
                className="mt-1"
                data-testid="input-no-label"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Customize button labels (e.g., "Agree/Disagree", "True/False")
          </p>
        </CardContent>
      )}

      {/* Matrix Options */}
      {isMatrixType && (
        <CardContent className="pl-12 pr-4 pt-0 space-y-4">
          <div>
            <Label>Row Labels (one per line)</Label>
            <Textarea
              value={(question.rowLabels || []).join("\n")}
              onChange={(e) => updateField("rowLabels", e.target.value.split("\n").filter(r => r.trim()))}
              placeholder="Row 1&#10;Row 2&#10;Row 3"
              className="mt-1"
              rows={4}
              data-testid="textarea-row-labels"
            />
          </div>

          <div>
            <Label>Column Labels (one per line)</Label>
            <Textarea
              value={(question.colLabels || []).join("\n")}
              onChange={(e) => updateField("colLabels", e.target.value.split("\n").filter(c => c.trim()))}
              placeholder="Column 1&#10;Column 2&#10;Column 3"
              className="mt-1"
              rows={4}
              data-testid="textarea-col-labels"
            />
          </div>

          <div>
            <Label htmlFor={`matrix-type-${question.id}`}>Response Type</Label>
            <Select
              value={question.matrixType || "radio"}
              onValueChange={(value) => updateField("matrixType", value)}
            >
              <SelectTrigger className="mt-1" data-testid="select-matrix-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="radio">Single choice per row</SelectItem>
                <SelectItem value="checkbox">Multiple per row</SelectItem>
                <SelectItem value="text">Text input per cell</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      )}

      {/* Constant Sum Options */}
      {isConstantSum && (
        <CardContent className="pl-12 pr-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`total-points-${question.id}`}>Total Points</Label>
              <Input
                id={`total-points-${question.id}`}
                type="number"
                value={question.totalPoints || 100}
                onChange={(e) => updateField("totalPoints", parseInt(e.target.value, 10) || 100)}
                className="mt-1"
                data-testid="input-total-points"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <Switch
                id={`show-percentage-${question.id}`}
                checked={question.showPercentage === true}
                onCheckedChange={(checked) => updateField("showPercentage", checked)}
                data-testid="switch-show-percentage"
              />
              <Label htmlFor={`show-percentage-${question.id}`} className="cursor-pointer">
                Show percentages
              </Label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Respondents will distribute points across options (must equal total)
          </p>
        </CardContent>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Question?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this question. Any responses to this question will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" data-testid="button-confirm-delete">
              Delete Question
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
