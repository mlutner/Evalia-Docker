import type { BuilderSurvey } from '@/contexts/SurveyBuilderContext';
import { VALID_QUESTION_TYPES } from '@/contexts/SurveyBuilderContext';

export interface IntegrityIssue {
  type: 'warning' | 'error';
  message: string;
}

export interface IntegrityReport {
  issues: IntegrityIssue[];
  isHealthy: boolean;
}

export function checkSurveyIntegrity(survey: BuilderSurvey): IntegrityReport {
  const issues: IntegrityIssue[] = [];
  const ids = new Set<string>();

  survey.questions.forEach((q, idx) => {
    if (ids.has(q.id)) {
      issues.push({ type: 'error', message: `Duplicate question id "${q.id}" detected.` });
    } else {
      ids.add(q.id);
    }

    if (q.order !== idx) {
      issues.push({ type: 'warning', message: `Question ${q.id} has order ${q.order}, expected ${idx}.` });
    }

    if (!VALID_QUESTION_TYPES.includes(q.type)) {
      issues.push({ type: 'error', message: `Invalid question type "${q.type}" on ${q.id}.` });
    }
  });

  return { issues, isHealthy: issues.every((i) => i.type === 'warning') };
}
