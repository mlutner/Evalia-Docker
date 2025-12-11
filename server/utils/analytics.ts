/**
 * Analytics Utility Functions
 * 
 * [ANAL-010] Participation Metrics Backend Implementation
 * [ANAL-004] Index Distribution Backend Implementation
 * [ANAL-005] Index Band Distribution Backend Implementation
 * [ANAL-006] Question Summary Backend Implementation
 * [ANAL-007] Manager Index Summary Backend Implementation
 * [ANAL-008] Index Trends Summary Backend Implementation
 * [ANAL-009] Before/After Index Comparison Backend Implementation
 * [NAMING-001] Uses "Insight Dimensions" terminology (EID framework)
 * 
 * Helper functions for computing Evalia Insight Dimensions (EID) metrics.
 * All functions are version-aware (filter by scoreConfigVersionId).
 * 
 * See docs/EVALIA_INSIGHT_DIMENSIONS.md for canonical dimension definitions.
 */

import { db } from "../db";
import { surveyResponses, surveyRespondents, surveys, calculateSurveyScores } from "@shared/schema";
import { eq, and, count, sql, gte } from "drizzle-orm";
import type {
  ParticipationMetricsData,
  IndexDistributionData,
  IndexBandDistributionData,
  IndexBand,
  QuestionSummaryData,
  QuestionSummaryItem,
  OptionDistribution,
} from "@shared/analytics";
import type { Question } from "@shared/schema";

// Completion threshold - responses with >= this percentage are considered "completed"
const COMPLETION_THRESHOLD = 80;

/**
 * Compute participation metrics for a survey.
 * 
 * @param surveyId - The survey ID to compute metrics for
 * @param versionId - Optional score config version ID to filter by
 * @returns ParticipationMetricsData with totalResponses, responseRate, completionRate, avgCompletionTime
 */
export async function computeParticipationMetrics(
  surveyId: string,
  versionId?: string
): Promise<ParticipationMetricsData> {
  // Build base condition
  const baseCondition = versionId
    ? and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionId)
      )
    : eq(surveyResponses.surveyId, surveyId);

  // Query 1: Total responses count
  const [totalResult] = await db
    .select({ count: count() })
    .from(surveyResponses)
    .where(baseCondition);

  const totalResponses = totalResult?.count || 0;

  // Query 2: Count of invites (for response rate calculation)
  const [invitesResult] = await db
    .select({ count: count() })
    .from(surveyRespondents)
    .where(eq(surveyRespondents.surveyId, surveyId));

  const totalInvites = invitesResult?.count || 0;

  // Calculate response rate (null if no invites tracked)
  const responseRate = totalInvites > 0
    ? Math.round((totalResponses / totalInvites) * 1000) / 10 // One decimal place
    : null;

  // Query 3: Count of completed responses (completionPercentage >= threshold)
  const [completedResult] = await db
    .select({ count: count() })
    .from(surveyResponses)
    .where(
      versionId
        ? and(
            eq(surveyResponses.surveyId, surveyId),
            eq(surveyResponses.scoreConfigVersionId, versionId),
            gte(surveyResponses.completionPercentage, COMPLETION_THRESHOLD)
          )
        : and(
            eq(surveyResponses.surveyId, surveyId),
            gte(surveyResponses.completionPercentage, COMPLETION_THRESHOLD)
          )
    );

  const completedResponses = completedResult?.count || 0;

  // Calculate completion rate (percentage)
  const completionRate = totalResponses > 0
    ? Math.round((completedResponses / totalResponses) * 1000) / 10 // One decimal place
    : 0;

  // Query 4: Average completion time
  // Prefer totalDurationMs, fall back to (completedAt - startedAt) if null
  const [avgTimeResult] = await db
    .select({
      avgDurationMs: sql<number>`
        AVG(
          CASE 
            WHEN ${surveyResponses.totalDurationMs} IS NOT NULL 
              THEN ${surveyResponses.totalDurationMs}
            WHEN ${surveyResponses.completedAt} IS NOT NULL 
              AND ${surveyResponses.startedAt} IS NOT NULL
              THEN EXTRACT(EPOCH FROM (${surveyResponses.completedAt} - ${surveyResponses.startedAt})) * 1000
            ELSE NULL
          END
        )
      `.mapWith(Number),
    })
    .from(surveyResponses)
    .where(baseCondition);

  // Convert ms to seconds, round to integer
  // Use != null so 0 is treated as valid (not falsy)
  const avgDurationMs = avgTimeResult?.avgDurationMs;
  const avgCompletionTime = avgDurationMs != null
    ? Math.round(Number(avgDurationMs) / 1000) // Convert ms to seconds
    : null;

  return {
    totalResponses,
    responseRate,
    completionRate,
    avgCompletionTime,
  };
}

/**
 * Get the latest score config version ID for a survey.
 * Used when no version is specified in the request.
 * Returns null if the score_config_versions table doesn't exist yet.
 */
export async function getLatestVersionId(surveyId: string): Promise<string | null> {
  try {
    const [result] = await db
      .select({ id: sql<string>`id` })
      .from(sql`score_config_versions`)
      .where(sql`survey_id = ${surveyId}`)
      .orderBy(sql`version_number DESC`)
      .limit(1);

    return result?.id || null;
  } catch {
    // Table may not exist yet - return null to use all responses
    return null;
  }
}

// ============================================================================
// INDEX DISTRIBUTION (ANAL-004)
// ============================================================================

/**
 * Distribution bucket configuration
 * Standard 5-bucket distribution: 0-20, 21-40, 41-60, 61-80, 81-100
 */
const INDEX_BUCKETS = [
  { range: '0-20', min: 0, max: 20 },
  { range: '21-40', min: 21, max: 40 },
  { range: '41-60', min: 41, max: 60 },
  { range: '61-80', min: 61, max: 80 },
  { range: '81-100', min: 81, max: 100 },
];

/**
 * Compute index distribution for a survey.
 * 
 * @param surveyId - The survey ID to compute distribution for
 * @param indexType - The index type (e.g., 'engagement', 'leadership-effectiveness')
 * @param versionId - Optional score config version ID to filter by
 * @returns IndexDistributionData with buckets and statistics
 */
