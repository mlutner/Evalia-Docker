import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, Image as ImageIcon, Palette, Type, Clock, Shield, 
  Trash2, Eye, EyeOff, Sparkles, Check, X, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useMutation } from '@tanstack/react-query';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES & INTERFACES
// ═══════════════════════════════════════════════════════════════════════════════

export interface WelcomePageSettings {
  enabled: boolean;
  // Branding
  logo: {
    url: string | null;
    position: 'left' | 'center' | 'right';
    size: 'small' | 'medium' | 'large';
  };
  // Colors
  colors: {
    primary: string;
    accent: string;
    headerBar: string; // Header bar color strip
    background: string;
    text: string;
    buttonText: string;
  };
  // Content
  title: string;
  subtitle: string;
  description: string;
  buttonText: string;
  // Survey Info
  showEstimatedTime: boolean;
  estimatedTimeMinutes: number; // auto-calculated or manual override
  customTimeText: string | null;
  showQuestionCount: boolean;
  // Privacy
  privacy: {
    enabled: boolean;
    text: string;
    linkText: string;
    linkUrl: string;
  };
  // Layout
  layout: 'centered' | 'left-aligned' | 'split';
  backgroundImage: string | null;
  backgroundOverlay: number; // 0-100 opacity
}

interface WelcomePageEditorProps {
  settings: WelcomePageSettings;
  onChange: (settings: Partial<WelcomePageSettings>) => void;
  questionCount: number;
  onPreview?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR PRESETS
// ═══════════════════════════════════════════════════════════════════════════════

const COLOR_PRESETS = [
  {
    id: 'evalia',
    name: 'Evalia',
    colors: { primary: '#2F8FA5', accent: '#A3D65C', headerBar: '#2F8FA5', background: '#FFFFFF', text: '#1e293b', buttonText: '#FFFFFF' },
  },
  {
    id: 'professional',
    name: 'Professional',
    colors: { primary: '#1e3a5f', accent: '#2563eb', headerBar: '#1e3a5f', background: '#f8fafc', text: '#1e293b', buttonText: '#FFFFFF' },
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    colors: { primary: '#8b5cf6', accent: '#c084fc', headerBar: '#8b5cf6', background: '#faf5ff', text: '#1f2937', buttonText: '#FFFFFF' },
  },
  {
    id: 'warm',
    name: 'Warm',
    colors: { primary: '#f59e0b', accent: '#ef4444', headerBar: '#f59e0b', background: '#fffbeb', text: '#451a03', buttonText: '#FFFFFF' },
  },
  {
    id: 'nature',
    name: 'Nature',
    colors: { primary: '#22c55e', accent: '#16a34a', headerBar: '#22c55e', background: '#f0fdf4', text: '#14532d', buttonText: '#FFFFFF' },
  },
  {
    id: 'dark-elegant',
    name: 'Dark Elegant',
    colors: { primary: '#6366f1', accent: '#22d3ee', headerBar: '#6366f1', background: '#0f172a', text: '#f1f5f9', buttonText: '#FFFFFF' },
  },
];

const LAYOUT_OPTIONS = [
  { id: 'centered', name: 'Centered', description: 'Content centered on page' },
  { id: 'left-aligned', name: 'Left Aligned', description: 'Content aligned to left' },
  { id: 'split', name: 'Split View', description: 'Image left, content right' },
];

const LOGO_SIZES = [
  { id: 'small', name: 'Small', height: 40 },
  { id: 'medium', name: 'Medium', height: 64 },
  { id: 'large', name: 'Large', height: 96 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULT SETTINGS
// ═══════════════════════════════════════════════════════════════════════════════

export const DEFAULT_WELCOME_SETTINGS: WelcomePageSettings = {
  enabled: true,
  logo: {
    url: null,
    position: 'center',
    size: 'medium',
  },
  colors: COLOR_PRESETS[0].colors,
  title: 'Welcome to Our Survey',
  subtitle: '',
  description: 'Your feedback helps us improve. This survey will only take a few minutes.',
  buttonText: 'Start Survey',
  showEstimatedTime: true,
  estimatedTimeMinutes: 5,
  customTimeText: null,
  showQuestionCount: false,
  privacy: {
    enabled: true,
    text: 'Your responses are confidential and will only be used for research purposes.',
    linkText: 'Privacy Policy',
    linkUrl: '',
  },
  layout: 'centered',
  backgroundImage: null,
  backgroundOverlay: 40,
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function WelcomePageEditor({ 
  settings, 
  onChange, 
  questionCount,
  onPreview 
}: WelcomePageEditorProps) {
  const [activeSection, setActiveSection] = useState<'branding' | 'colors' | 'content' | 'info' | 'privacy'>('branding');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate estimated time based on question count (about 30 seconds per question)
  const calculatedTime = Math.max(1, Math.ceil(questionCount * 0.5));

  // AI enhance description mutation
  const enhanceDescriptionMutation = useMutation({
    mutationFn: async (currentDescription: string) => {
      const response = await fetch('/api/ai/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          prompt: `Enhance this survey welcome message to be more engaging and professional: "${currentDescription}"`,
          surveyType: 'feedback'
        }),
      });
      if (!response.ok) throw new Error('Failed to enhance');
      return response.json();
    },
    onSuccess: (data) => {
      if (data.enhancedPrompt) {
        onChange({ description: data.enhancedPrompt });
      }
    },
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // FILE UPLOAD HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const handleLogoUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      onChange({ logo: { ...settings.logo, url } });
    };
    reader.readAsDataURL(file);
  }, [settings.logo, onChange]);

