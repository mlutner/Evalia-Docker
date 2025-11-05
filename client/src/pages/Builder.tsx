import { useState } from "react";
import Header from "@/components/Header";
import FileUploadZone from "@/components/FileUploadZone";
import ChatPanel from "@/components/ChatPanel";
import TemplateCard from "@/components/TemplateCard";
import TemplatePreviewModal from "@/components/TemplatePreviewModal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, MessageSquare, Layers } from "lucide-react";
import { surveyTemplates } from "@shared/templates";
import type { Message } from "@/components/ChatPanel";
import type { SurveyTemplate } from "@shared/templates";

export default function Builder() {
  const [activeTab, setActiveTab] = useState<"upload" | "prompt" | "templates">("templates");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [prompt, setPrompt] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<SurveyTemplate | null>(null);
  
  // TODO: remove mock functionality
  const [messages, setMessages] = useState<Message[]>([]);

  const handleFileSelect = (file: File) => {
    console.log("File selected:", file.name);
    setIsProcessing(true);
    
    // TODO: remove mock functionality - simulate processing
    setTimeout(() => {
      setParsedText("Sample parsed text from the uploaded document...");
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
      setMessages([
        {
          id: "1",
          role: "assistant",
          content: "I've created a survey based on your prompt. What would you like to adjust?",
        },
      ]);
      setIsProcessing(false);
    }, 2000);
  };

  const handleUseTemplate = (template: SurveyTemplate) => {
    console.log("Using template:", template.title);
    setPreviewTemplate(null);
    // TODO: remove mock functionality - simulate loading template
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: `I've loaded the "${template.title}" template with ${template.questionCount} questions. Feel free to customize it or ask me to make changes!`,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold mb-2">Create Survey</h1>
          <p className="text-muted-foreground">
            Upload a document or describe what you want to survey
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          <div>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "prompt" | "templates")}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="templates" data-testid="tab-templates">
                  <Layers className="w-4 h-4 mr-2" />
                  Templates
                </TabsTrigger>
                <TabsTrigger value="upload" data-testid="tab-upload">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload
                </TabsTrigger>
                <TabsTrigger value="prompt" data-testid="tab-prompt">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Describe
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

              <TabsContent value="upload" className="space-y-6">
                <FileUploadZone
                  onFileSelect={handleFileSelect}
                  isProcessing={isProcessing}
                />
                
                {parsedText && (
                  <div className="p-6 border rounded-xl bg-card">
                    <h3 className="font-semibold mb-3">Extracted Text</h3>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {parsedText}
                    </p>
                    <Button variant="outline" size="sm" className="mt-4" data-testid="button-view-full">
                      View Full Text
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="prompt" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      What would you like to survey?
                    </label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Example: I need a survey to gather feedback on our recent training workshop about leadership skills. Include questions about content quality, trainer effectiveness, and practical application."
                      className="min-h-[200px] text-base"
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
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:h-[calc(100vh-12rem)]">
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isProcessing}
            />
          </div>
        </div>

        {messages.length > 0 && (
          <div className="mt-8 flex justify-end gap-3">
            <Button variant="outline" size="lg" data-testid="button-preview">
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
    </div>
  );
}
