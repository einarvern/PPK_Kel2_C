import React from 'react';
import type { TaskPriority, TaskFilter } from '../../types';
import {
    SearchIcon,
    FilterIcon,
    ClockIcon,
    AlertTriangleIcon,
} from '../ui/icons';

interface TaskFilterBarProps {
    filter: TaskFilter;
    onChange: (filter: TaskFilter) => void;
    dueSoonCount: number;
    overdueCount: number;
}

export function TaskFilterBar({
    filter,
    onChange,
    dueSoonCount,
    overdueCount,
}: TaskFilterBarProps) {
    return (
        <div className="flex flex-col items-stretch justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs md:flex-row md:items-center dark:border-slate-800 dark:bg-slate-900">
            {/* Search Input */}
            <div className="relative flex-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <SearchIcon className="h-4 w-4" />
                </div>
                <input
                    type="text"
                    placeholder="Cari tugas berdasarkan judul..."
                    value={filter.search || ''}
                    onChange={(e) =>
                        onChange({ ...filter, search: e.target.value })
                    }
                    className="w-full rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 pr-3 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-500"
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5">
                    <FilterIcon className="h-3.5 w-3.5 text-slate-400" />
                    <select
                        value={filter.sort || 'default'}
                        onChange={(e) =>
                            onChange({
                                ...filter,
                                sort: e.target.value as TaskFilter['sort'],
                            })
                        }
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                        aria-label="Urutkan tugas"
                    >
                        <option value="default">Urutan awal</option>
                        <option value="priority_desc">
                            Prioritas: tinggi → rendah
                        </option>
                        <option value="priority_asc">
                            Prioritas: rendah → tinggi
                        </option>
                        <option value="deadline_asc">Deadline: terdekat</option>
                        <option value="deadline_desc">Deadline: terjauh</option>
                    </select>
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-1.5">
                    <FilterIcon className="h-3.5 w-3.5 text-slate-400" />
                    <select
                        value={filter.priority || 'all'}
                        onChange={(e) =>
                            onChange({
                                ...filter,
                                priority: e.target.value as
                                    | TaskPriority
                                    | 'all',
                            })
                        }
                        className="cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                    >
                        <option value="all">Semua Prioritas</option>
                        <option value="high">Prioritas Tinggi</option>
                        <option value="medium">Prioritas Sedang</option>
                        <option value="low">Prioritas Rendah</option>
                    </select>
                </div>

                {/* Quick Deadline Toggles */}
                <div className="flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-800 dark:bg-slate-800/50">
                    <button
                        type="button"
                        onClick={() =>
                            onChange({ ...filter, deadline_filter: 'all' })
                        }
                        className={`cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            !filter.deadline_filter ||
                            filter.deadline_filter === 'all'
                                ? 'bg-white text-emerald-700 shadow-2xs dark:bg-slate-700 dark:text-emerald-300'
                                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
                        }`}
                    >
                        Semua
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onChange({
                                ...filter,
                                deadline_filter:
                                    filter.deadline_filter === 'due_soon'
                                        ? 'all'
                                        : 'due_soon',
                            })
                        }
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            filter.deadline_filter === 'due_soon'
                                ? 'bg-amber-100 text-amber-900 shadow-2xs dark:bg-amber-950 dark:text-amber-200'
                                : 'text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30'
                        }`}
                        title="Tugas yang mendekati tenggat waktu (< 3 hari)"
                    >
                        <ClockIcon className="h-3 w-3" />
                        <span>Mendekati</span>
                        {dueSoonCount > 0 && (
                            <span className="ml-0.5 rounded-full bg-amber-200 px-1 text-[10px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                                {dueSoonCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            onChange({
                                ...filter,
                                deadline_filter:
                                    filter.deadline_filter === 'overdue'
                                        ? 'all'
                                        : 'overdue',
                            })
                        }
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                            filter.deadline_filter === 'overdue'
                                ? 'bg-rose-100 text-rose-900 shadow-2xs dark:bg-rose-950 dark:text-rose-200'
                                : 'text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30'
                        }`}
                        title="Tugas yang melewati tenggat waktu"
                    >
                        <AlertTriangleIcon className="h-3 w-3" />
                        <span>Lewat</span>
                        {overdueCount > 0 && (
                            <span className="ml-0.5 rounded-full bg-rose-200 px-1 text-[10px] font-bold text-rose-800 dark:bg-rose-900 dark:text-rose-300">
                                {overdueCount}
                            </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
