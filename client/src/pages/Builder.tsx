import { useState } from "react";
import Header from "@/components/Header";
import FileUploadZone from "@/components/FileUploadZone";
import ChatPanel from "@/components/ChatPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, FileText, MessageSquare } from "lucide-react";
import type { Message } from "@/components/ChatPanel";

export default function Builder() {
  const [activeTab, setActiveTab] = useState<"upload" | "prompt">("upload");
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedText, setParsedText] = useState("");
  const [prompt, setPrompt] = useState("");
  
  // TODO: remove mock functionality
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "I've analyzed your document and created a survey with 10 questions. What would you like to refine?",
    },
  ]);

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
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "upload" | "prompt")}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="upload" data-testid="tab-upload">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Document
                </TabsTrigger>
                <TabsTrigger value="prompt" data-testid="tab-prompt">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Describe Survey
                </TabsTrigger>
              </TabsList>

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

        {messages.length > 1 && (
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
    </div>
  );
}
