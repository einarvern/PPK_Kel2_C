import React from 'react';
import { Link } from '@inertiajs/react';
import type { Project } from '../../types';
import { ProgressBar } from '../ui/progress-bar';
import { UsersIcon, FolderIcon } from '../ui/icons';

interface ProjectCardProps {
    project: Project;
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
}

export function ProjectCard({ project }: ProjectCardProps) {
    const isOwner = project.is_owner ?? true;
    const completedTasks = project.completed_tasks_count ?? 0;
    const totalTasks = project.tasks_count ?? 0;
    const membersCount = project.members_count ?? 1;

    return (
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 group">
            <div>
                {/* Header: Type Tag & Options */}
                <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            isOwner
                                ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
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
                    className="block group-hover:text-indigo-600 transition-colors"
                >
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <FolderIcon className="h-5 w-5 text-indigo-500 shrink-0" />
                        <span className="truncate">{project.name}</span>
                    </h3>
                </Link>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 min-h-10">
                    {project.description || 'Tidak ada deskripsi proyek.'}
                </p>
            </div>

            {/* Progress Bar & Footer */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                        className="font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                    >
                        Buka Board &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
}
