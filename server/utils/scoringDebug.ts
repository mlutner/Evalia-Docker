import type { Question, Survey } from "@shared/schema";
import { resolveIndexBand } from "@shared/analyticsBands";

// ============================================================================
// TYPES
// ============================================================================

export interface ScoringTraceRequest {
    surveyId: string;
    responseId?: string;
    // Alternative: pass survey and answers directly (useful from builder)
    survey?: Survey;
    answers?: Record<string, string | string[]>;
}

export interface QuestionContribution {
    questionId: string;
    questionText: string;
    questionType: string;
    category: string;
    categoryName: string;
    rawAnswer: string | string[];
    optionScoreUsed: number | null;
    maxPoints: number;
    weight: number;
    contributionToCategory: number;
    normalizedContribution: number; // 0-100 scale
}

export interface CategoryBreakdown {
    categoryId: string;
    categoryName: string;
    rawScore: number;
    maxPossibleScore: number;
    normalizedScore: number; // 0-100
    bandId: string;
    bandLabel: string;
    bandColor: string;
    questionCount: number;
}

export interface ScoringTraceResponse {
    meta: {
        surveyId: string;
        surveyTitle: string;
        responseId: string | null;
        scoringEngineId: string | null;
        scoringEnabled: boolean;
        timestamp: string;
    };
    config: {
        enabled: boolean;
        categories: Array<{ id: string; name: string }>;
        scoreRanges: Array<{ id: string; min: number; max: number; label: string }>;
    } | null;
    questions: QuestionContribution[];
    categories: CategoryBreakdown[];
    overall: {
        score: number;
        bandId: string;
        bandLabel: string;
        bandColor: string;
        matchedRule: { id: string; min: number; max: number; label: string } | null;
    } | null;
    errors: string[];
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get max points for a question type (mirrors calculateSurveyScores logic)
 */
export function getMaxPointsForQuestion(q: Question): number {
    switch (q.type) {
        case "rating": return q.ratingScale || 5;
        case "nps": return 10;
        case "likert": return q.likertPoints || 5;
        case "opinion_scale": return q.ratingScale || 5;
        case "slider": return q.max !== undefined ? (q.max - (q.min || 0)) : 10;
        case "multiple_choice": return q.options?.length || 5;
        case "dropdown": return q.options?.length || 5;
        case "checkbox": return q.maxSelections || 5;
        case "image_choice": return q.imageOptions?.length || q.options?.length || 5;
        case "yes_no": return 1;
        case "matrix": return (q.rowLabels?.length || 1) * (q.colLabels?.length || 5);
        case "ranking": return q.options?.length || 5;
        case "constant_sum": return q.totalPoints || 100;
        case "number": return 10;
        default: return 0;
    }
}

/**
 * Calculate the score value for a question answer
 */
export function calculateQuestionScore(
    q: Question,
    answer: string | string[]
): { score: number; optionScoreUsed: number | null } {
    const answerText = Array.isArray(answer) ? answer[0] : answer;

    // Check if optionScores is defined and has the answer
    if (q.optionScores && typeof q.optionScores === 'object') {
        const optionScore = q.optionScores[answerText];
        if (optionScore !== undefined && optionScore !== null) {
            return { score: optionScore, optionScoreUsed: optionScore };
        }
    }

    // Fall back to numeric parsing
    const answerNum = parseInt(answerText, 10);
    if (!isNaN(answerNum)) {
        return { score: answerNum, optionScoreUsed: null };
    }

    // For multiple choice without optionScores, use position
    if (q.type === "multiple_choice" || q.type === "dropdown") {
        const options = q.options || [];
        const idx = options.indexOf(answerText);
        if (idx >= 0) {
            return { score: idx + 1, optionScoreUsed: null };
        }
    }

    return { score: 0, optionScoreUsed: null };
}

/**
 * Build the full scoring trace for a survey + answers
 */
export function buildScoringTrace(
    survey: Survey,
    answers: Record<string, string | string[]>,
    responseId: string | null
): ScoringTraceResponse {
    const errors: string[] = [];
    const scoreConfig = survey.scoreConfig;

    // Base meta
    const response: ScoringTraceResponse = {
        meta: {
            surveyId: survey.id,
            surveyTitle: survey.title || 'Untitled Survey',
            responseId,
            scoringEngineId: (survey as any).scoringEngineId || null,
            scoringEnabled: scoreConfig?.enabled ?? false,
            timestamp: new Date().toISOString(),
        },
        config: null,
        questions: [],
        categories: [],
        overall: null,
        errors,
    };

    // If scoring not enabled, return early
    if (!scoreConfig?.enabled) {
        errors.push("Scoring is not enabled for this survey");
        return response;
    }

    // Set config
    response.config = {
        enabled: scoreConfig.enabled,
        categories: (scoreConfig.categories || []).map(c => ({ id: c.id, name: c.name })),
        scoreRanges: (scoreConfig.scoreRanges || []).map(r => ({
            id: r.id,
            min: r.min,
            max: r.max,
            label: r.label,
        })),
    };

    if (!scoreConfig.categories?.length) {
        errors.push("No scoring categories defined");
    }

    if (!scoreConfig.scoreRanges?.length) {
        errors.push("No score ranges (bands) defined");
    }

    // Build category map
    const categoryMap = new Map<string, { name: string; rawTotal: number; maxTotal: number; count: number }>();
    scoreConfig.categories?.forEach(cat => {
        categoryMap.set(cat.id, { name: cat.name, rawTotal: 0, maxTotal: 0, count: 0 });
    });

    // Process each scorable question
    const questions = survey.questions || [];
    questions.forEach(q => {
        // [ANAL-FIX] Enforce strict scoring semantics (matches shared/schema.ts)
        if (q.scoringCategory && !q.scorable) {
            errors.push(`Question ${q.id} has scoringCategory but scorable=false. Skipping.`);
        }
        if (q.scorable && !q.scoringCategory) {
            errors.push(`Question ${q.id} is scorable but missing scoringCategory. Skipping.`);
        }

        if (!q.scorable || !q.scoringCategory) return;

        const categoryData = categoryMap.get(q.scoringCategory);
        if (!categoryData) {
            errors.push(`Question ${q.id} has unknown category: ${q.scoringCategory}`);
            return;
        }

        const answer = answers[q.id];
        if (answer === undefined || answer === null) {
            // Question not answered
            return;
        }

        const maxPoints = getMaxPointsForQuestion(q);
        const weight = q.scoreWeight ?? 1;
        const { score, optionScoreUsed } = calculateQuestionScore(q, answer);
        const contribution = score * weight;
        const maxContribution = maxPoints * weight;

        // Update category totals
        categoryData.rawTotal += contribution;
        categoryData.maxTotal += maxContribution;
        categoryData.count++;

        // Add to questions list
        response.questions.push({
            questionId: q.id,
            questionText: q.question || 'Untitled Question',
            questionType: q.type,
            category: q.scoringCategory,
            categoryName: categoryData.name,
            rawAnswer: answer,
            optionScoreUsed,
            maxPoints,
            weight,
            contributionToCategory: contribution,
            normalizedContribution: maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0,
        });
    });

    // Calculate category scores
    let totalNormalized = 0;
    let categoryCount = 0;

    categoryMap.forEach((data, categoryId) => {
        // [SCORE-002] Use rule.max to match scoreBandSchema definition
        // Fallback to global bands if no category-specific bands exist
        const categoryRules = scoreConfig.scoreRanges?.filter(rule => rule.category === categoryId);
        const globalRules = scoreConfig.scoreRanges?.filter(rule => !rule.category);
        const effectiveRules = (categoryRules && categoryRules.length > 0) ? categoryRules : globalRules;

        const maxConfiguredScore = effectiveRules
            ?.reduce((max, rule) => Math.max(max, rule.max), 100) || 100;

        const normalizedScore = data.maxTotal > 0
            ? Math.round((data.rawTotal / data.maxTotal) * maxConfiguredScore)
            : 0;

        const band = resolveIndexBand(normalizedScore);

        response.categories.push({
            categoryId,
            categoryName: data.name,
            rawScore: data.rawTotal,
            maxPossibleScore: data.maxTotal,
            normalizedScore,
            bandId: band.bandId,
            bandLabel: band.label,
            bandColor: band.color,
            questionCount: data.count,
        });

        if (data.count > 0) {
            totalNormalized += normalizedScore;
            categoryCount++;
        }
    });

    // Calculate overall score
    if (categoryCount > 0) {
        const overallScore = Math.round(totalNormalized / categoryCount);
        const overallBand = resolveIndexBand(overallScore);

        // Find the matched rule from scoreRanges
        const matchedRule = scoreConfig.scoreRanges?.find(
            r => overallScore >= r.min && overallScore <= r.max
        );

        response.overall = {
            score: overallScore,
            bandId: overallBand.bandId,
            bandLabel: overallBand.label,
            bandColor: overallBand.color,
            matchedRule: matchedRule ? {
                id: matchedRule.id,
                min: matchedRule.min,
                max: matchedRule.max,
                label: matchedRule.label,
            } : null,
        };
    }

    return response;
}
