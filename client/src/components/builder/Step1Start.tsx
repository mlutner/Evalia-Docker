import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sparkles, Layers, FileUp, Upload, X, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import FileUploadZone from "@/components/FileUploadZone";
import { surveyTemplates } from "@shared/templates";
import type { SurveyTemplate } from "@shared/templates";
import type { Question } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Step1StartProps {
  currentQuestions: Question[];
  currentSurveyTitle: string;
  onSurveyTitleChange: (title: string) => void;
  onUseTemplate: (template: SurveyTemplate) => void;
  onFileSelect: (file: File) => void;
  onGenerateFromPrompt: (prompt: string, includeScoringToggle: boolean, selectedFile?: { name: string; type: string; base64: string }) => void;
  onPasteText: (text: string) => void;
  isProcessing: boolean;
}

const PROMPT_SUGGESTIONS = [
  "✨ Add scoring instructions: Include a note that you want scoring/results for assessment",
  "📊 Specify number of questions: e.g., 'Create a 15-question survey'",
  "👥 Define target audience: e.g., 'for new employees' or 'for managers'",
  "🎯 Add learning objectives: e.g., 'to measure understanding of topic X'",
  "📚 Specify question types: e.g., 'mix of Likert scales and open-ended questions'",
  "🏆 Define success criteria: e.g., 'to identify skill gaps or measure competency'",
];

