import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, AlertCircle, TrendingUp } from "lucide-react";
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
      <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <CardTitle className="text-base">AI Analysis Unavailable</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-yellow-700 dark:text-yellow-300">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800 mb-6">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 animate-spin" />
            <CardTitle className="text-base">AI Analyzing Responses...</CardTitle>
          </div>
          <CardDescription>Extracting themes and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-purple-200 dark:bg-purple-700 rounded animate-pulse w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border-purple-200 dark:border-purple-800 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <CardTitle className="text-base">AI Insights</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-toggle-insights"
          >
            {expanded ? "Hide" : "Show"} Details
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Summary */}
        <div>
          <p className="text-sm font-semibold mb-2">Key Finding</p>
          <p className="text-sm text-foreground">{insights.summary}</p>
        </div>

        {/* Sentiment Overview */}
        <div>
          <p className="text-sm font-semibold mb-3">Sentiment Breakdown</p>
          <div className="flex gap-3">
            {insights.sentiment.positive > 0 && (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                {insights.sentiment.positive}% Positive
              </Badge>
            )}
            {insights.sentiment.neutral > 0 && (
              <Badge variant="secondary" className="bg-slate-500 hover:bg-slate-600">
                {insights.sentiment.neutral}% Neutral
              </Badge>
            )}
            {insights.sentiment.negative > 0 && (
              <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">
                {insights.sentiment.negative}% Negative
              </Badge>
            )}
          </div>
        </div>

        {/* Top Themes */}
        <div>
          <p className="text-sm font-semibold mb-3">Top Themes</p>
          <div className="space-y-2">
            {insights.themes.slice(0, 3).map((theme, idx) => (
              <div key={idx} className="p-2 bg-white/60 dark:bg-slate-900/60 rounded border border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{theme.theme}</span>
                  <Badge variant="outline">{theme.percentage}%</Badge>
                </div>
                {expanded && theme.exampleQuotes.length > 0 && (
                  <p className="text-xs text-muted-foreground italic mt-2">
                    "{theme.exampleQuotes[0]}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Pain Points */}
        {expanded && insights.topPainPoints.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pain Points
            </p>
            <ul className="space-y-1">
              {insights.topPainPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-foreground flex gap-2">
                  <span className="text-purple-600 dark:text-purple-400">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recommendations */}
        {expanded && insights.recommendations.length > 0 && (
          <div>
            <p className="text-sm font-semibold mb-2">AI Recommendations</p>
            <ul className="space-y-1">
              {insights.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-foreground flex gap-2">
                  <span className="text-blue-600 dark:text-blue-400">→</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
