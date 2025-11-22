import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Upload, X, Plus, Trash2, Award, ChevronDown, Clock, BookOpen, ChevronRight, Link2, Unlink2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useScoring } from "@/hooks/useScoring";
import type { Question, SurveyScoreConfig } from "@shared/schema";

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
}: PublishStepProps) {
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  const currentTags = tags || [];
  const [illustrations, setIllustrations] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
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
  } = useScoring(scoreConfig);

  const STANDARD_PRIVACY_STATEMENT = "Your responses are confidential and will be kept strictly anonymous. All data will be handled according to applicable privacy regulations.";

  // Auto-populate estimated time based on question count
  useEffect(() => {
    if (questions && questions.length > 0 && !estimatedMinutes) {
      const calculatedTime = Math.ceil(questions.length * 1.5);
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
        <h2 className="text-3xl font-semibold mb-3">Customize Your Survey</h2>
        <p className="text-muted-foreground text-lg">
          Add details and optional scoring configuration
        </p>
      </div>
      <div className="space-y-6 bg-card border rounded-lg p-6">
        <div>
          <label className="text-sm font-medium mb-2 block">
            Survey Title <span className="text-destructive">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className={`text-base ${!title.trim() ? 'border-destructive' : ''}`}
            placeholder="Enter a clear, descriptive title..."
            data-testid="input-survey-title"
          />
          {!title.trim() && (
            <p className="text-xs text-destructive mt-1">
              Title is required to publish your survey
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Trainer Name <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              value={trainerName || ""}
              onChange={(e) => onTrainerNameChange?.(e.target.value)}
              placeholder="e.g., Sarah Johnson"
              data-testid="input-trainer-name"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Training Date <span className="text-muted-foreground">(optional)</span>
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
          <label className="text-sm font-medium mb-2 block">
            Tags <span className="text-muted-foreground">(optional - add categories for sorting)</span>
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
                  className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm"
                  data-testid={`tag-${tag}`}
                >
                  {tag}
                  <button
                    onClick={() => onTagsChange?.(currentTags.filter(t => t !== tag))}
                    className="text-primary/60 hover:text-primary"
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
              <p className="text-sm font-medium text-muted-foreground">Choose from images</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {illustrations.map((url) => (
                <div
                  key={url}
                  onClick={() => onIllustrationChange?.(url)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    illustrationUrl === url ? "border-primary" : "border-border hover:border-muted-foreground/50"
                  }`}
                >
                  <img src={url} alt="Survey illustration" className="w-full h-24 object-cover" />
                  {illustrationUrl === url && (
                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
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
            <p className="text-sm font-medium text-muted-foreground mb-3">Upload image</p>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
              />
              <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors">
                {uploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Uploading...</p>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  </>
                )}
              </div>
            </label>
          </div>

          {illustrationUrl && (
            <div className="mt-6 rounded-lg overflow-hidden border">
              <p className="text-xs font-medium text-muted-foreground px-3 pt-3">Selected illustration</p>
              <img src={illustrationUrl} alt="Selected illustration" className="w-full max-h-48 object-cover" />
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
        <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-background border-primary/30 shadow-sm">
          <Collapsible defaultOpen={true} className="w-full">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="pb-3 hover:bg-primary/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#071a32' }}>
                      <Award className="w-5 h-5" style={{ color: '#ccff00' }} />
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">Assessment Scoring</CardTitle>
                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary">Optional</span>
                      </div>
                      <CardDescription className="text-sm">
                        Show respondents their results with personalized feedback and interpretations
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1 group-data-[state=open]:rotate-180 transition-transform" />
                </div>
              </CardHeader>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <CardContent className="space-y-4 border-t pt-4">
                {/* Enable Toggle */}
                <div className="flex items-center justify-between p-4 bg-background/60 rounded-lg border border-primary/20">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Enable Scoring</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Respondents will see their assessment results</p>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => {
                      setIsEnabled(checked);
                      if (!checked) {
                        handleSaveScoring();
                      }
                    }}
                    data-testid="switch-enable-scoring"
                  />
                </div>

                {isEnabled && (
                  <div className="space-y-4 pt-2">
                    {/* AI Auto-Generate */}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-2">Quick Setup</p>
                      <Button
                        onClick={() => handleAutoGenerateScoring(questions, onScoreConfigChange)}
                        disabled={isAutoGenerating || questions.length === 0}
                        className="w-full"
                        variant="outline"
                        size="sm"
                        data-testid="button-auto-generate-scoring"
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                        {isAutoGenerating ? "Generating..." : "AI Auto-Generate Scoring"}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Let AI analyze your questions and create scoring automatically
                      </p>
                    </div>

                    {/* Manual Categories with Score Ranges */}
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-foreground mb-2 block">Scoring Categories</label>
                        <div className="flex gap-2">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddCategory();
                              }
                            }}
                            placeholder="e.g., Leadership Style, Engagement Level..."
                            className="text-sm"
                            data-testid="input-category-name"
                          />
                          <Button
                            type="button"
                            onClick={handleAddCategory}
                            size="sm"
                            className="flex-shrink-0"
                            data-testid="button-add-category"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {categories.length > 0 && (
                        <div className="space-y-2 p-3 bg-muted/40 rounded-lg border">
                          <p className="text-xs font-medium text-muted-foreground">Configured Categories & Score Ranges</p>
                          {categories.map((cat) => {
                            const ranges = getCategoryRanges(cat.id);
                            const isExpanded = expandedCategories.includes(cat.id);
                            return (
                              <div key={cat.id} className="bg-background rounded border" data-testid={`category-${cat.id}`}>
                                <button
                                  onClick={() => toggleExpandCategory(cat.id)}
                                  className="w-full flex items-center justify-between p-2.5 text-sm hover:bg-muted/50 transition-colors group"
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    <span className="font-medium">{cat.name}</span>
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">{ranges.length} range{ranges.length !== 1 ? 's' : ''}</span>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleRemoveCategory(cat.id); }} className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-remove-category-${cat.id}`}>
                                    <Trash2 className="w-3 h-3 text-destructive" />
                                  </Button>
                                </button>
                                
                                {isExpanded && (
                                  <div className="border-t p-3 space-y-3 bg-muted/20">
                                    {ranges.map((range, idx) => {
                                      const actualIdx = scoreRanges.indexOf(range);
                                      return (
                                        <div key={actualIdx} className="space-y-2 p-2 bg-background rounded border">
                                          <div className="grid grid-cols-3 gap-2">
                                            <Input
                                              placeholder="Label"
                                              value={range.label}
                                              onChange={(e) => handleUpdateScoreRange(actualIdx, 'label', e.target.value)}
                                              className="text-xs"
                                              data-testid={`input-range-label-${actualIdx}`}
                                            />
                                            <Input
                                              placeholder="Min"
                                              type="number"
                                              value={range.minScore}
                                              onChange={(e) => handleUpdateScoreRange(actualIdx, 'minScore', parseInt(e.target.value) || 0)}
                                              className="text-xs"
                                              data-testid={`input-range-min-${actualIdx}`}
                                            />
                                            <Input
                                              placeholder="Max"
                                              type="number"
                                              value={range.maxScore}
                                              onChange={(e) => handleUpdateScoreRange(actualIdx, 'maxScore', parseInt(e.target.value) || 0)}
                                              className="text-xs"
                                              data-testid={`input-range-max-${actualIdx}`}
                                            />
                                          </div>
                                          <Textarea
                                            placeholder="Interpretation (shown to respondents)"
                                            value={range.interpretation}
                                            onChange={(e) => handleUpdateScoreRange(actualIdx, 'interpretation', e.target.value)}
                                            className="text-xs resize-none"
                                            rows={2}
                                            data-testid={`textarea-range-interpretation-${actualIdx}`}
                                          />
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveScoreRange(actualIdx)}
                                            className="text-destructive"
                                            data-testid={`button-remove-range-${actualIdx}`}
                                          >
                                            <Trash2 className="w-3 h-3 mr-1" />
                                            Remove Score Range
                                          </Button>
                                        </div>
                                      );
                                    })}
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleAddScoreRange(cat.id)}
                                      className="w-full"
                                      data-testid={`button-add-range-${cat.id}`}
                                    >
                                      <Plus className="w-3 h-3 mr-1" />
                                      Add Score Range
                                    </Button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Question Assignment Section */}
                    {categories.length > 0 && questions.length > 0 && (
                      <div className="space-y-3 p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <p className="text-xs font-semibold text-foreground">Assign Questions to Categories</p>
                        <p className="text-xs text-muted-foreground">Link survey questions to scoring categories so responses get scored</p>
                        {categories.map((cat) => {
                          const assignedQuestions = questions.filter(q => q.scoringCategory === cat.id);
                          const unassignedQuestions = questions.filter(q => !q.scoringCategory || q.scoringCategory !== cat.id);
                          return (
                            <div key={cat.id} className="space-y-2">
                              <p className="text-xs font-medium">{cat.name} ({assignedQuestions.length} assigned)</p>
                              <div className="space-y-1 pl-2">
                                {assignedQuestions.map((q) => (
                                  <div key={q.id} className="flex items-center justify-between p-1.5 bg-primary/10 rounded text-xs group">
                                    <span className="truncate flex-1">{q.question}</span>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => {
                                        const updatedQuestions = questions.map(qitem =>
                                          qitem.id === q.id ? { ...qitem, scoringCategory: undefined } : qitem
                                        );
                                        // This would need to be passed up to parent, for now just visual
                                      }}
                                      className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                      data-testid={`button-unassign-question-${q.id}`}
                                    >
                                      <Unlink2 className="w-3 h-3" />
                                    </Button>
                                  </div>
                                ))}
                                {unassignedQuestions.length > 0 && (
                                  <details className="text-xs">
                                    <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                      Assign from {unassignedQuestions.length} available question{unassignedQuestions.length !== 1 ? 's' : ''}
                                    </summary>
                                    <div className="space-y-1 mt-1 pl-2">
                                      {unassignedQuestions.map((q) => (
                                        <div key={q.id} className="flex items-center justify-between p-1.5 bg-muted/40 rounded text-xs group">
                                          <span className="truncate flex-1">{q.question}</span>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                              const updatedQuestions = questions.map(qitem =>
                                                qitem.id === q.id ? { ...qitem, scoringCategory: cat.id } : qitem
                                              );
                                              // This would need to be passed up to parent
                                            }}
                                            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            data-testid={`button-assign-question-${q.id}-${cat.id}`}
                                          >
                                            <Link2 className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </details>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Save Button */}
                    <Button
                      onClick={() => handleSaveScoring(onScoreConfigChange)}
                      className="w-full"
                      size="sm"
                      data-testid="button-save-scoring"
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Save Scoring Configuration
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Survey Metadata Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-muted/50">
          <h3 className="text-sm font-semibold">Survey Information</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Estimated Time (optional)</label>
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
            <label className="text-xs font-medium mb-1.5 block">Privacy Statement (optional)</label>
            <Input
              value={privacyStatement || ""}
              onChange={(e) => onPrivacyStatementChange?.(e.target.value)}
              placeholder="e.g., Your responses are confidential"
              className="text-sm"
              data-testid="input-privacy-statement"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block">Data Usage (optional)</label>
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
            <label className="text-sm font-medium">Welcome and introduction</label>
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
              <label className="text-sm font-medium">Purpose of the survey</label>
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
              <label className="text-sm font-medium">Thank You Message</label>
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
      <div className="bg-muted/50 border rounded-lg p-4">
        <p className="text-sm text-muted-foreground text-center">
          Ready to share? Click "Save & Publish" below to make your survey live!
        </p>
      </div>
    </div>
  );
}
