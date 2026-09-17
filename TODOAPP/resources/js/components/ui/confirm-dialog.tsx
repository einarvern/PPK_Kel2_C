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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="sm"
            className="max-w-xs p-4"
        >
            <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
                    <AlertTriangleIcon className="h-4 w-4" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {title}
                    </h4>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {message}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
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
