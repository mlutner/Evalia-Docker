import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResponseDetailModal } from "@/components/ResponseDetailModal";
import { ArrowLeft, Users, FileText, Calendar, Download, Loader2, Trash2, AlertTriangle, TrendingUp, ChevronDown, Zap, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import type { Survey, SurveyResponse } from "@shared/schema";

interface AnalyticsData {
  survey: Survey;
  responses: SurveyResponse[];
  count: number;
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/surveys", id, "responses", searchTerm],
    enabled: !!id,
    queryFn: async () => {
      const url = `/api/surveys/${id}/responses${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`;
      return fetch(url).then(r => r.json());
    }
  });

  // Calculate statistics for a question (defined early so useMemo can use it)
  const getQuestionStats = (questionId: string) => {
    if (!data?.responses) return null;

    const question = data.survey.questions.find(q => q.id === questionId);
    if (!question) return null;

    const answers: (string | string[])[] = [];
    data.responses.forEach(response => {
      const answer = response.answers[questionId];
      if (answer !== undefined && answer !== null) {
        answers.push(answer);
      }
    });

    // For multiple choice questions, calculate frequency
    if (question.type === "multiple_choice" && question.options) {
      const freq: Record<string, number> = {};
      question.options.forEach(opt => freq[opt] = 0);
      
      answers.forEach(answer => {
        if (typeof answer === "string" && freq[answer] !== undefined) {
          freq[answer]++;
        }
      });

      return {
        type: "multiple_choice",
        total: answers.length,
        distribution: freq,
      };
    }

    // For checkbox questions, calculate frequency
    if (question.type === "checkbox" && question.options) {
      const freq: Record<string, number> = {};
      question.options.forEach(opt => freq[opt] = 0);
      
      answers.forEach(answer => {
        if (Array.isArray(answer)) {
          answer.forEach(opt => {
            if (freq[opt] !== undefined) {
              freq[opt]++;
            }
          });
        }
      });

      return {
        type: "checkbox",
        total: answers.length,
        distribution: freq,
      };
    }

    // For text/textarea/email/number questions, just return the list
    return {
      type: question.type,
      total: answers.length,
      answers: answers as string[],
    };
  };

  // Calculate key insights
  const keyInsights = useMemo(() => {
    if (!data || data.responses.length === 0) return null;

    const insights: Array<{ question: string; insight: string; icon: string }> = [];
    
    data.survey.questions.forEach(question => {
      const stats = getQuestionStats(question.id);
      if (!stats) return;

      if (stats.type === "multiple_choice" || stats.type === "checkbox") {
        const entries = Object.entries(stats.distribution || {});
        if (entries.length > 0) {
          const [topAnswer, topCount] = entries.reduce((a, b) => (b[1] > a[1] ? b : a));
          const percentage = ((topCount / stats.total) * 100).toFixed(0);
          insights.push({
            question: question.question,
            insight: `${topAnswer} (${percentage}%)`,
            icon: "⭐"
          });
        }
      }
    });

    return insights.length > 0 ? insights.slice(0, 3) : null;
  }, [data, getQuestionStats]);

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      return apiRequest("POST", `/api/surveys/${id}/responses/bulk-delete`, { ids });
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/surveys", id, "responses"] });
      toast({ title: "Responses deleted successfully" });
    },
  });

  const handleExport = async (format: "csv" | "json") => {
    try {
      const response = await fetch(`/api/surveys/${id}/responses/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `responses_${id}.${format === "csv" ? "csv" : "json"}`;
      a.click();
      toast({ title: `Exported as ${format.toUpperCase()}` });
    } catch (e) {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  const toggleSelect = (responseId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(responseId)) {
      newSelected.delete(responseId);
    } else {
      newSelected.add(responseId);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data?.responses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data?.responses.map(r => r.id) || []));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-600 mx-auto mb-4 opacity-50" />
            <h1 className="text-2xl font-semibold mb-2">Analytics Not Available</h1>
            <p className="text-muted-foreground mb-6">
              {error ? "Unable to load analytics for this survey." : "No data available at this time."}
            </p>
            <Button onClick={() => setLocation("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if survey has no responses
  if (data.responses.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Button variant="outline" onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold mb-2">No Responses Yet</h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Your survey "{data.survey.title}" hasn't received any responses yet. Share it with respondents to start collecting data.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setLocation("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { survey, count } = data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-4"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-4xl font-semibold mb-2">{survey.title}</h1>
              {survey.description && (
                <p className="text-muted-foreground">{survey.description}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")} data-testid="button-export-csv">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("json")} data-testid="button-export-json">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Responses</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold" data-testid="text-response-count">{count}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{survey.questions.length > 0 ? Math.round((count / survey.questions.length) * 100) : 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">{count} of {survey.questions.length} questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Response Timeline</CardTitle>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {data.responses.length > 0 ? (
                <>
                  <div className="text-sm font-semibold">
                    {Math.round((new Date(data.responses[data.responses.length - 1].completedAt).getTime() - new Date(data.responses[0].completedAt).getTime()) / (1000 * 60 * 60 * 24))} days
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">from first to last response</p>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">No data yet</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questions</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{survey.questions.length}</div>
            </CardContent>
          </Card>
        </div>

        {keyInsights && keyInsights.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800 mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-base">Key Insights</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {keyInsights.map((insight, idx) => (
                  <div key={idx} className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-lg border border-blue-100 dark:border-blue-800/50">
                    <p className="text-xs text-muted-foreground font-medium mb-1 truncate">{insight.question}</p>
                    <p className="font-semibold text-sm text-blue-700 dark:text-blue-300">{insight.insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {count === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Responses Yet</h3>
                <p className="text-muted-foreground">
                  Share your survey to start collecting responses
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Search & Filter Bar */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex gap-3 flex-wrap items-center justify-between">
                  <div className="flex-1 min-w-[200px]">
                    <Input
                      placeholder="Search responses..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      data-testid="input-search-responses"
                    />
                  </div>
                  {selectedIds.size > 0 && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
                      disabled={bulkDeleteMutation.isPending}
                      data-testid="button-bulk-delete"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete {selectedIds.size}
                    </Button>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Response List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Response Details</CardTitle>
                  <Checkbox
                    checked={selectedIds.size === data?.responses.length && data?.responses.length > 0}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data?.responses.map((response) => (
                    <div key={response.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => setSelectedResponse(response)} data-testid={`response-row-${response.id}`}>
                      <Checkbox
                        checked={selectedIds.has(response.id)}
                        onCheckedChange={() => toggleSelect(response.id)}
                        data-testid={`checkbox-response-${response.id}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">
                          {new Date(response.completedAt).toLocaleString()}
                        </p>
                        <div className="text-xs mt-1 space-y-1">
                          {survey.questions.slice(0, 2).map(q => {
                            const answer = response.answers[q.id];
                            return (
                              <p key={q.id} className="truncate">
                                <strong>{q.question}:</strong> {Array.isArray(answer) ? answer.join(", ") : answer || "—"}
                              </p>
                            );
                          })}
                          {survey.questions.length > 2 && <p className="text-xs text-muted-foreground">+{survey.questions.length - 2} more</p>}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" data-testid="button-view-response">
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Response Detail Modal */}
            <ResponseDetailModal
              response={selectedResponse}
              survey={survey}
              open={!!selectedResponse}
              onOpenChange={(open) => !open && setSelectedResponse(null)}
            />
            <h2 className="text-2xl font-semibold mb-4">Question Breakdown</h2>
            <div className="space-y-3">
              {survey.questions.map((question, index) => {
                const stats = getQuestionStats(question.id);
                if (!stats) return null;

                const responseRate = data?.responses.length ? Math.round((stats.total / data.responses.length) * 100) : 0;

                return (
                  <Collapsible key={question.id} defaultOpen={index < 2}>
                    <Card className="hover-elevate" data-testid={`question-analytics-${question.id}`}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base">
                                  Q{index + 1}: {question.question}
                                </CardTitle>
                                {question.description && (
                                  <CardDescription className="mt-1">{question.description}</CardDescription>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <div className="text-right">
                                  <p className="text-sm font-semibold">{stats.total}</p>
                                  <p className="text-xs text-muted-foreground">{responseRate}% answered</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                              </div>
                            </div>
                          </CardHeader>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          {(stats.type === "multiple_choice" || stats.type === "checkbox") && stats.distribution ? (
                            <div className="space-y-3">
                              {Object.entries(stats.distribution).map(([option, count], idx) => {
                                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                const isTop = idx === 0;
                                return (
                                  <div key={option} className="space-y-1">
                                    <div className="flex justify-between text-sm items-center">
                                      <span className={isTop ? "font-semibold" : ""}>{option}</span>
                                      <span className="text-muted-foreground text-xs">
                                        {count} ({percentage.toFixed(1)}%)
                                      </span>
                                    </div>
                                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                                      <div
                                        className={`h-full transition-all ${isTop ? "bg-blue-500 dark:bg-blue-400" : "bg-primary"}`}
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : stats.answers && stats.answers.length > 0 ? (
                            <div className="space-y-2">
                              {stats.answers.slice(0, 8).map((answer, i) => (
                                <div
                                  key={i}
                                  className="p-3 bg-muted rounded-md text-sm hover:bg-muted/80 transition-colors"
                                  data-testid={`answer-${question.id}-${i}`}
                                >
                                  {answer}
                                </div>
                              ))}
                              {stats.answers.length > 8 && (
                                <p className="text-sm text-muted-foreground text-center pt-2 cursor-pointer hover:text-foreground transition-colors">
                                  + {stats.answers.length - 8} more responses
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm text-center py-4">No responses for this question</p>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
