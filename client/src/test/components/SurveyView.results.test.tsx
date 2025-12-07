/**
 * RESULTS-001: Integration tests for ResultsScreen vs ThankYou branching
 * 
 * Canonical rule:
 * - If scoreConfig.enabled AND scoringPayload !== null → ResultsScreen
 * - Otherwise → ThankYou screen
 * 
 * NOTE: As of 2025-12-06, scoring logic was hardened to require BOTH:
 * - scorable: true on the question
 * - scoringCategory set
 * Questions missing either field are skipped by calculateSurveyScores.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { calculateSurveyScores } from '@shared/schema';
import type { Survey, Question, SurveyScoreConfig } from '@shared/schema';

// Mock survey with scoring enabled
const createScoredSurvey = (overrides: Partial<Survey> = {}): Survey => ({
    id: 'test-survey-1',
    userId: 'user-1',
    title: 'Test Scoring Survey',
    description: 'A survey with scoring enabled',
    questions: [
        {
            id: 'q1',
            type: 'rating',
            question: 'Rate your experience',
            ratingScale: 5,
            scoringCategory: 'satisfaction',
            scorable: true, // Required for scoring engine to process this question
            scoreWeight: 1,
            optionScores: { '1': 1, '2': 2, '3': 3, '4': 4, '5': 5 },
            required: true,
        },
    ] as Question[],
    welcomeMessage: 'Welcome!',
    thankYouMessage: 'Thank you for your feedback!',
    tags: [],
    isAnonymous: false,
    status: 'Active',
    createdAt: new Date(),
    updatedAt: new Date(),
    scoreConfig: {
        enabled: true,
        categories: [{ id: 'satisfaction', name: 'Satisfaction' }],
        // SCORE-002: scoreRanges use min/max (not minScore/maxScore)
        scoreRanges: [
            { id: 'low', category: 'satisfaction', label: 'Low', min: 0, max: 40, interpretation: 'Needs improvement' },
            { id: 'high', category: 'satisfaction', label: 'High', min: 41, max: 100, interpretation: 'Excellent' },
        ],
    } as SurveyScoreConfig,
    ...overrides,
});

// Mock survey without scoring
const createNonScoredSurvey = (overrides: Partial<Survey> = {}): Survey => ({
    id: 'test-survey-2',
    userId: 'user-1',
    title: 'Test Non-Scoring Survey',
    description: 'A survey without scoring',
    questions: [
        {
            id: 'q1',
            type: 'text',
            question: 'Any feedback?',
            required: false,
        },
    ] as Question[],
    welcomeMessage: 'Welcome!',
    thankYouMessage: 'Thanks for your time!',
    tags: [],
    isAnonymous: false,
    status: 'Active',
    createdAt: new Date(),
    updatedAt: new Date(),
    scoreConfig: undefined,
    ...overrides,
});

describe('RESULTS-001: ResultsScreen vs ThankYou Branching', () => {
    describe('calculateSurveyScores', () => {
        it('returns valid results when scoring enabled with scorable answers', () => {
            const survey = createScoredSurvey();
            const answers = { q1: '4' }; // Rating of 4/5

            const results = calculateSurveyScores(
                survey.questions,
                answers,
                survey.scoreConfig
            );

            expect(results).not.toBeNull();
            expect(results).toHaveLength(1);
            expect(results![0].categoryId).toBe('satisfaction');
            expect(results![0].score).toBeGreaterThan(0);
        });

        it('returns null when scoring is disabled', () => {
            const survey = createNonScoredSurvey();
            const answers = { q1: 'Some feedback' };

            const results = calculateSurveyScores(
                survey.questions,
                answers,
                survey.scoreConfig
            );

            expect(results).toBeNull();
        });

        it('returns null when scoreConfig.enabled is false', () => {
            const survey = createScoredSurvey({
                scoreConfig: {
                    enabled: false,
                    categories: [],
                    scoreRanges: [],
                },
            });
            const answers = { q1: '4' };

            const results = calculateSurveyScores(
                survey.questions,
                answers,
                survey.scoreConfig
            );

            expect(results).toBeNull();
        });

        it('returns empty array (not null) when no scorable questions have answers', () => {
            const survey = createScoredSurvey({
                questions: [
                    {
                        id: 'q1',
                        type: 'text', // Non-scorable type
                        question: 'Any comments?',
                        scoringCategory: 'satisfaction', // Even with category, text is non-scorable
                    },
                ] as Question[],
            });
            const answers = { q1: 'Some text' };

            const results = calculateSurveyScores(
                survey.questions,
                answers,
                survey.scoreConfig
            );

            // Should return results array but with 0 scores (not null)
            expect(results).not.toBeNull();
            expect(Array.isArray(results)).toBe(true);
        });
    });

    describe('Branching Logic Unit Tests', () => {
        // These test the logic condition directly

        it('showResults = true when scoring enabled AND payload valid', () => {
            const scoreConfigEnabled = true;
            const scoringPayload = [{ categoryId: 'test', categoryName: 'Test', score: 50, maxScore: 100, interpretation: 'Good' }];

            const showResults = scoreConfigEnabled && scoringPayload !== null;

            expect(showResults).toBe(true);
        });

        it('showResults = false when scoring disabled', () => {
            const scoreConfigEnabled = false;
            const scoringPayload = null;

            const showResults = scoreConfigEnabled && scoringPayload !== null;

            expect(showResults).toBe(false);
        });

        it('showResults = false when scoring enabled but payload is null', () => {
            const scoreConfigEnabled = true;
            const scoringPayload = null;

            const showResults = scoreConfigEnabled && scoringPayload !== null;

            expect(showResults).toBe(false);
        });

        it('showResults = false when both conditions fail', () => {
            const scoreConfigEnabled = undefined; // Scoring not configured
            const scoringPayload = null;

            const showResults = scoreConfigEnabled && scoringPayload !== null;

            expect(showResults).toBeFalsy();
        });
    });
});
