import React, { useState } from 'react';
import {
  ChevronRight, ChevronDown, ChevronUp, ChevronLeft,
  Wand2, RefreshCw, Plus, Settings, Star, GitBranch, Palette,
  Home, Heart, Trophy, X, Info
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useSurveyBuilder, BuilderQuestion, ValidQuestionType } from '@/contexts/SurveyBuilderContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { QUESTION_TYPES, getQuestionTypeConfig, LIKERT_PRESETS, type QuestionParameterConfig } from '@/data/questionTypeConfig';
import { QuestionLogicEditor } from './QuestionLogicEditor';
import { ScoringPanel } from './ScoringPanel';
import { ResultsConfigPanel } from './ResultsConfigPanel';
import { FEATURES } from '@/config/features';
import { RightPanelLayout } from '@/components/builder/shared/RightPanelLayout';
import { QuestionScoringSection } from '@/components/builder/shared/QuestionScoringSection';

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
        <div className="border-t border-gray-200">
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
// DYNAMIC PARAMETER EDITOR
// ============================================
function ParameterEditor({ 
  param, 
  question, 
  onUpdate 
}: { 
  param: QuestionParameterConfig; 
  question: BuilderQuestion;
  onUpdate: (key: string, value: any) => void;
}) {
  const currentValue = (question as any)[param.key];
  
  if (param.type === 'text') {
    const displayValue =
      param.key === 'allowedTypes' && Array.isArray(currentValue)
        ? currentValue.join(', ')
        : currentValue || '';
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">{param.label}</Label>
        <Input
          value={displayValue}
          onChange={(e) => {
            if (param.key === 'allowedTypes') {
              const values = e.target.value
                .split(/[,;]+/)
                .map((v) => v.trim())
                .filter(Boolean);
              onUpdate(param.key, values);
            } else {
              onUpdate(param.key, e.target.value);
            }
          }}
          placeholder={param.description}
          className="text-sm h-8"
        />
        {param.description && (
          <p className="text-xs text-gray-400">{param.description}</p>
        )}
      </div>
    );
  }

  if (param.type === 'number') {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">{param.label}</Label>
        <Input
          type="number"
          value={currentValue ?? param.defaultValue ?? ''}
          onChange={(e) => onUpdate(param.key, e.target.value ? Number(e.target.value) : undefined)}
          min={param.min}
          max={param.max}
          className="text-sm h-8"
        />
      </div>
    );
  }

  if (param.type === 'boolean') {
    return (
      <div className="flex items-center gap-2">
        <Checkbox
          id={param.key}
          checked={currentValue ?? param.defaultValue ?? false}
          onCheckedChange={(checked) => onUpdate(param.key, !!checked)}
        />
        <Label htmlFor={param.key} className="text-sm text-gray-700 cursor-pointer">
          {param.label}
        </Label>
      </div>
    );
  }

  if (param.type === 'select' && param.options) {
    return (
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-gray-700">{param.label}</Label>
        <Select
          value={String(currentValue ?? param.defaultValue ?? '')}
          onValueChange={(value) => {
            // Convert to number if it looks like a number
            const numValue = Number(value);
            onUpdate(param.key, isNaN(numValue) ? value : numValue);
          }}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder={`Select ${param.label.toLowerCase()}...`} />
          </SelectTrigger>
          <SelectContent>
            {param.options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return null;
}

// ============================================
// WELCOME SCREEN SETTINGS
// ============================================
function WelcomeScreenSettings() {
  const { survey, updateWelcomeScreen } = useSurveyBuilder();
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Home size={16} className="text-purple-600" />
        <h4 className="text-sm font-bold text-gray-900">Welcome Screen</h4>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Title</Label>
        <Input
          value={survey.welcomeScreen.title}
          onChange={(e) => updateWelcomeScreen({ title: e.target.value })}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Description</Label>
        <Textarea
          value={survey.welcomeScreen.description}
          onChange={(e) => updateWelcomeScreen({ description: e.target.value })}
          className="resize-none min-h-[80px] text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Button Text</Label>
        <Input
          value={survey.welcomeScreen.buttonText}
          onChange={(e) => updateWelcomeScreen({ buttonText: e.target.value })}
          className="text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="welcome-enabled"
          checked={survey.welcomeScreen.enabled}
          onCheckedChange={(checked) => updateWelcomeScreen({ enabled: !!checked })}
        />
        <Label htmlFor="welcome-enabled" className="text-sm text-gray-700 cursor-pointer">
          Enable Welcome Screen
        </Label>
      </div>
    </div>
  );
}

// ============================================
// THANK YOU SCREEN SETTINGS
// ============================================
function ThankYouScreenSettings() {
  const { survey, updateThankYouScreen } = useSurveyBuilder();
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Heart size={16} className="text-green-600" />
        <h4 className="text-sm font-bold text-gray-900">Thank You Screen</h4>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Title</Label>
        <Input
          value={survey.thankYouScreen.title}
          onChange={(e) => updateThankYouScreen({ title: e.target.value })}
          className="text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Message</Label>
        <Textarea
          value={survey.thankYouScreen.message}
          onChange={(e) => updateThankYouScreen({ message: e.target.value })}
          className="resize-none min-h-[80px] text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Redirect URL (optional)</Label>
        <Input
          type="url"
          value={survey.thankYouScreen.redirectUrl || ''}
          onChange={(e) => updateThankYouScreen({ redirectUrl: e.target.value })}
          placeholder="https://example.com"
          className="text-sm"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="social-share"
            checked={survey.thankYouScreen.showSocialShare}
            onCheckedChange={(checked) => updateThankYouScreen({ showSocialShare: !!checked })}
          />
          <Label htmlFor="social-share" className="text-sm text-gray-700 cursor-pointer">
            Show social share buttons
          </Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="thankyou-enabled"
            checked={survey.thankYouScreen.enabled}
            onCheckedChange={(checked) => updateThankYouScreen({ enabled: !!checked })}
          />
          <Label htmlFor="thankyou-enabled" className="text-sm text-gray-700 cursor-pointer">
            Enable Thank You Screen
          </Label>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SCORING SETTINGS (for scoring section)
// ============================================
function SurveyScoringSettings() {
  const { survey, updateScoringSettings } = useSurveyBuilder();
  
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Trophy size={16} className="text-yellow-600" />
        <h4 className="text-sm font-bold text-gray-900">Scoring & Results</h4>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="scoring-enabled"
          checked={survey.scoringSettings.enabled}
          onCheckedChange={(checked) => updateScoringSettings({ enabled: !!checked })}
        />
        <Label htmlFor="scoring-enabled" className="text-sm text-gray-700 cursor-pointer font-semibold">
          Enable Scoring
        </Label>
      </div>

      {survey.scoringSettings.enabled && (
        <>
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Scoring Type</Label>
            <Select
              value={survey.scoringSettings.type}
              onValueChange={(value) => updateScoringSettings({ type: value as 'points' | 'percentage' | 'custom' })}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="Select type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="points">Points</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Passing Score</Label>
            <Input
              type="number"
              value={survey.scoringSettings.passingScore || 0}
              onChange={(e) => updateScoringSettings({ passingScore: Number(e.target.value) })}
              className="text-sm h-9"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-score"
                checked={survey.scoringSettings.showScore}
                onCheckedChange={(checked) => updateScoringSettings({ showScore: !!checked })}
              />
              <Label htmlFor="show-score" className="text-sm text-gray-700 cursor-pointer">
                Show score to respondent
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="show-correct"
                checked={survey.scoringSettings.showCorrectAnswers}
                onCheckedChange={(checked) => updateScoringSettings({ showCorrectAnswers: !!checked })}
              />
              <Label htmlFor="show-correct" className="text-sm text-gray-700 cursor-pointer">
                Show correct answers
              </Label>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// SETTINGS TAB - With Type-Specific Parameters
// ============================================
function SettingsTab({ question }: { question: BuilderQuestion }) {
  const { updateQuestion } = useSurveyBuilder();
  const typeConfig = getQuestionTypeConfig(question.type);
  
  const handleParamUpdate = (key: string, value: any) => {
    updateQuestion(question.id, { [key]: value });
  };
  
  return (
    <div className="p-4 space-y-4">
      {/* Question Text */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Question Text</Label>
        <Textarea
          value={question.text}
          onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
          placeholder="Enter your question..."
          className="resize-none min-h-[80px] text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Description (optional)</Label>
        <Textarea
          value={question.description || ''}
          onChange={(e) => updateQuestion(question.id, { description: e.target.value })}
          placeholder="Add helpful context..."
          className="resize-none min-h-[60px] text-sm"
        />
      </div>

      {/* Core Settings */}
      <div className="space-y-3 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Checkbox
            id="required"
            checked={question.required}
            onCheckedChange={(checked) => updateQuestion(question.id, { required: !!checked })}
          />
          <Label htmlFor="required" className="text-sm text-gray-700 cursor-pointer">
            Required
          </Label>
        </div>
      </div>

      {/* Type-Specific Parameters */}
      {typeConfig && typeConfig.parameters.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-purple-500" />
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {typeConfig.displayName} Options
            </span>
          </div>
          {typeConfig.parameters.map((param) => (
            <ParameterEditor
              key={param.key}
              param={param}
              question={question}
              onUpdate={handleParamUpdate}
            />
          ))}
        </div>
      )}

      {/* Options for choice questions */}
      {typeConfig?.supportsOptions && question.options && (
        <div className="space-y-2 pt-4 border-t border-gray-200">
          <Label className="text-xs font-semibold text-gray-700">Options</Label>
          <div className="space-y-2">
            {question.options.map((option, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options!];
                    newOptions[idx] = e.target.value;
                    updateQuestion(question.id, { options: newOptions });
                  }}
                  className="text-sm h-8 flex-1"
                  placeholder={`Option ${idx + 1}`}
                />
                <button
                  onClick={() => {
                    const newOptions = question.options!.filter((_, i) => i !== idx);
                    updateQuestion(question.id, { options: newOptions });
                  }}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
                updateQuestion(question.id, { options: newOptions });
              }}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
            >
              <Plus size={14} /> Add Option
            </button>
          </div>
        </div>
      )}

      {/* Matrix-specific: Row and Column labels */}
      {question.type === 'matrix' && (
        <>
          <div className="space-y-2 pt-4 border-t border-gray-200">
            <Label className="text-xs font-semibold text-gray-700">Row Labels</Label>
            <div className="space-y-2">
              {(question.rowLabels || ['Row 1', 'Row 2']).map((row, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={row}
                    onChange={(e) => {
                      const newRows = [...(question.rowLabels || [])];
                      newRows[idx] = e.target.value;
                      updateQuestion(question.id, { rowLabels: newRows });
                    }}
                    className="text-sm h-8 flex-1"
                    placeholder={`Row ${idx + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newRows = (question.rowLabels || []).filter((_, i) => i !== idx);
                      updateQuestion(question.id, { rowLabels: newRows });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newRows = [...(question.rowLabels || []), `Row ${(question.rowLabels?.length || 0) + 1}`];
                  updateQuestion(question.id, { rowLabels: newRows });
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Add Row
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-gray-700">Column Labels</Label>
            <div className="space-y-2">
              {(question.colLabels || ['Poor', 'Fair', 'Good', 'Excellent']).map((col, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    value={col}
                    onChange={(e) => {
                      const newCols = [...(question.colLabels || [])];
                      newCols[idx] = e.target.value;
                      updateQuestion(question.id, { colLabels: newCols });
                    }}
                    className="text-sm h-8 flex-1"
                    placeholder={`Column ${idx + 1}`}
                  />
                  <button
                    onClick={() => {
                      const newCols = (question.colLabels || []).filter((_, i) => i !== idx);
                      updateQuestion(question.id, { colLabels: newCols });
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newCols = [...(question.colLabels || []), `Column ${(question.colLabels?.length || 0) + 1}`];
                  updateQuestion(question.id, { colLabels: newCols });
                }}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Add Column
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// SCORING TAB CONTENT
// ============================================
function ScoringTab({ question }: { question: BuilderQuestion }) {
  return <QuestionScoringSection question={question} />;
}

// ============================================
// DESIGN TAB CONTENT
// ============================================
function DesignTab({ question }: { question: BuilderQuestion }) {
  const { updateQuestion } = useSurveyBuilder();
  const { toast } = useToast();
  const typeConfig = getQuestionTypeConfig(question.type);
  
  const optimizeDesignMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/chat', {
        message: `Suggest optimal design settings for this question type: "${question.type}" with text: "${question.text}"`,
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

      {/* Layout */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Layout</Label>
        <div className="space-y-2">
          {(['vertical', 'horizontal', 'grid'] as const).map((layout) => (
            <label key={layout} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
              <input
                type="radio"
                name="layout"
                checked={(question.designSettings?.layout || 'vertical') === layout}
                onChange={() => updateQuestion(question.id, { 
                  designSettings: { 
                    layout,
                    spacing: question.designSettings?.spacing || 'normal',
                    showQuestionNumber: question.designSettings?.showQuestionNumber ?? true,
                    showProgressBar: question.designSettings?.showProgressBar ?? false,
                    buttonStyle: question.designSettings?.buttonStyle,
                  } 
                })}
                className="text-purple-600 focus:ring-purple-500"
              />
              <span className="capitalize">{layout === 'grid' ? 'Grid (2 columns)' : layout} {layout === 'vertical' ? '(default)' : ''}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Button Style (for options) */}
      {typeConfig?.supportsOptions && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-gray-700">Button Style</Label>
          <div className="space-y-2">
            {(['radio', 'cards', 'buttons'] as const).map((style) => (
              <label key={style} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="radio"
                  name="buttonStyle"
                  checked={(question.designSettings?.buttonStyle || 'radio') === style}
                  onChange={() => updateQuestion(question.id, { 
                    designSettings: { 
                      layout: question.designSettings?.layout || 'vertical',
                      spacing: question.designSettings?.spacing || 'normal',
                      showQuestionNumber: question.designSettings?.showQuestionNumber ?? true,
                      showProgressBar: question.designSettings?.showProgressBar ?? false,
                      buttonStyle: style,
                    } 
                  })}
                  className="text-purple-600 focus:ring-purple-500"
                />
                <span className="capitalize">{style === 'radio' ? 'Radio buttons' : style}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Spacing */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold text-gray-700">Spacing</Label>
        <Select
          value={question.designSettings?.spacing || 'normal'}
          onValueChange={(value) => updateQuestion(question.id, { 
            designSettings: { 
              layout: question.designSettings?.layout || 'vertical',
              spacing: value as 'compact' | 'normal' | 'spacious',
              showQuestionNumber: question.designSettings?.showQuestionNumber ?? true,
              showProgressBar: question.designSettings?.showProgressBar ?? false,
              buttonStyle: question.designSettings?.buttonStyle,
            } 
          })}
        >
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Select spacing..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="compact">Compact</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="spacious">Spacious</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Additional Options */}
      <div className="space-y-3 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Checkbox
            id="show-number"
            checked={question.designSettings?.showQuestionNumber !== false}
            onCheckedChange={(checked) => updateQuestion(question.id, { 
              designSettings: { 
                layout: question.designSettings?.layout || 'vertical',
                spacing: question.designSettings?.spacing || 'normal',
                showQuestionNumber: !!checked,
                showProgressBar: question.designSettings?.showProgressBar ?? false,
                buttonStyle: question.designSettings?.buttonStyle,
              } 
            })}
          />
          <Label htmlFor="show-number" className="text-sm text-gray-700 cursor-pointer">
            Show question number
          </Label>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN CONFIG PANEL COMPONENT
// ============================================
export function QuestionConfigPanel() {
  const { toast } = useToast();
  const {
    rightPanelOpen,
    toggleRightPanel,
    questions,
    selectedQuestionId,
    selectedSection,
    updateQuestion,
    survey,
  } = useSurveyBuilder();
  
  const [settingsTab, setSettingsTab] = useState<'settings' | 'scoring'>('settings');
  const [logicTab, setLogicTab] = useState<'logic' | 'design'>('logic');
  
  // Get selected question
  const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
  
  // AI Mutations
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/ai/chat', {
        message: `Generate a follow-up question for: "${selectedQuestion?.text}"`,
        surveyContext: { title: survey.title, description: survey.description },
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: 'Question generated', description: data.response || 'AI suggestion ready' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to generate question', variant: 'destructive' });
    },
  });

  const rewriteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedQuestion) return;
      const res = await apiRequest('POST', '/api/ai/chat', {
        message: `Rewrite this question to be clearer and more engaging: "${selectedQuestion.text}"`,
        surveyContext: { title: survey.title },
      });
      return res.json();
    },
    onSuccess: (data) => {
      if (data.response && selectedQuestion) {
        const match = data.response.match(/"([^"]+)"/);
        if (match) {
          updateQuestion(selectedQuestion.id, { text: match[1] });
          toast({ title: 'Question rewritten', description: 'Your question has been improved' });
        }
      }
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to rewrite question', variant: 'destructive' });
    },
  });

  // Collapsed state
  if (!rightPanelOpen) {
    return (
      <button
        onClick={toggleRightPanel}
        className="w-12 flex-shrink-0 bg-white border-l border-gray-200 
                   flex items-center justify-center hover:bg-gray-50 transition-colors group"
        title="Open Configuration Panel"
      >
        <ChevronLeft size={20} className="text-gray-500 group-hover:text-purple-500 transition-colors" />
      </button>
    );
  }

  // Section selected (welcome, thankYou, scoring) - NOT 'questions' which shows question config below
  if (selectedSection && selectedSection !== 'questions') {
    return (
      <RightPanelLayout title="Configuration" onClose={toggleRightPanel}>
        <div className="flex-1 overflow-y-auto">
          {selectedSection === 'welcome' && <WelcomeScreenSettings />}
          {selectedSection === 'thankYou' && <ThankYouScreenSettings />}
          {selectedSection === 'scoring' && FEATURES.scoringV1 && <ScoringPanel />}
          {selectedSection === 'results' && FEATURES.resultsV1 && <ResultsConfigPanel />}
        </div>
      </RightPanelLayout>
    );
  }

  // No question selected - show placeholder
  if (!selectedQuestion) {
    return (
      <RightPanelLayout title="Configuration" onClose={toggleRightPanel}>
        <div className="flex-1 flex items-center justify-center p-6 overflow-hidden">
          <div className="text-center max-w-full">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center mx-auto mb-4 border border-purple-100">
              <Settings size={24} className="text-purple-400" />
            </div>
            <p className="text-sm text-gray-600 font-medium mb-1">Select a question</p>
            <p className="text-xs text-gray-400 leading-relaxed px-2">
              Click any question card on the canvas to configure its settings
            </p>
          </div>
        </div>
      </RightPanelLayout>
    );
  }

  const typeConfig = getQuestionTypeConfig(selectedQuestion.type);

  return (
    <RightPanelLayout
      title="Configuration"
      badge={typeConfig?.displayName}
      onClose={toggleRightPanel}
    >
      <div className="flex-1 overflow-y-auto min-h-0">
        <CollapsibleSection
          title="AI Assistant"
          icon={<Wand2 size={16} />}
          defaultOpen={true}
        >
          <div className="p-4 space-y-2">
            <ActionButton
              icon={<Wand2 size={14} />}
              label="Generate a question"
              onClick={() => generateMutation.mutate()}
              loading={generateMutation.isPending}
            />
            <ActionButton
              icon={<RefreshCw size={14} className={rewriteMutation.isPending ? 'animate-spin' : ''} />}
              label="Rewrite question"
              onClick={() => rewriteMutation.mutate()}
              loading={rewriteMutation.isPending}
            />
            <ActionButton
              icon={<Plus size={14} />}
              label="Add follow-up"
              onClick={() => generateMutation.mutate()}
              loading={generateMutation.isPending}
            />
          </div>
        </CollapsibleSection>

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
              <SettingsTab question={selectedQuestion} />
            ) : (
              <ScoringTab question={selectedQuestion} />
            )}
          </div>
        </CollapsibleSection>

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
              FEATURES.logicV2 ? (
                <QuestionLogicEditor question={selectedQuestion} />
              ) : null
            ) : (
              <DesignTab question={selectedQuestion} />
            )}
          </div>
        </CollapsibleSection>
      </div>
    </RightPanelLayout>
  );
}