export async function computeIndexDistribution(
  surveyId: string,
  indexType: string,
  versionId?: string
): Promise<IndexDistributionData> {
  // Step 1: Fetch survey with questions and scoreConfig
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId))
    .limit(1);

  if (!survey || !survey.scoreConfig?.enabled) {
    // Return empty distribution if no scoring config
    return createEmptyDistribution();
  }

  // Step 2: Fetch all responses for this survey
  const baseCondition = versionId
    ? and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionId)
      )
    : eq(surveyResponses.surveyId, surveyId);

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(baseCondition);

  if (responses.length === 0) {
    return createEmptyDistribution();
  }

  // Step 3: Calculate scores for each response and extract index scores
  const indexScores: number[] = [];

  for (const response of responses) {
    const scoreResults = calculateSurveyScores(
      survey.questions,
      response.answers,
      survey.scoreConfig
    );

    if (!scoreResults || scoreResults.length === 0) continue;

    // Calculate overall index score as weighted average of category scores
    // For now, we use simple average; future versions can filter by indexType metadata
    const overallScore = calculateOverallIndexScore(scoreResults, indexType);
    if (overallScore !== null) {
      indexScores.push(overallScore);
    }
  }

  if (indexScores.length === 0) {
    return createEmptyDistribution();
  }

  // Step 4: Calculate bucket distribution
  const bucketCounts = INDEX_BUCKETS.map(bucket => ({
    ...bucket,
    count: 0,
    percentage: 0,
  }));

  for (const score of indexScores) {
    const bucketIndex = INDEX_BUCKETS.findIndex(
      b => score >= b.min && score <= b.max
    );
    if (bucketIndex >= 0) {
      bucketCounts[bucketIndex].count++;
    }
  }

  // Calculate percentages
  const total = indexScores.length;
  bucketCounts.forEach(bucket => {
    bucket.percentage = Math.round((bucket.count / total) * 1000) / 10;
  });

  // Step 5: Calculate statistics
  const sortedScores = [...indexScores].sort((a, b) => a - b);
  const statistics = {
    min: sortedScores[0],
    max: sortedScores[sortedScores.length - 1],
    mean: Math.round((indexScores.reduce((a, b) => a + b, 0) / total) * 10) / 10,
    median: calculateMedian(sortedScores),
    stdDev: Math.round(calculateStdDev(indexScores) * 10) / 10,
  };

  return {
    overall: {
      buckets: bucketCounts,
      statistics,
    },
  };
}

/**
 * Calculate overall index score from category results.
 * Uses simple average of all category scores normalized to 0-100.
 */
function calculateOverallIndexScore(
  results: Array<{
    categoryId: string;
    categoryName: string;
    score: number;
    maxScore: number;
    interpretation: string;
  }>,
  indexType: string
): number | null {
  if (results.length === 0) return null;

  // For now, compute simple average of all category scores
  // Future: filter by indexType using category metadata
  const totalScore = results.reduce((sum, r) => sum + r.score, 0);
  const avgScore = totalScore / results.length;

  // Clamp to 0-100
  return Math.min(100, Math.max(0, Math.round(avgScore)));
}

/**
 * Calculate median of a sorted array
 */
function calculateMedian(sorted: number[]): number {
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return Math.round(((sorted[mid - 1] + sorted[mid]) / 2) * 10) / 10;
  }
  return sorted[mid];
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(values: number[]): number {
  const n = values.length;
  if (n === 0) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / n;
  return Math.sqrt(variance);
}

/**
 * Create empty distribution response
 */
function createEmptyDistribution(): IndexDistributionData {
  return {
    overall: {
      buckets: INDEX_BUCKETS.map(b => ({
        ...b,
        count: 0,
        percentage: 0,
      })),
      statistics: {
        min: 0,
        max: 0,
        mean: 0,
        median: 0,
        stdDev: 0,
      },
    },
  };
}

// ============================================================================
// INDEX BAND DISTRIBUTION (ANAL-005)
// [ANAL-QA-030] Refactored to use shared/analyticsBands.ts as canonical source
// ============================================================================

import {
  INDEX_BAND_DEFINITIONS,
  resolveBandIndex,
  createEmptyBandStats,
  type IndexBandWithStats,
} from '@shared/analyticsBands';

/**
 * @deprecated Use INDEX_BAND_DEFINITIONS from shared/analyticsBands.ts instead.
 * Kept for backwards compatibility with existing code.
 */
export const DEFAULT_INDEX_BANDS = INDEX_BAND_DEFINITIONS.map(band => ({
  bandId: band.bandId,
  bandLabel: band.label,
  color: band.color,
  minScore: band.min,
  maxScore: band.max,
}));

export type IndexType = 
  | 'leadership-effectiveness' 
  | 'team-wellbeing' 
  | 'burnout-risk' 
  | 'psychological-safety' 
  | 'engagement';

/**
 * Compute index band distribution for a survey.
 * 
 * Reuses the same scoring logic as computeIndexDistribution but buckets
 * scores into performance bands instead of numeric ranges.
 * 
 * @param surveyId - The survey ID to compute distribution for
 * @param indexType - The index type (e.g., 'engagement', 'leadership-effectiveness')
 * @param versionId - Optional score config version ID to filter by
 * @returns IndexBandDistributionData with bands array and totalResponses
 */
