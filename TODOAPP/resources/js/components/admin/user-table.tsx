import React from 'react';
import type { User } from '../../types';
import { RoleBadge } from '../ui/badge';
import { TrashIcon, UserIcon } from '../ui/icons';

interface UserTableProps {
    users: User[];
    onDeleteUser: (user: User) => void;
    currentUserId?: number;
}

export function UserTable({ users, onDeleteUser, currentUserId }: UserTableProps) {
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
                    <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500 border-b border-slate-200 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-800">
                        <tr>
                            <th scope="col" className="px-6 py-4">
                                Pengguna
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Peran / Role
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Terdaftar Sejak
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-sm text-slate-400">
                                    <UserIcon className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                                    Tidak ada pengguna ditemukan.
                                </td>
                            </tr>
                        ) : (
                            users.map((user) => {
                                const isSelf = currentUserId === user.id;

                                return (
                                    <tr
                                        key={user.id}
                                        className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/40"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 ring-1 ring-indigo-500/20">
                                                    {user.name
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .join('')
                                                        .toUpperCase()
                                                        .substring(0, 2)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                                                        {user.name}
                                                        {isSelf && (
                                                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal dark:bg-slate-800 dark:text-slate-400">
                                                                Anda
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <RoleBadge role={user.role} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                                            {user.created_at}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <button
                                                type="button"
                                                onClick={() => onDeleteUser(user)}
                                                disabled={isSelf}
                                                className={`rounded-lg p-1.5 transition-colors ${
                                                    isSelf
                                                        ? 'text-slate-300 cursor-not-allowed dark:text-slate-700'
                                                        : 'text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer'
                                                }`}
                                                title={isSelf ? 'Tidak dapat menghapus akun sendiri' : 'Hapus akun pengguna'}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
