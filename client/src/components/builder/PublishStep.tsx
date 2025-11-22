import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Upload, X, Plus, Trash2, Award, ChevronDown, Clock, HelpCircle, Shield, TrendingUp } from "lucide-react";
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
  onEstimatedMinutesChange?: (minutes: number) => void;
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
    handleAddCategory,
    handleRemoveCategory,
    handleAutoGenerateScoring,
    handleSaveScoring,
  } = useScoring(scoreConfig);

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
                        onClick={() => handleAutoGenerateScoring(questions)}
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

                    {/* Manual Categories */}
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
                          <p className="text-xs font-medium text-muted-foreground">Configured Categories</p>
                          {categories.map((cat) => (
                            <div key={cat.id} className="flex items-center justify-between p-2.5 bg-background rounded border text-sm hover:bg-muted/50 transition-colors group" data-testid={`category-${cat.id}`}>
                              <span className="font-medium">{cat.name}</span>
                              <Button variant="ghost" size="icon" onClick={() => handleRemoveCategory(cat.id)} className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-remove-category-${cat.id}`}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

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

        {/* Survey Metadata - Compact Section */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-muted/50">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-primary" />
            Survey Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block">Estimated Time (optional)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  max="120"
                  value={estimatedMinutes || ""}
                  onChange={(e) => onEstimatedMinutesChange?.(parseInt(e.target.value) || 0)}
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
              placeholder="e.g., Your responses are confidential and anonymous"
              className="text-sm"
              data-testid="input-privacy-statement"
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block">Data Usage (optional)</label>
            <Input
              value={dataUsageStatement || ""}
              onChange={(e) => onDataUsageStatementChange?.(e.target.value)}
              placeholder="e.g., Results will be used to improve training programs"
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
