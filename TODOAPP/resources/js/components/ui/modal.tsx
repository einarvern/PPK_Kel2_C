import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { XMarkIcon } from './icons';

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({
    isOpen,
    onClose,
    title,
    description,
    children,
    footer,
    maxWidth = 'md',
}: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const maxWidths = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Dialog Panel */}
            <div
                className={cn(
                    'relative w-full rounded-2xl bg-white p-6 shadow-2xl transition-all dark:bg-slate-900 border border-slate-200 dark:border-slate-800 z-10',
                    maxWidths[maxWidth]
                )}
            >
                {/* Header */}
                <div className="flex items-start justify-between pb-3">
                    <div>
                        {title && (
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {title}
                            </h3>
                        )}
                        {description && (
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                {description}
                            </p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="py-2">{children}</div>

                {/* Footer */}
                {footer && (
                    <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
}
