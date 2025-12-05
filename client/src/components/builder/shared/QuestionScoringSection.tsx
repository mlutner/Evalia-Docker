import React, { useState } from "react";
import { Info, Star, Wand2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSurveyBuilder } from "@/contexts/SurveyBuilderContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { getQuestionTypeConfig } from "@/data/questionTypeConfig";
import type { BuilderQuestion } from "@/contexts/SurveyBuilderContext";

export function QuestionScoringSection({ question }: { question: BuilderQuestion }) {
  const { updateQuestion } = useSurveyBuilder();
  const { toast } = useToast();
  const [correctAnswer] = useState<string>("");
  const typeConfig = getQuestionTypeConfig(question.type);

  const suggestScoringMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/ai/chat", {
        message: `Suggest optimal scoring for this question: "${question.text}" with options: ${question.options?.join(
          ", "
        )}. Provide point values for each option.`,
      });
      return res.json();
    },
    onSuccess: (data) => {
      toast({ title: "AI Scoring Suggestion", description: data.response || "See the suggestion" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to get suggestion", variant: "destructive" });
    },
  });

  const isScoreable = typeConfig?.isScoreable ?? false;

  return (
    <div className="p-4 space-y-4">
      {!isScoreable ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <Info size={24} className="mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-500">
            {typeConfig?.displayName || question.type} questions are not scoreable.
          </p>
          <p className="text-xs text-gray-400 mt-1">Only rating, selection, and scale questions can be scored.</p>
        </div>
      ) : (
        <>
          <button
            onClick={() => suggestScoringMutation.mutate()}
            disabled={suggestScoringMutation.isPending}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold
                       text-purple-600 bg-purple-50 border-2 border-purple-200 rounded-lg
                       hover:bg-purple-100 hover:border-purple-300 transition-all group
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 size={16} className="group-hover:rotate-12 transition-transform" />
            <span>{suggestScoringMutation.isPending ? "Analyzing..." : "AI Suggest Scoring"}</span>
          </button>

          <div className="flex items-center gap-2">
            <Checkbox
              id="scorable"
              checked={question.scorable || false}
              onCheckedChange={(checked) => updateQuestion(question.id, { scorable: !!checked })}
            />
            <Label htmlFor="scorable" className="text-sm text-gray-700 cursor-pointer font-semibold">
              Enable Scoring for this Question
            </Label>
          </div>

          {question.scorable ? (
            <>
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Score Weight</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.1"
                  value={question.scoreWeight || 1}
                  onChange={(e) => updateQuestion(question.id, { scoreWeight: Number(e.target.value) })}
                  className="text-sm h-9"
                />
                <p className="text-xs text-gray-500">Multiplier for this question's score</p>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-700">Scoring Category</Label>
                <Input
                  value={question.scoringCategory || ""}
                  onChange={(e) => updateQuestion(question.id, { scoringCategory: e.target.value })}
                  placeholder="e.g., Knowledge, Skills"
                  className="text-sm h-9"
                />
                <p className="text-xs text-gray-500">Group questions into scoring categories</p>
              </div>

              {question.options && question.options.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-gray-700">Point Distribution</Label>
                  <div className="space-y-2">
                    {question.options.map((option, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 flex-1 truncate">{option}</span>
                        <Input
                          type="number"
                          min="0"
                          value={question.scoreValues?.[idx] || 0}
                          onChange={(e) => {
                            const newScoreValues = [...(question.scoreValues || question.options!.map(() => 0))];
                            newScoreValues[idx] = parseInt(e.target.value) || 0;
                            updateQuestion(question.id, { scoreValues: newScoreValues });
                          }}
                          className="w-20 h-8 text-sm text-center"
                        />
                        <span className="text-xs text-gray-400">pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
              <Star size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Enable scoring to add point values and track correct answers</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
