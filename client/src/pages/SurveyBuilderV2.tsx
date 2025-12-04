import { useRoute, useLocation } from 'wouter';
import { SurveyBuilderProvider } from '@/contexts/SurveyBuilderContext';
import { ProgressFlowStepper } from '@/components/builder-v2/ProgressFlowStepper';
import { QuestionLibrary } from '@/components/builder-v2/QuestionLibrary';
import { BuilderCanvas } from '@/components/builder-v2/BuilderCanvas';
import { QuestionConfigPanel } from '@/components/builder-v2/QuestionConfigPanel';
import { BuilderActionBar } from '@/components/builder-v2/BuilderActionBar';
import { SurveyDebugPanel } from '@/components/builder-v2/SurveyDebugPanel';

export default function SurveyBuilderV2() {
  // Support both /builder/:id and /builder-v2/:id routes
  const [, paramsV2] = useRoute('/builder-v2/:id');
  const [, paramsBuilder] = useRoute('/builder/:id');
  const surveyId = paramsV2?.id || paramsBuilder?.id;

  return (
    <SurveyBuilderProvider surveyId={surveyId}>
      <SurveyBuilderContent surveyId={surveyId} />
    </SurveyBuilderProvider>
  );
}

function SurveyBuilderContent({ surveyId }: { surveyId?: string }) {
  const [, setLocation] = useLocation();

  const handlePreview = () => {
    // Navigate to the Preview & Share page instead of opening a dialog
    if (surveyId && surveyId !== 'new') {
      setLocation(`/preview-v2/${surveyId}`);
    } else {
      // For new surveys, we'd need to save first - the action bar should handle this
      setLocation('/preview-v2/new');
    }
  };

  return (
    <div className="absolute inset-0 bg-gray-50 font-sans flex flex-col overflow-hidden">
      {/* Top Bar: Progress Flow Stepper */}
      <ProgressFlowStepper surveyId={surveyId} />

      {/* 3-Panel Layout - takes remaining height */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Question Library */}
        <QuestionLibrary />

        {/* Center Panel: Canvas */}
        <BuilderCanvas />

        {/* Right Panel: Question Configuration */}
        <QuestionConfigPanel />
      </div>

      {/* Bottom Action Bar */}
      <BuilderActionBar onPreview={handlePreview} />

      {/* Dev-only debug surface */}
      <SurveyDebugPanel />
    </div>
  );
}

