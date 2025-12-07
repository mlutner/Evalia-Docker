import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { MessageSquare, AtSign, Hash, Type, CheckCircle2, Radio, ThumbsUp, Gauge, Grid3x3, List, Calendar, Star, HelpCircle } from "lucide-react";
import { theme } from "@/theme";
import type { Question, QuestionType } from "@shared/schema";

export type { Question, QuestionType };

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string | string[]) => void;
  initialAnswer?: string | string[];
  onAutoAdvance?: () => void;
}

function getQuestionTypeIcon(type: QuestionType) {
  switch (type) {
    case "text":
      return <Type className="w-5 h-5" />;
    case "email":
      return <AtSign className="w-5 h-5" />;
    case "number":
      return <Hash className="w-5 h-5" />;
    case "textarea":
      return <MessageSquare className="w-5 h-5" />;
    case "multiple_choice":
      return <Radio className="w-5 h-5" />;
    case "checkbox":
      return <CheckCircle2 className="w-5 h-5" />;
    case "rating":
      return <ThumbsUp className="w-5 h-5" />;
    case "nps":
      return <Gauge className="w-5 h-5" />;
    case "matrix":
      return <Grid3x3 className="w-5 h-5" />;
    case "ranking":
      return <List className="w-5 h-5" />;
    case "date":
      return <Calendar className="w-5 h-5" />;
    default:
      return null;
  }
}

function getQuestionTypeLabel(type: QuestionType) {
  const labels: Record<string, string> = {
    // Text inputs
    text: "Short answer",
    textarea: "Long answer",
    email: "Email",
    phone: "Phone number",
    url: "Website URL",
    number: "Number",
    // Selection
    multiple_choice: "Multiple choice",
    checkbox: "Select all that apply",
    dropdown: "Select one",
    image_choice: "Choose an image",
    yes_no: "Yes or No",
    // Rating & scales
    rating: "Rating scale",
    nps: "Net Promoter Score",
    likert: "Agreement scale",
    opinion_scale: "Opinion scale",
    slider: "Slider",
    // Advanced
    matrix: "Matrix/Grid",
    ranking: "Ranking",
    constant_sum: "Distribute points",
    // Date & time
    date: "Date picker",
    time: "Time picker",
    datetime: "Date & time",
    // Media
    file_upload: "File upload",
    signature: "Signature",
    video: "Video",
    audio_capture: "Audio recording",
    // Structural
    section: "Section divider",
    statement: "Information",
    legal: "Consent",
  };
  return labels[type] || type;
}

function getInitialAnswerForQuestion(question: Question, initial?: string | string[]) {
  if (initial !== undefined) return initial;
  if (question.type === 'checkbox') return [];
  if (question.type === 'image_choice' && question.selectionType === 'multiple') return [];
  if (question.type === 'file_upload') return [];
  return '';
}

