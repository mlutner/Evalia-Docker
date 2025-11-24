import { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Save, Loader2 } from "lucide-react";
import WizardSteps from "@/components/WizardSteps";
import SurveyStartFlow from "@/components/builder/SurveyStartFlow";
import QuestionsStep from "@/components/builder/QuestionsStep";
import PublishStep from "@/components/builder/PublishStep";
import ScoringConfigStep from "@/components/builder/ScoringConfigStep";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import SurveyPreviewDialog from "@/components/SurveyPreviewDialog";
import SurveyOutlinePreview from "@/components/SurveyOutlinePreview";
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
  { number: 1, title: "Choose Type", description: "Select survey or assessment", detailedDescription: "Decide whether you're collecting feedback or measuring performance" },
  { number: 2, title: "Choose Method", description: "Select how you want to build", detailedDescription: "Pick templates, AI generation, or import content" },
  { number: 3, title: "Refine & Customize", description: "Edit questions and add logic", detailedDescription: "Refine questions, set up skip logic, improve with AI suggestions" },
  { number: 4, title: "Launch Survey", description: "Set up messaging and publish", detailedDescription: "Configure scoring, customize messaging, launch your survey" },
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
  const [previewMode, setPreviewMode] = useState<"online" | "test">("online");
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
      surveyState.setSurveyType((existingSurvey as any).type || "survey");
      surveyState.setCurrentSurveyTitle(existingSurvey.title);
      surveyState.setCurrentSurveyDescription(existingSurvey.description || "");
      surveyState.setWelcomeMessage(existingSurvey.welcomeMessage || "");
      surveyState.setThankYouMessage(existingSurvey.thankYouMessage || "");
      surveyState.setIllustrationUrl(existingSurvey.illustrationUrl || "");
      surveyState.setCurrentQuestions(existingSurvey.questions);
      surveyState.setEstimatedMinutes(existingSurvey.estimatedMinutes ?? undefined);
      surveyState.setPrivacyStatement(existingSurvey.privacyStatement || "");
      surveyState.setDataUsageStatement(existingSurvey.dataUsageStatement || "");
      // Only set wizard step to 2 if we're at step 1, otherwise preserve current step
      if (surveyState.currentWizardStep === 1) {
        surveyState.setCurrentWizardStep(2);
      }
      aiChat.setMessages([
        {
          id: "1",
          role: "assistant",
          content: `You're editing "${existingSurvey.title}" with ${existingSurvey.questions.length} questions. Make any changes you'd like, then proceed to publish!`,
        },
      ]);
      surveyState.setHasLoadedSurvey(true);
    }
  }, [existingSurvey, isEditMode, surveyState.hasLoadedSurvey, surveyState.currentWizardStep]);

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
    if (template.welcomeMessage) {
      surveyState.setWelcomeMessage(template.welcomeMessage);
    }
    if (template.thankYouMessage) {
      surveyState.setThankYouMessage(template.thankYouMessage);
    }
    surveyState.setCurrentWizardStep(3);
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
    setPreviewMode("online");
    setShowPreview(true);
  };

  const handleTestPreviewSurvey = () => {
    setPreviewMode("test");
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
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="text-muted-foreground">Loading survey...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Back to Dashboard Button */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard")}
            className="mb-2 sm:mb-3 md:mb-4 text-muted-foreground hover:text-foreground text-xs sm:text-sm"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-3 sm:w-4 h-3 sm:h-4 mr-1.5 sm:mr-2" />
            Back to Dashboard
          </Button>
        </div>

        <div className="mb-6 sm:mb-8 md:mb-12 pb-4 sm:pb-6 md:pb-8 border-b border-border/30">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 md:gap-8 mb-4 sm:mb-6 md:mb-8">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-1 sm:mb-2 line-clamp-2">
                {isEditMode ? "Edit Questionnaire Type" : "Build Questionnaire Type"}
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground line-clamp-2">
                {surveyState.currentWizardStep === 1 && "Step 1 of 4: Choose survey or assessment"}
                {surveyState.currentWizardStep === 2 && "Step 2 of 4: Choose how you'd like to create your survey"}
                {surveyState.currentWizardStep === 3 && "Step 3 of 4: Build and refine your survey questions"}
                {surveyState.currentWizardStep === 4 && "Step 4 of 4: Add details and publish your survey"}
              </p>
            </div>
            {surveyState.lastAutoSave && (
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                <Save className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{surveyState.isAutoSaving ? "Saving..." : `Saved ${formatTimeAgo(surveyState.lastAutoSave)}`}</span>
              </div>
            )}
          </div>
          
          <WizardSteps
            steps={WIZARD_STEPS}
            currentStep={surveyState.currentWizardStep}
          />
        </div>

        {/* Step 1 & 2: Start - Choose type and creation method */}
        {(surveyState.currentWizardStep === 1 || surveyState.currentWizardStep === 2) && (
          <SurveyStartFlow
            surveyType={surveyState.surveyType}
            onSurveyTypeChange={surveyState.setSurveyType}
            onTypeSelected={() => surveyState.setCurrentWizardStep(2)}
            currentQuestions={surveyState.currentQuestions}
            currentSurveyTitle={surveyState.currentSurveyTitle}
            onSurveyTitleChange={surveyState.setCurrentSurveyTitle}
            onUseTemplate={(template: SurveyTemplate) => {
              handleUseTemplate(template);
              setTimeout(() => surveyState.setCurrentWizardStep(3), 100);
            }}
            onFileSelect={handleFileSelect}
            onGenerateFromPrompt={(prompt: string, includeScoringToggle: boolean, selectedFile?: any) => {
              handleGenerateFromPrompt(prompt, includeScoringToggle, selectedFile);
            }}
            onPasteText={handlePasteText}
            isProcessing={fileProcessing.isProcessing}
          />
        )}

        {/* Step 3: Questions - Build and refine */}
        {surveyState.currentWizardStep === 3 && (
          <QuestionsStep
            questions={surveyState.currentQuestions}
            title={surveyState.currentSurveyTitle}
            description={surveyState.currentSurveyDescription}
            welcomeMessage={surveyState.welcomeMessage}
            messages={aiChat.messages}
            isProcessing={aiChat.isProcessing}
            onSendMessage={handleSendMessage}
            onUpdateQuestion={surveyState.handleUpdateQuestion}
            onDeleteQuestion={surveyState.handleDeleteQuestion}
            onAddQuestion={surveyState.handleAddQuestion}
            onReorderQuestions={surveyState.setCurrentQuestions}
            onTitleChange={surveyState.setCurrentSurveyTitle}
            onUpdateQuestions={surveyState.setCurrentQuestions}
            onNext={surveyState.handleNextStep}
          />
        )}

        {/* Step 4: Customize - Add metadata and optional scoring */}
        {surveyState.currentWizardStep === 4 && (
          <PublishStep
            title={surveyState.currentSurveyTitle}
            description={surveyState.currentSurveyDescription}
            welcomeMessage={surveyState.welcomeMessage}
            thankYouMessage={surveyState.thankYouMessage}
            illustrationUrl={surveyState.illustrationUrl}
            generatingField={aiChat.generatingField}
            questions={surveyState.currentQuestions}
            scoreConfig={surveyState.scoreConfig}
            estimatedMinutes={surveyState.estimatedMinutes}
            privacyStatement={surveyState.privacyStatement}
            dataUsageStatement={surveyState.dataUsageStatement}
            onTitleChange={surveyState.setCurrentSurveyTitle}
            onDescriptionChange={surveyState.setCurrentSurveyDescription}
            onWelcomeChange={surveyState.setWelcomeMessage}
            onThankYouChange={surveyState.setThankYouMessage}
            onIllustrationChange={surveyState.setIllustrationUrl}
            onGenerateText={handleGenerateText}
            onScoreConfigChange={surveyState.setScoreConfig}
            onEstimatedMinutesChange={surveyState.setEstimatedMinutes}
            onPrivacyStatementChange={surveyState.setPrivacyStatement}
            onDataUsageStatementChange={surveyState.setDataUsageStatement}
            onQuestionsChange={surveyState.setCurrentQuestions}
            onPreview={handlePreviewSurvey}
            onTestPreview={handleTestPreviewSurvey}
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
            {surveyState.currentWizardStep < 4 ? (
              <Button 
                size="lg" 
                onClick={surveyState.handleNextStep}
                disabled={
                  (surveyState.currentWizardStep === 1 && (!surveyState.currentSurveyTitle.trim() || surveyState.currentQuestions.length === 0)) ||
                  (surveyState.currentWizardStep === 3 && !surveyState.currentSurveyTitle.trim())
                }
                data-testid="button-next-step"
                style={{ backgroundColor: '#2F8FA5', color: '#FFFFFF' }}
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
                style={{ backgroundColor: '#2F8FA5', color: '#FFFFFF' }}
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

      {previewMode === "online" ? (
        <SurveyPreviewDialog
          questions={surveyState.currentQuestions}
          title={surveyState.currentSurveyTitle}
          description={surveyState.currentSurveyDescription}
          welcomeMessage={surveyState.welcomeMessage}
          illustration={existingSurvey?.illustrationUrl || "/attached_assets/1_1763757398561.png"}
          estimatedMinutes={surveyState.estimatedMinutes}
          privacyStatement={surveyState.privacyStatement}
          dataUsageStatement={surveyState.dataUsageStatement}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      ) : (
        <SurveyOutlinePreview
          questions={surveyState.currentQuestions}
          title={surveyState.currentSurveyTitle}
          description={surveyState.currentSurveyDescription}
          estimatedMinutes={surveyState.estimatedMinutes}
          open={showPreview}
          onOpenChange={setShowPreview}
        />
      )}
    </div>
  );
}
