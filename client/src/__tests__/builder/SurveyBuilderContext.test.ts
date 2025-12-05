import { describe, it, expect } from 'vitest';
import type { Question as EvaliaQuestion } from '@shared/schema';
import {
  evaliaToBuilder,
  builderToEvalia,
  exportSurveyToEvalia,
  createInitialSurvey,
} from '@/contexts/SurveyBuilderContext';

describe('SurveyBuilderContext adapters and export', () => {
  it('round-trips Evalia → Builder → Evalia preserving core fields and design settings', () => {
    const sampleQuestions: EvaliaQuestion[] = [
      {
        id: 'q1',
        type: 'multiple_choice',
        question: 'How did you hear about us?',
        description: 'Pick one',
        options: ['Web', 'Friend', 'Ad'],
        required: true,
        scorable: true,
        scoreWeight: 2,
        scoringCategory: 'engagement',
        optionScores: { Web: 1, Friend: 3, Ad: 0 },
        logicRules: [
          { id: 'r1', condition: 'answer("q1") == "Web"', action: 'skip', targetQuestionId: 'q3' },
        ],
      },
      {
        id: 'q2',
        type: 'rating',
        question: 'Rate your experience',
        ratingScale: 7,
        ratingStyle: 'star',
        ratingLabels: { low: 'Bad', high: 'Great' },
        required: false,
      },
      {
        id: 'q3',
        type: 'likert',
        question: 'Agreement level',
        likertPoints: 5,
        likertType: 'agreement',
        required: true,
      },
    ];

    const scoreConfig = { enabled: true, maxScore: 100, passScore: 70 };

    const designSettings = {
      themeColors: {
        primary: '#123456',
        secondary: '#654321',
        background: '#ffffff',
        text: '#000000',
        buttonText: '#ffffff',
      },
      welcomeScreen: {
        enabled: true,
        title: 'Welcome Custom',
        description: 'Welcome description',
        buttonText: 'Begin',
        layout: 'centered' as const,
      },
      thankYouScreen: {
        enabled: true,
        title: 'Thanks Custom',
        message: 'Done!',
      },
      surveyBody: {
        showProgressBar: true,
        showQuestionNumbers: true,
        questionLayout: 'scroll' as const,
      },
    };

    const builderQuestions = sampleQuestions.map((q, idx) => evaliaToBuilder(q, idx));

    const base = createInitialSurvey();
    const builderSurvey = {
      ...base,
      title: 'Roundtrip Test',
      description: 'Testing conversion',
      questions: builderQuestions,
      scoreConfig,
      welcomeScreen: {
        ...base.welcomeScreen,
        title: designSettings.welcomeScreen.title,
        description: designSettings.welcomeScreen.description,
        buttonText: designSettings.welcomeScreen.buttonText,
        layout: designSettings.welcomeScreen.layout,
        themeColors: designSettings.themeColors,
      },
      thankYouScreen: {
        ...base.thankYouScreen,
        title: designSettings.thankYouScreen.title,
        message: designSettings.thankYouScreen.message,
      },
      surveyBody: designSettings.surveyBody,
    };

    const exported = exportSurveyToEvalia(builderSurvey);

    expect(exported.title).toBe('Roundtrip Test');
    expect(exported.description).toBe('Testing conversion');
    expect(exported.questions).toHaveLength(sampleQuestions.length);

    exported.questions.forEach((q, idx) => {
      const original = sampleQuestions[idx];
      expect(q.type).toBe(original.type);
      expect(q.question).toBe(original.question);
      if (original.type === 'multiple_choice') {
        expect(q.options).toEqual(original.options);
        expect(q.scorable).toBe(true);
        expect(q.scoreWeight).toBe(2);
        expect(q.scoringCategory).toBe('engagement');
        expect(q.optionScores).toEqual({ Web: 1, Friend: 3, Ad: 0 });
        expect(q.logicRules).toEqual([
          { id: 'r1', condition: 'answer(\"q1\") == \"Web\"', action: 'skip', targetQuestionId: 'q3' },
        ]);
      }
      if (original.type === 'rating') {
        expect(q.ratingScale).toBe(original.ratingScale);
        expect(q.ratingStyle).toBe(original.ratingStyle);
        expect(q.ratingLabels).toEqual(original.ratingLabels);
      }
      if (original.type === 'likert') {
        expect(q.likertPoints).toBe(original.likertPoints);
        expect(q.likertType).toBe(original.likertType);
      }
    });

    // design settings preserved
    expect(exported.designSettings.welcomeScreen.title).toBe(designSettings.welcomeScreen.title);
    expect(exported.designSettings.themeColors?.primary).toBe(designSettings.themeColors.primary);

    // builderToEvalia round-trip on a single question to ensure adapter symmetry
    const back = builderToEvalia(builderQuestions[0]);
    expect(back.type).toBe(sampleQuestions[0].type);
    expect(back.options).toEqual(sampleQuestions[0].options);
    expect(back.scorable).toBe(true);
    expect(back.scoreWeight).toBe(2);
    expect(back.scoringCategory).toBe('engagement');
    expect(back.optionScores).toEqual({ Web: 1, Friend: 3, Ad: 0 });
    expect(back.logicRules).toEqual([
      { id: 'r1', condition: 'answer(\"q1\") == \"Web\"', action: 'skip', targetQuestionId: 'q3' },
    ]);
  });
});
