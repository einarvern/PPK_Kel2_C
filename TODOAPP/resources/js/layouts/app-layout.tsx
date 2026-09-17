import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import type { User } from '../types';
import {
    LayoutDashboardIcon,
    ShieldCheckIcon,
    LogOutIcon,
    ChevronDownIcon,
} from '../components/ui/icons';
import { RoleBadge } from '../components/ui/badge';
import { Toast } from '../components/ui/toast';

interface AppLayoutProps {
    children: React.ReactNode;
    title?: string;
    headerAction?: React.ReactNode;
}

export function AppLayout({ children, title, headerAction }: AppLayoutProps) {
    const page = usePage();
    const authUser = (page.props as { auth?: { user?: User | null } }).auth
        ?.user;

    const flash = (
        page.props as { flash?: { success?: string; error?: string } }
    ).flash;
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(
        flash?.success || null,
    );

    if (!authUser) {
        return null;
    }

    const handleLogout = () => {
        router.post(
            '/logout',
            {},
            {
                onError: () =>
                    setToastMessage(
                        'Logout tidak dapat diproses. Silakan coba lagi.',
                    ),
            },
        );
    };

    return (
        <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Left: Brand & Nav Links */}
                    <div className="flex items-center gap-8">
                        <Link
                            href={
                                authUser.role === 'admin'
                                    ? '/admin/users'
                                    : '/dashboard'
                            }
                            className="group flex items-center gap-2.5"
                        >
                            <div className="h-9 w-9 overflow-hidden rounded-lg bg-emerald-600 shadow-sm shadow-emerald-500/30 transition-transform group-hover:scale-105">
                                <img
                                    src="/notetakingcat.png"
                                    alt=""
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg leading-none font-bold tracking-tight text-slate-900 dark:text-white">
                                    <span className="text-emerald-600">
                                        JARA
                                    </span>
                                </span>
                            </div>
                        </Link>

                        <nav className="hidden items-center gap-1 sm:flex">
                            {authUser.role !== 'admin' && (
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <LayoutDashboardIcon className="h-4 w-4 text-slate-500" />
                                    Dashboard
                                </Link>
                            )}

                            {authUser.role === 'admin' && (
                                <Link
                                    href="/admin/users"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                                    Daftar Anggota
                                </Link>
                            )}
                        </nav>
                    </div>

                    {/* Right: User Profile & Actions */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setUserMenuOpen(!userMenuOpen)}
                                className="flex cursor-pointer items-center gap-2.5 rounded-full p-1.5 transition-colors hover:bg-slate-100 focus:outline-none dark:hover:bg-slate-800"
                            >
                                <div className="h-8 w-8 overflow-hidden rounded-full bg-emerald-100 ring-2 ring-emerald-500/20 dark:bg-emerald-950">
                                    <img
                                        src={
                                            authUser.avatar ||
                                            '/defaultprofile.png'
                                        }
                                        alt={`${authUser.name} profile`}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                                <div className="hidden flex-col text-left md:flex">
                                    <span className="text-xs leading-tight font-semibold text-slate-900 dark:text-slate-100">
                                        {authUser.name}
                                    </span>
                                    <span className="text-[10px] leading-tight text-slate-400">
                                        {authUser.email}
                                    </span>
                                </div>
                                <ChevronDownIcon className="hidden h-4 w-4 text-slate-400 sm:block" />
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
                                        <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-800">
                                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                                {authUser.name}
                                            </p>
                                            <p className="truncate text-[11px] text-slate-400">
                                                {authUser.email}
                                            </p>
                                            <div className="mt-1.5">
                                                <RoleBadge
                                                    role={authUser.role}
                                                />
                                            </div>
                                        </div>

                                        <div className="py-1 sm:hidden">
                                            {authUser.role !== 'admin' && (
                                                <Link
                                                    href="/dashboard"
                                                    onClick={() =>
                                                        setUserMenuOpen(false)
                                                    }
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                                >
                                                    <LayoutDashboardIcon className="h-4 w-4" />
                                                    Dashboard
                                                </Link>
                                            )}
                                            {authUser.role === 'admin' && (
                                                <Link
                                                    href="/admin/users"
                                                    onClick={() =>
                                                        setUserMenuOpen(false)
                                                    }
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                                >
                                                    <ShieldCheckIcon className="h-4 w-4 text-emerald-600" />
                                                    Daftar Anggota
                                                </Link>
                                            )}
                                        </div>

                                        <div className="border-t border-slate-100 pt-1 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:hover:bg-rose-950/40"
                                            >
                                                <LogOutIcon className="h-4 w-4" />
                                                Keluar (Logout)
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Flash Message Banner */}
            {toastMessage && (
                <div className="mx-auto mt-4 max-w-7xl px-4 sm:px-6 lg:px-8">
                    <Toast
                        type="success"
                        message={toastMessage}
                        onClose={() => setToastMessage(null)}
                    />
                </div>
            )}

            {/* Page Title & Action Bar */}
            {title && (
                <div className="border-b border-slate-200/60 bg-white/40 dark:border-slate-800/60 dark:bg-slate-900/40">
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-slate-100">
                                {title}
                            </h1>
                        </div>
                        {headerAction && <div>{headerAction}</div>}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="mt-auto border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                Aplikasi Manajemen Tugas Tim (JARA) &bull; Praktikum Pemrograman
                Komputer (PPK) Kelompok 2 C
            </footer>
        </div>
    );
}
