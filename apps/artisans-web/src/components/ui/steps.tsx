
import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description?: string;
}

interface StepsProps extends HTMLAttributes<HTMLDivElement> {
  steps: Step[];
  currentStep: number;
}

export const Steps = React.forwardRef<HTMLDivElement, StepsProps>(
  ({ steps, currentStep, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex w-full", className)} {...props}>
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={cn(
              "flex flex-1 flex-col items-center",
              index !== steps.length - 1 && "relative"
            )}
          >
            {/* Connecting line */}
            {index !== steps.length - 1 && (
              <div 
                className={cn(
                  "absolute top-5 left-[calc(50%+12px)] right-[calc(50%-12px)] h-0.5",
                  index < currentStep ? "bg-primary" : "bg-muted"
                )}
              />
            )}
            
            {/* Step marker */}
            <div 
              className={cn(
                "relative z-10 flex h-10 w-10 items-center justify-center rounded-full",
                index < currentStep 
                  ? "bg-primary text-primary-foreground" 
                  : index === currentStep 
                  ? "border-2 border-primary bg-background text-primary"
                  : "border-2 border-muted bg-background text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <CheckIcon className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            {/* Step title and description */}
            <div className="mt-2 text-center">
              <p 
                className={cn(
                  "text-sm font-medium",
                  index <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground max-w-[12rem] mx-auto">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
);

Steps.displayName = "Steps";

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
