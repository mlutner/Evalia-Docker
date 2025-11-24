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
      <div className="flex items-stretch justify-between gap-1 sm:gap-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.number;
          const isActive = currentStep === step.number;
          
          return (
            <div key={step.number} className="flex flex-col items-center flex-1 min-w-0">
              {/* Step Circle and Label */}
              <div className="flex flex-col items-center flex-shrink-0 w-full">
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
                  className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm md:text-base transition-all duration-500 flex-shrink-0 relative z-10 mx-auto ${
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
                <div className="mt-2 sm:mt-2 md:mt-3 text-center w-full px-1">
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
                    <div className={`text-xs leading-tight hidden md:block line-clamp-1 transition-all duration-300 mt-0.5 ${
                      isActive
                        ? "text-foreground/60"
                        : "text-muted-foreground/60"
                    }`}>
                      {step.detailedDescription}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line (bottom, hidden for last step) */}
              {index < steps.length - 1 && (
                <div className="w-full h-1 mt-2 sm:mt-2 md:mt-3 flex items-center px-1 flex-1">
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
    </div>
  );
}
