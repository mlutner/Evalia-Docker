import { Check } from "lucide-react";
import { theme } from "@/theme";

interface WizardStepsProps {
  currentStep: number;
  steps: {
    number: number;
    title: string;
    description: string;
    detailedDescription?: string;
    isOptional?: boolean;
  }[];
}

export default function WizardSteps({ currentStep, steps }: WizardStepsProps) {
  return (
    <div className="w-full mt-8 md:mt-12 mb-12 md:mb-16 px-2">
      {/* Circles and Connectors Row */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          
          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step Circle */}
              <div
                style={{
                  backgroundColor: currentStep >= step.number 
                    ? 'hsl(var(--primary))' 
                    : 'hsl(var(--muted))',
                  color: currentStep >= step.number ? '#FFFFFF' : 'hsl(var(--muted-foreground))',
                  transform: isActive ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: isActive 
                    ? '0 0 0 3px rgba(47, 143, 165, 0.2)' 
                    : 'none',
                }}
                className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-base transition-all duration-500 flex-shrink-0 relative z-10 ${
                  isActive ? 'shadow-md' : 'shadow-sm'
                }`}
                data-testid={`wizard-step-${step.number}`}
              >
                {isCompleted ? (
                  <Check className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 animate-in zoom-in duration-300" strokeWidth={3} />
                ) : (
                  step.number
                )}
              </div>

              {/* Horizontal Connector Line (hidden for last step) */}
              {index < steps.length - 1 && (
                <div className="flex-1 flex items-center ml-2 sm:ml-3 md:ml-4 mr-2 sm:mr-3 md:mr-4 h-1">
                  <div
                    style={{
                      backgroundColor: currentStep > step.number 
                        ? 'hsl(var(--primary))' 
                        : 'hsl(var(--muted))',
                    }}
                    className="h-1 w-full transition-all duration-500 rounded-full"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labels Row */}
      <div className="flex items-stretch justify-between gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          
          return (
            <div key={`label-${step.number}`} className="flex flex-col items-center flex-1 min-w-0">
              <div className="text-center w-full px-1">
                <div
                  className={`text-xs sm:text-xs md:text-sm font-semibold transition-all duration-300 line-clamp-2 ${
                    isActive
                      ? "text-foreground"
                      : isCompleted
                      ? "text-foreground/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title}
                </div>
                {step.detailedDescription && (
                  <div className={`text-xs leading-tight hidden sm:block line-clamp-2 transition-all duration-300 mt-0.5 ${
                    isActive
                      ? "text-foreground/60"
                      : "text-muted-foreground/60"
                  }`}>
                    {step.detailedDescription}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
