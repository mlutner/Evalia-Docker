import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, FileText, Calendar, Download, Loader2 } from "lucide-react";
import type { Survey, SurveyResponse } from "@shared/schema";

interface AnalyticsData {
  survey: Survey;
  responses: SurveyResponse[];
  count: number;
}

export default function AnalyticsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["/api/surveys", id, "responses"],
    enabled: !!id,
  });

  // Calculate statistics for a question
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
            <h1 className="text-2xl font-semibold mb-2">Analytics Not Available</h1>
            <p className="text-muted-foreground mb-6">
              Unable to load analytics for this survey.
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
            <Button variant="outline" data-testid="button-export">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Questions</CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{survey.questions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Created</CardTitle>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">
                {new Date(survey.createdAt).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        </div>

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
            <h2 className="text-2xl font-semibold">Question Breakdown</h2>
            {survey.questions.map((question, index) => {
              const stats = getQuestionStats(question.id);
              if (!stats) return null;

              return (
                <Card key={question.id} data-testid={`question-analytics-${question.id}`}>
                  <CardHeader>
                    <CardTitle>
                      Q{index + 1}: {question.question}
                    </CardTitle>
                    {question.description && (
                      <CardDescription>{question.description}</CardDescription>
                    )}
                    <div className="text-sm text-muted-foreground">
                      {stats.total} {stats.total === 1 ? "response" : "responses"}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(stats.type === "multiple_choice" || stats.type === "checkbox") && stats.distribution ? (
                      <div className="space-y-3">
                        {Object.entries(stats.distribution).map(([option, count]) => {
                          const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                          return (
                            <div key={option} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{option}</span>
                                <span className="text-muted-foreground">
                                  {count} ({percentage.toFixed(1)}%)
                                </span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : stats.answers && stats.answers.length > 0 ? (
                      <div className="space-y-2">
                        {stats.answers.slice(0, 10).map((answer, i) => (
                          <div
                            key={i}
                            className="p-3 bg-muted rounded-md text-sm"
                            data-testid={`answer-${question.id}-${i}`}
                          >
                            {answer}
                          </div>
                        ))}
                        {stats.answers.length > 10 && (
                          <p className="text-sm text-muted-foreground text-center pt-2">
                            + {stats.answers.length - 10} more responses
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No responses for this question</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
