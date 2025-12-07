
import { db } from "../server/db";
import { surveys, surveyResponses, users, type Question } from "../shared/schema";
import { eq } from "drizzle-orm";

// ============================================================================
// TEST SURVEY CONFIGURATION (Copied from analyticsFixtures.ts)
// ============================================================================

const GOLDEN_SURVEY_ID = 'golden-test-survey-001';

const GOLDEN_QUESTIONS: Question[] = [
    // =====================================================
    // ENGAGEMENT (q1, q2)
    // =====================================================
    {
        id: 'q1',
        type: 'likert',
        question: 'I feel motivated to do my best work.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'engagement',
        scoreWeight: 1,
        optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 },
    },
    {
        id: 'q2',
        type: 'likert',
        question: 'I am proud to work for this organization.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'engagement',
        scoreWeight: 1,
        optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 },
    },
    // =====================================================
    // LEADERSHIP EFFECTIVENESS (q3, q4)
    // =====================================================
    {
        id: 'q3',
        type: 'likert',
        question: 'My manager provides clear expectations.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'leadership-effectiveness',
        scoreWeight: 1,
        optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 },
    },
    {
        id: 'q4',
        type: 'likert',
        question: 'I trust my manager to support me.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'leadership-effectiveness',
        scoreWeight: 1,
        optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 },
    },
    // =====================================================
    // PSYCHOLOGICAL SAFETY (q5, q6)
    // =====================================================
    {
        id: 'q5',
        type: 'likert',
        question: 'I can speak up without fear of negative consequences.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'psychological-safety',
        scoreWeight: 1,
        optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 },
    },
    {
        id: 'q6',
        type: 'likert',
        question: 'It is safe to take risks on this team.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'psychological-safety',
        scoreWeight: 1,
        optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 },
    },
    // =====================================================
    // TEAM WELLBEING (q7, q8)
    // =====================================================
    {
        id: 'q7',
        type: 'likert',
        question: 'I have enough energy for my work.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'team-wellbeing',
        scoreWeight: 1,
        optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 },
    },
    {
        id: 'q8',
        type: 'likert',
        question: 'My workload is manageable.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'team-wellbeing',
        scoreWeight: 1,
        optionScores: { 'Strongly Disagree': 1, 'Disagree': 2, 'Neutral': 3, 'Agree': 4, 'Strongly Agree': 5 },
    },
    // =====================================================
    // BURNOUT RISK (q9, q10) - REVERSE SCORED via optionScores
    // =====================================================
    {
        id: 'q9',
        type: 'likert',
        question: 'I feel emotionally drained after work.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'burnout-risk',
        scoreWeight: 1,
        // Reverse scoring: high agreement = low score (burnout indicator)
        optionScores: { 'Strongly Agree': 1, 'Agree': 2, 'Neutral': 3, 'Disagree': 4, 'Strongly Disagree': 5 },
    },
    {
        id: 'q10',
        type: 'likert',
        question: 'I feel burnt out from my job.',
        required: true,
        likertPoints: 5,
        likertType: 'agreement',
        scorable: true,
        scoringCategory: 'burnout-risk',
        scoreWeight: 1,
        // Reverse scoring: high agreement = low score (burnout indicator)
        optionScores: { 'Strongly Agree': 1, 'Agree': 2, 'Neutral': 3, 'Disagree': 4, 'Strongly Disagree': 5 },
    },
    // =====================================================
    // NON-SCORED (q11, q12)
    // =====================================================
    {
        id: 'q11',
        type: 'checkbox',
        question: 'What factors impact your wellbeing? (Select all)',
        required: false,
        options: ['Workload', 'Manager support', 'Team dynamics', 'Remote work'],
        scorable: false,
    },
    {
        id: 'q12',
        type: 'textarea',
        question: 'Any additional comments?',
        required: false,
        scorable: false,
    },
];

const GOLDEN_SCORE_CONFIG = {
    enabled: true,
    categories: [
        { id: 'engagement', name: 'Engagement Energy' },
        { id: 'leadership-effectiveness', name: 'Leadership Effectiveness' },
        { id: 'psychological-safety', name: 'Psychological Safety' },
        { id: 'team-wellbeing', name: 'Team Wellbeing' },
        { id: 'burnout-risk', name: 'Burnout Risk' },
    ],
    scoreRanges: [
        // Global bands (used for overall and all dimensions)
        { id: 'critical', min: 0, max: 39, label: 'Critical', interpretation: 'Critical - immediate attention needed' },
        { id: 'needs-improvement', min: 40, max: 54, label: 'Needs Improvement', interpretation: 'Needs improvement - meaningful risk areas' },
        { id: 'developing', min: 55, max: 69, label: 'Developing', interpretation: 'Developing - foundations present' },
        { id: 'effective', min: 70, max: 84, label: 'Effective', interpretation: 'Effective - healthy range' },
        { id: 'highly-effective', min: 85, max: 100, label: 'Highly Effective', interpretation: 'Highly effective - consistently strong' },
    ],
};