export async function computeIndexBandDistribution(
  surveyId: string,
  indexType: IndexType,
  versionId?: string
): Promise<IndexBandDistributionData> {
  // Step 1: Fetch survey with questions and scoreConfig
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId))
    .limit(1);

  if (!survey || !survey.scoreConfig?.enabled) {
    return createEmptyBandDistribution();
  }

  // Step 2: Fetch all responses for this survey
  const baseCondition = versionId
    ? and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionId)
      )
    : eq(surveyResponses.surveyId, surveyId);

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(baseCondition);

  const totalResponses = responses.length;

  if (totalResponses === 0) {
    return createEmptyBandDistribution();
  }

  // Step 3: Calculate scores for each response and extract index scores
  const indexScores: number[] = [];

  for (const response of responses) {
    const scoreResults = calculateSurveyScores(
      survey.questions,
      response.answers,
      survey.scoreConfig
    );

    if (!scoreResults || scoreResults.length === 0) continue;

    // Calculate overall index score (same logic as computeIndexDistribution)
    const overallScore = calculateOverallIndexScore(scoreResults, indexType);
    if (overallScore !== null) {
      indexScores.push(overallScore);
    }
  }

  // Step 4: Calculate band distribution using shared helpers
  // [ANAL-QA-030] Use resolveBandIndex from shared/analyticsBands.ts
  const bandStats = createEmptyBandStats();

  for (const score of indexScores) {
    const bandIndex = resolveBandIndex(score);
    if (bandIndex >= 0) {
      bandStats[bandIndex].count++;
    }
  }

  // Calculate percentages (based on scored responses, not total)
  const scoredTotal = indexScores.length;
  if (scoredTotal > 0) {
    bandStats.forEach(band => {
      band.percentage = Math.round((band.count / scoredTotal) * 1000) / 10;
    });
  }

  // Transform to IndexBand shape (label -> bandLabel)
  const bands: IndexBand[] = bandStats.map(band => ({
    bandId: band.bandId,
    bandLabel: band.label,
    color: band.color,
    count: band.count,
    percentage: band.percentage,
    minScore: band.minScore,
    maxScore: band.maxScore,
  }));

  return {
    bands,
    totalResponses,
  };
}

/**
 * Create empty band distribution response
 * [ANAL-QA-030] Uses createEmptyBandStats from shared/analyticsBands.ts
 */
function createEmptyBandDistribution(): IndexBandDistributionData {
  const bandStats = createEmptyBandStats();
  return {
    bands: bandStats.map(band => ({
      bandId: band.bandId,
      bandLabel: band.label,
      color: band.color,
      count: band.count,
      percentage: band.percentage,
      minScore: band.minScore,
      maxScore: band.maxScore,
    })),
    totalResponses: 0,
  };
}

// ============================================================================
// QUESTION SUMMARY (ANAL-006)
// ============================================================================

/**
 * Question types that produce numeric values
 */
const NUMERIC_QUESTION_TYPES = [
  'rating', 'nps', 'likert', 'opinion_scale', 'slider', 'number', 'emoji_rating'
];

/**
 * Question types that have option distributions
 */
const DISTRIBUTION_QUESTION_TYPES = [
  'multiple_choice', 'checkbox', 'dropdown', 'image_choice', 'yes_no',
  'rating', 'nps', 'likert', 'opinion_scale', 'emoji_rating'
];

/**
 * Question types to skip (structural, not answerable)
 */
const SKIP_QUESTION_TYPES = ['section', 'statement', 'legal', 'hidden'];

/**
 * Compute question-level summary statistics for a survey.
 * 
 * @param surveyId - The survey ID to compute summary for
 * @param versionId - Optional score config version ID to filter responses by
 * @returns QuestionSummaryData with per-question statistics
 */
export async function computeQuestionSummary(
  surveyId: string,
  versionId?: string
): Promise<QuestionSummaryData> {
  // Step 1: Fetch survey with questions
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId))
    .limit(1);

  if (!survey || !survey.questions || survey.questions.length === 0) {
    return { questions: [], totalResponses: 0 };
  }

  // Step 2: Fetch all responses for this survey
  const baseCondition = versionId
    ? and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionId)
      )
    : eq(surveyResponses.surveyId, surveyId);

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(baseCondition);

  const totalResponses = responses.length;

  if (totalResponses === 0) {
    // Return empty summary with question metadata
    return {
      questions: survey.questions
        .filter((q: Question) => !SKIP_QUESTION_TYPES.includes(q.type))
        .map((q: Question, index: number) => createEmptyQuestionSummary(q, index + 1)),
      totalResponses: 0,
    };
  }

  // Step 3: Compute per-question statistics
  const questionSummaries: QuestionSummaryItem[] = [];
  let questionNumber = 0;

  for (const question of survey.questions as Question[]) {
    // Skip structural questions
    if (SKIP_QUESTION_TYPES.includes(question.type)) {
      continue;
    }

    questionNumber++;
    const summary = computeSingleQuestionSummary(
      question,
      questionNumber,
      responses,
      totalResponses
    );
    questionSummaries.push(summary);
  }

  return {
    questions: questionSummaries,
    totalResponses,
  };
}

/**
 * Compute summary for a single question across all responses
 */
function computeSingleQuestionSummary(
  question: Question,
  questionNumber: number,
  responses: Array<{ answers: Record<string, unknown> }>,
  totalResponses: number
): QuestionSummaryItem {
  const questionId = question.id;
  const answers: unknown[] = [];

  // Collect all answers for this question
  for (const response of responses) {
    const answer = response.answers?.[questionId];
    if (answer !== undefined && answer !== null && answer !== '') {
      answers.push(answer);
    }
  }

  const totalAnswers = answers.length;
  const completionRate = totalResponses > 0
    ? Math.round((totalAnswers / totalResponses) * 1000) / 10
    : 0;

  // Calculate numeric statistics if applicable
  let avgValue: number | null = null;
  let minValue: number | null = null;
  let maxValue: number | null = null;

  if (NUMERIC_QUESTION_TYPES.includes(question.type) && answers.length > 0) {
    const numericValues = extractNumericValues(answers, question);
    if (numericValues.length > 0) {
      const sum = numericValues.reduce((a, b) => a + b, 0);
      avgValue = Math.round((sum / numericValues.length) * 10) / 10;
      minValue = Math.min(...numericValues);
      maxValue = Math.max(...numericValues);
    }
  }

  // Calculate distribution if applicable
  let distribution: OptionDistribution[] | null = null;

  if (DISTRIBUTION_QUESTION_TYPES.includes(question.type) && answers.length > 0) {
    distribution = computeDistribution(answers, question, totalAnswers);
  }

  return {
    questionId,
    questionNumber,
    questionText: question.question || `Question ${questionNumber}`,
    questionType: question.type,
    completionRate,
    totalAnswers,
    avgValue,
    minValue,
    maxValue,
    distribution,
  };
}

/**
 * Extract numeric values from answers based on question type
 */
