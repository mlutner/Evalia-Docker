/**
 * LegacyAnalyticsPage - Archived Analytics Page
 * 
 * This contains the original analytics page with Questions, Responses, and AI Insights tabs.
 * Preserved for future integration into the v2 analytics layout.
 * 
 * [ANAL-IA-001] The v2 AnalyticsPage now uses a 7-section Information Architecture:
 *   Insights Home | Dimensions | Managers | Trends | Questions | Responses | Benchmarks
 * 
 * The Responses tab functionality from this file may be migrated to the v2 Responses tab.
 * The AI Insights functionality may be integrated into future analytics modules.
 * 
 * NOT currently routed - preserved in code only.
 * 
 * @deprecated Use AnalyticsPage (v2) instead
 */

import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponseDetailModal } from "@/components/ResponseDetailModal";
import AIInsightsCard from "@/components/AIInsightsCard";
import { 
  ArrowLeft, Users, FileText, Calendar, Download, Loader2, Trash2, 
  AlertTriangle, TrendingUp, TrendingDown, ChevronDown, Clock, Eye, 
  RotateCcw, BarChart3, PieChart, MessageSquare, Sparkles, Target,
  Monitor, Smartphone, Tablet, Globe, Filter, CheckCircle, XCircle,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useResponseAnalysis } from "@/hooks/useResponseAnalysis";
import { useState, useMemo } from "react";
import type { Survey, SurveyResponse } from "@shared/schema";
import { ParticipationMetricsCard, calculateParticipationMetrics } from "@/components/analytics/ParticipationMetricsCard";

interface AnalyticsData {
  survey: Survey;
  responses: SurveyResponse[];
  count: number;
}

// ============================================
// CHART COMPONENTS
// ============================================

