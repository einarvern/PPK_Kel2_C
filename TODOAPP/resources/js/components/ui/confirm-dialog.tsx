import React from 'react';
import { Modal } from './modal';
import { Button } from './button';
import { AlertTriangleIcon } from './icons';

export interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
    isLoading?: boolean;
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Hapus',
    cancelText = 'Batal',
    variant = 'danger',
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
            <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                    <AlertTriangleIcon className="h-5 w-5" />
                </div>
                <div>
                    <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {message}
                    </p>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-2.5">
                <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
                    {cancelText}
                </Button>
                <Button
                    variant={variant === 'danger' ? 'danger' : 'primary'}
                    size="sm"
                    onClick={onConfirm}
                    isLoading={isLoading}
                >
                    {confirmText}
                </Button>
            </div>
        </Modal>
    );
}
