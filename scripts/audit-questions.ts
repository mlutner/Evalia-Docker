import { surveyTemplates } from '@shared/templates';
import { validateQuestion } from '@shared/questionNormalization';

type MediaType = 'image_choice' | 'file_upload' | 'signature' | 'video' | 'audio_capture';

const mediaSummaries: string[] = [];
let hasErrors = false;

surveyTemplates.forEach((template) => {
  template.questions.forEach((question, idx) => {
    const result = validateQuestion(question);
    const questionId = (question as any)?.id ?? `index-${idx}`;
    const questionType = (question as any)?.type ?? 'unknown';

    if (!result.success) {
      hasErrors = true;
      const issues = result.issues
        ?.map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
        .join('; ');
      console.error(`[audit] Template "${template.id}" question "${questionId}" (${questionType}) failed QuestionSchema: ${issues}`);
      return;
    }

    if (result.isMediaType) {
      mediaSummaries.push(`Template ${template.id} :: ${questionId} (${questionType as MediaType})`);
    }
  });
});

if (mediaSummaries.length) {
  console.log('[audit] Media-type questions validated:');
  mediaSummaries.forEach((entry) => console.log(` - ${entry}`));
}

if (hasErrors) {
  console.error('[audit] One or more questions failed QuestionSchema validation.');
  process.exit(1);
} else {
  console.log(`[audit] All ${surveyTemplates.length} templates passed QuestionSchema validation.`);
  process.exit(0);
}