const GOLDEN_SURVEY = {
    id: GOLDEN_SURVEY_ID,
    title: 'Golden Analytics Test Survey',
    description: 'Test survey for analytics unit tests',
    status: 'Active' as const,
    questions: GOLDEN_QUESTIONS,
    scoreConfig: GOLDEN_SCORE_CONFIG,
    scoringEngineId: 'engagement_v1',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
};

// Manager 1 responses (higher scores) - uses likert text answers
const mgr1Responses = [
    {
        id: 'resp-001',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Strongly Agree', q2: 'Strongly Agree',  // engagement: 5+5=10/10 = 100%
            q3: 'Agree', q4: 'Agree',                     // leadership: 4+4=8/10 = 80%
            q5: 'Strongly Agree', q6: 'Agree',            // psych-safety: 5+4=9/10 = 90%
            q7: 'Agree', q8: 'Agree',                     // wellbeing: 4+4=8/10 = 80%
            q9: 'Strongly Disagree', q10: 'Disagree',     // burnout (reverse): 5+4=9/10 = 90%
            q11: ['Workload'], q12: 'Great job!'
        },
        metadata: { managerId: 'mgr-001', managerName: 'Alice Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-15T10:00:00Z'),
        createdAt: new Date('2025-01-15T09:50:00Z'),
        totalDurationMs: 600000,
    },
    {
        id: 'resp-002',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Agree', q2: 'Strongly Agree',            // engagement: 4+5=9/10 = 90%
            q3: 'Strongly Agree', q4: 'Agree',            // leadership: 5+4=9/10 = 90%
            q5: 'Agree', q6: 'Strongly Agree',            // psych-safety: 4+5=9/10 = 90%
            q7: 'Strongly Agree', q8: 'Agree',            // wellbeing: 5+4=9/10 = 90%
            q9: 'Disagree', q10: 'Strongly Disagree',     // burnout (reverse): 4+5=9/10 = 90%
            q11: ['Manager support'], q12: ''
        },
        metadata: { managerId: 'mgr-001', managerName: 'Alice Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-15T11:00:00Z'),
        createdAt: new Date('2025-01-15T10:45:00Z'),
        totalDurationMs: 900000,
    },
    {
        id: 'resp-003',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Strongly Agree', q2: 'Agree',            // engagement: 5+4=9/10 = 90%
            q3: 'Agree', q4: 'Strongly Agree',            // leadership: 4+5=9/10 = 90%
            q5: 'Strongly Agree', q6: 'Strongly Agree',   // psych-safety: 5+5=10/10 = 100%
            q7: 'Agree', q8: 'Strongly Agree',            // wellbeing: 4+5=9/10 = 90%
            q9: 'Strongly Disagree', q10: 'Strongly Disagree', // burnout: 5+5=10/10 = 100%
            q11: ['Team dynamics'], q12: 'Keep it up!'
        },
        metadata: { managerId: 'mgr-001', managerName: 'Alice Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-15T12:00:00Z'),
        createdAt: new Date('2025-01-15T11:48:00Z'),
        totalDurationMs: 720000,
    },
    {
        id: 'resp-004',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Agree', q2: 'Agree',                     // engagement: 4+4=8/10 = 80%
            q3: 'Strongly Agree', q4: 'Strongly Agree',   // leadership: 5+5=10/10 = 100%
            q5: 'Agree', q6: 'Agree',                     // psych-safety: 4+4=8/10 = 80%
            q7: 'Strongly Agree', q8: 'Strongly Agree',   // wellbeing: 5+5=10/10 = 100%
            q9: 'Disagree', q10: 'Disagree',              // burnout (reverse): 4+4=8/10 = 80%
            q11: ['Remote work'], q12: ''
        },
        metadata: { managerId: 'mgr-001', managerName: 'Alice Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-15T13:00:00Z'),
        createdAt: new Date('2025-01-15T12:50:00Z'),
        totalDurationMs: 600000,
    },
    {
        id: 'resp-005',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Strongly Agree', q2: 'Strongly Agree',   // engagement: 5+5=10/10 = 100%
            q3: 'Agree', q4: 'Agree',                     // leadership: 4+4=8/10 = 80%
            q5: 'Strongly Agree', q6: 'Agree',            // psych-safety: 5+4=9/10 = 90%
            q7: 'Agree', q8: 'Agree',                     // wellbeing: 4+4=8/10 = 80%
            q9: 'Strongly Disagree', q10: 'Disagree',     // burnout (reverse): 5+4=9/10 = 90%
            q11: ['Workload', 'Manager support'], q12: 'Excellent!'
        },
        metadata: { managerId: 'mgr-001', managerName: 'Alice Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-15T14:00:00Z'),
        createdAt: new Date('2025-01-15T13:45:00Z'),
        totalDurationMs: 900000,
    },
];

