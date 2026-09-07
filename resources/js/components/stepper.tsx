import { IconCheck } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

export interface StepperStep {
    step: number;
    title: string;
    description?: string;
}

interface StepperProps {
    steps: StepperStep[];
    modelValue: number;
    className?: string;
}

export default function Stepper({
    steps,
    modelValue,
    className,
}: StepperProps) {
    return (
        <div className={cn('w-full', className)}>
            <ol className="flex items-start">
                {steps.map((step, i) => {
                    const isCompleted = step.step < modelValue;
                    const isActive = step.step === modelValue;
                    const isLast = i === steps.length - 1;

                    return (
                        <li
                            key={step.step}
                            className={cn(
                                'flex items-start',
                                !isLast && 'flex-1',
                            )}
                        >
                            <div className="flex flex-col items-center">
                                <span
                                    className={cn(
                                        'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-medium',
                                        isCompleted &&
                                            'border-primary bg-primary text-primary-foreground',
                                        isActive &&
                                            'border-primary text-primary',
                                        !isCompleted &&
                                            !isActive &&
                                            'border-muted-foreground/30 text-muted-foreground',
                                    )}
                                >
                                    {isCompleted ? (
                                        <IconCheck className="h-4 w-4" />
                                    ) : (
                                        step.step
                                    )}
                                </span>
                                <div className="mt-2 max-w-35 text-center">
                                    <p
                                        className={cn(
                                            'text-sm font-medium',
                                            !isCompleted &&
                                                !isActive &&
                                                'text-muted-foreground',
                                        )}
                                    >
                                        {step.title}
                                    </p>
                                    {step.description && (
                                        <p className="text-xs text-muted-foreground">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {!isLast && (
                                <div
                                    className={cn(
                                        'mt-4 h-px flex-1',
                                        isCompleted
                                            ? 'bg-primary'
                                            : 'bg-muted-foreground/30',
                                    )}
                                />
                            )}
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
