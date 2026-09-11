import React from 'react';
import type { Task, TaskStatus } from '../../types';
import { TaskCard } from './task-card';
import { PlusIcon } from '../ui/icons';

interface TaskColumnProps {
    status: TaskStatus;
    tasks: Task[];
    onAddTask: (status: TaskStatus) => void;
    onToggleStatus: (task: Task) => void;
    onChangeStatus: (task: Task, newStatus: TaskStatus) => void;
    onEditTask: (task: Task) => void;
    onDeleteTask: (task: Task) => void;
}

export function TaskColumn({
    status,
    tasks,
    onAddTask,
    onToggleStatus,
    onChangeStatus,
    onEditTask,
    onDeleteTask,
}: TaskColumnProps) {
    const getColumnMeta = () => {
        switch (status) {
            case 'todo':
                return {
                    title: 'Belum Dikerjakan',
                    dotColor: 'bg-slate-400',
                    headerBg: 'bg-slate-100 dark:bg-slate-800/80',
                    badgeBg: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
                };
            case 'in_progress':
                return {
                    title: 'Sedang Dikerjakan',
                    dotColor: 'bg-indigo-500',
                    headerBg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
                    badgeBg: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300',
                };
            case 'done':
                return {
                    title: 'Selesai',
                    dotColor: 'bg-emerald-500',
                    headerBg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
                    badgeBg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
                };
        }
    };

    const meta = getColumnMeta();

    return (
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${meta.dotColor}`} />
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {meta.title}
                    </h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${meta.badgeBg}`}>
                        {tasks.length}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={() => onAddTask(status)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-indigo-600 dark:hover:bg-slate-800 shadow-2xs transition-all cursor-pointer"
                    title={`Tambah tugas ke ${meta.title}`}
                >
                    <PlusIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Tasks Container */}
            <div className="flex-1 space-y-3 min-h-[160px] overflow-y-auto">
                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-36 rounded-xl border border-dashed border-slate-200 p-4 text-center dark:border-slate-800">
                        <p className="text-xs text-slate-400">Tidak ada tugas pada kolom ini</p>
                        <button
                            type="button"
                            onClick={() => onAddTask(status)}
                            className="mt-2 text-xs font-medium text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
                        >
                            + Tambah sekarang
                        </button>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onToggleStatus={onToggleStatus}
                            onChangeStatus={onChangeStatus}
                            onEdit={onEditTask}
                            onDelete={onDeleteTask}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
