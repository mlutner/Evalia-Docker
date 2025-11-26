import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, debounce } from "@/lib/queryClient";
import { theme } from "@/theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponseDetailModal } from "@/components/ResponseDetailModal";
import AIInsightsCard from "@/components/AIInsightsCard";
import { ArrowLeft, Users, FileText, Calendar, Download, Loader2, Trash2, AlertTriangle, TrendingUp, ChevronDown, Zap, Clock, Eye, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResponseAnalysis } from "@/hooks/useResponseAnalysis";
import { useState, useMemo, useCallback } from "react";
import type { Survey, SurveyResponse } from "@shared/schema";

interface AnalyticsData {
  survey: Survey;
  responses: SurveyResponse[];
  count: number;
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 50;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "fastest" | "slowest">("newest");
  const { toast } = useToast();

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchTerm(term);
      setPage(1); // Reset to first page on new search
    }, 300),
    []
  );

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/surveys", id, "responses", searchTerm, page],
    enabled: !!id,
    queryFn: async () => {
      const offset = (page - 1) * ITEMS_PER_PAGE;
      let url = `/api/surveys/${id}/responses?limit=${ITEMS_PER_PAGE}&offset=${offset}`;
      if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`;
      return fetch(url).then(r => r.json());
    }
  });

  // Fetch AI insights when responses are available
  const { data: insights, isLoading: insightsLoading, error: insightsError } = useResponseAnalysis(id, !!data?.responses && data.responses.length > 0);

  // Filter and sort responses
  const filteredAndSortedResponses = useMemo(() => {
    if (!data?.responses) return [];
    
    let filtered = data.responses;
    
    // Apply date range filters
    if (dateFrom || dateTo) {
      filtered = filtered.filter(response => {
        const responseDate = new Date(response.completedAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          if (responseDate < fromDate) return false;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (responseDate > toDate) return false;
        }
        return true;
      });
    }
    
    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      const dateA = new Date(a.completedAt).getTime();
      const dateB = new Date(b.completedAt).getTime();
      
      switch (sortBy) {
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "fastest":
          // Assume faster = earlier completion if submitted sequentially
          return dateA - dateB;
        case "slowest":
          return dateB - dateA;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [data?.responses, dateFrom, dateTo, sortBy]);

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
      <main className="container mx-auto px-4 py-6 md:py-8">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-6"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="heading-2 mb-2">{survey.title}</h1>
              {survey.description && (
                <p className="body-medium text-secondary max-w-2xl">{survey.description}</p>
              )}
            </div>
            <div className="flex gap-2 flex-wrap flex-shrink-0">
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

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-professional" style={{ backgroundColor: theme.colors.bg, border: `1px solid ${theme.colors.border}` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="heading-4">Total Responses</CardTitle>
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.surfaceHighlightTeal }}>
                <Users className="w-6 h-6" style={{ color: theme.colors.primary }} strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="heading-1 mb-1" data-testid="text-response-count">{count}</div>
              <p className="body-small text-tertiary">total responses collected</p>
              <p className="text-xs mt-2" style={{ color: theme.colors.primary }}>
                {count >= 50 ? 'Great engagement! 🎉' : count >= 20 ? 'Good progress so far' : 'Keep collecting responses'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-professional" style={{ backgroundColor: theme.colors.bg, border: `1px solid ${theme.colors.border}` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="heading-4">Completion Rate</CardTitle>
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.surfaceHighlightLime }}>
                <TrendingUp className="w-6 h-6 text-green-600" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="heading-1 mb-1" style={{ color: theme.colors.iconTeal }}>{survey.questions.length > 0 ? Math.round((count / survey.questions.length) * 100) : 0}%</div>
              <p className="body-small text-tertiary">{count} of {survey.questions.length} questions answered</p>
              <p className="text-xs mt-2" style={{ color: theme.colors.primary }}>
                {survey.questions.length > 0 && count > 0 ? `Excellent response rate! Above typical survey average.` : `Keep sharing to increase response count`}
              </p>
            </CardContent>
          </Card>

          <Card className="card-professional" style={{ backgroundColor: theme.colors.bg, border: `1px solid ${theme.colors.border}` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="heading-4">Response Span</CardTitle>
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.surfaceHighlightTeal }}>
                <Clock className="w-6 h-6" style={{ color: theme.colors.primary }} strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent>
              {data.responses.length > 0 ? (
                <>
                  <div className="heading-1 mb-1">{Math.round((new Date(data.responses[data.responses.length - 1].completedAt).getTime() - new Date(data.responses[0].completedAt).getTime()) / (1000 * 60 * 60 * 24))}</div>
                  <p className="body-small text-tertiary">days from first to last</p>
                  <p className="text-xs mt-2" style={{ color: theme.colors.primary }}>
                    {Math.round((new Date(data.responses[data.responses.length - 1].completedAt).getTime() - new Date(data.responses[0].completedAt).getTime()) / (1000 * 60 * 60 * 24)) > 7 ? 'Long-term engagement observed' : 'Recent responses'}
                  </p>
                </>
              ) : (
                <div className="body-small text-tertiary">—</div>
              )}
            </CardContent>
          </Card>

          <Card className="card-professional" style={{ backgroundColor: theme.colors.bg, border: `1px solid ${theme.colors.border}` }}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="heading-4">Total Questions</CardTitle>
              <div className="w-12 h-12 rounded-[10px] flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme.colors.bg }}>
                <FileText className="w-6 h-6" style={{ color: theme.colors.primary }} strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="heading-1 mb-1">{survey.questions.length}</div>
              <p className="body-small text-tertiary">questions in survey</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Card */}
        <AIInsightsCard 
          insights={insights || null}
          isLoading={insightsLoading}
          error={insightsError?.message}
        />

        {count === 0 ? (
              <Card className="card-professional">
                <CardContent className="pt-8 pb-8">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Users className="w-8 h-8 text-primary/60" />
                    </div>
                    <h3 className="heading-3 mb-3">No Responses Yet</h3>
                    <p className="body-medium text-secondary max-w-md mx-auto">
                      Share your survey to start collecting responses
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Search & Filter Bar */}
                <Card className="card-professional">
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex gap-3 flex-wrap items-center justify-between">
                      <div className="flex-1 min-w-[200px]">
                        <Input
                          placeholder="Search responses..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          data-testid="input-search-responses"
                          className="h-10"
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
                    {/* Filters & Sort */}
                    <div className="flex gap-3 flex-wrap items-end">
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-medium text-secondary mb-2 block">From Date</label>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          data-testid="input-date-from"
                          className="h-10"
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-medium text-secondary mb-2 block">To Date</label>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          data-testid="input-date-to"
                          className="h-10"
                        />
                      </div>
                      <div className="flex-1 min-w-[150px]">
                        <label className="text-xs font-medium text-secondary mb-2 block">Sort By</label>
                        <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)} data-testid="select-sort">
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="fastest">Fastest First</SelectItem>
                            <SelectItem value="slowest">Slowest First</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {(dateFrom || dateTo || sortBy !== "newest") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setDateFrom("");
                            setDateTo("");
                            setSortBy("newest");
                          }}
                          data-testid="button-reset-filters"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Reset
                        </Button>
                      )}
                    </div>
                  </CardHeader>
            </Card>

            {/* Response List */}
            <Card className="card-professional" style={{ border: `1px solid ${theme.colors.border}` }}>
              <CardHeader className="pb-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="heading-3">Responses</CardTitle>
                    <CardDescription className="mt-1 body-small">{data.responses.length} response{data.responses.length !== 1 ? 's' : ''} received</CardDescription>
                  </div>
                  <Checkbox
                    checked={selectedIds.size === data?.responses.length && data?.responses.length > 0}
                    onCheckedChange={toggleSelectAll}
                    data-testid="checkbox-select-all"
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {filteredAndSortedResponses.length === 0 ? (
                    <div className="text-center py-8 text-secondary">
                      <p className="text-sm">No responses match your filters</p>
                    </div>
                  ) : (
                    filteredAndSortedResponses.map((response) => (
                    <div key={response.id} className="flex items-start gap-3 p-4 rounded-[12px] transition-all cursor-pointer hover-elevate" style={{ backgroundColor: theme.colors.bg, border: `1px solid ${theme.colors.border}` }} onClick={() => setSelectedResponse(response)} data-testid={`response-row-${response.id}`}>
                      <Checkbox
                        checked={selectedIds.has(response.id)}
                        onCheckedChange={() => toggleSelect(response.id)}
                        data-testid={`checkbox-response-${response.id}`}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="body-small font-medium" style={{ color: theme.colors.textPrimary }}>
                            {new Date(response.completedAt).toLocaleDateString()}
                          </p>
                          <span className="text-xs" style={{ color: theme.colors.textSecondary }}>
                            {new Date(response.completedAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div className="text-xs space-y-1.5">
                          {survey.questions.slice(0, 2).map(q => {
                            const answer = response.answers[q.id];
                            return (
                              <p key={q.id} className="truncate" style={{ color: theme.colors.textSecondary }}>
                                <strong style={{ color: theme.colors.textPrimary }}>{q.question}:</strong> {Array.isArray(answer) ? answer.join(", ") : answer || "—"}
                              </p>
                            );
                          })}
                          {survey.questions.length > 2 && <p className="text-xs" style={{ color: theme.colors.textSecondary }}>+{survey.questions.length - 2} more</p>}
                        </div>
                      </div>
                      <Eye className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: theme.colors.textSecondary }} data-testid="button-view-response" />
                    </div>
                    ))
                  )}
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
            <div className="mt-8">
              <div className="mb-8">
                <h2 className="heading-2 mb-2">Question Breakdown</h2>
                <p className="body-small text-tertiary">Response distribution and analysis for each question</p>
              </div>
              <div className="space-y-4">
              {survey.questions.map((question, index) => {
                const stats = getQuestionStats(question.id);
                if (!stats) return null;

                const responseRate = data?.responses.length ? Math.round((stats.total / data.responses.length) * 100) : 0;

                return (
                  <Collapsible key={question.id} defaultOpen={index < 2}>
                    <Card className="card-professional hover-elevate" style={{ border: `1px solid ${theme.colors.border}` }} data-testid={`question-analytics-${question.id}`}>
                      <CollapsibleTrigger asChild>
                        <button className="w-full text-left">
                          <CardHeader className="pb-5">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-1">
                                  <span className="text-xs font-semibold px-2 py-1 rounded-[6px]" style={{ color: theme.colors.primary, backgroundColor: theme.colors.surfaceHighlightTeal }}>Q{index + 1}</span>
                                  <CardTitle className="heading-4 inline">
                                    {question.question}
                                  </CardTitle>
                                </div>
                                {question.description && (
                                  <CardDescription className="mt-2 text-secondary" style={{ fontSize: '13px' }}>{question.description}</CardDescription>
                                )}
                              </div>
                              <div className="flex items-center gap-4 flex-shrink-0">
                                <div className="text-right">
                                  <p className="heading-4" style={{ color: theme.colors.primary }}>{stats.total}</p>
                                  <p className="text-xs text-tertiary mt-1">{responseRate}% answered</p>
                                </div>
                                <ChevronDown className="w-5 h-5 text-secondary transition-transform group-data-[state=open]:rotate-180 flex-shrink-0" />
                              </div>
                            </div>
                          </CardHeader>
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-5 border-t border-border">
                          {(stats.type === "multiple_choice" || stats.type === "checkbox") && stats.distribution ? (
                            <div className="space-y-5">
                              {Object.entries(stats.distribution).map(([option, count], idx) => {
                                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                                const isTop = idx === 0;
                                return (
                                  <div key={option} className="space-y-2.5">
                                    <div className="flex justify-between items-end gap-3">
                                      <span className={`text-sm ${isTop ? "font-semibold" : ""}`} style={{ color: theme.colors.textPrimary }}>{option}</span>
                                      <span className="text-xs font-medium px-2 py-1 rounded-[4px]" style={{ color: theme.colors.primary, backgroundColor: theme.colors.surfaceHighlightTeal }}>
                                        {count} • {percentage.toFixed(1)}%
                                      </span>
                                    </div>
                                    <div className="h-2.5 bg-border rounded-full overflow-hidden">
                                      <div
                                        className="h-full transition-all"
                                        style={{ width: `${percentage}%`, backgroundColor: isTop ? theme.colors.iconTeal : theme.colors.primary }}
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
                                  className="p-3 bg-muted rounded-[8px] text-sm text-secondary hover:bg-muted/60 transition-colors"
                                  data-testid={`answer-${question.id}-${i}`}
                                >
                                  {answer}
                                </div>
                              ))}
                              {stats.answers.length > 8 && (
                                <p className="text-sm text-tertiary text-center pt-3 cursor-pointer hover:text-secondary transition-colors">
                                  + {stats.answers.length - 8} more responses
                                </p>
                              )}
                            </div>
                          ) : (
                            <p className="text-tertiary text-sm text-center py-6">No responses for this question</p>
                          )}
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
              </div>
            </div>
            </div>
        )}
      </main>
    </div>
  );
}
