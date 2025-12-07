import { describe, it, expect } from 'vitest';
import { VALID_QUESTION_TYPES } from '@/contexts/SurveyBuilderContext';
import { evaliaToBuilder, builderToEvalia } from '@/contexts/SurveyBuilderContext';
import type { Question } from '@shared/schema';

const makeEvaliaQuestion = (type: string): Question => {
  switch (type) {
    case 'multiple_choice':
      return { id: 'mc', type: 'multiple_choice', question: 'Pick', options: ['A', 'B'], allowOther: true, randomizeOptions: true, displayStyle: 'radio' };
    case 'checkbox':
      return { id: 'cb', type: 'checkbox', question: 'Check', options: ['A', 'B'], minSelections: 1, maxSelections: 2 };
    case 'rating':
      return { id: 'r', type: 'rating', question: 'Rate', ratingScale: 7, ratingStyle: 'number', ratingLabels: { low: 'L', high: 'H' }, showLabelsOnly: true };
    case 'matrix':
      return { id: 'm', type: 'matrix', question: 'Grid', rowLabels: ['R1'], colLabels: ['C1'], matrixType: 'radio', randomizeRows: true };
    case 'constant_sum':
      return { id: 'cs', type: 'constant_sum', question: 'Allocate', options: ['A', 'B'], totalPoints: 10, showPercentage: true };
    case 'nps':
      return { id: 'nps', type: 'nps', question: 'NPS', npsLabels: { detractor: 'Low', promoter: 'High' } } as any;
    case 'file_upload':
      return { id: 'f', type: 'file_upload', question: 'Upload', allowedTypes: ['image/png'], maxFileSize: 5, maxFiles: 2 } as any;
    case 'likert':
      return { id: 'lk', type: 'likert', question: 'Agree?', likertType: 'agreement', likertPoints: 5, showNeutral: true } as any;
    default:
      return { id: 't', type: 'text', question: 'Text' };
  }
};

describe('adapters round-trip', () => {
  it('round-trips core types without losing fields', () => {
    const types = ['text', 'multiple_choice', 'checkbox', 'rating', 'matrix', 'constant_sum', 'nps', 'file_upload', 'likert'];
    types.forEach(type => {
      const evalia = makeEvaliaQuestion(type);
      const builder = evaliaToBuilder(evalia, 0);
      const back = builderToEvalia(builder);
      expect(back).toMatchObject(evalia);
    });
  });
});
