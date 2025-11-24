import Joyride from 'react-joyride';
import { useOnboardingTour } from '@/hooks/useOnboardingTour';

export default function OnboardingTour() {
  const { run, stepIndex, steps, handleJoyrideCallback } = useOnboardingTour();

  return (
    <Joyride
      steps={steps}
      run={run}
      stepIndex={stepIndex}
      callback={(data: any) => handleJoyrideCallback(data)}
      continuous
      showSkipButton
      showProgress
      styles={{
        options: {
          arrowColor: '#fff',
          backgroundColor: '#fff',
          overlayColor: 'rgba(0, 0, 0, 0.5)',
          primaryColor: '#2F8FA5',
          textColor: '#333',
          width: 400,
          zIndex: 10000,
        },
        tooltip: {
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        } as any,
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Finish',
        next: 'Next',
        open: 'Open the dialog',
        skip: 'Skip Tour',
      }}
    />
  );
}
