import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import QuestionEditor from "@/components/QuestionEditor";
import { Button } from "@/components/ui/button";
import { Edit3, Plus } from "lucide-react";
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
    <div className="grid lg:grid-cols-[1fr,400px] gap-6">
      <div>
        {viewMode === "chat" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-6 border rounded-lg bg-card">
              <div>
                <p className="font-medium text-lg">{questions.length} questions created</p>
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
            </div>
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
  );
}
