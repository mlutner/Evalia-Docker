import React from "react";
import { GripVertical } from "lucide-react";
import { getIconForType, QUESTION_TYPES } from "@/data/questionTypeConfig";
import type { BuilderQuestion } from "@/contexts/SurveyBuilderContext";

export interface QuestionHeaderProps {
  question: BuilderQuestion;
  questionNumber?: number;
}

export function QuestionHeader({ question, questionNumber }: QuestionHeaderProps) {
  const Icon = getIconForType(question.type);
  const typeConfig = QUESTION_TYPES[question.type];
  const displayNumber =
    questionNumber ?? (typeof (question as any).order === "number" ? (question as any).order + 1 : undefined);

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <GripVertical size={20} className="text-gray-400 cursor-grab active:cursor-grabbing" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 border border-purple-200 flex items-center justify-center">
            <span className="text-sm font-bold text-purple-600">{displayNumber ?? "-"}</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100 px-3 py-1.5 rounded-full">
            <Icon size={12} />
            <span>{question.displayType || typeConfig?.displayName || question.type}</span>
          </div>
          {question.required && (
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded border border-red-200">
              Required
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
