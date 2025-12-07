/**
 * QuestionRenderer - Unified question rendering component for V2
 *
 * This component provides consistent question rendering across all contexts:
 * - Builder: Editing questions in the survey builder
 * - Preview: Testing surveys before publishing
 * - Live: Respondent-facing survey view
 * - Readonly: Static preview in design mode
 *
 * Uses V2 styling: clean, rounded, minimal chrome.
 *
 * @module components/surveys/QuestionRenderer
 */

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Star, Heart, AlertTriangle } from 'lucide-react';
import type { Question, QuestionType } from '@shared/schema';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export type QuestionRendererMode = 'builder' | 'preview' | 'live' | 'readonly';

export interface QuestionRendererProps {
  question: Question;
  mode: QuestionRendererMode;
  value?: unknown;
  onChange?: (value: unknown) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** Theme colors for customization */
  themeColors?: {
    primary?: string;
    background?: string;
    text?: string;
  };
  /** Callback when user completes a single-select question (for auto-advance) */
  onAutoAdvance?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SHARED STYLES (V2 Design System)
// ═══════════════════════════════════════════════════════════════════════════════

const V2_COLORS = {
  primary: '#2F8FA5',
  primaryLight: '#E1F6F3',
  border: '#E2E7EF',
  borderHover: '#2F8FA5',
  background: '#F7F9FC',
  backgroundHover: '#F0F2F5',
  text: '#1C2635',
  textSecondary: '#6A7789',
  success: '#37C0A3',
  warning: '#F59E0B',
  error: '#EF4444',
};

const baseInputStyles = {
  borderColor: V2_COLORS.border,
  backgroundColor: 'white',
};

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function QuestionRenderer({
  question,
  mode,
  value,
  onChange,
  disabled = false,
  readOnly = false,
  themeColors,
  onAutoAdvance,
}: QuestionRendererProps) {
  const isInteractive = !disabled && !readOnly && mode !== 'readonly';
  const primaryColor = themeColors?.primary || V2_COLORS.primary;

  // Defensive defaults to avoid crashing on malformed data
  const safeQuestion: Question = {
    ...question,
    options: question.options || [],
    rowLabels: question.rowLabels || [],
    colLabels: question.colLabels || [],
    ratingScale: question.ratingScale ?? question.likertPoints ?? 5,
    ratingStyle: question.ratingStyle || 'number',
  };

  // Determine effective value (use empty default based on question type)
  const effectiveValue = value ?? getDefaultValue(safeQuestion.type);

  // Handle value changes
  const handleChange = (newValue: unknown) => {
    if (isInteractive && onChange) {
      onChange(newValue);
    }
  };

  // Route to specific renderer based on question type
  const rendererProps = {
    question: safeQuestion,
    mode,
    value: effectiveValue,
    onChange: handleChange,
    disabled,
    readOnly: readOnly || mode === 'readonly',
    primaryColor,
    onAutoAdvance: isInteractive ? onAutoAdvance : undefined,
  };

  return (
    <div className="question-renderer" data-question-id={safeQuestion.id} data-question-type={safeQuestion.type}>
      {renderQuestionByType(safeQuestion.type, rendererProps)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUESTION TYPE ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

interface RendererProps {
  question: Question;
  mode: QuestionRendererMode;
  value: unknown;
  onChange: (value: unknown) => void;
  disabled: boolean;
  readOnly: boolean;
  primaryColor: string;
  onAutoAdvance?: () => void;
}

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
      return <UnknownQuestionFallback question={props.question} mode={props.mode} />;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TEXT INPUTS
// ═══════════════════════════════════════════════════════════════════════════════

interface TextRendererProps extends RendererProps {
  inputType: 'text' | 'email' | 'tel' | 'url' | 'number';
}

function TextRenderer({ question, value, onChange, disabled, readOnly, inputType }: TextRendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type={inputType}
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || `Enter your ${inputType === 'tel' ? 'phone number' : inputType}...`}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base rounded-xl border-2 transition-colors focus:border-[#2F8FA5]"
        style={baseInputStyles}
      />
      {question.description && (
        <p className="text-xs" style={{ color: V2_COLORS.textSecondary }}>{question.description}</p>
      )}
    </div>
  );
}

function TextareaRenderer({ question, value, onChange, disabled, readOnly }: RendererProps) {
  return (
    <div className="space-y-2">
      <Textarea
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || 'Type your detailed answer here...'}
        disabled={disabled}
        readOnly={readOnly}
        rows={question.rows || 4}
        className="text-base rounded-xl border-2 transition-colors focus:border-[#2F8FA5] min-h-[120px]"
        style={baseInputStyles}
      />
      {question.description && (
        <p className="text-xs" style={{ color: V2_COLORS.textSecondary }}>{question.description}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SELECTION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function MultipleChoiceRenderer({ question, value, onChange, disabled, readOnly, primaryColor, onAutoAdvance }: RendererProps) {
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
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
            style={{
              borderColor: isSelected ? primaryColor : V2_COLORS.border,
              backgroundColor: isSelected ? V2_COLORS.primaryLight : V2_COLORS.background,
              cursor: disabled || readOnly ? 'default' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{ borderColor: isSelected ? primaryColor : V2_COLORS.border }}
            >
              {isSelected && (
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: primaryColor }}
                />
              )}
            </div>
            <span className="text-sm font-medium" style={{ color: V2_COLORS.text }}>
              {option}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function CheckboxRenderer({ question, value, onChange, disabled, readOnly, primaryColor }: RendererProps) {
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
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left"
            style={{
              borderColor: isChecked ? primaryColor : V2_COLORS.border,
              backgroundColor: isChecked ? V2_COLORS.primaryLight : V2_COLORS.background,
              cursor: disabled || readOnly ? 'default' : 'pointer',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <Checkbox
              checked={isChecked}
              disabled={disabled}
              className="w-5 h-5"
            />
            <span className="text-sm font-medium" style={{ color: V2_COLORS.text }}>
              {option}
            </span>
          </button>
        );
      })}
      <p className="text-xs" style={{ color: V2_COLORS.textSecondary }}>
        Select one or more options
      </p>
    </div>
  );
}

function DropdownRenderer({ question, value, onChange, disabled, readOnly, primaryColor, onAutoAdvance }: RendererProps) {
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
        className="w-full h-12 px-4 rounded-xl border-2 bg-white text-base transition-colors focus:outline-none"
        style={{
          borderColor: V2_COLORS.border,
          color: selectedValue ? V2_COLORS.text : V2_COLORS.textSecondary,
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

function YesNoRenderer({ question, value, onChange, disabled, readOnly, primaryColor, onAutoAdvance }: RendererProps) {
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

  return (
    <div className="flex gap-4 justify-center">
      <button
        type="button"
        onClick={() => handleSelect(yesLabel)}
        disabled={disabled}
        className="flex-1 max-w-[200px] p-4 rounded-xl border-2 transition-all font-semibold"
        style={{
          borderColor: selectedValue === yesLabel ? V2_COLORS.success : V2_COLORS.border,
          backgroundColor: selectedValue === yesLabel ? '#E1F6F3' : V2_COLORS.background,
          color: selectedValue === yesLabel ? V2_COLORS.success : V2_COLORS.text,
          cursor: disabled || readOnly ? 'default' : 'pointer',
        }}
      >
        {yesLabel}
      </button>
      <button
        type="button"
        onClick={() => handleSelect(noLabel)}
        disabled={disabled}
        className="flex-1 max-w-[200px] p-4 rounded-xl border-2 transition-all font-semibold"
        style={{
          borderColor: selectedValue === noLabel ? V2_COLORS.error : V2_COLORS.border,
          backgroundColor: selectedValue === noLabel ? '#FEE2E2' : V2_COLORS.background,
          color: selectedValue === noLabel ? V2_COLORS.error : V2_COLORS.text,
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

function RatingRenderer({ question, value, onChange, disabled, readOnly, primaryColor, onAutoAdvance }: RendererProps) {
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
                  fill={isSelected || isHovered ? (style === 'heart' ? '#EF4444' : '#F59E0B') : 'transparent'}
                  stroke={isSelected || isHovered ? (style === 'heart' ? '#EF4444' : '#F59E0B') : V2_COLORS.border}
                  strokeWidth={2}
                />
              </button>
            );
          })}
        </div>
        {(lowLabel || highLabel) && (
          <div className="flex justify-between text-xs" style={{ color: V2_COLORS.textSecondary }}>
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
        <div className="flex justify-between text-xs" style={{ color: V2_COLORS.textSecondary }}>
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
              className="h-12 rounded-xl border-2 font-semibold transition-all"
              style={{
                borderColor: isSelected ? primaryColor : V2_COLORS.border,
                backgroundColor: isSelected ? V2_COLORS.primaryLight : V2_COLORS.background,
                color: primaryColor,
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

function NPSRenderer({ question, value, onChange, disabled, readOnly, primaryColor, onAutoAdvance }: RendererProps) {
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
    if (num <= 6) return { border: '#EF4444', bg: '#FEE2E2', text: '#DC2626' }; // Detractor
    if (num <= 8) return { border: '#F59E0B', bg: '#FEF3C7', text: '#D97706' }; // Passive
    return { border: '#10B981', bg: '#D1FAE5', text: '#059669' }; // Promoter
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
              className="w-9 h-9 rounded-lg border-2 font-semibold text-sm transition-all"
              style={{
                borderColor: isSelected ? colors.border : V2_COLORS.border,
                backgroundColor: isSelected ? colors.bg : V2_COLORS.background,
                color: isSelected ? colors.text : V2_COLORS.textSecondary,
                cursor: disabled || readOnly ? 'default' : 'pointer',
              }}
            >
              {num}
            </button>
          );
        })}
      </div>
      <div className="flex justify-between text-xs">
        <span style={{ color: '#EF4444' }}>{detractorLabel}</span>
        <span style={{ color: '#10B981' }}>{promoterLabel}</span>
      </div>
    </div>
  );
}

function LikertRenderer({ question, value, onChange, disabled, readOnly, primaryColor, onAutoAdvance }: RendererProps) {
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
    <div className="space-y-2">
      {Array.from({ length: points }, (_, idx) => {
        const isSelected = selectedValue === idx + 1;
        const label = labels[idx] || `${idx + 1}`;
        return (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelect(idx + 1)}
            disabled={disabled}
            className="w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left"
            style={{
              borderColor: isSelected ? primaryColor : V2_COLORS.border,
              backgroundColor: isSelected ? V2_COLORS.primaryLight : V2_COLORS.background,
              cursor: disabled || readOnly ? 'default' : 'pointer',
            }}
          >
            <div
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
              style={{ borderColor: isSelected ? primaryColor : V2_COLORS.border }}
            >
              {isSelected && (
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: primaryColor }} />
              )}
            </div>
            <span className="text-sm" style={{ color: V2_COLORS.text }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function OpinionScaleRenderer({ question, value, onChange, disabled, readOnly, primaryColor, onAutoAdvance }: RendererProps) {
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
      <div className="flex justify-between text-sm font-medium" style={{ color: V2_COLORS.textSecondary }}>
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
              className="flex-1 h-12 rounded-xl border-2 transition-all font-semibold"
              style={{
                borderColor: isSelected ? primaryColor : V2_COLORS.border,
                backgroundColor: isSelected ? V2_COLORS.primaryLight : V2_COLORS.background,
                color: primaryColor,
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

function SliderRenderer({ question, value, onChange, disabled, readOnly, primaryColor }: RendererProps) {
  const min = question.min || 0;
  const max = question.max || 100;
  const step = question.step || 1;
  const unit = question.unit || '';
  const currentValue = value ? parseInt(value as string, 10) : (question.defaultValue || min);

  return (
    <div className="space-y-6 px-2">
      <div className="flex justify-between text-xs font-medium" style={{ color: V2_COLORS.textSecondary }}>
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
          className="text-center p-4 rounded-xl"
          style={{ backgroundColor: V2_COLORS.background, border: `1px solid ${V2_COLORS.border}` }}
        >
          <span className="text-2xl font-bold" style={{ color: primaryColor }}>
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

function MatrixRenderer({ question, value, onChange, disabled, readOnly, primaryColor }: RendererProps) {
  const rowLabels = question.rowLabels || [];
  const colLabels = question.colLabels || [];
  // Value is stored as "row|col" for single selection
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
              style={{ backgroundColor: V2_COLORS.background, borderColor: V2_COLORS.border }}
            />
            {colLabels.map((col) => (
              <th
                key={col}
                className="border p-3 text-center font-medium min-w-[80px]"
                style={{ backgroundColor: V2_COLORS.background, borderColor: V2_COLORS.border, color: V2_COLORS.text }}
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
                style={{ borderColor: V2_COLORS.border, color: V2_COLORS.text }}
              >
                {row}
              </td>
              {colLabels.map((col) => {
                const isSelected = selectedValue === `${row}|${col}`;
                return (
                  <td
                    key={`${row}-${col}`}
                    className="border p-3 text-center"
                    style={{ borderColor: V2_COLORS.border }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelect(row, col)}
                      disabled={disabled}
                      className="w-6 h-6 rounded-full border-2 mx-auto transition-all"
                      style={{
                        borderColor: isSelected ? primaryColor : V2_COLORS.border,
                        backgroundColor: isSelected ? primaryColor : 'transparent',
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

function RankingRenderer({ question, value, onChange, disabled, readOnly, primaryColor }: RendererProps) {
  const options = question.options || [];
  // For now, just display the items with their rank numbers
  // Full drag-and-drop can be added later

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium" style={{ color: V2_COLORS.textSecondary }}>
        Drag to reorder by importance
      </p>
      {options.map((option, idx) => (
        <div
          key={option}
          className="flex items-center gap-3 p-3 rounded-xl border-2"
          style={{ borderColor: V2_COLORS.border, backgroundColor: V2_COLORS.background }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: V2_COLORS.border }}
          >
            <span className="text-sm font-bold" style={{ color: primaryColor }}>{idx + 1}</span>
          </div>
          <span className="text-sm flex-1" style={{ color: V2_COLORS.text }}>{option}</span>
        </div>
      ))}
    </div>
  );
}

function ConstantSumRenderer({ question, value, onChange, disabled, readOnly, primaryColor }: RendererProps) {
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
        className="flex justify-between items-center p-3 rounded-xl"
        style={{
          backgroundColor: remaining === 0 ? V2_COLORS.primaryLight : '#FEF3C7',
          border: `1px solid ${V2_COLORS.border}`,
        }}
      >
        <span className="text-sm font-medium">Points remaining:</span>
        <span
          className="text-lg font-bold"
          style={{ color: remaining === 0 ? V2_COLORS.success : V2_COLORS.warning }}
        >
          {remaining} / {total}
        </span>
      </div>
      {options.map((option, idx) => (
        <div key={idx} className="flex items-center gap-4">
          <span className="flex-1 text-sm" style={{ color: V2_COLORS.text }}>{option}</span>
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
            <span className="w-12 text-xs text-right" style={{ color: V2_COLORS.textSecondary }}>
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

function DateRenderer({ question, value, onChange, disabled, readOnly }: RendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type="date"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base rounded-xl border-2"
        style={baseInputStyles}
      />
      {question.description && (
        <p className="text-xs" style={{ color: V2_COLORS.textSecondary }}>{question.description}</p>
      )}
    </div>
  );
}

function TimeRenderer({ question, value, onChange, disabled, readOnly }: RendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type="time"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base rounded-xl border-2"
        style={baseInputStyles}
      />
      {question.description && (
        <p className="text-xs" style={{ color: V2_COLORS.textSecondary }}>{question.description}</p>
      )}
    </div>
  );
}

function DateTimeRenderer({ question, value, onChange, disabled, readOnly }: RendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type="datetime-local"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base rounded-xl border-2"
        style={baseInputStyles}
      />
      {question.description && (
        <p className="text-xs" style={{ color: V2_COLORS.textSecondary }}>{question.description}</p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEDIA TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function ImageChoiceRenderer({ question, value, onChange, readOnly, disabled, primaryColor }: RendererProps) {
  const choices =
    question.imageOptions && question.imageOptions.length > 0
      ? question.imageOptions
      : [];

  if (!choices.length) {
    return (
      <div className="p-4 rounded-xl border-2" style={{ borderColor: V2_COLORS.border }}>
        <p className="text-sm" style={{ color: V2_COLORS.textSecondary }}>
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
            className="relative rounded-xl overflow-hidden border-2 transition-all"
            style={{
              borderColor: isSelected ? primaryColor : V2_COLORS.border,
              boxShadow: isSelected ? `0 0 0 3px ${primaryColor}33` : 'none',
              opacity: disabled ? 0.7 : 1,
            }}
          >
            <div className="aspect-video bg-gray-100">
              {choice.imageUrl ? (
                <img src={choice.imageUrl} alt={choice.label || `Option ${idx + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                  No image
                </div>
              )}
            </div>
            {question.showLabels !== false && (
              <div className="p-3 text-left">
                <p className="text-sm font-semibold" style={{ color: V2_COLORS.text }}>{choice.label || `Option ${idx + 1}`}</p>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function FileUploadRenderer({ question, value, onChange, disabled, readOnly }: RendererProps) {
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
        className="border-2 border-dashed rounded-xl p-4 text-center"
        style={{ borderColor: V2_COLORS.border, color: V2_COLORS.textSecondary }}
      >
        <input
          type="file"
          multiple={isMulti}
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          disabled={disabled || readOnly}
          className="block w-full text-sm text-gray-600"
        />
        <p className="text-xs mt-2">
          {question.allowedTypes?.length ? `Allowed: ${question.allowedTypes.join(", ")}` : "Any file type"}
          {question.maxFileSize ? ` • Max ${question.maxFileSize} MB` : ""}
          {question.maxFiles ? ` • Up to ${question.maxFiles} file(s)` : ""}
        </p>
      </div>
      {currentFiles.length > 0 && (
        <ul className="text-sm space-y-1 text-left">
          {currentFiles.map((name) => (
            <li key={name} className="text-gray-700">• {name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SignatureRenderer({ value, onChange, disabled, readOnly }: RendererProps) {
  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Type your name to sign"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        readOnly={readOnly}
        className="h-12 text-base rounded-xl border-2"
        style={baseInputStyles}
      />
      <p className="text-xs" style={{ color: V2_COLORS.textSecondary }}>
        Digital signature capture placeholder
      </p>
    </div>
  );
}

function VideoRenderer({ question, onChange, value, readOnly, disabled }: RendererProps) {
  const videoUrl = (question as any).videoUrl;
  return (
    <div className="space-y-3">
      <div className="w-full overflow-hidden rounded-xl border" style={{ borderColor: V2_COLORS.border }}>
        {videoUrl ? (
          <iframe
            src={videoUrl}
            title={question.question}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="aspect-video flex items-center justify-center text-sm text-gray-500 bg-gray-50">
            Video URL not provided
          </div>
        )}
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange('viewed')}
          disabled={disabled}
          className="px-4 py-2 rounded-lg text-sm font-semibold"
          style={{
            backgroundColor: V2_COLORS.primary,
            color: 'white',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          Mark as viewed
        </button>
      )}
      {value === 'viewed' && (
        <p className="text-xs" style={{ color: V2_COLORS.success }}>
          Marked as viewed
        </p>
      )}
    </div>
  );
}

function AudioCaptureRenderer({ question, value, onChange, disabled, readOnly }: RendererProps) {
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
        className="block w-full text-sm text-gray-600"
      />
      <p className="text-xs" style={{ color: V2_COLORS.textSecondary }}>
        {question.maxDuration ? `Max duration: ${question.maxDuration} seconds.` : 'Upload or record an audio clip.'}
      </p>
      {value && (
        <p className="text-xs" style={{ color: V2_COLORS.success }}>
          Attached: {String(value)}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STRUCTURAL TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function SectionRenderer({ question }: RendererProps) {
  return (
    <div className="py-4 border-b" style={{ borderColor: V2_COLORS.border }}>
      {question.description && (
        <p className="text-sm" style={{ color: V2_COLORS.textSecondary }}>{question.description}</p>
      )}
    </div>
  );
}

function StatementRenderer({ question }: RendererProps) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ backgroundColor: V2_COLORS.background, border: `1px solid ${V2_COLORS.border}` }}
    >
      <p className="text-sm" style={{ color: V2_COLORS.text }}>{question.description}</p>
    </div>
  );
}

function LegalRenderer({ question, value, onChange, disabled, readOnly }: RendererProps) {
  const isChecked = value === 'true';

  return (
    <div className="space-y-4">
      <div
        className="flex items-start gap-3 p-4 rounded-xl"
        style={{ backgroundColor: V2_COLORS.background, border: `1px solid ${V2_COLORS.border}` }}
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
          style={{ color: V2_COLORS.text }}
        >
          {question.description || 'I agree to the terms and conditions'}
          {question.linkUrl && (
            <a
              href={question.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline"
              style={{ color: V2_COLORS.primary }}
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
  mode: QuestionRendererMode;
}

function UnknownQuestionFallback({ question, mode }: UnknownQuestionFallbackProps) {
  const isDev = import.meta.env.DEV;

  return (
    <div
      className="p-4 rounded-xl border-2"
      style={{
        backgroundColor: isDev ? '#FEF3C7' : V2_COLORS.background,
        borderColor: isDev ? V2_COLORS.warning : V2_COLORS.border,
      }}
    >
      {isDev && (
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} style={{ color: V2_COLORS.warning }} />
          <span className="text-xs font-semibold" style={{ color: V2_COLORS.warning }}>
            Unknown question type: "{question.type}"
          </span>
        </div>
      )}
      <Input
        type="text"
        placeholder="Enter your answer..."
        className="h-12 text-base rounded-xl border-2"
        style={baseInputStyles}
      />
      {isDev && (
        <p className="text-xs mt-2" style={{ color: V2_COLORS.textSecondary }}>
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

// Export individual renderers for potential direct use
export {
  TextRenderer,
  TextareaRenderer,
  MultipleChoiceRenderer,
  CheckboxRenderer,
  DropdownRenderer,
  YesNoRenderer,
  RatingRenderer,
  NPSRenderer,
  LikertRenderer,
  OpinionScaleRenderer,
  SliderRenderer,
  MatrixRenderer,
  RankingRenderer,
  ConstantSumRenderer,
  DateRenderer,
  TimeRenderer,
  DateTimeRenderer,
  SectionRenderer,
  StatementRenderer,
  LegalRenderer,
  UnknownQuestionFallback,
};
