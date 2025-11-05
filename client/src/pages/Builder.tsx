import { useState } from "react";
import Header from "@/components/Header";
import FileUploadZone from "@/components/FileUploadZone";
import ChatPanel from "@/components/ChatPanel";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import SurveyPreviewDialog from "@/components/SurveyPreviewDialog";
import QuestionEditor from "@/components/QuestionEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, MessageSquare, Layers, Upload, Plus, Edit3 } from "lucide-react";
import { surveyTemplates } from "@shared/templates";
import type { Message } from "@/components/ChatPanel";
import type { SurveyTemplate } from "@shared/templates";
import type { Question } from "@/components/QuestionCard";

export default function Builder() {
  const [activeTab, setActiveTab] = useState<"templates" | "create">("templates");
  const [viewMode, setViewMode] = useState<"chat" | "edit">("chat");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentSurveyTitle, setCurrentSurveyTitle] = useState("");
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>([]);
  
  // TODO: remove mock functionality
  const [messages, setMessages] = useState<Message[]>([]);

  const handleFileSelect = (file: File) => {
    console.log("File selected:", file.name);
    setIsProcessing(true);
    
    // TODO: remove mock functionality - simulate processing
    setTimeout(() => {
      setParsedText("Sample parsed text from the uploaded document...");
      
      // TODO: remove mock functionality - generate sample questions from document
      const generatedQuestions: Question[] = [
        {
          id: "q1",
          type: "text",
          question: "What is your role in the organization?",
          required: true,
        },
        {
          id: "q2",
          type: "multiple_choice",
          question: "How would you rate your overall experience?",
          options: ["Poor", "Fair", "Good", "Very Good", "Excellent"],
          required: true,
        },
        {
          id: "q3",
          type: "textarea",
          question: "What suggestions do you have for improvement?",
          required: false,
        },
      ];
      
      setCurrentSurveyTitle(`Survey from ${file.name}`);
      setCurrentQuestions(generatedQuestions);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `I've analyzed your document and created ${generatedQuestions.length} questions. You can preview the survey or ask me to make changes!`,
        },
      ]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleSendMessage = (message: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
    };
    setMessages([...messages, newMessage]);
    
    // TODO: remove mock functionality - simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I've updated the survey based on your request. Would you like any other changes?",
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleGenerateFromPrompt = () => {
    if (!prompt.trim()) return;
    console.log("Generating survey from prompt:", prompt);
    setIsProcessing(true);
    
    // TODO: remove mock functionality - simulate generation
    setTimeout(() => {
      // TODO: remove mock functionality - generate sample questions from prompt
      const generatedQuestions: Question[] = [
        {
          id: "q1",
          type: "text",
          question: "What is your name?",
          required: true,
        },
        {
          id: "q2",
          type: "email",
          question: "What is your email address?",
          required: true,
        },
        {
          id: "q3",
          type: "multiple_choice",
          question: "How satisfied are you overall?",
          options: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
          required: true,
        },
        {
          id: "q4",
          type: "textarea",
          question: "Please share any additional feedback or suggestions.",
          required: false,
        },
      ];
      
      setCurrentSurveyTitle("Custom Survey");
      setCurrentQuestions(generatedQuestions);
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: `I've created a ${generatedQuestions.length}-question survey based on your description. Preview it or ask me to make changes!`,
        },
      ]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleUseTemplate = (template: SurveyTemplate) => {
    console.log("Using template:", template.title);
    setPreviewTemplate(null);
    setCurrentSurveyTitle(template.title);
    setCurrentQuestions(template.questions);
    setActiveTab("create");
    setViewMode("chat");
    // TODO: remove mock functionality - simulate loading template
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-semibold mb-2">Create Survey</h1>
              <p className="text-muted-foreground">
                {currentQuestions.length > 0
                  ? `Editing: ${currentSurveyTitle}`
                  : "Start with a template or create from scratch"}
              </p>
            </div>
            {currentQuestions.length > 0 && (
              <div className="flex items-center gap-2">
                <Input
                  value={currentSurveyTitle}
                  onChange={(e) => setCurrentSurveyTitle(e.target.value)}
                  className="w-64"
                  placeholder="Survey title..."
                  data-testid="input-survey-title"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          <div>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "templates" | "create")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="templates" data-testid="tab-templates">
                  <Layers className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="create" data-testid="tab-create">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create with AI
                </TabsTrigger>
              </TabsList>

              <TabsContent value="templates" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Professional Training Templates</h3>
                  <p className="text-muted-foreground mb-6">
                    Start with proven survey frameworks designed for trainers at different stages of the learning journey.
                  </p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {surveyTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onPreview={() => setPreviewTemplate(template)}
                      onUse={() => handleUseTemplate(template)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="create" className="space-y-6">
                {currentQuestions.length === 0 ? (
                  <>
                    <div className="space-y-4">
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
                        onClick={handleGenerateFromPrompt}
                        disabled={!prompt.trim() || isProcessing}
                        className="w-full"
                        data-testid="button-generate"
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Survey with AI
                      </Button>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Upload a document
                      </label>
                      <FileUploadZone
                        onFileSelect={handleFileSelect}
                        isProcessing={isProcessing}
                      />
                    </div>
                  </>
                ) : viewMode === "chat" ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div>
                        <p className="font-medium">{currentQuestions.length} questions created</p>
                        <p className="text-sm text-muted-foreground">Use AI to refine or edit directly</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => setViewMode("edit")}
                        data-testid="button-edit-questions"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Questions
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Edit Questions</h3>
                      <Button
                        variant="outline"
                        onClick={() => setViewMode("chat")}
                        data-testid="button-back-to-chat"
                      >
                        Back to AI Chat
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {currentQuestions.map((question, index) => (
                        <QuestionEditor
                          key={question.id}
                          question={question}
                          index={index}
                          onUpdate={(updated) => handleUpdateQuestion(index, updated)}
                          onDelete={() => handleDeleteQuestion(index)}
                        />
                      ))}
                      
                      <Button
                        variant="outline"
                        onClick={handleAddQuestion}
                        className="w-full"
                        data-testid="button-add-question"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Question
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {viewMode === "chat" && (
            <div className="lg:h-[calc(100vh-12rem)]">
              <ChatPanel
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isProcessing}
              />
            </div>
          )}
        </div>

        {currentQuestions.length > 0 && (
          <div className="mt-8 flex justify-end gap-3">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handlePreviewSurvey}
              data-testid="button-preview"
            >
              Preview Survey
            </Button>
            <Button size="lg" data-testid="button-save">
              Save Survey
            </Button>
          </div>
        )}
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