function SimpleBarChart({ data, maxValue }: { data: { label: string; value: number; color?: string }[]; maxValue: number }) {
  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
        return (
          <div key={idx} className="space-y-1.5">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-700 font-medium truncate max-w-[200px]">{item.label}</span>
              <span className="text-gray-500 font-medium">{item.value} ({percentage.toFixed(0)}%)</span>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${percentage}%`,
                  backgroundColor: item.color || '#2563EB'
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ 
  value, 
  maxValue, 
  label, 
  color = "#2563EB",
  size = 120 
}: { 
  value: number; 
  maxValue: number; 
  label: string; 
  color?: string;
  size?: number;
}) {
  const percentage = maxValue > 0 ? Math.round((value / maxValue) * 100) : 0;
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r="40"
          stroke="#E5E7EB"
          strokeWidth="12"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r="40"
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-2xl font-bold text-gray-900">{percentage}%</span>
      </div>
      <span className="text-sm text-gray-500 mt-2">{label}</span>
    </div>
  );
}

function MiniTrendChart({ data, color = "#2563EB" }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="flex items-end gap-1 h-12">
      {data.map((value, idx) => {
        const height = ((value - min) / range) * 100 || 10;
        return (
          <div
            key={idx}
            className="flex-1 rounded-t transition-all duration-300 hover:opacity-80"
            style={{ 
              height: `${Math.max(height, 10)}%`,
              backgroundColor: color,
              opacity: 0.3 + (idx / data.length) * 0.7
            }}
            title={`${value} responses`}
          />
        );
      })}
    </div>
  );
}

// ============================================
// STAT CARDS
// ============================================

function StatCard({ 
  label, 
  value, 
  subtext, 
  icon: Icon, 
  trend,
  trendValue,
  iconBg 
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ElementType;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  iconBg: string;
}) {
  return (
    <Card className="bg-white border border-gray-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gray-900">{value}</span>
              {trend && trendValue && (
                <span className={`flex items-center text-sm font-medium ${
                  trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-gray-500"
                }`}>
                  {trend === "up" ? <TrendingUp className="w-3 h-3 mr-0.5" /> : 
                   trend === "down" ? <TrendingDown className="w-3 h-3 mr-0.5" /> : null}
                  {trendValue}
                </span>
              )}
            </div>
            {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function LegacyAnalyticsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/surveys", id, "responses"],
    enabled: !!id,
    queryFn: async () => {
      const url = `/api/surveys/${id}/responses?limit=1000`;
      return fetch(url).then(r => r.json());
    }
  });

  // Fetch AI insights
  const { data: insights, isLoading: insightsLoading, error: insightsError } = useResponseAnalysis(
    id, 
    !!data?.responses && data.responses.length > 0
  );

  // ============================================
  // COMPUTED ANALYTICS
  // ============================================
  
  const analytics = useMemo(() => {
    if (!data?.responses || data.responses.length === 0) return null;

    const responses = data.responses;
    const survey = data.survey;

    // Basic stats
    const totalResponses = responses.length;
    const questionsAnswered = responses.reduce((sum, r) => sum + Object.keys(r.answers).length, 0);
    const avgQuestionsPerResponse = totalResponses > 0 ? questionsAnswered / totalResponses : 0;
    const completionRate = survey.questions.length > 0 
      ? Math.round((avgQuestionsPerResponse / survey.questions.length) * 100)
      : 0;

    // Calculate average duration
    const durationsMs = responses
      .filter(r => r.startedAt && r.completedAt)
      .map(r => new Date(r.completedAt).getTime() - new Date(r.startedAt).getTime())
      .filter(d => d > 0 && d < 3600000); // Filter out outliers (< 1 hour)
    
    const avgDurationMs = durationsMs.length > 0 
      ? durationsMs.reduce((a, b) => a + b, 0) / durationsMs.length 
      : 0;
    const avgDurationMin = Math.round(avgDurationMs / 60000);

    // Responses by day (last 7 days)
    const last7Days: number[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = responses.filter(r => 
        r.completedAt.toString().split('T')[0] === dateStr
      ).length;
      last7Days.push(count);
    }

    // Response trend (compare today vs yesterday)
    const todayCount = last7Days[6] || 0;
    const yesterdayCount = last7Days[5] || 0;
    const trendPercentage = yesterdayCount > 0 
      ? Math.round(((todayCount - yesterdayCount) / yesterdayCount) * 100)
      : todayCount > 0 ? 100 : 0;

    // Device breakdown (mock data since we don't have metadata yet)
    const deviceBreakdown = {
      desktop: Math.round(totalResponses * 0.65),
      mobile: Math.round(totalResponses * 0.30),
      tablet: Math.round(totalResponses * 0.05),
    };

    // Question statistics
    const questionStats = survey.questions.map((question, idx) => {
      const answers: (string | string[])[] = [];
      responses.forEach(response => {
        const answer = response.answers[question.id];
        if (answer !== undefined && answer !== null) {
          answers.push(answer);
        }
      });

      const responseRate = totalResponses > 0 ? Math.round((answers.length / totalResponses) * 100) : 0;

      // For choice questions, calculate distribution
      if ((question.type === "multiple_choice" || question.type === "checkbox" || 
           question.type === "dropdown" || question.type === "rating" || 
           question.type === "nps" || question.type === "likert") && question.options) {
        const freq: Record<string, number> = {};
        question.options.forEach(opt => freq[opt] = 0);
        
        answers.forEach(answer => {
          if (Array.isArray(answer)) {
            answer.forEach(opt => {
              if (freq[opt] !== undefined) freq[opt]++;
            });
          } else if (typeof answer === "string" && freq[answer] !== undefined) {
            freq[answer]++;
          }
        });

        // Find top answer
        const entries = Object.entries(freq).sort((a, b) => b[1] - a[1]);
        const topAnswer = entries[0];

        return {
          question,
          index: idx,
          totalAnswers: answers.length,
          responseRate,
          type: "choice",
          distribution: freq,
          topAnswer: topAnswer ? { label: topAnswer[0], count: topAnswer[1] } : null,
        };
      }

      // For rating questions without options
      if (question.type === "rating" || question.type === "nps") {
        const numericAnswers = answers
          .map(a => parseInt(Array.isArray(a) ? a[0] : a, 10))
          .filter(n => !isNaN(n));
        
        const average = numericAnswers.length > 0 
          ? numericAnswers.reduce((a, b) => a + b, 0) / numericAnswers.length 
          : 0;

        const scale = question.type === "nps" ? 10 : (question.ratingScale || 5);
        const distribution: Record<string, number> = {};
        for (let i = 0; i <= scale; i++) {
          distribution[String(i)] = numericAnswers.filter(n => n === i).length;
        }

        return {
          question,
          index: idx,
          totalAnswers: answers.length,
          responseRate,
          type: "rating",
          average: Math.round(average * 10) / 10,
          scale,
          distribution,
        };
      }

      // For text questions
      return {
        question,
        index: idx,
        totalAnswers: answers.length,
        responseRate,
        type: "text",
        sampleAnswers: (answers as string[]).slice(0, 5),
      };
    });

    // NPS calculation if there's an NPS question
    const npsQuestion = survey.questions.find(q => q.type === "nps");
    let npsScore = null;
    if (npsQuestion) {
      const npsAnswers = responses
        .map(r => parseInt(r.answers[npsQuestion.id] as string, 10))
        .filter(n => !isNaN(n));
      
      if (npsAnswers.length > 0) {
        const promoters = npsAnswers.filter(n => n >= 9).length;
        const detractors = npsAnswers.filter(n => n <= 6).length;
        npsScore = Math.round(((promoters - detractors) / npsAnswers.length) * 100);
      }
    }

    return {
      totalResponses,
      completionRate,
      avgDurationMin,
      trendPercentage,
      todayCount,
      last7Days,
      deviceBreakdown,
      questionStats,
      npsScore,
    };
  }, [data]);

  // Calculate participation metrics
  const participationMetrics = useMemo(() => {
    if (!data?.responses) return null;
    return calculateParticipationMetrics(data.responses);
  }, [data?.responses]);

  // Filtered and sorted responses for table
  const filteredResponses = useMemo(() => {
    if (!data?.responses) return [];
    
    let filtered = data.responses;
    
    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(r => new Date(r.completedAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(r => new Date(r.completedAt) <= toDate);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        Object.values(r.answers).some(a => 
          (Array.isArray(a) ? a.join(' ') : a).toLowerCase().includes(term)
        )
      );
    }
    
    // Sort
    return [...filtered].sort((a, b) => {
      const dateA = new Date(a.completedAt).getTime();
      const dateB = new Date(b.completedAt).getTime();
      return sortBy === "newest" ? dateB - dateA : dateA - dateB;
    });
  }, [data?.responses, dateFrom, dateTo, searchTerm, sortBy]);

  // Pagination
  const paginatedResponses = filteredResponses.slice(
    (page - 1) * ITEMS_PER_PAGE, 
    page * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(filteredResponses.length / ITEMS_PER_PAGE);

  // Mutations
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => apiRequest("POST", `/api/surveys/${id}/responses/bulk-delete`, { ids }),
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/surveys", id, "responses"] });
      toast({ title: "Responses deleted" });
    },
  });

  const handleExport = async (format: "csv" | "json") => {
    try {
      const response = await fetch(`/api/surveys/${id}/responses/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `responses_${id}.${format}`;
      a.click();
      toast({ title: `Exported as ${format.toUpperCase()}` });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  };

  // ============================================
  // RENDER
  // ============================================

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics Unavailable</h1>
          <p className="text-gray-500 mb-6">Unable to load analytics for this survey.</p>
          <Button onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { survey, count } = data;

  // No responses state
  if (count === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">No Responses Yet</h1>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Share your survey "{survey.title}" to start collecting responses.
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

  return (
    <>
      <ResponseDetailModal
        response={selectedResponse}
        survey={survey}
        open={!!selectedResponse}
        onOpenChange={(open) => !open && setSelectedResponse(null)}
      />

      <main className="min-h-screen" style={{ backgroundColor: '#F7F9FC' }}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <Button variant="ghost" onClick={() => setLocation("/dashboard")} className="mb-4 -ml-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{survey.title}</h1>
              <p className="text-gray-500">{survey.description || "Survey Analytics"}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleExport("csv")}>
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport("json")}>
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Responses"
              value={analytics?.totalResponses || 0}
              subtext="all time"
              icon={Users}
              trend={analytics?.trendPercentage && analytics.trendPercentage > 0 ? "up" : analytics?.trendPercentage && analytics.trendPercentage < 0 ? "down" : "neutral"}
              trendValue={analytics?.trendPercentage ? `${analytics.trendPercentage > 0 ? '+' : ''}${analytics.trendPercentage}% today` : undefined}
              iconBg="bg-blue-100 text-blue-600"
            />
            <StatCard
              label="Completion Rate"
              value={`${analytics?.completionRate || 0}%`}
              subtext="questions answered"
              icon={Target}
              iconBg="bg-emerald-100 text-emerald-600"
            />
            <StatCard
              label="Avg. Duration"
              value={analytics?.avgDurationMin ? `${analytics.avgDurationMin}m` : "—"}
              subtext="to complete"
              icon={Clock}
              iconBg="bg-purple-100 text-purple-600"
            />
            {analytics?.npsScore !== null && analytics?.npsScore !== undefined ? (
              <StatCard
                label="NPS Score"
                value={analytics.npsScore}
                subtext={analytics.npsScore >= 50 ? "Excellent" : analytics.npsScore >= 0 ? "Good" : "Needs work"}
                icon={TrendingUp}
                trend={analytics.npsScore >= 0 ? "up" : "down"}
                iconBg="bg-amber-100 text-amber-600"
              />
            ) : (
              <StatCard
                label="Questions"
                value={survey.questions.length}
                subtext="in survey"
                icon={FileText}
                iconBg="bg-gray-100 text-gray-600"
              />
            )}
          </div>

          {/* Response Trend Mini Chart */}
          {analytics && (
            <Card className="mb-8">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Response Trend</CardTitle>
                    <CardDescription>Last 7 days</CardDescription>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900">{analytics.todayCount}</span>
                    <span className="text-sm text-gray-500 ml-1">today</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <MiniTrendChart data={analytics.last7Days} color="#2563EB" />
                <div className="flex justify-between text-xs text-gray-400 mt-2">
                  <span>7 days ago</span>
                  <span>Today</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white border border-gray-200">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="questions" className="gap-2">
                <MessageSquare className="w-4 h-4" />
                Questions
              </TabsTrigger>
              <TabsTrigger value="responses" className="gap-2">
                <FileText className="w-4 h-4" />
                Responses
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Insights
              </TabsTrigger>
            </TabsList>

            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-6">
              {/* Participation Metrics Card */}
              <ParticipationMetricsCard
                metrics={participationMetrics}
                isLoading={isLoading}
                error={error}
                onRetry={() => queryClient.invalidateQueries({ queryKey: ["/api/surveys", id, "responses"] })}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Device Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Device Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Monitor className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">Desktop</span>
                          </div>
                          <span className="font-medium">{analytics.deviceBreakdown.desktop}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">Mobile</span>
                          </div>
                          <span className="font-medium">{analytics.deviceBreakdown.mobile}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Tablet className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">Tablet</span>
                          </div>
                          <span className="font-medium">{analytics.deviceBreakdown.tablet}</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Top Performing Question */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      Question Performance
                    </CardTitle>
                    <CardDescription>Response rates by question</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics && analytics.questionStats.length > 0 && (
                      <SimpleBarChart
                        data={analytics.questionStats.slice(0, 5).map(q => ({
                          label: `Q${q.index + 1}: ${q.question.question.slice(0, 30)}...`,
                          value: q.responseRate,
                          color: q.responseRate >= 80 ? '#10B981' : q.responseRate >= 50 ? '#F59E0B' : '#EF4444'
                        }))}
                        maxValue={100}
                      />
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* QUESTIONS TAB */}
            <TabsContent value="questions" className="space-y-4">
              {analytics?.questionStats.map((stat) => (
                <Collapsible key={stat.question.id} defaultOpen={stat.index < 2}>
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full text-left">
                        <CardHeader className="hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-xs font-bold px-2 py-1 rounded bg-blue-100 text-blue-700">
                                  Q{stat.index + 1}
                                </span>
                                <CardTitle className="text-base">{stat.question.question}</CardTitle>
                              </div>
                              {stat.question.description && (
                                <CardDescription className="mt-1">{stat.question.description}</CardDescription>
                              )}
                            </div>
                            <div className="flex items-center gap-4 flex-shrink-0">
                              <div className="text-right">
                                <p className="text-lg font-bold text-blue-600">{stat.totalAnswers}</p>
                                <p className="text-xs text-gray-500">{stat.responseRate}% answered</p>
                              </div>
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                        </CardHeader>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0 border-t">
                        {stat.type === "choice" && stat.distribution && (
                          <div className="pt-4">
                            <SimpleBarChart
                              data={Object.entries(stat.distribution)
                                .sort((a, b) => b[1] - a[1])
                                .map(([label, value]) => ({ label, value }))}
                              maxValue={stat.totalAnswers}
                            />
                          </div>
                        )}
                        {stat.type === "rating" && (
                          <div className="pt-4">
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-center">
                                <span className="text-4xl font-bold text-blue-600">{stat.average}</span>
                                <span className="text-gray-500">/{stat.scale}</span>
                              </div>
                              <span className="text-gray-400">Average Rating</span>
                            </div>
                            {stat.distribution && (
                              <SimpleBarChart
                                data={Object.entries(stat.distribution)
                                  .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
                                  .map(([label, value]) => ({ 
                                    label: `${label} ${stat.question.type === 'nps' ? '' : '★'}`, 
                                    value 
                                  }))}
                                maxValue={stat.totalAnswers}
                              />
                            )}
                          </div>
                        )}
                        {stat.type === "text" && stat.sampleAnswers && (
                          <div className="pt-4 space-y-2">
                            <p className="text-sm text-gray-500 mb-3">Sample responses:</p>
                            {stat.sampleAnswers.map((answer, i) => (
                              <div key={i} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                                "{answer}"
                              </div>
                            ))}
                            {stat.totalAnswers > 5 && (
                              <p className="text-sm text-gray-400 text-center pt-2">
                                +{stat.totalAnswers - 5} more responses
                              </p>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </TabsContent>

            {/* RESPONSES TAB */}
            <TabsContent value="responses" className="space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="py-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <Input
                        placeholder="Search responses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-10"
                      />
                    </div>
                    <div className="w-40">
                      <label className="text-xs font-medium text-gray-500 block mb-1">From</label>
                      <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-10" />
                    </div>
                    <div className="w-40">
                      <label className="text-xs font-medium text-gray-500 block mb-1">To</label>
                      <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-10" />
                    </div>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                      <SelectTrigger className="w-36 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                      </SelectContent>
                    </Select>
                    {selectedIds.size > 0 && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => bulkDeleteMutation.mutate(Array.from(selectedIds))}
                        disabled={bulkDeleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete ({selectedIds.size})
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Response List */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {filteredResponses.length} Response{filteredResponses.length !== 1 ? 's' : ''}
                    </CardTitle>
                    <Checkbox
                      checked={selectedIds.size === paginatedResponses.length && paginatedResponses.length > 0}
                      onCheckedChange={() => {
                        if (selectedIds.size === paginatedResponses.length) {
                          setSelectedIds(new Set());
                        } else {
                          setSelectedIds(new Set(paginatedResponses.map(r => r.id)));
                        }
                      }}
                    />
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {paginatedResponses.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No responses match your filters
                    </div>
                  ) : (
                    <div className="divide-y">
                      {paginatedResponses.map((response) => (
                        <div 
                          key={response.id} 
                          className="flex items-center gap-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => setSelectedResponse(response)}
                        >
                          <Checkbox
                            checked={selectedIds.has(response.id)}
                            onCheckedChange={() => {
                              const newSet = new Set(selectedIds);
                              if (newSet.has(response.id)) {
                                newSet.delete(response.id);
                              } else {
                                newSet.add(response.id);
                              }
                              setSelectedIds(newSet);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900">
                                {new Date(response.completedAt).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-400">
                                {new Date(response.completedAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {Object.keys(response.answers).length} questions answered
                            </div>
                          </div>
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-500 px-4">
                      Page {page} of {totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* AI INSIGHTS TAB */}
            <TabsContent value="insights">
              <AIInsightsCard 
                insights={insights || null}
                isLoading={insightsLoading}
                error={insightsError?.message}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