function extractNumericValues(answers: unknown[], question: Question): number[] {
  const values: number[] = [];

  for (const answer of answers) {
    let numericValue: number | null = null;

    // Handle different question types
    if (question.type === 'rating' || question.type === 'nps' || question.type === 'emoji_rating') {
      // Direct numeric answer
      numericValue = parseFloat(String(answer));
    } else if (question.type === 'likert' || question.type === 'opinion_scale') {
      // Could be numeric or mapped from options
      const parsed = parseFloat(String(answer));
      if (!isNaN(parsed)) {
        numericValue = parsed;
      } else if (question.optionScores && typeof answer === 'string') {
        // Try to get score from optionScores
        numericValue = question.optionScores[answer] ?? null;
      }
    } else if (question.type === 'slider') {
      numericValue = parseFloat(String(answer));
    } else if (question.type === 'number') {
      numericValue = parseFloat(String(answer));
    }

    if (numericValue !== null && !isNaN(numericValue)) {
      values.push(numericValue);
    }
  }

  return values;
}

/**
 * Compute option distribution for a question
 */
function computeDistribution(
  answers: unknown[],
  question: Question,
  totalAnswers: number
): OptionDistribution[] {
  const countMap = new Map<string, number>();

  // Get all possible options
  const options = getQuestionOptions(question);

  // Initialize counts
  for (const option of options) {
    countMap.set(option.value, 0);
  }

  // Count answers
  for (const answer of answers) {
    if (Array.isArray(answer)) {
      // Checkbox - multiple selections
      for (const item of answer) {
        const key = String(item);
        countMap.set(key, (countMap.get(key) || 0) + 1);
      }
    } else {
      const key = String(answer);
      countMap.set(key, (countMap.get(key) || 0) + 1);
    }
  }

  // Build distribution array
  const distribution: OptionDistribution[] = [];

  for (const option of options) {
    const count = countMap.get(option.value) || 0;
    distribution.push({
      value: option.value,
      label: option.label,
      count,
      percentage: totalAnswers > 0
        ? Math.round((count / totalAnswers) * 1000) / 10
        : 0,
    });
  }

  return distribution;
}

/**
 * Get options for a question based on type
 */
function getQuestionOptions(question: Question): Array<{ value: string; label: string }> {
  // For questions with explicit options
  if (question.options && question.options.length > 0) {
    return question.options.map((opt) => ({
      value: opt,
      label: opt,
    }));
  }

  // For rating questions
  if (question.type === 'rating') {
    const scale = question.ratingScale || 5;
    return Array.from({ length: scale }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1),
    }));
  }

  // For NPS (0-10)
  if (question.type === 'nps') {
    return Array.from({ length: 11 }, (_, i) => ({
      value: String(i),
      label: String(i),
    }));
  }

  // For yes/no
  if (question.type === 'yes_no') {
    return [
      { value: question.yesLabel || 'Yes', label: question.yesLabel || 'Yes' },
      { value: question.noLabel || 'No', label: question.noLabel || 'No' },
    ];
  }

  // For likert (typically 5 or 7 point scale)
  if (question.type === 'likert') {
    const points = question.likertPoints || 5;
    const labels = question.customLabels || getDefaultLikertLabels(points);
    return labels.map((label, i) => ({
      value: String(i + 1),
      label,
    }));
  }

  // For opinion_scale
  if (question.type === 'opinion_scale') {
    const min = question.min || 1;
    const max = question.max || 10;
    return Array.from({ length: max - min + 1 }, (_, i) => ({
      value: String(min + i),
      label: String(min + i),
    }));
  }

  // For emoji_rating
  if (question.type === 'emoji_rating') {
    return Array.from({ length: 5 }, (_, i) => ({
      value: String(i + 1),
      label: String(i + 1),
    }));
  }

  return [];
}

/**
 * Get default likert labels
 */
function getDefaultLikertLabels(points: number): string[] {
  if (points === 5) {
    return ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'];
  }
  if (points === 7) {
    return ['Strongly Disagree', 'Disagree', 'Somewhat Disagree', 'Neutral', 'Somewhat Agree', 'Agree', 'Strongly Agree'];
  }
  return Array.from({ length: points }, (_, i) => String(i + 1));
}

/**
 * Create empty question summary (when no responses)
 */
function createEmptyQuestionSummary(question: Question, questionNumber: number): QuestionSummaryItem {
  return {
    questionId: question.id,
    questionNumber,
    questionText: question.question || `Question ${questionNumber}`,
    questionType: question.type,
    completionRate: 0,
    totalAnswers: 0,
    avgValue: null,
    minValue: null,
    maxValue: null,
    distribution: DISTRIBUTION_QUESTION_TYPES.includes(question.type)
      ? getQuestionOptions(question).map(opt => ({
          ...opt,
          count: 0,
          percentage: 0,
        }))
      : null,
  };
}

// ============================================================================
// MANAGER INDEX SUMMARY (ANAL-007)
// ============================================================================

import type { 
  ManagerIndexSummaryData, 
  ManagerSummaryItem, 
  ManagerBandDistribution 
} from "@shared/analytics";

/**
 * Compute index summary data grouped by manager.
 * 
 * For each manager, calculates:
 * - respondentCount: number of responses with this managerId
 * - completionRate: percentage of completed responses
 * - avgIndexScore: average overall index score (0-100)
 * - bandDistribution: count and percentage per band
 * 
 * @param surveyId - The survey ID to compute summary for
 * @param versionId - Optional score config version ID to filter by
 * @returns ManagerIndexSummaryData with per-manager statistics
 */
