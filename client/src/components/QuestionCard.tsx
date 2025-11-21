import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { MessageSquare, AtSign, Hash, Type, CheckCircle2, Radio } from "lucide-react";
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
  };
  return labels[type] || type;
}

export default function QuestionCard({ question, onAnswer, initialAnswer }: QuestionCardProps) {
  const [answer, setAnswer] = useState<string | string[]>(initialAnswer || (question.type === 'checkbox' ? [] : ''));

  // Reset answer state when moving to a new question
  useEffect(() => {
    setAnswer(initialAnswer || (question.type === 'checkbox' ? [] : ''));
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

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-6 duration-500" data-testid={`question-${question.id}`}>
      {/* Question Type Badge */}
      <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs sm:text-sm font-medium">
        {getQuestionTypeIcon(question.type)}
        <span>{getQuestionTypeLabel(question.type)}</span>
      </div>

      <div className="mb-8 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold mb-3 md:mb-4 leading-tight">
          {question.question}
          {question.required && (
            <span className="text-destructive ml-2" title="This field is required">*</span>
          )}
        </h2>
        {question.description && (
          <p className="text-muted-foreground text-base sm:text-lg md:text-xl mt-2 md:mt-3">{question.description}</p>
        )}
      </div>

      <div className="space-y-5">
        {question.type === "text" && (
          <>
            <Input
              type="text"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your answer here..."
              className="text-base sm:text-lg md:text-xl h-12 sm:h-14 border-2 focus:border-primary transition-colors"
              data-testid="input-text-answer"
              autoFocus
            />
            <p className="text-xs sm:text-sm text-muted-foreground">Brief text response</p>
          </>
        )}

        {question.type === "email" && (
          <>
            <Input
              type="email"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="your@email.com"
              className="text-base sm:text-lg md:text-xl h-12 sm:h-14 border-2 focus:border-primary transition-colors"
              data-testid="input-email-answer"
              autoFocus
            />
            <p className="text-xs sm:text-sm text-muted-foreground">Enter a valid email address</p>
          </>
        )}

        {question.type === "number" && (
          <>
            <Input
              type="number"
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Enter a number..."
              className="text-base sm:text-lg md:text-xl h-12 sm:h-14 border-2 focus:border-primary transition-colors"
              data-testid="input-number-answer"
              autoFocus
            />
            <p className="text-xs sm:text-sm text-muted-foreground">Numeric response only</p>
          </>
        )}

        {question.type === "textarea" && (
          <>
            <Textarea
              value={answer as string}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="Type your answer here..."
              className="text-base sm:text-lg md:text-xl min-h-[120px] sm:min-h-[160px] border-2 focus:border-primary transition-colors"
              data-testid="input-textarea-answer"
              autoFocus
            />
            <p className="text-xs sm:text-sm text-muted-foreground">Detailed text response</p>
          </>
        )}

        {question.type === "multiple_choice" && question.options && (
          <RadioGroup value={answer as string} onValueChange={handleMultipleChoice}>
            <div className="space-y-3 sm:space-y-4">
              {question.options.map((option, index) => (
                <div 
                  key={index} 
                  className="group flex items-center space-x-3 sm:space-x-4 p-4 sm:p-5 rounded-xl hover-elevate active-elevate-2 border-2 border-border bg-card/40 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer" 
                  data-testid={`option-${index}`}
                  onClick={() => handleMultipleChoice(option)}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} className="w-5 h-5 shrink-0" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base sm:text-lg font-medium">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {question.type === "checkbox" && question.options && (
          <div className="space-y-3 sm:space-y-4">
            {question.options.map((option, index) => {
              const isChecked = Array.isArray(answer) && answer.includes(option);
              return (
                <div 
                  key={index} 
                  className="group flex items-center space-x-4 p-4 sm:p-5 rounded-xl hover-elevate active-elevate-2 border-2 border-border bg-card/40 hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer" 
                  data-testid={`checkbox-${index}`}
                  onClick={() => handleCheckboxChange(option, !isChecked)}
                >
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer text-base sm:text-lg font-medium">
                    {option}
                  </Label>
                </div>
              );
            })}
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Select one or more options</p>
          </div>
        )}
      </div>
    </div>
  );
}
