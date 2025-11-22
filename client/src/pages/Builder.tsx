import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Save, FileUp, Layers, Sparkles, Loader2, Upload, X, Wand2, HelpCircle } from "lucide-react";
import Header from "@/components/Header";
import WizardSteps from "@/components/WizardSteps";
import QuestionsStep from "@/components/builder/QuestionsStep";
import PublishStep from "@/components/builder/PublishStep";
import ScoringConfigStep from "@/components/builder/ScoringConfigStep";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import SurveyPreviewDialog from "@/components/SurveyPreviewDialog";
import FileUploadZone from "@/components/FileUploadZone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { surveyTemplates } from "@shared/templates";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/components/ChatPanel";
import type { SurveyTemplate } from "@shared/templates";
import type { Question, Survey } from "@shared/schema";
import { useSurveyState } from "@/hooks/useSurveyState";
import { useFileProcessing } from "@/hooks/useFileProcessing";
import { useAIChat } from "@/hooks/useAIChat";

const WIZARD_STEPS = [
  { number: 1, title: "Start", description: "Choose how to create your survey: select a template, generate with AI, or upload a document" },
  { number: 2, title: "Questions", description: "Review and refine your questions. Use AI chat to make adjustments or edit directly" },
  { number: 3, title: "Review", description: "Add survey details, welcome message, and thank you message. Then publish to start collecting responses" },
  { number: 4, title: "Scoring (Optional)", description: "Enable assessment scoring to show respondents their results with interpretations" },
];

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 10) return "just now";
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
}

