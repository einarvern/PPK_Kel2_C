import React from 'react';
import { cn } from '../../lib/utils';

export interface ProgressBarProps {
    completed: number;
    total: number;
    showLabel?: boolean;
    showCounter?: boolean;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

export function ProgressBar({
    completed,
    total,
    showLabel = true,
    showCounter = true,
    size = 'md',
    className,
}: ProgressBarProps) {
    // Formula from PRD: selesai / total * 100% (0% if total is 0)
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const heights = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const getProgressColor = () => {
        if (percentage === 100) return 'bg-emerald-500';
        if (percentage >= 50) return 'bg-indigo-600';
        if (percentage > 0) return 'bg-amber-500';
        return 'bg-slate-300 dark:bg-slate-700';
    };

    return (
        <div className={cn('w-full', className)}>
            {(showLabel || showCounter) && (
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    {showCounter && (
                        <span className="text-slate-600 dark:text-slate-300">
                            {completed} dari {total} tugas selesai
                        </span>
                    )}
                    {showLabel && (
                        <span className={cn('font-semibold', percentage === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200')}>
                            {percentage}%
                        </span>
                    )}
                </div>
            )}
            <div className={cn('w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800', heights[size])}>
                <div
                    className={cn('h-full transition-all duration-500 ease-out rounded-full', getProgressColor())}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
