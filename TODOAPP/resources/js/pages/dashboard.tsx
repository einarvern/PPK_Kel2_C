import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import type { Project } from '../types';
import { AppLayout } from '../layouts/app-layout';
import { ProjectCard } from '../components/projects/project-card';
import { ProjectFormModal } from '../components/projects/project-form-modal';
import { Button } from '../components/ui/button';
import {
    PlusIcon,
    FolderIcon,
    CheckCircleIcon,
    ClockIcon,
    UsersIcon,
} from '../components/ui/icons';

interface DashboardProps {
    projects?: Project[];
}

// Initial default mock data in accordance with PRD for instant preview and testing
const defaultMockProjects: Project[] = [
    {
        id: 1,
        name: 'Pengembangan Web TaskTeam (Jara)',
        description: 'Pengerjaan tugas besar praktikum PPK: implementasi sistem autentikasi, manajemen proyek, dan task board.',
        owner_id: 1,
        created_at: '2026-09-01',
        members_count: 3,
        tasks_count: 6,
        completed_tasks_count: 4,
        progress_percentage: 67,
        is_owner: true,
    },
    {
        id: 2,
        name: 'Desain Sistem Basis Data & ERD',
        description: 'Perancangan skema relasional tabel User, Project, ProjectMember, dan Task.',
        owner_id: 1,
        created_at: '2026-09-05',
        members_count: 2,
        tasks_count: 3,
        completed_tasks_count: 3,
        progress_percentage: 100,
        is_owner: true,
    },
    {
        id: 3,
        name: 'Integrasi API & Pengujian Endpoints',
        description: 'Proyek kolaborasi bersama Programmer 1 dan 2 untuk pengujian kontrak endpoint REST API.',
        owner_id: 2,
        created_at: '2026-09-08',
        members_count: 3,
        tasks_count: 5,
        completed_tasks_count: 1,
        progress_percentage: 20,
        is_owner: false,
    },
];

export default function Dashboard({ projects: propProjects }: DashboardProps) {
    const [projectList, setProjectList] = useState<Project[]>(
        propProjects && propProjects.length > 0 ? propProjects : defaultMockProjects
    );

    const [activeTab, setActiveTab] = useState<'all' | 'owned' | 'member'>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filter projects according to tab
    const filteredProjects = projectList.filter((p) => {
        if (activeTab === 'owned') return p.is_owner === true;
        if (activeTab === 'member') return p.is_owner === false;
        return true;
    });

    // Metric Calculations
    const totalProjects = projectList.length;
    const ownedProjects = projectList.filter((p) => p.is_owner).length;
    const memberProjects = projectList.filter((p) => !p.is_owner).length;
    const totalTasks = projectList.reduce((acc, curr) => acc + (curr.tasks_count ?? 0), 0);
    const totalCompletedTasks = projectList.reduce(
        (acc, curr) => acc + (curr.completed_tasks_count ?? 0),
        0
    );
    const overallProgress =
        totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0;

    const handleCreateProject = (data: { name: string; description: string }) => {
        setIsSubmitting(true);
        // Try posting to backend if available
        router.post('/projects', data, {
            onError: () => {
                // Client-side preview fallback
                const newProj: Project = {
                    id: Date.now(),
                    name: data.name,
                    description: data.description,
                    owner_id: 1,
                    created_at: new Date().toISOString().split('T')[0],
                    members_count: 1,
                    tasks_count: 0,
                    completed_tasks_count: 0,
                    progress_percentage: 0,
                    is_owner: true,
                };
                setProjectList([newProj, ...projectList]);
                setIsCreateModalOpen(false);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setIsSubmitting(false);
            },
            onFinish: () => {
                setIsSubmitting(false);
            },
        });
    };

    return (
        <AppLayout
            title="Dashboard Proyek"
            headerAction={
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="shadow-sm"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Buat Proyek Baru</span>
                </Button>
            }
        >
            <Head title="Dashboard - TaskTeam" />

            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Total Proyek
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                            <FolderIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {totalProjects}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                        {ownedProjects} milik Anda &bull; {memberProjects} kolaborasi
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Total Tugas
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                            <ClockIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {totalTasks}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                        {totalTasks - totalCompletedTasks} tugas sedang berjalan
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Tugas Selesai
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <CheckCircleIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {totalCompletedTasks}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Dari seluruh proyek</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Rata-Rata Progres
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <span className="text-xs font-bold">%</span>
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {overallProgress}%
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">
                        Penyelesaian tugas keseluruhan
                    </p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-6 dark:border-slate-800">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab('all')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                            activeTab === 'all'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        Semua Proyek ({totalProjects})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('owned')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                            activeTab === 'owned'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        Proyek Saya ({ownedProjects})
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('member')}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
                            activeTab === 'member'
                                ? 'bg-indigo-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                        }`}
                    >
                        Proyek yang Diikuti ({memberProjects})
                    </button>
                </div>
            </div>

            {/* Project Cards Grid */}
            {filteredProjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center dark:border-slate-800">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 mb-3">
                        <FolderIcon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                        Belum Ada Proyek pada Kategori Ini
                    </h3>
                    <p className="mt-1 text-sm text-slate-400 max-w-sm">
                        Mulai organisir tugas tim Anda dengan membuat proyek pertama sekarang.
                    </p>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setIsCreateModalOpen(true)}
                        className="mt-4"
                    >
                        <PlusIcon className="h-4 w-4" />
                        <span>Buat Proyek Baru</span>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <ProjectCard key={project.id} project={project} />
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            <ProjectFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateProject}
                isLoading={isSubmitting}
            />
        </AppLayout>
    );
}