export default function Builder() {
  const [, params] = useRoute("/builder/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const surveyId = params?.id;
  const isEditMode = !!surveyId;

  // Use custom hooks
  const surveyState = useSurveyState({ surveyId, isEditMode });
  const fileProcessing = useFileProcessing();
  const aiChat = useAIChat();

  // UI state
  const [activeTab, setActiveTab] = useState<"templates" | "ai" | "upload">("templates");
  const [viewMode, setViewMode] = useState<"chat" | "edit">("chat");
  const [prompt, setPrompt] = useState("");
  const [selectedFileForAI, setSelectedFileForAI] = useState<{ name: string; type: string; base64: string } | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [trainerName, setTrainerName] = useState("");
  const [trainingDate, setTrainingDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [includeScoringToggle, setIncludeScoringToggle] = useState(true);
  const [showPromptSuggestions, setShowPromptSuggestions] = useState(false);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  const promptSuggestions = [
    "✨ Add scoring instructions: Include a note that you want scoring/results for assessment",
    "📊 Specify number of questions: e.g., 'Create a 15-question survey'",
    "👥 Define target audience: e.g., 'for new employees' or 'for managers'",
    "🎯 Add learning objectives: e.g., 'to measure understanding of topic X'",
    "📚 Specify question types: e.g., 'mix of Likert scales and open-ended questions'",
    "🏆 Define success criteria: e.g., 'to identify skill gaps or measure competency'",
  ];

  // Load existing survey if in edit mode
  const { data: existingSurvey, isLoading: isLoadingSurvey } = useQuery<Survey>({
    queryKey: ["/api/surveys", surveyId],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/surveys/${surveyId}`, undefined);
      return res.json();
    },
    enabled: isEditMode,
  });

  useEffect(() => {
    if (existingSurvey && isEditMode && !surveyState.hasLoadedSurvey) {
      surveyState.setCurrentSurveyTitle(existingSurvey.title);
      surveyState.setCurrentSurveyDescription(existingSurvey.description || "");
      surveyState.setWelcomeMessage(existingSurvey.welcomeMessage || "");
      surveyState.setThankYouMessage(existingSurvey.thankYouMessage || "");
      surveyState.setIllustrationUrl(existingSurvey.illustrationUrl || "");
      surveyState.setCurrentQuestions(existingSurvey.questions);
      surveyState.setCurrentWizardStep(2);
      aiChat.setMessages([
        {
          id: "1",
          role: "assistant",
          content: `You're editing "${existingSurvey.title}" with ${existingSurvey.questions.length} questions. Make any changes you'd like, then proceed to publish!`,
        },
      ]);
      surveyState.setHasLoadedSurvey(true);
    }
  }, [existingSurvey, isEditMode, surveyState.hasLoadedSurvey]);

  // Handlers for file processing
  const handleFileSelect = async (file: File) => {
    fileProcessing.handleFileSelect(
      file,
      (result) => {
        fileProcessing.setParsedText(result.parsedText);
        surveyState.setCurrentSurveyTitle(result.title);
        surveyState.setCurrentQuestions(result.questions);
        // Apply AI-generated scoring configuration if available
        if (result.scoreConfig) {
          surveyState.setScoreConfig(result.scoreConfig);
        }
        aiChat.setMessages([
          {
            id: "1",
            role: "assistant",
            content: `I've analyzed your document and created ${result.questions.length} questions based on the content. ${result.scoreConfig ? 'I also suggested a scoring configuration that you can customize in Step 4. ' : ''}You can edit the questions directly, preview the survey, or ask me to make changes!`,
          },
        ]);
      },
      () => {
        surveyState.setCurrentWizardStep(2);
      }
    );
  };

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim() && !selectedFileForAI) return;
    fileProcessing.handleGenerateFromPrompt(
      prompt,
      (result, questionCount) => {
        surveyState.setCurrentSurveyTitle(result.title);
        surveyState.setCurrentQuestions(result.questions);
        // Load suggested scoring config if provided
        if (result.scoreConfig) {
          surveyState.setScoreConfig(result.scoreConfig);
          toast({
            title: "Scoring suggestion created",
            description: "AI has suggested a scoring configuration for this assessment. You can customize it in Step 4.",
          });
        }
        aiChat.setMessages([
          {
            id: "1",
            role: "assistant",
            content: `I've created a ${questionCount}-question survey based on your${selectedFileForAI ? ` ${selectedFileForAI.name}` : ' description'}. ${result.scoreConfig ? 'I also suggested a scoring configuration that you can customize in Step 4. ' : ''}You can edit the questions directly, preview the survey, or ask me to make changes!`,
          },
        ]);
        setPrompt("");
        setSelectedFileForAI(null);
        if (aiFileInputRef.current) {
          aiFileInputRef.current.value = '';
        }
      },
      () => {
        surveyState.setCurrentWizardStep(2);
      },
      selectedFileForAI || undefined
    );
  };

  const handleFileSelectForAI = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!supportedTypes.includes(file.type)) {
      toast({
        title: "Unsupported file type",
        description: "Please upload an image, PDF, TXT, or DOCX file.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = (event.target?.result as string).split(',')[1];
      setSelectedFileForAI({
        name: file.name,
        type: file.type,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePasteText = async () => {
    if (!fileProcessing.parsedText.trim()) return;
    fileProcessing.handlePasteText(
      fileProcessing.parsedText,
      (result, questionCount) => {
        surveyState.setCurrentSurveyTitle(result.title);
        surveyState.setCurrentQuestions(result.questions);
        // Apply AI-generated scoring configuration if available
        if (result.scoreConfig) {
          surveyState.setScoreConfig(result.scoreConfig);
        }
        aiChat.setMessages([
          {
            id: "1",
            role: "assistant",
            content: `I've created a ${questionCount}-question survey based on your text. You can edit the questions directly, preview the survey, or ask me to make changes!`,
          },
        ]);
        fileProcessing.setParsedText("");
      },
      () => {
        surveyState.setCurrentWizardStep(2);
      }
    );
  };

  // Handle chat messages with question updates
  const handleSendMessage = async (message: string, fileData?: { name: string; type: string; base64: string }) => {
    const result = await aiChat.handleSendMessage(
      message,
      {
        title: surveyState.currentSurveyTitle,
        description: surveyState.currentSurveyDescription,
        questions: surveyState.currentQuestions,
        welcomeMessage: surveyState.welcomeMessage,
        thankYouMessage: surveyState.thankYouMessage,
      },
      aiChat.messages,
      fileData
    );

    if (result && result.questions) {
      surveyState.setCurrentQuestions(result.questions);
      if (surveyState.currentWizardStep === 1 && result.questions.length > 0) {
        setTimeout(() => surveyState.setCurrentWizardStep(2), 300);
      }
    }
  };

  const handleUseTemplate = (template: SurveyTemplate) => {
    console.log("Using template:", template.title);
    setPreviewTemplate(null);
    surveyState.setCurrentSurveyTitle(template.title);
    surveyState.setCurrentQuestions(template.questions);
    setActiveTab("templates");
    setViewMode("chat");
    aiChat.setMessages([
      {
        id: "1",
        role: "assistant",
        content: `I've loaded the "${template.title}" template with ${template.questionCount} questions. You can edit the questions directly, preview the survey, or ask me to make changes!`,
      },
    ]);
  };

  const handlePreviewSurvey = () => {
    setShowPreview(true);
  };

  const handleGenerateText = async (fieldType: "description" | "welcomeMessage" | "thankYouMessage") => {
    const generatedText = await aiChat.handleGenerateText(
      fieldType,
      surveyState.currentSurveyTitle,
      surveyState.currentQuestions
    );

    if (generatedText) {
      switch (fieldType) {
        case "description":
          surveyState.setCurrentSurveyDescription(generatedText);
          break;
        case "welcomeMessage":
          surveyState.setWelcomeMessage(generatedText);
          break;
        case "thankYouMessage":
          surveyState.setThankYouMessage(generatedText);
          break;
      }
    }
  };

  if (isEditMode && isLoadingSurvey) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-muted-foreground">Loading survey...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Back to Dashboard Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="mb-4 text-muted-foreground hover:text-foreground"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-12 pb-8 border-b border-border/30">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-4xl font-semibold">
              {isEditMode ? "Edit Survey" : "Create Survey"}
            </h1>
            {surveyState.lastAutoSave && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Save className="w-3 h-3" />
                {surveyState.isAutoSaving ? "Saving..." : `Saved ${formatTimeAgo(surveyState.lastAutoSave)}`}
              </div>
            )}
          </div>
          <p className="text-muted-foreground mb-8">
            {WIZARD_STEPS[surveyState.currentWizardStep - 1].description}
          </p>
          
          <WizardSteps
            steps={WIZARD_STEPS}
            currentStep={surveyState.currentWizardStep}
          />
        </div>

        {/* Step 1: Start - Choose creation method */}
        {surveyState.currentWizardStep === 1 && (
          <div className="space-y-12">
            <div className="max-w-6xl mx-auto">
              {/* Tab Header */}
              <div className="mb-10">
                <h2 className="text-2xl font-semibold mb-2">Step 1: Choose your creation method</h2>
                <p className="text-muted-foreground text-base leading-relaxed">Pick the option that works best for you. You can edit questions in the next step regardless of which method you choose.</p>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "templates" | "ai" | "upload")} className="w-full">
                {/* Custom Tab Button Group */}
                <div className="grid grid-cols-3 gap-4 mb-12 px-1">
                  <button
                    onClick={() => setActiveTab("templates")}
                    data-testid="tab-templates"
                    className={`p-6 rounded-lg border-2 transition-all ${
                      activeTab === "templates"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50 bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        activeTab === "templates"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
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
                    className={`p-6 rounded-lg border-2 transition-all ${
                      activeTab === "ai"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50 bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        activeTab === "ai"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
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
                    className={`p-6 rounded-lg border-2 transition-all ${
                      activeTab === "upload"
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50 bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                        activeTab === "upload"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}>
                        <FileUp className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Upload or Paste</p>
                        <p className="text-xs text-muted-foreground mt-1">Files or text</p>
                      </div>
                    </div>
                  </button>
                </div>

                <TabsContent value="templates" className="space-y-10 pt-8">
                  <div className="bg-gradient-to-br from-yellow-100/30 via-yellow-50/15 to-background rounded-xl p-6 md:p-8 border-2 border-yellow-200/60" style={{borderLeft: '4px solid rgb(245, 223, 161)'}}>
                    <h3 className="text-lg font-semibold mb-3">Professional Training Templates</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Start with proven survey frameworks designed for trainers. Browse templates below, preview them to see all questions, and click "Use Template" to get started. Once selected, you can customize the title and edit any questions in Step 2.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-2">
                    {surveyTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onPreview={() => setPreviewTemplate(template)}
                        onUse={() => {
                          handleUseTemplate(template);
                          if (surveyState.currentQuestions.length === 0) {
                            setTimeout(() => surveyState.setCurrentWizardStep(2), 100);
                          }
                        }}
                      />
                    ))}
                  </div>

                  {surveyState.currentQuestions.length > 0 && (
                    <div className="mt-10 bg-muted/40 border border-border/50 rounded-xl p-6 md:p-8">
                      <label className="text-sm font-semibold mb-3 block text-foreground">
                        Survey Title <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={surveyState.currentSurveyTitle}
                        onChange={(e) => surveyState.setCurrentSurveyTitle(e.target.value)}
                        placeholder="Enter a title for your survey..."
                        className="text-base"
                        data-testid="input-survey-title-templates"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        You can edit the template title to customize it for your needs
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="ai" className="space-y-10 pt-8">
                  <div className="bg-gradient-to-br from-yellow-100/30 via-yellow-50/15 to-background rounded-xl p-6 md:p-8 border-2 border-yellow-200/60" style={{borderLeft: '4px solid rgb(245, 223, 161)'}}>
                    <h3 className="text-lg font-semibold mb-3">Generate with AI</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Describe what your survey is about and what you want to measure. AI will generate custom questions tailored to your needs. Be specific about the training topic, learning objectives, or feedback you're seeking. Example: "I need a survey to assess employee understanding of our new compliance policy and willingness to apply it on the job."
                    </p>
                  </div>
                  
                  {fileProcessing.isProcessing ? (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center space-y-4">
                      <div className="flex justify-center">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      </div>
                      <div>
                        <p className="font-medium text-lg mb-1">AI is creating your survey...</p>
                        <p className="text-sm text-muted-foreground">
                          This may take 10-20 seconds. We're analyzing your input and crafting thoughtful questions.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-sm font-medium">
                            Describe your survey (or upload a file)
                          </label>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPromptSuggestions(true)}
                            className="text-xs h-7"
                            data-testid="button-enhance-prompt"
                          >
                            <Wand2 className="w-3 h-3 mr-1" />
                            Enhance
                          </Button>
                        </div>
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Example: I need a survey to gather feedback on our recent training workshop about leadership skills. Include questions about content quality, trainer effectiveness, and practical application."
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
                        <Switch
                          checked={includeScoringToggle}
                          onCheckedChange={setIncludeScoringToggle}
                          data-testid="toggle-include-scoring"
                        />
                      </div>

                      {selectedFileForAI && (
                        <div className="p-3 bg-muted rounded-lg flex items-center justify-between">
                          <span className="text-sm text-muted-foreground truncate">{selectedFileForAI.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => setSelectedFileForAI(null)}
                            data-testid="button-remove-ai-file"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => aiFileInputRef.current?.click()}
                          disabled={fileProcessing.isProcessing}
                          className="flex-1"
                          data-testid="button-upload-ai-file"
                          title="Upload file (image, PDF, or document)"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Attach File
                        </Button>
                        <Button
                          size="lg"
                          onClick={handleGenerateFromPrompt}
                          disabled={(!prompt.trim() && !selectedFileForAI) || fileProcessing.isProcessing}
                          className="flex-1"
                          data-testid="button-generate"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Survey
                        </Button>
                      </div>
                      <input
                        ref={aiFileInputRef}
                        type="file"
                        accept="image/*,.pdf,.txt,.docx"
                        onChange={handleFileSelectForAI}
                        className="hidden"
                        data-testid="input-ai-file-upload"
                      />
                    </div>
                  )}

                  {surveyState.currentQuestions.length > 0 && (
                    <div className="mt-10 bg-muted/40 border border-border/50 rounded-xl p-6 md:p-8">
                      <label className="text-sm font-semibold mb-3 block text-foreground">
                        Survey Title <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={surveyState.currentSurveyTitle}
                        onChange={(e) => surveyState.setCurrentSurveyTitle(e.target.value)}
                        placeholder="Enter a title for your survey..."
                        className="text-base"
                        data-testid="input-survey-title-ai"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        AI has suggested a title based on your description. Feel free to customize it.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upload" className="space-y-10 pt-8">
                  {/* File Upload Section */}
                  <div className="space-y-4 bg-gradient-to-br from-yellow-100/30 via-yellow-50/15 to-background rounded-xl p-6 md:p-8 border-2 border-yellow-200/60" style={{borderLeft: '4px solid rgb(245, 223, 161)'}}>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Upload Document or Paste Text</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Upload a PDF, DOCX, or TXT document (or paste text) and AI will analyze the content and automatically generate survey questions. Works great for training materials, course content, or any document you want to turn into an assessment.
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Choose a document
                      </label>
                      <FileUploadZone
                        onFileSelect={handleFileSelect}
                        isProcessing={fileProcessing.isProcessing}
                      />
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-background text-muted-foreground">Or</span>
                    </div>
                  </div>

                  {/* Paste Text Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Paste Text</h3>
                      <p className="text-muted-foreground mb-4">
                        Paste your content directly and AI will create survey questions from it.
                      </p>
                    </div>
                    <div>
                      <label htmlFor="paste-text" className="text-sm font-medium mb-2 block">
                        Paste your text here
                      </label>
                      <Textarea
                        id="paste-text"
                        value={fileProcessing.parsedText}
                        onChange={(e) => fileProcessing.setParsedText(e.target.value)}
                        placeholder="Paste text content, training materials, course notes, or any document content..."
                        className="min-h-32 resize-none"
                        disabled={fileProcessing.isProcessing}
                        data-testid="textarea-paste-text"
                      />
                    </div>
                    <Button
                      size="lg"
                      onClick={handlePasteText}
                      disabled={!fileProcessing.parsedText.trim() || fileProcessing.isProcessing}
                      className="w-full"
                      data-testid="button-process-text"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Process Text & Generate Survey
                    </Button>
                  </div>

                  {surveyState.currentQuestions.length > 0 && (
                    <div className="mt-10 bg-muted/40 border border-border/50 rounded-xl p-6 md:p-8">
                      <label className="text-sm font-semibold mb-3 block text-foreground">
                        Survey Title <span className="text-destructive">*</span>
                      </label>
                      <Input
                        value={surveyState.currentSurveyTitle}
                        onChange={(e) => surveyState.setCurrentSurveyTitle(e.target.value)}
                        placeholder="Enter a title for your survey..."
                        className="text-base"
                        data-testid="input-survey-title-upload"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        AI has suggested a title based on your document. Feel free to customize it.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Prompt Suggestions Dialog */}
              <Dialog open={showPromptSuggestions} onOpenChange={setShowPromptSuggestions}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Enhance Your Prompt</DialogTitle>
                    <DialogDescription>
                      Click any suggestion to add it to your prompt for better results
                    </DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-64">
                    <div className="space-y-2 pr-4">
                      {promptSuggestions.map((suggestion, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          className="w-full justify-start text-left h-auto py-3 px-4 whitespace-normal text-sm"
                          onClick={() => {
                            const enhancedPrompt = prompt.trim() 
                              ? `${prompt}\n\n${suggestion.replace(/^[✨📊👥🎯📚🏆]\s/, '')}`
                              : suggestion.replace(/^[✨📊👥🎯📚🏆]\s/, '');
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
          </div>
        )}

        {/* Step 2: Questions - Build and refine */}
        {surveyState.currentWizardStep === 2 && (
          <QuestionsStep
            questions={surveyState.currentQuestions}
            messages={aiChat.messages}
            isProcessing={aiChat.isProcessing}
            onSendMessage={handleSendMessage}
            onUpdateQuestion={surveyState.handleUpdateQuestion}
            onDeleteQuestion={surveyState.handleDeleteQuestion}
            onAddQuestion={surveyState.handleAddQuestion}
            onReorderQuestions={surveyState.setCurrentQuestions}
            onPreview={handlePreviewSurvey}
            onNext={surveyState.handleNextStep}
          />
        )}

        {/* Step 3: Publish - Add metadata */}
        {surveyState.currentWizardStep === 3 && (
          <PublishStep
            title={surveyState.currentSurveyTitle}
            description={surveyState.currentSurveyDescription}
            welcomeMessage={surveyState.welcomeMessage}
            thankYouMessage={surveyState.thankYouMessage}
            illustrationUrl={surveyState.illustrationUrl}
            generatingField={aiChat.generatingField}
            onTitleChange={surveyState.setCurrentSurveyTitle}
            onDescriptionChange={surveyState.setCurrentSurveyDescription}
            onWelcomeChange={surveyState.setWelcomeMessage}
            onThankYouChange={surveyState.setThankYouMessage}
            onIllustrationChange={surveyState.setIllustrationUrl}
            onGenerateText={handleGenerateText}
          />
        )}

        {/* Step 4: Scoring (Optional) - Configure assessment scoring */}
        {surveyState.currentWizardStep === 4 && (
          <ScoringConfigStep
            questions={surveyState.currentQuestions}
            scoreConfig={surveyState.scoreConfig}
            onScoreConfigChange={surveyState.setScoreConfig}
          />
        )}

        {/* Wizard Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <div>
            {surveyState.currentWizardStep > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={surveyState.handlePrevStep}
                data-testid="button-prev-step"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {surveyState.currentQuestions.length > 0 && surveyState.currentWizardStep > 1 && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handlePreviewSurvey}
                data-testid="button-preview"
              >
                Preview Survey
              </Button>
            )}

            {surveyState.currentWizardStep < 4 ? (
              <Button 
                size="lg" 
                onClick={surveyState.handleNextStep}
                disabled={surveyState.currentWizardStep === 1 && (!surveyState.currentSurveyTitle.trim() || surveyState.currentQuestions.length === 0)}
                data-testid="button-next-step"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={surveyState.handleSaveSurvey}
                disabled={surveyState.createSurveyMutation.isPending || surveyState.updateSurveyMutation.isPending || !surveyState.currentSurveyTitle.trim()}
                data-testid="button-save-survey"
              >
                {surveyState.createSurveyMutation.isPending || surveyState.updateSurveyMutation.isPending
                  ? "Saving..."
                  : "Save & Publish"}
              </Button>
            )}
          </div>
        </div>

        {/* Bottom Back Button */}
        <div className="mt-12 pt-8 border-t flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-back-to-dashboard-bottom"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </main>

      <TemplatePreviewModal
        template={previewTemplate}
        open={previewTemplate !== null}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUse={() => previewTemplate && handleUseTemplate(previewTemplate)}
      />

      <SurveyPreviewDialog
        questions={surveyState.currentQuestions}
        title={surveyState.currentSurveyTitle}
        description={surveyState.currentSurveyDescription}
        welcomeMessage={surveyState.welcomeMessage}
        illustration={existingSurvey?.illustrationUrl || "/attached_assets/1_1763757398561.png"}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </div>
  );
}
