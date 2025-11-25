import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle2, Lightbulb, Zap, Loader2 } from "lucide-react";

interface QualityAnalysis {
  score: number;
  issues: string[];
  suggestions: string;
}

interface QuestionQualityFeedbackProps {
  question: string;
  questionType: string;
  options?: string[];
}

function getScoreColor(score: number): string {
  if (score >= 85) return "#22c55e"; // green
  if (score >= 70) return "#10b981"; // emerald
  if (score >= 55) return "#eab308"; // yellow
  return "#ef4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "Exemplary";
  if (score >= 70) return "Strong";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Weak";
  return "Poor";
}

export default function QuestionQualityFeedback({
  question,
  questionType,
  options,
}: QuestionQualityFeedbackProps) {
  const [open, setOpen] = useState(false);
  const [analysis, setAnalysis] = useState<QualityAnalysis | null>(null);

  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/questions/analyze", {
        question,
        questionType,
        options: options?.filter((o) => o.trim()) || [],
      });
      return res.json();
    },
  });

  const handleGetFeedback = async () => {
    setOpen(true);
    if (!analysis) {
      const result = await analyzeMutation.mutateAsync();
      setAnalysis(result);
    }
  };

  const scoreColor = analysis ? getScoreColor(analysis.score) : "#6B7280";
  const scoreLabel = analysis ? getScoreLabel(analysis.score) : "Analyze";

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleGetFeedback}
        disabled={!question.trim() || analyzeMutation.isPending}
        className="mt-2 w-full gap-2"
        data-testid="button-quality-feedback"
      >
        {analyzeMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : analysis ? (
          <>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: scoreColor }}
            >
              {analysis.score}
            </div>
            Quality: {scoreLabel}
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Get Quality Feedback
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Question Quality Analysis</DialogTitle>
            <DialogDescription>
              AI-powered feedback to help you write better survey questions
            </DialogDescription>
          </DialogHeader>

          {analysis && (
            <div className="space-y-6 py-4">
              {/* Quality Score */}
              <div className="flex items-center gap-4 p-4 rounded-lg border">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: scoreColor }}
                >
                  {analysis.score}
                </div>
                <div>
                  <p className="text-lg font-semibold">{scoreLabel}</p>
                  <p className="text-sm text-muted-foreground">
                    {analysis.score >= 85
                      ? "Excellent question with clear wording and neutrality"
                      : analysis.score >= 70
                      ? "Good question with minor improvements possible"
                      : analysis.score >= 55
                      ? "Fair question with room for refinement"
                      : analysis.score >= 40
                      ? "Needs significant revision for better responses"
                      : "Critical issues that must be addressed"}
                  </p>
                </div>
              </div>

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    <p className="font-semibold text-sm">Issues Detected</p>
                  </div>
                  <ul className="space-y-2 ml-6">
                    {analysis.issues.map((issue, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-muted-foreground list-disc"
                      >
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions && (
                <div className="flex gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Suggestion for Improvement
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {analysis.suggestions}
                    </p>
                  </div>
                </div>
              )}

              {/* Success State */}
              {analysis.issues.length === 0 && !analysis.suggestions && (
                <div className="flex gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
                  <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                    Excellent question! It's clear, neutral, and well-structured.
                  </p>
                </div>
              )}
            </div>
          )}

          {analyzeMutation.isPending && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              <p className="ml-2 text-muted-foreground">Analyzing your question...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
