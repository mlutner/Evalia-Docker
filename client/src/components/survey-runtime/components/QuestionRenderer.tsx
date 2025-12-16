/**
 * QuestionRenderer - Unified Survey Runtime Question Rendering
 *
 * Single question rendering component used across:
 * - Builder Design mode (preview)
 * - Preview/Share
 * - Runtime (SurveyView)
 *
 * Uses CSS custom properties from SurveyThemeProvider for theming.
 * All question types are supported with consistent styling.
 *
 * @see docs/tickets/SRT-002-unified-question-renderer.md
 */

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star, Heart, AlertTriangle } from 'lucide-react';
import type { Question, QuestionType } from '@shared/schema';
import { useSurveyThemeContext } from '../SurveyThemeProvider';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type SurveyQuestionMode = 'preview' | 'runtime' | 'readonly';

export interface QuestionRendererProps {
  question: Question;
  mode?: SurveyQuestionMode;
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  /** Callback when user completes a single-select question (for auto-advance) */
  onAutoAdvance?: () => void;
  /** Show question type label above question */
  showTypeLabel?: boolean;
  /** Show question description below title */
  showDescription?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function QuestionRenderer({
  question,
  mode = 'runtime',
  value,
  onChange,
  disabled = false,
  onAutoAdvance,
  showTypeLabel = false,
  showDescription = true,
}: QuestionRendererProps) {
  const { theme } = useSurveyThemeContext();
  const isInteractive = !disabled && mode !== 'readonly';

  // Defensive defaults to avoid crashing on malformed data
  const safeQuestion: Question = useMemo(() => ({
    ...question,
    options: question.options || [],
    rowLabels: question.rowLabels || [],
    colLabels: question.colLabels || [],
    ratingScale: question.ratingScale ?? question.likertPoints ?? 5,
    ratingStyle: question.ratingStyle || 'number',
  }), [question]);

  // Determine effective value (use empty default based on question type)
  const effectiveValue = value ?? getDefaultValue(safeQuestion.type);

  // Handle value changes
  const handleChange = (newValue: unknown) => {
    if (isInteractive && onChange) {
      onChange(newValue);
    }
  };

  // Route to specific renderer based on question type
  const rendererProps: RendererProps = {
    question: safeQuestion,
    mode,
    value: effectiveValue,
    onChange: handleChange,
    disabled,
    readOnly: mode === 'readonly',
    theme,
    onAutoAdvance: isInteractive ? onAutoAdvance : undefined,
  };

  return (
    <div
      className="survey-question"
      data-question-id={safeQuestion.id}
      data-question-type={safeQuestion.type}
      style={{
        fontFamily: theme.fontFamily,
      }}
    >
      {showTypeLabel && (
        <p
          className="survey-question-type-label"
          style={{
            fontSize: '12px',
            fontWeight: 500,
            color: theme.mutedTextColor,
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {getQuestionTypeLabel(safeQuestion.type)}
        </p>
      )}
      {renderQuestionByType(safeQuestion.type, rendererProps)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTERNAL RENDERER PROPS
// ═══════════════════════════════════════════════════════════════════════════════

interface RendererProps {
  question: Question;
  mode: SurveyQuestionMode;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  readOnly: boolean;
  theme: ReturnType<typeof useSurveyThemeContext>['theme'];
  onAutoAdvance?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION TYPE ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

function renderQuestionByType(type: QuestionType, props: RendererProps): React.ReactNode {
  switch (type) {
    // Text inputs
    case 'text':
      return <TextRenderer {...props} inputType="text" />;
    case 'email':
      return <TextRenderer {...props} inputType="email" />;
    case 'phone':
      return <TextRenderer {...props} inputType="tel" />;
    case 'url':
      return <TextRenderer {...props} inputType="url" />;
    case 'number':
      return <TextRenderer {...props} inputType="number" />;
    case 'textarea':
      return <TextareaRenderer {...props} />;

    // Selection
    case 'multiple_choice':
      return <MultipleChoiceRenderer {...props} />;
    case 'checkbox':
      return <CheckboxRenderer {...props} />;
    case 'dropdown':
      return <DropdownRenderer {...props} />;
    case 'yes_no':
      return <YesNoRenderer {...props} />;

    // Rating & scales
    case 'rating':
      return <RatingRenderer {...props} />;
    case 'nps':
      return <NPSRenderer {...props} />;
    case 'likert':
      return <LikertRenderer {...props} />;
    case 'opinion_scale':
      return <OpinionScaleRenderer {...props} />;
    case 'slider':
      return <SliderRenderer {...props} />;

    // Advanced
    case 'matrix':
      return <MatrixRenderer {...props} />;
    case 'ranking':
      return <RankingRenderer {...props} />;
    case 'constant_sum':
      return <ConstantSumRenderer {...props} />;

    // Date & time
    case 'date':
      return <DateRenderer {...props} />;
    case 'time':
      return <TimeRenderer {...props} />;
    case 'datetime':
      return <DateTimeRenderer {...props} />;

    // Media
    case 'image_choice':
      return <ImageChoiceRenderer {...props} />;
    case 'file_upload':
      return <FileUploadRenderer {...props} />;
    case 'signature':
      return <SignatureRenderer {...props} />;
    case 'video':
      return <VideoRenderer {...props} />;
    case 'audio_capture':
      return <AudioCaptureRenderer {...props} />;

    // Structural
    case 'section':
      return <SectionRenderer {...props} />;
    case 'statement':
      return <StatementRenderer {...props} />;
    case 'legal':
      return <LegalRenderer {...props} />;

    // Fallback for unknown/unimplemented types
    default:
      return <UnknownQuestionFallback question={props.question} theme={props.theme} />;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT INPUTS
// ═══════════════════════════════════════════════════════════════════════════════

interface TextRendererProps extends RendererProps {
  inputType: 'text' | 'email' | 'tel' | 'url' | 'number';
}

function TextRenderer({ question, value, onChange, disabled, readOnly, inputType, theme }: TextRendererProps) {
  const placeholders: Record<string, string> = {
    text: 'Type your answer here...',
    email: 'your@email.com',
    tel: 'Enter phone number...',
    url: 'https://example.com',
    number: 'Enter a number...',
  };

  return (
    <div className="space-y-2">
      <Input
        type={inputType}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || placeholders[inputType]}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base transition-colors"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          borderColor: theme.mutedTextColor + '40',
          backgroundColor: theme.cardBackground,
          color: theme.textColor,
        }}
      />
      {question.description && (
        <p style={{ fontSize: '12px', color: theme.mutedTextColor }}>{question.description}</p>
      )}
    </div>
  );
}

function TextareaRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || 'Type your detailed answer here...'}
        disabled={disabled}
        readOnly={readOnly}
        rows={question.rows || 4}
        className="text-base transition-colors min-h-[120px]"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          borderColor: theme.mutedTextColor + '40',
          backgroundColor: theme.cardBackground,
          color: theme.textColor,
        }}
      />
      {question.description && (
        <p style={{ fontSize: '12px', color: theme.mutedTextColor }}>{question.description}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function MultipleChoiceRenderer({ question, value, onChange, disabled, readOnly, theme, onAutoAdvance }: RendererProps) {
  const selectedValue = value as string;
  const options = question.options || [];

  const handleSelect = (option: string) => {
    if (disabled || readOnly) return;
    onChange(option);
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 300);
    }
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isSelected = selectedValue === option;
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleSelect(option)}
            disabled={disabled}
            className="w-full flex items-center gap-4 transition-all text-left"
            style={{
              padding: '14px 16px',
              minHeight: '52px',
              borderRadius: 'var(--survey-option-radius, 12px)',
              border: `2px solid ${isSelected ? theme.primaryColor : theme.mutedTextColor + '30'}`,
              backgroundColor: isSelected ? theme.primaryColor + '10' : theme.cardBackground,
              cursor: disabled || readOnly ? 'default' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                border: `2px solid ${isSelected ? theme.primaryColor : theme.mutedTextColor + '60'}`,
              }}
            >
              {isSelected && (
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: theme.primaryColor }}
                />
              )}
            </div>
            <span style={{ color: theme.textColor, fontSize: '15px', fontWeight: 500, lineHeight: '1.4' }}>
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CheckboxRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  const selectedValues = Array.isArray(value) ? (value as string[]) : [];
  const options = question.options || [];

  const handleToggle = (option: string) => {
    if (disabled || readOnly) return;
    const newValues = selectedValues.includes(option)
      ? selectedValues.filter((v) => v !== option)
      : [...selectedValues, option];
    onChange(newValues);
  };

  return (
    <div className="space-y-3">
      {options.map((option, index) => {
        const isChecked = selectedValues.includes(option);
        return (
          <button
            key={index}
            type="button"
            onClick={() => handleToggle(option)}
            disabled={disabled}
            className="w-full flex items-center gap-4 transition-all text-left"
            style={{
              padding: '14px 16px',
              minHeight: '52px',
              borderRadius: 'var(--survey-option-radius, 12px)',
              border: `2px solid ${isChecked ? theme.primaryColor : theme.mutedTextColor + '30'}`,
              backgroundColor: isChecked ? theme.primaryColor + '10' : theme.cardBackground,
              cursor: disabled || readOnly ? 'default' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <Checkbox
              checked={isChecked}
              disabled={disabled}
              className="w-5 h-5"
              style={{
                borderColor: isChecked ? theme.primaryColor : theme.mutedTextColor + '60',
              }}
            />
            <span style={{ color: theme.textColor, fontSize: '15px', fontWeight: 500, lineHeight: '1.4' }}>
              {option}
            </span>
          </button>
        );
      })}
      <p style={{ fontSize: '13px', color: theme.mutedTextColor }}>
        Select one or more options
      </p>
    </div>
  );
}

function DropdownRenderer({ question, value, onChange, disabled, readOnly, theme, onAutoAdvance }: RendererProps) {
  const selectedValue = (value as string) || '';
  const options = question.options || [];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
    if (e.target.value && onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 300);
    }
  };

  return (
    <div className="space-y-2">
      <select
        value={selectedValue}
        onChange={handleChange}
        disabled={disabled}
        className="w-full h-12 px-4 text-base transition-colors focus:outline-none"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          border: `2px solid ${theme.mutedTextColor}30`,
          backgroundColor: theme.cardBackground,
          color: selectedValue ? theme.textColor : theme.mutedTextColor,
          cursor: disabled || readOnly ? 'default' : 'pointer',
        }}
      >
        <option value="">{question.placeholder || 'Select an option...'}</option>
        {options.map((option, idx) => (
          <option key={idx} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

function YesNoRenderer({ question, value, onChange, disabled, readOnly, theme, onAutoAdvance }: RendererProps) {
  const selectedValue = value as string;
  const yesLabel = question.yesLabel || 'Yes';
  const noLabel = question.noLabel || 'No';

  const handleSelect = (val: string) => {
    if (disabled || readOnly) return;
    onChange(val);
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 300);
    }
  };

  // Green for Yes, Red for No
  const yesColor = '#10B981';
  const noColor = '#EF4444';

  return (
    <div className="flex gap-4 justify-center">
      <button
        type="button"
        onClick={() => handleSelect(yesLabel)}
        disabled={disabled}
        className="flex-1 max-w-[200px] p-4 transition-all font-semibold"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          border: `2px solid ${selectedValue === yesLabel ? yesColor : theme.mutedTextColor + '30'}`,
          backgroundColor: selectedValue === yesLabel ? yesColor + '15' : theme.cardBackground,
          color: selectedValue === yesLabel ? yesColor : theme.textColor,
          cursor: disabled || readOnly ? 'default' : 'pointer',
        }}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => handleSelect(noLabel)}
        disabled={disabled}
        className="flex-1 max-w-[200px] p-4 transition-all font-semibold"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          border: `2px solid ${selectedValue === noLabel ? noColor : theme.mutedTextColor + '30'}`,
          backgroundColor: selectedValue === noLabel ? noColor + '15' : theme.cardBackground,
          color: selectedValue === noLabel ? noColor : theme.textColor,
          cursor: disabled || readOnly ? 'default' : 'pointer',
        }}
      >
        {noLabel}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATING & SCALES