export default function QuestionCard({ question, onAnswer, initialAnswer, onAutoAdvance }: QuestionCardProps) {
  const [answer, setAnswer] = useState<string | string[]>(getInitialAnswerForQuestion(question, initialAnswer));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Helper to trigger auto-advance with 300ms delay for single-choice questions
  const triggerAutoAdvance = () => {
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 300);
    }
  };

  // Reset answer state when moving to a new question
  useEffect(() => {
    setAnswer(getInitialAnswerForQuestion(question, initialAnswer));
    setHoverRating(null);
  }, [question.id, question.type, initialAnswer]);

  const handleTextChange = (value: string) => {
    setAnswer(value);
    onAnswer(value);
  };

  const handleMultipleChoice = (value: string) => {
    setAnswer(value);
    onAnswer(value);
    triggerAutoAdvance();
  };

  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentAnswers = Array.isArray(answer) ? answer : [];
    const newAnswers = checked
      ? [...currentAnswers, option]
      : currentAnswers.filter(a => a !== option);
    setAnswer(newAnswers);
    onAnswer(newAnswers);
  };

  const handleMatrixChange = (row: string, col: string) => {
    const currentAnswers = typeof answer === "string" ? answer : "";
    const key = `${row}|${col}`;
    setAnswer(key);
    onAnswer(key);
  };

  const handleRankingChange = (items: string[]) => {
    setAnswer(items);
    onAnswer(items);
  };

  return (
    <div data-testid={`question-${question.id}`}>
      {/* Question Type Label */}
      <p className="question-label-type" data-testid="text-question-type">
        {getQuestionTypeLabel(question.type)}
      </p>

      {/* Question Title */}
      <h2 className="question-title" style={{ fontSize: '24px', lineHeight: '1.4', marginBottom: '20px' }} data-testid="text-question">
        {question.question}
        {question.required && (
          <span className="required" title="This field is required">*</span>
        )}
      </h2>

      {question.description && (
        <p className="text-sm mt-2 mb-6" style={{ color: theme.colors.textSecondary }} data-testid="text-question-description">{question.description}</p>
      )}

      <div className="space-y-6">
        {question.type === "text" && (
          <>
            <Input
              type="text"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your answer here..."
              className="text-base h-11 sm:h-12 border border-border/60 transition-colors bg-white"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="input-text-answer"
              autoFocus
            />
            <p className="text-xs" style={{ color: '#6A7789' }}>Brief text response</p>
          </>
        )}

        {question.type === "email" && (
          <>
            <Input
              type="email"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="your@email.com"
              className="text-base h-11 sm:h-12 border border-border/60 transition-colors bg-white"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="input-email-answer"
              autoFocus
            />
            <p className="text-xs" style={{ color: '#6A7789' }}>Enter a valid email address</p>
          </>
        )}

        {question.type === "number" && (
          <>
            <Input
              type="number"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter a number..."
              className="text-base h-11 sm:h-12 border border-border/60 transition-colors bg-white"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="input-number-answer"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Numeric response only</p>
          </>
        )}

        {question.type === "textarea" && (
          <>
            <textarea
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your answer here..."
              className="question-textarea"
              data-testid="input-textarea-answer"
              autoFocus
            />
            <p className="question-hint">Detailed text response</p>
          </>
        )}

        {question.type === "multiple_choice" && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = answer === option;
              return (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 p-3.5 rounded-lg hover-elevate active-elevate-2 border transition-all cursor-pointer" 
                  style={{ 
                    borderColor: isSelected ? '#2F8FA5' : '#E2E7EF',
                    backgroundColor: isSelected ? '#E1F6F3' : '#F7F9FC'
                  }}
                  data-testid={`option-${index}`}
                  onClick={() => handleMultipleChoice(option)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F2F5';
                    e.currentTarget.style.borderColor = '#2F8FA5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected ? '#E1F6F3' : '#F7F9FC';
                    e.currentTarget.style.borderColor = isSelected ? '#2F8FA5' : '#E2E7EF';
                  }}
                >
                  <span className="text-sm sm:text-base font-normal" style={{ color: '#1C2635', flex: 1 }}>
                    {option}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {question.type === "checkbox" && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isChecked = Array.isArray(answer) && answer.includes(option);
              return (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 p-3.5 rounded-lg hover-elevate active-elevate-2 border transition-all cursor-pointer" 
                  style={{ borderColor: '#E2E7EF', backgroundColor: '#F7F9FC' }}
                  data-testid={`checkbox-${index}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCheckboxChange(option, !isChecked);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F2F5';
                    e.currentTarget.style.borderColor = '#2F8FA5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F7F9FC';
                    e.currentTarget.style.borderColor = '#E2E7EF';
                  }}
                >
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                    className="w-4 h-4"
                  />
                  <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base font-normal">
                    {option}
                  </Label>
                </div>
              );
            })}
            <p className="text-xs mt-2" style={{ color: '#6A7789' }}>Select one or more options</p>
          </div>
        )}

        {question.type === "rating" && (
          <div className="space-y-6">
            {/* Get rating scale and style */}
            {(() => {
              const scale = question.ratingScale || 5;
              const ratingStyle = question.ratingStyle || "number"; // Default to number, not stars
              const lowLabel = question.ratingLabels?.low || "Strongly Disagree";
              const highLabel = question.ratingLabels?.high || "Strongly Agree";
              const ratingValues = Array.from({ length: scale }, (_, i) => i + 1);

              // Star Rating UI
              if (ratingStyle === "star") {
                return (
                  <>
                    <div className="flex items-center justify-center gap-3 py-6">
                      {ratingValues.map((star) => {
                        const isSelected = answer === star.toString();
                        const isHovered = hoverRating !== null && star <= hoverRating;
                        
                        return (
                          <button
                            key={star}
                            onClick={() => {
                              const val = star.toString();
                              setAnswer(val);
                              onAnswer(val);
                              setHoverRating(null);
                              triggerAutoAdvance();
                            }}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(null)}
                            data-testid={`rating-${star}`}
                            className="transition-transform active-elevate-2"
                          >
                            <Star
                              style={{
                                fill: isSelected || isHovered ? '#37C0A3' : '#E2E7EF',
                                stroke: isSelected || isHovered ? '#37C0A3' : '#A3D65C',
                                transform: (isSelected || isHovered) ? 'scale(1.1)' : 'scale(1)',
                                transition: 'all 0.2s ease'
                              }}
                              className="w-12 h-12"
                            />
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs font-medium" style={{ color: '#6A7789' }}>
                      <span>{lowLabel}</span>
                      <span style={{ color: '#A3D65C' }}>•</span>
                      <span>{highLabel}</span>
                    </div>
                    {answer && (
                      <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F0F2F5', border: '1px solid #E2E7EF' }}>
                        <div className="text-sm font-medium" style={{ color: '#37C0A3' }}>
                          {answer} out of {scale}
                        </div>
                      </div>
                    )}
                  </>
                );
              }

              // Number/Scale Rating UI (default)
              return (
                <>
                  <div className="flex flex-col space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium" style={{ color: '#6A7789' }}>{lowLabel}</span>
                      <span className="text-xs font-medium" style={{ color: '#6A7789' }}>{highLabel}</span>
                    </div>
                    <div className={`grid gap-2 ${scale <= 5 ? 'grid-cols-5' : scale <= 7 ? 'grid-cols-7' : 'grid-cols-10'}`}>
                      {ratingValues.map((value) => {
                        const isSelected = answer === value.toString();
                        
                        return (
                          <button
                            key={value}
                            onClick={() => {
                              const val = value.toString();
                              setAnswer(val);
                              onAnswer(val);
                              triggerAutoAdvance();
                            }}
                            data-testid={`rating-${value}`}
                            style={{
                              height: '48px',
                              borderRadius: '8px',
                              border: `${isSelected ? '3px' : '2px'} solid #2F8FA5`,
                              backgroundColor: isSelected ? '#E1F6F3' : '#F7F9FC',
                              color: '#2F8FA5',
                              fontSize: '15px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              boxShadow: isSelected ? '0 0 0 4px rgba(47, 143, 165, 0.2)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderWidth = '3px';
                                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(47, 143, 165, 0.15)';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!isSelected) {
                                e.currentTarget.style.borderWidth = '2px';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.transform = 'scale(1)';
                              }
                            }}
                            className="active-elevate-2"
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {answer && (
                    <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F0F2F5', border: '1px solid #E2E7EF' }}>
                      <div className="text-sm font-medium" style={{ color: '#2F8FA5' }}>
                        {answer} out of {scale}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {question.type === "nps" && (
          <>
            <div className="flex flex-col space-y-4">
              {/* NPS Scale - Always horizontal per best practices */}
              <div className="flex flex-wrap sm:flex-nowrap gap-1 sm:gap-2 justify-between">
                {Array.from({ length: 11 }).map((_, i) => {
                  const isSelected = answer === i.toString();
                  // Color coding: 0-6 Detractors (red), 7-8 Passives (yellow), 9-10 Promoters (green)
                  const colorZone = i <= 6 ? 'detractor' : i <= 8 ? 'passive' : 'promoter';
                  const zoneColors = {
                    detractor: { border: '#EF4444', bg: '#FEE2E2', text: '#DC2626' },
                    passive: { border: '#F59E0B', bg: '#FEF3C7', text: '#D97706' },
                    promoter: { border: '#10B981', bg: '#D1FAE5', text: '#059669' },
                  };
                  const colors = zoneColors[colorZone];
                  
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        const val = i.toString();
                        setAnswer(val);
                        onAnswer(val);
                        triggerAutoAdvance();
                      }}
                      data-testid={`button-nps-${i}`}
                      className="flex-1 min-w-[32px] sm:min-w-[40px] active-elevate-2 transition-all"
                      style={{
                        height: '44px',
                        borderRadius: '6px',
                        border: `2px solid ${isSelected ? colors.border : '#E2E7EF'}`,
                        backgroundColor: isSelected ? colors.bg : '#F7F9FC',
                        color: isSelected ? colors.text : '#6A7789',
                        fontSize: '14px',
                        fontWeight: isSelected ? 700 : 600,
                        cursor: 'pointer',
                        boxShadow: isSelected ? `0 0 0 3px ${colors.border}33` : 'none',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = colors.border;
                          e.currentTarget.style.backgroundColor = colors.bg + '80';
                          e.currentTarget.style.transform = 'scale(1.02)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#E2E7EF';
                          e.currentTarget.style.backgroundColor = '#F7F9FC';
                          e.currentTarget.style.transform = 'scale(1)';
                        }
                      }}
                    >
                      {i}
                    </button>
                  );
                })}
              </div>
              
              {/* Labels below the scale */}
              <div className="flex justify-between items-center px-1">
                <span className="text-xs font-medium" style={{ color: '#EF4444' }}>
                  {question.npsLabels?.detractor || "Not likely"}
                </span>
                <span className="text-xs font-medium" style={{ color: '#10B981' }}>
                  {question.npsLabels?.promoter || "Extremely likely"}
                </span>
              </div>
              
              {/* Selected value indicator with NPS zone */}
              {answer && (
                <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F0F2F5', border: '1px solid #E2E7EF' }}>
                  <span className="text-sm font-medium" style={{ color: '#1C2635' }}>
                    You selected: <strong>{answer}</strong>
                    {parseInt(answer as string, 10) <= 6 && <span className="ml-2" style={{ color: '#EF4444' }}>(Detractor)</span>}
                    {parseInt(answer as string, 10) >= 7 && parseInt(answer as string, 10) <= 8 && <span className="ml-2" style={{ color: '#F59E0B' }}>(Passive)</span>}
                    {parseInt(answer as string, 10) >= 9 && <span className="ml-2" style={{ color: '#10B981' }}>(Promoter)</span>}
                  </span>
                </div>
              )}
            </div>
          </>
        )}

        {question.type === "matrix" && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>Select one option per row</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4" style={{ color: theme.colors.primary, cursor: 'help' }} />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Click the circle in each row that matches your response. You must select exactly one option per row.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 text-left font-medium min-w-[120px]" style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border }}></th>
                    {question.colLabels?.map((col) => (
                      <th key={col} className="border p-2 text-center font-medium min-w-[80px]" style={{ backgroundColor: theme.colors.bg, borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {question.rowLabels?.map((row) => (
                    <tr key={row}>
                      <td className="border p-2 font-medium text-left" style={{ borderColor: theme.colors.border, color: theme.colors.textPrimary }}>{row}</td>
                      {question.colLabels?.map((col) => {
                        const isSelected = answer === `${row}|${col}`;
                        return (
                          <td key={`${row}-${col}`} className="border p-2 text-center" style={{ borderColor: theme.colors.border }}>
                            <button
                              onClick={() => {
                                handleMatrixChange(row, col);
                                triggerAutoAdvance();
                              }}
                              data-testid={`button-matrix-${row}-${col}`}
                              style={{
                                width: '24px',
                                height: '24px',
                                margin: '0 auto',
                                borderRadius: '50%',
                                border: isSelected ? `2px solid ${theme.colors.primaryHex}` : `2px solid ${theme.colors.border}`,
                                backgroundColor: isSelected ? theme.colors.primary : 'transparent',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              className="transition-all"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {question.type === "ranking" && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <p className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>Drag to reorder by importance</p>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="w-4 h-4" style={{ color: theme.colors.primary, cursor: 'help' }} />
                  </TooltipTrigger>
                  <TooltipContent side="right" className="max-w-xs">
                    <p>Items are currently numbered 1 (top priority) to {question.options?.length} (lowest priority). You can reorder them to match your ranking. Use drag-and-drop or click items to reorganize.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="space-y-2">
              {question.options?.map((option, idx) => (
                <div 
                  key={option} 
                  className="flex items-center gap-3 p-3 border rounded-lg hover-elevate active-elevate-2"
                  style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.bg }}
                  data-testid={`ranking-item-${idx}`}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F0F2F5';
                    e.currentTarget.style.borderColor = theme.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.bg;
                    e.currentTarget.style.borderColor = theme.colors.border;
                  }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.border }}>
                    <span className="text-sm font-bold" style={{ color: theme.colors.primary }}>{idx + 1}</span>
                  </div>
                  <span className="text-sm flex-1" style={{ color: theme.colors.textPrimary }}>{option}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {question.type === "date" && (
          <>
            <Input
              type="date"
              value={answer as string}
              onChange={(e) => {
                handleTextChange(e.target.value);
                triggerAutoAdvance();
              }}
              className="text-base h-11 sm:h-12 border border-border/60 transition-colors bg-white"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="input-date-answer"
              autoFocus
            />
            <p className="text-xs" style={{ color: '#6A7789' }}>Select a date</p>
          </>
        )}

        {/* Likert Scale */}
        {question.type === "likert" && (
          <div className="space-y-4">
            {(() => {
              const points = question.likertPoints || 5;
              const likertType = question.likertType || "agreement";
              
              // Default labels by type
              const defaultLabels: Record<string, string[]> = {
                agreement: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                frequency: ["Never", "Rarely", "Sometimes", "Often", "Always"],
                importance: ["Not Important", "Slightly", "Moderately", "Very", "Extremely"],
                satisfaction: ["Very Dissatisfied", "Dissatisfied", "Neutral", "Satisfied", "Very Satisfied"],
                quality: ["Very Poor", "Poor", "Fair", "Good", "Excellent"],
              };
              
              const labels = question.customLabels || defaultLabels[likertType] || defaultLabels.agreement;
              // Create displayLabels array that matches the number of points
              // For 7-point scale: show label at positions 0, 3 (middle), and 6 (end)
              const displayLabels = points === 7 
                ? [labels[0], "", "", labels[Math.floor(labels.length/2)], "", "", labels[labels.length-1]]
                : labels;

              return (
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${points}, 1fr)` }}>
                    {Array.from({ length: points }).map((_, idx) => {
                      const isSelected = answer === (idx + 1).toString();
                      const label = displayLabels[idx] || "";
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const val = (idx + 1).toString();
                            setAnswer(val);
                            onAnswer(val);
                            triggerAutoAdvance();
                          }}
                          className="flex flex-col items-center gap-2 p-3 rounded-lg border transition-all"
                          style={{
                            borderColor: isSelected ? '#2F8FA5' : '#E2E7EF',
                            backgroundColor: isSelected ? '#E1F6F3' : '#F7F9FC',
                          }}
                          data-testid={`likert-${idx + 1}`}
                        >
                          <span className="text-lg font-semibold" style={{ color: '#2F8FA5' }}>{idx + 1}</span>
                          {label && <span className="text-xs text-center" style={{ color: '#6A7789' }}>{label}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Slider */}
        {question.type === "slider" && (
          <div className="space-y-6">
            {(() => {
              const min = question.min || 0;
              const max = question.max || 100;
              const step = question.step || 1;
              const unit = question.unit || "";
              const currentValue = answer ? parseInt(answer as string, 10) : (question.defaultValue || min);

              return (
                <>
                  <div className="flex justify-between text-xs font-medium" style={{ color: '#6A7789' }}>
                    <span>{question.ratingLabels?.low || min}{unit}</span>
                    <span>{question.ratingLabels?.high || max}{unit}</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={currentValue}
                      onChange={(e) => {
                        const val = e.target.value;
                        setAnswer(val);
                        onAnswer(val);
                      }}
                      className="w-full h-3 rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #2F8FA5 0%, #2F8FA5 ${((currentValue - min) / (max - min)) * 100}%, #E2E7EF ${((currentValue - min) / (max - min)) * 100}%, #E2E7EF 100%)`,
                      }}
                      data-testid="slider-input"
                    />
                  </div>
                  {question.showValue !== false && (
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: '#F0F2F5', border: '1px solid #E2E7EF' }}>
                      <span className="text-2xl font-bold" style={{ color: '#2F8FA5' }}>{currentValue}{unit}</span>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* Yes/No */}
        {question.type === "yes_no" && (
          <div className="flex gap-4 justify-center">
            {(() => {
              const yesLabel = question.yesLabel || "Yes";
              const noLabel = question.noLabel || "No";
              
              return (
                <>
                  <button
                    onClick={() => {
                      setAnswer(yesLabel);
                      onAnswer(yesLabel);
                      triggerAutoAdvance();
                    }}
                    className="flex-1 max-w-[200px] p-4 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: answer === yesLabel ? '#37C0A3' : '#E2E7EF',
                      backgroundColor: answer === yesLabel ? '#E1F6F3' : '#F7F9FC',
                    }}
                    data-testid="yes-button"
                  >
                    <span className="text-lg font-semibold" style={{ color: answer === yesLabel ? '#37C0A3' : '#1C2635' }}>
                      {yesLabel}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setAnswer(noLabel);
                      onAnswer(noLabel);
                      triggerAutoAdvance();
                    }}
                    className="flex-1 max-w-[200px] p-4 rounded-lg border-2 transition-all"
                    style={{
                      borderColor: answer === noLabel ? '#EF4444' : '#E2E7EF',
                      backgroundColor: answer === noLabel ? '#FEE2E2' : '#F7F9FC',
                    }}
                    data-testid="no-button"
                  >
                    <span className="text-lg font-semibold" style={{ color: answer === noLabel ? '#EF4444' : '#1C2635' }}>
                      {noLabel}
                    </span>
                  </button>
                </>
              );
            })()}
          </div>
        )}

        {/* Dropdown */}
        {question.type === "dropdown" && question.options && (
          <div className="space-y-3">
            <select
              value={answer as string}
              onChange={(e) => {
                setAnswer(e.target.value);
                onAnswer(e.target.value);
                if (e.target.value) triggerAutoAdvance();
              }}
              className="w-full h-12 px-4 rounded-lg border bg-white text-base"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="dropdown-select"
            >
              <option value="">{question.placeholder || "Select an option..."}</option>
              {question.options.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          </div>
        )}

        {/* Opinion Scale (Semantic Differential) */}
        {question.type === "opinion_scale" && (
          <div className="space-y-4">
            {(() => {
              const scale = question.ratingScale || 5;
              const leftLabel = question.leftLabel || "Low";
              const rightLabel = question.rightLabel || "High";

              return (
                <>
                  <div className="flex justify-between text-sm font-medium" style={{ color: '#6A7789' }}>
                    <span>{leftLabel}</span>
                    <span>{rightLabel}</span>
                  </div>
                  <div className="flex gap-2 justify-between">
                    {Array.from({ length: scale }).map((_, idx) => {
                      const value = idx + 1;
                      const isSelected = answer === value.toString();
                      
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            const val = value.toString();
                            setAnswer(val);
                            onAnswer(val);
                            triggerAutoAdvance();
                          }}
                          className="flex-1 h-12 rounded-lg border-2 transition-all font-semibold"
                          style={{
                            borderColor: isSelected ? '#2F8FA5' : '#E2E7EF',
                            backgroundColor: isSelected ? '#E1F6F3' : '#F7F9FC',
                            color: '#2F8FA5',
                          }}
                          data-testid={`opinion-${value}`}
                        >
                          {question.showNumbers !== false ? value : ''}
                        </button>
                      );
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        )}

        {/* Constant Sum (Point Distribution) */}
        {question.type === "constant_sum" && question.options && (
          <div className="space-y-4">
            {(() => {
              const total = question.totalPoints || 100;
              const currentValues = Array.isArray(answer) ? answer.map(v => parseInt(v, 10) || 0) : question.options.map(() => 0);
              const currentSum = currentValues.reduce((a, b) => a + b, 0);
              const remaining = total - currentSum;

              return (
                <>
                  <div className="flex justify-between items-center p-3 rounded-lg" style={{ backgroundColor: remaining === 0 ? '#E1F6F3' : '#FEF3C7', border: '1px solid #E2E7EF' }}>
                    <span className="text-sm font-medium">Points remaining:</span>
                    <span className="text-lg font-bold" style={{ color: remaining === 0 ? '#37C0A3' : '#D97706' }}>{remaining} / {total}</span>
                  </div>
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className="flex-1 text-sm" style={{ color: '#1C2635' }}>{option}</span>
                      <Input
                        type="number"
                        min={0}
                        max={total}
                        value={currentValues[idx] || 0}
                        onChange={(e) => {
                          const newValues = [...currentValues];
                          newValues[idx] = parseInt(e.target.value, 10) || 0;
                          const strValues = newValues.map(String);
                          setAnswer(strValues);
                          onAnswer(strValues);
                        }}
                        className="w-24 text-center"
                        data-testid={`constant-sum-${idx}`}
                      />
                      {question.showPercentage && (
                        <span className="w-12 text-xs text-right" style={{ color: '#6A7789' }}>
                          {currentSum > 0 ? Math.round((currentValues[idx] / currentSum) * 100) : 0}%
                        </span>
                      )}
                    </div>
                  ))}
                </>
              );
            })()}
          </div>
        )}

        {/* Time Picker */}
        {question.type === "time" && (
          <>
            <Input
              type="time"
              value={answer as string}
              onChange={(e) => {
                handleTextChange(e.target.value);
                triggerAutoAdvance();
              }}
              className="text-base h-11 sm:h-12 border border-border/60 transition-colors bg-white"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="input-time-answer"
              autoFocus
            />
            <p className="text-xs" style={{ color: '#6A7789' }}>Select a time</p>
          </>
        )}

        {/* Phone Number */}
        {question.type === "phone" && (
          <>
            <Input
              type="tel"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={question.placeholder || "Enter phone number..."}
              className="text-base h-11 sm:h-12 border border-border/60 transition-colors bg-white"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="input-phone-answer"
              autoFocus
            />
            <p className="text-xs" style={{ color: '#6A7789' }}>Phone number</p>
          </>
        )}

        {/* URL */}
        {question.type === "url" && (
          <>
            <Input
              type="url"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={question.placeholder || "https://example.com"}
              className="text-base h-11 sm:h-12 border border-border/60 transition-colors bg-white"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="input-url-answer"
              autoFocus
            />
            <p className="text-xs" style={{ color: '#6A7789' }}>Website URL</p>
          </>
        )}

        {/* Image Choice */}
        {question.type === "image_choice" && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${question.columns || 2}, minmax(0, 1fr))` }}>
            {(() => {
              const choices = question.imageOptions || [];
              const isMulti = question.selectionType === 'multiple';
              const current = Array.isArray(answer) ? answer : answer ? [answer as string] : [];

              if (!choices.length) {
                return (
                  <div className="col-span-full text-sm text-muted-foreground">
                    No images configured for this question.
                  </div>
                );
              }

              const toggle = (val: string) => {
                if (isMulti) {
                  const next = current.includes(val)
                    ? current.filter((v) => v !== val)
                    : [...current, val];
                  setAnswer(next);
                  onAnswer(next);
                } else {
                  setAnswer(val);
                  onAnswer(val);
                  triggerAutoAdvance();
                }
              };

              return choices.map((choice, idx) => {
                const valueId = choice.value || `choice-${idx}`;
                const isSelected = current.includes(valueId);
                return (
                  <button
                    type="button"
                    key={valueId}
                    onClick={() => toggle(valueId)}
                    className="relative rounded-lg overflow-hidden border transition-all"
                    style={{
                      borderColor: isSelected ? '#2F8FA5' : '#E2E7EF',
                      boxShadow: isSelected ? '0 0 0 3px rgba(47, 143, 165, 0.2)' : 'none',
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
                        <p className="text-sm font-semibold" style={{ color: '#1C2635' }}>{choice.label || `Option ${idx + 1}`}</p>
                      </div>
                    )}
                  </button>
                );
              });
            })()}
          </div>
        )}

        {/* File Upload */}
        {question.type === "file_upload" && (
          <div className="space-y-3">
            <div className="border-2 border-dashed rounded-lg p-4 text-center" style={{ borderColor: '#E2E7EF' }}>
              <input
                type="file"
                multiple={(question.maxFiles ?? 1) > 1}
                accept={Array.isArray(question.allowedTypes) ? question.allowedTypes.map((t) => (t.startsWith('.') ? t : `.${t}`)).join(',') : undefined}
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  const limited = question.maxFiles ? files.slice(0, question.maxFiles) : files;
                  const names = limited.map((f) => f.name);
                  setAnswer(names);
                  onAnswer(names);
                }}
                className="block w-full text-sm text-gray-600"
              />
              <p className="text-xs mt-2 text-muted-foreground">
                {question.allowedTypes?.length ? `Allowed: ${question.allowedTypes.join(', ')}` : 'Any file type'}
                {question.maxFileSize ? ` • Max ${question.maxFileSize} MB` : ''}
                {question.maxFiles ? ` • Up to ${question.maxFiles} file(s)` : ''}
              </p>
            </div>
            {Array.isArray(answer) && answer.length > 0 && (
              <ul className="text-sm space-y-1 text-left">
                {answer.map((name) => (
                  <li key={name}>• {name}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Signature */}
        {question.type === "signature" && (
          <div className="space-y-2">
            <Input
              type="text"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your name to sign"
              className="text-base h-11 sm:h-12 border border-border/60 transition-colors bg-white"
              style={{ borderColor: '#E2E7EF' }}
              data-testid="input-signature"
            />
            <p className="text-xs text-muted-foreground">Signature capture placeholder</p>
          </div>
        )}

        {/* Video */}
        {question.type === "video" && (
          <div className="space-y-3">
            <div className="w-full overflow-hidden rounded-lg border" style={{ borderColor: '#E2E7EF' }}>
              {(question as any).videoUrl ? (
                <iframe
                  src={(question as any).videoUrl}
                  title={question.question}
                  className="w-full aspect-video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="aspect-video flex items-center justify-center text-sm text-muted-foreground bg-gray-50">
                  Video URL not provided
                </div>
              )}
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setAnswer('viewed');
                onAnswer('viewed');
                triggerAutoAdvance();
              }}
            >
              Mark as viewed
            </Button>
          </div>
        )}

        {/* Audio Capture */}
        {question.type === "audio_capture" && (
          <div className="space-y-2">
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAnswer(file.name);
                onAnswer(file.name);
              }}
              className="block w-full text-sm text-gray-600"
            />
            <p className="text-xs text-muted-foreground">
              {question.maxDuration ? `Max duration: ${question.maxDuration} seconds.` : 'Upload an audio clip.'}
            </p>
            {answer && typeof answer === 'string' && (
              <p className="text-xs text-emerald-600">Attached: {answer}</p>
            )}
          </div>
        )}

        {/* Section Divider */}
        {question.type === "section" && (
          <div className="py-4 border-b" style={{ borderColor: '#E2E7EF' }}>
            <p className="text-muted-foreground">{question.description}</p>
          </div>
        )}

        {/* Statement (Information Display) */}
        {question.type === "statement" && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E7EF' }}>
            <p className="text-sm" style={{ color: '#1C2635' }}>{question.description}</p>
          </div>
        )}

        {/* Legal/Consent */}
        {question.type === "legal" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg" style={{ backgroundColor: '#F7F9FC', border: '1px solid #E2E7EF' }}>
              <Checkbox
                id="legal-consent"
                checked={answer === "true"}
                onCheckedChange={(checked) => {
                  const val = checked ? "true" : "false";
                  setAnswer(val);
                  onAnswer(val);
                }}
                className="mt-1"
                data-testid="legal-checkbox"
              />
              <label htmlFor="legal-consent" className="text-sm cursor-pointer" style={{ color: '#1C2635' }}>
                {question.description || "I agree to the terms and conditions"}
                {question.linkUrl && (
                  <a href={question.linkUrl} target="_blank" rel="noopener noreferrer" className="ml-1 underline" style={{ color: '#2F8FA5' }}>
                    {question.linkText || "Read more"}
                  </a>
                )}
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
