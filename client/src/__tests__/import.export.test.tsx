import { describe, it, expect } from 'vitest';
import { exportSurveyToEvalia, createInitialSurvey, evaliaToBuilder } from '@/contexts/SurveyBuilderContext';

describe('import/export flows', () => {
  it('export includes design settings and re-import keeps fields', () => {
    const survey = createInitialSurvey();
    survey.welcomeScreen.layout = 'left-aligned';
    survey.surveyBody = { questionLayout: 'single', showProgressBar: false };
    survey.questions = [{
      id: 'nps',
      type: 'nps',
      displayType: 'NPS',
      text: 'NPS?',
      required: true,
      order: 0,
      hasLogic: false,
      npsLabels: { detractor: 'Low', promoter: 'High' },
    }];

    const exported = exportSurveyToEvalia(survey);
    const rebuilt = exported.questions.map((q, i) => evaliaToBuilder(q as any, i));

    expect(exported.designSettings?.surveyBody?.questionLayout).toBe('single');
    expect(rebuilt[0].npsLabels?.promoter).toBe('High');
  });
});
