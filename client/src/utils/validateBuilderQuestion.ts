import { VALID_QUESTION_TYPES, type BuilderQuestion } from '@/contexts/SurveyBuilderContext';

// Basic guard to keep mutations from introducing bad state.
export function validateBuilderQuestion(input: BuilderQuestion): BuilderQuestion {
  const type = VALID_QUESTION_TYPES.includes(input.type) ? input.type : 'text';

  const sanitizedOptions = Array.isArray(input.options)
    ? input.options.filter((opt) => typeof opt === 'string')
    : undefined;

  const sanitizedAllowedTypes = Array.isArray((input as any).allowedTypes)
    ? (input as any).allowedTypes.filter((opt: unknown) => typeof opt === 'string' && opt.trim()).map((opt: string) => opt.trim())
    : typeof (input as any).allowedTypes === 'string'
      ? (input as any).allowedTypes.split(/[,;]+/).map((opt: string) => opt.trim()).filter(Boolean)
      : undefined;

  const maxFiles =
    (input as any).maxFiles !== undefined && (input as any).maxFiles !== null
      ? Number((input as any).maxFiles)
      : undefined;
  const maxFileSize =
    (input as any).maxFileSize !== undefined && (input as any).maxFileSize !== null
      ? Number((input as any).maxFileSize)
      : undefined;

  const optionScores =
    input.optionScores && typeof input.optionScores === 'object'
      ? Object.fromEntries(
          Object.entries(input.optionScores).map(([k, v]) => [k, Number.isFinite(v) ? v : 0])
        )
      : undefined;

  return {
    ...input,
    type,
    options: sanitizedOptions,
    optionScores,
    allowedTypes: sanitizedAllowedTypes,
    maxFiles,
    maxFileSize,
    order: Number.isFinite(input.order) ? input.order : 0,
  };
}
