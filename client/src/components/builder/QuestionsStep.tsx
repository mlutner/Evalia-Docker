import { useState, useCallback } from "react";
import React from "react";
import ChatPanel from "@/components/ChatPanel";
import QuestionEditor from "@/components/QuestionEditor";
import FloatingAIChat from "@/components/FloatingAIChat";
import { ToneAdjuster } from "@/components/ToneAdjuster";
import { QuestionConfigPanelLite } from "@/components/builder/QuestionConfigPanelLite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Plus, Bot, FileQuestion, ChevronLeft, ChevronRight, Eye, Settings, PanelRight } from "lucide-react";
import { theme } from "@/theme";
import type { Message } from "@/components/ChatPanel";
import type { Question } from "@shared/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface QuestionsStepProps {
  questions: Question[];
  title: string;
  messages: Message[];
  isProcessing: boolean;
  onSendMessage: (message: string) => void;
  onUpdateQuestion: (index: number, question: Question) => void;
  onDeleteQuestion: (index: number) => void;
  onAddQuestion: () => void;
  onReorderQuestions: (questions: Question[]) => void;
  onTitleChange: (title: string) => void;
  onUpdateQuestions: (questions: Question[]) => void;
  onNext?: () => void;
}

export default function QuestionsStep({
  questions,
  title,
  messages,
  isProcessing,
  onSendMessage,
  onUpdateQuestion,
  onDeleteQuestion,
  onAddQuestion,
  onReorderQuestions,
  onTitleChange,
  onUpdateQuestions,
  onNext,
}: QuestionsStepProps) {
  const [chatOpen, setChatOpen] = useState(false); // Chat starts collapsed, config panel is primary
  const [configPanelOpen, setConfigPanelOpen] = useState(true);
  const [chatExpanded, setChatExpanded] = useState(false);
  const [isMobileChat, setIsMobileChat] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Get the currently selected question
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId) || null;
  const selectedQuestionIndex = selectedQuestion ? questions.findIndex(q => q.id === selectedQuestionId) : -1;

  // Handle question selection
  const handleSelectQuestion = useCallback((questionId: string) => {
    setSelectedQuestionId(questionId);
    // Ensure config panel is open when selecting a question
    setConfigPanelOpen(true);
  }, []);

  // Handle updating selected question from config panel
  const handleUpdateSelectedQuestion = useCallback((updates: Partial<Question>) => {
    if (selectedQuestionIndex >= 0 && selectedQuestion) {
      onUpdateQuestion(selectedQuestionIndex, { ...selectedQuestion, ...updates });
    }
  }, [selectedQuestionIndex, selectedQuestion, onUpdateQuestion]);

  // AI enhance question handler
  const handleEnhanceQuestion = useCallback(async () => {
    if (!selectedQuestion) return;
    setIsEnhancing(true);
    try {
      await onSendMessage(`Please enhance and improve this question: "${selectedQuestion.question}"`);
    } finally {
      setIsEnhancing(false);
    }
  }, [selectedQuestion, onSendMessage]);

  // Generate follow-up question handler
  const handleGenerateFollowUp = useCallback(async () => {
    if (!selectedQuestion) return;
    await onSendMessage(`Generate a follow-up question for: "${selectedQuestion.question}"`);
  }, [selectedQuestion, onSendMessage]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      
      const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
      onReorderQuestions(reorderedQuestions);
    }
  };

  // Keyboard shortcut for adding questions (Cmd+N or Ctrl+N)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        onAddQuestion();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onAddQuestion]);

  return (
    <div className="space-y-6 relative">
      {/* Floating AI Chat Widget - Mobile Only */}
      <FloatingAIChat onClick={() => setIsMobileChat(true)} isOpen={isMobileChat} />
      {/* Title Input */}
      <Card>
        <CardContent className="pt-6">
          <label className="text-xs sm:text-sm font-semibold mb-2 block text-foreground">
            Questionnaire Type Title <span className="text-destructive">*</span>
          </label>
          <Input
            value={title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onTitleChange(e.target.value)}
            placeholder="Enter a title for your questionnaire type..."
            className="text-sm md:text-base"
            data-testid="input-survey-title-step3"
          />
          <p className="text-xs text-muted-foreground mt-2">This will be the name respondents see when they start</p>
        </CardContent>
      </Card>

      {/* Header with Question Count and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-medium text-lg" style={{ color: theme.colors.textPrimary }}>{questions.length} {questions.length === 1 ? 'question' : 'questions'} created</p>
          <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Click a question to configure • Edit with AI</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {/* Mobile: AI Chat Button */}
          <Sheet open={isMobileChat} onOpenChange={setIsMobileChat}>
            <SheetTrigger asChild>
              <Button data-testid="button-open-chat-mobile" className="md:hidden flex-1 sm:flex-none" style={{ backgroundColor: theme.colors.lime, color: theme.colors.textPrimary }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#92c84b"} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.colors.lime}>
                <Bot className="w-4 h-4 mr-2" />
                AI Chat
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
              <SheetHeader>
                <SheetTitle>AI Assistant</SheetTitle>
                <SheetDescription>
                  Ask AI to refine your survey questions
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 flex-1 min-h-0">
                <ChatPanel
                  messages={messages}
                  onSendMessage={onSendMessage}
                  isLoading={isProcessing}
                />
              </div>
            </SheetContent>
          </Sheet>

          {onNext && (
            <Button
              onClick={onNext}
              data-testid="button-next-step-top"
              className="flex-1 sm:flex-none"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Desktop: Toggle Config Panel */}
          <Button
            variant="outline"
            onClick={() => setConfigPanelOpen(!configPanelOpen)}
            className="hidden md:flex"
            data-testid="button-toggle-config"
          >
            <PanelRight className="w-4 h-4 mr-2" />
            {configPanelOpen ? 'Hide' : 'Show'} Config
          </Button>

          {/* Desktop: Toggle Chat Panel */}
          <Button
            variant="outline"
            onClick={() => setChatOpen(!chatOpen)}
            className="hidden md:flex"
            data-testid="button-toggle-chat"
          >
            <Bot className="w-4 h-4 mr-2" />
            {chatOpen ? 'Hide' : 'Show'} Chat
          </Button>
        </div>
      </div>

      {/* Main Content Area with Config Panel */}
      <div className="flex gap-6">
        {/* Questions Editor - Main Area */}
        <div className={`flex-1 space-y-4 p-4 rounded-lg transition-all duration-300 ${
          configPanelOpen ? 'md:mr-0' : ''
        }`} style={{ backgroundColor: theme.colors.bg }}>
          <div className="text-xs font-medium text-muted-foreground" style={{ color: theme.colors.textSecondary }}>
            💡 Tip: Click a question to configure it • Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold">Cmd+N</kbd> (Mac) or <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-semibold">Ctrl+N</kbd> (Windows) to add new
          </div>
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
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={questions.map(q => q.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {questions.map((question, index) => (
                    <div
                      key={question.id}
                      onClick={() => handleSelectQuestion(question.id)}
                      className={`cursor-pointer transition-all duration-200 rounded-lg ${
                        selectedQuestionId === question.id 
                          ? 'ring-2 ring-purple-500 ring-offset-2' 
                          : 'hover:ring-1 hover:ring-gray-300'
                      }`}
                    >
                      <QuestionEditor
                        question={question}
                        index={index}
                        onUpdate={(updated) => onUpdateQuestion(index, updated)}
                        onDelete={() => onDeleteQuestion(index)}
                      />
                    </div>
                  ))}
                </SortableContext>
              </DndContext>
              
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

        {/* Configuration Panel - Desktop Right Side */}
        <div className="hidden md:flex flex-col sticky top-20 h-[calc(100vh-10rem)]">
          <QuestionConfigPanelLite
            question={selectedQuestion}
            questions={questions}
            surveyTitle={title}
            onUpdateQuestion={handleUpdateSelectedQuestion}
            onEnhanceQuestion={handleEnhanceQuestion}
            onGenerateFollowUp={handleGenerateFollowUp}
            isOpen={configPanelOpen}
            onToggle={() => setConfigPanelOpen(!configPanelOpen)}
            isEnhancing={isEnhancing}
          />
        </div>
      </div>

      {/* AI Tools Panel - Collapsible Chat */}
      {chatOpen && (
        <div className="hidden md:block mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Tone Adjuster */}
            <ToneAdjuster 
              questions={questions} 
              onApplyTone={onUpdateQuestions}
              disabled={questions.length === 0}
            />
            
            {/* AI Chat */}
            <Card className="flex flex-col max-h-[400px]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Assistant
                </CardTitle>
                <CardDescription className="text-xs">
                  Ask AI to refine your questions
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto p-0">
                <ChatPanel
                  messages={messages}
                  onSendMessage={onSendMessage}
                  isLoading={isProcessing}
                  showHeader={false}
                  isExpanded={chatExpanded}
                  onToggleExpand={() => setChatExpanded(!chatExpanded)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
