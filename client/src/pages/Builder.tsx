import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import FileUploadZone from "@/components/FileUploadZone";
import ChatPanel from "@/components/ChatPanel";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import SurveyPreviewDialog from "@/components/SurveyPreviewDialog";
import QuestionEditor from "@/components/QuestionEditor";
import WizardSteps from "@/components/WizardSteps";
import QuestionsStep from "@/components/builder/QuestionsStep";
import PublishStep from "@/components/builder/PublishStep";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Sparkles, FileText, MessageSquare, Layers, Upload, Plus, Edit3, Loader2, ArrowRight, ArrowLeft, FileUp, Save } from "lucide-react";
import { surveyTemplates } from "@shared/templates";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/components/ChatPanel";
import type { SurveyTemplate } from "@shared/templates";
import type { Question, Survey } from "@shared/schema";

const WIZARD_STEPS = [
  { number: 1, title: "Start", description: "Choose how to begin" },
  { number: 2, title: "Questions", description: "Build your survey" },
  { number: 3, title: "Publish", description: "Add details & share" },
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

  // Wizard state
  const [currentWizardStep, setCurrentWizardStep] = useState(1);
  const [hasLoadedSurvey, setHasLoadedSurvey] = useState(false);
  
  // Survey data state
  const [currentSurveyTitle, setCurrentSurveyTitle] = useState("");
  const [currentSurveyDescription, setCurrentSurveyDescription] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [thankYouMessage, setThankYouMessage] = useState("");
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<"templates" | "ai" | "upload">("templates");
  const [viewMode, setViewMode] = useState<"chat" | "edit">("chat");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatingField, setGeneratingField] = useState<string | null>(null);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

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
    if (existingSurvey && isEditMode && !hasLoadedSurvey) {
      setCurrentSurveyTitle(existingSurvey.title);
      setCurrentSurveyDescription(existingSurvey.description || "");
      setWelcomeMessage(existingSurvey.welcomeMessage || "");
      setThankYouMessage(existingSurvey.thankYouMessage || "");
      setCurrentQuestions(existingSurvey.questions);
      setCurrentWizardStep(2); // Skip to questions step when editing
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `You're editing "${existingSurvey.title}" with ${existingSurvey.questions.length} questions. Make any changes you'd like, then proceed to publish!`,
        },
      ]);
      setHasLoadedSurvey(true); // Mark as loaded to prevent resetting wizard step
    }
  }, [existingSurvey, isEditMode, hasLoadedSurvey]);

  const handleFileSelect = async (file: File) => {
    console.log("File selected:", file.name);
    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/parse-document", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to parse document";
        const errorTip = errorData.tip;
        
        // Show error toast with helpful tip
        toast({
          title: errorMessage,
          description: errorTip,
          variant: "destructive",
        });
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setParsedText(data.parsedText);
      setCurrentSurveyTitle(data.title);
      setCurrentQuestions(data.questions);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `I've analyzed your document and created ${data.questions.length} questions based on the content. You can edit the questions directly, preview the survey, or ask me to make changes!`,
        },
      ]);
      
      // Auto-advance to questions step
      if (data.questions.length > 0) {
        setTimeout(() => setCurrentWizardStep(2), 100);
      }
    } catch (error: any) {
      console.error("Document parsing error:", error.message || error);
      
      // If toast wasn't shown (network error, etc), show generic error
      if (!error.message || error.message === 'Failed to fetch') {
        toast({
          title: "Connection Error",
          description: "Could not connect to the server. Please check your connection and try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          survey: {
            title: currentSurveyTitle,
            description: currentSurveyDescription,
            questions: currentQuestions,
            welcomeMessage: welcomeMessage,
            thankYouMessage: thankYouMessage,
          },
          history: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: "AI chat error",
          description: errorData.error || "Failed to process your message. Please try again.",
          variant: "destructive",
        });
        throw new Error(errorData.error || "Failed to process message");
      }

      const data = await response.json();
      
      // Update questions if AI modified them
      if (data.questions) {
        setCurrentQuestions(data.questions);
      }
      
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
      };
      setMessages((prev) => [...prev, aiResponse]);
    } catch (error: any) {
      console.error("Chat error:", error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) return;
    console.log("Generating survey from prompt:", prompt);
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/generate-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate survey");
      }

      const data = await response.json();
      setCurrentSurveyTitle(data.title);
      setCurrentQuestions(data.questions);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `I've created a ${data.questions.length}-question survey based on your description. You can edit the questions directly, preview the survey, or ask me to make changes!`,
        },
      ]);
      setPrompt(""); // Clear prompt after generation
    } catch (error: any) {
      console.error("Survey generation error:", error);
      toast({
        title: "AI generation failed",
        description: error.message || "Failed to generate survey. Please try again with a different description.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasteText = async () => {
    if (!pastedText.trim()) return;
    console.log("Processing pasted text");
    setIsProcessing(true);
    
    try {
      const response = await fetch("/api/generate-survey", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: pastedText }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process text");
      }

      const data = await response.json();
      setCurrentSurveyTitle(data.title);
      setCurrentQuestions(data.questions);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `I've created a ${data.questions.length}-question survey based on your text. You can edit the questions directly, preview the survey, or ask me to make changes!`,
        },
      ]);
      setPastedText(""); // Clear text after generation
      
      // Auto-advance to questions step
      if (data.questions.length > 0) {
        setTimeout(() => setCurrentWizardStep(2), 100);
      }
    } catch (error: any) {
      console.error("Text processing error:", error);
      toast({
        title: "Processing failed",
        description: error.message || "Failed to process text. Please try again with more content.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseTemplate = (template: SurveyTemplate) => {
    console.log("Using template:", template.title);
    setPreviewTemplate(null);
    setCurrentSurveyTitle(template.title);
    setCurrentQuestions(template.questions);
    setActiveTab("templates");
    setViewMode("chat");
    setMessages([
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

  const handleUpdateQuestion = (index: number, updated: Question) => {
    const newQuestions = [...currentQuestions];
    newQuestions[index] = updated;
    setCurrentQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    setCurrentQuestions(currentQuestions.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: `q${Date.now()}`,
      type: "text",
      question: "",
      required: false,
    };
    setCurrentQuestions([...currentQuestions, newQuestion]);
  };

  const createSurveyMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; welcomeMessage?: string; thankYouMessage?: string; questions: Question[] }) => {
      return apiRequest("POST", "/api/surveys", data);
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      toast({
        title: "Survey published!",
        description: "Your survey has been saved and is ready to share.",
      });
      
      // Update URL to edit mode without redirecting
      response.json().then((data: any) => {
        if (data.id) {
          window.history.replaceState({}, '', `/builder/${data.id}`);
        }
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create survey",
        variant: "destructive",
      });
    },
  });

  const updateSurveyMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; welcomeMessage?: string; thankYouMessage?: string; questions: Question[] }) => {
      return apiRequest("PUT", `/api/surveys/${surveyId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      queryClient.invalidateQueries({ queryKey: ["/api/surveys", surveyId] });
      toast({
        title: "Survey updated!",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update survey",
        variant: "destructive",
      });
    },
  });

  // Auto-save mutation (silent, doesn't redirect)
  const autoSaveMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; welcomeMessage?: string; thankYouMessage?: string; questions: Question[] }) => {
      if (isEditMode) {
        return apiRequest("PUT", `/api/surveys/${surveyId}`, data);
      } else {
        return apiRequest("POST", "/api/surveys", data);
      }
    },
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/surveys"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["/api/surveys", surveyId] });
      }
      setLastAutoSave(new Date());
      setIsAutoSaving(false);
      
      // If this was a new survey, update the URL to edit mode
      if (!isEditMode && response) {
        response.json().then((data: any) => {
          if (data.id) {
            window.history.replaceState({}, '', `/builder/${data.id}`);
          }
        });
      }
    },
    onError: (error: any) => {
      console.error("Auto-save failed:", error);
      setIsAutoSaving(false);
    },
  });

  // Auto-save effect - triggers 3 seconds after changes
  useEffect(() => {
    // Don't auto-save if no questions yet or if we're on step 1
    if (currentQuestions.length === 0 || currentWizardStep === 1) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    // Set new timer for 3 seconds
    autoSaveTimer.current = setTimeout(() => {
      const surveyData = {
        title: currentSurveyTitle || "Untitled Survey",
        description: currentSurveyDescription || undefined,
        welcomeMessage: welcomeMessage || undefined,
        thankYouMessage: thankYouMessage || undefined,
        questions: currentQuestions,
      };

      setIsAutoSaving(true);
      autoSaveMutation.mutate(surveyData);
    }, 3000);

    // Cleanup timer on unmount
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [currentQuestions, currentSurveyTitle, currentSurveyDescription, welcomeMessage, thankYouMessage, currentWizardStep]);

  const handleGenerateText = async (fieldType: "description" | "welcomeMessage" | "thankYouMessage") => {
    if (!currentSurveyTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please add a survey title first",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add questions to your survey first",
        variant: "destructive",
      });
      return;
    }

    setGeneratingField(fieldType);

    try {
      const response = await apiRequest("POST", "/api/generate-text", {
        fieldType,
        surveyTitle: currentSurveyTitle,
        questions: currentQuestions,
      });

      const data = await response.json();
      const generatedText = data.text.trim();

      switch (fieldType) {
        case "description":
          setCurrentSurveyDescription(generatedText);
          break;
        case "welcomeMessage":
          setWelcomeMessage(generatedText);
          break;
        case "thankYouMessage":
          setThankYouMessage(generatedText);
          break;
      }

      toast({
        title: "Generated!",
        description: "AI has created a suggestion for you",
      });
    } catch (error: any) {
      console.error("Text generation error:", error);
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate text",
        variant: "destructive",
      });
    } finally {
      setGeneratingField(null);
    }
  };


  const handleNextStep = () => {
    if (currentWizardStep === 1) {
      if (currentQuestions.length === 0) {
        toast({
          title: "Choose a method",
          description: "Please select a template, use AI, or upload a document to continue",
          variant: "destructive",
        });
        return;
      }
      setCurrentWizardStep(2);
    } else if (currentWizardStep === 2) {
      if (currentQuestions.length === 0) {
        toast({
          title: "Add questions",
          description: "Please add at least one question before continuing",
          variant: "destructive",
        });
        return;
      }
      setCurrentWizardStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentWizardStep > 1) {
      setCurrentWizardStep(currentWizardStep - 1);
    }
  };

  const handleSaveSurvey = () => {
    if (!currentSurveyTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your survey",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestions.length === 0) {
      toast({
        title: "Questions required",
        description: "Please add at least one question to your survey",
        variant: "destructive",
      });
      return;
    }

    const surveyData = {
      title: currentSurveyTitle,
      description: currentSurveyDescription || undefined,
      welcomeMessage: welcomeMessage || undefined,
      thankYouMessage: thankYouMessage || undefined,
      questions: currentQuestions,
    };

    if (isEditMode) {
      updateSurveyMutation.mutate(surveyData);
    } else {
      createSurveyMutation.mutate(surveyData);
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
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-semibold">
              {isEditMode ? "Edit Survey" : "Create Survey"}
            </h1>
            {lastAutoSave && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Save className="w-3 h-3" />
                {isAutoSaving ? "Saving..." : `Saved ${formatTimeAgo(lastAutoSave)}`}
              </div>
            )}
          </div>
          <p className="text-muted-foreground mb-6">
            {WIZARD_STEPS[currentWizardStep - 1].description}
          </p>
          
          <WizardSteps
            steps={WIZARD_STEPS}
            currentStep={currentWizardStep}
          />
        </div>

        {/* Step 1: Start - Choose creation method */}
        {currentWizardStep === 1 && (
          <div className="space-y-8">
            <div className="max-w-5xl mx-auto">
              {/* Tab Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-1">Choose your creation method</h2>
                <p className="text-muted-foreground">Pick the option that works best for you</p>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "templates" | "ai" | "upload")} className="w-full">
                {/* Custom Tab Button Group */}
                <div className="grid grid-cols-3 gap-4 mb-8">
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

                <TabsContent value="templates" className="space-y-8 pt-2">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Professional Training Templates</h3>
                    <p className="text-muted-foreground mb-6">
                      Start with proven survey frameworks designed for trainers.
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {surveyTemplates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onPreview={() => setPreviewTemplate(template)}
                        onUse={() => {
                          handleUseTemplate(template);
                          if (currentQuestions.length === 0) {
                            // Will be set by handleUseTemplate
                            setTimeout(() => setCurrentWizardStep(2), 100);
                          }
                        }}
                      />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="ai" className="space-y-8 pt-2">
                  <div className="space-y-6 max-w-2xl mx-auto">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Generate with AI</h3>
                      <p className="text-muted-foreground mb-4">
                        Describe your survey needs and let AI create custom questions for you.
                      </p>
                    </div>
                    
                    {isProcessing ? (
                      <div className="bg-primary/5 border border-primary/20 rounded-lg p-8 text-center space-y-4">
                        <div className="flex justify-center">
                          <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        </div>
                        <div>
                          <p className="font-medium text-lg mb-1">AI is creating your survey...</p>
                          <p className="text-sm text-muted-foreground">
                            This may take 10-20 seconds. We're analyzing your description and crafting thoughtful questions.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Describe your survey
                          </label>
                          <Textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Example: I need a survey to gather feedback on our recent training workshop about leadership skills. Include questions about content quality, trainer effectiveness, and practical application."
                            className="min-h-[150px] text-base"
                            data-testid="input-survey-prompt"
                          />
                        </div>
                        <Button
                          size="lg"
                          onClick={() => {
                            handleGenerateFromPrompt();
                            // Wait for questions to be generated then move to next step
                            setTimeout(() => {
                              if (currentQuestions.length > 0) {
                                setCurrentWizardStep(2);
                              }
                            }, 1000);
                          }}
                          disabled={!prompt.trim() || isProcessing}
                          className="w-full"
                          data-testid="button-generate"
                        >
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Survey with AI
                        </Button>
                      </>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-8 pt-2">
                  <div className="max-w-2xl mx-auto space-y-8">
                    {/* File Upload Section */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Upload Document</h3>
                        <p className="text-muted-foreground mb-4">
                          Upload a PDF, DOCX, or TXT document and AI will extract survey questions from it.
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Choose a document
                        </label>
                        <FileUploadZone
                          onFileSelect={handleFileSelect}
                          isProcessing={isProcessing}
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
                          value={pastedText}
                          onChange={(e) => setPastedText(e.target.value)}
                          placeholder="Paste text content, training materials, course notes, or any document content..."
                          className="min-h-32 resize-none"
                          disabled={isProcessing}
                          data-testid="textarea-paste-text"
                        />
                      </div>
                      <Button
                        size="lg"
                        onClick={handlePasteText}
                        disabled={!pastedText.trim() || isProcessing}
                        className="w-full"
                        data-testid="button-process-text"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Process Text & Generate Survey
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}

        {/* Step 2: Questions - Build and refine */}
        {currentWizardStep === 2 && (
          <QuestionsStep
            questions={currentQuestions}
            messages={messages}
            isProcessing={isProcessing}
            onSendMessage={handleSendMessage}
            onUpdateQuestion={handleUpdateQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onAddQuestion={handleAddQuestion}
            onReorderQuestions={setCurrentQuestions}
            onPreview={handlePreviewSurvey}
          />
        )}

        {/* Step 3: Publish - Add metadata */}
        {currentWizardStep === 3 && (
          <PublishStep
            title={currentSurveyTitle}
            description={currentSurveyDescription}
            welcomeMessage={welcomeMessage}
            thankYouMessage={thankYouMessage}
            generatingField={generatingField}
            onTitleChange={setCurrentSurveyTitle}
            onDescriptionChange={setCurrentSurveyDescription}
            onWelcomeChange={setWelcomeMessage}
            onThankYouChange={setThankYouMessage}
            onGenerateText={handleGenerateText}
          />
        )}

        {/* Wizard Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <div>
            {currentWizardStep > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={handlePrevStep}
                data-testid="button-prev-step"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {currentQuestions.length > 0 && currentWizardStep > 1 && (
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handlePreviewSurvey}
                data-testid="button-preview"
              >
                Preview Survey
              </Button>
            )}

            {currentWizardStep < 3 ? (
              <Button 
                size="lg" 
                onClick={handleNextStep}
                disabled={currentWizardStep === 1 && currentQuestions.length === 0}
                data-testid="button-next-step"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                onClick={handleSaveSurvey}
                disabled={createSurveyMutation.isPending || updateSurveyMutation.isPending || !currentSurveyTitle.trim()}
                data-testid="button-save-survey"
              >
                {createSurveyMutation.isPending || updateSurveyMutation.isPending
                  ? "Saving..."
                  : "Save & Publish"}
              </Button>
            )}
          </div>
        </div>
      </main>

      <TemplatePreviewModal
        template={previewTemplate}
        open={previewTemplate !== null}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
        onUse={() => previewTemplate && handleUseTemplate(previewTemplate)}
      />

      <SurveyPreviewDialog
        questions={currentQuestions}
        title={currentSurveyTitle}
        open={showPreview}
        onOpenChange={setShowPreview}
      />
    </div>
  );
}
