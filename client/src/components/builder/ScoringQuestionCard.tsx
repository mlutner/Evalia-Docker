import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useDraggable } from "@dnd-kit/core";
import type { Question } from "@shared/schema";

interface ScoringQuestionCardProps {
  question: Question;
  currentCategoryId?: string;
  isAssigned?: boolean;
  otherCategories: Array<{ id: string; name: string }>;
  onMoveToCategory: (targetCatId: string) => void;
  onMoveToUnassigned: () => void;
  getQuestionTypeLabel: (type: string) => string;
  getMaxPointsForQuestion: (q: Question) => number;
}

export function ScoringQuestionCard({
  question,
  currentCategoryId,
  isAssigned = false,
  otherCategories,
  onMoveToCategory,
  onMoveToUnassigned,
  getQuestionTypeLabel,
  getMaxPointsForQuestion,
}: ScoringQuestionCardProps) {
  const { setNodeRef } = useDraggable({
    id: question.id,
  });
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  return (
    <div
      ref={setNodeRef}
      className="p-3 rounded border text-xs group transition-colors"
      style={{ backgroundColor: '#F7F9FC', borderColor: '#E2E7EF' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#F0F2F5';
        e.currentTarget.style.borderColor = '#2F8FA5';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#F7F9FC';
        e.currentTarget.style.borderColor = '#E2E7EF';
      }}
      data-testid={`question-card-${question.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-sm" style={{ color: '#1C2635' }}>{question.question}</p>
          <p className="text-xs mt-0.5" style={{ color: '#6A7789' }}>
            {getQuestionTypeLabel(question.type)} • {getMaxPointsForQuestion(question)}pt
          </p>
        </div>

        {isAssigned && (
          <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <Select
              open={showMoveMenu}
              onOpenChange={setShowMoveMenu}
              onValueChange={(value) => {
                if (value === "unassigned") {
                  onMoveToUnassigned();
                } else {
                  onMoveToCategory(value);
                }
              }}
            >
              <SelectTrigger className="h-6 w-24 text-xs px-2" data-testid={`button-move-question-${question.id}`}>
                <ArrowRight className="w-3 h-3 mr-1" />
                <span>Move</span>
              </SelectTrigger>
              <SelectContent align="end">
                {otherCategories.length > 0 && (
                  <>
                    <div className="px-2 py-1.5 text-xs font-semibold" style={{ color: '#6A7789' }}>Move to Category</div>
                    {otherCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <div className="my-1 h-px bg-muted" />
                  </>
                )}
                <SelectItem value="unassigned">Unassigned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}
