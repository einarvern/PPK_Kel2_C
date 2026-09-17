import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import type { Project } from '../types';
import { AppLayout } from '../layouts/app-layout';
import { ProjectCard } from '../components/projects/project-card';
import { ProjectFormModal } from '../components/projects/project-form-modal';
import { Button } from '../components/ui/button';
import { Toast } from '../components/ui/toast';
import { FolderIcon, PlusIcon } from '../components/ui/icons';
import { firstError } from '../lib/errors';

interface DashboardProps {
    projects: Project[];
}

type ProjectFilter = 'all' | 'owned' | 'member';

export default function Dashboard({ projects }: DashboardProps) {
    const [activeFilter, setActiveFilter] = useState<ProjectFilter>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const ownedProjects = projects.filter((project) => project.is_owner);
    const memberProjects = projects.filter((project) => !project.is_owner);
    const filteredProjects =
        activeFilter === 'owned'
            ? ownedProjects
            : activeFilter === 'member'
              ? memberProjects
              : projects;

    const handleCreateProject = (data: {
        name: string;
        description: string;
    }) => {
        setError(null);
        setIsSubmitting(true);

        router.post('/projects', data, {
            onSuccess: () => setIsCreateModalOpen(false),
            onError: (errors) =>
                setError(firstError(errors, 'Project tidak dapat dibuat.')),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const filters: { key: ProjectFilter; label: string; count: number }[] = [
        { key: 'all', label: 'Semua project', count: projects.length },
        { key: 'owned', label: 'Milik saya', count: ownedProjects.length },
        { key: 'member', label: 'Kolaborasi', count: memberProjects.length },
    ];

    return (
        <AppLayout
            title="Workspace"
            headerAction={
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Project baru</span>
                </Button>
            }
        >
            <Head title="Dashboard · Jara" />

            {error && (
                <div className="mb-5">
                    <Toast
                        type="error"
                        message={error}
                        onClose={() => setError(null)}
                    />
                </div>
            )}

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    {filters.map((filter) => (
                        <button
                            key={filter.key}
                            type="button"
                            onClick={() => setActiveFilter(filter.key)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-3.5 ${
                                activeFilter === filter.key
                                    ? 'bg-emerald-600 text-white shadow-sm'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                            }`}
                        >
                            {filter.label}
                            <span
                                className={`ml-1.5 ${
                                    activeFilter === filter.key
                                        ? 'text-emerald-100'
                                        : 'text-slate-400'
                                }`}
                            >
                                {filter.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900/40">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
                        <FolderIcon className="h-6 w-6" />
                    </span>
                    <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
                        {activeFilter === 'member'
                            ? 'Belum ada project kolaborasi'
                            : 'Belum ada project'}
                    </h2>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        Buat project pertama untuk mulai mengatur tugasmu.
                    </p>
                    {activeFilter !== 'member' && (
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="mt-5"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Project baru
                        </Button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            <ProjectFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateProject}
                isLoading={isSubmitting}
            />
        </AppLayout>
    );
}
