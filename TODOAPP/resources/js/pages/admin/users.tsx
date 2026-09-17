import React, { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import type { User, Role } from '../../types';
import { AppLayout } from '../../layouts/app-layout';
import { UserTable } from '../../components/admin/user-table';
import { UserFormModal } from '../../components/admin/user-form-modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Button } from '../../components/ui/button';
import { Toast } from '../../components/ui/toast';
import {
    PlusIcon,
    UsersIcon,
    ShieldCheckIcon,
    UserIcon,
    SearchIcon,
} from '../../components/ui/icons';

interface AdminUsersProps {
    users: User[];
}

export default function AdminUsers({ users }: AdminUsersProps) {
    const authUser = (usePage().props as { auth?: { user?: User } }).auth?.user;

    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Search filter
    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()),
    );

    // Stats
    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === 'admin').length;
    const totalRegularUsers = users.filter((u) => u.role === 'user').length;

    const handleCreateUser = (data: {
        name: string;
        email: string;
        password?: string;
        password_confirmation?: string;
        role: Role;
    }) => {
        setError(null);
        setIsSubmitting(true);
        router.post('/admin/users', data, {
            onError: (errors) =>
                setError(
                    Object.values(errors)[0] ||
                        'Pengguna tidak dapat ditambahkan.',
                ),
            onSuccess: () => setIsCreateModalOpen(false),
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeleteUserConfirm = () => {
        if (!deleteTargetUser) return;
        setError(null);
        router.delete(`/admin/users/${deleteTargetUser.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeleteTargetUser(null),
            onError: (errors) =>
                setError(
                    Object.values(errors)[0] || 'Pengguna tidak dapat dihapus.',
                ),
        });
    };

    return (
        <AppLayout
            title="Daftar Anggota"
            headerAction={
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="shadow-sm"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Tambah Anggota</span>
                </Button>
            }
        >
            <Head title="Daftar Anggota - Jara" />

            {error && (
                <div className="mb-5">
                    <Toast
                        type="error"
                        message={error}
                        onClose={() => setError(null)}
                    />
                </div>
            )}

            {/* Metric Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Total Pengguna Terdaftar
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <UsersIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {totalUsers}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Administrator
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-lime-50 text-lime-700 dark:bg-lime-950 dark:text-lime-400">
                            <ShieldCheckIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-lime-700 dark:text-lime-400">
                        {totalAdmins}
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Pengguna Biasa
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <UserIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {totalRegularUsers}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <SearchIcon className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari anggota berdasarkan nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2 pr-3 pl-9 text-xs text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    />
                </div>
            </div>

            {/* Users Table */}
            <UserTable
                users={filteredUsers}
                onDeleteUser={(user) => setDeleteTargetUser(user)}
                currentUserId={authUser?.id}
            />

            {/* Create User Modal */}
            <UserFormModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateUser}
                isLoading={isSubmitting}
            />

            {/* Delete User Confirm Dialog */}
            <ConfirmDialog
                isOpen={deleteTargetUser !== null}
                onClose={() => setDeleteTargetUser(null)}
                onConfirm={handleDeleteUserConfirm}
                title="Hapus Akun Pengguna"
                message={`Apakah Anda yakin ingin menghapus akun pengguna "${deleteTargetUser?.name}" (${deleteTargetUser?.email})? Tindakan ini akan menghapus data akses pengguna dari sistem.`}
                confirmText="Hapus Akun"
                variant="danger"
            />
        </AppLayout>
    );
}