export default function Step1Start({
  currentQuestions,
  currentSurveyTitle,
  onSurveyTitleChange,
  onUseTemplate,
  onFileSelect,
  onGenerateFromPrompt,
  onPasteText,
  isProcessing,
}: Step1StartProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"templates" | "ai" | "upload">("templates");
  const [prompt, setPrompt] = useState("");
  const [selectedFileForAI, setSelectedFileForAI] = useState<{ name: string; type: string; base64: string } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(null);
  const [includeScoringToggle, setIncludeScoringToggle] = useState(false);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  const enhancePromptMutation = useMutation({
    mutationFn: async (currentPrompt: string) => {
      const res = await apiRequest("POST", "/api/enhance-prompt", { prompt: currentPrompt });
      return res.json();
    },
    onSuccess: (data: any) => {
      if (data?.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast({
          title: "Prompt enhanced",
          description: "Your prompt has been improved with AI suggestions.",
        });
      } else {
        throw new Error("No enhanced prompt received from server");
      }
    },
    onError: (error: any) => {
      toast({
        title: "Could not enhance prompt",
        description: error?.message || "Failed to enhance your prompt. Try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerateClick = () => {
    onGenerateFromPrompt(prompt, includeScoringToggle, selectedFileForAI || undefined);
    setPrompt("");
    setSelectedFileForAI(null);
    if (aiFileInputRef.current) {
      aiFileInputRef.current.value = "";
    }
  };

  const handlePasteClick = () => {
    onPasteText(parsedText);
    setParsedText("");
  };

  return (
    <div className="space-y-12">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-2">Step 1: Choose your creation method</h2>
          <p className="text-muted-foreground text-base leading-relaxed">
            Pick the option that works best for you. You can edit questions in the next step regardless of which method you choose.
          </p>
        </div>

        {/* Survey Title Input - Always Visible */}
        {currentQuestions.length > 0 && (
          <div className="mb-10 p-6 bg-primary/5 border border-primary/20 rounded-lg">
            <label className="text-sm font-semibold mb-3 block text-foreground">
              Survey Title <span className="text-destructive">*</span>
            </label>
            <Input
              value={currentSurveyTitle}
              onChange={(e) => onSurveyTitleChange(e.target.value)}
              placeholder="Enter a title for your survey..."
              className="text-base"
              data-testid="input-survey-title-step1"
            />
            <p className="text-xs text-muted-foreground mt-2">This will be the name respondents see when they start the survey</p>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "templates" | "ai" | "upload")} className="w-full">
          {/* Tab Buttons */}
          <div className="grid grid-cols-3 gap-4 mb-12 px-1">
            <button
              onClick={() => setActiveTab("templates")}
              data-testid="tab-templates"
              className={`p-6 rounded-lg border-2 transition-all ${
                activeTab === "templates" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50 bg-background hover:bg-muted/50"
              }`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === "templates" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Layers className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Templates</p>
                  <p className="text-xs text-muted-foreground mt-1">Pre-built surveys</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              data-testid="tab-ai"
              className={`p-6 rounded-lg border-2 transition-all ${activeTab === "ai" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50 bg-background hover:bg-muted/50"}`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === "ai" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Generate with AI</p>
                  <p className="text-xs text-muted-foreground mt-1">Describe your needs</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("upload")}
              data-testid="tab-upload"
              className={`p-6 rounded-lg border-2 transition-all ${activeTab === "upload" ? "border-primary bg-primary/5" : "border-muted hover:border-muted-foreground/50 bg-background hover:bg-muted/50"}`}
            >
              <div className="flex flex-col items-center text-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${activeTab === "upload" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  <FileUp className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Upload or Paste</p>
                  <p className="text-xs text-muted-foreground mt-1">Files or text</p>
                </div>
              </div>
            </button>
          </div>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-10 pt-8">
            <div className="bg-gradient-to-br from-yellow-100/30 via-yellow-50/15 to-background rounded-xl p-6 md:p-8 border-2 border-yellow-200/60" style={{ borderLeft: "4px solid rgb(245, 223, 161)" }}>
              <h3 className="text-lg font-semibold mb-3">Professional Training Templates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Start with proven survey frameworks designed for trainers. Browse templates below, preview them to see all questions, and click "Use Template" to get started.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-2">
              {surveyTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => setPreviewTemplate(template)}
                  onUse={() => onUseTemplate(template)}
                />
              ))}
            </div>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-10 pt-8">
            <div className="bg-gradient-to-br from-yellow-100/30 via-yellow-50/15 to-background rounded-xl p-6 md:p-8 border-2 border-yellow-200/60" style={{ borderLeft: "4px solid rgb(245, 223, 161)" }}>
              <h3 className="text-lg font-semibold mb-3">Generate with AI</h3>
              <p className="text-muted-foreground leading-relaxed">
                Describe what your survey is about and what you want to measure. AI will generate custom questions tailored to your needs.
              </p>
            </div>

            {isProcessing ? (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
                <div>
                  <p className="font-medium text-lg mb-1">AI is creating your survey...</p>
                  <p className="text-sm text-muted-foreground">This may take 10-20 seconds.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium">Describe your survey</label>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => enhancePromptMutation.mutate(prompt)}
                      disabled={!prompt.trim() || enhancePromptMutation.isPending}
                      className="text-xs h-7" 
                      data-testid="button-enhance-prompt"
                    >
                      {enhancePromptMutation.isPending ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-3 h-3 mr-1" />
                          Enhance
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Example: I need a survey to assess employee mental health..."
                    className="min-h-[150px] text-base"
                    data-testid="input-survey-prompt"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-border/50">
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">Include Scoring Configuration</p>
                      <p className="text-xs text-muted-foreground">AI will auto-generate assessment scoring</p>
                    </div>
                  </div>
                  <Switch checked={includeScoringToggle} onCheckedChange={setIncludeScoringToggle} data-testid="toggle-include-scoring" />
                </div>

                {selectedFileForAI && (
                  <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                    <span className="text-sm text-muted-foreground truncate">{selectedFileForAI.name}</span>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedFileForAI(null)} data-testid="button-remove-ai-file">
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="lg" onClick={() => aiFileInputRef.current?.click()} disabled={isProcessing} className="flex-1" data-testid="button-upload-ai-file">
                    <Upload className="w-4 h-4 mr-2" />
                    Attach File
                  </Button>
                  <Button size="lg" onClick={handleGenerateClick} disabled={(!prompt.trim() && !selectedFileForAI) || isProcessing} className="flex-1" data-testid="button-generate">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Survey
                  </Button>
                </div>
                <input
                  ref={aiFileInputRef}
                  type="file"
                  accept="image/*,.pdf,.txt,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const base64 = (event.target?.result as string).split(",")[1];
                        setSelectedFileForAI({ name: file.name, type: file.type, base64 });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                  data-testid="input-ai-file-upload"
                />
              </div>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-10 pt-8">
            <div className="space-y-4 bg-gradient-to-br from-yellow-100/30 via-yellow-50/15 to-background rounded-xl p-6 md:p-8 border-2 border-yellow-200/60" style={{ borderLeft: "4px solid rgb(245, 223, 161)" }}>
              <div>
                <h3 className="text-lg font-semibold mb-3">Upload Document or Paste Text</h3>
                <p className="text-muted-foreground leading-relaxed">Upload a PDF, DOCX, or TXT document and AI will generate survey questions.</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Choose a document</label>
                <FileUploadZone onFileSelect={onFileSelect} isProcessing={isProcessing} />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">Or</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Paste Text</h3>
                <p className="text-muted-foreground mb-4">Paste your content directly and AI will create survey questions from it.</p>
              </div>
              <div>
                <label htmlFor="paste-text" className="text-sm font-medium mb-2 block">
                  Paste your text here
                </label>
                <Textarea
                  id="paste-text"
                  value={parsedText}
                  onChange={(e) => setParsedText(e.target.value)}
                  placeholder="Paste text content, training materials, course notes..."
                  className="min-h-32 resize-none"
                  disabled={isProcessing}
                  data-testid="textarea-paste-text"
                />
              </div>
              <Button size="lg" onClick={handlePasteClick} disabled={!parsedText.trim() || isProcessing} className="w-full" data-testid="button-process-text">
                <Sparkles className="w-5 h-5 mr-2" />
                Process Text & Generate Survey
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Prompt Suggestions Dialog */}
        <Dialog open={showPromptSuggestions} onOpenChange={setShowPromptSuggestions}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enhance Your Prompt</DialogTitle>
              <DialogDescription>Click any suggestion to add it to your prompt for better results</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal text-sm"
                    onClick={() => {
                      const enhancedPrompt = prompt.trim() ? `${prompt}\n\n${suggestion.replace(/^[✨📊👥🎯📚🏆]\s/, "")}` : suggestion.replace(/^[✨📊👥🎯📚🏆]\s/, "");
                      setPrompt(enhancedPrompt);
                      setShowPromptSuggestions(false);
                    }}
                    data-testid={`button-suggestion-${index}`}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <TemplatePreviewModal template={previewTemplate} open={previewTemplate !== null} onOpenChange={(open) => !open && setPreviewTemplate(null)} onUse={() => previewTemplate && onUseTemplate(previewTemplate)} />
    </div>
  );
}
