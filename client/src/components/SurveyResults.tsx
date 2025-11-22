import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { TrendingUp, LogOut } from "lucide-react";
import type { SurveyScoreConfig } from "@shared/schema";
import { calculateSurveyScores } from "@shared/schema";
import type { Question, Survey } from "@shared/schema";

interface SurveyResultsProps {
  survey: Survey;
  answers: Record<string, string | string[]>;
  thankYouMessage: string;
  onExit?: () => void;
}

export default function SurveyResults({
  survey,
  answers,
  thankYouMessage,
  onExit,
}: SurveyResultsProps) {
  const scores = calculateSurveyScores(
    survey.questions,
    answers,
    survey.scoreConfig || undefined
  );

  // Find interpretations and range info for each score
  const getScoreRangeInfo = (categoryId: string, score: number, maxScore: number, originalCategoryScore: number, originalMaxScore: number) => {
    const config = survey.scoreConfig;
    if (!config?.scoreRanges) return null;
    
    // Calculate position on FULL SCALE (0 to maxScore)
    const percentageOfMax = (score / maxScore) * 100;
    
    // Determine color and performance level based on full scale: red (0-33%), orange (33-66%), green (66-100%)
    let progressColor = "bg-red-500";
    let performanceLevel = "low";
    let badgeBgColor = "bg-red-100";
    let badgeTextColor = "text-red-700";
    let badgeBorderColor = "border-red-200";
    
    if (percentageOfMax >= 66) {
      progressColor = "bg-green-500";
      performanceLevel = "high";
      badgeBgColor = "bg-green-100";
      badgeTextColor = "text-green-700";
      badgeBorderColor = "border-green-200";
    } else if (percentageOfMax >= 33) {
      progressColor = "bg-amber-500";
      performanceLevel = "mid";
      badgeBgColor = "bg-amber-100";
      badgeTextColor = "text-amber-700";
      badgeBorderColor = "border-amber-200";
    }
    
    // Try to find exact matching range using ORIGINAL (non-normalized) score
    const range = config.scoreRanges.find(
      (r: any) => r.category === categoryId && originalCategoryScore >= r.minScore && originalCategoryScore <= r.maxScore
    );
    
    if (range) {
      // Normalize the range bounds to 0-100 scale
      const normalizedMinScore = originalMaxScore > 0 ? Math.round((range.minScore / originalMaxScore) * 100) : 0;
      const normalizedMaxScore = originalMaxScore > 0 ? Math.round((range.maxScore / originalMaxScore) * 100) : 100;
      
      return {
        interpretation: range.interpretation,
        label: range.label,
        minScore: normalizedMinScore,
        maxScore: normalizedMaxScore,
        percentageOfMax,
        performanceLevel,
        progressColor,
        badgeBgColor,
        badgeTextColor,
        badgeBorderColor,
      };
    }
    
    // Fallback: if no exact range found, create synthetic range based on performance level
    const fallbackLabel = performanceLevel === "high" ? "Excellent" : performanceLevel === "mid" ? "On track" : "Needs development";
    const fallbackInterpretation = performanceLevel === "high" 
      ? "You demonstrate strong performance in this area." 
      : performanceLevel === "mid"
      ? "You're making good progress in this area."
      : "There is room for improvement in this area.";
    
    return {
      interpretation: fallbackInterpretation,
      label: fallbackLabel,
      minScore: 0,
      maxScore: maxScore,
      percentageOfMax,
      performanceLevel,
      progressColor,
      badgeBgColor,
      badgeTextColor,
      badgeBorderColor,
    };
  };

  // Handle exit - navigate away from the survey to home page
  const handleExit = () => {
    window.location.href = "/";
  };

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
            onClick={handleExit}
            data-testid="button-exit"
            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-all w-full sm:w-auto mx-4"
          >
            Exit
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
        <div className="space-y-6 mb-8">
          {scores.map((result) => {
            // We need the original category score to match against original ranges
            // Calculate it by denormalizing: if score is out of 100, what would it be out of the original max?
            const config = survey.scoreConfig;
            const originalMaxScore = config?.scoreRanges
              .filter((r: any) => r.category === result.categoryId)
              .reduce((max: number, r: any) => Math.max(max, r.maxScore), 20) || 20;
            const originalCategoryScore = (result.score / result.maxScore) * originalMaxScore;
            
            const rangeInfo = getScoreRangeInfo(result.categoryId, result.score, result.maxScore, originalCategoryScore, originalMaxScore);
            const progressColor = rangeInfo?.progressColor || "bg-blue-500";

            const rangeLabel = rangeInfo?.label || "Assessment";

            // Generate contextual recommendations based on performance level (mapped to colors)
            const getRecommendation = () => {
              if (!rangeInfo) return null;
              
              const config = survey.scoreConfig;
              const feedbackTemplates = config?.feedbackTemplates || [];
              
              // Map recommendations to color-coded performance levels
              if (rangeInfo.performanceLevel === "high") {
                const template = feedbackTemplates.find(f => f.level === "high")?.template;
                return template || `You demonstrate strong ${result.categoryName.toLowerCase()}. Continue to leverage your strengths and consider mentoring others in this area.`;
              } else if (rangeInfo.performanceLevel === "low") {
                const template = feedbackTemplates.find(f => f.level === "low")?.template;
                return template || `Focus on developing your ${result.categoryName.toLowerCase()}. Consider seeking feedback, practicing key skills, and exploring resources to strengthen this competency.`;
              } else {
                const template = feedbackTemplates.find(f => f.level === "mid")?.template;
                return template || `You're making progress in ${result.categoryName.toLowerCase()}. Build on your foundation by seeking targeted development opportunities and feedback from peers.`;
              }
            };

            const recommendation = getRecommendation();

            return (
              <Card key={result.categoryId} data-testid={`card-score-${result.categoryId}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{result.categoryName}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{rangeLabel}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-primary" data-testid={`text-score-${result.categoryId}`}>
                        {result.score}
                      </span>
                      <span className="text-sm text-muted-foreground ml-2">/ {result.maxScore}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Slider Visualization */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span className="font-semibold">{result.score}</span>
                      <span>{result.maxScore}</span>
                    </div>
                    <Slider
                      value={[result.score]}
                      min={0}
                      max={result.maxScore}
                      disabled
                      className="w-full"
                      data-testid={`slider-score-${result.categoryId}`}
                    />
                  </div>

                  {/* Progress Bar - Color coded by score position on full scale */}
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                      style={{ width: `${Math.min((result.score / result.maxScore) * 100, 100)}%` }}
                      data-testid={`progress-${result.categoryId}`}
                    />
                  </div>

                  {/* Interpretation and Recommendations */}
                  <div className="space-y-3">
                    {rangeInfo?.interpretation && (
                      <p className="text-sm text-foreground font-medium" data-testid={`text-interpretation-${result.categoryId}`}>
                        {rangeInfo.interpretation.replace(/^Score range:\s*[\d\-]+\.\s*/, "")}
                      </p>
                    )}
                    {recommendation && (
                      <div className="bg-muted/50 rounded-md p-3">
                        <p className="text-sm text-foreground" data-testid={`text-recommendation-${result.categoryId}`}>
                          <span className="font-semibold">Recommendation: </span>
                          {recommendation}
                        </p>
                      </div>
                    )}
                    {rangeInfo && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-xs text-muted-foreground">
                          Range: {rangeInfo.minScore} - {rangeInfo.maxScore}
                        </p>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border ${rangeInfo.badgeBgColor} ${rangeInfo.badgeTextColor} ${rangeInfo.badgeBorderColor}`}>
                          {rangeInfo.performanceLevel === "high" && "Excellent"}
                          {rangeInfo.performanceLevel === "mid" && "On track"}
                          {rangeInfo.performanceLevel === "low" && "Needs development"}
                        </div>
                      </div>
                    )}
                  </div>
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

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
            data-testid="button-submit-another-results"
            className="text-base px-8 py-6"
          >
            Submit Another Response
          </Button>
          <Button
            size="lg"
            onClick={handleExit}
            data-testid="button-exit-results"
            className="text-base px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Exit
          </Button>
        </div>
      </div>
    </div>
  );
}
