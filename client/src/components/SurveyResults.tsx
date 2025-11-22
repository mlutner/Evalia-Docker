import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";
import type { SurveyScoreConfig } from "@shared/schema";
import { calculateSurveyScores } from "@shared/schema";
import type { Question, Survey } from "@shared/schema";

interface SurveyResultsProps {
  survey: Survey;
  answers: Record<string, string | string[]>;
  thankYouMessage: string;
}

export default function SurveyResults({
  survey,
  answers,
  thankYouMessage,
}: SurveyResultsProps) {
  const scores = calculateSurveyScores(
    survey.questions,
    answers,
    survey.scoreConfig || undefined
  );

  if (!scores) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="text-center max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
              <TrendingUp className="w-12 h-12 text-primary-foreground" strokeWidth={2} />
            </div>
            <div className="absolute inset-0 w-24 h-24 mx-auto bg-primary/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 px-4">
            Thank you!
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mb-3 sm:mb-4 px-4">
            {thankYouMessage || "Your responses have been recorded successfully."}
          </p>
          <Button
            size="lg"
            onClick={() => window.location.reload()}
            data-testid="button-submit-another"
            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto mx-4"
          >
            Submit Another Response
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" data-testid="text-results-title">
            Your Results
          </h1>
          {survey.scoreConfig?.resultsSummary && (
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              {survey.scoreConfig.resultsSummary}
            </p>
          )}
        </div>

        {/* Score Cards */}
        <div className="space-y-4 mb-8">
          {scores.map((result) => {
            const percentage = (result.score / result.maxScore) * 100;
            const progressColor =
              percentage >= 80
                ? "bg-green-500"
                : percentage >= 60
                  ? "bg-blue-500"
                  : percentage >= 40
                    ? "bg-yellow-500"
                    : "bg-red-500";

            return (
              <Card key={result.categoryId} data-testid={`card-score-${result.categoryId}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.categoryName}</CardTitle>
                    <span className="text-2xl font-bold text-primary" data-testid={`text-score-${result.categoryId}`}>
                      {result.score}/{result.maxScore}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                      data-testid={`progress-${result.categoryId}`}
                    />
                  </div>

                  {/* Interpretation */}
                  <p className="text-sm text-muted-foreground" data-testid={`text-interpretation-${result.categoryId}`}>
                    {result.interpretation}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Thank You Message */}
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground" data-testid="text-thank-you">
              {thankYouMessage || "Thank you for completing this assessment!"}
            </p>
          </CardContent>
        </Card>

        {/* Action Button */}
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            onClick={() => window.location.reload()}
            data-testid="button-submit-another-results"
            className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            Submit Another Response
          </Button>
        </div>
      </div>
    </div>
  );
}
