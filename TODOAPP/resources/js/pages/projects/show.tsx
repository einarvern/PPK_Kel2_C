import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import type {
    Project,
    ProjectMember,
    Task,
    TaskFilter,
    TaskPriority,
    TaskStatus,
} from '../../types';
import { AppLayout } from '../../layouts/app-layout';
import { TaskColumn } from '../../components/tasks/task-column';
import { TaskFormModal } from '../../components/tasks/task-form-modal';
import { TaskFilterBar } from '../../components/tasks/task-filter-bar';
import { MemberManageModal } from '../../components/projects/member-manage-modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { ProgressBar } from '../../components/ui/progress-bar';
import { Button } from '../../components/ui/button';
import { Toast } from '../../components/ui/toast';
import {
    CheckCircleIcon,
    FolderIcon,
    PlusIcon,
    UsersIcon,
} from '../../components/ui/icons';

interface ProjectShowProps {
    project: Project;
    tasks: Task[];
    members: ProjectMember[];
}

type TaskFormData = {
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    deadline: string | null;
};

const priorityRank: Record<TaskPriority, number> = {
    high: 3,
    medium: 2,
    low: 1,
};

const firstError = (errors: Record<string, string>, fallback: string) =>
    Object.values(errors)[0] || fallback;

export default function ProjectShow({
    project,
    tasks,
    members,
}: ProjectShowProps) {
    const [filter, setFilter] = useState<TaskFilter>({
        search: '',
        priority: 'all',
        deadline_filter: 'all',
        sort: 'default',
    });
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskModalDefaultStatus, setTaskModalDefaultStatus] =
        useState<TaskStatus>('todo');
    const [isTaskSubmitting, setIsTaskSubmitting] = useState(false);
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
    const [deleteTargetTask, setDeleteTargetTask] = useState<Task | null>(null);
    const [deleteTargetMember, setDeleteTargetMember] =
        useState<ProjectMember | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const isOwner = project.is_owner === true;
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
        (task) => task.status === 'done',
    ).length;
    const inProgressTasks = tasks.filter(
        (task) => task.status === 'in_progress',
    ).length;
    const pendingTasks = tasks.filter((task) => task.status === 'todo').length;
    const progressPercentage =
        totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const now = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    const isOverdue = (task: Task) =>
        Boolean(
            task.deadline &&
            task.status !== 'done' &&
            new Date(task.deadline).getTime() < today,
        );
    const isDueSoon = (task: Task) =>
        Boolean(
            task.deadline &&
            task.status !== 'done' &&
            !isOverdue(task) &&
            new Date(task.deadline).getTime() - now.getTime() <
                3 * 24 * 60 * 60 * 1000,
        );

    const filteredTasks = tasks.filter((task) => {
        if (
            filter.search &&
            !task.title.toLowerCase().includes(filter.search.toLowerCase())
        ) {
            return false;
        }
        if (filter.priority !== 'all' && task.priority !== filter.priority) {
            return false;
        }
        if (filter.deadline_filter === 'overdue' && !isOverdue(task)) {
            return false;
        }
        if (filter.deadline_filter === 'due_soon' && !isDueSoon(task)) {
            return false;
        }
        return true;
    });

    const sortTasks = (taskList: Task[]) =>
        [...taskList].sort((left, right) => {
            switch (filter.sort) {
                case 'priority_desc':
                    return (
                        priorityRank[right.priority] -
                        priorityRank[left.priority]
                    );
                case 'priority_asc':
                    return (
                        priorityRank[left.priority] -
                        priorityRank[right.priority]
                    );
                case 'deadline_asc':
                case 'deadline_desc': {
                    if (!left.deadline) return 1;
                    if (!right.deadline) return -1;
                    const comparison =
                        new Date(left.deadline).getTime() -
                        new Date(right.deadline).getTime();
                    return filter.sort === 'deadline_asc'
                        ? comparison
                        : -comparison;
                }
                default:
                    return 0;
            }
        });

    const closeTaskModal = () => {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
    };

    const handleChangeStatus = (task: Task, status: TaskStatus) => {
        setActionError(null);
        router.patch(
            `/tasks/${task.id}`,
            { status },
            {
                preserveScroll: true,
                onError: (errors) =>
                    setActionError(
                        firstError(
                            errors,
                            'Status tugas tidak dapat diperbarui.',
                        ),
                    ),
            },
        );
    };

    const handleSaveTask = (data: TaskFormData) => {
        setActionError(null);
        setIsTaskSubmitting(true);

        const options = {
            preserveScroll: true,
            onSuccess: closeTaskModal,
            onError: (errors: Record<string, string>) =>
                setActionError(
                    firstError(errors, 'Tugas tidak dapat disimpan.'),
                ),
            onFinish: () => setIsTaskSubmitting(false),
        };

        if (selectedTask) {
            router.put(`/tasks/${selectedTask.id}`, data, options);
        } else {
            router.post(`/projects/${project.id}/tasks`, data, options);
        }
    };

    const handleDeleteTask = () => {
        if (!deleteTargetTask) return;

        setActionError(null);
        router.delete(`/tasks/${deleteTargetTask.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTargetTask(null),
            onError: (errors) =>
                setActionError(
                    firstError(errors, 'Tugas tidak dapat dihapus.'),
                ),
        });
    };

    const handleAddMember = (email: string) => {
        setActionError(null);
        router.post(
            `/projects/${project.id}/members`,
            { email },
            {
                preserveScroll: true,
                onError: (errors) =>
                    setActionError(
                        firstError(errors, 'Anggota tidak dapat ditambahkan.'),
                    ),
            },
        );
    };

    const handleRemoveMember = (userId: number) => {
        setActionError(null);
        router.delete(`/projects/${project.id}/members/${userId}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTargetMember(null),
            onError: (errors) =>
                setActionError(
                    firstError(errors, 'Anggota tidak dapat dikeluarkan.'),
                ),
        });
    };

    const requestRemoveMember = (memberId: number) => {
        const member = members.find((item) => item.id === memberId);

        if (member) {
            setDeleteTargetMember(member);
        }
    };

    const openNewTask = (status: TaskStatus = 'todo') => {
        setSelectedTask(null);
        setTaskModalDefaultStatus(status);
        setIsTaskModalOpen(true);
    };

    return (
        <AppLayout>
            <Head title={`${project.name} - Jara`} />

            {actionError && (
                <div className="mb-5">
                    <Toast
                        type="error"
                        message={actionError}
                        onClose={() => setActionError(null)}
                    />
                </div>
            )}

            <div className="mb-3 flex items-center gap-2 text-xs text-slate-400">
                <Link
                    href="/dashboard"
                    className="transition-colors hover:text-emerald-600"
                >
                    Dashboard
                </Link>
                <span>/</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">
                    {project.name}
                </span>
            </div>

            <div
                className={`mb-6 rounded-2xl border bg-white p-6 shadow-2xs transition-colors dark:bg-slate-900 ${
                    isOwner
                        ? 'border-emerald-200/80 dark:border-emerald-900'
                        : 'border-teal-200/80 dark:border-teal-900'
                }`}
            >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <div className="mb-2 flex items-center gap-2">
                            <span
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                    isOwner
                                        ? 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-300'
                                        : 'bg-teal-100 text-teal-800 ring-1 ring-teal-600/20 dark:bg-teal-950/50 dark:text-teal-300'
                                }`}
                            >
                                {isOwner ? 'Owner' : 'Member'}
                            </span>
                            {project.created_at && (
                                <span className="text-xs text-slate-400">
                                    Dibuat: {project.created_at}
                                </span>
                            )}
                        </div>
                        <h1 className="flex items-center gap-3 text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
                            <FolderIcon className="h-7 w-7 shrink-0 text-emerald-600" />
                            <span>{project.name}</span>
                        </h1>
                        <p className="mt-2 max-w-3xl text-sm text-slate-500 dark:text-slate-400">
                            {project.description ||
                                'Tidak ada deskripsi daftar tugas.'}
                        </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                        {isOwner && (
                            <Button
                                variant="outline"
                                onClick={() => setIsMemberModalOpen(true)}
                                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            >
                                <UsersIcon className="h-4 w-4 text-emerald-600" />
                                <span>
                                    Kelola Anggota ({members.length + 1})
                                </span>
                            </Button>
                        )}
                        <Button variant="primary" onClick={() => openNewTask()}>
                            <PlusIcon className="h-4 w-4" />
                            <span>Tambah Tugas</span>
                        </Button>
                    </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-6 dark:border-slate-800">
                    <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
                        <div className="md:col-span-2">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">
                                    <CheckCircleIcon className="h-4 w-4 text-emerald-600" />
                                    Progres Penyelesaian Daftar
                                </span>
                                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
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
                        <div className="flex items-center justify-around gap-2 rounded-xl border border-slate-100 bg-slate-50 p-3 text-center dark:border-slate-800 dark:bg-slate-800/50">
                            <div>
                                <div className="text-base font-bold">
                                    {pendingTasks}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    Belum
                                </div>
                            </div>
                            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
                            <div>
                                <div className="text-base font-bold text-lime-700">
                                    {inProgressTasks}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    Sedang
                                </div>
                            </div>
                            <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />
                            <div>
                                <div className="text-base font-bold text-emerald-600">
                                    {completedTasks}
                                </div>
                                <div className="text-[11px] text-slate-400">
                                    Selesai
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <TaskFilterBar
                    filter={filter}
                    onChange={setFilter}
                    dueSoonCount={tasks.filter(isDueSoon).length}
                    overdueCount={tasks.filter(isOverdue).length}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {(['todo', 'in_progress', 'done'] as TaskStatus[]).map(
                    (status) => (
                        <TaskColumn
                            key={status}
                            status={status}
                            tasks={sortTasks(
                                filteredTasks.filter(
                                    (task) => task.status === status,
                                ),
                            )}
                            onAddTask={openNewTask}
                            onToggleStatus={(task) =>
                                handleChangeStatus(
                                    task,
                                    task.status === 'done'
                                        ? 'in_progress'
                                        : 'done',
                                )
                            }
                            onChangeStatus={handleChangeStatus}
                            onEditTask={(task) => {
                                setSelectedTask(task);
                                setIsTaskModalOpen(true);
                            }}
                            onDeleteTask={setDeleteTargetTask}
                        />
                    ),
                )}
            </div>

            <TaskFormModal
                isOpen={isTaskModalOpen}
                onClose={closeTaskModal}
                onSubmit={handleSaveTask}
                task={selectedTask}
                defaultStatus={taskModalDefaultStatus}
                isLoading={isTaskSubmitting}
            />

            <MemberManageModal
                isOpen={isMemberModalOpen}
                onClose={() => setIsMemberModalOpen(false)}
                projectName={project.name}
                members={members}
                onAddMember={handleAddMember}
                onRemoveMember={requestRemoveMember}
            />

            <ConfirmDialog
                isOpen={deleteTargetTask !== null}
                onClose={() => setDeleteTargetTask(null)}
                onConfirm={handleDeleteTask}
                title="Hapus Tugas"
                message={`Apakah Anda yakin ingin menghapus tugas "${deleteTargetTask?.title}"?`}
                confirmText="Hapus Tugas"
                variant="danger"
            />

            <ConfirmDialog
                isOpen={deleteTargetMember !== null}
                onClose={() => setDeleteTargetMember(null)}
                onConfirm={() => {
                    if (deleteTargetMember) {
                        handleRemoveMember(deleteTargetMember.user_id);
                    }
                }}
                title="Keluarkan Anggota"
                message={`Apakah Anda yakin ingin mengeluarkan ${deleteTargetMember?.user.name || 'anggota ini'} dari proyek?`}
                confirmText="Keluarkan"
                cancelText="Batal"
                variant="danger"
            />
        </AppLayout>
    );
}
