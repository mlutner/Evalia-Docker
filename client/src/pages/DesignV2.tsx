/**
 * DesignV2.tsx - Survey Visual Customization Page
 * 
 * Part of the Build → Design → Preview → Save flow.
 * 
 * RESPONSIBILITIES:
 * - Customize welcome screen (title, description, button, logo, privacy)
 * - Set visual theme (colors, backgrounds, headers, overlays)
 * - Configure thank you screen
 * - Preview changes in real-time across device sizes
 * 
 * DATA PERSISTENCE:
 * - All settings sync to SurveyBuilderContext
 * - Context exports via exportToEvalia() to API
 * - Stored in surveys.designSettings (JSONB) column
 * 
 * RELATED FILES:
 * - SurveyBuilderContext.tsx - State management & persistence
 * - PreviewV2.tsx - Live preview of design settings
 * - shared/schema.ts - Database schema (designSettingsSchema)
 * 
 * @module pages/DesignV2
 */

import React, { useState, useRef, useCallback } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  Monitor, Smartphone, Tablet, Upload, Image as ImageIcon, Palette, Type, Layout, 
  Sparkles, Check, Home, FileText, ThumbsUp, MessageSquare, Wand2, RefreshCw,
  Trash2, Shield, Clock, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Send, X, Grid, Layers
} from 'lucide-react';
import { SurveyBuilderProvider, useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { ProgressFlowStepper } from '@/components/builder-v2/ProgressFlowStepper';
import { 
  WelcomePagePreview,
  WelcomePageSettings,
  DEFAULT_WELCOME_SETTINGS 
} from '@/components/builder-v2/WelcomePageEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { useMutation } from '@tanstack/react-query';
import { 
  BACKGROUND_IMAGES, 
  BACKGROUND_CATEGORIES, 
  SOLID_BACKGROUNDS,
  getBackgroundsByCategory,
  type BackgroundImage 
} from '@/data/surveyBackgrounds';

export default function DesignV2() {
  const [, params] = useRoute('/design-v2/:id');
  const surveyId = params?.id;

  return (
    <SurveyBuilderProvider surveyId={surveyId}>
      <DesignContent surveyId={surveyId} />
    </SurveyBuilderProvider>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

const COLOR_PRESETS = [
  {
    id: 'evalia',
    name: 'Evalia',
    colors: { primary: '#2F8FA5', accent: '#A3D65C', background: '#FFFFFF', text: '#1e293b', buttonText: '#FFFFFF' },
  },
  {
    id: 'professional',
    name: 'Professional',
    colors: { primary: '#1e3a5f', accent: '#2563eb', background: '#f8fafc', text: '#1e293b', buttonText: '#FFFFFF' },
  },
  {
    id: 'modern-purple',
    name: 'Modern',
    colors: { primary: '#8b5cf6', accent: '#c084fc', background: '#faf5ff', text: '#1f2937', buttonText: '#FFFFFF' },
  },
  {
    id: 'warm',
    name: 'Warm',
    colors: { primary: '#f59e0b', accent: '#ef4444', background: '#fffbeb', text: '#451a03', buttonText: '#FFFFFF' },
  },
  {
    id: 'nature',
    name: 'Nature',
    colors: { primary: '#22c55e', accent: '#16a34a', background: '#f0fdf4', text: '#14532d', buttonText: '#FFFFFF' },
  },
  {
    id: 'dark-elegant',
    name: 'Dark',
    colors: { primary: '#6366f1', accent: '#22d3ee', background: '#0f172a', text: '#f1f5f9', buttonText: '#FFFFFF' },
  },
];

const LOGO_SIZES = [
  { id: 'small', name: 'S', height: 40 },
  { id: 'medium', name: 'M', height: 64 },
  { id: 'large', name: 'L', height: 96 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN DESIGN CONTENT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * DesignContent - Main component for survey visual customization
 * 
 * DATA FLOW:
 * 1. On mount: Load saved design settings from SurveyBuilderContext
 * 2. On change: Update local state → Sync to context (via setTimeout)
 * 3. On save: Context exports designSettings to API → Database
 * 
 * STATE MANAGEMENT:
 * - welcomeSettings: Content (title, description, button, privacy)
 * - designSettings: Visual styling (backgrounds, headers, overlays)
 * - Both sync to context for persistence
 * 
 * @see SurveyBuilderContext for persistence logic
 * @see PreviewV2 for how these settings are rendered
 */
function DesignContent({ surveyId }: { surveyId?: string }) {
  const { survey, questions, updateWelcomeScreen, updateThankYouScreen } = useSurveyBuilder();
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [activeScreen, setActiveScreen] = useState<'welcome' | 'survey' | 'thankyou'>('welcome');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // WELCOME PAGE SETTINGS - Content & branding (syncs to context)
  // ─────────────────────────────────────────────────────────────────────────────
  const [welcomeSettings, setWelcomeSettings] = useState<WelcomePageSettings>(() => ({
    ...DEFAULT_WELCOME_SETTINGS,
    title: survey.welcomeScreen.title || DEFAULT_WELCOME_SETTINGS.title,
    description: survey.welcomeScreen.description || DEFAULT_WELCOME_SETTINGS.description,
    buttonText: survey.welcomeScreen.buttonText || DEFAULT_WELCOME_SETTINGS.buttonText,
    enabled: survey.welcomeScreen.enabled !== false,
    showEstimatedTime: survey.welcomeScreen.showTimeEstimate ?? DEFAULT_WELCOME_SETTINGS.showEstimatedTime,
    showQuestionCount: survey.welcomeScreen.showQuestionCount ?? DEFAULT_WELCOME_SETTINGS.showQuestionCount,
    colors: survey.welcomeScreen.themeColors 
      ? { ...DEFAULT_WELCOME_SETTINGS.colors, ...survey.welcomeScreen.themeColors }
      : DEFAULT_WELCOME_SETTINGS.colors,
    logo: {
      ...DEFAULT_WELCOME_SETTINGS.logo,
      url: survey.welcomeScreen.imageUrl || null,
    },
    privacy: {
      ...DEFAULT_WELCOME_SETTINGS.privacy,
      enabled: !!survey.welcomeScreen.privacyText,
      text: survey.welcomeScreen.privacyText || DEFAULT_WELCOME_SETTINGS.privacy.text,
      linkUrl: survey.welcomeScreen.privacyLinkUrl || DEFAULT_WELCOME_SETTINGS.privacy.linkUrl,
    },
  }));

  // ─────────────────────────────────────────────────────────────────────────────
  // AI CHAT STATE
  // ─────────────────────────────────────────────────────────────────────────────
  const [aiMessage, setAiMessage] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // DESIGN SETTINGS - Visual styling for all screens
  // Loads from context on mount, syncs back on change
  // ─────────────────────────────────────────────────────────────────────────────
  const [designSettings, setDesignSettings] = useState(() => ({
    // Welcome screen
    welcomeHeaderImage: survey.welcomeScreen.headerImage || null,
    welcomeBackground: survey.welcomeScreen.backgroundImage?.url || null,
    welcomeOverlayColor: survey.welcomeScreen.backgroundImage?.overlayColor || '#000000',
    welcomeOverlayOpacity: survey.welcomeScreen.backgroundImage?.overlayOpacity ?? 40,
    // Survey screen (initially syncs with welcome)
    surveyHeaderImage: survey.welcomeScreen.headerImage || null,
    surveyBackground: survey.welcomeScreen.backgroundImage?.url || null,
    surveyOverlayColor: survey.welcomeScreen.backgroundImage?.overlayColor || '#000000',
    surveyOverlayOpacity: survey.welcomeScreen.backgroundImage?.overlayOpacity ?? 40,
    // Thank You screen
    thankYouHeaderImage: survey.thankYouScreen.headerImage || null,
    thankYouBackground: survey.thankYouScreen.backgroundImage?.url || null,
    thankYouOverlayColor: survey.thankYouScreen.backgroundImage?.overlayColor || '#000000',
    thankYouOverlayOpacity: survey.thankYouScreen.backgroundImage?.overlayOpacity ?? 40,
    // Sync toggle - when true, all screens use same design
    syncAllScreens: true,
  }));

  // ─────────────────────────────────────────────────────────────────────────────
  // UPDATE DESIGN SETTING - Updates local state + syncs to context
  // 
  // Pattern: Update local state first, then sync to context in setTimeout
  // This avoids React anti-patterns (calling context methods inside setState)
  // ─────────────────────────────────────────────────────────────────────────────
  const updateDesignSetting = useCallback((key: string, value: string | number | null) => {
    // Step 1: Update local state
    setDesignSettings(prev => {
      if (prev.syncAllScreens) {
        // When syncing, update all screens at once
        if (key.includes('HeaderImage')) {
          return { ...prev, welcomeHeaderImage: value as string | null, surveyHeaderImage: value as string | null, thankYouHeaderImage: value as string | null };
        }
        if (key.includes('Background') && !key.includes('Overlay')) {
          return { ...prev, welcomeBackground: value as string | null, surveyBackground: value as string | null, thankYouBackground: value as string | null };
        }
        if (key.includes('OverlayOpacity')) {
          return { ...prev, welcomeOverlayOpacity: value as number, surveyOverlayOpacity: value as number, thankYouOverlayOpacity: value as number };
        }
        if (key.includes('OverlayColor')) {
          return { ...prev, welcomeOverlayColor: value as string, surveyOverlayColor: value as string, thankYouOverlayColor: value as string };
        }
      }
      return { ...prev, [key]: value };
    });
    
    // Step 2: Sync to context (deferred to next tick to ensure state is updated)
    setTimeout(() => {
      setDesignSettings(currentState => {
        // Sync welcome screen to context
        if (currentState.syncAllScreens || key.startsWith('welcome')) {
          updateWelcomeScreen({ 
            headerImage: currentState.welcomeHeaderImage || undefined,
            backgroundImage: {
              url: currentState.welcomeBackground || undefined,
              overlayColor: currentState.welcomeOverlayColor,
              overlayOpacity: currentState.welcomeOverlayOpacity,
            },
          });
        }
        // Sync thank you screen to context
        if (currentState.syncAllScreens || key.startsWith('thankYou')) {
          updateThankYouScreen({ 
            headerImage: currentState.thankYouHeaderImage || undefined,
            backgroundImage: {
              url: currentState.thankYouBackground || undefined,
              overlayColor: currentState.thankYouOverlayColor,
              overlayOpacity: currentState.thankYouOverlayOpacity,
            },
          });
        }
        return currentState; // Read-only, don't change state
      });
    }, 0);
  }, [updateWelcomeScreen, updateThankYouScreen]);
  
  // Get current screen's overlay settings
  const getCurrentOverlay = () => {
    switch (activeScreen) {
      case 'welcome':
        return { color: designSettings.welcomeOverlayColor, opacity: designSettings.welcomeOverlayOpacity };
      case 'survey':
        return { color: designSettings.surveyOverlayColor, opacity: designSettings.surveyOverlayOpacity };
      case 'thankyou':
        return { color: designSettings.thankYouOverlayColor, opacity: designSettings.thankYouOverlayOpacity };
    }
  };

  // Handle welcome settings changes
  const handleWelcomeSettingsChange = (changes: Partial<WelcomePageSettings>) => {
    setWelcomeSettings(prev => {
      const updated = { ...prev, ...changes };
      // Sync ALL settings with context for persistence
      updateWelcomeScreen({
        title: updated.title,
        description: updated.description,
        buttonText: updated.buttonText,
        enabled: updated.enabled,
        showTimeEstimate: updated.showEstimatedTime,
        showQuestionCount: updated.showQuestionCount,
        themeColors: updated.colors,
        imageUrl: updated.logo?.url || undefined,
        privacyText: updated.privacy?.enabled ? updated.privacy.text : undefined,
        privacyLinkUrl: updated.privacy?.linkUrl,
      });
      return updated;
    });
  };

  // Logo upload handler
  const handleLogoUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      handleWelcomeSettingsChange({ logo: { ...welcomeSettings.logo, url } });
    };
    reader.readAsDataURL(file);
  }, [welcomeSettings.logo]);

  // AI suggestion mutation
  const aiSuggestMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          message: prompt,
          context: { 
            type: 'design',
            currentTitle: welcomeSettings.title,
            currentDescription: welcomeSettings.description,
            questionCount: questions.length
          }
        }),
      });
      if (!response.ok) throw new Error('Failed to get AI suggestion');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
      }
    },
  });

  const handleAiSend = () => {
    if (!aiMessage.trim()) return;
    aiSuggestMutation.mutate(aiMessage);
    setAiMessage('');
  };

  const getDeviceWidth = () => {
    switch (deviceView) {
      case 'mobile': return 'max-w-[375px]';
      case 'tablet': return 'max-w-[768px]';
      default: return 'max-w-[900px]';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Progress Flow Stepper */}
      <ProgressFlowStepper surveyId={surveyId} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LEFT PANEL: Configuration */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <aside className="w-[380px] flex-shrink-0 bg-white border-r border-gray-200 h-[calc(100vh-140px)] flex flex-col">
          
          {/* Screen Selector - Same as Builder */}
          <div className="flex-shrink-0 border-b border-gray-200 p-3">
            <div className="flex gap-1">
              {[
                { id: 'welcome', label: 'Welcome', icon: Home },
                { id: 'survey', label: 'Survey', icon: FileText },
                { id: 'thankyou', label: 'Thank You', icon: ThumbsUp },
              ].map((screen) => (
                <button
                  key={screen.id}
                  onClick={() => setActiveScreen(screen.id as any)}
                  className={`flex-1 flex flex-col items-center gap-1 px-2 py-2 text-xs font-medium rounded-lg transition-all ${
                    activeScreen === screen.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <screen.icon size={16} />
                  <span>{screen.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Configuration Content */}
          <div className="flex-1 overflow-y-auto">
            {activeScreen === 'welcome' && (
              <WelcomeScreenConfig
                settings={welcomeSettings}
                onChange={handleWelcomeSettingsChange}
                questionCount={questions.length}
                fileInputRef={fileInputRef}
                onLogoUpload={handleLogoUpload}
                headerImage={designSettings.welcomeHeaderImage}
                onHeaderImageChange={(img) => updateDesignSetting('welcomeHeaderImage', img)}
                background={designSettings.welcomeBackground}
                onBackgroundChange={(bg) => updateDesignSetting('welcomeBackground', bg)}
                syncEnabled={designSettings.syncAllScreens}
                onSyncChange={(sync) => setDesignSettings(prev => ({ ...prev, syncAllScreens: sync }))}
                overlayColor={designSettings.welcomeOverlayColor}
                overlayOpacity={designSettings.welcomeOverlayOpacity}
                onOverlayColorChange={(color) => updateDesignSetting('welcomeOverlayColor', color)}
                onOverlayOpacityChange={(opacity) => updateDesignSetting('welcomeOverlayOpacity', opacity)}
              />
            )}

            {activeScreen === 'survey' && (
              <SurveyScreenConfig
                settings={welcomeSettings}
                onChange={handleWelcomeSettingsChange}
                surveyBackground={designSettings.surveyBackground}
                onBackgroundChange={(bg) => updateDesignSetting('surveyBackground', bg)}
                headerImage={designSettings.surveyHeaderImage}
                onHeaderImageChange={(img) => updateDesignSetting('surveyHeaderImage', img)}
                syncEnabled={designSettings.syncAllScreens}
                onSyncChange={(sync) => setDesignSettings(prev => ({ ...prev, syncAllScreens: sync }))}
                overlayColor={designSettings.surveyOverlayColor}
                overlayOpacity={designSettings.surveyOverlayOpacity}
                onOverlayColorChange={(color) => updateDesignSetting('surveyOverlayColor', color)}
                onOverlayOpacityChange={(opacity) => updateDesignSetting('surveyOverlayOpacity', opacity)}
              />
            )}

            {activeScreen === 'thankyou' && (
              <ThankYouScreenConfig 
                survey={survey} 
                updateThankYouScreen={updateThankYouScreen}
                headerImage={designSettings.thankYouHeaderImage}
                onHeaderImageChange={(img) => updateDesignSetting('thankYouHeaderImage', img)}
                background={designSettings.thankYouBackground}
                onBackgroundChange={(bg) => updateDesignSetting('thankYouBackground', bg)}
                syncEnabled={designSettings.syncAllScreens}
                onSyncChange={(sync) => setDesignSettings(prev => ({ ...prev, syncAllScreens: sync }))}
                settings={welcomeSettings}
                overlayColor={designSettings.thankYouOverlayColor}
                overlayOpacity={designSettings.thankYouOverlayOpacity}
                onOverlayColorChange={(color) => updateDesignSetting('thankYouOverlayColor', color)}
                onOverlayOpacityChange={(opacity) => updateDesignSetting('thankYouOverlayOpacity', opacity)}
              />
            )}
          </div>
        </aside>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* CENTER PANEL: Live Preview */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <main className="flex-1 bg-gray-100 p-4 h-[calc(100vh-140px)] overflow-y-auto">
          <div className="max-w-5xl mx-auto">
            {/* Preview Controls */}
            <div className="flex items-center justify-between mb-4">
                <div>
                <h2 className="text-base font-bold text-gray-900">Live Preview</h2>
                <p className="text-xs text-gray-500">
                  {activeScreen === 'welcome' && 'Welcome Screen'}
                  {activeScreen === 'survey' && 'Survey Questions'}
                  {activeScreen === 'thankyou' && 'Thank You Screen'}
                </p>
              </div>

              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                {[
                  { id: 'desktop', icon: Monitor },
                  { id: 'tablet', icon: Tablet },
                  { id: 'mobile', icon: Smartphone },
                ].map((device) => (
                      <button
                    key={device.id}
                    onClick={() => setDeviceView(device.id as any)}
                    className={`p-2 rounded transition-colors ${
                      deviceView === device.id
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-400 hover:text-gray-900'
                    }`}
                  >
                    <device.icon size={16} />
                      </button>
                    ))}
                  </div>
                </div>

            {/* Preview Container */}
            <div className={`${getDeviceWidth()} mx-auto transition-all duration-300`}>
              {activeScreen === 'welcome' && (
                <WelcomePagePreviewEnhanced 
                  settings={welcomeSettings}
                  questionCount={questions.length}
                  headerImage={designSettings.welcomeHeaderImage}
                  backgroundImage={designSettings.welcomeBackground}
                  overlayColor={designSettings.welcomeOverlayColor}
                  overlayOpacity={designSettings.welcomeOverlayOpacity}
                />
              )}

              {activeScreen === 'survey' && (
                <SurveyBodyPreview 
                  questions={questions}
                  settings={welcomeSettings}
                  backgroundImage={designSettings.surveyBackground}
                  headerImage={designSettings.surveyHeaderImage}
                  overlayColor={designSettings.surveyOverlayColor}
                  overlayOpacity={designSettings.surveyOverlayOpacity}
                />
              )}

              {activeScreen === 'thankyou' && (
                <ThankYouPreview 
                  survey={survey} 
                  settings={welcomeSettings}
                  headerImage={designSettings.thankYouHeaderImage}
                  backgroundImage={designSettings.thankYouBackground}
                  overlayColor={designSettings.thankYouOverlayColor}
                  overlayOpacity={designSettings.thankYouOverlayOpacity}
                />
              )}
                  </div>
                </div>
        </main>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* RIGHT PANEL: AI Guidance */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        <aside className="w-[300px] flex-shrink-0 bg-white border-l border-gray-200 h-[calc(100vh-140px)] flex flex-col">
          {/* AI Header */}
          <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <Wand2 size={16} className="text-purple-600" />
              </div>
                    <div>
                <h3 className="text-sm font-bold text-gray-900">AI Design Assistant</h3>
                <p className="text-xs text-gray-500">Get suggestions & guidance</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex-shrink-0 border-b border-gray-200 p-3">
            <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
              Quick Actions
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                      <button
                onClick={() => aiSuggestMutation.mutate('Suggest a better welcome title')}
                disabled={aiSuggestMutation.isPending}
                className="p-2 text-xs font-medium text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Sparkles size={12} className="text-purple-500 mb-1" />
                Better Title
                          </button>
              <button
                onClick={() => aiSuggestMutation.mutate('Suggest an engaging description')}
                disabled={aiSuggestMutation.isPending}
                className="p-2 text-xs font-medium text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Type size={12} className="text-purple-500 mb-1" />
                Improve Description
              </button>
              <button
                onClick={() => aiSuggestMutation.mutate('Recommend color scheme for a professional survey')}
                disabled={aiSuggestMutation.isPending}
                className="p-2 text-xs font-medium text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Palette size={12} className="text-purple-500 mb-1" />
                Color Ideas
              </button>
              <button
                onClick={() => aiSuggestMutation.mutate('Review my design for best practices')}
                disabled={aiSuggestMutation.isPending}
                className="p-2 text-xs font-medium text-left rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-colors"
              >
                <Check size={12} className="text-purple-500 mb-1" />
                Review Design
              </button>
            </div>
          </div>

          {/* AI Response Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {aiSuggestMutation.isPending && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw size={14} className="animate-spin" />
                Thinking...
                          </div>
                        )}

            {aiSuggestions.length > 0 && (
              <div className="space-y-3">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Suggestions
                </Label>
                {aiSuggestions.map((suggestion, idx) => (
                            <div
                              key={idx}
                    className="p-3 bg-purple-50 rounded-lg border border-purple-100"
                  >
                    <p className="text-sm text-gray-700">{suggestion}</p>
                    <button
                      onClick={() => {
                        // Apply suggestion based on type
                        if (suggestion.length < 100) {
                          handleWelcomeSettingsChange({ title: suggestion });
                        } else {
                          handleWelcomeSettingsChange({ description: suggestion });
                        }
                      }}
                      className="mt-2 text-xs font-medium text-purple-600 hover:text-purple-700"
                    >
                      Apply this →
                      </button>
                  </div>
                    ))}
                  </div>
            )}

            {!aiSuggestMutation.isPending && aiSuggestions.length === 0 && (
              <div className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">💡 Tips</h4>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Keep welcome messages under 50 words</li>
                    <li>• Use your brand colors consistently</li>
                    <li>• Show estimated time to build trust</li>
                    <li>• Add a privacy statement</li>
                  </ul>
                    </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1">📊 Stats</h4>
                  <p className="text-xs text-gray-500">
                    Well-designed surveys have up to 30% higher completion rates.
                  </p>
                </div>
              </div>
            )}
                </div>

          {/* AI Input */}
          <div className="flex-shrink-0 border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <Input
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                placeholder="Ask AI for help..."
                className="flex-1 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
              />
              <Button
                size="sm"
                onClick={handleAiSend}
                disabled={!aiMessage.trim() || aiSuggestMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Send size={14} />
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload(file);
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WELCOME SCREEN CONFIG - 2 Column Layout
// ═══════════════════════════════════════════════════════════════════════════════

interface WelcomeConfigProps {
  settings: WelcomePageSettings;
  onChange: (changes: Partial<WelcomePageSettings>) => void;
  questionCount: number;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onLogoUpload: (file: File) => void;
  headerImage: string | null;
  onHeaderImageChange: (img: string | null) => void;
  background: string | null;
  onBackgroundChange: (bg: string | null) => void;
  syncEnabled: boolean;
  onSyncChange: (sync: boolean) => void;
  overlayColor: string;
  overlayOpacity: number;
  onOverlayColorChange: (color: string) => void;
  onOverlayOpacityChange: (opacity: number) => void;
}

function WelcomeScreenConfig({ 
  settings, 
  onChange, 
  questionCount, 
  fileInputRef, 
  onLogoUpload,
  headerImage,
  onHeaderImageChange,
  background,
  onBackgroundChange,
  syncEnabled,
  onSyncChange,
  overlayColor,
  overlayOpacity,
  onOverlayColorChange,
  onOverlayOpacityChange,
}: WelcomeConfigProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerMode, setImagePickerMode] = useState<'header' | 'background'>('header');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const openImagePicker = (mode: 'header' | 'background') => {
    setImagePickerMode(mode);
    setShowImagePicker(true);
  };

  const selectImage = (image: BackgroundImage) => {
    if (imagePickerMode === 'header') {
      onHeaderImageChange(image.url);
    } else {
      onBackgroundChange(image.url);
    }
    setShowImagePicker(false);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Enable Toggle + Sync Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <div>
          <h3 className="text-sm font-bold text-gray-900">Welcome Screen</h3>
          <p className="text-xs text-gray-500">First impression for respondents</p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(enabled) => onChange({ enabled })}
                    />
                  </div>

      {/* Sync All Screens Toggle */}
      <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-purple-600" />
          <span className="text-xs font-medium text-purple-700">Sync design across all screens</span>
                  </div>
        <Switch
          checked={syncEnabled}
          onCheckedChange={onSyncChange}
        />
                </div>

      {settings.enabled && (
        <>
          {/* Header Image Section */}
                  <div className="space-y-3">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Layers size={12} />
              Header Image
                  </Label>
            {headerImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={headerImage} alt="Header" className="w-full h-20 object-cover" />
                          <button
                  onClick={() => onHeaderImageChange(null)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X size={12} />
                          </button>
              </div>
            ) : (
              <button
                onClick={() => openImagePicker('header')}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
              >
                <ImageIcon size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Add header image</span>
              </button>
            )}
          </div>

          {/* Background Section */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Grid size={12} />
              Background
            </Label>
            {background && !background.startsWith('#') ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={background} alt="Background" className="w-full h-16 object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-xs text-white font-medium drop-shadow">Custom background</span>
                  <button
                    onClick={() => onBackgroundChange(null)}
                    className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => openImagePicker('background')}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
              >
                <ImageIcon size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Choose background</span>
              </button>
            )}
            
            {/* Solid Color Options */}
            <div className="flex gap-1 flex-wrap">
              {SOLID_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onBackgroundChange(bg.color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    background === bg.color ? 'border-purple-500 scale-110' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: bg.color }}
                  title={bg.name}
                />
                        ))}
                      </div>

            {/* Overlay Controls - Only shown when background image is selected */}
            {background && !background.startsWith('#') && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700 mb-3 block">
                  Background Overlay
                </Label>
                
                {/* Overlay Color */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-600">Color:</span>
                  <div className="flex gap-1">
                    {['#000000', '#FFFFFF', '#1e3a5f', '#8b5cf6', '#2F8FA5'].map((color) => (
                      <button
                        key={color}
                        onClick={() => onOverlayColorChange(color)}
                        className={`w-5 h-5 rounded border-2 transition-all ${
                          overlayColor === color ? 'border-purple-500 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    </div>
                </div>

                {/* Overlay Opacity Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Opacity:</span>
                    <span className="text-xs font-medium text-gray-700">{overlayOpacity}%</span>
                  </div>
                      <Slider
                    value={[overlayOpacity]}
                    onValueChange={([val]) => onOverlayOpacityChange(val)}
                        min={0}
                    max={80}
                    step={5}
                        className="w-full"
                      />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>None</span>
                    <span>Heavy</span>
                    </div>
                  </div>
                </div>
            )}
          </div>

          {/* 2-Column: Logo & Colors */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            {/* Left Column: Logo */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Logo
                  </Label>
              {settings.logo.url ? (
                <div className="relative border rounded-lg p-3 bg-gray-50">
                  <img 
                    src={settings.logo.url} 
                    alt="Logo" 
                    className="max-h-12 mx-auto object-contain"
                  />
                    <button
                    onClick={() => onChange({ logo: { ...settings.logo, url: null } })}
                    className="absolute top-1 right-1 p-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                  >
                    <Trash2 size={12} />
                    </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    const file = e.dataTransfer.files[0];
                    if (file) onLogoUpload(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-purple-400 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
                  }`}
                >
                  <Upload size={20} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">Upload</p>
                </div>
              )}
              
              {/* Logo Size */}
              <div className="flex gap-1">
                {LOGO_SIZES.map((size) => (
                    <button
                    key={size.id}
                    onClick={() => onChange({ logo: { ...settings.logo, size: size.id as any } })}
                    className={`flex-1 py-1 text-xs font-medium rounded transition-colors ${
                      settings.logo.size === size.id
                        ? 'bg-purple-100 text-purple-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                    {size.name}
                    </button>
                ))}
                  </div>
                </div>

            {/* Right Column: Colors */}
            <div className="space-y-3">
              <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Theme
                    </Label>
              <div className="grid grid-cols-3 gap-1">
                {COLOR_PRESETS.map((preset) => {
                  const isSelected = settings.colors.primary === preset.colors.primary;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => onChange({ colors: preset.colors })}
                      className={`relative p-2 rounded-lg border-2 transition-all ${
                        isSelected ? 'border-purple-500' : 'border-transparent hover:border-gray-300'
                      }`}
                      title={preset.name}
                    >
                      <div className="flex gap-0.5 justify-center">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.colors.accent }} />
                      </div>
                      {isSelected && (
                        <Check size={10} className="absolute top-0.5 right-0.5 text-purple-600" />
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Custom Primary Color */}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.colors.primary}
                  onChange={(e) => onChange({ colors: { ...settings.colors, primary: e.target.value } })}
                  className="w-8 h-8 rounded border cursor-pointer"
                />
                <Input
                  type="text"
                  value={settings.colors.primary}
                  onChange={(e) => onChange({ colors: { ...settings.colors, primary: e.target.value } })}
                  className="flex-1 font-mono text-xs h-8"
                />
              </div>
            </div>
                    </div>

          {/* Content Section */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Content
            </Label>

                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Title</Label>
                      <Input
                value={settings.title}
                onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="Welcome to our survey"
                className="h-9"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Description</Label>
                      <Textarea
                value={settings.description}
                onChange={(e) => onChange({ description: e.target.value })}
                placeholder="Your feedback helps us improve..."
                rows={2}
                className="text-sm"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600 mb-1 block">Button Text</Label>
                      <Input
                value={settings.buttonText}
                onChange={(e) => onChange({ buttonText: e.target.value })}
                        placeholder="Start Survey"
                className="h-9"
                      />
            </div>
                    </div>

          {/* Info & Privacy - Collapsible */}
          <CollapsibleSection title="Survey Info" icon={Clock}>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show estimated time</Label>
                <Switch
                  checked={settings.showEstimatedTime}
                  onCheckedChange={(checked) => onChange({ showEstimatedTime: checked })}
                />
                    </div>
              {settings.showEstimatedTime && (
                <p className="text-xs text-gray-500">
                  Auto-calculated: ~{Math.max(1, Math.ceil(questionCount * 0.5))} min ({questionCount} questions)
                </p>
              )}
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Privacy Statement" icon={Shield}>
            <div className="space-y-3">
                    <div className="flex items-center justify-between">
                <Label className="text-sm">Enable privacy notice</Label>
                      <Switch
                  checked={settings.privacy.enabled}
                  onCheckedChange={(checked) => onChange({ privacy: { ...settings.privacy, enabled: checked } })}
                      />
                    </div>
              {settings.privacy.enabled && (
                <Textarea
                  value={settings.privacy.text}
                  onChange={(e) => onChange({ privacy: { ...settings.privacy, text: e.target.value } })}
                  placeholder="Your responses are confidential..."
                  rows={2}
                  className="text-sm"
                />
              )}
            </div>
          </CollapsibleSection>
        </>
      )}

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePickerModal
          mode={imagePickerMode}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSelect={selectImage}
          onClose={() => setShowImagePicker(false)}
        />
      )}
                    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SURVEY SCREEN CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

interface SurveyConfigProps {
  settings: WelcomePageSettings;
  onChange: (changes: Partial<WelcomePageSettings>) => void;
  surveyBackground: string | null;
  onBackgroundChange: (bg: string | null) => void;
  headerImage: string | null;
  onHeaderImageChange: (img: string | null) => void;
  syncEnabled: boolean;
  onSyncChange: (sync: boolean) => void;
  overlayColor: string;
  overlayOpacity: number;
  onOverlayColorChange: (color: string) => void;
  onOverlayOpacityChange: (opacity: number) => void;
}

function SurveyScreenConfig({ 
  settings, 
  onChange, 
  surveyBackground, 
  onBackgroundChange,
  headerImage,
  onHeaderImageChange,
  syncEnabled,
  onSyncChange,
  overlayColor,
  overlayOpacity,
  onOverlayColorChange,
  onOverlayOpacityChange,
}: SurveyConfigProps) {
  const [showProgressBar, setShowProgressBar] = useState(true);
  const [showQuestionNumbers, setShowQuestionNumbers] = useState(true);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerMode, setImagePickerMode] = useState<'background' | 'header'>('background');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const openImagePicker = (mode: 'background' | 'header') => {
    setImagePickerMode(mode);
    setShowImagePicker(true);
  };

  const selectImage = (image: BackgroundImage) => {
    if (imagePickerMode === 'background') {
      onBackgroundChange(image.url);
    } else {
      onHeaderImageChange(image.url);
    }
    setShowImagePicker(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="pb-4 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-900">Survey Design</h3>
        <p className="text-xs text-gray-500">Professional survey styling</p>
      </div>

      {/* Sync All Screens Toggle */}
      <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-purple-600" />
          <span className="text-xs font-medium text-purple-700">Sync design across all screens</span>
        </div>
        <Switch
          checked={syncEnabled}
          onCheckedChange={onSyncChange}
                      />
                    </div>

      {/* Header Image Section */}
      <div className="space-y-3">
        <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Layers size={12} />
          Header Image
        </Label>
        {headerImage ? (
          <div className="relative rounded-lg overflow-hidden">
            <img src={headerImage} alt="Header" className="w-full h-20 object-cover" />
            <button
              onClick={() => onHeaderImageChange(null)}
              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <X size={12} />
            </button>
                  </div>
        ) : (
          <button
            onClick={() => openImagePicker('header')}
            className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
          >
            <ImageIcon size={16} className="text-gray-400" />
            <span className="text-sm text-gray-500">Add header image</span>
          </button>
        )}
      </div>

      {/* Background Section */}
      <div className="space-y-3 pt-4 border-t border-gray-200">
        <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
          <Grid size={12} />
          Background
                </Label>
        {surveyBackground ? (
          <div className="relative rounded-lg overflow-hidden">
            <img src={surveyBackground} alt="Background" className="w-full h-16 object-cover opacity-60" />
            <div className="absolute inset-0 flex items-center justify-between px-3">
              <span className="text-xs text-white font-medium drop-shadow">Custom background</span>
              <button
                onClick={() => onBackgroundChange(null)}
                className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
              >
                <X size={12} />
              </button>
                  </div>
          </div>
        ) : (
          <button
            onClick={() => openImagePicker('background')}
            className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
          >
            <ImageIcon size={14} className="text-gray-400" />
            <span className="text-xs text-gray-500">Choose background</span>
          </button>
        )}
        
        {/* Solid Color Options */}
        <div className="flex gap-1 flex-wrap">
          {SOLID_BACKGROUNDS.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onBackgroundChange(bg.color)}
              className={`w-6 h-6 rounded border-2 transition-all ${
                surveyBackground === bg.color ? 'border-purple-500 scale-110' : 'border-gray-200 hover:border-gray-400'
              }`}
              style={{ backgroundColor: bg.color }}
              title={bg.name}
            />
          ))}
        </div>

        {/* Overlay Controls - Only shown when background image is selected */}
        {surveyBackground && !surveyBackground.startsWith('#') && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <Label className="text-xs font-semibold text-gray-700 mb-3 block">
              Background Overlay
                </Label>

            {/* Overlay Color */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs text-gray-600">Color:</span>
              <div className="flex gap-1">
                {['#000000', '#FFFFFF', '#1e3a5f', '#8b5cf6', '#2F8FA5'].map((color) => (
                  <button
                    key={color}
                    onClick={() => onOverlayColorChange(color)}
                    className={`w-5 h-5 rounded border-2 transition-all ${
                      overlayColor === color ? 'border-purple-500 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Overlay Opacity Slider */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">Opacity:</span>
                <span className="text-xs font-medium text-gray-700">{overlayOpacity}%</span>
                  </div>
              <Slider
                value={[overlayOpacity]}
                onValueChange={([val]) => onOverlayOpacityChange(val)}
                min={0}
                max={80}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>None</span>
                <span>Heavy</span>
              </div>
            </div>
          </div>
        )}
                </div>

      {/* 2-Column: Theme & Layout */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        {/* Left: Theme Colors */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Accent Color
          </Label>
          <div className="grid grid-cols-3 gap-1">
            {COLOR_PRESETS.map((preset) => {
              const isSelected = settings.colors.primary === preset.colors.primary;
              return (
                <button
                  key={preset.id}
                  onClick={() => onChange({ colors: preset.colors })}
                  className={`relative p-2 rounded-lg border-2 transition-all ${
                    isSelected ? 'border-purple-500 bg-purple-50' : 'border-transparent hover:border-gray-300'
                  }`}
                  title={preset.name}
                >
                  <div className="flex gap-0.5 justify-center">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.colors.primary }} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Layout Options */}
        <div className="space-y-3">
          <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
            Display
          </Label>
          <div className="space-y-2">
                <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Progress bar</span>
              <Switch checked={showProgressBar} onCheckedChange={setShowProgressBar} />
                  </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Question #</span>
              <Switch checked={showQuestionNumbers} onCheckedChange={setShowQuestionNumbers} />
            </div>
          </div>
        </div>
                </div>

      {/* Question Layout */}
      <div className="pt-4 border-t border-gray-200 space-y-3">
        <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Question Layout
                  </Label>
                  <div className="space-y-2">
                    {[
            { id: 'single', label: 'One at a time', desc: 'Focus mode' },
            { id: 'scroll', label: 'Scrollable', desc: 'All visible' },
                    ].map((layout) => (
                      <label
                        key={layout.id}
              className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 cursor-pointer hover:border-purple-200 hover:bg-purple-50/30 transition-colors"
            >
              <input type="radio" name="layout" defaultChecked={layout.id === 'single'} />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{layout.label}</p>
                <p className="text-xs text-gray-500">{layout.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePickerModal
          mode={imagePickerMode}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSelect={selectImage}
          onClose={() => setShowImagePicker(false)}
        />
            )}
          </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// THANK YOU SCREEN CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

interface ThankYouConfigProps {
  survey: any;
  updateThankYouScreen: (updates: any) => void;
  headerImage: string | null;
  onHeaderImageChange: (img: string | null) => void;
  background: string | null;
  onBackgroundChange: (bg: string | null) => void;
  syncEnabled: boolean;
  onSyncChange: (sync: boolean) => void;
  settings: WelcomePageSettings;
  overlayColor: string;
  overlayOpacity: number;
  onOverlayColorChange: (color: string) => void;
  onOverlayOpacityChange: (opacity: number) => void;
}

function ThankYouScreenConfig({ 
  survey, 
  updateThankYouScreen,
  headerImage,
  onHeaderImageChange,
  background,
  onBackgroundChange,
  syncEnabled,
  onSyncChange,
  overlayColor,
  overlayOpacity,
  onOverlayColorChange,
  onOverlayOpacityChange,
  settings
}: ThankYouConfigProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [imagePickerMode, setImagePickerMode] = useState<'header' | 'background'>('header');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const openImagePicker = (mode: 'header' | 'background') => {
    setImagePickerMode(mode);
    setShowImagePicker(true);
  };

  const selectImage = (image: BackgroundImage) => {
    if (imagePickerMode === 'header') {
      onHeaderImageChange(image.url);
    } else {
      onBackgroundChange(image.url);
    }
    setShowImagePicker(false);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
          <h3 className="text-sm font-bold text-gray-900">Thank You Screen</h3>
          <p className="text-xs text-gray-500">Completion message</p>
        </div>
        <Switch
          checked={survey.thankYouScreen.enabled}
          onCheckedChange={(checked) => updateThankYouScreen({ enabled: checked })}
        />
              </div>

      {/* Sync All Screens Toggle */}
      <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg border border-purple-100">
        <div className="flex items-center gap-2">
          <Layers size={14} className="text-purple-600" />
          <span className="text-xs font-medium text-purple-700">Sync design across all screens</span>
        </div>
        <Switch
          checked={syncEnabled}
          onCheckedChange={onSyncChange}
        />
      </div>

      {survey.thankYouScreen.enabled && (
        <>
          {/* Header Image Section */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Layers size={12} />
              Header Image
            </Label>
            {headerImage ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={headerImage} alt="Header" className="w-full h-20 object-cover" />
                <button
                  onClick={() => onHeaderImageChange(null)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
                <button
                onClick={() => openImagePicker('header')}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
              >
                <ImageIcon size={16} className="text-gray-400" />
                <span className="text-sm text-gray-500">Add header image</span>
                </button>
            )}
          </div>

          {/* Background Section */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
              <Grid size={12} />
              Background
            </Label>
            {background && !background.startsWith('#') ? (
              <div className="relative rounded-lg overflow-hidden">
                <img src={background} alt="Background" className="w-full h-16 object-cover opacity-60" />
                <div className="absolute inset-0 flex items-center justify-between px-3">
                  <span className="text-xs text-white font-medium drop-shadow">Custom background</span>
                <button
                    onClick={() => onBackgroundChange(null)}
                    className="p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X size={12} />
                </button>
              </div>
            </div>
            ) : (
              <button
                onClick={() => openImagePicker('background')}
                className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50/30 transition-colors"
              >
                <ImageIcon size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">Choose background</span>
              </button>
            )}
            
            {/* Solid Color Options */}
            <div className="flex gap-1 flex-wrap">
              {SOLID_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => onBackgroundChange(bg.color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    background === bg.color ? 'border-purple-500 scale-110' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: bg.color }}
                  title={bg.name}
                />
              ))}
            </div>

            {/* Overlay Controls - Only shown when background image is selected */}
            {background && !background.startsWith('#') && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Label className="text-xs font-semibold text-gray-700 mb-3 block">
                  Background Overlay
                </Label>
                
                {/* Overlay Color */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-gray-600">Color:</span>
                  <div className="flex gap-1">
                    {['#000000', '#FFFFFF', '#1e3a5f', '#8b5cf6', '#2F8FA5'].map((color) => (
                      <button
                        key={color}
                        onClick={() => onOverlayColorChange(color)}
                        className={`w-5 h-5 rounded border-2 transition-all ${
                          overlayColor === color ? 'border-purple-500 scale-110' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Overlay Opacity Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-600">Opacity:</span>
                    <span className="text-xs font-medium text-gray-700">{overlayOpacity}%</span>
                  </div>
                  <Slider
                    value={[overlayOpacity]}
                    onValueChange={([val]) => onOverlayOpacityChange(val)}
                    min={0}
                    max={80}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>None</span>
                    <span>Heavy</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
              Content
            </Label>
            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Title</Label>
              <Input
                value={survey.thankYouScreen.title}
                onChange={(e) => updateThankYouScreen({ title: e.target.value })}
                placeholder="Thank you!"
                className="h-9"
              />
            </div>

            <div>
              <Label className="text-xs text-gray-600 mb-1 block">Message</Label>
              <Textarea
                value={survey.thankYouScreen.message}
                onChange={(e) => updateThankYouScreen({ message: e.target.value })}
                placeholder="Your response has been recorded."
                rows={3}
              />
            </div>
          </div>

          <CollapsibleSection title="After Completion" icon={Check}>
            <div className="space-y-2">
              {[
                { id: 'message', label: 'Show message' },
                { id: 'redirect', label: 'Redirect to URL' },
              ].map((option) => (
                <label key={option.id} className="flex items-center gap-2 text-sm">
                  <input type="radio" name="afterCompletion" defaultChecked={option.id === 'message'} />
                  {option.label}
                </label>
              ))}
            </div>
          </CollapsibleSection>
        </>
      )}

      {/* Image Picker Modal */}
      {showImagePicker && (
        <ImagePickerModal
          mode={imagePickerMode}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onSelect={selectImage}
          onClose={() => setShowImagePicker(false)}
        />
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPER COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children 
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
      <div className="flex items-center gap-2">
          <Icon size={14} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{title}</span>
      </div>
        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {isOpen && <div className="p-3 border-t border-gray-200">{children}</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PREVIEW COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

interface SurveyBodyPreviewProps {
  questions: any[];
  settings: WelcomePageSettings;
  backgroundImage: string | null;
  headerImage: string | null;
  overlayColor?: string;
  overlayOpacity?: number;
}

function SurveyBodyPreview({ 
  questions, 
  settings, 
  backgroundImage, 
  headerImage,
  overlayColor = '#000000',
  overlayOpacity = 40,
}: SurveyBodyPreviewProps) {
  const firstQuestion = questions[0];
  const isImageBackground = backgroundImage && !backgroundImage.startsWith('#');
  const isSolidBackground = backgroundImage && backgroundImage.startsWith('#');
  const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  return (
    <div className="shadow-2xl overflow-hidden rounded-2xl relative">
      {/* Background Layer */}
      {isImageBackground && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div 
            className="absolute inset-0"
      style={{ 
              backgroundColor: overlayColor,
              opacity: overlayOpacity / 100,
            }}
          />
        </>
      )}

      <div 
        className="relative z-10 flex flex-col min-h-[500px]"
        style={{ 
          backgroundColor: isSolidBackground ? backgroundImage : (isImageBackground ? 'transparent' : '#FFFFFF')
        }}
      >
        {/* Dark Header Bar */}
        <div className="h-3 bg-[#1e293b]" />

        {/* Header Image */}
        {headerImage && (
          <div className="relative h-24 overflow-hidden">
            <img 
              src={headerImage} 
              alt="Survey header" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Survey Content */}
        <div className="flex-1 px-8 py-6">
          {firstQuestion ? (
            <>
              {/* Question Number & Required Badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center px-3 py-1 text-sm font-semibold text-gray-700 bg-gray-100 rounded-full">
                  Q1
                </span>
                {firstQuestion.required && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-full">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Required
                  </span>
                )}
              </div>

              {/* Question Text */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {firstQuestion.text}
              </h2>
              
              {/* Description */}
              {firstQuestion.description && (
                <p className="text-gray-500 mb-6">
                  {firstQuestion.description}
                </p>
              )}
              
              {/* Options */}
              {firstQuestion.options ? (
                <div className="space-y-3 mt-6">
                  {firstQuestion.options.map((option: string, idx: number) => (
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
              ) : (
                <input
                  type="text"
                  placeholder="Type your answer here..."
                  className="w-full p-4 mt-6 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                />
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <FileText size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-medium">No questions added yet</p>
              <p className="text-sm mt-1">Go to the Builder to add questions</p>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 mt-auto">
          <div className="flex items-center justify-between">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors">
              <ChevronLeft size={16} />
              Back
            </button>
        <button
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ThankYouPreviewProps {
  survey: any;
  settings: WelcomePageSettings;
  headerImage?: string | null;
  backgroundImage?: string | null;
  overlayColor?: string;
  overlayOpacity?: number;
}

function ThankYouPreview({ 
  survey, 
  settings, 
  headerImage, 
  backgroundImage,
  overlayColor = '#000000',
  overlayOpacity = 40,
}: ThankYouPreviewProps) {
  const isImageBackground = backgroundImage && !backgroundImage.startsWith('#');
  const isSolidBackground = backgroundImage && backgroundImage.startsWith('#');

  return (
    <div className="shadow-2xl overflow-hidden rounded-2xl relative">
      {/* Background Layer */}
      {isImageBackground && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div 
            className="absolute inset-0"
      style={{ 
              backgroundColor: overlayColor,
              opacity: overlayOpacity / 100,
            }}
          />
        </>
      )}

      <div
        className="relative z-10"
        style={{ 
          backgroundColor: isSolidBackground ? backgroundImage : (isImageBackground ? 'transparent' : settings.colors.background)
        }}
      >
        {/* Header Image */}
        {headerImage && (
          <div className="relative h-32 overflow-hidden">
            <img 
              src={headerImage} 
              alt="Thank you header" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        </div>
      )}

        <div className={`p-8 text-center min-h-[300px] flex flex-col items-center justify-center ${isImageBackground ? 'text-white' : ''}`}>
          <div 
            className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${isImageBackground ? 'bg-white/20' : ''}`}
            style={{ backgroundColor: isImageBackground ? undefined : settings.colors.primary + '20' }}
          >
            <Check size={32} style={{ color: isImageBackground ? '#FFFFFF' : settings.colors.primary }} />
              </div>
          <h1 
            className="text-2xl font-bold mb-3" 
            style={{ color: isImageBackground ? '#FFFFFF' : settings.colors.text }}
          >
            {survey.thankYouScreen.title || 'Thank you!'}
          </h1>
          <p 
            className={`max-w-md ${isImageBackground ? 'text-white/70' : 'opacity-70'}`}
            style={{ color: isImageBackground ? undefined : settings.colors.text }}
          >
            {survey.thankYouScreen.message || 'Your response has been recorded.'}
          </p>
        </div>

        {/* Footer */}
        <div className={`px-8 py-4 text-center border-t ${isImageBackground ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
          <p className={`text-xs ${isImageBackground ? 'text-white/50' : 'text-gray-400'}`}>
            Powered by Evalia • Your data is secure
          </p>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WELCOME PAGE PREVIEW ENHANCED (with header/background support)
// ═══════════════════════════════════════════════════════════════════════════════

interface WelcomePagePreviewEnhancedProps {
  settings: WelcomePageSettings;
  questionCount: number;
  headerImage?: string | null;
  backgroundImage?: string | null;
  overlayColor?: string;
  overlayOpacity?: number;
}

function WelcomePagePreviewEnhanced({ 
  settings, 
  questionCount, 
  headerImage, 
  backgroundImage,
  overlayColor = '#000000',
  overlayOpacity = 40,
}: WelcomePagePreviewEnhancedProps) {
  const isImageBackground = backgroundImage && !backgroundImage.startsWith('#');
  const isSolidBackground = backgroundImage && backgroundImage.startsWith('#');
  const estimatedTime = Math.max(1, Math.ceil(questionCount * 0.5));

  return (
    <div className="shadow-2xl overflow-hidden rounded-2xl relative">
      {/* Background Layer */}
      {isImageBackground && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
          <div 
            className="absolute inset-0"
                    style={{ 
              backgroundColor: overlayColor,
              opacity: overlayOpacity / 100,
            }}
          />
        </>
      )}

      <div
        className="relative z-10"
        style={{ 
          backgroundColor: isSolidBackground ? backgroundImage : (isImageBackground ? 'transparent' : settings.colors.background)
        }}
      >
        {/* Header Image */}
        {headerImage && (
          <div className="relative h-40 overflow-hidden">
            <img 
              src={headerImage} 
              alt="Welcome header" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40" />
              </div>
            )}

        {/* Logo */}
        {settings.logo.url && (
          <div className={`flex justify-${settings.logo.position} px-8 ${headerImage ? '-mt-8 relative z-10' : 'pt-8'}`}>
            <img 
              src={settings.logo.url} 
              alt="Logo"
              className={`object-contain ${headerImage ? 'bg-white/90 p-2 rounded-lg shadow-lg' : ''}`}
                style={{ 
                height: settings.logo.size === 'small' ? 40 : settings.logo.size === 'medium' ? 64 : 96 
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className={`p-8 text-center ${headerImage && settings.logo.url ? 'pt-4' : ''} ${isImageBackground ? 'text-white' : ''}`}>
          <h1 
            className="text-3xl font-bold mb-4"
            style={{ color: isImageBackground ? '#FFFFFF' : settings.colors.text }}
          >
            {settings.title}
          </h1>
          
          {settings.description && (
            <p 
              className={`max-w-md mx-auto mb-6 ${isImageBackground ? 'text-white/80' : 'opacity-70'}`}
              style={{ color: isImageBackground ? undefined : settings.colors.text }}
            >
              {settings.description}
            </p>
          )}

          {/* Survey Info */}
          {settings.showEstimatedTime && (
            <div className={`flex items-center justify-center gap-4 mb-6 text-sm ${isImageBackground ? 'text-white/70' : 'text-gray-500'}`}>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                ~{estimatedTime} min
              </span>
              {settings.showQuestionCount && (
                <span className="flex items-center gap-1">
                  <FileText size={14} />
                  {questionCount} questions
                </span>
              )}
            </div>
          )}

          {/* Start Button */}
              <button
            className="px-8 py-3 font-semibold text-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]"
            style={{ backgroundColor: settings.colors.primary }}
          >
            {settings.buttonText}
              </button>

          {/* Privacy Statement */}
          {settings.privacy.enabled && settings.privacy.text && (
            <p className={`mt-6 text-xs max-w-sm mx-auto ${isImageBackground ? 'text-white/50' : 'text-gray-400'}`}>
              {settings.privacy.text}
              {settings.privacy.linkUrl && (
                <a 
                  href={settings.privacy.linkUrl} 
                  className={`ml-1 underline ${isImageBackground ? 'text-white/70 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  {settings.privacy.linkText || 'Privacy Policy'}
                </a>
              )}
            </p>
          )}
            </div>

        {/* Footer */}
        <div className={`px-8 py-4 text-center border-t ${isImageBackground ? 'border-white/10 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
          <p className={`text-xs ${isImageBackground ? 'text-white/50' : 'text-gray-400'}`}>
            Powered by Evalia • Your data is secure
          </p>
          </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// IMAGE PICKER MODAL
// ═══════════════════════════════════════════════════════════════════════════════

interface ImagePickerModalProps {
  mode: 'header' | 'background';
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onSelect: (image: BackgroundImage) => void;
  onClose: () => void;
}

function ImagePickerModal({ mode, selectedCategory, onCategoryChange, onSelect, onClose }: ImagePickerModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-gray-900">
            Choose {mode === 'background' ? 'Background' : 'Header'} Image
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>
        
        {/* Category Tabs */}
        <div className="flex gap-1 p-3 border-b overflow-x-auto">
          {BACKGROUND_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-purple-100 text-purple-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-3 gap-3">
            {getBackgroundsByCategory(selectedCategory).map((image) => (
              <button
                key={image.id}
                onClick={() => onSelect(image)}
                className="relative group rounded-lg overflow-hidden aspect-video hover:ring-2 hover:ring-purple-500 transition-all"
              >
                <img
                  src={image.thumbnailUrl}
                  alt={image.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                  <p className="text-xs text-white font-medium truncate">{image.name}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
