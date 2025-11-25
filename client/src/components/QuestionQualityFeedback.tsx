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
  if (score >= 85) return "#37C0A3"; // Icon Teal - Exemplary
  if (score >= 70) return "#2F8FA5"; // Primary Teal - Strong
  if (score >= 55) return "#A3D65C"; // Accent Lime - Fair
  return "#EF4444"; // Red - Weak/Poor
}

function getScoreBackground(score: number): string {
  if (score >= 85) return "#E1F6F3"; // Teal light background
  if (score >= 70) return "#E1F6F3"; // Teal light background
  if (score >= 55) return "#F3FDE3"; // Lime light background
  return "#FEE2E2"; // Red light background
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
        variant="outline"
        size="sm"
        onClick={handleGetFeedback}
        disabled={!question.trim() || analyzeMutation.isPending}
        className="mt-3 w-full gap-2 font-semibold border-2 transition-colors"
        style={{
          borderColor: analysis ? scoreColor : "#2F8FA5",
          color: analysis ? scoreColor : "#2F8FA5",
        }}
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
              className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: scoreColor }}
            >
              {analysis.score}
            </div>
            Score: {scoreLabel}
          </>
        ) : (
          <>
            <Zap className="w-4 h-4" />
            Get AI Feedback on Question
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
              <div
                className="flex items-center gap-4 p-4 rounded-lg border"
                style={{
                  backgroundColor: getScoreBackground(analysis.score),
                  borderColor: scoreColor,
                }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl"
                  style={{ backgroundColor: scoreColor }}
                >
                  {analysis.score}
                </div>
                <div>
                  <p className="text-lg font-semibold" style={{ color: scoreColor }}>
                    {scoreLabel}
                  </p>
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
                    <AlertCircle className="w-4 h-4" style={{ color: "#A3D65C" }} />
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
                <div
                  className="flex gap-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: "#F3FDE3",
                    borderColor: "#A3D65C",
                  }}
                >
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#A3D65C" }} />
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: "#1C2635" }}>
                      Suggestion for Improvement
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {analysis.suggestions}
                    </p>
                  </div>
                </div>
              )}

              {/* Success State */}
              {analysis.issues.length === 0 && !analysis.suggestions && (
                <div
                  className="flex gap-3 p-3 rounded-lg border"
                  style={{
                    backgroundColor: "#E1F6F3",
                    borderColor: "#37C0A3",
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#37C0A3" }} />
                  <p className="text-sm font-medium" style={{ color: "#1C2635" }}>
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
