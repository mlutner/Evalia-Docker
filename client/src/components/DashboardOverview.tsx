import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Award, ChevronRight, AlertTriangle, Star, FileText, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { ResponseTrendsChart, CategoryBreakdownChart, DistributionChart, ResponseVolumeChart } from "./DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardMetrics {
  totalSurveys: number;
  activeSurveys: number;
  avgScore: number;
  responseRate: number;
  totalResponses: number;
  recentSurveys: Array<{
    id: string;
    title: string;
    status: string;
    responseCount: number;
    avgScore: number;
    completionRate: number;
  }>;
  trends: Array<{ month: string; responses: number }>;
}

export function DashboardOverview() {
  const [, setLocation] = useLocation();
  
  const { data: metrics, isLoading, error } = useQuery<DashboardMetrics>({
    queryKey: ["/api/dashboard/metrics"],
  });

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900">
        <CardContent className="pt-6">
          <p className="text-red-700 dark:text-red-400">Failed to load dashboard metrics</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-12 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <button className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
          <span>Last 30 days</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Surveys</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalSurveys}</p>
                <p className="text-xs text-muted-foreground mt-1">{metrics.activeSurveys} active</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-evalia-navy/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-evalia-lime" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Avg. Score</p>
                <p className="text-3xl font-bold mt-2">{metrics.avgScore}</p>
                <p className="text-xs text-muted-foreground mt-1">out of 100</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-evalia-navy/20 flex items-center justify-center">
                <Award className="w-5 h-5 text-evalia-lime" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Response Rate</p>
                <p className="text-3xl font-bold mt-2">{metrics.responseRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">completion</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-evalia-navy/20 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-evalia-lime" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid + AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Response Trends & Category Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseTrendsChart data={metrics.trends} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <CategoryBreakdownChart data={[
                  { name: "Communication", count: 8 },
                  { name: "Engagement", count: 6 },
                  { name: "Skills", count: 7 },
                  { name: "Knowledge", count: 5 }
                ]} />
              </CardContent>
            </Card>
          </div>

          {/* Distribution & Response Volume */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribution of Ratings</CardTitle>
              </CardHeader>
              <CardContent>
                <DistributionChart data={[
                  { rating: "1", count: 1 },
                  { rating: "2", count: 2 },
                  { rating: "3", count: 3 },
                  { rating: "4", count: 2 },
                  { rating: "5", count: 2 }
                ]} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Response Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponseVolumeChart data={[
                  { day: "1", responses: 4 },
                  { day: "2", responses: 3 },
                  { day: "3", responses: 2 },
                  { day: "5", responses: 1 }
                ]} />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: AI Insights */}
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-base">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Top Weak Areas */}
              <div className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover-elevate cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Top Weak Areas</p>
                  <p className="text-xs text-muted-foreground mt-1">Communication skills ensured lower scores compared to other categories.</p>
                </div>
              </div>

              {/* Top Strength */}
              <div className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover-elevate cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <Star className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Top Strength</p>
                  <p className="text-xs text-muted-foreground mt-1">Respondents rated knowledge to the strongest area.</p>
                </div>
              </div>

              {/* Question Quality */}
              <div className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover-elevate cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Question Quality</p>
                  <p className="text-xs text-muted-foreground mt-1">1 question may be unclear or irrelevant</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="flex gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 hover-elevate cursor-pointer">
                <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Recommendations</p>
                  <p className="text-xs text-muted-foreground mt-1">Revise questions on communication and skills.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Surveys Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Surveys</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard?tab=all")} data-testid="button-view-all">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Survey Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Responses</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Avg. Score</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentSurveys.map(survey => (
                  <tr 
                    key={survey.id} 
                    className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer"
                    onClick={() => setLocation(`/analytics/${survey.id}`)}
                  >
                    <td className="py-3 px-4 font-medium">{survey.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant={survey.status === "Active" ? "default" : "secondary"}>
                        {survey.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">{survey.responseCount}</td>
                    <td className="py-3 px-4">{survey.avgScore}</td>
                    <td className="py-3 px-4">{survey.completionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
