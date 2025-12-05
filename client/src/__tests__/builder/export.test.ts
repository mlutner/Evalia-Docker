import React from 'react';
import { describe, it, expect } from 'vitest';
import { createInitialSurvey, exportSurveyToEvalia, builderToEvalia } from '@/contexts/SurveyBuilderContext';

const makeQuestion = (type: any) => ({
  id: `q-${type}`,
  type,
  displayType: type,
  text: `${type} question`,
  required: true,
  order: 0,
  hasLogic: false,
  options: type === 'multiple_choice' ? ['A', 'B'] : undefined,
  npsLabels: type === 'nps' ? { detractor: 'Low', promoter: 'High' } : undefined,
});

describe('exportToEvalia', () => {
  it('maps questions and design settings correctly', () => {
    const survey = createInitialSurvey();
    survey.title = 'Export Survey';
    survey.description = 'Desc';
    survey.welcomeScreen.description = 'Welcome desc';
    survey.thankYouScreen.message = 'TY';
    survey.surveyBody = { questionLayout: 'scroll', showProgressBar: true };
    survey.questions = [makeQuestion('multiple_choice') as any, makeQuestion('nps') as any];

    const exported = exportSurveyToEvalia(survey);
    expect(exported.title).toBe('Export Survey');
    expect(exported.questions).toHaveLength(2);
    expect((exported.questions[0] as any).type).toBe('multiple_choice');
    expect((exported.questions[1] as any).npsLabels?.promoter).toBe('High');

    expect(exported.designSettings?.welcomeScreen?.title).toBe(survey.welcomeScreen.title);
    expect(exported.designSettings?.thankYouScreen?.message).toBe(survey.thankYouScreen.message);
    expect(exported.designSettings?.surveyBody?.questionLayout).toBe('scroll');
    expect(exported.designSettings?.themeColors?.primary).toBeDefined();
    expect(exported.welcomeMessage).toBe('Welcome desc');
    expect(exported.thankYouMessage).toBe('TY');
  });
});
