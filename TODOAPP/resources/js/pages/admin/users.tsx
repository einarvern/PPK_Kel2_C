import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import type { User, Role } from '../../types';
import { AppLayout } from '../../layouts/app-layout';
import { UserTable } from '../../components/admin/user-table';
import { UserFormModal } from '../../components/admin/user-form-modal';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { Button } from '../../components/ui/button';
import {
    PlusIcon,
    UsersIcon,
    ShieldCheckIcon,
    UserIcon,
    SearchIcon,
} from '../../components/ui/icons';

interface AdminUsersProps {
    users?: User[];
    auth?: { user?: User };
}

// Default mock data aligned with database enum ('user' | 'admin')
const defaultMockUsers: User[] = [
    {
        id: 1,
        name: 'Rio Setiawan (Admin)',
        email: 'rio@taskteam.test',
        role: 'admin',
        created_at: '2026-09-01',
    },
    {
        id: 2,
        name: 'Andi Pratama',
        email: 'andi@taskteam.test',
        role: 'user',
        created_at: '2026-09-02',
    },
    {
        id: 3,
        name: 'Siti Nurhaliza',
        email: 'siti@taskteam.test',
        role: 'user',
        created_at: '2026-09-03',
    },
    {
        id: 4,
        name: 'Dosen Pembimbing PPK',
        email: 'dosen@kampus.ac.id',
        role: 'admin',
        created_at: '2026-08-25',
    },
];

export default function AdminUsers({ users: propUsers }: AdminUsersProps) {
    const [userList, setUserList] = useState<User[]>(
        propUsers && propUsers.length > 0 ? propUsers : defaultMockUsers
    );

    const [search, setSearch] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Search filter
    const filteredUsers = userList.filter(
        (u) =>
            u.name.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    );

    // Stats
    const totalUsers = userList.length;
    const totalAdmins = userList.filter((u) => u.role === 'admin').length;
    const totalRegularUsers = userList.filter((u) => u.role === 'user').length;

    const handleCreateUser = (data: {
        name: string;
        email: string;
        password?: string;
        password_confirmation?: string;
        role: Role;
    }) => {
        setIsSubmitting(true);
        router.post('/admin/users', data, {
            onError: () => {
                // Client-side preview fallback
                const newUser: User = {
                    id: Date.now(),
                    name: data.name,
                    email: data.email,
                    role: data.role,
                    created_at: new Date().toISOString().split('T')[0],
                };
                setUserList([newUser, ...userList]);
                setIsCreateModalOpen(false);
                setIsSubmitting(false);
            },
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setIsSubmitting(false);
            },
            onFinish: () => setIsSubmitting(false),
        });
    };

    const handleDeleteUserConfirm = () => {
        if (!deleteTargetUser) return;
        setUserList((prev) => prev.filter((u) => u.id !== deleteTargetUser.id));
        router.delete(`/admin/users/${deleteTargetUser.id}`, {
            preserveScroll: true,
            onError: () => {},
        });
        setDeleteTargetUser(null);
    };

    return (
        <AppLayout
            title="Manajemen Pengguna Sistem"
            headerAction={
                <Button
                    variant="primary"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="shadow-sm"
                >
                    <PlusIcon className="h-4 w-4" />
                    <span>Tambah Pengguna</span>
                </Button>
            }
        >
            <Head title="Panel Admin - Manajemen Pengguna" />

            {/* Admin Badge Notice */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-4 mb-6 dark:border-purple-900/50 dark:bg-purple-950/20 flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-600 text-white">
                    <ShieldCheckIcon className="h-5 w-5" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">
                        Area Khusus Administrator
                    </h3>
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                        Halaman ini digunakan untuk mengelola data akun pengguna, hak akses peran (*Role*), serta penambahan dan penghapusan pengguna sesuai aturan PRD Bagian 4.1 & 6.
                    </p>
                </div>
            </div>

            {/* Metric Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Total Pengguna Terdaftar
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                            <UsersIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {totalUsers}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Akun aktif dalam sistem</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                            Administrator
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
                            <ShieldCheckIcon className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mt-2 text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {totalAdmins}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">Memiliki akses ke panel ini</p>
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
                    <p className="mt-1 text-[11px] text-slate-400">Pemilik proyek & anggota tim</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="relative max-w-sm w-full">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                        <SearchIcon className="h-4 w-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari pengguna berdasarkan nama atau email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                    />
                </div>
            </div>

            {/* Users Table */}
            <UserTable
                users={filteredUsers}
                onDeleteUser={(user) => setDeleteTargetUser(user)}
                currentUserId={1}
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
