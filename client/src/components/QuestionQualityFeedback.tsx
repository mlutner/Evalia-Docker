import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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

// Color constants aligned with Evalia design system
const COLOR_SCHEME = {
  exemplary: { score: "#37C0A3", background: "#E1F6F3", label: "Exemplary" },
  strong: { score: "#2F8FA5", background: "#E1F6F3", label: "Strong" },
  fair: { score: "#A3D65C", background: "#F3FDE3", label: "Fair" },
  weak: { score: "#EF4444", background: "#FEE2E2", label: "Weak" },
  poor: { score: "#EF4444", background: "#FEE2E2", label: "Poor" },
  primary: "#2F8FA5",
  lime: "#A3D65C",
  text: "#1C2635",
};

function getScoreColor(score: number): string {
  if (score >= 85) return COLOR_SCHEME.exemplary.score;
  if (score >= 70) return COLOR_SCHEME.strong.score;
  if (score >= 55) return COLOR_SCHEME.fair.score;
  return COLOR_SCHEME.weak.score;
}

function getScoreBackground(score: number): string {
  if (score >= 85) return COLOR_SCHEME.exemplary.background;
  if (score >= 70) return COLOR_SCHEME.strong.background;
  if (score >= 55) return COLOR_SCHEME.fair.background;
  return COLOR_SCHEME.weak.background;
}

function getScoreLabel(score: number): string {
  if (score >= 85) return COLOR_SCHEME.exemplary.label;
  if (score >= 70) return COLOR_SCHEME.strong.label;
  if (score >= 55) return COLOR_SCHEME.fair.label;
  if (score >= 40) return COLOR_SCHEME.weak.label;
  return COLOR_SCHEME.poor.label;
}

function getScoreFeedbackMessage(score: number): string {
  if (score >= 85) return "Excellent question with clear wording and neutrality";
  if (score >= 70) return "Good question with minor improvements possible";
  if (score >= 55) return "Fair question with room for refinement";
  if (score >= 40) return "Needs significant revision for better responses";
  return "Critical issues that must be addressed";
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

  const scoreColor = analysis ? getScoreColor(analysis.score) : COLOR_SCHEME.primary;
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
          borderColor: analysis ? scoreColor : COLOR_SCHEME.primary,
          color: analysis ? scoreColor : COLOR_SCHEME.primary,
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
                    {getScoreFeedbackMessage(analysis.score)}
                  </p>
                </div>
              </div>

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" style={{ color: COLOR_SCHEME.lime }} />
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
                    backgroundColor: COLOR_SCHEME.fair.background,
                    borderColor: COLOR_SCHEME.lime,
                  }}
                >
                  <Lightbulb className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLOR_SCHEME.lime }} />
                  <div>
                    <p className="text-sm font-semibold mb-1" style={{ color: COLOR_SCHEME.text }}>
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
                    backgroundColor: COLOR_SCHEME.exemplary.background,
                    borderColor: COLOR_SCHEME.exemplary.score,
                  }}
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLOR_SCHEME.exemplary.score }} />
                  <p className="text-sm font-medium" style={{ color: COLOR_SCHEME.text }}>
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
