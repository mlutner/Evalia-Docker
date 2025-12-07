import { describe, it, expect } from 'vitest';
import type { Question as EvaliaQuestion } from '@shared/schema';
import {
  evaliaToBuilder,
  builderToEvalia,
  exportSurveyToEvalia,
  createInitialSurvey,
} from '@/contexts/SurveyBuilderContext';

function makeSampleQuestions(): EvaliaQuestion[] {
  return [
    {
      id: 'q1',
      type: 'multiple_choice',
      question: 'What is your favourite color?',
      description: 'Pick one option',
      required: true,
      options: ['Red', 'Green', 'Blue'],
      displayStyle: 'radio',
      allowOther: false,
      randomizeOptions: false,
    } as EvaliaQuestion,
    {
      id: 'q2',
      type: 'rating',
      question: 'How satisfied are you?',
      required: true,
      ratingScale: 5,
      ratingStyle: 'number',
      ratingLabels: { low: 'Not at all', high: 'Extremely' },
    } as EvaliaQuestion,
    {
      id: 'q3',
      type: 'likert',
      question: 'I feel supported at work',
      required: false,
      likertType: 'agreement',
      likertPoints: 5,
      showNeutral: true,
      customLabels: [
        'Strongly disagree',
        'Disagree',
        'Neutral',
        'Agree',
        'Strongly agree',
      ],
    } as EvaliaQuestion,
  ];
}

describe('Survey adapter round-trip (Evalia ↔ Builder)', () => {
  it('converts Evalia → Builder → Evalia without losing core fields', () => {
    const originalQuestions = makeSampleQuestions();

    const builderQuestions = originalQuestions.map((q, idx) =>
      evaliaToBuilder(q, idx),
    );

    expect(builderQuestions).toHaveLength(originalQuestions.length);
    builderQuestions.forEach((bq, idx) => {
      const oq = originalQuestions[idx];
      expect(bq.id).toBe(oq.id);
      expect(bq.type).toBe(oq.type);
      expect(bq.text).toBe(oq.question);
      expect(bq.required).toBe(oq.required ?? false);
      expect(bq.order).toBe(idx);
    });

    const roundTripped = builderQuestions.map(builderToEvalia);

    expect(roundTripped).toHaveLength(originalQuestions.length);
    roundTripped.forEach((rq, idx) => {
      const oq = originalQuestions[idx];

      // Structural
      expect(rq.id).toBe(oq.id);
      expect(rq.type).toBe(oq.type);
      expect(rq.question).toBe(oq.question);
      expect(rq.description).toBe(oq.description);

      // Options / scales – we only check fields that exist on that type
      switch (oq.type) {
        case 'multiple_choice':
          expect(rq.options).toEqual(oq.options);
          expect(rq.displayStyle).toBe(oq.displayStyle);
          expect(rq.allowOther).toBe(oq.allowOther);
          break;
        case 'rating':
          expect(rq.ratingScale).toBe(oq.ratingScale);
          expect(rq.ratingStyle).toBe(oq.ratingStyle);
          expect(rq.ratingLabels).toEqual(oq.ratingLabels);
          break;
        case 'likert':
          expect(rq.likertType).toBe(oq.likertType);
          expect(rq.likertPoints).toBe(oq.likertPoints);
          expect(rq.customLabels).toEqual(oq.customLabels);
          break;
      }
    });
  });

  it('preserves design settings through exportSurveyToEvalia', () => {
    const base = createInitialSurvey();
    const survey = {
      ...base,
      title: 'Round Trip Test',
      description: 'Testing design settings',
      welcomeScreen: {
        ...base.welcomeScreen,
        title: 'Welcome',
        description: 'Hello world',
        buttonText: 'Begin',
        themeColors: {
          ...base.welcomeScreen.themeColors!,
          primary: '#123456',
          background: '#fafafa',
          text: '#111111',
          buttonText: '#ffffff',
        },
      },
      questions: [],
    };

    const exported = exportSurveyToEvalia(survey);

    expect(exported.title).toBe('Round Trip Test');
    expect(exported.description).toBe('Testing design settings');

    expect(exported.designSettings).toBeDefined();
    expect(exported.designSettings.themeColors).toEqual(
      survey.welcomeScreen.themeColors,
    );
    expect(exported.designSettings.welcomeScreen.title).toBe(
      survey.welcomeScreen.title,
    );
    expect(exported.designSettings.welcomeScreen.description).toBe(
      survey.welcomeScreen.description,
    );
    expect(exported.designSettings.welcomeScreen.buttonText).toBe(
      survey.welcomeScreen.buttonText,
    );
  });
});
