import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles, Loader2, Upload, X, Plus, Trash2, Award, ChevronDown, Clock, BookOpen, ChevronRight, Link2, Unlink2, FileText, BarChart3, GripVertical, HelpCircle, ArrowRight, Eye, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useScoring } from "@/hooks/useScoring";
import { ScoringConfiguration } from "./ScoringConfiguration";
import type { Question, SurveyScoreConfig } from "@shared/schema";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateSurveyPDF, downloadPDF } from "@/lib/pdfGenerator";

interface PublishStepProps {
  title: string;
  description: string;
  welcomeMessage: string;
  thankYouMessage: string;
  illustrationUrl?: string;
  trainerName?: string;
  trainingDate?: string;
  tags?: string[];
  generatingField: string | null;
  questions?: Question[];
  scoreConfig?: SurveyScoreConfig;
  estimatedMinutes?: number;
  privacyStatement?: string;
  dataUsageStatement?: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onWelcomeChange: (value: string) => void;
  onThankYouChange: (value: string) => void;
  onTrainerNameChange?: (value: string) => void;
  onTrainingDateChange?: (value: string) => void;
  onTagsChange?: (tags: string[]) => void;
  onIllustrationChange?: (url: string) => void;
  onGenerateText: (fieldType: "description" | "welcomeMessage" | "thankYouMessage") => void;
  onScoreConfigChange?: (config: SurveyScoreConfig) => void;
  onEstimatedMinutesChange?: (minutes: number | undefined) => void;
  onPrivacyStatementChange?: (statement: string) => void;
  onDataUsageStatementChange?: (statement: string) => void;
  onQuestionsChange?: (questions: Question[]) => void;
  onPreview?: () => void;
  onTestPreview?: () => void;
}

