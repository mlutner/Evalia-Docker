import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertCircle, Target, Zap, ArrowUpRight } from "lucide-react";

interface AtAGlanceWidgetProps {
  title: string;
  description: string;
  items: {
    label: string;
    value: string | number;
    status?: "high" | "medium" | "low";
    trend?: "up" | "down";
  }[];
}

export function AtAGlanceWidget({ title, description, items }: AtAGlanceWidgetProps) {
  return (
    <Card data-testid="widget-at-a-glance">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4" style={{ color: '#A3D65C' }} />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No data available yet</p>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-sm font-medium">{item.label}</span>
                {item.trend === "up" && <ArrowUpRight className="w-3 h-3 text-green-500" />}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{item.value}</span>
                {item.status && (
                  <Badge
                    variant={item.status === "high" ? "default" : item.status === "medium" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {item.status}
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

interface GoalTrackingWidgetProps {
  goal: string;
  targetValue: number;
  currentValue: number;
  unit: string;
}

export function GoalTrackingWidget({ goal, targetValue, currentValue, unit }: GoalTrackingWidgetProps) {
  const percentage = Math.min((currentValue / targetValue) * 100, 100);
  const isAchieved = percentage >= 100;

  return (
    <Card data-testid="widget-goal-tracking">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="w-4 h-4" style={{ color: '#2F8FA5' }} />
          Goal Progress
        </CardTitle>
        <CardDescription>{goal}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {currentValue} / {targetValue} {unit}
            </span>
            <span className="text-sm font-semibold">{Math.round(percentage)}%</span>
          </div>
          <Progress value={percentage} className="h-3" />
        </div>
        {isAchieved && (
          <div className="p-3 rounded-md bg-green-50 dark:bg-green-950">
            <p className="text-sm font-medium text-green-700 dark:text-green-300">Goal Achieved!</p>
          </div>
        )}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          data-testid="button-edit-goal"
        >
          Edit Goal
        </Button>
      </CardContent>
    </Card>
  );
}

interface PersonalizedRecommendationProps {
  title: string;
  description: string;
  action: string;
  severity: "info" | "warning" | "critical";
}

export function PersonalizedRecommendation({
  title,
  description,
  action,
  severity,
}: PersonalizedRecommendationProps) {
  const severityConfig = {
    info: { bg: "bg-blue-50 dark:bg-blue-950", border: "border-blue-200 dark:border-blue-800", icon: "text-blue-600 dark:text-blue-400" },
    warning: { bg: "bg-amber-50 dark:bg-amber-950", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-600 dark:text-amber-400" },
    critical: { bg: "bg-red-50 dark:bg-red-950", border: "border-red-200 dark:border-red-800", icon: "text-red-600 dark:text-red-400" },
  };

  const config = severityConfig[severity];

  return (
    <Card
      className={`border-l-4 ${config.bg} ${config.border}`}
      data-testid="widget-recommendation"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.icon}`} />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm" style={{ color: 'inherit' }}>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs"
          data-testid="button-recommendation-action"
        >
          {action}
        </Button>
      </CardContent>
    </Card>
  );
}

interface CommandCenterProps {
  showRecommendations?: boolean;
}

export function CommandCenter({ showRecommendations = true }: CommandCenterProps) {
  return (
    <div className="space-y-6" data-testid="command-center">
      {/* At a Glance Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          At a Glance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AtAGlanceWidget
            title="Highest Completion Rates"
            description="Top performing surveys"
            items={[
              { label: "Post-Training Feedback", value: "94%", status: "high", trend: "up" },
              { label: "Employee Satisfaction", value: "87%", status: "high" },
            ]}
          />
          <AtAGlanceWidget
            title="Question Drop-offs"
            description="Where respondents exit"
            items={[
              { label: "Q5 - Training Engagement", value: "34%", status: "critical" },
              { label: "Q8 - Future Topics", value: "22%", status: "medium" },
            ]}
          />
          <AtAGlanceWidget
            title="Recent AI Insights"
            description="AI-generated observations"
            items={[
              { label: "Sentiment trending positive", value: "↑" },
              { label: "Response time improved", value: "↑" },
            ]}
          />
        </div>
      </div>

      {/* Goal Tracking Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5" />
          Your Goals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GoalTrackingWidget
            goal="Achieve 90% completion rate on all surveys"
            targetValue={90}
            currentValue={87}
            unit="%"
          />
          <GoalTrackingWidget
            goal="Collect 500 responses this month"
            targetValue={500}
            currentValue={342}
            unit="responses"
          />
        </div>
      </div>

      {/* Personalized Recommendations Section */}
      {showRecommendations && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: '#A3D65C' }} />
            AI Recommendations
          </h3>
          <div className="space-y-3">
            <PersonalizedRecommendation
              title="High Drop-off Detected"
              description="Your 'Post-Training Feedback' survey has a 34% drop-off rate on question 5. This might indicate unclear wording or survey fatigue."
              action="View Details"
              severity="critical"
            />
            <PersonalizedRecommendation
              title="Sentiment Improvement"
              description="Respondent sentiment has improved by 12% compared to last month's surveys. Keep up the good work!"
              action="View Analysis"
              severity="info"
            />
            <PersonalizedRecommendation
              title="Response Time Opportunity"
              description="Average survey completion time is 8.5 minutes. Consider shortening to improve response rates."
              action="Optimize Survey"
              severity="warning"
            />
          </div>
        </div>
      )}
    </div>
  );
}
