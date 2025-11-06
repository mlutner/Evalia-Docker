import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Question, QuestionType } from "@shared/schema";

export type { Question, QuestionType };

interface QuestionCardProps {
  question: Question;
  onAnswer: (answer: string | string[]) => void;
  initialAnswer?: string | string[];
}

export default function QuestionCard({ question, onAnswer, initialAnswer }: QuestionCardProps) {
  const [answer, setAnswer] = useState<string | string[]>(initialAnswer || (question.type === 'checkbox' ? [] : ''));

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
    <div className="w-full max-w-4xl mx-auto px-6 animate-in fade-in slide-in-from-bottom-6 duration-500" data-testid={`question-${question.id}`}>
      <div className="mb-12">
        <h2 className="text-4xl md:text-5xl font-semibold mb-4 leading-tight">
          {question.question}
          {question.required && <span className="text-destructive ml-2">*</span>}
        </h2>
        {question.description && (
          <p className="text-muted-foreground text-xl mt-3">{question.description}</p>
        )}
      </div>

      <div className="space-y-5">
        {question.type === "text" && (
          <Input
            type="text"
            value={answer as string}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer here..."
            className="text-xl h-14 border-2 focus:border-primary transition-colors"
            data-testid="input-text-answer"
            autoFocus
          />
        )}

        {question.type === "email" && (
          <Input
            type="email"
            value={answer as string}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="your@email.com"
            className="text-xl h-14 border-2 focus:border-primary transition-colors"
            data-testid="input-email-answer"
            autoFocus
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={answer as string}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter a number..."
            className="text-xl h-14 border-2 focus:border-primary transition-colors"
            data-testid="input-number-answer"
            autoFocus
          />
        )}

        {question.type === "textarea" && (
          <Textarea
            value={answer as string}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer here..."
            className="text-xl min-h-[160px] border-2 focus:border-primary transition-colors"
            data-testid="input-textarea-answer"
            autoFocus
          />
        )}

        {question.type === "multiple_choice" && question.options && (
          <RadioGroup value={answer as string} onValueChange={handleMultipleChoice}>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div 
                  key={index} 
                  className="group flex items-center space-x-4 p-5 rounded-xl hover-elevate active-elevate-2 border-2 border-border hover:border-primary/50 transition-all cursor-pointer" 
                  data-testid={`option-${index}`}
                  onClick={() => handleMultipleChoice(option)}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} className="w-5 h-5" />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-lg font-medium">
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
                  className="group flex items-center space-x-4 p-5 rounded-xl hover-elevate active-elevate-2 border-2 border-border hover:border-primary/50 transition-all cursor-pointer" 
                  data-testid={`checkbox-${index}`}
                  onClick={() => handleCheckboxChange(option, !isChecked)}
                >
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                    className="w-5 h-5"
                  />
                  <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer text-lg font-medium">
                    {option}
                  </Label>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
