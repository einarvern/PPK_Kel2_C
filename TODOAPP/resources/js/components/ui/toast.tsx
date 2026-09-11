import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircleIcon, AlertCircleIcon, XMarkIcon } from './icons';

export interface ToastProps {
    type?: 'success' | 'error' | 'info';
    message: string;
    onClose?: () => void;
    className?: string;
}

export function Toast({ type = 'success', message, onClose, className }: ToastProps) {
    const types = {
        success: {
            bg: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200',
            icon: <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0" />,
        },
        error: {
            bg: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-800 dark:text-rose-200',
            icon: <AlertCircleIcon className="h-5 w-5 text-rose-500 shrink-0" />,
        },
        info: {
            bg: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-200',
            icon: <AlertCircleIcon className="h-5 w-5 text-blue-500 shrink-0" />,
        },
    };

    const current = types[type];

    return (
        <div
            className={cn(
                'flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all',
                current.bg,
                className
            )}
        >
            <div className="flex items-center gap-3">
                {current.icon}
                <p className="text-sm font-medium">{message}</p>
            </div>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="ml-3 inline-flex rounded-lg p-1 hover:bg-black/5 focus:outline-none dark:hover:bg-white/10"
                >
                    <XMarkIcon className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
