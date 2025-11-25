import { useEffect, useState, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle2, Lightbulb, Zap } from "lucide-react";

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
  if (score >= 80) return "#22c55e"; // green
  if (score >= 60) return "#eab308"; // yellow
  return "#ef4444"; // red
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Fair";
  return "Needs Improvement";
}

export default function QuestionQualityFeedback({
  question,
  questionType,
  options,
}: QuestionQualityFeedbackProps) {
  const [analysis, setAnalysis] = useState<QualityAnalysis | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

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

  // Debounce the analysis
  useEffect(() => {
    if (!question.trim()) {
      setAnalysis(null);
      return;
    }

    setIsDebouncing(true);
    const timer = setTimeout(() => {
      analyzeMutation.mutate();
      setIsDebouncing(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [question, questionType, options]);

  useEffect(() => {
    if (analyzeMutation.data) {
      setAnalysis(analyzeMutation.data);
    }
  }, [analyzeMutation.data]);

  if (!question.trim()) {
    return null;
  }

  if (isDebouncing || analyzeMutation.isPending) {
    return (
      <div className="mt-3 px-3 py-2 text-xs text-muted-foreground animate-pulse">
        Analyzing question quality...
      </div>
    );
  }

  if (!analysis) {
    return null;
  }

  const scoreColor = getScoreColor(analysis.score);
  const scoreLabel = getScoreLabel(analysis.score);

  return (
    <Card className="mt-3 p-3 border-l-4" style={{ borderLeftColor: scoreColor }}>
      {/* Quality Score Header */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
          style={{ backgroundColor: scoreColor }}
        >
          {analysis.score}
        </div>
        <div>
          <p className="text-sm font-semibold">Quality Score: {scoreLabel}</p>
          <p className="text-xs text-muted-foreground">AI-powered feedback</p>
        </div>
      </div>

      {/* Issues Section */}
      {analysis.issues.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <p className="text-xs font-semibold">Issues Detected:</p>
          </div>
          <ul className="space-y-1 ml-6">
            {analysis.issues.map((issue, idx) => (
              <li key={idx} className="text-xs text-muted-foreground">
                • {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions Section */}
      {analysis.suggestions && (
        <div className="mt-3 flex gap-2">
          <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: scoreColor }} />
          <div>
            <p className="text-xs font-semibold mb-1">Suggestion:</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {analysis.suggestions}
            </p>
          </div>
        </div>
      )}

      {/* Success State */}
      {analysis.issues.length === 0 && !analysis.suggestions && (
        <div className="mt-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <p className="text-xs text-green-600 font-medium">
            Great question! Clear, neutral, and well-structured.
          </p>
        </div>
      )}
    </Card>
  );
}
