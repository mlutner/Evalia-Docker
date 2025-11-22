import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
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
}: PublishStepProps) {
  const { toast } = useToast();
  const [tagInput, setTagInput] = useState("");
  const currentTags = tags || [];
  const [illustrations, setIllustrations] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isEnabled, setIsEnabled] = useState(scoreConfig?.enabled || false);
  const [categories, setCategories] = useState(scoreConfig?.categories || []);
  const [scoreRanges, setScoreRanges] = useState(scoreConfig?.scoreRanges || []);
  const [resultsSummary, setResultsSummary] = useState(scoreConfig?.resultsSummary || "");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);

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

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory = {
        id: `cat-${Date.now()}`,
        name: newCategoryName.trim(),
      };
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
    }
  };

  const handleRemoveCategory = (catId: string) => {
    setCategories(categories.filter((c) => c.id !== catId));
    setScoreRanges(scoreRanges.filter((r) => r.category !== catId));
  };

  const handleAutoGenerateScoring = async () => {
    if (questions.length === 0) {
      toast({
        title: "No questions",
        description: "Add questions first before generating scoring configuration",
        variant: "destructive",
      });
      return;
    }

    setIsAutoGenerating(true);
    try {
      const response = await fetch("/api/generate-scoring-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate scoring config");
      }

      const { config } = await response.json();
      setIsEnabled(true);
      setCategories(config.categories || []);
      setScoreRanges(config.scoreRanges || []);
      
      toast({
        title: "Scoring configured",
        description: "AI has automatically set up scoring categories and ranges based on your questions.",
      });
    } catch (error) {
      toast({
        title: "Auto-generation failed",
        description: "Could not automatically generate scoring. You can configure it manually.",
        variant: "destructive",
      });
    } finally {
      setIsAutoGenerating(false);
    }
  };

  const handleSaveScoring = () => {
    const config: SurveyScoreConfig = {
      enabled: isEnabled,
      categories,
      scoreRanges,
      resultsSummary: resultsSummary || undefined,
    };
    onScoreConfigChange?.(config);
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

        {/* Scoring Configuration - Collapsible Section */}
        <Collapsible defaultOpen={false} className="border rounded-lg">
          <CollapsibleTrigger className="w-full">
            <div className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium">Optional: Scoring Configuration</h3>
              </div>
              <span className="text-xs text-muted-foreground">Configure results for respondents</span>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="border-t bg-muted/30 p-4 space-y-4">
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
              <div>
                <p className="text-sm font-medium">Enable Scoring</p>
                <p className="text-xs text-muted-foreground">Show respondents their results</p>
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
              <>
                <Button
                  onClick={handleAutoGenerateScoring}
                  disabled={isAutoGenerating || questions.length === 0}
                  className="w-full"
                  variant="outline"
                  size="sm"
                  data-testid="button-auto-generate-scoring"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {isAutoGenerating ? "Generating..." : "AI Auto-Generate Scoring"}
                </Button>

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
                    placeholder="Add scoring category..."
                    className="text-sm"
                    data-testid="input-category-name"
                  />
                  <Button
                    type="button"
                    onClick={handleAddCategory}
                    size="sm"
                    data-testid="button-add-category"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {categories.length > 0 && (
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <div key={cat.id} className="flex items-center justify-between p-2 bg-background rounded border text-sm" data-testid={`category-${cat.id}`}>
                        <span>{cat.name}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveCategory(cat.id)} className="h-6 w-6" data-testid={`button-remove-category-${cat.id}`}>
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  onClick={handleSaveScoring}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  data-testid="button-save-scoring"
                >
                  Save Scoring Configuration
                </Button>
              </>
            )}
          </CollapsibleContent>
        </Collapsible>

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
