import { describe, it, expect } from 'vitest';
import { VALID_QUESTION_TYPES } from '@/contexts/SurveyBuilderContext';
import { QUESTION_TYPES } from '@/data/questionTypeConfig';

// Add more registries here as they’re introduced (answer shapes, operators, etc.)

describe('registry sync', () => {
  it('every VALID_QUESTION_TYPES entry has QUESTION_TYPES config', () => {
    VALID_QUESTION_TYPES.forEach(t => {
      expect(QUESTION_TYPES[t]).toBeDefined();
    });
  });

  it('no extra QUESTION_TYPES entries beyond VALID_QUESTION_TYPES', () => {
    const extras = Object.keys(QUESTION_TYPES).filter(t => !VALID_QUESTION_TYPES.includes(t as any));
    expect(extras).toHaveLength(0);
  });
});