// Manager 2 responses (lower scores)
const mgr2Responses = [
    {
        id: 'resp-006',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Neutral', q2: 'Disagree',                // engagement: 3+2=5/10 = 50%
            q3: 'Neutral', q4: 'Disagree',                // leadership: 3+2=5/10 = 50%
            q5: 'Neutral', q6: 'Neutral',                 // psych-safety: 3+3=6/10 = 60%
            q7: 'Neutral', q8: 'Disagree',                // wellbeing: 3+2=5/10 = 50%
            q9: 'Agree', q10: 'Agree',                    // burnout (reverse): 2+2=4/10 = 40%
            q11: ['Workload'], q12: 'Needs work'
        },
        metadata: { managerId: 'mgr-002', managerName: 'Bob Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-16T10:00:00Z'),
        createdAt: new Date('2025-01-16T09:50:00Z'),
        totalDurationMs: 600000,
    },
    {
        id: 'resp-007',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Disagree', q2: 'Neutral',                // engagement: 2+3=5/10 = 50%
            q3: 'Disagree', q4: 'Neutral',                // leadership: 2+3=5/10 = 50%
            q5: 'Disagree', q6: 'Disagree',               // psych-safety: 2+2=4/10 = 40%
            q7: 'Disagree', q8: 'Neutral',                // wellbeing: 2+3=5/10 = 50%
            q9: 'Strongly Agree', q10: 'Strongly Agree',  // burnout (reverse): 1+1=2/10 = 20%
            q11: ['Manager support'], q12: ''
        },
        metadata: { managerId: 'mgr-002', managerName: 'Bob Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-16T11:00:00Z'),
        createdAt: new Date('2025-01-16T10:45:00Z'),
        totalDurationMs: 900000,
    },
    {
        id: 'resp-008',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Neutral', q2: 'Neutral',                 // engagement: 3+3=6/10 = 60%
            q3: 'Neutral', q4: 'Disagree',                // leadership: 3+2=5/10 = 50%
            q5: 'Neutral', q6: 'Neutral',                 // psych-safety: 3+3=6/10 = 60%
            q7: 'Neutral', q8: 'Disagree',                // wellbeing: 3+2=5/10 = 50%
            q9: 'Agree', q10: 'Agree',                    // burnout (reverse): 2+2=4/10 = 40%
            q11: ['Team dynamics'], q12: ''
        },
        metadata: { managerId: 'mgr-002', managerName: 'Bob Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-16T12:00:00Z'),
        createdAt: new Date('2025-01-16T11:48:00Z'),
        totalDurationMs: 720000,
    },
    {
        id: 'resp-009',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Disagree', q2: 'Disagree',               // engagement: 2+2=4/10 = 40%
            q3: 'Disagree', q4: 'Neutral',                // leadership: 2+3=5/10 = 50%
            q5: 'Disagree', q6: 'Disagree',               // psych-safety: 2+2=4/10 = 40%
            q7: 'Disagree', q8: 'Neutral',                // wellbeing: 2+3=5/10 = 50%
            q9: 'Strongly Agree', q10: 'Agree',           // burnout (reverse): 1+2=3/10 = 30%
            q11: ['Remote work'], q12: 'Struggling'
        },
        metadata: { managerId: 'mgr-002', managerName: 'Bob Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-16T13:00:00Z'),
        createdAt: new Date('2025-01-16T12:50:00Z'),
        totalDurationMs: 600000,
    },
    {
        id: 'resp-010',
        surveyId: GOLDEN_SURVEY_ID,
        answers: {
            q1: 'Neutral', q2: 'Neutral',                 // engagement: 3+3=6/10 = 60%
            q3: 'Neutral', q4: 'Neutral',                 // leadership: 3+3=6/10 = 60%
            q5: 'Neutral', q6: 'Neutral',                 // psych-safety: 3+3=6/10 = 60%
            q7: 'Neutral', q8: 'Neutral',                 // wellbeing: 3+3=6/10 = 60%
            q9: 'Neutral', q10: 'Neutral',                // burnout (reverse): 3+3=6/10 = 60%
            q11: ['Workload', 'Team dynamics'], q12: ''
        },
        metadata: { managerId: 'mgr-002', managerName: 'Bob Manager' },
        completionPercentage: 100,
        completedAt: new Date('2025-01-16T14:00:00Z'),
        createdAt: new Date('2025-01-16T13:45:00Z'),
        totalDurationMs: 900000,
    },
];

