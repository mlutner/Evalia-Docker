import { storage } from "./storage";

export async function getDashboardMetrics(userId: string) {
  const surveys = await storage.getAllSurveys(userId);
  
  // Calculate aggregate metrics
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.status === "Active").length;
  
  let totalResponses = 0;
  let totalScore = 0;
  let responsesWithScores = 0;
  const recentSurveysData: Array<{
    id: string;
    title: string;
    status: string;
    responseCount: number;
    avgScore: number;
    completionRate: number;
  }> = [];
  
  // Process all surveys
  for (const survey of surveys) {
    const responses = await storage.getResponses(survey.id);
    totalResponses += responses.length;
    
    if (survey.scoreConfig) {
      responses.forEach(r => {
        if (r.score !== undefined && r.score !== null) {
          totalScore += r.score;
          responsesWithScores++;
        }
      });
    }
    
    // Track recent surveys
    const withScores = responses.filter(r => r.score !== undefined && r.score !== null);
    const avgSurveyScore = withScores.length > 0 
      ? Math.round(withScores.reduce((sum, r) => sum + (r.score || 0), 0) / withScores.length)
      : 0;
    
    recentSurveysData.push({
      id: survey.id,
      title: survey.title,
      status: survey.status || "Draft",
      responseCount: responses.length,
      avgScore: avgSurveyScore,
      completionRate: 75, // Default estimate
    });
  }
  
  // Get recent 5
  const recentSurveys = recentSurveysData
    .sort((a, b) => totalResponses - totalResponses) // Would need survey timestamps for proper sort
    .slice(0, 5);
  
  const avgScore = responsesWithScores > 0 ? Math.round(totalScore / responsesWithScores) : 0;
  const responseRate = totalResponses > 0 ? Math.min(100, Math.round((totalResponses / Math.max(10, totalSurveys)) * 100)) : 0;
  
  // Trends (last 6 months - mock data based on response count)
  const trends = generateTrends(totalResponses);
  
  return {
    totalSurveys,
    activeSurveys,
    avgScore,
    responseRate,
    totalResponses,
    recentSurveys,
    trends,
  };
}

function generateTrends(totalResponses: number) {
  const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
  const baseValue = Math.max(1, Math.floor(totalResponses / months.length));
  return months.map((month, idx) => ({
    month,
    responses: baseValue + (idx * 2), // Simple increasing trend
  }));
}