export async function computeIndexSummaryByManager(
  surveyId: string,
  versionId?: string
): Promise<ManagerIndexSummaryData> {
  // Step 1: Fetch survey with questions and scoreConfig
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId))
    .limit(1);

  if (!survey || !survey.scoreConfig?.enabled) {
    return { managers: [], totalManagers: 0, totalResponses: 0 };
  }

  // Step 2: Fetch all responses for this survey
  const baseCondition = versionId
    ? and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionId)
      )
    : eq(surveyResponses.surveyId, surveyId);

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(baseCondition);

  const totalResponses = responses.length;

  if (totalResponses === 0) {
    return { managers: [], totalManagers: 0, totalResponses: 0 };
  }

  // Step 3: Group responses by managerId
  const managerGroups = new Map<string, typeof responses>();

  for (const response of responses) {
    // Get managerId from metadata
    const metadata = response.metadata as Record<string, unknown> | null;
    const managerId = metadata?.managerId as string | undefined;
    
    // Skip responses without manager assignment
    if (!managerId) {
      continue;
    }

    if (!managerGroups.has(managerId)) {
      managerGroups.set(managerId, []);
    }
    managerGroups.get(managerId)!.push(response);
  }

  // Step 4: Calculate per-manager statistics
  const managerSummaries: ManagerSummaryItem[] = [];

  for (const [managerId, managerResponses] of Array.from(managerGroups.entries())) {
    const respondentCount = managerResponses.length;

    // Calculate completion rate
    const completedResponses = managerResponses.filter(
      (r: typeof managerResponses[0]) => (r.completionPercentage || 0) >= COMPLETION_THRESHOLD
    );
    const completionRate = respondentCount > 0
      ? Math.round((completedResponses.length / respondentCount) * 1000) / 10
      : 0;

    // Calculate scores for each response
    const scores: number[] = [];

    for (const response of managerResponses) {
      const scoreResults = calculateSurveyScores(
        survey.questions,
        response.answers,
        survey.scoreConfig
      );

      if (!scoreResults || scoreResults.length === 0) continue;

      // Calculate overall index score (simple average of category scores)
      const totalScore = scoreResults.reduce((sum, r) => sum + r.score, 0);
      const avgScore = totalScore / scoreResults.length;
      const clampedScore = Math.min(100, Math.max(0, Math.round(avgScore)));
      scores.push(clampedScore);
    }

    // Calculate average index score
    const avgIndexScore = scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : 0;

    // Calculate band distribution
    const bandDistribution = calculateBandDistribution(scores);

    // Get manager name from metadata if available (from first response)
    const firstMetadata = managerResponses[0]?.metadata as Record<string, unknown> | null;
    const managerName = firstMetadata?.managerName as string | undefined;

    managerSummaries.push({
      managerId,
      managerName,
      respondentCount,
      completionRate,
      avgIndexScore,
      bandDistribution,
    });
  }

  // Sort by respondent count (descending) then by manager ID
  managerSummaries.sort((a, b) => {
    if (b.respondentCount !== a.respondentCount) {
      return b.respondentCount - a.respondentCount;
    }
    return a.managerId.localeCompare(b.managerId);
  });

  return {
    managers: managerSummaries,
    totalManagers: managerSummaries.length,
    totalResponses,
  };
}

/**
 * Calculate band distribution from an array of scores
 * [ANAL-QA-030] Uses resolveBandIndex from shared/analyticsBands.ts
 */
function calculateBandDistribution(scores: number[]): ManagerBandDistribution[] {
  // Initialize band counts using shared definitions
  const bandCounts = INDEX_BAND_DEFINITIONS.map(band => ({
    bandId: band.bandId,
    bandLabel: band.label,
    color: band.color,
    count: 0,
    percentage: 0,
  }));

  // Count scores per band using shared helper
  for (const score of scores) {
    const bandIndex = resolveBandIndex(score);
    if (bandIndex >= 0) {
      bandCounts[bandIndex].count++;
    }
  }

  // Calculate percentages
  const total = scores.length;
  if (total > 0) {
    bandCounts.forEach(band => {
      band.percentage = Math.round((band.count / total) * 1000) / 10;
    });
  }

  return bandCounts;
}

// ============================================================================
// INDEX TREND (ANAL-008)
// ============================================================================

import type { IndexTrendData, IndexTrendDataPoint } from "@shared/analytics";

export type TrendGranularity = 'daily' | 'weekly' | 'monthly';

/**
 * Compute index trend data over time for a survey.
 * 
 * Groups responses by time period (day/week/month) and calculates average
 * index scores for each period.
 * 
 * @param surveyId - The survey ID to compute trends for
 * @param versionId - Optional score config version ID to filter by
 * @param granularity - Time grouping: 'daily', 'weekly', or 'monthly'
 * @returns IndexTrendData with time series of index scores
 */
export async function computeIndexTrend(
  surveyId: string,
  versionId?: string,
  granularity: TrendGranularity = 'weekly'
): Promise<IndexTrendData> {
  // Step 1: Fetch survey with questions and scoreConfig
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId))
    .limit(1);

  if (!survey || !survey.scoreConfig?.enabled) {
    return { series: [] };
  }

  // Step 2: Fetch all responses for this survey with completedAt timestamp
  const baseCondition = versionId
    ? and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionId)
      )
    : eq(surveyResponses.surveyId, surveyId);

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(baseCondition);

  if (responses.length === 0) {
    return { series: [] };
  }

  // Step 3: Group responses by time bucket
  const timeBuckets = new Map<string, typeof responses>();

  for (const response of responses) {
    // Use completedAt, fall back to startedAt if not available
    const timestamp = response.completedAt || response.startedAt;
    if (!timestamp) continue;

    const date = new Date(timestamp);
    const bucketKey = getTimeBucketKey(date, granularity);

    if (!timeBuckets.has(bucketKey)) {
      timeBuckets.set(bucketKey, []);
    }
    timeBuckets.get(bucketKey)!.push(response);
  }

  // Step 4: Calculate index scores for each time bucket
  const series: IndexTrendDataPoint[] = [];

  // Sort buckets by date
  const sortedBuckets = Array.from(timeBuckets.entries()).sort(
    ([a], [b]) => a.localeCompare(b)
  );

  for (const [bucketKey, bucketResponses] of sortedBuckets) {
    // Calculate scores for each response in this bucket
    const bucketScores: number[] = [];

    for (const response of bucketResponses) {
      const scoreResults = calculateSurveyScores(
        survey.questions,
        response.answers,
        survey.scoreConfig
      );

      if (!scoreResults || scoreResults.length === 0) continue;

      // Calculate overall index score (simple average of category scores)
      const totalScore = scoreResults.reduce((sum, r) => sum + r.score, 0);
      const avgScore = totalScore / scoreResults.length;
      const clampedScore = Math.min(100, Math.max(0, Math.round(avgScore)));
      bucketScores.push(clampedScore);
    }

    // Calculate average score for this bucket
    const avgBucketScore = bucketScores.length > 0
      ? Math.round((bucketScores.reduce((a, b) => a + b, 0) / bucketScores.length) * 10) / 10
      : 0;

    // For now, we compute a single "engagement" index as the overall score
    // Future versions can compute per-dimension scores using category metadata
    const dataPoint: IndexTrendDataPoint = {
      date: bucketKey,
      engagementIndex: avgBucketScore,
      // For compatibility, set all indices to the same value for now
      leadershipIndex: avgBucketScore,
      wellbeingIndex: avgBucketScore,
      burnoutRiskIndex: avgBucketScore,
      psychologicalSafetyIndex: avgBucketScore,
    };

    series.push(dataPoint);
  }

  return { series };
}

