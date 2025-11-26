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
  const labels: Record<QuestionType, string> = {
    text: "Short answer",
    email: "Email",
    number: "Number",
    textarea: "Long answer",
    multiple_choice: "Multiple choice",
    checkbox: "Select all that apply",
    rating: "Rating scale",
    nps: "Net Promoter Score",
    matrix: "Matrix/Grid",
    ranking: "Ranking",
    date: "Date picker",
    section: "Section divider",
  };
  return labels[type] || type;
}

export default function QuestionCard({ question, onAnswer, initialAnswer, onAutoAdvance }: QuestionCardProps) {
  const [answer, setAnswer] = useState<string | string[]>(initialAnswer || (question.type === 'checkbox' ? [] : ''));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Helper to trigger auto-advance with 200ms delay for single-choice questions
  const triggerAutoAdvance = () => {
    if (onAutoAdvance) {
      setTimeout(() => onAutoAdvance(), 200);
    }
  };

  // Reset answer state when moving to a new question
  useEffect(() => {
    setAnswer(initialAnswer || (question.type === 'checkbox' ? [] : ''));
    setHoverRating(null);
  }, [question.id, question.type]);

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
      <h2 className="question-title" data-testid="text-question">
        {question.question}
        {question.required && (
          <span className="required" title="This field is required">*</span>
        )}
      </h2>

      {question.description && (
        <p className="text-sm mt-2 mb-4" style={{ color: theme.colors.textSecondary }} data-testid="text-question-description">{question.description}</p>
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
            {/* Star Rating UI */}
            <div className="flex items-center justify-center gap-3 py-6">
              {[1, 2, 3, 4, 5].map((star) => {
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

            {/* Labels below stars */}
            <div className="flex items-center justify-center gap-2 text-xs font-medium" style={{ color: '#6A7789' }}>
              <span>Not at all</span>
              <span style={{ color: '#A3D65C' }}>•</span>
              <span>Very much</span>
            </div>

            {/* Selected rating display */}
            {answer && (
              <div className="text-center p-3 rounded-lg" style={{ backgroundColor: '#F0F2F5', border: '1px solid #E2E7EF' }}>
                <div className="text-sm font-medium" style={{ color: '#37C0A3' }}>
                  {['', 'Not at all', 'Slightly', 'Moderately', 'Mostly', 'Very much'][parseInt(answer as string)]}
                </div>
                <div className="text-xs mt-1" style={{ color: '#6A7789' }}>
                  {answer} out of 5
                </div>
              </div>
            )}
          </div>
        )}

        {question.type === "nps" && (
          <>
            <div className="flex flex-col space-y-4">
              <div className="flex justify-between items-center gap-1">
                <span className="text-xs font-medium" style={{ color: '#6A7789' }}>Not likely</span>
                <span className="text-xs font-medium" style={{ color: '#6A7789' }}>Extremely likely</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 11 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const val = i.toString();
                      setAnswer(val);
                      onAnswer(val);
                      triggerAutoAdvance();
                    }}
                    data-testid={`button-nps-${i}`}
                    style={{
                      height: '40px',
                      borderRadius: '8px',
                      border: answer === i.toString() ? '2px solid #1F6F78' : '1px solid #E2E7EF',
                      backgroundColor: answer === i.toString() ? '#2F8FA5' : '#F7F9FC',
                      color: answer === i.toString() ? 'white' : '#1C2635',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    className="hover-elevate active-elevate-2"
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>How likely are you to recommend this training? (0 = Not likely, 10 = Extremely likely)</p>
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
      </div>
    </div>
  );
}
