import React, { useState } from 'react';
import type { ProjectMember } from '../../types';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { TrashIcon, UsersIcon } from '../ui/icons';

interface MemberManageModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectName: string;
    members: ProjectMember[];
    onAddMember: (email: string) => void;
    onRemoveMember: (memberId: number) => void;
    isLoading?: boolean;
}

export function MemberManageModal({
    isOpen,
    onClose,
    projectName,
    members,
    onAddMember,
    onRemoveMember,
    isLoading = false,
}: MemberManageModalProps) {
    const [email, setEmail] = useState('');
    const [emailError, setEmailError] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setEmailError('Email anggota wajib diisi');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
            setEmailError('Format email tidak valid');
            return;
        }
        onAddMember(trimmedEmail);
        setEmail('');
        setEmailError('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Kelola Anggota: ${projectName}`}
            description="Sebagai pemilik proyek, Anda dapat menambahkan rekan tim berdasarkan email untuk berkolaborasi dalam proyek ini."
            maxWidth="lg"
        >
            {/* Invite Form */}
            <form onSubmit={handleAdd} className="mb-6 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Undang Anggota Baru
                </label>
                <div className="flex gap-2">
                    <div className="flex-1">
                        <Input
                            type="email"
                            placeholder="nama.rekan@example.com"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) setEmailError('');
                            }}
                            error={emailError}
                        />
                    </div>
                    <Button type="submit" variant="primary" isLoading={isLoading} className="shrink-0">
                        Undang
                    </Button>
                </div>
            </form>

            {/* Members List */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Daftar Anggota Saat Ini ({members.length})
                    </h4>
                </div>

                <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800 max-h-64 overflow-y-auto">
                    {members.length === 0 ? (
                        <div className="p-6 text-center text-sm text-slate-400">
                            <UsersIcon className="mx-auto h-8 w-8 text-slate-300 mb-1" />
                            Belum ada anggota tim lain yang bergabung.
                        </div>
                    ) : (
                        members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                        {member.user.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')
                                            .toUpperCase()
                                            .substring(0, 2)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                            {member.user.name}
                                        </p>
                                        <p className="text-xs text-slate-400">{member.user.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-slate-400 hidden sm:inline">
                                        Bergabung: {member.joined_at}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveMember(member.id)}
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                                        title="Keluarkan dari proyek"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                    Selesai
                </Button>
            </div>
        </Modal>
    );
}
