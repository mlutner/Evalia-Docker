import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, ChevronUp,
  Wand2, RefreshCw, Plus, Settings, Star, GitBranch, Palette,
  X, Sparkles
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { Question } from '@shared/schema';

// ============================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleSection({ title, icon, defaultOpen = false, children }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-purple-500">{icon}</span>
          <span className="text-sm font-semibold text-gray-900">{title}</span>
        </div>
        {isOpen ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================
// TAB COMPONENT
// ============================================
interface TabsProps {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  return (
    <div className="flex border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-colors relative ${
            activeTab === tab.id
              ? 'text-purple-600 bg-purple-50/30'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          {tab.icon}
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-500" />
          )}
        </button>
      ))}
    </div>
  );
}

// ============================================
// AI ACTION BUTTON
// ============================================
function ActionButton({ 
  icon, 
  label, 
  onClick, 
  loading 
}: { 
  icon: React.ReactNode; 
  label: string;
  onClick?: () => void;
  loading?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-700 border border-gray-200 
                 rounded-lg hover:bg-purple-50/30 hover:border-purple-200 transition-all bg-white text-left 
                 group disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <span className="text-purple-500 group-hover:text-purple-600 transition-colors">{icon}</span>
      <span className="group-hover:text-purple-600 transition-colors">
        {loading ? 'Processing...' : label}
      </span>
    </button>
  );
}

// ============================================
// SETTINGS TAB CONTENT
// ============================================
function SettingsTab({ 
  question, 
  onUpdate 
}: { 
  question: Question; 
  onUpdate: (updates: Partial<Question>) => void;
}) {
  const needsOptions = ["multiple_choice", "checkbox", "dropdown", "ranking", "constant_sum"].includes(question.type);
  
  return (
    <div className="p-4 space-y-4">
      {/* Question Text */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Question Text</Label>
        <Textarea
          value={question.question}
          onChange={(e) => onUpdate({ question: e.target.value })}
          placeholder="Enter your question..."
          className="resize-none min-h-[80px] text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Description (optional)</Label>
        <Textarea
          value={question.description || ''}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Add helpful context..."
          className="resize-none min-h-[60px] text-sm"
        />
      </div>

      {/* Required Toggle */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="required"
          checked={question.required}
          onCheckedChange={(checked) => onUpdate({ required: !!checked })}
        />
        <Label htmlFor="required" className="text-sm text-gray-700 cursor-pointer">
          Required
        </Label>
      </div>

      {/* Options for choice questions */}
      {needsOptions && question.options && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-700">Options</Label>
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options!];
                    newOptions[idx] = e.target.value;
                    onUpdate({ options: newOptions });
                  }}
                  className="text-sm h-8 flex-1"
                  placeholder={`Option ${idx + 1}`}
                />
                <button
                  onClick={() => {
                    const newOptions = question.options!.filter((_, i) => i !== idx);
                    onUpdate({ options: newOptions });
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  disabled={question.options!.length <= 1}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                onUpdate({ options: newOptions });
              }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <Plus size={14} /> Add Option
            </button>
          </div>
        </div>
      )}

      {/* Scoring Category */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Scoring Category (optional)</Label>
        <Input
          value={question.scoringCategory || ''}
          onChange={(e) => onUpdate({ scoringCategory: e.target.value || undefined })}
          placeholder="e.g., Knowledge, Skills"
          className="text-sm h-9"
        />
        <p className="text-xs text-gray-500">Group questions into scoring categories for assessments</p>
      </div>
    </div>
  );
}