// ═══════════════════════════════════════════════════════════════════════════════

function RatingRenderer({ question, value, onChange, disabled, readOnly, theme, onAutoAdvance }: RendererProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);
  const selectedValue = value ? parseInt(value as string, 10) : null;
  const scale = question.ratingScale || 5;
  const style = question.ratingStyle || 'number';
  const lowLabel = question.ratingLabels?.low || '';
  const highLabel = question.ratingLabels?.high || '';

  const handleSelect = (val: number) => {
    if (disabled || readOnly) return;
    onChange(val.toString());
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 300);
    }
  };

  // Star/Heart rating
  if (style === 'star' || style === 'heart') {
    const IconComponent = style === 'heart' ? Heart : Star;
    const fillColor = style === 'heart' ? '#EF4444' : '#F59E0B';
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: scale }, (_, i) => i + 1).map((num) => {
            const isSelected = selectedValue !== null && num <= selectedValue;
            const isHovered = hoverValue !== null && num <= hoverValue;
            return (
              <button
                key={num}
                type="button"
                onClick={() => handleSelect(num)}
                onMouseEnter={() => !disabled && !readOnly && setHoverValue(num)}
                onMouseLeave={() => setHoverValue(null)}
                disabled={disabled}
                className="p-1 transition-transform hover:scale-110"
                style={{ cursor: disabled || readOnly ? 'default' : 'pointer' }}
              >
                <IconComponent
                  size={32}
                  fill={isSelected || isHovered ? fillColor : 'transparent'}
                  stroke={isSelected || isHovered ? fillColor : theme.mutedTextColor}
                  strokeWidth={2}
                />
              </button>
            );
          })}
        </div>
        {(lowLabel || highLabel) && (
          <div className="flex justify-between text-xs" style={{ color: theme.mutedTextColor }}>
            <span>{lowLabel}</span>
            <span>{highLabel}</span>
          </div>
        )}
      </div>
    );
  }

  // Number rating (default)
  return (
    <div className="space-y-4">
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-xs" style={{ color: theme.mutedTextColor }}>
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(scale, 10)}, 1fr)` }}
      >
        {Array.from({ length: scale }, (_, i) => i + 1).map((num) => {
          const isSelected = selectedValue === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => handleSelect(num)}
              disabled={disabled}
              className="h-12 font-semibold transition-all"
              style={{
                borderRadius: 'var(--survey-option-radius, 8px)',
                border: `2px solid ${isSelected ? theme.primaryColor : theme.mutedTextColor + '40'}`,
                backgroundColor: isSelected ? theme.primaryColor + '10' : theme.cardBackground,
                color: theme.primaryColor,
                cursor: disabled || readOnly ? 'default' : 'pointer',
              }}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function NPSRenderer({ question, value, onChange, disabled, readOnly, theme, onAutoAdvance }: RendererProps) {
  const selectedValue = value !== undefined && value !== null ? parseInt(value as string, 10) : null;
  const detractorLabel = question.npsLabels?.detractor || 'Not likely';
  const promoterLabel = question.npsLabels?.promoter || 'Extremely likely';

  const handleSelect = (val: number) => {
    if (disabled || readOnly) return;
    onChange(val.toString());
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 300);
    }
  };

  const getZoneColor = (num: number) => {
    if (num <= 6) return { border: '#EF4444', bg: '#FEF2F2', text: '#DC2626' }; // Detractor
    if (num <= 8) return { border: '#F59E0B', bg: '#FFFBEB', text: '#D97706' }; // Passive
    return { border: '#10B981', bg: '#ECFDF5', text: '#059669' }; // Promoter
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center gap-1">
        {Array.from({ length: 11 }, (_, i) => i).map((num) => {
          const isSelected = selectedValue === num;
          const colors = getZoneColor(num);
          return (
            <button
              key={num}
              type="button"
              onClick={() => handleSelect(num)}
              disabled={disabled}
              className="w-9 h-9 font-semibold text-sm transition-all"
              style={{
                borderRadius: '8px',
                border: `2px solid ${isSelected ? colors.border : theme.mutedTextColor + '30'}`,
                backgroundColor: isSelected ? colors.bg : theme.cardBackground,
                color: isSelected ? colors.text : theme.mutedTextColor,
                cursor: disabled || readOnly ? 'default' : 'pointer',
              }}
            >
              {num}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs">
        <span style={{ color: '#DC2626' }}>{detractorLabel}</span>
        <span style={{ color: '#059669' }}>{promoterLabel}</span>
      </div>
    </div>
  );
}

function LikertRenderer({ question, value, onChange, disabled, readOnly, theme, onAutoAdvance }: RendererProps) {
  const selectedValue = value ? parseInt(value as string, 10) : null;
  const points = question.likertPoints || 5;
  const likertType = question.likertType || 'agreement';

  const defaultLabels: Record<string, string[]> = {
    agreement: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
    frequency: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    importance: ['Not Important', 'Slightly', 'Moderately', 'Very', 'Extremely'],
    satisfaction: ['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied'],
    quality: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent'],
  };

  const labels = question.customLabels || defaultLabels[likertType] || defaultLabels.agreement;

  const handleSelect = (val: number) => {
    if (disabled || readOnly) return;
    onChange(val.toString());
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 300);
    }
  };

  return (
    <div className="space-y-3">
      {Array.from({ length: points }, (_, idx) => {
        const isSelected = selectedValue === idx + 1;
        const label = labels[idx] || `${idx + 1}`;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelect(idx + 1)}
            disabled={disabled}
            className="w-full flex items-center gap-4 transition-all text-left"
            style={{
              padding: '14px 16px',
              minHeight: '52px',
              borderRadius: 'var(--survey-option-radius, 12px)',
              border: `2px solid ${isSelected ? theme.primaryColor : theme.mutedTextColor + '30'}`,
              backgroundColor: isSelected ? theme.primaryColor + '10' : theme.cardBackground,
              cursor: disabled || readOnly ? 'default' : 'pointer',
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                border: `2px solid ${isSelected ? theme.primaryColor : theme.mutedTextColor + '60'}`,
              }}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
              )}
            </div>
            <span style={{ color: theme.textColor, fontSize: '15px', fontWeight: 500, lineHeight: '1.4' }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function OpinionScaleRenderer({ question, value, onChange, disabled, readOnly, theme, onAutoAdvance }: RendererProps) {
  const selectedValue = value ? parseInt(value as string, 10) : null;
  const scale = question.ratingScale || 5;
  const leftLabel = question.leftLabel || 'Low';
  const rightLabel = question.rightLabel || 'High';

  const handleSelect = (val: number) => {
    if (disabled || readOnly) return;
    onChange(val.toString());
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 300);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm font-medium" style={{ color: theme.mutedTextColor }}>
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
      <div className="flex gap-2 justify-between">
        {Array.from({ length: scale }, (_, idx) => {
          const val = idx + 1;
          const isSelected = selectedValue === val;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(val)}
              disabled={disabled}
              className="flex-1 h-12 transition-all font-semibold"
              style={{
                borderRadius: 'var(--survey-option-radius, 12px)',
                border: `2px solid ${isSelected ? theme.primaryColor : theme.mutedTextColor + '30'}`,
                backgroundColor: isSelected ? theme.primaryColor + '10' : theme.cardBackground,
                color: theme.primaryColor,
                cursor: disabled || readOnly ? 'default' : 'pointer',
              }}
            >
              {question.showNumbers !== false ? val : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SliderRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  const min = question.min || 0;
  const max = question.max || 100;
  const step = question.step || 1;
  const unit = question.unit || '';
  const currentValue = value ? parseInt(value as string, 10) : (question.defaultValue || min);

  return (
    <div className="space-y-6 px-2">
      <div className="flex justify-between text-xs font-medium" style={{ color: theme.mutedTextColor }}>
        <span>{question.ratingLabels?.low || min}{unit}</span>
        <span>{question.ratingLabels?.high || max}{unit}</span>
      </div>
      <Slider
        value={[currentValue]}
        onValueChange={(v) => onChange(v[0].toString())}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className="w-full"
      />
      {question.showValue !== false && (
        <div
          className="text-center p-4"
          style={{
            borderRadius: 'var(--survey-option-radius, 12px)',
            backgroundColor: theme.backgroundColor,
            border: `1px solid ${theme.mutedTextColor}30`,
          }}
        >
          <span className="text-2xl font-bold" style={{ color: theme.primaryColor }}>
            {currentValue}{unit}
          </span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADVANCED TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function MatrixRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  const rowLabels = question.rowLabels || [];
  const colLabels = question.colLabels || [];
  const selectedValue = value as string;

  const handleSelect = (row: string, col: string) => {
    if (disabled || readOnly) return;
    onChange(`${row}|${col}`);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th
              className="border p-3 text-left font-medium min-w-[120px]"
              style={{ backgroundColor: theme.backgroundColor, borderColor: theme.mutedTextColor + '30' }}
            />
            {colLabels.map((col) => (
              <th
                key={col}
                className="border p-3 text-center font-medium min-w-[80px]"
                style={{ backgroundColor: theme.backgroundColor, borderColor: theme.mutedTextColor + '30', color: theme.textColor }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowLabels.map((row) => (
            <tr key={row}>
              <td
                className="border p-3 font-medium text-left"
                style={{ borderColor: theme.mutedTextColor + '30', color: theme.textColor }}
              >
                {row}
              </td>
              {colLabels.map((col) => {
                const isSelected = selectedValue === `${row}|${col}`;
                return (
                  <td
                    key={`${row}-${col}`}
                    className="border p-3 text-center"
                    style={{ borderColor: theme.mutedTextColor + '30' }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(row, col)}
                      disabled={disabled}
                      className="w-6 h-6 rounded-full mx-auto transition-all"
                      style={{
                        border: `2px solid ${isSelected ? theme.primaryColor : theme.mutedTextColor + '40'}`,
                        backgroundColor: isSelected ? theme.primaryColor : 'transparent',
                        cursor: disabled || readOnly ? 'default' : 'pointer',
                      }}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RankingRenderer({ question, theme }: RendererProps) {
  const options = question.options || [];

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium" style={{ color: theme.mutedTextColor }}>
        Drag to reorder by importance
      </p>
      {options.map((option, idx) => (
        <div
          key={option}
          className="flex items-center gap-3 p-3"
          style={{
            borderRadius: 'var(--survey-option-radius, 12px)',
            border: `2px solid ${theme.mutedTextColor}30`,
            backgroundColor: theme.cardBackground,
          }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: theme.mutedTextColor + '20' }}
          >
            <span className="text-sm font-bold" style={{ color: theme.primaryColor }}>{idx + 1}</span>
          </div>
          <span className="text-sm flex-1" style={{ color: theme.textColor }}>{option}</span>
        </div>
      ))}
    </div>
  );
}

function ConstantSumRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  const options = question.options || [];
  const total = question.totalPoints || 100;
  const currentValues = Array.isArray(value)
    ? (value as string[]).map((v) => parseInt(v, 10) || 0)
    : options.map(() => 0);
  const currentSum = currentValues.reduce((a, b) => a + b, 0);
  const remaining = total - currentSum;

  const handleValueChange = (idx: number, newVal: number) => {
    if (disabled || readOnly) return;
    const newValues = [...currentValues];
    newValues[idx] = newVal;
    onChange(newValues.map(String));
  };

  return (
    <div className="space-y-4">
      <div
        className="flex justify-between items-center p-3"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          backgroundColor: remaining === 0 ? '#ECFDF5' : '#FFFBEB',
          border: `1px solid ${theme.mutedTextColor}30`,
        }}
      >
        <span className="text-sm font-medium">Points remaining:</span>
        <span
          className="text-lg font-bold"
          style={{ color: remaining === 0 ? '#10B981' : '#F59E0B' }}
        >
          {remaining} / {total}
        </span>
      </div>
      {options.map((option, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <span className="flex-1 text-sm" style={{ color: theme.textColor }}>{option}</span>
          <Input
            type="number"
            min={0}
            max={total}
            value={currentValues[idx] || 0}
            onChange={(e) => handleValueChange(idx, parseInt(e.target.value, 10) || 0)}
            disabled={disabled}
            readOnly={readOnly}
            className="w-24 text-center"
          />
          {question.showPercentage && (
            <span className="w-12 text-xs text-right" style={{ color: theme.mutedTextColor }}>
              {currentSum > 0 ? Math.round((currentValues[idx] / currentSum) * 100) : 0}%
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DATE & TIME
// ═══════════════════════════════════════════════════════════════════════════════

function DateRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type="date"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          borderColor: theme.mutedTextColor + '40',
          backgroundColor: theme.cardBackground,
        }}
      />
      {question.description && (
        <p style={{ fontSize: '12px', color: theme.mutedTextColor }}>{question.description}</p>
      )}
    </div>
  );
}

function TimeRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type="time"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          borderColor: theme.mutedTextColor + '40',
          backgroundColor: theme.cardBackground,
        }}
      />
      {question.description && (
        <p style={{ fontSize: '12px', color: theme.mutedTextColor }}>{question.description}</p>
      )}
    </div>
  );
}

function DateTimeRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type="datetime-local"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          borderColor: theme.mutedTextColor + '40',
          backgroundColor: theme.cardBackground,
        }}
      />
      {question.description && (
        <p style={{ fontSize: '12px', color: theme.mutedTextColor }}>{question.description}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEDIA TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function ImageChoiceRenderer({ question, value, onChange, readOnly, disabled, theme, onAutoAdvance }: RendererProps) {
  const choices = question.imageOptions || [];

  if (!choices.length) {
    return (
      <div
        className="p-4"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          border: `2px solid ${theme.mutedTextColor}30`,
        }}
      >
        <p style={{ color: theme.mutedTextColor, fontSize: '14px' }}>
          No images configured for this question.
        </p>
      </div>
    );
  }

  const isMulti = question.selectionType === 'multiple';
  const currentValues = Array.isArray(value)
    ? (value as string[])
    : value
      ? [String(value)]
      : [];

  const toggle = (val: string) => {
    if (readOnly || disabled) return;
    if (isMulti) {
      const next = currentValues.includes(val)
        ? currentValues.filter((v) => v !== val)
        : [...currentValues, val];
      onChange(next);
    } else {
      onChange(val);
      if (onAutoAdvance) {
        setTimeout(() => onAutoAdvance(), 300);
      }
    }
  };

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${question.columns || 2}, minmax(0, 1fr))` }}>
      {choices.map((choice, idx) => {
        const valueId = choice.value || `choice-${idx}`;
        const isSelected = currentValues.includes(valueId);
        return (
          <button
            type="button"
            key={valueId}
            onClick={() => toggle(valueId)}
            disabled={disabled || readOnly}
            className="relative overflow-hidden transition-all"
            style={{
              borderRadius: 'var(--survey-option-radius, 12px)',
              border: `2px solid ${isSelected ? theme.primaryColor : theme.mutedTextColor + '30'}`,
              boxShadow: isSelected ? `0 0 0 3px ${theme.primaryColor}33` : 'none',
              opacity: disabled ? 0.7 : 1,
            }}
          >
            <div className="aspect-video" style={{ backgroundColor: theme.backgroundColor }}>
              {choice.imageUrl ? (
                <img src={choice.imageUrl} alt={choice.label || `Option ${idx + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: theme.mutedTextColor }}>
                  No image
                </div>
              )}
            </div>
            {question.showLabels !== false && (
              <div className="p-3 text-left">
                <p className="text-sm font-semibold" style={{ color: theme.textColor }}>{choice.label || `Option ${idx + 1}`}</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FileUploadRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  const isMulti = (question.maxFiles ?? 1) > 1;
  const currentFiles = Array.isArray(value)
    ? (value as string[])
    : value
      ? [String(value)]
      : [];

  const accept = Array.isArray(question.allowedTypes)
    ? question.allowedTypes.map((t) => (t.startsWith('.') ? t : `.${t}`)).join(',')
    : undefined;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const list = Array.from(files);
    const trimmed = question.maxFiles ? list.slice(0, question.maxFiles) : list;
    const names = trimmed.map((f) => f.name);
    onChange(isMulti ? names : names[0] || '');
  };

  return (
    <div className="space-y-3">
      <div
        className="border-2 border-dashed p-4 text-center"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          borderColor: theme.mutedTextColor + '40',
          color: theme.mutedTextColor,
        }}
      >
        <input
          type="file"
          multiple={isMulti}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || readOnly}
          className="block w-full text-sm"
        />
        <p className="text-xs mt-2">
          {question.allowedTypes?.length ? `Allowed: ${question.allowedTypes.join(", ")}` : "Any file type"}
          {question.maxFileSize ? ` • Max ${question.maxFileSize} MB` : ""}
          {question.maxFiles ? ` • Up to ${question.maxFiles} file(s)` : ""}
        </p>
      </div>
      {currentFiles.length > 0 && (
        <ul className="text-sm space-y-1 text-left" style={{ color: theme.textColor }}>
          {currentFiles.map((name) => (
            <li key={name}>• {name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SignatureRenderer({ value, onChange, disabled, readOnly, theme }: RendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Type your name to sign"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          borderColor: theme.mutedTextColor + '40',
          backgroundColor: theme.cardBackground,
        }}
      />
      <p style={{ fontSize: '12px', color: theme.mutedTextColor }}>
        Digital signature capture placeholder
      </p>
    </div>
  );
}

function VideoRenderer({ question, onChange, value, readOnly, disabled, theme }: RendererProps) {
  const videoUrl = (question as any).videoUrl;
  return (
    <div className="space-y-3">
      <div
        className="w-full overflow-hidden"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          border: `1px solid ${theme.mutedTextColor}30`,
        }}
      >
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title={question.question}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div
            className="aspect-video flex items-center justify-center text-sm"
            style={{ backgroundColor: theme.backgroundColor, color: theme.mutedTextColor }}
          >
            Video URL not provided
          </div>
        )}
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange('viewed')}
          disabled={disabled}
          className="px-4 py-2 text-sm font-semibold"
          style={{
            borderRadius: '8px',
            backgroundColor: theme.primaryColor,
            color: 'white',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          Mark as viewed
        </button>
      )}
      {value === 'viewed' && (
        <p style={{ fontSize: '12px', color: '#10B981' }}>
          Marked as viewed
        </p>
      )}
    </div>
  );
}

function AudioCaptureRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  const handleAudio = (files: FileList | null) => {
    if (!files || !files.length) return;
    onChange(files[0].name);
  };

  return (
    <div className="space-y-3">
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => handleAudio(e.target.files)}
        disabled={disabled || readOnly}
        className="block w-full text-sm"
        style={{ color: theme.textColor }}
      />
      <p style={{ fontSize: '12px', color: theme.mutedTextColor }}>
        {question.maxDuration ? `Max duration: ${question.maxDuration} seconds.` : 'Upload or record an audio clip.'}
      </p>
      {typeof value === 'string' && value && (
        <p style={{ fontSize: '12px', color: '#10B981' }}>
          Attached: {value}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRUCTURAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function SectionRenderer({ question, theme }: RendererProps) {
  return (
    <div className="py-4 border-b" style={{ borderColor: theme.mutedTextColor + '30' }}>
      {question.description && (
        <p style={{ color: theme.mutedTextColor, fontSize: '14px' }}>{question.description}</p>
      )}
    </div>
  );
}

function StatementRenderer({ question, theme }: RendererProps) {
  return (
    <div
      className="p-4"
      style={{
        borderRadius: 'var(--survey-option-radius, 12px)',
        backgroundColor: theme.backgroundColor,
        border: `1px solid ${theme.mutedTextColor}30`,
      }}
    >
      <p style={{ color: theme.textColor, fontSize: '14px' }}>{question.description}</p>
    </div>
  );
}

function LegalRenderer({ question, value, onChange, disabled, readOnly, theme }: RendererProps) {
  const isChecked = value === 'true';

  return (
    <div className="space-y-4">
      <div
        className="flex items-start gap-3 p-4"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          backgroundColor: theme.backgroundColor,
          border: `1px solid ${theme.mutedTextColor}30`,
        }}
      >
        <Checkbox
          id="legal-consent"
          checked={isChecked}
          onCheckedChange={(checked) => onChange(checked ? 'true' : 'false')}
          disabled={disabled}
          className="mt-1"
        />
        <label
          htmlFor="legal-consent"
          className="text-sm cursor-pointer"
          style={{ color: theme.textColor }}
        >
          {question.description || 'I agree to the terms and conditions'}
          {question.linkUrl && (
            <a
              href={question.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
              style={{ color: theme.primaryColor }}
            >
              {question.linkText || 'Read more'}
            </a>
          )}
        </label>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FALLBACK
// ═══════════════════════════════════════════════════════════════════════════════

interface UnknownQuestionFallbackProps {
  question: Question;
  theme: RendererProps['theme'];
}

function UnknownQuestionFallback({ question, theme }: UnknownQuestionFallbackProps) {
  const isDev = import.meta.env.DEV;

  return (
    <div
      className="p-4"
      style={{
        borderRadius: 'var(--survey-option-radius, 12px)',
        backgroundColor: isDev ? '#FFFBEB' : theme.backgroundColor,
        border: `2px solid ${isDev ? '#F59E0B' : theme.mutedTextColor + '30'}`,
      }}
    >
      {isDev && (
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} style={{ color: '#F59E0B' }} />
          <span className="text-xs font-semibold" style={{ color: '#F59E0B' }}>
            Unknown question type: "{question.type}"
          </span>
        </div>
      )}
      <Input
        type="text"
        placeholder="Enter your answer..."
        className="h-12 text-base"
        style={{
          borderRadius: 'var(--survey-option-radius, 12px)',
          borderColor: theme.mutedTextColor + '40',
          backgroundColor: theme.cardBackground,
        }}
      />
      {isDev && (
        <p className="text-xs mt-2" style={{ color: theme.mutedTextColor }}>
          This fallback is shown because the question type is not recognized.
          In production, this will appear as a generic text input.
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function getDefaultValue(type: QuestionType): unknown {
  switch (type) {
    case 'checkbox':
    case 'ranking':
    case 'constant_sum':
    case 'image_choice':
    case 'file_upload':
      return [];
    case 'legal':
      return 'false';
    default:
      return '';
  }
}

function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<string, string> = {
    text: 'Short answer',
    textarea: 'Long answer',
    email: 'Email',
    phone: 'Phone number',
    url: 'Website URL',
    number: 'Number',
    multiple_choice: 'Multiple choice',
    checkbox: 'Select all that apply',
    dropdown: 'Select one',
    image_choice: 'Choose an image',
    yes_no: 'Yes or No',
    rating: 'Rating scale',
    nps: 'Net Promoter Score',
    likert: 'Agreement scale',
    opinion_scale: 'Opinion scale',
    slider: 'Slider',
    matrix: 'Matrix/Grid',
    ranking: 'Ranking',
    constant_sum: 'Distribute points',
    date: 'Date picker',
    time: 'Time picker',
    datetime: 'Date & time',
    file_upload: 'File upload',
    signature: 'Signature',
    video: 'Video',
    audio_capture: 'Audio recording',
    section: 'Section divider',
    statement: 'Information',
    legal: 'Consent',
  };
  return labels[type] || type;
}

export default QuestionRenderer;