const GOLDEN_RESPONSES = [...mgr1Responses, ...mgr2Responses];

// Survey with no scoreConfig (for Basic Analytics mode)
const UNSCORED_SURVEY = {
    id: 'unscored-survey-001',
    title: 'Unscored Survey',
    description: 'Survey with no scoring configuration',
    status: 'Active' as const,
    questions: GOLDEN_QUESTIONS.map(q => ({ ...q, scorable: false, scoringCategory: undefined })),
    scoreConfig: undefined,
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
};

// Survey with scoreConfig.enabled = false
const DISABLED_SCORING_SURVEY = {
    id: 'disabled-scoring-001',
    title: 'Disabled Scoring Survey',
    description: 'Survey with scoring configured but disabled',
    status: 'Active' as const,
    questions: GOLDEN_QUESTIONS,
    scoreConfig: {
        ...GOLDEN_SCORE_CONFIG,
        enabled: false,
    },
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
};

async function seedAnalyticsGolden() {
    console.log('🌱 Seeding Analytics Golden Tests...');

    // 0. Ensure System User exists
    const SYSTEM_USER_ID = 'system_admin';
    console.log(`   Ensuring system user exists: ${SYSTEM_USER_ID}`);
    await db.insert(users).values({
        id: SYSTEM_USER_ID,
        email: 'admin@evalia.io',
        firstName: 'System',
        lastName: 'Admin',
    }).onConflictDoNothing();

    // 1. Seed Golden Survey
    console.log(`   Creating survey: ${GOLDEN_SURVEY.title} (${GOLDEN_SURVEY.id})`);
    await db.insert(surveys).values({
        ...GOLDEN_SURVEY,
        userId: SYSTEM_USER_ID,
    }).onConflictDoUpdate({
        target: surveys.id,
        set: { ...GOLDEN_SURVEY, userId: SYSTEM_USER_ID },
    });

    // 2. Seed Responses for Golden Survey
    console.log(`   Clearing existing responses for Golden Survey...`);
    await db.delete(surveyResponses).where(eq(surveyResponses.surveyId, GOLDEN_SURVEY_ID));

    console.log(`   Seeding ${GOLDEN_RESPONSES.length} responses for Golden Survey...`);
    for (const response of GOLDEN_RESPONSES) {
        await db.insert(surveyResponses).values({
            ...response,
            metadata: response.metadata as any, // Cast to any to bypass strict type check for seed data
        }).onConflictDoUpdate({
            target: surveyResponses.id,
            set: { ...response, metadata: response.metadata as any },
        });
    }

    // 3. Seed Unscored Survey
    console.log(`   Creating survey: ${UNSCORED_SURVEY.title} (${UNSCORED_SURVEY.id})`);
    await db.insert(surveys).values({
        ...UNSCORED_SURVEY,
        userId: SYSTEM_USER_ID,
    }).onConflictDoUpdate({
        target: surveys.id,
        set: { ...UNSCORED_SURVEY, userId: SYSTEM_USER_ID },
    });

    // 4. Seed Disabled Scoring Survey
    console.log(`   Creating survey: ${DISABLED_SCORING_SURVEY.title} (${DISABLED_SCORING_SURVEY.id})`);
    await db.insert(surveys).values({
        ...DISABLED_SCORING_SURVEY,
        userId: SYSTEM_USER_ID,
    }).onConflictDoUpdate({
        target: surveys.id,
        set: { ...DISABLED_SCORING_SURVEY, userId: SYSTEM_USER_ID },
    });

    console.log('✅ Analytics Golden Tests seeded successfully!');
    process.exit(0);
}

seedAnalyticsGolden().catch((err) => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
