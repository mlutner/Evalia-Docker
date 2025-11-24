import { storage } from "./storage";
import type { SurveyResponse } from "@shared/schema";

export async function getDashboardMetrics(userId: string) {
  const surveys = await storage.getSurveysByUser(userId);
  
  // Calculate aggregate metrics
  const totalSurveys = surveys.length;
  const activeSurveys = surveys.filter(s => s.status === "Active").length;
  
  let totalResponses = 0;
  let totalScore = 0;
  let responsesWithScores = 0;
  let allResponses: (SurveyResponse & { surveyId: string })[] = [];
  
  for (const survey of surveys) {
    const responses = await storage.getResponses(survey.id);
    totalResponses += responses.length;
    allResponses.push(...responses.map(r => ({ ...r, surveyId: survey.id })));
    
    if (survey.scoreConfig) {
      responses.forEach(r => {
        if (r.score !== undefined) {
          totalScore += r.score;
          responsesWithScores++;
        }
      });
    }
  }
  
  const avgScore = responsesWithScores > 0 ? Math.round(totalScore / responsesWithScores) : 0;
  const responseRate = totalSurveys > 0 ? Math.round((totalResponses / (totalSurveys * 10)) * 100) : 0; // Rough estimate
  
  // Recent surveys (last 5)
  const recentSurveys = surveys
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(s => {
      const responses = allResponses.filter(r => r.surveyId === s.id);
      const withScores = responses.filter(r => r.score !== undefined);
      const avgSurveyScore = withScores.length > 0 
        ? Math.round(withScores.reduce((sum, r) => sum + (r.score || 0), 0) / withScores.length)
        : 0;
      return {
        id: s.id,
        title: s.title,
        status: s.status,
        responseCount: responses.length,
        avgScore: avgSurveyScore,
        completionRate: responses.length > 0 ? Math.round((responses.length / 10) * 100) : 0,
      };
    });
  
  // Trends (mock data for now - last 6 months)
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
  return months.map((month, idx) => ({
    month,
    responses: Math.max(1, Math.floor((totalResponses * (idx + 1)) / months.length)),
  }));
}
