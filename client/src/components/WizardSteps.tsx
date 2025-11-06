import { Check } from "lucide-react";

interface WizardStepsProps {
  currentStep: number;
  steps: {
    number: number;
    title: string;
    description: string;
  }[];
}

export default function WizardSteps({ currentStep, steps }: WizardStepsProps) {
  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div className="flex items-center w-full">
                <div className="flex items-center justify-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                      currentStep > step.number
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.number
                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                    data-testid={`wizard-step-${step.number}`}
                  >
                    {currentStep > step.number ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2">
                    <div
                      className={`h-full transition-all ${
                        currentStep > step.number
                          ? "bg-primary"
                          : "bg-muted"
                      }`}
                    />
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <div
                  className={`text-sm font-medium ${
                    currentStep === step.number
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground hidden sm:block">
                  {step.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
