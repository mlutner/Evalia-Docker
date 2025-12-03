import React, { useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import {
  Monitor, Smartphone, Tablet, CheckCircle2, Copy, ExternalLink,
  Mail, QrCode, Share2, Download
} from 'lucide-react';
import { SurveyBuilderProvider, useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { ProgressFlowStepper } from '@/components/builder-v2/ProgressFlowStepper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

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

  const surveyUrl = surveyId && surveyId !== 'new' 
    ? `${window.location.origin}/survey/${surveyId}`
    : null;

  const handleCopyLink = () => {
    if (surveyUrl) {
      navigator.clipboard.writeText(surveyUrl);
      toast({
        title: 'Link copied!',
        description: 'Survey link has been copied to clipboard.',
      });
    }
  };

  const handlePublish = async () => {
    const savedId = await saveSurvey();
    if (savedId) {
      toast({
        title: 'Survey Published!',
        description: 'Your survey is now live and ready to collect responses.',
      });
      setLocation('/surveys');
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
                  value={surveyUrl || 'Save survey to get link'}
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
                disabled={isSaving || questions.length === 0}
                className="w-full bg-[#2F8FA5] hover:bg-[#267a8d]"
                size="lg"
              >
                {isSaving ? 'Publishing...' : 'Publish Survey'}
              </Button>
              <p className="text-xs text-gray-500 text-center mt-2">
                Once published, your survey will be live
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
                description={survey.welcomeScreen.enabled ? 'Enabled' : 'Disabled'}
                completed={true}
              />
              <ChecklistItem
                label="Thank you screen"
                description={survey.thankYouScreen.enabled ? 'Enabled' : 'Disabled'}
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
}: {
  survey: any;
  questions: any[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
}) {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showThankYou, setShowThankYou] = useState(false);

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
    if (currentIndex > 0) {
      onIndexChange(currentIndex - 1);
    } else {
      setShowWelcome(true);
    }
  };

  const handleRestart = () => {
    setShowWelcome(true);
    setShowThankYou(false);
    onIndexChange(0);
  };

  // Extract theme colors with fallbacks
  const themeColors = survey.welcomeScreen.themeColors || {
    primary: '#2F8FA5',
    background: '#FFFFFF',
    text: '#1e293b',
    buttonText: '#FFFFFF',
  };

  // Welcome Screen with design settings
  if (showWelcome && survey.welcomeScreen.enabled) {
    const welcomeBg = survey.welcomeScreen.backgroundImage;
    const hasBackground = welcomeBg?.url && !welcomeBg.url.startsWith('#');
    
    return (
      <div className="rounded-xl shadow-lg overflow-hidden relative min-h-[500px]">
        {/* Background Image Layer */}
        {hasBackground && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${welcomeBg.url})` }}
            />
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: welcomeBg.overlayColor || '#000000',
                opacity: (welcomeBg.overlayOpacity || 40) / 100,
              }}
            />
          </>
        )}

        <div 
          className="relative z-10 flex flex-col min-h-[500px]"
          style={{ backgroundColor: hasBackground ? 'transparent' : themeColors.background }}
        >
          {/* Header Image */}
          {survey.welcomeScreen.headerImage && (
            <div className="relative h-32 overflow-hidden">
              <img 
                src={survey.welcomeScreen.headerImage} 
                alt="Header" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 p-8 text-center flex flex-col items-center justify-center ${hasBackground ? 'text-white' : ''}`}>
            {/* Logo */}
            {survey.welcomeScreen.imageUrl && (
              <img 
                src={survey.welcomeScreen.imageUrl} 
                alt="Logo" 
                className="h-16 object-contain mb-6"
              />
            )}

            <h1 
              className="text-2xl font-bold mb-3"
              style={{ color: hasBackground ? '#FFFFFF' : themeColors.text }}
            >
              {survey.welcomeScreen.title || 'Welcome'}
            </h1>
            <p 
              className={`mb-6 max-w-md ${hasBackground ? 'text-white/80' : ''}`}
              style={{ color: hasBackground ? undefined : themeColors.text, opacity: hasBackground ? undefined : 0.7 }}
            >
              {survey.welcomeScreen.description || 'Your feedback helps us improve'}
            </p>

            {/* Survey Info */}
            {survey.welcomeScreen.showTimeEstimate && (
              <p className={`text-sm mb-4 ${hasBackground ? 'text-white/60' : 'text-gray-500'}`}>
                Estimated time: ~{survey.estimatedMinutes || Math.ceil(questions.length * 0.5)} min
                {survey.welcomeScreen.showQuestionCount && ` • ${questions.length} questions`}
              </p>
            )}

            <Button 
              onClick={handleStart}
              style={{ 
                backgroundColor: themeColors.primary,
                color: themeColors.buttonText,
              }}
              className="hover:opacity-90"
            >
              {survey.welcomeScreen.buttonText || 'Start Survey'}
            </Button>

            {/* Privacy */}
            {survey.welcomeScreen.privacyText && (
              <p className={`mt-6 text-xs max-w-sm ${hasBackground ? 'text-white/50' : 'text-gray-400'}`}>
                {survey.welcomeScreen.privacyText}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Thank You Screen with design settings
  if (showThankYou) {
    const thankYouBg = survey.thankYouScreen.backgroundImage;
    const hasBackground = thankYouBg?.url && !thankYouBg.url.startsWith('#');

    return (
      <div className="rounded-xl shadow-lg overflow-hidden relative min-h-[400px]">
        {/* Background Image Layer */}
        {hasBackground && (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${thankYouBg.url})` }}
            />
            <div 
              className="absolute inset-0"
              style={{ 
                backgroundColor: thankYouBg.overlayColor || '#000000',
                opacity: (thankYouBg.overlayOpacity || 40) / 100,
              }}
            />
          </>
        )}

        <div 
          className="relative z-10 p-8 text-center min-h-[400px] flex flex-col items-center justify-center"
          style={{ backgroundColor: hasBackground ? 'transparent' : themeColors.background }}
        >
          {/* Header Image */}
          {survey.thankYouScreen.headerImage && (
            <img 
              src={survey.thankYouScreen.headerImage} 
              alt="Header" 
              className="w-full h-24 object-cover absolute top-0 left-0 right-0"
            />
          )}

          <div 
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${hasBackground ? 'bg-white/20' : 'bg-green-100'}`}
          >
            <CheckCircle2 size={32} className={hasBackground ? 'text-white' : 'text-green-500'} />
          </div>
          <h1 
            className="text-2xl font-bold mb-3"
            style={{ color: hasBackground ? '#FFFFFF' : themeColors.text }}
          >
            {survey.thankYouScreen.title || 'Thank you!'}
          </h1>
          <p 
            className={`mb-6 ${hasBackground ? 'text-white/80' : ''}`}
            style={{ color: hasBackground ? undefined : themeColors.text, opacity: hasBackground ? undefined : 0.7 }}
          >
            {survey.thankYouScreen.message || 'Your response has been recorded.'}
          </p>
          <Button variant="outline" onClick={handleRestart}>
            Restart Preview
          </Button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  if (!currentQuestion) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
        <p className="text-gray-500">No questions to preview. Add questions in the Builder.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Dark Header Bar */}
      <div className="h-3 bg-[#1e293b]" />

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

      <div className="p-8">
        {/* Question Badge & Required */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full">
            Q{currentIndex + 1}
          </span>
          {currentQuestion.required && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Required
            </span>
          )}
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">{currentQuestion.text}</h2>

        {currentQuestion.description && (
          <p className="text-gray-500 mb-6">{currentQuestion.description}</p>
        )}

        {currentQuestion.options && (
          <div className="space-y-3 mb-8">
            {currentQuestion.options.map((option: string, idx: number) => (
              <label
                key={idx}
                className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl cursor-pointer transition-all hover:border-gray-300 hover:shadow-sm group"
              >
                {/* Radio Button */}
                <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 group-hover:border-gray-400">
                  <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-gray-200 transition-colors" />
                </div>
                
                {/* Letter Badge */}
                <span className="w-8 h-8 flex items-center justify-center text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg flex-shrink-0">
                  {OPTION_LETTERS[idx] || idx + 1}
                </span>
                
                {/* Option Text */}
                <span className="text-gray-800 font-medium">{option}</span>
              </label>
            ))}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between pt-6 border-t border-gray-100">
          <Button variant="ghost" onClick={handlePrev} className="text-gray-500 hover:text-gray-700">
            ← {currentIndex === 0 && survey.welcomeScreen.enabled ? 'Back' : 'Previous'}
          </Button>
          <Button 
            onClick={handleNext}
            className="bg-gray-600 hover:bg-gray-700 text-white"
          >
            {currentIndex === questions.length - 1 ? 'Submit' : 'Next'} →
          </Button>
        </div>
      </div>
    </div>
  );
}

