import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, ChevronDown, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface AIInsight {
  themes: Array<{ theme: string; mentions: number; percentage: number; exampleQuotes: string[] }>;
  sentiment: { positive: number; neutral: number; negative: number };
  summary: string;
  topPainPoints: string[];
  recommendations: string[];
}

interface AIInsightsCardProps {
  insights: AIInsight | null;
  isLoading: boolean;
  error?: string | null;
}

export default function AIInsightsCard({ insights, isLoading, error }: AIInsightsCardProps) {
  const [expanded, setExpanded] = useState(false);

  if (!insights && !isLoading && !error) return null;

  if (error) {
    return (
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/30 dark:border-amber-900 mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0" />
            <CardTitle className="text-sm font-semibold">Analysis Unavailable</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700 mb-8">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-slate-600 dark:border-t-slate-300 animate-spin" />
            <CardTitle className="text-sm font-semibold">Analyzing Responses</CardTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Extracting themes and patterns...</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-full" />
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full w-5/6" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const sentimentTotal = insights.sentiment.positive + insights.sentiment.neutral + insights.sentiment.negative;

  return (
    <Card className="border-slate-200 dark:border-slate-700 mb-8 hover-elevate">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold">AI Analysis</CardTitle>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{insights.summary}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-toggle-insights"
            className="h-8 w-8 flex-shrink-0"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <div className="px-6 pb-4 space-y-4">
        {/* Sentiment Bars */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Sentiment</p>
          <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-700 gap-0.5">
            {insights.sentiment.positive > 0 && (
              <div
                className="bg-green-500"
                style={{ width: `${(insights.sentiment.positive / sentimentTotal) * 100}%` }}
                title={`${insights.sentiment.positive}% Positive`}
              />
            )}
            {insights.sentiment.neutral > 0 && (
              <div
                className="bg-slate-400 dark:bg-slate-500"
                style={{ width: `${(insights.sentiment.neutral / sentimentTotal) * 100}%` }}
                title={`${insights.sentiment.neutral}% Neutral`}
              />
            )}
            {insights.sentiment.negative > 0 && (
              <div
                className="bg-red-500"
                style={{ width: `${(insights.sentiment.negative / sentimentTotal) * 100}%` }}
                title={`${insights.sentiment.negative}% Negative`}
              />
            )}
          </div>
          <div className="flex gap-4 mt-2 text-xs">
            {insights.sentiment.positive > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="font-medium text-foreground">{insights.sentiment.positive}%</span>
                <span className="text-muted-foreground">Positive</span>
              </div>
            )}
            {insights.sentiment.neutral > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500" />
                <span className="font-medium text-foreground">{insights.sentiment.neutral}%</span>
                <span className="text-muted-foreground">Neutral</span>
              </div>
            )}
            {insights.sentiment.negative > 0 && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="font-medium text-foreground">{insights.sentiment.negative}%</span>
                <span className="text-muted-foreground">Negative</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Themes */}
        {insights.themes.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Themes ({insights.themes.length})</p>
            <div className="space-y-2">
              {insights.themes.slice(0, expanded ? undefined : 3).map((theme, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{theme.theme}</span>
                    <Badge variant="secondary" className="text-xs">{theme.percentage}%</Badge>
                  </div>
                  {theme.exampleQuotes.length > 0 && (
                    <p className="text-xs text-muted-foreground italic leading-relaxed p-2 bg-slate-50 dark:bg-slate-950 rounded border border-slate-200 dark:border-slate-700">
                      "{theme.exampleQuotes[0]}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pain Points - Expandable */}
        {expanded && insights.topPainPoints.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pain Points</p>
            </div>
            <ul className="space-y-1.5">
              {insights.topPainPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-foreground flex gap-2">
                  <span className="text-amber-600 dark:text-amber-500 font-bold">−</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations - Expandable */}
        {expanded && insights.recommendations.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-500" />
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recommendations</p>
            </div>
            <ul className="space-y-1.5">
              {insights.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-foreground flex gap-2">
                  <span className="text-green-600 dark:text-green-500 font-bold">✓</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