// ============================================
// SCORING TAB CONTENT
// ============================================
function ScoringTab({ 
  question, 
  onUpdate,
  surveyTitle
}: { 
  question: Question; 
  onUpdate: (updates: Partial<Question>) => void;
  surveyTitle: string;
}) {
  const { toast } = useToast();
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  
  const suggestScoringMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/chat', {
        message: `Suggest optimal scoring for this question: "${question.question}" with options: ${question.options?.join(', ')}. Provide point values for each option.`,
        surveyContext: { title: surveyTitle },
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'AI Scoring Suggestion', description: data.response || 'See the suggestion' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to get suggestion', variant: 'destructive' });
    },
  });
  
  return (
    <div className="p-4 space-y-4">
      {/* AI Suggest Scoring Button */}
      <button
        onClick={() => suggestScoringMutation.mutate()}
        disabled={suggestScoringMutation.isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold
                   text-purple-600 bg-purple-50 border-2 border-purple-200 rounded-lg
                   hover:bg-purple-100 hover:border-purple-300 transition-all group
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
        <span>{suggestScoringMutation.isPending ? 'Analyzing...' : 'AI Suggest Scoring'}</span>
      </button>

      {/* Score Weight */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Score Weight</Label>
        <Input
          type="number"
          min="0"
          value={question.scoreWeight || 1}
          onChange={(e) => onUpdate({ scoreWeight: parseInt(e.target.value) || 1 })}
          className="text-sm h-9"
        />
        <p className="text-xs text-gray-500">Multiplier for this question's score contribution</p>
      </div>

      {/* Correct Answer (for multiple choice) */}
      {question.options && question.options.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-700">Correct Answer</Label>
          <Select
            value={correctAnswer}
            onValueChange={setCorrectAnswer}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select correct answer..." />
            </SelectTrigger>
            <SelectContent>
              {question.options.map((option, idx) => (
                <SelectItem key={idx} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500">Select which answer is correct for scoring</p>
        </div>
      )}

      {/* Scoring Category */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Scoring Category</Label>
        <Select
          value={question.scoringCategory || ''}
          onValueChange={(value) => onUpdate({ scoringCategory: value || undefined })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="No category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No category</SelectItem>
            <SelectItem value="knowledge">Knowledge</SelectItem>
            <SelectItem value="skills">Skills</SelectItem>
            <SelectItem value="attitude">Attitude</SelectItem>
            <SelectItem value="custom">+ Add Custom Category</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ============================================
// LOGIC TAB CONTENT
// ============================================
function LogicTab({ 
  question, 
  questions,
  onUpdate,
  surveyTitle
}: { 
  question: Question; 
  questions: Question[];
  onUpdate: (updates: Partial<Question>) => void;
  surveyTitle: string;
}) {
  const { toast } = useToast();
  // skipCondition is an object { questionId, answer } per schema
  const [selectedAnswer, setSelectedAnswer] = useState(question.skipCondition?.answer || '');
  const [skipToQuestionId, setSkipToQuestionId] = useState(question.skipCondition?.questionId || '');
  
  const suggestLogicMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/chat', {
        message: `Suggest skip logic for this question: "${question.question}" with options: ${question.options?.join(', ')}. Consider the survey context.`,
        surveyContext: { 
          title: surveyTitle,
          questions: questions.map(q => ({ id: q.id, question: q.question })) 
        },
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'AI Logic Suggestion', description: data.response || 'See the suggestion' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to get suggestion', variant: 'destructive' });
    },
  });
  
  return (
    <div className="p-4 space-y-4">
      {/* AI Suggest Logic Button */}
      <button
        onClick={() => suggestLogicMutation.mutate()}
        disabled={suggestLogicMutation.isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold
                   text-purple-600 bg-purple-50 border-2 border-purple-200 rounded-lg
                   hover:bg-purple-100 hover:border-purple-300 transition-all group
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
        <span>{suggestLogicMutation.isPending ? 'Analyzing...' : 'AI Suggest Logic'}</span>
      </button>

      <p className="text-sm text-gray-500">
        Add conditional logic to show/hide questions or skip based on answers.
      </p>

      {/* Skip Logic Configuration */}
      <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 space-y-3">
        <p className="text-xs font-semibold text-gray-900">Skip Logic</p>
        
        <div className="space-y-2">
          <label className="text-xs text-gray-500">If answer is:</label>
          <Select
            value={selectedAnswer}
            onValueChange={(value) => {
              setSelectedAnswer(value);
              // Update skipCondition as object per schema: { questionId, answer }
              if (value && skipToQuestionId) {
                onUpdate({ 
                  skipCondition: { 
                    questionId: skipToQuestionId, 
                    answer: value 
                  } 
                });
              } else if (!value) {
                onUpdate({ skipCondition: undefined });
              }
            }}
          >
            <SelectTrigger className="h-9 text-sm bg-white">
              <SelectValue placeholder="Select condition..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option, idx) => (
                <SelectItem key={idx} value={option}>{option}</SelectItem>
              ))}
              <SelectItem value="any">Any answer</SelectItem>
              <SelectItem value="empty">No answer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-500">Then skip to:</label>
          <Select
            value={skipToQuestionId}
            onValueChange={(value) => {
              setSkipToQuestionId(value);
              // Update skipCondition as object per schema: { questionId, answer }
              if (selectedAnswer && value) {
                onUpdate({ 
                  skipCondition: { 
                    questionId: value, 
                    answer: selectedAnswer 
                  } 
                });
              }
            }}
          >
            <SelectTrigger className="h-9 text-sm bg-white">
              <SelectValue placeholder="Skip to question..." />
            </SelectTrigger>
            <SelectContent>
              {questions
                .filter(q => q.id !== question.id)
                .map((q, idx) => (
                  <SelectItem key={q.id} value={q.id}>
                    Q{idx + 1}: {q.question.substring(0, 30)}...
                  </SelectItem>
                ))}
              <SelectItem value="end">End survey</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1">
          <Plus size={14} /> Add Logic Rule
        </button>
      </div>
    </div>
  );
}

// ============================================
// DESIGN TAB CONTENT
// ============================================
function DesignTab({ 
  question, 
  onUpdate 
}: { 
  question: Question; 
  onUpdate: (updates: Partial<Question>) => void;
}) {
  const { toast } = useToast();
  
  const optimizeDesignMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/chat', {
        message: `Suggest optimal design settings for this question type: "${question.type}" with text: "${question.question}"`,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'AI Design Suggestion', description: data.response || 'See the suggestion' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to get suggestion', variant: 'destructive' });
    },
  });
  
  return (
    <div className="p-4 space-y-4">
      {/* AI Optimize Design Button */}
      <button
        onClick={() => optimizeDesignMutation.mutate()}
        disabled={optimizeDesignMutation.isPending}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold
                   text-purple-600 bg-purple-50 border-2 border-purple-200 rounded-lg
                   hover:bg-purple-100 hover:border-purple-300 transition-all group
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
        <span>{optimizeDesignMutation.isPending ? 'Optimizing...' : 'AI Optimize Design'}</span>
      </button>

      {/* Layout Options */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Display Layout</Label>
        <div className="space-y-2">
          {(['vertical', 'horizontal', 'grid'] as const).map((layout) => (
            <label key={layout} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="layout"
                value={layout}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="capitalize">{layout === 'grid' ? 'Grid (2 columns)' : layout}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Button Style (for choice questions) */}
      {question.options && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-700">Button Style</Label>
          <div className="space-y-2">
            {(['radio', 'cards', 'buttons'] as const).map((style) => (
              <label key={style} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="buttonStyle"
                  value={style}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="capitalize">{style === 'radio' ? 'Radio buttons' : style}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Rating Display (for rating questions) */}
      {question.type === 'rating' && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-700">Rating Style</Label>
          <Select
            value={question.ratingStyle || 'number'}
            onValueChange={(value) => onUpdate({ ratingStyle: value as any })}
          >
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select style..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="number">Number Scale</SelectItem>
              <SelectItem value="star">Stars ★</SelectItem>
              <SelectItem value="emoji">Emoji 😐</SelectItem>
              <SelectItem value="heart">Hearts ♥</SelectItem>
              <SelectItem value="thumb">Thumbs 👍</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN CONFIG PANEL COMPONENT
// ============================================
interface QuestionConfigPanelLiteProps {
  question: Question | null;
  questions: Question[];
  surveyTitle: string;
  onUpdateQuestion: (updates: Partial<Question>) => void;
  onEnhanceQuestion: () => void;
  onGenerateFollowUp: () => void;
  isOpen: boolean;
  onToggle: () => void;
  isEnhancing?: boolean;
}

export function QuestionConfigPanelLite({
  question,
  questions,
  surveyTitle,
  onUpdateQuestion,
  onEnhanceQuestion,
  onGenerateFollowUp,
  isOpen,
  onToggle,
  isEnhancing = false,
}: QuestionConfigPanelLiteProps) {
  const { toast } = useToast();
  const [settingsTab, setSettingsTab] = useState<'settings' | 'scoring'>('settings');
  const [logicTab, setLogicTab] = useState<'logic' | 'design'>('logic');

  // AI Mutations
  const rewriteMutation = useMutation({
    mutationFn: async () => {
      if (!question) return;
      const res = await apiRequest('POST', '/api/ai/chat', {
        message: `Rewrite this question to be clearer and more engaging: "${question.question}"`,
        surveyContext: { title: surveyTitle },
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.response && question) {
        // Extract the rewritten question from the response
        const match = data.response.match(/"([^"]+)"/);
        if (match) {
          onUpdateQuestion({ question: match[1] });
          toast({ title: 'Question rewritten', description: 'Your question has been improved' });
        } else {
          toast({ title: 'AI Suggestion', description: data.response });
        }
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to rewrite question', variant: 'destructive' });
    },
  });

  // Collapsed state - show expand button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-10 flex-shrink-0 bg-white border-l border-gray-200 
                   flex items-center justify-center hover:bg-gray-50 transition-colors group"
        title="Open Configuration Panel"
      >
        <ChevronRight size={20} className="text-gray-500 group-hover:text-purple-500 transition-colors rotate-180" />
      </button>
    );
  }

  // No question selected - show placeholder
  if (!question) {
    return (
      <aside className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <span className="text-sm font-semibold text-gray-900">Configuration</span>
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Settings size={24} className="text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 font-medium">Select a question to configure</p>
            <p className="text-xs text-gray-400 mt-1">Click on any question to see its options</p>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-[280px] lg:w-[320px] flex-shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 flex-shrink-0">
        <span className="text-sm font-semibold text-gray-900">Configuration</span>
        <button
          onClick={onToggle}
          className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* AI Assistant Section */}
        <CollapsibleSection
          title="AI Assistant"
          icon={<Sparkles size={16} />}
          defaultOpen={true}
        >
          <div className="p-4 space-y-2">
            <ActionButton
              icon={<Wand2 size={14} />}
              label="Enhance question"
              onClick={onEnhanceQuestion}
              loading={isEnhancing}
            />
            <ActionButton
              icon={<RefreshCw size={14} className={rewriteMutation.isPending ? 'animate-spin' : ''} />}
              label="Rewrite question"
              onClick={() => rewriteMutation.mutate()}
              loading={rewriteMutation.isPending}
            />
            <ActionButton
              icon={<Plus size={14} />}
              label="Add follow-up question"
              onClick={onGenerateFollowUp}
            />
          </div>
        </CollapsibleSection>

        {/* Settings & Scoring Section */}
        <CollapsibleSection
          title="Settings & Scoring"
          icon={<Settings size={16} />}
          defaultOpen={true}
        >
          <Tabs
            tabs={[
              { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
              { id: 'scoring', label: 'Scoring', icon: <Star size={14} /> },
            ]}
            activeTab={settingsTab}
            onTabChange={(tab) => setSettingsTab(tab as 'settings' | 'scoring')}
          />
          <div className="max-h-[400px] overflow-y-auto">
            {settingsTab === 'settings' ? (
              <SettingsTab question={question} onUpdate={onUpdateQuestion} />
            ) : (
              <ScoringTab question={question} onUpdate={onUpdateQuestion} surveyTitle={surveyTitle} />
            )}
          </div>
        </CollapsibleSection>

        {/* Logic & Design Section */}
        <CollapsibleSection
          title="Logic & Design"
          icon={<GitBranch size={16} />}
          defaultOpen={false}
        >
          <Tabs
            tabs={[
              { id: 'logic', label: 'Logic', icon: <GitBranch size={14} /> },
              { id: 'design', label: 'Design', icon: <Palette size={14} /> },
            ]}
            activeTab={logicTab}
            onTabChange={(tab) => setLogicTab(tab as 'logic' | 'design')}
          />
          <div className="max-h-[400px] overflow-y-auto">
            {logicTab === 'logic' ? (
              <LogicTab 
                question={question} 
                questions={questions}
                onUpdate={onUpdateQuestion} 
                surveyTitle={surveyTitle}
              />
            ) : (
              <DesignTab question={question} onUpdate={onUpdateQuestion} />
            )}
          </div>
        </CollapsibleSection>
      </div>
    </aside>
  );
}

export default QuestionConfigPanelLite;

