/**
 * @design-locked Magic Patterns golden spec
 * DO NOT modify structure/CSS without comparing to MP golden TSX
 */
import React from 'react';
import { GripVertical, Type, CheckSquare, Star, Sliders } from 'lucide-react';
import type { BuilderQuestion } from '../INTEGRATION_GUIDE';

export interface QuestionHeaderProps {
  question: BuilderQuestion;
  questionNumber?: number;
  showDragHandle?: boolean;
  className?: string;
}

export function QuestionHeader({
  question,
  questionNumber,
  showDragHandle = false,
  className = ''
}: QuestionHeaderProps) {
  const displayNumber = questionNumber ?? (typeof question.order === 'number' ? question.order + 1 : undefined);

  const typeIcons: Record<string, React.ReactNode> = {
    text: <Type size={14} />,
    choice: <CheckSquare size={14} />,
    multiple_choice: <CheckSquare size={14} />,
    rating: <Star size={14} />,
    scale: <Sliders size={14} />,
    likert: <Sliders size={14} />,
    nps: <Star size={14} />,
    opinion_scale: <Sliders size={14} />
  };

  const icon = typeIcons[question.type] || <Type size={14} />;

  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {showDragHandle && (
          <GripVertical size={16} className="text-gray-400 cursor-grab active:cursor-grabbing" />
        )}

        <div className="w-8 h-8 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-400 bg-gray-50 flex-shrink-0">
          {icon}
        </div>

        <div>
          <div className="text-xs font-mono text-gray-500 mb-1">
            QUESTION {displayNumber ?? '?'}
          </div>
          <div className="text-sm font-medium text-gray-900">
            {question.displayType || question.type}
          </div>
        </div>

        {question.required && (
          <span className="text-xs font-mono text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
            Required
          </span>
        )}
      </div>
    </div>
  );
}

