import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, AtSign, Hash, Type, CheckCircle2, Radio, ThumbsUp, Gauge, Grid3x3, List, Calendar, Star } from "lucide-react";
import type { Question, QuestionType } from "@shared/schema";

export type { Question, QuestionType };

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string | string[]) => void;
  initialAnswer?: string | string[];
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
  };
  return labels[type] || type;
}

export default function QuestionCard({ question, onAnswer, initialAnswer }: QuestionCardProps) {
  const [answer, setAnswer] = useState<string | string[]>(initialAnswer || (question.type === 'checkbox' ? [] : ''));
  const [hoverRating, setHoverRating] = useState<number | null>(null);

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
        <p className="text-muted-foreground text-sm mt-2 mb-4" data-testid="text-question-description">{question.description}</p>
      )}

      <div className="space-y-6">
        {question.type === "text" && (
          <>
            <Input
              type="text"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your answer here..."
              className="text-base h-11 sm:h-12 border border-border/60 focus:border-primary transition-colors bg-white dark:bg-slate-950"
              data-testid="input-text-answer"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Brief text response</p>
          </>
        )}

        {question.type === "email" && (
          <>
            <Input
              type="email"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="your@email.com"
              className="text-base h-11 sm:h-12 border border-border/60 focus:border-primary transition-colors bg-white dark:bg-slate-950"
              data-testid="input-email-answer"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Enter a valid email address</p>
          </>
        )}

        {question.type === "number" && (
          <>
            <Input
              type="number"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter a number..."
              className="text-base h-11 sm:h-12 border border-border/60 focus:border-primary transition-colors bg-white dark:bg-slate-950"
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
          <RadioGroup value={answer as string} onValueChange={handleMultipleChoice}>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 p-3.5 rounded-lg hover-elevate active-elevate-2 border border-border/50 bg-card/30 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer" 
                  data-testid={`option-${index}`}
                  onClick={() => handleMultipleChoice(option)}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} className="w-4 h-4 shrink-0" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-sm sm:text-base font-normal">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {question.type === "checkbox" && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isChecked = Array.isArray(answer) && answer.includes(option);
              return (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 p-3.5 rounded-lg hover-elevate active-elevate-2 border border-border/50 bg-card/30 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer" 
                  data-testid={`checkbox-${index}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCheckboxChange(option, !isChecked);
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
            <p className="text-xs text-muted-foreground mt-2">Select one or more options</p>
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
                      handleMultipleChoice(star.toString());
                      setHoverRating(null);
                    }}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    data-testid={`rating-${star}`}
                    className="transition-transform active-elevate-2"
                  >
                    <Star
                      className={`w-12 h-12 transition-all ${
                        isSelected || isHovered
                          ? "fill-amber-400 stroke-amber-400 scale-110"
                          : "fill-muted-foreground/20 stroke-muted-foreground/40 hover:scale-105"
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            {/* Labels below stars */}
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Not at all</span>
              <span className="text-muted-foreground/40">•</span>
              <span>Very much</span>
            </div>

            {/* Selected rating display */}
            {answer && (
              <div className="text-center p-3 rounded-lg bg-primary/8 border border-primary/20">
                <div className="text-sm font-medium text-primary">
                  {['', 'Not at all', 'Slightly', 'Moderately', 'Mostly', 'Very much'][parseInt(answer as string)]}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
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
                <span className="text-xs font-medium text-muted-foreground">Not likely</span>
                <span className="text-xs font-medium text-muted-foreground">Extremely likely</span>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 11 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      const val = i.toString();
                      setAnswer(val);
                      onAnswer(val);
                    }}
                    data-testid={`button-nps-${i}`}
                    className={`h-10 rounded-lg border transition-all text-sm font-medium ${
                      answer === i.toString()
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border/50 bg-card/30 hover:bg-primary/5 hover:border-primary/30"
                    } hover-elevate active-elevate-2`}
                  >
                    {i}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">How likely are you to recommend this training? (0 = Not likely, 10 = Extremely likely)</p>
          </>
        )}

        {question.type === "matrix" && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border p-2 text-left font-medium bg-muted/50 min-w-[120px]"></th>
                    {question.colLabels?.map((col) => (
                      <th key={col} className="border p-2 text-center font-medium bg-muted/50 min-w-[80px]">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {question.rowLabels?.map((row) => (
                    <tr key={row}>
                      <td className="border p-2 font-medium text-left">{row}</td>
                      {question.colLabels?.map((col) => {
                        const isSelected = answer === `${row}|${col}`;
                        return (
                          <td key={`${row}-${col}`} className="border p-2 text-center">
                            <button
                              onClick={() => handleMatrixChange(row, col)}
                              data-testid={`button-matrix-${row}-${col}`}
                              className={`w-6 h-6 mx-auto rounded-full border-2 transition-all ${
                                isSelected
                                  ? "border-primary bg-primary"
                                  : "border-border/50 hover:border-primary/50"
                              }`}
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-muted-foreground">Select one response per row</p>
          </>
        )}

        {question.type === "ranking" && (
          <>
            <div className="space-y-2">
              {question.options?.map((option, idx) => (
                <div 
                  key={option} 
                  className="flex items-center gap-3 p-3 border rounded-lg bg-card/30 hover:bg-primary/5 hover-elevate active-elevate-2"
                  data-testid={`ranking-item-${idx}`}
                >
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-primary">{idx + 1}</span>
                  </div>
                  <span className="text-sm flex-1">{option}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Items are ranked from most to least important</p>
          </>
        )}

        {question.type === "date" && (
          <>
            <Input
              type="date"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              className="text-base h-11 sm:h-12 border border-border/60 focus:border-primary transition-colors bg-white dark:bg-slate-950"
              data-testid="input-date-answer"
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Select a date</p>
          </>
        )}
      </div>
    </div>
  );
}
