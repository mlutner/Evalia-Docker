/**
 * ANAL-QA-010: Golden Fixtures for Analytics Unit Tests
 * 
 * This file contains a deterministic test dataset with hand-calculated expected values.
 * All numbers are designed to be easy to verify manually.
 * 
 * ALIGNED WITH: evalia_5d_smoke_test_v1 template (canonical 5D template)
 * 
 * Test Survey Design:
 * - 10 scorable questions across 5 canonical dimensions (2 each)
 * - 2 non-scorable questions (checkbox, textarea)
 * - 10 responses from 2 managers (5 each)
 * - Scores designed to produce clean averages
 * 
 * Canonical 5D Categories:
 * - engagement
 * - leadership-effectiveness
 * - psychological-safety
 * - team-wellbeing
 * - burnout-risk (reverse scored)
 */

import type { Question } from '@shared/schema';

// ============================================================================
// TEST SURVEY CONFIGURATION
// ============================================================================

export const GOLDEN_SURVEY_ID = 'golden-test-survey-001';

export const GOLDEN_QUESTIONS: Question[] = [
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

export const GOLDEN_SCORE_CONFIG = {
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

export const GOLDEN_SURVEY = {
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

// ============================================================================
// TEST RESPONSES
// ============================================================================

/**
 * Response Design (5D Aligned):
 * 
 * Questions per dimension:
 *   q1, q2  = engagement
 *   q3, q4  = leadership-effectiveness
 *   q5, q6  = psychological-safety
 *   q7, q8  = team-wellbeing
 *   q9, q10 = burnout-risk (reverse scored)
 *   q11     = checkbox (non-scored)
 *   q12     = textarea (non-scored)
 * 
 * Manager 1 (mgr-001): 5 responses, HIGHER scores
 * - Likert answers: Strongly Agree / Agree (4-5)
 * - Burnout answers: Disagree / Strongly Disagree (reverse = 4-5)
 * - Expected avg ~88%
 * 
 * Manager 2 (mgr-002): 5 responses, LOWER scores
 * - Likert answers: Neutral / Disagree (2-3)
 * - Burnout answers: Agree / Strongly Agree (reverse = 1-2)
 * - Expected avg ~46%
 * 
 * Overall expected avg: ~67%
 */

interface TestResponse {
  id: string;
  surveyId: string;
  answers: Record<string, string | string[]>;
  metadata: {
    managerId: string;
    managerName: string;
  };
  completionPercentage: number;
  completedAt: Date;
  createdAt: Date;
  totalDurationMs: number;
  scoreConfigVersionId?: string;
}

// Manager 1 responses (higher scores) - uses likert text answers
const mgr1Responses: TestResponse[] = [
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
const mgr2Responses: TestResponse[] = [
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

export const GOLDEN_RESPONSES: TestResponse[] = [...mgr1Responses, ...mgr2Responses];

// ============================================================================
// HAND-CALCULATED EXPECTED VALUES (5D Aligned)
// ============================================================================

/**
 * Score Calculations (5 Dimensions, 2 questions each):
 * 
 * Likert Scale: Strongly Disagree=1, Disagree=2, Neutral=3, Agree=4, Strongly Agree=5
 * Burnout Reverse: Strongly Agree=1, Agree=2, Neutral=3, Disagree=4, Strongly Disagree=5
 * 
 * Manager 1 (mgr-001) - 5 responses, HIGH scores:
 * ─────────────────────────────────────────────────
 * 
 * Engagement (q1+q2):
 *   resp-001: (5+5)/10 = 100%
 *   resp-002: (4+5)/10 = 90%
 *   resp-003: (5+4)/10 = 90%
 *   resp-004: (4+4)/10 = 80%
 *   resp-005: (5+5)/10 = 100%
 *   Avg: 92%
 * 
 * Leadership Effectiveness (q3+q4):
 *   resp-001: (4+4)/10 = 80%
 *   resp-002: (5+4)/10 = 90%
 *   resp-003: (4+5)/10 = 90%
 *   resp-004: (5+5)/10 = 100%
 *   resp-005: (4+4)/10 = 80%
 *   Avg: 88%
 * 
 * Psychological Safety (q5+q6):
 *   resp-001: (5+4)/10 = 90%
 *   resp-002: (4+5)/10 = 90%
 *   resp-003: (5+5)/10 = 100%
 *   resp-004: (4+4)/10 = 80%
 *   resp-005: (5+4)/10 = 90%
 *   Avg: 90%
 * 
 * Team Wellbeing (q7+q8):
 *   resp-001: (4+4)/10 = 80%
 *   resp-002: (5+4)/10 = 90%
 *   resp-003: (4+5)/10 = 90%
 *   resp-004: (5+5)/10 = 100%
 *   resp-005: (4+4)/10 = 80%
 *   Avg: 88%
 * 
 * Burnout Risk (q9+q10, reverse scored):
 *   resp-001: (5+4)/10 = 90%
 *   resp-002: (4+5)/10 = 90%
 *   resp-003: (5+5)/10 = 100%
 *   resp-004: (4+4)/10 = 80%
 *   resp-005: (5+4)/10 = 90%
 *   Avg: 90%
 * 
 * Manager 1 Overall: (92+88+90+88+90)/5 = 89.6%
 * 
 * 
 * Manager 2 (mgr-002) - 5 responses, LOW scores:
 * ─────────────────────────────────────────────────
 * 
 * Engagement (q1+q2):
 *   resp-006: (3+2)/10 = 50%
 *   resp-007: (2+3)/10 = 50%
 *   resp-008: (3+3)/10 = 60%
 *   resp-009: (2+2)/10 = 40%
 *   resp-010: (3+3)/10 = 60%
 *   Avg: 52%
 * 
 * Leadership Effectiveness (q3+q4):
 *   resp-006: (3+2)/10 = 50%
 *   resp-007: (2+3)/10 = 50%
 *   resp-008: (3+2)/10 = 50%
 *   resp-009: (2+3)/10 = 50%
 *   resp-010: (3+3)/10 = 60%
 *   Avg: 52%
 * 
 * Psychological Safety (q5+q6):
 *   resp-006: (3+3)/10 = 60%
 *   resp-007: (2+2)/10 = 40%
 *   resp-008: (3+3)/10 = 60%
 *   resp-009: (2+2)/10 = 40%
 *   resp-010: (3+3)/10 = 60%
 *   Avg: 52%
 * 
 * Team Wellbeing (q7+q8):
 *   resp-006: (3+2)/10 = 50%
 *   resp-007: (2+3)/10 = 50%
 *   resp-008: (3+2)/10 = 50%
 *   resp-009: (2+3)/10 = 50%
 *   resp-010: (3+3)/10 = 60%
 *   Avg: 52%
 * 
 * Burnout Risk (q9+q10, reverse scored):
 *   resp-006: (2+2)/10 = 40%
 *   resp-007: (1+1)/10 = 20%
 *   resp-008: (2+2)/10 = 40%
 *   resp-009: (1+2)/10 = 30%
 *   resp-010: (3+3)/10 = 60%
 *   Avg: 38%
 * 
 * Manager 2 Overall: (52+52+52+52+38)/5 = 49.2%
 * 
 * 
 * OVERALL AVERAGES (10 responses):
 * ────────────────────────────────
 * Engagement:              (92+52)/2 = 72%
 * Leadership Effectiveness: (88+52)/2 = 70%
 * Psychological Safety:    (90+52)/2 = 71%
 * Team Wellbeing:          (88+52)/2 = 70%
 * Burnout Risk:            (90+38)/2 = 64%
 * 
 * Overall Index: (72+70+71+70+64)/5 = 69.4%
 */

export const EXPECTED_RESULTS = {
  // Participation Metrics
  participationMetrics: {
    totalResponses: 10,
    completionRate: 100, // All 10 are 100% complete
    responseRate: null, // No invites tracked
    avgCompletionTime: 744, // (600+900+720+600+900+600+900+720+600+900)/10 = 7440s = 744s avg (12.4 min)
  },

  // Question-level Summary (representative samples)
  questionSummary: {
    q1: {
      questionId: 'q1',
      questionText: 'I feel motivated to do my best work.',
      totalAnswers: 10,
      completionRate: 100,
      // Mgr1: SA,A,SA,A,SA = 5,4,5,4,5 | Mgr2: N,D,N,D,N = 3,2,3,2,3
      avgValue: 3.6, // (5+4+5+4+5+3+2+3+2+3)/10 = 36/10 = 3.6
      minValue: 2,
      maxValue: 5,
    },
    q3: {
      questionId: 'q3',
      questionText: 'My manager provides clear expectations.',
      totalAnswers: 10,
      completionRate: 100,
      // Mgr1: A,SA,A,SA,A = 4,5,4,5,4 | Mgr2: N,D,N,D,N = 3,2,3,2,3
      avgValue: 3.5, // (4+5+4+5+4+3+2+3+2+3)/10 = 35/10 = 3.5
      minValue: 2,
      maxValue: 5,
    },
    q9: {
      questionId: 'q9',
      questionText: 'I feel emotionally drained after work.',
      totalAnswers: 10,
      completionRate: 100,
      // Mgr1: SD,D,SD,D,SD = 1,2,1,2,1 | Mgr2: A,SA,A,SA,N = 4,5,4,5,3
      // NOTE: avgValue is raw, not reverse-scored
      avgValue: 2.8, // (1+2+1+2+1+4+5+4+5+3)/10 = 28/10 = 2.8
      minValue: 1,
      maxValue: 5,
    },
  },

  // Manager-level Summary
  managerSummary: {
    'mgr-001': {
      managerId: 'mgr-001',
      managerName: 'Alice Manager',
      respondentCount: 5,
      avgIndexScore: 90, // ~89.6% rounded
      completionRate: 100,
    },
    'mgr-002': {
      managerId: 'mgr-002',
      managerName: 'Bob Manager',
      respondentCount: 5,
      avgIndexScore: 49, // ~49.2% rounded
      completionRate: 100,
    },
  },

  // Index Distribution (10 responses)
  // Per-response overall scores (avg of 5 dimensions):
  // Mgr1: resp-001=88%, resp-002=90%, resp-003=94%, resp-004=88%, resp-005=88%
  // Mgr2: resp-006=50%, resp-007=42%, resp-008=52%, resp-009=42%, resp-010=60%
  indexDistribution: {
    buckets: {
      '0-20': 0,
      '21-40': 0,
      '41-60': 5, // all mgr2 responses
      '61-80': 0,
      '81-100': 5, // all mgr1 responses
    },
  },

  // Band Distribution
  // Per-response overall scores: 88, 90, 94, 88, 88, 50, 42, 52, 42, 60
  // Using INDEX_BANDS: 0-39 critical, 40-54 needs-improvement, 55-69 developing, 70-84 effective, 85-100 highly-effective
  bandDistribution: {
    'highly-effective': 5, // resp-001(88%), resp-002(90%), resp-003(94%), resp-004(88%), resp-005(88%)
    'effective': 0,        // none
    'developing': 1,       // resp-010(60%)
    'needs-improvement': 4, // resp-006(50%), resp-007(42%), resp-008(52%), resp-009(42%)
    'critical': 0,         // none
  },

  // Index Trends Summary (single version = 5D dashboard)
  indexTrendsSummary: {
    totalVersions: 1,
    hasMultipleVersions: false,
    scores: {
      engagement: 72,
      leadershipEffectiveness: 70,
      psychologicalSafety: 71,
      teamWellbeing: 70,
      burnoutRisk: 64,
    },
  },

  // Dimension Leaderboard (ranked by score)
  dimensionLeaderboard: [
    { dimension: 'engagement', score: 72, band: 'effective' },
    { dimension: 'psychological-safety', score: 71, band: 'effective' },
    { dimension: 'leadership-effectiveness', score: 70, band: 'effective' },
    { dimension: 'team-wellbeing', score: 70, band: 'effective' },
    { dimension: 'burnout-risk', score: 64, band: 'developing' },
  ],
};

// ============================================================================
// EDGE CASE FIXTURES
// ============================================================================

export const EMPTY_SURVEY_ID = 'empty-survey-001';
export const EMPTY_RESPONSES: TestResponse[] = [];

export const SINGLE_RESPONSE_SURVEY_ID = 'single-response-survey-001';
export const SINGLE_RESPONSE: TestResponse[] = [
  {
    id: 'single-001',
    surveyId: SINGLE_RESPONSE_SURVEY_ID,
    answers: { 
      q1: 'Neutral', q2: 'Neutral',   // engagement
      q3: 'Neutral', q4: 'Neutral',   // leadership
      q5: 'Neutral', q6: 'Neutral',   // psych-safety
      q7: 'Neutral', q8: 'Neutral',   // wellbeing
      q9: 'Neutral', q10: 'Neutral',  // burnout
    },
    metadata: { managerId: 'mgr-single', managerName: 'Single Manager' },
    completionPercentage: 100,
    completedAt: new Date('2025-01-15T10:00:00Z'),
    createdAt: new Date('2025-01-15T09:50:00Z'),
    totalDurationMs: 300000,
  },
];

// Survey with no scoreConfig (for Basic Analytics mode)
export const UNSCORED_SURVEY = {
  id: 'unscored-survey-001',
  title: 'Unscored Survey',
  questions: GOLDEN_QUESTIONS.map(q => ({ ...q, scorable: false, scoringCategory: undefined })),
  scoreConfig: undefined,
};

// Survey with scoreConfig.enabled = false
export const DISABLED_SCORING_SURVEY = {
  id: 'disabled-scoring-001',
  title: 'Disabled Scoring Survey',
  questions: GOLDEN_QUESTIONS,
  scoreConfig: {
    ...GOLDEN_SCORE_CONFIG,
    enabled: false,
  },
};

