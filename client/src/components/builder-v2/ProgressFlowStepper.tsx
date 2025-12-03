import React, { Fragment } from 'react';
import { useLocation, useRoute } from 'wouter';
import { Edit3, Palette, Eye, Check, ChevronLeft, ArrowRight, Rocket, Undo2, Redo2 } from 'lucide-react';
import { useSurveyBuilder } from '@/contexts/SurveyBuilderContext';
import { Button } from '@/components/ui/button';

interface Step {
  id: number;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: 'completed' | 'active' | 'inactive';
  path: string;
}

interface ProgressFlowStepperProps {
  surveyId?: string;
}

export function ProgressFlowStepper({ surveyId }: ProgressFlowStepperProps) {
  const [location, setLocation] = useLocation();
  const { survey, isDirty, saveSurvey, isSaving } = useSurveyBuilder();

  // Determine which step is active based on current route
  const getStepStatus = (stepPath: string): 'completed' | 'active' | 'inactive' => {
    if (location.includes(stepPath)) {
      return 'active';
    }
    const stepOrder = ['/builder-v2', '/design-v2', '/preview-v2'];
    const currentIndex = stepOrder.findIndex(path => location.includes(path));
    const stepIndex = stepOrder.findIndex(path => path === stepPath);

    if (currentIndex > stepIndex) {
      return 'completed';
    }
    return 'inactive';
  };

  const id = surveyId || 'new';

  const steps: Step[] = [
    {
      id: 1,
      label: 'Build',
      description: 'Add questions',
      icon: <Edit3 size={16} />,
      status: getStepStatus('/builder-v2'),
      path: `/builder-v2/${id}`,
    },
    {
      id: 2,
      label: 'Design',
      description: 'Customize look',
      icon: <Palette size={16} />,
      status: getStepStatus('/design-v2'),
      path: `/design-v2/${id}`,
    },
    {
      id: 3,
      label: 'Preview & Share',
      description: 'Test & publish',
      icon: <Eye size={16} />,
      status: getStepStatus('/preview-v2'),
      path: `/preview-v2/${id}`,
    },
  ];

  // Determine which page we're on
  const isBuilderPage = location.includes('/builder-v2');
  const isDesignPage = location.includes('/design-v2');
  const isPreviewPage = location.includes('/preview-v2');

  // Back button logic
  const getBackPath = () => {
    if (isBuilderPage) return '/dashboard';
    if (isDesignPage) return `/builder-v2/${id}`;
    if (isPreviewPage) return `/design-v2/${id}`;
    return '/dashboard';
  };

  const getBackLabel = () => {
    if (isBuilderPage) return 'Back to Dashboard';
    if (isDesignPage) return 'Back to Builder';
    if (isPreviewPage) return 'Back to Design';
    return 'Back';
  };

  const handleNext = async () => {
    // Always save for new surveys OR if dirty - we need a real ID before navigating
    const needsSave = id === 'new' || isDirty;
    
    if (needsSave) {
      const savedId = await saveSurvey();
      if (savedId) {
        // Navigate with the real ID (either new or existing)
        if (isBuilderPage) {
          setLocation(`/design-v2/${savedId}`);
        } else if (isDesignPage) {
          setLocation(`/preview-v2/${savedId}`);
        }
        return;
      }
      // If save failed for a new survey, don't navigate
      if (id === 'new') {
        return;
      }
    }

    // Only navigate with existing ID if no save was needed
    if (isBuilderPage) {
      setLocation(`/design-v2/${id}`);
    } else if (isDesignPage) {
      setLocation(`/preview-v2/${id}`);
    }
  };

  const handlePublish = async () => {
    await saveSurvey();
    setLocation(`/surveys`);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4">
        {/* Single Row: Back Button + Steps + Actions */}
        <div className="flex items-center justify-between gap-4 sm:gap-8">
          {/* Left: Back Button - Fixed Width */}
          <div className="w-[140px] sm:w-[180px] flex-shrink-0">
            <button
              onClick={() => setLocation(getBackPath())}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">{getBackLabel()}</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>

          {/* Center: Progress Steps - Clean Design */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
            {steps.map((step, index) => (
              <Fragment key={step.id}>
                <StepItem step={step} />
                {index < steps.length - 1 && (
                  <div className="w-6 sm:w-12 h-px bg-gray-300" />
                )}
              </Fragment>
            ))}
          </div>

          {/* Right: Actions - Fixed Width and Position */}
          <div className="w-[120px] sm:w-[220px] flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
            {/* Undo/Redo (Builder & Design only) - Hidden on mobile */}
            {(isBuilderPage || isDesignPage) && (
              <div className="hidden sm:flex items-center gap-1">
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Undo"
                  disabled
                >
                  <Undo2 size={14} className="text-gray-500" />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Redo"
                  disabled
                >
                  <Redo2 size={14} className="text-gray-500" />
                </button>
              </div>
            )}

            {/* Action Button */}
            <div className="w-[100px] sm:w-[140px]">
              {isBuilderPage && (
                <Button
                  onClick={handleNext}
                  disabled={isSaving || survey.questions.length === 0}
                  className="w-full h-9 px-3 sm:px-4 flex items-center justify-center gap-2 
                           bg-[#2F8FA5] hover:bg-[#267a8d] text-white text-sm font-semibold"
                >
                  <span className="hidden sm:inline">Next: Design</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight size={14} />
                </Button>
              )}

              {isDesignPage && (
                <Button
                  onClick={handleNext}
                  disabled={isSaving}
                  className="w-full h-9 px-3 sm:px-4 flex items-center justify-center gap-2 
                           bg-[#2F8FA5] hover:bg-[#267a8d] text-white text-sm font-semibold"
                >
                  <span className="hidden sm:inline">Next: Preview</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight size={14} />
                </Button>
              )}

              {isPreviewPage && (
                <Button
                  onClick={handlePublish}
                  disabled={isSaving}
                  className="w-full h-9 px-3 sm:px-4 flex items-center justify-center gap-2 
                           bg-[#2F8FA5] hover:bg-[#267a8d] text-white text-sm font-semibold"
                >
                  <Rocket size={14} />
                  <span>Publish</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepItem({ step }: { step: Step }) {
  const [, setLocation] = useLocation();

  const getBackgroundColor = () => {
    if (step.status === 'completed') return 'bg-green-500';
    if (step.status === 'active') return 'bg-purple-500';
    return 'bg-white';
  };

  const getBorderColor = () => {
    if (step.status === 'completed') return 'border-green-500';
    if (step.status === 'active') return 'border-purple-500';
    return 'border-gray-300';
  };

  const getIconColor = () => {
    if (step.status === 'completed' || step.status === 'active') return 'text-white';
    return 'text-gray-500';
  };

  return (
    <button
      onClick={() => step.status !== 'inactive' && setLocation(step.path)}
      disabled={step.status === 'inactive'}
      className={`flex items-center gap-2 sm:gap-3 ${step.status === 'inactive' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {/* Step Circle */}
      <div
        className={`
          w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center
          transition-all duration-300
          ${getBackgroundColor()} ${getBorderColor()}
        `}
      >
        <div className={`${getIconColor()} transition-colors duration-300`}>
          {step.status === 'completed' ? <Check size={16} strokeWidth={3} /> : step.icon}
        </div>
      </div>

      {/* Step Label - Hidden on small screens */}
      <div className="hidden sm:flex flex-col">
        <div
          className={`text-sm font-bold transition-colors ${
            step.status === 'active'
              ? 'text-purple-500'
              : step.status === 'completed'
              ? 'text-green-500'
              : 'text-gray-500'
          }`}
        >
          {step.label}
        </div>
        <div className="text-xs text-gray-500">{step.description}</div>
      </div>
    </button>
  );
}

