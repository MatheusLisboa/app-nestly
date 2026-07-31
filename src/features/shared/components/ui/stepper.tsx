import { Check } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export type StepperStep = {
  id: string;
  label: string;
  description?: string;
};

interface StepperProps extends HTMLAttributes<HTMLDivElement> {
  steps: StepperStep[];
  currentStep: number;
}

export function Stepper({ steps, currentStep, className, ...props }: StepperProps) {
  return (
    <div className={cn("w-full", className)} {...props}>
      <ol className="flex w-full items-start gap-2">
        {steps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;

          return (
            <li key={step.id} className="flex flex-1 flex-col gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-soft",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-primary-soft text-primary ring-2 ring-primary/30",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <Icon icon={Check} size="xs" /> : index + 1}
                </span>
                {index < steps.length - 1 ? (
                  <span
                    className={cn("h-px flex-1 rounded-full", done ? "bg-primary" : "bg-border")}
                    aria-hidden
                  />
                ) : null}
              </div>
              <div className="pr-2">
                <p
                  className={cn(
                    "text-xs font-medium tracking-tight",
                    active || done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {step.label}
                </p>
                {step.description ? (
                  <p className="text-[11px] text-muted-foreground">{step.description}</p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
