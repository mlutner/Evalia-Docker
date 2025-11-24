import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, TrendingUp, Users, Award, ChevronRight, AlertTriangle, Star, FileText, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import { ResponseTrendsChart, CategoryBreakdownChart, DistributionChart, ResponseVolumeChart } from "./DashboardCharts";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiCard } from "./KpiCard";
import { InsightCard } from "./InsightCard";

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
      <Card style={{ backgroundColor: 'var(--color-neutral-surface)', borderColor: 'var(--color-neutral-border)' }}>
        <CardContent className="pt-6">
          <p style={{ color: 'var(--color-neutral-text-primary)' }}>Failed to load dashboard metrics</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading || !metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i} style={{ backgroundColor: 'var(--color-neutral-surface)', borderColor: 'var(--color-neutral-border)' }}>
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
    <div className="space-y-8 pt-8">
      {/* Header with Time Filter */}
      <div className="flex items-center justify-between pr-6">
        <h2 className="text-[24px] font-bold" style={{ color: 'var(--color-neutral-text-primary)' }}>Dashboard</h2>
        <button className="px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors" style={{ borderColor: 'var(--color-neutral-border)', color: 'var(--color-neutral-text-secondary)', backgroundColor: 'rgba(58, 141, 255, 0.08)', border: '1px solid var(--color-neutral-border)' }} data-testid="button-date-filter">
          <span>Last 30 days</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      {/* KPI Cards - 12 Column Grid */}
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-4">
          <KpiCard
            label="Created this month"
            value={metrics.totalSurveys}
            subtext={`${metrics.activeSurveys} active`}
            icon={BarChart3}
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <KpiCard
            label="Across all scoring models"
            value={metrics.avgScore}
            subtext="out of 100"
            icon={Award}
          />
        </div>
        <div className="col-span-12 md:col-span-4">
          <KpiCard
            label="Across all surveys"
            value={`${metrics.responseRate}%`}
            subtext="completion"
            icon={TrendingUp}
          />
        </div>
      </div>

      {/* Charts Grid + AI Insights - 12 Column Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Charts Column: 8 columns */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Response Trends & Category Breakdown */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6">
              <Card className="rounded-md" style={{ backgroundColor: 'var(--color-neutral-surface)', borderColor: 'var(--color-neutral-border)' }}>
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-[16px] font-semibold" style={{ color: 'var(--color-neutral-text-primary)' }}>How engagement changes over time</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponseTrendsChart data={metrics.trends} />
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Card className="rounded-md" style={{ backgroundColor: 'var(--color-neutral-surface)', borderColor: 'var(--color-neutral-border)' }}>
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-[16px] font-semibold" style={{ color: 'var(--color-neutral-text-primary)' }}>Skills ratings across dimensions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <CategoryBreakdownChart data={[
                    { name: "Communication", count: 8 },
                    { name: "Engagement", count: 6 },
                    { name: "Skills", count: 7 },
                    { name: "Knowledge", count: 5 }
                  ]} />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Distribution & Response Volume */}
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 md:col-span-6">
              <Card className="rounded-md" style={{ backgroundColor: 'var(--color-neutral-surface)', borderColor: 'var(--color-neutral-border)' }}>
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-[16px] font-semibold" style={{ color: 'var(--color-neutral-text-primary)' }}>Distribution of Ratings</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <DistributionChart data={[
                    { rating: "1", count: 1 },
                    { rating: "2", count: 2 },
                    { rating: "3", count: 3 },
                    { rating: "4", count: 2 },
                    { rating: "5", count: 2 }
                  ]} />
                </CardContent>
              </Card>
            </div>

            <div className="col-span-12 md:col-span-6">
              <Card className="rounded-md" style={{ backgroundColor: 'var(--color-neutral-surface)', borderColor: 'var(--color-neutral-border)' }}>
                <CardHeader className="p-6 pb-3">
                  <CardTitle className="text-[16px] font-semibold" style={{ color: 'var(--color-neutral-text-primary)' }}>Response Volume</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
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
        </div>

        {/* AI Insights Column: 4 columns */}
        <div className="col-span-12 lg:col-span-4">
          <Card className="rounded-md h-full bg-[#FFFFFF] border-[#E7EBF0]">
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-[16px] font-semibold text-[#1C2B36]">AI Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <InsightCard
                icon={AlertTriangle}
                title="Top Weak Areas"
                description="Communication skills showed lower scores compared to other categories."
                type="warning"
              />
              <InsightCard
                icon={Star}
                title="Top Strength"
                description="Knowledge was rated as the strongest area across all respondents."
                type="info"
              />
              <InsightCard
                icon={FileText}
                title="Question Quality"
                description="1 question may need clarification for better clarity."
                type="info"
              />
              <InsightCard
                icon={CheckCircle}
                title="Recommendations"
                description="Consider revising communication and skills questions for clarity."
                type="neutral"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Surveys Table - Full Width */}
      <Card className="rounded-md bg-[#FFFFFF] border-[#E7EBF0]">
        <CardHeader className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-[16px] font-semibold text-[#1C2B36]">Recent Surveys</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard?tab=all")} data-testid="button-view-all">
              View All <ChevronRight className="w-6 h-6 ml-1" strokeWidth={2} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#E7EBF0]">
                  <th className="text-left py-3 px-4 font-medium text-[#6B7785]">Survey Name</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7785]">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7785]">Responses</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7785]">Avg. Score</th>
                  <th className="text-left py-3 px-4 font-medium text-[#6B7785]">Completion Rate</th>
                </tr>
              </thead>
              <tbody>
                {metrics.recentSurveys.map(survey => (
                  <tr 
                    key={survey.id} 
                    className="border-b border-[#E7EBF0] transition-colors cursor-pointer"
                    style={{ backgroundColor: "transparent" }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(31, 142, 250, 0.04)")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                    onClick={() => setLocation(`/analytics/${survey.id}`)}
                  >
                    <td className="py-3 px-4 font-medium text-[#1C2B36]">{survey.title}</td>
                    <td className="py-3 px-4">
                      <Badge variant={survey.status === "Active" ? "default" : "secondary"}>
                        {survey.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-[#6B7785]">{survey.responseCount}</td>
                    <td className="py-3 px-4 text-[#6B7785]">{survey.avgScore}</td>
                    <td className="py-3 px-4 text-[#6B7785]">{survey.completionRate}%</td>
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
