import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import type {
    Project,
    Task,
    TaskStatus,
    TaskPriority,
    TaskFilter,
    ProjectMember,
} from '../../types';
import { AppLayout } from '../../layouts/app-layout';
import { TaskColumn } from '../../components/tasks/task-column';
import { TaskFormModal } from '../../components/tasks/task-form-modal';
import { TaskFilterBar } from '../../components/tasks/task-filter-bar';
import { MemberManageModal } from '../../components/projects/member-manage-modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { ProgressBar } from '../../components/ui/progress-bar';
import { Button } from '../../components/ui/button';
import {
    PlusIcon,
    UsersIcon,
    FolderIcon,
    CalendarIcon,
    CheckCircleIcon,
} from '../../components/ui/icons';

interface ProjectShowProps {
    project?: Project;
    tasks?: Task[];
    members?: ProjectMember[];
}

// Default mock data aligned with database migrations
const defaultMockProject: Project = {
    id: 1,
    name: 'Pengembangan Web TaskTeam (Jara)',
    description:
        'Aplikasi web untuk membantu pengguna mengelola tugas pribadi maupun tugas bersama dalam tim dengan indikator progres visual dan manajemen anggota.',
    owner_id: 1,
    created_at: '2026-09-01',
    is_owner: true,
};

const defaultMockMembers: ProjectMember[] = [
    {
        id: 101,
        project_id: 1,
        user_id: 2,
        user: {
            id: 2,
            name: 'Andi Pratama',
            email: 'andi@taskteam.test',
            role: 'user',
            created_at: '2026-09-02',
        },
        joined_at: '2026-09-03',
    },
    {
        id: 102,
        project_id: 1,
        user_id: 3,
        user: {
            id: 3,
            name: 'Siti Nurhaliza',
            email: 'siti@taskteam.test',
            role: 'user',
            created_at: '2026-09-03',
        },
        joined_at: '2026-09-04',
    },
];

const defaultMockTasks: Task[] = [
    {
        id: 1,
        project_id: 1,
        title: 'Desain Wireframe UI/UX & Layout Responsif',
        description: 'Menyusun wireframe halaman login, dashboard, task board, dan admin panel.',
        priority: 'high',
        status: 'done',
        deadline: '2026-09-05',
        created_at: '2026-09-02',
    },
    {
        id: 2,
        project_id: 1,
        title: 'Setup Laravel Starter Kit & Inertia React',
        description: 'Inisialisasi repository, Tailwind CSS v4, dan struktur komponen TypeScript.',
        priority: 'high',
        status: 'done',
        deadline: '2026-09-08',
        created_at: '2026-09-03',
    },
    {
        id: 3,
        project_id: 1,
        title: 'Implementasi Halaman Board Tugas & Filter',
        description: 'Membangun kolom Kanban, filter status & prioritas, serta pemantauan deadline.',
        priority: 'medium',
        status: 'in_progress',
        deadline: '2026-09-12', // Due soon!
        is_due_soon: true,
        created_at: '2026-09-05',
    },
    {
        id: 4,
        project_id: 1,
        title: 'Review Skema Basis Data & Aturan Foreign Key',
        description: 'Pengecekan relasi tabel User, Project, ProjectMember, dan Task.',
        priority: 'low',
        status: 'in_progress',
        deadline: '2026-09-10', // Overdue!
        is_overdue: true,
        created_at: '2026-09-06',
    },
    {
        id: 5,
        project_id: 1,
        title: 'Integrasi Endpoint API Programmer 1 & 2',
        description: 'Menghubungkan tombol dan form di UI ke API backend setelah selesai dikembangkan.',
        priority: 'high',
        status: 'todo',
        deadline: '2026-09-20',
        created_at: '2026-09-07',
    },
];