/**
 * Get the time bucket key for a date based on granularity.
 * Returns ISO date string for the start of the bucket.
 */
function getTimeBucketKey(date: Date, granularity: TrendGranularity): string {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  switch (granularity) {
    case 'daily':
      // Return YYYY-MM-DD
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    case 'weekly':
      // Return YYYY-MM-DD for the start of the week (Monday)
      const weekStart = new Date(date);
      const dayOfWeek = weekStart.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
      weekStart.setDate(weekStart.getDate() - diff);
      return `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;

    case 'monthly':
      // Return YYYY-MM-01
      return `${year}-${String(month + 1).padStart(2, '0')}-01`;

    default:
      return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}

// ============================================================================
// INDEX TRENDS SUMMARY (ANAL-008)
// ============================================================================

import type { IndexTrendsSummaryData, IndexTrendPoint } from "@shared/analytics";

/**
 * Compute index trends summary across all scoring versions.
 * 
 * For each version, calculates average index scores for all five Insight Dimensions.
 * Returns trend data sorted by version number/date for visualization.
 * 
 * @param surveyId - The survey ID to compute trends for
 * @returns IndexTrendsSummaryData with trends array
 */
export async function computeIndexTrendsSummary(
  surveyId: string
): Promise<IndexTrendsSummaryData> {
  // Step 1: Fetch survey with questions and scoreConfig
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId))
    .limit(1);

  if (!survey || !survey.scoreConfig?.enabled) {
    return { trends: [], totalVersions: 0, hasMultipleVersions: false };
  }

  // Step 2: Fetch all score_config_versions for this survey
  // Note: score_config_versions table may not exist in all deployments
  type VersionRow = { id: string; version_number: number; created_at: string };
  let versions: VersionRow[] = [];
  try {
    const rawVersions = await db
      .select()
      .from(sql`score_config_versions`)
      .where(sql`survey_id = ${surveyId}`)
      .orderBy(sql`version_number ASC`);
    versions = rawVersions as VersionRow[];
  } catch {
    // Table doesn't exist - continue with empty versions
    versions = [];
  }

  if (versions.length === 0) {
    // No versions - compute a single trend point for "all responses"
    const allResponsesTrend = await computeTrendPointForVersion(
      surveyId,
      survey,
      undefined,
      {
        id: 'all',
        versionLabel: 'All Responses',
        versionNumber: 1,
        createdAt: new Date().toISOString(),
      }
    );

    return {
      trends: allResponsesTrend ? [allResponsesTrend] : [],
      totalVersions: allResponsesTrend ? 1 : 0,
      hasMultipleVersions: false,
    };
  }

  // Step 3: For each version, compute average index scores
  const trends: IndexTrendPoint[] = [];

  for (const version of versions) {
    const trendPoint = await computeTrendPointForVersion(
      surveyId,
      survey,
      version.id,
      {
        id: version.id,
        versionLabel: `v${version.version_number}`,
        versionNumber: version.version_number as number,
        createdAt: version.created_at as string,
      }
    );

    if (trendPoint && trendPoint.responseCount > 0) {
      trends.push(trendPoint);
    }
  }

  return {
    trends,
    totalVersions: trends.length,
    hasMultipleVersions: trends.length > 1,
  };
}

/**
 * Compute a single trend point for a specific version
 */
async function computeTrendPointForVersion(
  surveyId: string,
  survey: any,
  versionId: string | undefined,
  versionInfo: {
    id: string;
    versionLabel: string;
    versionNumber: number;
    createdAt: string;
  }
): Promise<IndexTrendPoint | null> {
  // Fetch responses for this version
  const baseCondition = versionId
    ? and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionId)
      )
    : eq(surveyResponses.surveyId, surveyId);

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(baseCondition);

  if (responses.length === 0) {
    return null;
  }

  // Calculate scores for each response
  const allScores: number[] = [];

  for (const response of responses) {
    const scoreResults = calculateSurveyScores(
      survey.questions,
      response.answers,
      survey.scoreConfig
    );

    if (!scoreResults || scoreResults.length === 0) continue;

    // Calculate overall index score (simple average of category scores)
    const totalScore = scoreResults.reduce((sum, r) => sum + r.score, 0);
    const avgScore = totalScore / scoreResults.length;
    const clampedScore = Math.min(100, Math.max(0, Math.round(avgScore)));
    allScores.push(clampedScore);
  }

  // For now, all indices use the same overall score
  // Future: differentiate by index type based on category mapping
  const avgOverallScore = allScores.length > 0
    ? Math.round((allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10) / 10
    : null;

  return {
    versionId: versionInfo.id,
    versionLabel: versionInfo.versionLabel,
    versionNumber: versionInfo.versionNumber,
    versionDate: versionInfo.createdAt,
    scores: {
      leadershipEffectiveness: avgOverallScore,
      teamWellbeing: avgOverallScore,
      burnoutRisk: avgOverallScore,
      psychologicalSafety: avgOverallScore,
      engagement: avgOverallScore,
    },
    responseCount: responses.length,
  };
}

// ============================================================================
// BEFORE/AFTER INDEX COMPARISON (ANAL-009)
// ============================================================================

import type { 
  BeforeAfterIndexComparisonData,
  ComparisonVersionInfo,
  DimensionComparison,
  ComparisonSummary,
} from "@shared/analytics";
import { INSIGHT_DIMENSIONS } from "@shared/analytics";

/**
 * Compute before/after index comparison between two scoring versions.
 * 
 * Compares average Insight Dimension scores between two versions,
 * calculating change values and trends.
 * 
 * @param surveyId - The survey ID to compare
 * @param versionBeforeId - The "before" version ID
 * @param versionAfterId - The "after" version ID
 * @returns BeforeAfterIndexComparisonData with version info, comparisons, and summary
 */
export async function computeBeforeAfterIndexComparison(
  surveyId: string,
  versionBeforeId: string,
  versionAfterId: string
): Promise<BeforeAfterIndexComparisonData> {
  // Step 1: Fetch survey with questions and scoreConfig
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId))
    .limit(1);

  if (!survey || !survey.scoreConfig?.enabled) {
    return createEmptyComparison(versionBeforeId, versionAfterId);
  }

  // Step 2: Fetch version metadata for both versions
  type VersionRow = { id: string; version_number: number; created_at: string };
  let versionBefore: VersionRow | undefined;
  let versionAfter: VersionRow | undefined;

  try {
    const versionBeforeResult = await db
      .select()
      .from(sql`score_config_versions`)
      .where(sql`id = ${versionBeforeId}`)
      .limit(1);
    versionBefore = versionBeforeResult[0] as VersionRow | undefined;

    const versionAfterResult = await db
      .select()
      .from(sql`score_config_versions`)
      .where(sql`id = ${versionAfterId}`)
      .limit(1);
    versionAfter = versionAfterResult[0] as VersionRow | undefined;
  } catch {
    // Table may not exist yet
  }

  // Build version info objects
  const versionBeforeInfo: ComparisonVersionInfo = {
    id: versionBeforeId,
    label: versionBefore ? `v${versionBefore.version_number}` : 'Version Before',
    versionNumber: versionBefore?.version_number || 0,
    date: versionBefore?.created_at || new Date().toISOString(),
    responseCount: 0, // Will be updated below
  };

  const versionAfterInfo: ComparisonVersionInfo = {
    id: versionAfterId,
    label: versionAfter ? `v${versionAfter.version_number}` : 'Version After',
    versionNumber: versionAfter?.version_number || 0,
    date: versionAfter?.created_at || new Date().toISOString(),
    responseCount: 0, // Will be updated below
  };

  // Step 3: Fetch responses for both versions
  const responsesBefore = await db
    .select()
    .from(surveyResponses)
    .where(
      and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionBeforeId)
      )
    );

  const responsesAfter = await db
    .select()
    .from(surveyResponses)
    .where(
      and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionAfterId)
      )
    );

  versionBeforeInfo.responseCount = responsesBefore.length;
  versionAfterInfo.responseCount = responsesAfter.length;

  // Step 4: Calculate average scores for each version
  const scoresBefore = calculateVersionScores(survey, responsesBefore);
  const scoresAfter = calculateVersionScores(survey, responsesAfter);

  // Step 5: Build dimension comparisons
  const dimensionKeys: Array<keyof typeof INSIGHT_DIMENSIONS> = [
    'leadershipEffectiveness',
    'teamWellbeing',
    'burnoutRisk',
    'psychologicalSafety',
    'engagementEnergy',
  ];

  const comparison: DimensionComparison[] = [];
  let improved = 0;
  let declined = 0;
  let stable = 0;

  for (const key of dimensionKeys) {
    const dimension = INSIGHT_DIMENSIONS[key];
    const scoreBefore = scoresBefore[key];
    const scoreAfter = scoresAfter[key];

    let change: number | null = null;
    let changePercent: number | null = null;
    let trend: 'up' | 'down' | 'neutral' = 'neutral';

    if (scoreBefore !== null && scoreAfter !== null) {
      change = Math.round((scoreAfter - scoreBefore) * 10) / 10;
      changePercent = scoreBefore !== 0
        ? Math.round(((scoreAfter - scoreBefore) / scoreBefore) * 1000) / 10
        : null;

      // Determine trend (threshold of 1 point for significance)
      if (change > 1) {
        trend = 'up';
        improved++;
      } else if (change < -1) {
        trend = 'down';
        declined++;
      } else {
        stable++;
      }
    } else {
      stable++;
    }

    comparison.push({
      dimensionId: dimension.id,
      dimensionLabel: dimension.shortLabel,
      scoreBefore,
      scoreAfter,
      change,
      changePercent,
      trend,
    });
  }

  // Step 6: Determine overall trend
  let overallTrend: ComparisonSummary['overallTrend'] = 'stable';
  
  if (improved > declined && improved > stable) {
    overallTrend = 'positive';
  } else if (declined > improved && declined > stable) {
    overallTrend = 'negative';
  } else if (improved > 0 && declined > 0) {
    overallTrend = 'mixed';
  }

  const summary: ComparisonSummary = {
    totalDimensionsImproved: improved,
    totalDimensionsDeclined: declined,
    totalDimensionsStable: stable,
    overallTrend,
  };

  return {
    versionBefore: versionBeforeInfo,
    versionAfter: versionAfterInfo,
    comparison,
    summary,
  };
}

/**
 * Calculate average scores for all dimensions from a set of responses
 */
function calculateVersionScores(
  survey: any,
  responses: Array<{ answers: Record<string, unknown> }>
): Record<keyof typeof INSIGHT_DIMENSIONS, number | null> {
  const scores: Record<keyof typeof INSIGHT_DIMENSIONS, number | null> = {
    leadershipEffectiveness: null,
    teamWellbeing: null,
    burnoutRisk: null,
    psychologicalSafety: null,
    engagementEnergy: null,
  };

  if (responses.length === 0) {
    return scores;
  }

  // Calculate scores for each response
  const allScores: number[] = [];

  for (const response of responses) {
    // Cast answers to expected type - survey responses store answers as unknown but
    // they are actually string | string[] values
    const answersTyped = response.answers as Record<string, string | string[]>;
    const scoreResults = calculateSurveyScores(
      survey.questions,
      answersTyped,
      survey.scoreConfig
    );

    if (!scoreResults || scoreResults.length === 0) continue;

    // Calculate overall index score (simple average of category scores)
    const totalScore = scoreResults.reduce((sum, r) => sum + r.score, 0);
    const avgScore = totalScore / scoreResults.length;
    const clampedScore = Math.min(100, Math.max(0, Math.round(avgScore)));
    allScores.push(clampedScore);
  }

  // For now, all dimensions use the same overall score
  // Future: differentiate by dimension based on category mapping
  if (allScores.length > 0) {
    const avgOverallScore = Math.round(
      (allScores.reduce((a, b) => a + b, 0) / allScores.length) * 10
    ) / 10;

    scores.leadershipEffectiveness = avgOverallScore;
    scores.teamWellbeing = avgOverallScore;
    scores.burnoutRisk = avgOverallScore;
    scores.psychologicalSafety = avgOverallScore;
    scores.engagementEnergy = avgOverallScore;
  }

  return scores;
}

/**
 * Create empty comparison response when no data is available
 */
function createEmptyComparison(
  versionBeforeId: string,
  versionAfterId: string
): BeforeAfterIndexComparisonData {
  const dimensionKeys: Array<keyof typeof INSIGHT_DIMENSIONS> = [
    'leadershipEffectiveness',
    'teamWellbeing',
    'burnoutRisk',
    'psychologicalSafety',
    'engagementEnergy',
  ];

  return {
    versionBefore: {
      id: versionBeforeId,
      label: 'Version Before',
      versionNumber: 0,
      date: new Date().toISOString(),
      responseCount: 0,
    },
    versionAfter: {
      id: versionAfterId,
      label: 'Version After',
      versionNumber: 0,
      date: new Date().toISOString(),
      responseCount: 0,
    },
    comparison: dimensionKeys.map(key => ({
      dimensionId: INSIGHT_DIMENSIONS[key].id,
      dimensionLabel: INSIGHT_DIMENSIONS[key].shortLabel,
      scoreBefore: null,
      scoreAfter: null,
      change: null,
      changePercent: null,
      trend: 'neutral' as const,
    })),
    summary: {
      totalDimensionsImproved: 0,
      totalDimensionsDeclined: 0,
      totalDimensionsStable: 5,
      overallTrend: 'stable',
    },
  };
}

// ============================================================================
// DOMAIN OVERVIEW (ANAL-011)
// ============================================================================

import type { DomainOverviewData, DomainCategory } from "@shared/analytics";

/**
 * Compute domain overview - category-level aggregate statistics.
 *
 * For each scoring category, calculates:
 * - averageScore: mean score across all responses (0-100)
 * - minScore, maxScore: range of scores
 * - responseCount: number of responses with valid scores
 * - weight: category weight from scoreConfig
 * - contributionToTotal: percentage contribution to overall score
 *
 * @param surveyId - The survey ID to compute overview for
 * @param indexType - The index type (filters which categories to include)
 * @param versionId - Optional score config version ID to filter by
 * @returns DomainOverviewData with category-level statistics
 */
export async function computeDomainOverview(
  surveyId: string,
  indexType: string,
  versionId?: string
): Promise<DomainOverviewData> {
  // Step 1: Fetch survey with questions and scoreConfig
  const [survey] = await db
    .select()
    .from(surveys)
    .where(eq(surveys.id, surveyId))
    .limit(1);

  if (!survey || !survey.scoreConfig?.enabled) {
    return { categories: [] };
  }

  // Step 2: Get category definitions from scoreConfig
  const categoryDefs = survey.scoreConfig.categories || [];
  if (categoryDefs.length === 0) {
    return { categories: [] };
  }

  // Step 3: Fetch all responses for this survey
  const baseCondition = versionId
    ? and(
        eq(surveyResponses.surveyId, surveyId),
        eq(surveyResponses.scoreConfigVersionId, versionId)
      )
    : eq(surveyResponses.surveyId, surveyId);

  const responses = await db
    .select()
    .from(surveyResponses)
    .where(baseCondition);

  if (responses.length === 0) {
    // Return empty categories with metadata
    return {
      categories: categoryDefs.map((cat: any) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        averageScore: 0,
        minScore: 0,
        maxScore: 0,
        responseCount: 0,
        weight: cat.weight || 1,
        contributionToTotal: 0,
      })),
    };
  }

  // Step 4: Calculate per-category statistics
  const categoryStats = new Map<string, { scores: number[]; weight: number; name: string }>();

  // Initialize category stats
  for (const cat of categoryDefs) {
    const catAny = cat as { id: string; name: string; weight?: number };
    categoryStats.set(catAny.id, {
      scores: [],
      weight: catAny.weight || 1,
      name: catAny.name,
    });
  }

  // Calculate scores for each response
  for (const response of responses) {
    const scoreResults = calculateSurveyScores(
      survey.questions,
      response.answers,
      survey.scoreConfig
    );

    if (!scoreResults || scoreResults.length === 0) continue;

    // Group scores by category
    for (const result of scoreResults) {
      const categoryId = result.categoryId;
      const stats = categoryStats.get(categoryId);
      if (stats) {
        stats.scores.push(result.score);
      }
    }
  }

  // Step 5: Build category results
  const categories: DomainCategory[] = [];
  let totalWeightedScore = 0;
  let totalWeight = 0;

  for (const [categoryId, stats] of Array.from(categoryStats.entries())) {
    const { scores, weight, name } = stats;

    if (scores.length === 0) {
      categories.push({
        categoryId,
        categoryName: name,
        averageScore: 0,
        minScore: 0,
        maxScore: 0,
        responseCount: 0,
        weight,
        contributionToTotal: 0,
      });
      continue;
    }

    const avgScore = Math.round((scores.reduce((a: number, b: number) => a + b, 0) / scores.length) * 10) / 10;
    const sortedScores = [...scores].sort((a: number, b: number) => a - b);

    totalWeightedScore += avgScore * weight;
    totalWeight += weight;

    categories.push({
      categoryId,
      categoryName: name,
      averageScore: avgScore,
      minScore: sortedScores[0],
      maxScore: sortedScores[sortedScores.length - 1],
      responseCount: scores.length,
      weight,
      contributionToTotal: 0, // Will calculate after loop
    });
  }

  // Step 6: Calculate contribution percentages
  if (totalWeight > 0) {
    for (const cat of categories) {
      if (cat.responseCount > 0) {
        cat.contributionToTotal = Math.round(
          ((cat.averageScore * cat.weight) / totalWeightedScore) * 1000
        ) / 10;
      }
    }
  }

  // Sort by weight (descending) then by average score
  categories.sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return b.averageScore - a.averageScore;
  });

  return { categories };
}

