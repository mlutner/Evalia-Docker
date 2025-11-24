import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Award, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { ResponseTrendsChart } from "./DashboardCharts";
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Surveys</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalSurveys}</p>
                <p className="text-xs text-muted-foreground mt-1">{metrics.activeSurveys} active</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
              <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
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
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-elevate">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Responses</p>
                <p className="text-3xl font-bold mt-2">{metrics.totalResponses}</p>
                <p className="text-xs text-muted-foreground mt-1">collected</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Response Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Response Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponseTrendsChart data={metrics.trends} />
        </CardContent>
      </Card>

      {/* Recent Surveys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Surveys</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard?tab=all")} data-testid="button-view-all">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {metrics.recentSurveys.map(survey => (
              <div key={survey.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg hover-elevate cursor-pointer" onClick={() => setLocation(`/analytics/${survey.id}`)}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{survey.title}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{survey.responseCount} responses</Badge>
                    <Badge variant="secondary" className="text-xs">{survey.completionRate}%</Badge>
                  </div>
                </div>
                <div className="text-right ml-2">
                  <p className="text-sm font-semibold">{survey.avgScore}</p>
                  <p className="text-xs text-muted-foreground">score</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
