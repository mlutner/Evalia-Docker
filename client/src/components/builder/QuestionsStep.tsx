import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import QuestionEditor from "@/components/QuestionEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Plus, MessageSquare, FileQuestion } from "lucide-react";
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
}

export default function QuestionsStep({
  questions,
  messages,
  isProcessing,
  onSendMessage,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
}: QuestionsStepProps) {
  const [viewMode, setViewMode] = useState<"chat" | "edit">("chat");

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex items-center rounded-lg bg-muted p-1">
          <button
            onClick={() => setViewMode("chat")}
            className={`inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-all ${
              viewMode === "chat"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="button-chat-mode"
          >
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </button>
          <button
            onClick={() => setViewMode("edit")}
            className={`inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-sm font-medium transition-all ${
              viewMode === "edit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid="button-edit-mode"
          >
            <Edit3 className="w-4 h-4" />
            Edit Questions
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        <div>
          {viewMode === "chat" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 border rounded-lg bg-card">
                <div>
                  <p className="font-medium text-lg">{questions.length} questions created</p>
                  <p className="text-sm text-muted-foreground">Use AI to refine your survey</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.length === 0 ? (
                <Card className="border-dashed" data-testid="card-no-questions">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <FileQuestion className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <CardTitle>No questions yet</CardTitle>
                    <CardDescription>
                      Start by adding your first question or switch to AI Chat mode to generate questions automatically
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
          )}
        </div>

        {viewMode === "chat" && (
          <div className="lg:h-[calc(100vh-16rem)]">
            <ChatPanel
              messages={messages}
              onSendMessage={onSendMessage}
              isLoading={isProcessing}
            />
          </div>
        )}
      </div>
    </div>
  );
}
