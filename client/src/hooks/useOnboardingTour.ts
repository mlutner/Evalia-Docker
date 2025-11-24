import { useState, useEffect } from 'react';
import type { Step } from 'react-joyride';

const TOUR_STORAGE_KEY = 'evalia_tour_completed';

export const useOnboardingTour = () => {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const steps: Step[] = [
    {
      target: '[data-testid="button-sidebar-toggle"]',
      content: 'Welcome to Evalia! Click here to toggle the sidebar and explore navigation.',
      placement: 'right',
      title: 'Navigation',
    },
    {
      target: '[data-testid="button-start-survey-dashboard"]',
      content: 'Click here to create a new questionnaire. You can start from scratch, use AI to generate from documents, or choose from templates.',
      placement: 'left',
      title: 'Create New Questionnaire',
    },
    {
      target: '[data-testid="button-floating-ai-chat"]',
      content: 'Get AI assistance while building your survey! Our AI can help refine questions, suggest improvements, and generate content from documents.',
      placement: 'left',
      title: 'AI Assistant',
    },
    {
      target: '[data-testid="wizard-step-3"]',
      content: 'The wizard guides you through the survey creation process. You\'re currently on the Questions step where you can add, edit, and organize your survey questions.',
      placement: 'bottom',
      title: 'Survey Builder Steps',
    },
    {
      target: '[data-testid="dashboard-kpi-cards"]',
      content: 'Track your survey performance with key metrics: total created, average scores, and response completion rates.',
      placement: 'bottom',
      title: 'Analytics Dashboard',
    },
    {
      target: '[data-testid="nav-respondents"]',
      content: 'Manage your respondent lists here. Track invitations and view response status.',
      placement: 'right',
      title: 'Respondent Management',
    },
  ];

  // Check if user has already seen the tour
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasSeenTour) {
      // Delay tour start to ensure DOM is ready
      const timer = setTimeout(() => {
        setRun(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { action, status, type } = data;

    if (status === 'finished' || status === 'skipped') {
      setRun(false);
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } else if (type === 'step:after') {
      setStepIndex(data.index + 1);
    }
  };

  const resetTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    setStepIndex(0);
    setRun(true);
  };

  return {
    run,
    stepIndex,
    steps,
    handleJoyrideCallback,
    resetTour,
  };
};