export default function PublishStep({
  title,
  description,
  welcomeMessage,
  thankYouMessage,
  illustrationUrl,
  trainerName,
  trainingDate,
  tags,
  generatingField,
  questions = [],
  scoreConfig,
  estimatedMinutes,
  privacyStatement,
  dataUsageStatement,
  onTitleChange,
  onDescriptionChange,
  onWelcomeChange,
  onThankYouChange,
  onTrainerNameChange,
  onTrainingDateChange,
  onTagsChange,
  onIllustrationChange,
  onGenerateText,
  onScoreConfigChange,
  onEstimatedMinutesChange,
  onPrivacyStatementChange,
  onDataUsageStatementChange,
  onQuestionsChange,
  onPreview,
  onTestPreview,
}: PublishStepProps) {
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  const currentTags = tags || [];
  const [illustrations, setIllustrations] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [expandedRanges, setExpandedRanges] = useState<string[]>([]);
  const [pdfPreviewOpen, setPdfPreviewOpen] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const handleExportPdf = async () => {
    if (!questions || questions.length === 0) {
      toast({
        title: "No questions",
        description: "Please add questions before exporting to PDF",
        variant: "destructive",
      });
      return;
    }

    setGeneratingPdf(true);
    try {
      const pdf = await generateSurveyPDF(
        title || "Untitled Survey",
        description || "",
        questions,
        welcomeMessage || "",
        thankYouMessage || "",
        estimatedMinutes
      );
      downloadPDF(pdf, title || "survey");
      toast({
        title: "Success",
        description: "Survey exported as PDF",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setGeneratingPdf(false);
    }
  };

  const {
    isEnabled,
    setIsEnabled,
    categories,
    scoreRanges,
    resultsSummary,
    setResultsSummary,
    newCategoryName,
    setNewCategoryName,
    isAutoGenerating,
    expandedCategories,
    handleAddCategory,
    handleRemoveCategory,
    toggleExpandCategory,
    getCategoryRanges,
    handleAddScoreRange,
    handleUpdateScoreRange,
    handleRemoveScoreRange,
    handleAutoGenerateScoring,
    handleSaveScoring,
    autoPopulateCategoriesFromSections,
    isQuestionScorable,
    validateScoreRanges,
  } = useScoring(scoreConfig);

  // Count non-scorable questions
  const nonScorableQuestions = questions?.filter(q => !isQuestionScorable(q)) || [];
  
  // Filter out empty categories
  const categoriesWithQuestions = categories.filter(cat => 
    questions?.some(q => isQuestionScorable(q) && (q.sectionId === cat.name))
  );

  // Drag and drop handler for question assignment
  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const questionId = active.id as string;
    const categoryId = over.id as string;
    
    if (categoryId === "unassigned") {
      const updated = questions.map(q =>
        q.id === questionId ? { ...q, scoringCategory: undefined } : q
      );
      onQuestionsChange?.(updated);
    } else {
      const updated = questions.map(q =>
        q.id === questionId ? { ...q, scoringCategory: categoryId } : q
      );
      onQuestionsChange?.(updated);
    }
  };

  // Question Card with Move to Section Option
  const QuestionCard = ({ question, currentCategoryId, isAssigned = false }: { question: Question; currentCategoryId?: string; isAssigned?: boolean }) => {
    const { attributes, listeners, setNodeRef } = useDraggable({
      id: question.id,
    });
    const [showMoveMenu, setShowMoveMenu] = useState(false);

    const handleMoveToCategory = (targetCatId: string) => {
      const updated = questions.map(q =>
        q.id === question.id ? { ...q, scoringCategory: targetCatId } : q
      );
      onQuestionsChange?.(updated);
      setShowMoveMenu(false);
    };

    const handleMoveToUnassigned = () => {
      const updated = questions.map(q =>
        q.id === question.id ? { ...q, scoringCategory: undefined } : q
      );
      onQuestionsChange?.(updated);
      setShowMoveMenu(false);
    };

    const otherCategories = categories.filter(cat => cat.id !== currentCategoryId);

    return (
      <div
        className="p-3 bg-background rounded border text-xs group hover:bg-muted/40 transition-colors"
        data-testid={`question-card-${question.id}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="truncate font-medium text-sm">{question.question}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{getQuestionTypeLabel(question.type)} • {getMaxPointsForQuestion(question)}pt</p>
          </div>
          
          {isAssigned && (
            <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <Select open={showMoveMenu} onOpenChange={setShowMoveMenu} onValueChange={(value) => {
                if (value === "unassigned") {
                  handleMoveToUnassigned();
                } else {
                  handleMoveToCategory(value);
                }
              }}>
                <SelectTrigger className="h-6 w-24 text-xs px-2" data-testid={`button-move-question-${question.id}`}>
                  <ArrowRight className="w-3 h-3 mr-1" />
                  <span>Move</span>
                </SelectTrigger>
                <SelectContent align="end">
                  {otherCategories.length > 0 && (
                    <>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Move to Category</div>
                      {otherCategories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                      <div className="my-1 h-px bg-muted" />
                    </>
                  )}
                  <SelectItem value="unassigned">
                    Unassigned
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>
    );
  };


  const STANDARD_PRIVACY_STATEMENT = "Your responses are confidential and will be kept strictly anonymous. All data will be handled according to applicable privacy regulations.";

  // Helper function to determine if a question type contributes to scoring
  const getScorableQuestionTypes = () => ["rating", "nps", "multiple_choice", "checkbox", "number"];
  const isScorableQuestion = (q: Question) => getScorableQuestionTypes().includes(q.type);
  const scorableQuestions = questions.filter(isScorableQuestion);

  // Helper to get max points a question can contribute
  const getMaxPointsForQuestion = (q: Question): number => {
    if (q.type === "rating") return q.ratingScale || 5;
    if (q.type === "nps") return 10;
    if (q.type === "number") return 5;
    if (q.type === "multiple_choice") return 5;
    if (q.type === "checkbox") return 5;
    return 0;
  };

  // Get question type display
  const getQuestionTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      rating: "Rating",
      nps: "NPS",
      multiple_choice: "Multiple Choice",
      checkbox: "Checkboxes",
      number: "Number",
    };
    return labels[type] || type;
  };

  // Toggle score range expansion
  const toggleExpandRange = (rangeId: string) => {
    setExpandedRanges(prev =>
      prev.includes(rangeId) 
        ? prev.filter(id => id !== rangeId)
        : [...prev, rangeId]
    );
  };

  // Auto-populate scoring categories from survey sections when scoring is enabled
  useEffect(() => {
    if (isEnabled && categories.length === 0 && questions && questions.length > 0) {
      autoPopulateCategoriesFromSections(questions);
    }
  }, [isEnabled]);

  // Calculate estimated time based on question type
  const calculateEstimatedTime = (qs: Question[]): number => {
    let totalSeconds = 0;
    
    // Add time for each question based on type
    qs.forEach(q => {
      if (q.type === 'section') {
        totalSeconds += 10; // Section headers are quick
      } else if (q.type === 'text' || q.type === 'textarea') {
        totalSeconds += 90; // Free text takes longer
      } else if (q.type === 'multiple_choice' || q.type === 'checkbox') {
        totalSeconds += 30; // Quick selection
      } else if (q.type === 'rating' || q.type === 'nps') {
        totalSeconds += 20; // Fast rating scales
      } else if (q.type === 'number' || q.type === 'email' || q.type === 'date') {
        totalSeconds += 25; // Quick input
      } else if (q.type === 'matrix' || q.type === 'ranking') {
        totalSeconds += 45; // Complex questions take longer
      }
    });
    
    // Add welcome/thank you time: ~60 seconds
    totalSeconds += 60;
    
    // Convert to minutes and round up
    return Math.max(1, Math.ceil(totalSeconds / 60));
  };

  // Auto-populate estimated time based on question count and types
  useEffect(() => {
    if (questions && questions.length > 0 && !estimatedMinutes) {
      const calculatedTime = calculateEstimatedTime(questions);
      onEstimatedMinutesChange?.(calculatedTime);
    }
  }, [questions?.length]);

  // Auto-populate privacy statement on first render
  useEffect(() => {
    if (!privacyStatement || privacyStatement.trim() === "") {
      onPrivacyStatementChange?.(STANDARD_PRIVACY_STATEMENT);
    }
  }, []);

  useEffect(() => {
    const fetchIllustrations = async () => {
      try {
        const response = await fetch("/api/illustrations");
        if (response.ok) {
          const data = await response.json();
          setIllustrations(data.illustrations || []);
        }
      } catch (error) {
        console.error("Failed to fetch illustrations:", error);
      }
    };
    fetchIllustrations();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload-illustration", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        onIllustrationChange?.(data.url);
        setIllustrations([...illustrations, data.url]);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploadingImage(false);
    }
  };


  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-semibold mb-3" style={{ color: '#1C2635' }}>Customize Your Survey</h2>
        <p className="text-lg" style={{ color: '#6A7789' }}>
          Add details and optional scoring configuration
        </p>
      </div>
      <div className="form-field-group bg-card border rounded-lg p-8">
        <div className="form-field-item">
          <label className="text-sm font-semibold mb-3 block" style={{ color: '#1C2635' }}>
            Survey Title <span style={{ color: '#A3D65C' }}>*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={`text-base ${!title.trim() ? 'border-destructive' : ''}`}
            placeholder="Enter a clear, descriptive title..."
            data-testid="input-survey-title"
          />
          {!title.trim() && (
            <p className="text-xs mt-1" style={{ color: '#A3D65C' }}>
              Title is required to publish your survey
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: '#1C2635' }}>
              Trainer Name <span style={{ color: '#6A7789' }}>(optional)</span>
            </label>
            <Input
              value={trainerName || ""}
              onChange={(e) => onTrainerNameChange?.(e.target.value)}
              placeholder="e.g., Sarah Johnson"
              data-testid="input-trainer-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block" style={{ color: '#1C2635' }}>
              Training Date <span style={{ color: '#6A7789' }}>(optional)</span>
            </label>
            <Input
              type="date"
              value={trainingDate || ""}
              onChange={(e) => onTrainingDateChange?.(e.target.value)}
              data-testid="input-training-date"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block" style={{ color: '#1C2635' }}>
            Tags <span style={{ color: '#6A7789' }}>(optional - add categories for sorting)</span>
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
                    onTagsChange?.([...currentTags, tagInput.trim()]);
                    setTagInput("");
                  }
                }
              }}
              placeholder="e.g., Compliance, Safety, Onboarding"
              data-testid="input-tag"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (tagInput.trim() && !currentTags.includes(tagInput.trim())) {
                  onTagsChange?.([...currentTags, tagInput.trim()]);
                  setTagInput("");
                }
              }}
              data-testid="button-add-tag"
              className="px-3"
            >
              Add
            </Button>
          </div>
          {currentTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentTags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                  style={{ backgroundColor: '#F0F2F5', color: '#2F8FA5', border: '1px solid #E2E7EF' }}
                  data-testid={`tag-${tag}`}
                >
                  {tag}
                  <button
                    onClick={() => onTagsChange?.(currentTags.filter(t => t !== tag))}
                    style={{ color: '#A3D65C' }}
                    data-testid={`button-remove-tag-${tag}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-4 block">Welcome Illustration</label>
          
          {/* Choose from Images Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium" style={{ color: '#6A7789' }}>Choose from images</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {illustrations.map((url) => (
                <div
                  key={url}
                  onClick={() => onIllustrationChange?.(url)}
                  style={{
                    border: illustrationUrl === url ? '2px solid #2F8FA5' : '2px solid #E2E7EF',
                    backgroundColor: '#F7F9FC',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '96px',
                    transition: 'all 0.2s'
                  }}
                  className="relative"
                >
                  <img src={url} alt="Survey illustration" className="max-w-full max-h-full object-contain p-1" />
                  {illustrationUrl === url && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(47, 143, 165, 0.15)' }}>
                      <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2F8FA5' }}>
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upload Image Section */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: '#6A7789' }}>Upload image</p>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              <div style={{
                borderWidth: '2px',
                borderStyle: 'dashed',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                borderColor: '#E2E7EF',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F0F2F5';
                e.currentTarget.style.borderColor = '#2F8FA5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = '#E2E7EF';
              }}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" style={{ color: '#2F8FA5' }} />
                    <p className="text-sm" style={{ color: '#6A7789' }}>Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mx-auto mb-2" style={{ color: '#A3D65C' }} />
                    <p className="text-sm" style={{ color: '#6A7789' }}>Click to upload or drag and drop</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {illustrationUrl && (
            <div className="mt-6 rounded-lg overflow-hidden border" style={{ borderColor: '#E2E7EF', backgroundColor: '#F7F9FC' }}>
              <p className="text-xs font-medium px-3 pt-3" style={{ color: '#6A7789' }}>Selected illustration</p>
              <div className="flex items-center justify-center h-32 p-2">
                <img src={illustrationUrl} alt="Selected illustration" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onIllustrationChange?.("")}
                  className="w-full"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Scoring Configuration - Prominent Card Section */}
        <Card style={{ backgroundColor: '#F0F2F5', borderColor: '#E2E7EF' }}>
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#37C0A3' }}>
                      <Award className="w-5 h-5" style={{ color: 'white' }} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base" style={{ color: '#1C2635' }}>Assessment Scoring</CardTitle>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F7F9FC', color: '#2F8FA5', border: '1px solid #E2E7EF' }}>Optional</span>
                      </div>
                      <CardDescription className="text-sm" style={{ color: '#6A7789' }}>
                        Show respondents their results with personalized feedback and interpretations
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 flex-shrink-0 mt-1 group-data-[state=open]:rotate-180 transition-transform" style={{ color: '#6A7789' }} />
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="border-t pt-4">
                <ScoringConfiguration
                  isEnabled={isEnabled}
                  onToggle={(checked) => {
                    setIsEnabled(checked);
                    if (!checked) {
                      handleSaveScoring(onScoreConfigChange);
                    }
                  }}
                  categories={categories}
                  questions={questions}
                  scoreConfig={scoreConfig}
                  newCategoryName={newCategoryName}
                  onNewCategoryNameChange={setNewCategoryName}
                  onAddCategory={handleAddCategory}
                  onRemoveCategory={handleRemoveCategory}
                  onQuestionsChange={onQuestionsChange}
                  onAutoGenerateScoring={() => handleAutoGenerateScoring(questions, onScoreConfigChange, onQuestionsChange)}
                  isAutoGenerating={isAutoGenerating}
                  expandedCategories={expandedCategories}
                  onToggleExpandCategory={toggleExpandCategory}
                  expandedRanges={expandedRanges}
                  onToggleExpandRange={toggleExpandRange}
                  getCategoryRanges={getCategoryRanges}
                  onAddScoreRange={handleAddScoreRange}
                  onUpdateScoreRange={handleUpdateScoreRange}
                  onRemoveScoreRange={handleRemoveScoreRange}
                  onSaveScoring={() => handleSaveScoring(onScoreConfigChange)}
                  getQuestionTypeLabel={getQuestionTypeLabel}
                  getMaxPointsForQuestion={getMaxPointsForQuestion}
                  scorableQuestions={scorableQuestions}
                  isQuestionScorable={isQuestionScorable}
                  isScorableQuestion={isScorableQuestion}
                />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Survey Metadata Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-muted/50">
          <h3 className="text-sm font-semibold">Survey Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <label className="text-xs font-medium">Estimated Time (optional)</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    How long you estimate it takes to complete the survey. Shown to respondents before they start.
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={estimatedMinutes || ""}
                  onChange={(e) => onEstimatedMinutesChange?.(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 5"
                  className="text-sm"
                  data-testid="input-estimated-minutes"
                />
                <span className="text-xs text-muted-foreground">min</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block">Total Questions</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-md border border-input">
                <span className="text-sm font-medium">{questions.length || 0}</span>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-xs font-medium">Privacy Statement (optional)</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  Assure respondents about their privacy and data protection. Shown on the welcome screen.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              value={privacyStatement || ""}
              onChange={(e) => onPrivacyStatementChange?.(e.target.value)}
              placeholder="e.g., Your responses are confidential"
              className="text-sm"
              data-testid="input-privacy-statement"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <label className="text-xs font-medium">Data Usage (optional)</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  Explain how you'll use the survey responses. Builds trust and transparency with respondents.
                </TooltipContent>
              </Tooltip>
            </div>
            <Input
              value={dataUsageStatement || ""}
              onChange={(e) => onDataUsageStatementChange?.(e.target.value)}
              placeholder="e.g., Results will improve our training"
              className="text-sm"
              data-testid="input-data-usage-statement"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <label className="text-sm font-medium">Welcome and introduction</label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs">
                  Brief overview shown under the survey title. Helps respondents understand what they're about to take.
                </TooltipContent>
              </Tooltip>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onGenerateText("description")}
              disabled={generatingField !== null}
              data-testid="button-ai-description"
              className="text-xs h-7"
            >
              {generatingField === "description" ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  AI Suggest
                </>
              )}
            </Button>
          </div>
          <Textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            className="text-sm resize-none"
            placeholder="Brief description of what this survey is about (optional)"
            rows={3}
            data-testid="input-survey-description"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Appears under the title on the welcome screen
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium">Purpose of the survey</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Add exactly 3 bullet points (one per line, 8-12 words each). Helps respondents understand why the survey matters.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onGenerateText("welcomeMessage")}
                disabled={generatingField !== null}
                data-testid="button-ai-welcome"
                className="text-xs h-7"
              >
                {generatingField === "welcomeMessage" ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggest
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={welcomeMessage}
              onChange={(e) => onWelcomeChange(e.target.value)}
              className="text-sm resize-none"
              placeholder="Enter 3 bullet points (one per line, no dashes or bullets)"
              rows={3}
              data-testid="input-welcome-message"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Exactly 3 bullet points (8-12 words each, one per line) shown under "The purpose of the survey:" on the welcome screen
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <label className="text-sm font-medium">Thank You Message</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs text-xs">
                    Shown to respondents after they complete and submit the survey. Thank them and reinforce survey impact.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onGenerateText("thankYouMessage")}
                disabled={generatingField !== null}
                data-testid="button-ai-thankyou"
                className="text-xs h-7"
              >
                {generatingField === "thankYouMessage" ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Suggest
                  </>
                )}
              </Button>
            </div>
            <Textarea
              value={thankYouMessage}
              onChange={(e) => onThankYouChange(e.target.value)}
              className="text-sm resize-none"
              placeholder="Thank respondents for their time (optional)"
              rows={3}
              data-testid="input-thank-you-message"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Shown after survey completion
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="bg-muted/50 border rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            Ready to preview? Check how your questionnaire type looks before publishing.
          </p>
        </div>
        
        {/* Preview Section */}
        {questions && questions.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center flex-wrap">
            <Button
              variant="outline"
              size="lg"
              onClick={onPreview}
              className="flex-1 sm:flex-initial min-w-max"
              data-testid="button-preview-online"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Online
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={onTestPreview}
              className="flex-1 sm:flex-initial min-w-max"
              data-testid="button-preview-test"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Test
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleExportPdf}
              disabled={generatingPdf}
              className="flex-1 sm:flex-initial min-w-max"
              data-testid="button-export-pdf"
            >
              {generatingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export as PDF
                </>
              )}
            </Button>
          </div>
        )}
        
        <div className="bg-muted/50 border rounded-lg p-4">
          <p className="text-sm text-muted-foreground text-center">
            Ready to share? Click "Save & Publish" below to make your questionnaire type live!
          </p>
        </div>
      </div>
    </div>
  );
}