  const handleBackgroundUpload = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      onChange({ backgroundImage: url });
    };
    reader.readAsDataURL(file);
  }, [onChange]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, type: 'logo' | 'background') => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'logo') {
        handleLogoUpload(file);
      } else {
        handleBackgroundUpload(file);
      }
    }
  }, [handleLogoUpload, handleBackgroundUpload]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SECTION COMPONENTS
  // ─────────────────────────────────────────────────────────────────────────────

  const SectionButton = ({ 
    id, 
    icon: Icon, 
    label 
  }: { 
    id: typeof activeSection; 
    icon: React.ElementType; 
    label: string;
  }) => (
    <button
      onClick={() => setActiveSection(id)}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
        activeSection === id
          ? 'bg-purple-100 text-purple-700 shadow-sm'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Welcome Page</h2>
            <p className="text-xs text-gray-500">Customize the first impression</p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={settings.enabled}
              onCheckedChange={(enabled) => onChange({ enabled })}
            />
            <span className="text-xs text-gray-500">{settings.enabled ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex-shrink-0 border-b border-gray-200 px-4 py-2">
        <div className="flex gap-1 overflow-x-auto">
          <SectionButton id="branding" icon={ImageIcon} label="Logo" />
          <SectionButton id="colors" icon={Palette} label="Colors" />
          <SectionButton id="content" icon={Type} label="Content" />
          <SectionButton id="info" icon={Clock} label="Info" />
          <SectionButton id="privacy" icon={Shield} label="Privacy" />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {!settings.enabled ? (
          <div className="text-center py-12">
            <EyeOff size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">Welcome page is disabled</p>
            <p className="text-xs text-gray-400 mt-1">Enable it above to customize</p>
          </div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* BRANDING SECTION */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === 'branding' && (
              <div className="space-y-6">
                {/* Logo Upload */}
                <div>
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 block">
                    Company Logo
                  </Label>
                  
                  {settings.logo.url ? (
                    <div className="space-y-3">
                      <div className="relative border rounded-lg p-4 bg-gray-50">
                        <img 
                          src={settings.logo.url} 
                          alt="Logo preview" 
                          className="max-h-20 mx-auto"
                          style={{ 
                            height: LOGO_SIZES.find(s => s.id === settings.logo.size)?.height 
                          }}
                        />
                        <button
                          onClick={() => onChange({ logo: { ...settings.logo, url: null } })}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      {/* Logo Position */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Position</Label>
                        <div className="flex gap-2">
                          {['left', 'center', 'right'].map((pos) => (
                            <button
                              key={pos}
                              onClick={() => onChange({ logo: { ...settings.logo, position: pos as any } })}
                              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                                settings.logo.position === pos
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {pos.charAt(0).toUpperCase() + pos.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Logo Size */}
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">Size</Label>
                        <div className="flex gap-2">
                          {LOGO_SIZES.map((size) => (
                            <button
                              key={size.id}
                              onClick={() => onChange({ logo: { ...settings.logo, size: size.id as any } })}
                              className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                                settings.logo.size === size.id
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
                              }`}
                            >
                              {size.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, 'logo')}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragging
                          ? 'border-purple-400 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                      }`}
                    >
                      <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700">Drop logo here</p>
                      <p className="text-xs text-gray-500 mt-1">or click to browse</p>
                      <p className="text-xs text-gray-400 mt-2">PNG, JPG, SVG (max 2MB)</p>
                    </div>
                  )}
                  
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

                {/* Background Image */}
                <div className="pt-4 border-t border-gray-200">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 block">
                    Background Image (Optional)
                  </Label>
                  
                  {settings.backgroundImage ? (
                    <div className="space-y-3">
                      <div className="relative border rounded-lg overflow-hidden">
                        <img 
                          src={settings.backgroundImage} 
                          alt="Background preview" 
                          className="w-full h-24 object-cover"
                        />
                        <button
                          onClick={() => onChange({ backgroundImage: null })}
                          className="absolute top-2 right-2 p-1.5 rounded-md bg-white/90 text-red-600 hover:bg-white transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-600 mb-2 block">
                          Overlay Darkness: {settings.backgroundOverlay}%
                        </Label>
                        <Slider
                          value={[settings.backgroundOverlay]}
                          onValueChange={([value]) => onChange({ backgroundOverlay: value })}
                          max={80}
                          min={0}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => bgImageInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 transition-colors"
                    >
                      <ImageIcon size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-500">Add background image</span>
                    </button>
                  )}
                  
                  <input
                    ref={bgImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleBackgroundUpload(file);
                    }}
                  />
                </div>

                {/* Layout */}
                <div className="pt-4 border-t border-gray-200">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 block">
                    Layout
                  </Label>
                  <div className="space-y-2">
                    {LAYOUT_OPTIONS.map((layout) => (
                      <label
                        key={layout.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          settings.layout === layout.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="layout"
                          checked={settings.layout === layout.id}
                          onChange={() => onChange({ layout: layout.id as any })}
                          className="mt-0.5"
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{layout.name}</p>
                          <p className="text-xs text-gray-500">{layout.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* COLORS SECTION */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === 'colors' && (
              <div className="space-y-6">
                {/* Quick Presets */}
                <div>
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 block">
                    <Sparkles size={12} className="inline mr-1" />
                    Quick Presets
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PRESETS.map((preset) => {
                      const isSelected = 
                        settings.colors.primary === preset.colors.primary &&
                        settings.colors.accent === preset.colors.accent;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => onChange({ colors: preset.colors })}
                          className={`relative p-3 rounded-lg border-2 transition-all text-left ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {isSelected && (
                            <div className="absolute top-1 right-1">
                              <Check size={14} className="text-purple-600" />
                            </div>
                          )}
                          <div className="flex gap-1 mb-2">
                            {Object.values(preset.colors).slice(0, 4).map((color, idx) => (
                              <div
                                key={idx}
                                className="w-5 h-5 rounded-full border border-gray-200"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <p className="text-xs font-semibold text-gray-700">{preset.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="pt-4 border-t border-gray-200">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 block">
                    Custom Colors
                  </Label>
                  <div className="space-y-4">
                    <ColorInput
                      label="Primary (Button & Accent)"
                      value={settings.colors.primary}
                      onChange={(color) => onChange({ colors: { ...settings.colors, primary: color } })}
                    />
                    <ColorInput
                      label="Header Bar"
                      value={settings.colors.headerBar || settings.colors.primary}
                      onChange={(color) => onChange({ colors: { ...settings.colors, headerBar: color } })}
                    />
                    <ColorInput
                      label="Background"
                      value={settings.colors.background}
                      onChange={(color) => onChange({ colors: { ...settings.colors, background: color } })}
                    />
                    <ColorInput
                      label="Text"
                      value={settings.colors.text}
                      onChange={(color) => onChange({ colors: { ...settings.colors, text: color } })}
                    />
                    <ColorInput
                      label="Button Text"
                      value={settings.colors.buttonText}
                      onChange={(color) => onChange({ colors: { ...settings.colors, buttonText: color } })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* CONTENT SECTION */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === 'content' && (
              <div className="space-y-4">
                <div>
                  <Label className="text-xs text-gray-600 mb-1.5 block">Title</Label>
                  <Input
                    value={settings.title}
                    onChange={(e) => onChange({ title: e.target.value })}
                    placeholder="Welcome to our survey"
                    className="font-medium"
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-600 mb-1.5 block">Subtitle (Optional)</Label>
                  <Input
                    value={settings.subtitle}
                    onChange={(e) => onChange({ subtitle: e.target.value })}
                    placeholder="e.g., Employee Satisfaction Survey 2024"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs text-gray-600">Description</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs text-purple-600 hover:text-purple-700"
                      onClick={() => enhanceDescriptionMutation.mutate(settings.description)}
                      disabled={enhanceDescriptionMutation.isPending}
                    >
                      {enhanceDescriptionMutation.isPending ? (
                        <RefreshCw size={12} className="mr-1 animate-spin" />
                      ) : (
                        <Sparkles size={12} className="mr-1" />
                      )}
                      AI Enhance
                    </Button>
                  </div>
                  <Textarea
                    value={settings.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                    placeholder="Your feedback helps us improve..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label className="text-xs text-gray-600 mb-1.5 block">Button Text</Label>
                  <Input
                    value={settings.buttonText}
                    onChange={(e) => onChange({ buttonText: e.target.value })}
                    placeholder="Start Survey"
                  />
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* INFO SECTION */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === 'info' && (
              <div className="space-y-6">
                {/* Estimated Time */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <Clock size={12} className="inline mr-1" />
                      Estimated Time
                    </Label>
                    <Switch
                      checked={settings.showEstimatedTime}
                      onCheckedChange={(checked) => onChange({ showEstimatedTime: checked })}
                    />
                  </div>

                  {settings.showEstimatedTime && (
                    <div className="space-y-3 pl-1">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-xs text-blue-700">
                          <strong>Auto-calculated:</strong> {calculatedTime} minute{calculatedTime !== 1 ? 's' : ''} 
                          <span className="text-blue-500 ml-1">({questionCount} questions)</span>
                        </p>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 mb-1.5 block">
                          Override (minutes)
                        </Label>
                        <Input
                          type="number"
                          min={1}
                          max={60}
                          value={settings.estimatedTimeMinutes}
                          onChange={(e) => onChange({ estimatedTimeMinutes: parseInt(e.target.value) || calculatedTime })}
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 mb-1.5 block">
                          Custom Text (Optional)
                        </Label>
                        <Input
                          value={settings.customTimeText || ''}
                          onChange={(e) => onChange({ customTimeText: e.target.value || null })}
                          placeholder="e.g., About 5 minutes"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Leave empty for default: "Estimated time: X minutes"
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Question Count */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Show Question Count</Label>
                      <p className="text-xs text-gray-500">Display number of questions</p>
                    </div>
                    <Switch
                      checked={settings.showQuestionCount}
                      onCheckedChange={(checked) => onChange({ showQuestionCount: checked })}
                    />
                  </div>
                  {settings.showQuestionCount && (
                    <p className="text-xs text-gray-400 mt-2 pl-1">
                      Will show: "{questionCount} question{questionCount !== 1 ? 's' : ''}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════════ */}
            {/* PRIVACY SECTION */}
            {/* ═══════════════════════════════════════════════════════════════════ */}
            {activeSection === 'privacy' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Privacy Statement</Label>
                    <p className="text-xs text-gray-500">Build trust with respondents</p>
                  </div>
                  <Switch
                    checked={settings.privacy.enabled}
                    onCheckedChange={(checked) => 
                      onChange({ privacy: { ...settings.privacy, enabled: checked } })
                    }
                  />
                </div>

                {settings.privacy.enabled && (
                  <div className="space-y-4 pt-3 border-t border-gray-200">
                    <div>
                      <Label className="text-xs text-gray-600 mb-1.5 block">Privacy Text</Label>
                      <Textarea
                        value={settings.privacy.text}
                        onChange={(e) => 
                          onChange({ privacy: { ...settings.privacy, text: e.target.value } })
                        }
                        placeholder="Your responses are confidential..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600 mb-1.5 block">Link Text (Optional)</Label>
                      <Input
                        value={settings.privacy.linkText}
                        onChange={(e) => 
                          onChange({ privacy: { ...settings.privacy, linkText: e.target.value } })
                        }
                        placeholder="Privacy Policy"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600 mb-1.5 block">Link URL (Optional)</Label>
                      <Input
                        value={settings.privacy.linkUrl}
                        onChange={(e) => 
                          onChange({ privacy: { ...settings.privacy, linkUrl: e.target.value } })
                        }
                        placeholder="https://example.com/privacy"
                        type="url"
                      />
                    </div>
                  </div>
                )}

                {/* Privacy Templates */}
                <div className="pt-4 border-t border-gray-200">
                  <Label className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-3 block">
                    Quick Templates
                  </Label>
                  <div className="space-y-2">
                    {[
                      {
                        name: 'Anonymous',
                        text: 'This survey is completely anonymous. We do not collect any personally identifiable information.',
                      },
                      {
                        name: 'Confidential',
                        text: 'Your responses are confidential and will only be viewed by authorized personnel. Individual responses will not be shared.',
                      },
                      {
                        name: 'Research',
                        text: 'Your participation is voluntary. Data collected will be used for research purposes only and stored securely.',
                      },
                    ].map((template) => (
                      <button
                        key={template.name}
                        onClick={() => 
                          onChange({ 
                            privacy: { 
                              ...settings.privacy, 
                              enabled: true,
                              text: template.text 
                            } 
                          })
                        }
                        className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50/50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-700">{template.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.text}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COLOR INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <Label className="text-xs text-gray-600 mb-1.5 block">{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer p-0.5"
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 font-mono text-sm uppercase"
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// WELCOME PAGE PREVIEW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface WelcomePagePreviewProps {
  settings: WelcomePageSettings;
  questionCount: number;
  borderRadius?: number;
}

export function WelcomePagePreview({ settings, questionCount, borderRadius = 12 }: WelcomePagePreviewProps) {
  if (!settings.enabled) {
    return (
      <div className="min-h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <EyeOff size={32} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">Welcome page disabled</p>
        </div>
      </div>
    );
  }

  const calculatedTime = settings.customTimeText || 
    `Estimated time: ${settings.estimatedTimeMinutes} minute${settings.estimatedTimeMinutes !== 1 ? 's' : ''}`;

  const getLogoAlignment = () => {
    switch (settings.logo.position) {
      case 'left': return 'items-start';
      case 'right': return 'items-end';
      default: return 'items-center';
    }
  };

  const getLogoHeight = () => {
    switch (settings.logo.size) {
      case 'small': return 40;
      case 'large': return 96;
      default: return 64;
    }
  };

  return (
    <div
      className="relative shadow-xl overflow-hidden"
      style={{ 
        backgroundColor: settings.colors.background,
        borderRadius: `${borderRadius}px`,
      }}
    >
      {/* Background Image with Overlay */}
      {settings.backgroundImage && (
        <>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${settings.backgroundImage})` }}
          />
          <div 
            className="absolute inset-0"
            style={{ backgroundColor: `rgba(0,0,0,${settings.backgroundOverlay / 100})` }}
          />
        </>
      )}

      <div className={`relative z-10 min-h-[450px] p-8 flex flex-col ${getLogoAlignment()} justify-center`}>
        {/* Logo */}
        {settings.logo.url && (
          <img
            src={settings.logo.url}
            alt="Logo"
            className="mb-6"
            style={{ height: getLogoHeight(), objectFit: 'contain' }}
          />
        )}

        {/* Content */}
        <div className={`max-w-lg ${settings.layout === 'centered' ? 'text-center mx-auto' : ''}`}>
          {settings.subtitle && (
            <p 
              className="text-sm font-medium uppercase tracking-wider mb-2 opacity-70"
              style={{ color: settings.colors.text }}
            >
              {settings.subtitle}
            </p>
          )}

          <h1 
            className="text-2xl md:text-3xl font-bold mb-4"
            style={{ color: settings.colors.text }}
          >
            {settings.title || 'Welcome'}
          </h1>

          <p 
            className="text-base mb-6 opacity-80 leading-relaxed"
            style={{ color: settings.colors.text }}
          >
            {settings.description}
          </p>

          {/* Survey Info */}
          {(settings.showEstimatedTime || settings.showQuestionCount) && (
            <div 
              className={`flex gap-4 mb-6 text-sm opacity-60 ${settings.layout === 'centered' ? 'justify-center' : ''}`}
              style={{ color: settings.colors.text }}
            >
              {settings.showEstimatedTime && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />
                  {calculatedTime}
                </span>
              )}
              {settings.showQuestionCount && (
                <span>
                  {questionCount} question{questionCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          )}

          {/* Start Button */}
          <button
            className="px-8 py-3 font-semibold rounded-lg transition-all hover:opacity-90 shadow-md"
            style={{ 
              backgroundColor: settings.colors.primary,
              color: settings.colors.buttonText,
              borderRadius: `${borderRadius}px`,
            }}
          >
            {settings.buttonText || 'Start Survey'}
          </button>

          {/* Privacy Statement */}
          {settings.privacy.enabled && (
            <div 
              className="mt-8 pt-6 border-t opacity-60"
              style={{ 
                borderColor: settings.colors.text + '20',
                color: settings.colors.text 
              }}
            >
              <div className="flex items-start gap-2">
                <Shield size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs leading-relaxed">
                    {settings.privacy.text}
                  </p>
                  {settings.privacy.linkUrl && settings.privacy.linkText && (
                    <a 
                      href={settings.privacy.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium underline mt-1 inline-block hover:opacity-80"
                      style={{ color: settings.colors.primary }}
                    >
                      {settings.privacy.linkText}
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

