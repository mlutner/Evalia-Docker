import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  Monitor, Smartphone, Tablet, CheckCircle2, Copy,
  Mail, QrCode, Share2,
} from 'lucide-react';
import {
  SurveyBuilderProvider,
  useSurveyBuilder,
  type BuilderQuestion,
  type BuilderSurvey,
} from '@/contexts/SurveyBuilderContext';
import { ProgressFlowStepper } from '@/components/builder-v2/ProgressFlowStepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { QuestionRenderer } from '@/components/surveys/QuestionRenderer';
import { toRuntimeQuestion } from '@/lib/questionAdapter';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface PreviewThemeColors {
  primary: string;
  headerBar: string;
  background: string;
  text: string;
  buttonText: string;
}

interface InteractiveSurveyPreviewProps {
  survey: BuilderSurvey;
  questions: BuilderQuestion[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_THEME: PreviewThemeColors = {
  primary: '#2F8FA5',
  headerBar: '#2F8FA5',
  background: '#FFFFFF',
  text: '#1e293b',
  buttonText: '#FFFFFF',
};

/** Sanitize theme colors, ensuring valid hex values */
function sanitizeTheme(
  themeColors?: Partial<PreviewThemeColors>
): PreviewThemeColors {
  const isValidHex = (val: unknown): val is string =>
    typeof val === 'string' && /^#[0-9A-Fa-f]{3,8}$/.test(val);

  return {
    primary: isValidHex(themeColors?.primary) ? themeColors.primary : DEFAULT_THEME.primary,
    headerBar: isValidHex(themeColors?.headerBar) ? themeColors.headerBar : DEFAULT_THEME.headerBar,
    background: isValidHex(themeColors?.background) ? themeColors.background : DEFAULT_THEME.background,
    text: isValidHex(themeColors?.text) ? themeColors.text : DEFAULT_THEME.text,
    buttonText: isValidHex(themeColors?.buttonText) ? themeColors.buttonText : DEFAULT_THEME.buttonText,
  };
}

export default function PreviewV2() {
  const [, params] = useRoute('/preview-v2/:id');
  const surveyId = params?.id;

  return (
    <SurveyBuilderProvider surveyId={surveyId}>
      <PreviewContent surveyId={surveyId} />
    </SurveyBuilderProvider>
  );
}

function PreviewContent({ surveyId }: { surveyId?: string }) {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { survey, questions, saveSurvey, isSaving } = useSurveyBuilder();
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Clamp currentQuestionIndex when questions.length changes
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex >= questions.length) {
      setCurrentQuestionIndex(questions.length - 1);
    }
  }, [questions.length, currentQuestionIndex]);

  // Reset preview index when surveyId changes (navigating to different survey)
  useEffect(() => {
    setCurrentQuestionIndex(0);
  }, [surveyId]);

  // SSR-safe survey URL
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const surveyUrl =
    origin && surveyId && surveyId !== 'new'
      ? `${origin}/survey/${surveyId}`
      : null;

  // Publish gating
  const hasMeaningfulTitle = !!survey.title && survey.title !== 'Untitled Survey';
  const canPublish = questions.length > 0 && hasMeaningfulTitle;

  const handleCopyLink = async () => {
    if (!surveyUrl) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(surveyUrl);
        toast({
          title: 'Link copied!',
          description: 'Survey link has been copied to clipboard.',
        });
      } else {
        throw new Error('Clipboard API not available');
      }
    } catch {
      toast({
        title: 'Could not copy link',
        description: 'Please copy the link manually.',
        variant: 'destructive',
      });
    }
  };

  const handlePublish = async () => {
    try {
      const savedId = await saveSurvey();
      if (savedId) {
        toast({
          title: 'Survey Published!',
          description: 'Your survey is now live and ready to collect responses.',
        });
        setLocation('/surveys');
      } else {
        toast({
          title: 'Publish failed',
          description: 'Survey could not be saved. Please try again.',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Publish failed',
        description: 'An error occurred while publishing. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      default:
        return 'max-w-[640px]';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Progress Flow Stepper */}
      <ProgressFlowStepper surveyId={surveyId} />

      {/* 3-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Share Options */}
        <aside className="w-[320px] flex-shrink-0 bg-white border-r border-gray-200 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
            <h2 className="text-sm font-bold text-gray-900">Share & Distribute</h2>
            <p className="text-xs text-gray-500 mt-0.5">Get your survey in front of respondents</p>
          </div>

          <div className="p-4 space-y-6">
            {/* Survey Link */}
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2 block">
                Survey Link
              </label>
              <div className="flex gap-2">
                <Input
                  value={surveyUrl || ''}
                  placeholder="Save survey to get link"
                  readOnly
                  className="text-sm font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  disabled={!surveyUrl}
                >
                  <Copy size={16} />
                </Button>
              </div>
            </div>

            {/* Share Options */}
            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider block">
                Quick Share
              </label>
              
              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Email</p>
                  <p className="text-xs text-gray-500">Send survey via email</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <QrCode size={18} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">QR Code</p>
                  <p className="text-xs text-gray-500">Download QR code</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <Share2 size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Embed</p>
                  <p className="text-xs text-gray-500">Embed on your website</p>
                </div>
              </button>
            </div>

            {/* Publish Button */}
            <div className="pt-4 border-t border-gray-200">
              <Button
                onClick={handlePublish}
                disabled={isSaving || !canPublish}
                className="w-full bg-[#2F8FA5] hover:bg-[#267a8d]"
                size="lg"
              >
                {isSaving ? 'Publishing...' : 'Publish Survey'}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                {!canPublish
                  ? 'Add questions and set a meaningful title to publish'
                  : 'Once published, your survey will be live'}
              </p>
            </div>
          </div>
        </aside>

        {/* Center Panel: Live Preview */}
        <main className="flex-1 bg-gray-100 p-8 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Preview Controls */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Live Preview</h2>
                <p className="text-xs text-gray-500">
                  Test your survey before publishing
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setDeviceView('desktop')}
                  className={`px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    deviceView === 'desktop'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Monitor size={14} />
                  <span>Desktop</span>
                </button>
                <button
                  onClick={() => setDeviceView('tablet')}
                  className={`px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    deviceView === 'tablet'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Tablet size={14} />
                  <span>Tablet</span>
                </button>
                <button
                  onClick={() => setDeviceView('mobile')}
                  className={`px-3 py-2 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    deviceView === 'mobile'
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Smartphone size={14} />
                  <span>Mobile</span>
                </button>
              </div>
            </div>

            {/* Preview Container */}
            <div className={`${getDeviceWidth()} mx-auto transition-all duration-300`}>
              <InteractiveSurveyPreview
                survey={survey}
                questions={questions}
                currentIndex={currentQuestionIndex}
                onIndexChange={setCurrentQuestionIndex}
              />
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500 font-mono">
                This is a preview. Responses will not be recorded.
              </p>
            </div>
          </div>
        </main>

        {/* Right Panel: Checklist */}
        <aside className="w-[320px] flex-shrink-0 bg-white border-l border-gray-200 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 z-10">
            <h2 className="text-sm font-bold text-gray-900">Pre-Publish Checklist</h2>
            <p className="text-xs text-gray-500 mt-0.5">Review before publishing</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Status */}
            <div className={`p-4 rounded-lg border ${
              questions.length > 0
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-start gap-3">
                <CheckCircle2
                  size={20}
                  className={questions.length > 0 ? 'text-green-600' : 'text-yellow-600'}
                />
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">
                    {questions.length > 0 ? 'Ready to Publish' : 'Almost There'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {questions.length > 0
                      ? 'Your survey is complete and ready to share'
                      : 'Add questions to complete your survey'}
                  </p>
                </div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-3">
              <ChecklistItem
                label="Questions added"
                description={`${questions.length} questions configured`}
                completed={questions.length > 0}
              />
              <ChecklistItem
                label="Title set"
                description={survey.title || 'No title set'}
                completed={!!survey.title && survey.title !== 'Untitled Survey'}
              />
              <ChecklistItem
                label="Welcome screen"
                description={survey?.welcomeScreen?.enabled ? 'Enabled' : 'Disabled'}
                completed={true}
              />
              <ChecklistItem
                label="Thank you screen"
                description={survey?.thankYouScreen?.enabled ? 'Enabled' : 'Disabled'}
                completed={true}
              />
            </div>

            {/* Survey Summary */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Survey Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SummaryRow label="Questions" value={questions.length.toString()} />
                <SummaryRow
                  label="Required"
                  value={questions.filter((q) => q.required).length.toString()}
                />
                <SummaryRow
                  label="Est. Time"
                  value={`${Math.ceil(questions.length * 0.5)} min`}
                />
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChecklistItem({
  label,
  description,
  completed,
}: {
  label: string;
  description: string;
  completed: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
          completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
        }`}
      >
        {completed && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
      </div>
      <div className="flex-1">
        <p className={`text-xs font-semibold ${completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
          {label}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-gray-500">{label}</span>
      <span className="font-semibold text-gray-900">{value}</span>
    </div>
  );
}

function InteractiveSurveyPreview({
  survey,
  questions,
  currentIndex,
  onIndexChange,
}: InteractiveSurveyPreviewProps) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});

  // Guard: if survey is missing, show fallback
  if (!survey) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[500px] flex flex-col">
        <div className="h-3 bg-gray-300" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Loading survey...</p>
        </div>
      </div>
    );
  }

  const handleAnswerChange = (questionId: string, value: unknown) => {
    setPreviewAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleStart = () => {
    setShowWelcome(false);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      onIndexChange(currentIndex + 1);
    } else {
      setShowThankYou(true);
    }
  };

  const handlePrev = () => {
    if (canGoBackToWelcome) {
      setShowWelcome(true);
    } else if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    }
  };

  const handleRestart = () => {
    setShowWelcome(true);
    setShowThankYou(false);
    setPreviewAnswers({});
    onIndexChange(0);
  };

  // Derived state
  const canGoBackToWelcome = currentIndex === 0 && survey?.welcomeScreen?.enabled;
  const backButtonLabel = canGoBackToWelcome ? 'Back' : 'Previous';

  // Sanitize theme colors
  const themeColors = sanitizeTheme(survey?.welcomeScreen?.themeColors);

  // Welcome Screen - clean, consistent design
  if (showWelcome && survey?.welcomeScreen?.enabled) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[500px] flex flex-col">
        {/* Header Bar - uses configurable header bar color */}
        <div className="h-3" style={{ backgroundColor: themeColors.headerBar || themeColors.primary }} />

        {/* Header Image */}
        {survey?.welcomeScreen?.headerImage && (
          <div className="relative h-24 overflow-hidden flex-shrink-0">
            <img 
              src={survey.welcomeScreen.headerImage} 
              alt="Welcome header" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
          <h1 
            className="text-2xl font-bold mb-3"
            style={{ color: themeColors.text }}
          >
            {survey.welcomeScreen.title || 'Welcome'}
          </h1>
          <p 
            className="mb-6 max-w-md"
            style={{ color: themeColors.text, opacity: 0.7 }}
          >
            {survey.welcomeScreen.description || 'Your feedback helps us improve'}
          </p>

          {/* Survey Info */}
          <p className="text-sm mb-6 text-gray-500">
            ~{survey.estimatedMinutes || Math.ceil(questions.length * 0.5)} min • {questions.length} question{questions.length !== 1 ? 's' : ''}
          </p>

          <Button 
            onClick={handleStart}
            style={{ 
              backgroundColor: themeColors.primary,
              color: themeColors.buttonText,
            }}
            className="hover:opacity-90 px-8"
          >
            {survey.welcomeScreen.buttonText || 'Start Survey'}
          </Button>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {survey.title} • Powered by Evalia
          </p>
        </div>
      </div>
    );
  }

  // Thank You Screen - clean, consistent design
  if (showThankYou) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[500px] flex flex-col">
        {/* Header Bar - uses configurable header bar color */}
        <div className="h-3" style={{ backgroundColor: themeColors.headerBar || themeColors.primary }} />

        {/* Header Image */}
        {survey?.thankYouScreen?.headerImage && (
          <div className="relative h-24 overflow-hidden flex-shrink-0">
            <img 
              src={survey.thankYouScreen.headerImage} 
              alt="Thank you header" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 p-8 text-center flex flex-col items-center justify-center">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: themeColors.primary + '20' }}
          >
            <CheckCircle2 size={32} style={{ color: themeColors.primary }} />
          </div>
          <h1 
            className="text-2xl font-bold mb-3"
            style={{ color: themeColors.text }}
          >
            {survey.thankYouScreen.title || 'Thank you!'}
          </h1>
          <p 
            className="mb-6"
            style={{ color: themeColors.text, opacity: 0.7 }}
          >
            {survey.thankYouScreen.message || 'Your response has been recorded.'}
          </p>
          <Button variant="outline" onClick={handleRestart}>
            Restart Preview
          </Button>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 text-center border-t border-gray-100">
          <p className="text-xs text-gray-400">
            {survey.title} • Powered by Evalia
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[500px] flex flex-col">
        <div className="h-3" style={{ backgroundColor: themeColors.headerBar || themeColors.primary }} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">No questions to preview. Add questions in the Builder.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden h-[500px] flex flex-col">
      {/* Header Bar - uses configurable header bar color */}
      <div className="h-3" style={{ backgroundColor: themeColors.headerBar || themeColors.primary }} />

      {/* Progress Bar */}
      <div className="h-1.5 bg-gray-200">
        <div
          className="h-full transition-all rounded-r-full"
          style={{ 
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
            backgroundColor: themeColors.primary,
          }}
        />
      </div>

      {/* Question Content - scrollable if needed */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Question Badge & Required */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full">
            Q{currentIndex + 1}
          </span>
          {currentQuestion.required && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full">
              Required
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">{currentQuestion.text}</h2>

        {currentQuestion.description && (
          <p className="text-gray-500 mb-6">{currentQuestion.description}</p>
        )}

        {/* Render question using shared QuestionRenderer */}
        <QuestionRenderer
          question={toRuntimeQuestion(currentQuestion)}
          mode="preview"
          value={previewAnswers[currentQuestion.id]}
          onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          themeColors={{
            primary: themeColors.primary,
            background: themeColors.background,
            text: themeColors.text,
          }}
        />
      </div>

      {/* Navigation - fixed at bottom */}
      <div className="flex justify-between px-8 py-4 border-t border-gray-100">
        <Button variant="ghost" onClick={handlePrev} className="text-gray-500 hover:text-gray-700">
          ← {backButtonLabel}
        </Button>
        <Button 
          onClick={handleNext}
          style={{ backgroundColor: themeColors.primary }}
          className="text-white hover:opacity-90"
        >
          {currentIndex === questions.length - 1 ? 'Submit' : 'Next'} →
        </Button>
      </div>
    </div>
  );
}

