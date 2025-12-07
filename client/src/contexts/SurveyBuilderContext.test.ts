import { describe, it, expect } from 'vitest';
import {
  builderToEvalia,
  evaliaToBuilder,
  createInitialSurvey,
  exportSurveyToEvalia,
  type BuilderQuestion,
  type BuilderSurvey,
} from './SurveyBuilderContext';

// Helper to create a minimal NPS builder question
const makeNpsQuestion = (): BuilderQuestion => ({
  id: 'q1',
  type: 'nps',
  displayType: 'NPS',
  text: 'How likely are you to recommend us?',
  description: 'NPS',
  required: true,
  order: 0,
  hasLogic: false,
  npsLabels: { detractor: 'Not likely', promoter: 'Extremely likely' },
});

describe('SurveyBuilder mappings', () => {
  it('preserves NPS labels when converting builder -> evalia', () => {
    const q = makeNpsQuestion();
    const evalia = builderToEvalia(q);
    expect(evalia.npsLabels?.detractor).toBe('Not likely');
    expect(evalia.npsLabels?.promoter).toBe('Extremely likely');
  });

  it('exports design settings including welcome layout and survey body', () => {
    const survey = createInitialSurvey();
    survey.welcomeScreen.layout = 'split-view';
    survey.surveyBody = {
      showProgressBar: false,
      showQuestionNumbers: false,
      questionLayout: 'single',
      backgroundImage: { url: 'bg.jpg', overlayColor: '#111111', overlayOpacity: 50 },
    };
    survey.questions = [makeNpsQuestion()];

    const exported = exportSurveyToEvalia(survey);
    expect(exported.designSettings?.welcomeScreen?.layout).toBe('split-view');
    expect(exported.designSettings?.surveyBody?.questionLayout).toBe('single');
    expect(exported.designSettings?.surveyBody?.showProgressBar).toBe(false);
    expect(exported.designSettings?.surveyBody?.backgroundImage?.url).toBe('bg.jpg');

    const exportedQuestion = exported.questions[0];
    expect(exportedQuestion.npsLabels?.detractor).toBe('Not likely');
    expect(exportedQuestion.npsLabels?.promoter).toBe('Extremely likely');
  });

  it('keeps option/rating fields across conversion for multiple question types', () => {
    const mc: BuilderQuestion = {
      id: 'mc',
      type: 'multiple_choice',
      displayType: 'Multiple Choice',
      text: 'Pick one',
      required: true,
      order: 0,
      hasLogic: false,
      options: ['A', 'B'],
      allowOther: true,
      randomizeOptions: true,
      displayStyle: 'radio',
    };

    const slider: BuilderQuestion = {
      id: 'slider',
      type: 'slider',
      displayType: 'Slider',
      text: 'Rate on a slider',
      required: true,
      order: 1,
      hasLogic: false,
      min: 0,
      max: 10,
      step: 1,
      showValue: true,
      unit: '%',
    };

    const matrix: BuilderQuestion = {
      id: 'matrix',
      type: 'matrix',
      displayType: 'Matrix',
      text: 'Matrix question',
      required: false,
      order: 2,
      hasLogic: false,
      rowLabels: ['Row 1', 'Row 2'],
      colLabels: ['Col A', 'Col B'],
      matrixType: 'radio',
      randomizeRows: true,
    };

    const evaliaMc = builderToEvalia(mc);
    expect(evaliaMc.options).toEqual(['A', 'B']);
    expect(evaliaMc.allowOther).toBe(true);
    expect(evaliaMc.randomizeOptions).toBe(true);
    expect(evaliaMc.displayStyle).toBe('radio');

    const evaliaSlider = builderToEvalia(slider);
    expect(evaliaSlider.min).toBe(0);
    expect(evaliaSlider.max).toBe(10);
    expect(evaliaSlider.step).toBe(1);
    expect(evaliaSlider.showValue).toBe(true);
    expect(evaliaSlider.unit).toBe('%');

    const evaliaMatrix = builderToEvalia(matrix);
    expect(evaliaMatrix.rowLabels).toEqual(['Row 1', 'Row 2']);
    expect(evaliaMatrix.colLabels).toEqual(['Col A', 'Col B']);
    expect(evaliaMatrix.matrixType).toBe('radio');
    expect(evaliaMatrix.randomizeRows).toBe(true);
  });

  it('round-trips a survey (export -> import) preserving design and question fields', () => {
    const survey: BuilderSurvey = {
      ...createInitialSurvey(),
      title: 'Round Trip',
      description: 'RT',
      welcomeScreen: {
        ...createInitialSurvey().welcomeScreen,
        layout: 'left-aligned',
        imageUrl: '/attached_assets/logo.png',
        headerImage: '/attached_assets/header.png',
        backgroundImage: { url: '/bg.png', overlayColor: '#123456', overlayOpacity: 20 },
        showTimeEstimate: false,
        showQuestionCount: false,
      },
      thankYouScreen: {
        ...createInitialSurvey().thankYouScreen,
        message: 'Thanks!',
        backgroundImage: { url: '/ty.png', overlayColor: '#654321', overlayOpacity: 30 },
      },
      surveyBody: {
        showProgressBar: false,
        showQuestionNumbers: false,
        questionLayout: 'single',
      },
      questions: [
        makeNpsQuestion(),
        {
          id: 'file',
          type: 'file_upload',
          displayType: 'File Upload',
          text: 'Upload a file',
          required: true,
          order: 1,
          hasLogic: false,
          allowedTypes: ['image/png'],
          maxFileSize: 5,
          maxFiles: 2,
        },
      ],
    };

    const exported = exportSurveyToEvalia(survey);

    // Simulate loading from API (existingSurveyData + designSettings)
    const ds = exported.designSettings;
    const welcomeDs = ds?.welcomeScreen;
    const thankYouDs = ds?.thankYouScreen;
    const rebuiltQuestions = exported.questions.map((q, idx) => evaliaToBuilder(q as any, idx));

    expect(rebuiltQuestions[0].npsLabels?.promoter).toBe('Extremely likely');
    expect((exported.questions[1] as any).allowedTypes).toEqual(['image/png']);
    expect((exported.questions[1] as any).maxFiles).toBe(2);

    expect(welcomeDs?.layout).toBe('left-aligned');
    expect(welcomeDs?.logoUrl).toBe('/attached_assets/logo.png');
    expect(welcomeDs?.headerImage).toBe('/attached_assets/header.png');
    expect(welcomeDs?.backgroundImage?.url).toBe('/bg.png');
    expect(welcomeDs?.showTimeEstimate).toBe(false);
    expect(welcomeDs?.showQuestionCount).toBe(false);
    expect(thankYouDs?.backgroundImage?.url).toBe('/ty.png');
    expect(ds?.surveyBody?.questionLayout).toBe('single');
    expect(ds?.surveyBody?.showProgressBar).toBe(false);
  });
});
