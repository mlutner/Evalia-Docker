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
      className="p-3 bg-background rounded border text-xs group hover:bg-muted/40 transition-colors"
      data-testid={`question-card-${question.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="truncate font-medium text-sm">{question.question}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
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
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">Move to Category</div>
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
