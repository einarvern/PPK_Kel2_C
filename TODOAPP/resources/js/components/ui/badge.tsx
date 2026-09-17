import React from 'react';
import { cn } from '../../lib/utils';
import type { TaskPriority, TaskStatus, Role } from '../../types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
    size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
    const variants = {
        default: 'bg-slate-100 text-slate-700 ring-slate-600/20 dark:bg-slate-800 dark:text-slate-300',
        success: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300',
        warning: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300',
        danger: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-950/40 dark:text-rose-300',
        info: 'bg-teal-50 text-teal-700 ring-teal-600/20 dark:bg-teal-950/40 dark:text-teal-300',
        purple: 'bg-purple-50 text-purple-700 ring-purple-600/20 dark:bg-purple-950/40 dark:text-purple-300',
    };

    const sizes = {
        sm: 'px-1.5 py-0.5 text-xs font-medium',
        md: 'px-2.5 py-1 text-xs font-semibold',
    };

    return (
        <span
            className={cn(
                'inline-flex items-center rounded-md ring-1 ring-inset',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}

export function PriorityBadge({ priority, className }: { priority: TaskPriority; className?: string }) {
    if (priority === 'high') {
        return <Badge variant="danger" className={className}>Prioritas Tinggi</Badge>;
    }
    if (priority === 'medium') {
        return <Badge variant="warning" className={className}>Prioritas Sedang</Badge>;
    }
    return <Badge variant="info" className={className}>Prioritas Rendah</Badge>;
}

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
    if (status === 'done') {
        return <Badge variant="success" className={className}>Selesai</Badge>;
    }
    if (status === 'in_progress') {
        return <Badge variant="info" className={className}>Sedang Dikerjakan</Badge>;
    }
    return <Badge variant="default" className={className}>Belum Dikerjakan</Badge>;
}

export function RoleBadge({ role, className }: { role: Role; className?: string }) {
    if (role === 'admin') {
        return <Badge variant="success" className={className}>Admin</Badge>;
    }
    return <Badge variant="default" className={className}>Pengguna</Badge>;
}
