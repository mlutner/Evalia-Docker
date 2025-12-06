/**
 * Scoring Debug Page - Dev-Only Standalone Scoring Inspector
 * 
 * [SCORING-DEBUG] Full-page view for debugging score calculations.
 * Shows detailed traces for how scores are computed for any survey/response.
 * 
 * Route: /dev/surveys/:surveyId/scoring-debug (dev-only)
 * 
 * Features:
 * - Select any survey from dropdown
 * - View scoring config (categories, bands)
 * - See per-response calculation breakdown
 * - Category breakdown with raw scores and bands
 * - Question-by-question contribution analysis
 * 
 * This uses the SAME scoring logic as production via /api/dev/scoring-trace.
 * It is READ-ONLY and does NOT modify any data.
 * 
 * @see docs/DEV_TOOLS.md for usage instructions
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, RefreshCw, AlertTriangle, ChevronDown, ChevronRight, Calculator, List, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Survey } from "@shared/schema";
import { INDEX_BAND_DEFINITIONS } from "@shared/analyticsBands";

// ============================================================================
// TYPES
// ============================================================================

interface QuestionContribution {
  questionId: string;
  questionText: string;
  questionType: string;
  category: string;
  categoryName: string;
  rawAnswer: string | string[];
  optionScoreUsed: number | null;
  maxPoints: number;
  weight: number;
  contributionToCategory: number;
  normalizedContribution: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  rawScore: number;
  maxPossibleScore: number;
  normalizedScore: number;
  bandId: string;
  bandLabel: string;
  bandColor: string;
  questionCount: number;
}

interface ScoringTraceResponse {
  meta: {
    surveyId: string;
    surveyTitle: string;
    responseId: string | null;
    scoringEngineId: string | null;
    scoringEnabled: boolean;
    timestamp: string;
  };
  config: {
    enabled: boolean;
    categories: Array<{ id: string; name: string }>;
    scoreRanges: Array<{ id: string; min: number; max: number; label: string }>;
  } | null;
  questions: QuestionContribution[];
  categories: CategoryBreakdown[];
  overall: {
    score: number;
    bandId: string;
    bandLabel: string;
    bandColor: string;
    matchedRule: { id: string; min: number; max: number; label: string } | null;
  } | null;
  errors: string[];
}

// ============================================================================
// COMPONENTS
// ============================================================================

function CollapsibleSection({ 
  title, 
  icon: Icon, 
  children, 
  defaultOpen = true,
  badge,
}: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <Card>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full"
      >
        <CardHeader className="py-3 hover:bg-gray-50 transition-colors">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-gray-500" />
              {title}
              {badge && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            {isOpen ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </CardTitle>
        </CardHeader>
      </button>
      {isOpen && <CardContent>{children}</CardContent>}
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ScoringDebugPage() {
  const { surveyId: urlSurveyId } = useParams<{ surveyId?: string }>();
  const [, setLocation] = useLocation();
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>(urlSurveyId || "");
  const [selectedResponseId, setSelectedResponseId] = useState<string>("");

  // Fetch all surveys
  const { data: surveysData, isLoading: surveysLoading } = useQuery<Survey[]>({
    queryKey: ["/api/surveys"],
    queryFn: async () => {
      const response = await fetch("/api/surveys");
      if (!response.ok) throw new Error("Failed to fetch surveys");
      return response.json();
    },
  });

  // Fetch responses for selected survey
  const { data: responsesData } = useQuery<{ responses: Array<{ id: string; createdAt: string }> }>({
    queryKey: ["/api/surveys", selectedSurveyId, "responses-list"],
    queryFn: async () => {
      const response = await fetch(`/api/surveys/${selectedSurveyId}/responses?limit=50`);
      if (!response.ok) throw new Error("Failed to fetch responses");
      return response.json();
    },
    enabled: !!selectedSurveyId,
  });

  // Fetch scoring trace
  const { data: trace, isLoading: traceLoading, error: traceError, refetch } = useQuery<ScoringTraceResponse>({
    queryKey: ["/api/dev/scoring-trace", selectedSurveyId, selectedResponseId],
    queryFn: async () => {
      const response = await fetch("/api/dev/scoring-trace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          surveyId: selectedSurveyId,
          responseId: selectedResponseId || undefined,
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch scoring trace");
      }
      return response.json();
    },
    enabled: !!selectedSurveyId,
  });

  const surveys = surveysData ?? [];
  const responses = responsesData?.responses ?? [];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Scoring Debug</h1>
              <p className="text-sm text-gray-500">
                Detailed score calculation traces for debugging
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" />
            DEV ONLY
          </div>
        </div>

        {/* Survey & Response Selector */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Survey
                </label>
                <Select 
                  value={selectedSurveyId} 
                  onValueChange={(v) => {
                    setSelectedSurveyId(v);
                    setSelectedResponseId("");
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={surveysLoading ? "Loading..." : "Select survey..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {surveys.map((survey) => (
                      <SelectItem key={survey.id} value={survey.id}>
                        {survey.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">
                  Response (optional)
                </label>
                <Select 
                  value={selectedResponseId || "most-recent"} 
                  onValueChange={(v) => setSelectedResponseId(v === "most-recent" ? "" : v)}
                  disabled={!selectedSurveyId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={responses.length ? "Most recent" : "No responses"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="most-recent">Most Recent</SelectItem>
                    {responses.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.id.slice(0, 8)}... ({new Date(r.createdAt).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  disabled={!selectedSurveyId || traceLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${traceLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading */}
        {traceLoading && (
          <Card className="mb-6">
            <CardContent className="py-12 text-center text-gray-500">
              Loading scoring trace...
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {traceError && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4 text-red-700">
              Error: {traceError instanceof Error ? traceError.message : "Unknown error"}
            </CardContent>
          </Card>
        )}

        {/* Trace Data */}
        {trace && !traceLoading && (
          <div className="space-y-4">
            {/* Errors/Warnings */}
            {trace.errors.length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="py-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div className="space-y-1">
                      {trace.errors.map((err, i) => (
                        <p key={i} className="text-amber-800 text-sm">{err}</p>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Meta Info */}
            <Card>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  Survey Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-500 text-xs uppercase">Survey</div>
                    <div className="font-medium truncate" title={trace.meta.surveyTitle}>
                      {trace.meta.surveyTitle}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase">Scoring Engine</div>
                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block">
                      {trace.meta.scoringEngineId || "default"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase">Response ID</div>
                    <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded inline-block">
                      {trace.meta.responseId?.slice(0, 8) || "most recent"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500 text-xs uppercase">Scoring</div>
                    <div className={`font-medium ${trace.meta.scoringEnabled ? 'text-green-600' : 'text-gray-400'}`}>
                      {trace.meta.scoringEnabled ? '✓ Enabled' : '✗ Disabled'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Overall Score */}
            {trace.overall && (
              <Card className="border-2" style={{ borderColor: trace.overall.bandColor }}>
                <CardContent className="py-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-500 uppercase mb-1">Overall Score</div>
                      <div className="flex items-center gap-4">
                        <span 
                          className="text-4xl font-bold"
                          style={{ color: trace.overall.bandColor }}
                        >
                          {trace.overall.score}%
                        </span>
                        <span
                          className="text-lg px-4 py-1 rounded-full font-medium"
                          style={{ 
                            backgroundColor: trace.overall.bandColor + '20',
                            color: trace.overall.bandColor
                          }}
                        >
                          {trace.overall.bandLabel}
                        </span>
                      </div>
                    </div>
                    {trace.overall.matchedRule && (
                      <div className="text-right text-sm text-gray-500">
                        <div className="uppercase text-xs">Matched Rule</div>
                        <div className="font-mono">
                          {trace.overall.matchedRule.label}: {trace.overall.matchedRule.min}-{trace.overall.matchedRule.max}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category Breakdown */}
            <CollapsibleSection 
              title="Category Breakdown" 
              icon={Calculator} 
              badge={`${trace.categories.length} categories`}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="px-4 py-2 font-semibold">Category</th>
                      <th className="px-4 py-2 font-semibold text-right">Raw Score</th>
                      <th className="px-4 py-2 font-semibold text-right">Max Possible</th>
                      <th className="px-4 py-2 font-semibold text-right">Normalized</th>
                      <th className="px-4 py-2 font-semibold">Band</th>
                      <th className="px-4 py-2 font-semibold text-right">Questions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trace.categories.map((cat) => (
                      <tr key={cat.categoryId} className="border-t border-gray-100">
                        <td className="px-4 py-3 font-medium">{cat.categoryName}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{cat.rawScore}</td>
                        <td className="px-4 py-3 text-right text-gray-600">{cat.maxPossibleScore}</td>
                        <td className="px-4 py-3 text-right font-semibold">{cat.normalizedScore}%</td>
                        <td className="px-4 py-3">
                          <span
                            className="px-2 py-1 rounded text-xs font-medium"
                            style={{ 
                              backgroundColor: cat.bandColor + '20',
                              color: cat.bandColor
                            }}
                          >
                            {cat.bandLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">{cat.questionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>

            {/* Question Contributions */}
            <CollapsibleSection 
              title="Question Contributions" 
              icon={List} 
              badge={`${trace.questions.length} questions`}
              defaultOpen={false}
            >
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-gray-50">
                    <tr className="text-left">
                      <th className="px-4 py-2 font-semibold">Question</th>
                      <th className="px-4 py-2 font-semibold">Category</th>
                      <th className="px-4 py-2 font-semibold">Answer</th>
                      <th className="px-4 py-2 font-semibold text-right">Score</th>
                      <th className="px-4 py-2 font-semibold text-right">Max</th>
                      <th className="px-4 py-2 font-semibold text-right">Weight</th>
                      <th className="px-4 py-2 font-semibold text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trace.questions.map((q) => (
                      <tr key={q.questionId} className="border-t border-gray-100">
                        <td className="px-4 py-3">
                          <div className="font-mono text-xs text-gray-500">{q.questionId}</div>
                          <div className="max-w-[200px] truncate text-gray-700" title={q.questionText}>
                            {q.questionText}
                          </div>
                          <div className="text-xs text-gray-400">{q.questionType}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{q.categoryName}</td>
                        <td className="px-4 py-3">
                          <div className="max-w-[120px] truncate" title={String(q.rawAnswer)}>
                            {Array.isArray(q.rawAnswer) ? q.rawAnswer.join(', ') : q.rawAnswer}
                          </div>
                          {q.optionScoreUsed !== null && (
                            <div className="text-xs text-blue-600">
                              optionScore: {q.optionScoreUsed}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{q.contributionToCategory}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{q.maxPoints}</td>
                        <td className="px-4 py-3 text-right text-gray-500">{q.weight}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={
                            q.normalizedContribution >= 70 ? 'text-green-600 font-medium' :
                            q.normalizedContribution >= 40 ? 'text-amber-600' :
                            'text-red-600'
                          }>
                            {q.normalizedContribution}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {trace.questions.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400 italic">
                          No scorable questions answered in this response
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>

            {/* Score Config */}
            {trace.config && (
              <CollapsibleSection 
                title="Scoring Configuration" 
                icon={Settings} 
                defaultOpen={false}
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {trace.config.categories.map(c => (
                        <span key={c.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Score Ranges (Bands)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {trace.config.scoreRanges.map(r => {
                        const bandDef = INDEX_BAND_DEFINITIONS.find(b => b.bandId === r.id);
                        return (
                          <div
                            key={r.id}
                            className="px-3 py-2 rounded border text-center"
                            style={{ 
                              borderColor: bandDef?.color || '#ccc',
                              backgroundColor: (bandDef?.color || '#ccc') + '10'
                            }}
                          >
                            <div className="font-medium text-sm" style={{ color: bandDef?.color }}>
                              {r.label}
                            </div>
                            <div className="text-xs text-gray-500">
                              {r.min} - {r.max}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>
            )}
          </div>
        )}

        {/* Empty State */}
        {!selectedSurveyId && !traceLoading && (
          <Card className="text-center py-12">
            <CardContent>
              <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Survey</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                Choose a survey from the dropdown above to inspect its scoring calculation trace.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

