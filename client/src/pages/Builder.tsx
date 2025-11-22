import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import WizardSteps from "@/components/WizardSteps";
import Step1Start from "@/components/builder/Step1Start";
import QuestionsStep from "@/components/builder/QuestionsStep";
import PublishStep from "@/components/builder/PublishStep";
import ScoringConfigStep from "@/components/builder/ScoringConfigStep";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import SurveyPreviewDialog from "@/components/SurveyPreviewDialog";
import { Button } from "@/components/ui/button";
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
  const [viewMode, setViewMode] = useState<"chat" | "edit">("chat");
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(null);

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

  const handleGenerateFromPrompt = async (prompt: string, includeScoringToggle: boolean, selectedFile?: { name: string; type: string; base64: string }) => {
    if (!prompt.trim() && !selectedFile) return;
    fileProcessing.handleGenerateFromPrompt(
      prompt,
      (result, questionCount) => {
        surveyState.setCurrentSurveyTitle(result.title);
        surveyState.setCurrentQuestions(result.questions);
        // Only load scoring config if toggle is enabled
        if (includeScoringToggle && result.scoreConfig) {
          surveyState.setScoreConfig(result.scoreConfig);
          toast({
            title: "Scoring suggestion created",
            description: "AI has suggested a scoring configuration. Customize it in Step 4.",
          });
        }
        aiChat.setMessages([
          {
            id: "1",
            role: "assistant",
            content: `I've created a ${questionCount}-question survey. You can edit the questions, preview, or ask me to make changes!`,
          },
        ]);
      },
      () => {
        surveyState.setCurrentWizardStep(2);
      },
      selectedFile
    );
  };

  const handlePasteText = async (pastedText: string) => {
    fileProcessing.handlePasteText(
      pastedText,
      (result, questionCount) => {
        surveyState.setCurrentSurveyTitle(result.title);
        surveyState.setCurrentQuestions(result.questions);
        if (result.scoreConfig) {
          surveyState.setScoreConfig(result.scoreConfig);
        }
        aiChat.setMessages([
          {
            id: "1",
            role: "assistant",
            content: `I've created a ${questionCount}-question survey from your text. ${result.scoreConfig ? 'I suggested a scoring configuration for Step 4. ' : ''}You can edit questions or ask me to make changes!`,
          },
        ]);
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
    surveyState.setCurrentSurveyTitle(template.title);
    surveyState.setCurrentQuestions(template.questions);
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
    const generatedText = await aiChat.handleGenerateText(fieldType, surveyState.currentSurveyTitle, surveyState.currentQuestions);

    if (!generatedText) return;

    const setters = {
      description: surveyState.setCurrentSurveyDescription,
      welcomeMessage: surveyState.setWelcomeMessage,
      thankYouMessage: surveyState.setThankYouMessage,
    };
    setters[fieldType](generatedText);
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
          <Step1Start
            currentQuestions={surveyState.currentQuestions}
            currentSurveyTitle={surveyState.currentSurveyTitle}
            onSurveyTitleChange={surveyState.setCurrentSurveyTitle}
            onUseTemplate={(template) => {
              handleUseTemplate(template);
              if (surveyState.currentQuestions.length === 0) {
                setTimeout(() => surveyState.setCurrentWizardStep(2), 100);
              }
            }}
            onFileSelect={handleFileSelect}
            onGenerateFromPrompt={(prompt, includeScoringToggle, selectedFile) => {
              handleGenerateFromPrompt(prompt, includeScoringToggle, selectedFile);
            }}
            onPasteText={handlePasteText}
            isProcessing={fileProcessing.isProcessing}
          />
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
