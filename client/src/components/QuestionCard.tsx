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
    <div className="w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-300" data-testid={`question-${question.id}`}>
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-semibold mb-3">
          {question.question}
          {question.required && <span className="text-destructive ml-1">*</span>}
        </h2>
        {question.description && (
          <p className="text-muted-foreground text-lg">{question.description}</p>
        )}
      </div>

      <div className="space-y-4">
        {question.type === "text" && (
          <Input
            type="text"
            value={answer as string}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer here..."
            className="text-lg h-12"
            data-testid="input-text-answer"
          />
        )}

        {question.type === "email" && (
          <Input
            type="email"
            value={answer as string}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="your@email.com"
            className="text-lg h-12"
            data-testid="input-email-answer"
          />
        )}

        {question.type === "number" && (
          <Input
            type="number"
            value={answer as string}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Enter a number..."
            className="text-lg h-12"
            data-testid="input-number-answer"
          />
        )}

        {question.type === "textarea" && (
          <Textarea
            value={answer as string}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder="Type your answer here..."
            className="text-lg min-h-[120px] resize-none"
            data-testid="input-textarea-answer"
          />
        )}

        {question.type === "multiple_choice" && question.options && (
          <RadioGroup value={answer as string} onValueChange={handleMultipleChoice}>
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-4 rounded-lg hover-elevate border" data-testid={`option-${index}`}>
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {question.type === "checkbox" && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isChecked = Array.isArray(answer) && answer.includes(option);
              return (
                <div key={index} className="flex items-center space-x-3 p-4 rounded-lg hover-elevate border" data-testid={`checkbox-${index}`}>
                  <Checkbox
                    id={`checkbox-${index}`}
                    checked={isChecked}
                    onCheckedChange={(checked) => handleCheckboxChange(option, checked as boolean)}
                  />
                  <Label htmlFor={`checkbox-${index}`} className="flex-1 cursor-pointer text-base">
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
