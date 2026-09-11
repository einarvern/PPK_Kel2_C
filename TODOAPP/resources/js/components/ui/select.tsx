import React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDownIcon } from './icons';

export interface SelectOption {
    value: string | number;
    label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    error?: string;
    options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, label, error, options, children, id, ...props }, ref) => {
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

        return (
            <div className="w-full">
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1.5">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        id={selectId}
                        ref={ref}
                        className={cn(
                            'w-full appearance-none rounded-lg border border-slate-300 bg-white px-3.5 py-2 pr-10 text-sm text-slate-900',
                            'transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
                            'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
                            error && 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20',
                            className
                        )}
                        {...props}
                    >
                        {options
                            ? options.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                  </option>
                              ))
                            : children}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                        <ChevronDownIcon className="h-4 w-4" />
                    </div>
                </div>
                {error && <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>}
            </div>
        );
    }
);

Select.displayName = 'Select';
