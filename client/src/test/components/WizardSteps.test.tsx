import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WizardSteps from '@/components/WizardSteps';

describe('WizardSteps Component', () => {
  const mockSteps = [
    { number: 1, title: 'Basic Info', description: 'Start here', detailedDescription: 'Enter your basic information' },
    { number: 2, title: 'Questions', description: 'Add questions', detailedDescription: 'Create your survey questions' },
    { number: 3, title: 'Preview', description: 'Review', detailedDescription: 'Preview your survey' },
  ];

  it('renders all steps', () => {
    render(<WizardSteps currentStep={1} steps={mockSteps} />);
    
    mockSteps.forEach((step) => {
      expect(screen.getByTestId(`wizard-step-${step.number}`)).toBeInTheDocument();
    });
  });

  it('highlights current step', () => {
    const { rerender } = render(<WizardSteps currentStep={1} steps={mockSteps} />);
    let currentStepElement = screen.getByTestId('wizard-step-1');
    expect(currentStepElement).toHaveStyle({ boxShadow: expect.any(String) });

    rerender(<WizardSteps currentStep={2} steps={mockSteps} />);
    currentStepElement = screen.getByTestId('wizard-step-2');
    expect(currentStepElement).toHaveStyle({ boxShadow: expect.any(String) });
  });

  it('shows completed steps with checkmark', () => {
    render(<WizardSteps currentStep={3} steps={mockSteps} />);
    
    // Steps 1 and 2 should be completed
    const step1 = screen.getByTestId('wizard-step-1');
    const step2 = screen.getByTestId('wizard-step-2');
    
    expect(step1.textContent).not.toContain('1');
    expect(step2.textContent).not.toContain('2');
  });

  it('shows step number for current and future steps', () => {
    render(<WizardSteps currentStep={1} steps={mockSteps} />);
    
    expect(screen.getByTestId('wizard-step-1').textContent).toContain('1');
    expect(screen.getByTestId('wizard-step-2').textContent).toContain('2');
    expect(screen.getByTestId('wizard-step-3').textContent).toContain('3');
  });

  it('displays step titles and descriptions', () => {
    render(<WizardSteps currentStep={1} steps={mockSteps} />);
    
    mockSteps.forEach((step) => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
    });
  });
});
