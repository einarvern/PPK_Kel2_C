import React from 'react';
import type { Task, TaskStatus } from '../../types';
import { PriorityBadge } from '../ui/badge';
import {
    CheckCircleIcon,
    CircleIcon,
    CalendarIcon,
    ClockIcon,
    AlertTriangleIcon,
    EditIcon,
    TrashIcon,
} from '../ui/icons';

const formatDateOnly = (value?: string | null) =>
    value ? value.slice(0, 10) : '';

interface TaskCardProps {
    task: Task;
    onToggleStatus: (task: Task) => void;
    onChangeStatus: (task: Task, newStatus: TaskStatus) => void;
    onEdit: (task: Task) => void;
    onDelete: (task: Task) => void;
}

export function TaskCard({
    task,
    onToggleStatus,
    onChangeStatus,
    onEdit,
    onDelete,
}: TaskCardProps) {
    const isCompleted = task.status === 'done';

    // Deadline indicators
    const isOverdue =
        task.is_overdue ??
        (task.deadline &&
            !isCompleted &&
            new Date(task.deadline).getTime() <
                new Date().setHours(0, 0, 0, 0));

    const isDueSoon =
        task.is_due_soon ??
        (task.deadline &&
            !isCompleted &&
            !isOverdue &&
            new Date(task.deadline).getTime() - new Date().getTime() <
                3 * 24 * 60 * 60 * 1000);

    return (
        <div
            className={`rounded-xl border bg-white p-4 shadow-xs transition-all dark:bg-slate-900 ${
                isCompleted
                    ? 'border-emerald-200/60 bg-emerald-50/20 dark:border-emerald-900/30'
                    : isOverdue
                      ? 'border-rose-300 dark:border-rose-900/60'
                      : 'border-slate-200 dark:border-slate-800'
            } group hover:shadow-md`}
        >
            {/* Top: Checkbox toggle & Title */}
            <div className="flex items-start gap-3">
                <button
                    type="button"
                    onClick={() => onToggleStatus(task)}
                    className={`mt-0.5 shrink-0 cursor-pointer rounded-full transition-colors ${
                        isCompleted
                            ? 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                            : 'text-slate-300 hover:text-emerald-600 dark:text-slate-600'
                    }`}
                    title={
                        isCompleted ? 'Tandai belum selesai' : 'Tandai selesai'
                    }
                >
                    {isCompleted ? (
                        <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                        <CircleIcon className="h-5 w-5" />
                    )}
                </button>

                <div className="min-w-0 flex-1">
                    <h4
                        className={`text-sm leading-snug font-semibold break-words ${
                            isCompleted
                                ? 'text-slate-400 line-through dark:text-slate-500'
                                : 'text-slate-900 dark:text-slate-100'
                        }`}
                    >
                        {task.title}
                    </h4>

                    {task.description && (
                        <p
                            className={`mt-1.5 line-clamp-2 text-xs ${
                                isCompleted
                                    ? 'text-slate-400 line-through dark:text-slate-500'
                                    : 'text-slate-500 dark:text-slate-400'
                            }`}
                        >
                            {task.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Badges & Meta */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
                <PriorityBadge priority={task.priority} />

                {task.deadline && (
                    <div
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium ${
                            isOverdue
                                ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-950/40 dark:text-rose-300'
                                : isDueSoon
                                  ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300'
                                  : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                        title={
                            isOverdue
                                ? 'Tenggat waktu telah terlewat!'
                                : isDueSoon
                                  ? 'Mendekati tenggat waktu (< 3 hari)'
                                  : 'Tenggat waktu tugas'
                        }
                    >
                        {isOverdue ? (
                            <AlertTriangleIcon className="h-3.5 w-3.5 text-rose-600" />
                        ) : isDueSoon ? (
                            <ClockIcon className="h-3.5 w-3.5 text-amber-600" />
                        ) : (
                            <CalendarIcon className="h-3.5 w-3.5 text-slate-400" />
                        )}
                        <span>{formatDateOnly(task.deadline)}</span>
                    </div>
                )}
            </div>

            {/* Bottom Actions */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs dark:border-slate-800">
                {/* Status Quick Switch */}
                <select
                    value={task.status}
                    onChange={(e) =>
                        onChangeStatus(task, e.target.value as TaskStatus)
                    }
                    className="cursor-pointer rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                >
                    <option value="todo">Belum dikerjakan</option>
                    <option value="in_progress">Sedang dikerjakan</option>
                    <option value="done">Selesai</option>
                </select>

                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onEdit(task)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                        title="Edit Tugas"
                    >
                        <EditIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                        type="button"
                        onClick={() => onDelete(task)}
                        className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                        title="Hapus Tugas"
                    >
                        <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