export default function ProjectShow({
    project: propProject,
    tasks: propTasks,
    members: propMembers,
}: ProjectShowProps) {
    const project = propProject || defaultMockProject;
    const [taskList, setTaskList] = useState<Task[]>(
        propTasks && propTasks.length > 0 ? propTasks : defaultMockTasks
    );
    const [memberList, setMemberList] = useState<ProjectMember[]>(
        propMembers || defaultMockMembers
    );

    // Filter State
    const [filter, setFilter] = useState<TaskFilter>({
        search: '',
        priority: 'all',
        status: 'all',
        deadline_filter: 'all',
    });

    // Modals State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskModalDefaultStatus, setTaskModalDefaultStatus] =
        useState<TaskStatus>('todo');
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

    // Delete Confirm Dialog State
    const [deleteTargetTask, setDeleteTargetTask] = useState<Task | null>(null);

    // Dynamic Progress Calculation (Formula PRD: Selesai / Total * 100%)
    const totalTasks = taskList.length;
    const completedTasks = taskList.filter((t) => t.status === 'done').length;
    const inProgressTasks = taskList.filter((t) => t.status === 'in_progress').length;
    const pendingTasks = taskList.filter((t) => t.status === 'todo').length;
    const progressPercentage =
        totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Deadline counters
    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);

    const isOverdueCheck = (task: Task) =>
        Boolean(
            task.deadline &&
                task.status !== 'done' &&
                new Date(task.deadline).getTime() < today
        );

    const isDueSoonCheck = (task: Task) =>
        Boolean(
            task.deadline &&
                task.status !== 'done' &&
                !isOverdueCheck(task) &&
                new Date(task.deadline).getTime() - now.getTime() < 3 * 24 * 60 * 60 * 1000
        );

    const overdueCount = taskList.filter(isOverdueCheck).length;
    const dueSoonCount = taskList.filter(isDueSoonCheck).length;

    // Filtered Tasks
    const filteredTasks = taskList.filter((task) => {
        // Search
        if (filter.search && !task.title.toLowerCase().includes(filter.search.toLowerCase())) {
            return false;
        }
        // Priority
        if (filter.priority && filter.priority !== 'all' && task.priority !== filter.priority) {
            return false;
        }
        // Deadline quick toggle
        if (filter.deadline_filter === 'overdue' && !isOverdueCheck(task)) {
            return false;
        }
        if (filter.deadline_filter === 'due_soon' && !isDueSoonCheck(task)) {
            return false;
        }
        return true;
    });

    // Task Actions
    const handleToggleStatus = (task: Task) => {
        const nextStatus: TaskStatus = task.status === 'done' ? 'in_progress' : 'done';
        handleChangeStatus(task, nextStatus);
    };

    const handleChangeStatus = (task: Task, newStatus: TaskStatus) => {
        setTaskList((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
        );
        router.patch(`/tasks/${task.id}`, { status: newStatus }, { preserveScroll: true, onError: () => {} });
    };

    const handleSaveTask = (data: {
        title: string;
        description: string;
        priority: TaskPriority;
        status: TaskStatus;
        deadline: string | null;
    }) => {
        if (selectedTask) {
            setTaskList((prev) =>
                prev.map((t) => (t.id === selectedTask.id ? { ...t, ...data } : t))
            );
            router.put(`/tasks/${selectedTask.id}`, data, { preserveScroll: true, onError: () => {} });
        } else {
            const newTask: Task = {
                id: Date.now(),
                project_id: project.id,
                title: data.title,
                description: data.description,
                priority: data.priority,
                status: data.status,
                deadline: data.deadline,
                created_at: new Date().toISOString().split('T')[0],
            };
            setTaskList((prev) => [newTask, ...prev]);
            router.post(`/projects/${project.id}/tasks`, data, { preserveScroll: true, onError: () => {} });
        }
        setIsTaskModalOpen(false);
        setSelectedTask(null);
    };

    const handleDeleteTaskConfirm = () => {
        if (!deleteTargetTask) return;
        setTaskList((prev) => prev.filter((t) => t.id !== deleteTargetTask.id));
        router.delete(`/tasks/${deleteTargetTask.id}`, { preserveScroll: true, onError: () => {} });
        setDeleteTargetTask(null);
    };

    // Member Actions
    const handleAddMember = (email: string) => {
        const newMember: ProjectMember = {
            id: Date.now(),
            project_id: project.id,
            user_id: Date.now() + 1,
            user: {
                id: Date.now() + 1,
                name: email.split('@')[0],
                email: email,
                role: 'user',
                created_at: new Date().toISOString().split('T')[0],
            },
            joined_at: new Date().toISOString().split('T')[0],
        };
        setMemberList((prev) => [...prev, newMember]);
        router.post(`/projects/${project.id}/members`, { email }, { preserveScroll: true, onError: () => {} });
    };

    const handleRemoveMember = (memberId: number) => {
        setMemberList((prev) => prev.filter((m) => m.id !== memberId));
        router.delete(`/projects/${project.id}/members/${memberId}`, { preserveScroll: true, onError: () => {} });
    };

    const isOwner = project.is_owner ?? true;

    return (
        <AppLayout>
            <Head title={`${project.name} - TaskTeam`} />

            {/* Breadcrumbs & Navigation */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
                    Dashboard
                </Link>
                <span>/</span>
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {project.name}
                </span>
            </div>

            {/* Project Header Banner */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    isOwner
                                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300'
                                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                }`}
                            >
                                {isOwner ? 'Pemilik Proyek (Owner)' : 'Anggota Proyek (Member)'}
                            </span>
                            {project.created_at && (
                                <span className="text-xs text-slate-400">
                                    Dibuat: {project.created_at}
                                </span>
                            )}
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                            <FolderIcon className="h-7 w-7 text-indigo-500 shrink-0" />
                            <span>{project.name}</span>
                        </h1>

                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
                            {project.description || 'Tidak ada deskripsi proyek.'}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                        {isOwner && (
                            <Button
                                variant="outline"
                                onClick={() => setIsMemberModalOpen(true)}
                                className="shadow-2xs"
                            >
                                <UsersIcon className="h-4 w-4 text-slate-500" />
                                <span>Kelola Anggota ({memberList.length + 1})</span>
                            </Button>
                        )}

                        <Button
                            variant="primary"
                            onClick={() => {
                                setSelectedTask(null);
                                setTaskModalDefaultStatus('todo');
                                setIsTaskModalOpen(true);
                            }}
                            className="shadow-sm"
                        >
                            <PlusIcon className="h-4 w-4" />
                            <span>Tambah Tugas</span>
                        </Button>
                    </div>
                </div>

                {/* Visual Progress Bar Section */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                        <div className="md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                    <CheckCircleIcon className="h-4 w-4 text-indigo-600" />
                                    Progres Penyelesaian Proyek
                                </span>
                                <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                    {progressPercentage}%
                                </span>
                            </div>
                            <ProgressBar
                                completed={completedTasks}
                                total={totalTasks}
                                showLabel={false}
                                showCounter={false}
                                size="lg"
                            />
                        </div>

                        {/* Status Breakdown Counters */}
                        <div className="flex items-center justify-around gap-2 text-center bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="text-base font-bold text-slate-700 dark:text-slate-300">
                                    {pendingTasks}
                                </div>
                                <div className="text-[11px] text-slate-400">Belum</div>
                            </div>
                            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
                            <div>
                                <div className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                                    {inProgressTasks}
                                </div>
                                <div className="text-[11px] text-slate-400">Sedang</div>
                            </div>
                            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
                            <div>
                                <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                                    {completedTasks}
                                </div>
                                <div className="text-[11px] text-slate-400">Selesai</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="mb-6">
                <TaskFilterBar
                    filter={filter}
                    onChange={setFilter}
                    dueSoonCount={dueSoonCount}
                    overdueCount={overdueCount}
                />
            </div>

            {/* 3-Column Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TaskColumn
                    status="todo"
                    tasks={filteredTasks.filter((t) => t.status === 'todo')}
                    onAddTask={(st) => {
                        setSelectedTask(null);
                        setTaskModalDefaultStatus(st);
                        setIsTaskModalOpen(true);
                    }}
                    onToggleStatus={handleToggleStatus}
                    onChangeStatus={handleChangeStatus}
                    onEditTask={(t) => {
                        setSelectedTask(t);
                        setIsTaskModalOpen(true);
                    }}
                    onDeleteTask={(t) => setDeleteTargetTask(t)}
                />

                <TaskColumn
                    status="in_progress"
                    tasks={filteredTasks.filter((t) => t.status === 'in_progress')}
                    onAddTask={(st) => {
                        setSelectedTask(null);
                        setTaskModalDefaultStatus(st);
                        setIsTaskModalOpen(true);
                    }}
                    onToggleStatus={handleToggleStatus}
                    onChangeStatus={handleChangeStatus}
                    onEditTask={(t) => {
                        setSelectedTask(t);
                        setIsTaskModalOpen(true);
                    }}
                    onDeleteTask={(t) => setDeleteTargetTask(t)}
                />

                <TaskColumn
                    status="done"
                    tasks={filteredTasks.filter((t) => t.status === 'done')}
                    onAddTask={(st) => {
                        setSelectedTask(null);
                        setTaskModalDefaultStatus(st);
                        setIsTaskModalOpen(true);
                    }}
                    onToggleStatus={handleToggleStatus}
                    onChangeStatus={handleChangeStatus}
                    onEditTask={(t) => {
                        setSelectedTask(t);
                        setIsTaskModalOpen(true);
                    }}
                    onDeleteTask={(t) => setDeleteTargetTask(t)}
                />
            </div>

            {/* Task Create / Edit Modal */}
            <TaskFormModal
                isOpen={isTaskModalOpen}
                onClose={() => {
                    setIsTaskModalOpen(false);
                    setSelectedTask(null);
                }}
                onSubmit={handleSaveTask}
                task={selectedTask}
                defaultStatus={taskModalDefaultStatus}
            />

            {/* Member Management Modal */}
            <MemberManageModal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                projectName={project.name}
                members={memberList}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
            />

            {/* Delete Task Confirmation Dialog */}
            <ConfirmDialog
                isOpen={deleteTargetTask !== null}
                onClose={() => setDeleteTargetTask(null)}
                onConfirm={handleDeleteTaskConfirm}
                title="Hapus Tugas"
                message={`Apakah Anda yakin ingin menghapus tugas "${deleteTargetTask?.title}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmText="Hapus Tugas"
                variant="danger"
            />
        </AppLayout>
    );
}
