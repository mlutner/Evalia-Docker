import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import QuestionEditor from "@/components/QuestionEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, MessageSquare, FileQuestion, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type { Message } from "@/components/ChatPanel";
import type { Question } from "@shared/schema";

interface QuestionsStepProps {
  questions: Question[];
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (message: string) => void;
  onUpdateQuestion: (index: number, question: Question) => void;
  onDeleteQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onPreview?: () => void;
}

export default function QuestionsStep({
  questions,
  messages,
  isProcessing,
  onSendMessage,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onPreview,
}: QuestionsStepProps) {
  const [chatOpen, setChatOpen] = useState(true);

  return (
    <div className="space-y-6">
      {/* Header with Question Count and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-medium text-lg">{questions.length} {questions.length === 1 ? 'question' : 'questions'} created</p>
          <p className="text-sm text-muted-foreground">Edit your questions and refine with AI</p>
        </div>
        <div className="flex items-center gap-2">
          {onPreview && questions.length > 0 && (
            <Button
              variant="outline"
              onClick={onPreview}
              data-testid="button-preview-survey"
            >
              <Eye className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Preview Survey</span>
              <span className="sm:hidden">Preview</span>
            </Button>
          )}
          {/* Mobile: AI Chat Sheet */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="outline" data-testid="button-open-chat-mobile">
                <MessageSquare className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle>AI Assistant</SheetTitle>
                <SheetDescription>
                  Ask AI to refine your survey questions
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 h-[calc(100vh-12rem)]">
                <ChatPanel
                  messages={messages}
                  onSendMessage={onSendMessage}
                  isLoading={isProcessing}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Desktop: Toggle Chat Panel */}
          <Button
            variant="outline"
            onClick={() => setChatOpen(!chatOpen)}
            className="hidden lg:flex"
            data-testid="button-toggle-chat"
          >
            {chatOpen ? <ChevronRight className="w-4 h-4 mr-2" /> : <ChevronLeft className="w-4 h-4 mr-2" />}
            {chatOpen ? 'Hide' : 'Show'} AI Chat
          </Button>
        </div>
      </div>

      <div className={`grid gap-6 transition-all ${chatOpen ? 'lg:grid-cols-[1fr,380px]' : 'lg:grid-cols-1'}`}>
        {/* Questions Editor - Main Area */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <Card className="border-dashed" data-testid="card-no-questions">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileQuestion className="w-8 h-8 text-muted-foreground" />
                </div>
                <CardTitle>No questions yet</CardTitle>
                <CardDescription>
                  Start by adding your first question or use the AI Chat to generate questions automatically
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button
                  onClick={onAddQuestion}
                  data-testid="button-add-first-question"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Question
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {questions.map((question, index) => (
                <QuestionEditor
                  key={question.id}
                  question={question}
                  index={index}
                  onUpdate={(updated) => onUpdateQuestion(index, updated)}
                  onDelete={() => onDeleteQuestion(index)}
                />
              ))}
              
              <Button
                variant="outline"
                onClick={onAddQuestion}
                className="w-full"
                data-testid="button-add-question"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </>
          )}
        </div>

        {/* AI Chat Panel - Desktop Side Panel */}
        {chatOpen && (
          <div className="hidden lg:block">
            <div className="sticky top-20 h-[calc(100vh-8rem)]">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    AI Assistant
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Ask to add, modify, or remove questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ChatPanel
                    messages={messages}
                    onSendMessage={onSendMessage}
                    isLoading={isProcessing}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
