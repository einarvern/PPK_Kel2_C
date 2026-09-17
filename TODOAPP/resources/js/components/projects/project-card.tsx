import React from 'react';
import { Link } from '@inertiajs/react';
import type { Project } from '../../types';
import { ProgressBar } from '../ui/progress-bar';
import { UsersIcon, FolderIcon } from '../ui/icons';

interface ProjectCardProps {
    project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const isOwner = project.is_owner ?? true;
    const completedTasks = project.completed_tasks_count ?? 0;
    const totalTasks = project.tasks_count ?? 0;
    const membersCount = project.members_count ?? 1;

    return (
        <div className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div>
                {/* Header: Type Tag & Options */}
                <div className="mb-3 flex items-center justify-between gap-2">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isOwner
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                    >
                        {isOwner ? 'Pemilik Proyek' : 'Anggota Tim'}
                    </span>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <UsersIcon className="h-3.5 w-3.5" />
                        <span>{membersCount} anggota</span>
                    </div>
                </div>

                {/* Title & Description */}
                <Link
                    href={`/projects/${project.id}`}
                    className="block transition-colors group-hover:text-emerald-600"
                >
                    <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
                        <FolderIcon className="h-5 w-5 shrink-0 text-emerald-600" />
                        <span className="truncate">{project.name}</span>
                    </h3>
                </Link>

                <p className="mt-2 line-clamp-2 min-h-10 text-sm text-slate-500 dark:text-slate-400">
                    {project.description || 'Tidak ada deskripsi proyek.'}
                </p>
            </div>

            {/* Progress Bar & Footer */}
            <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                <ProgressBar
                    completed={completedTasks}
                    total={totalTasks}
                    size="sm"
                    className="mb-3"
                />

                <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Dibuat: {project.created_at}</span>
                    <Link
                        href={`/projects/${project.id}`}
                        className="font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                    >
                        Buka Board &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
