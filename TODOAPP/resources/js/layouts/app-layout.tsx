import React, { useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import type { User } from '../types';
import {
    CheckCircleIcon,
    LayoutDashboardIcon,
    ShieldCheckIcon,
    LogOutIcon,
    UserIcon,
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
    // Safely get user from props or provide fallback for preview
    const authUser = (page.props as { auth?: { user?: User } }).auth?.user || {
        id: 1,
        name: 'Rio Setiawan',
        email: 'rio@example.com',
        role: 'admin',
        created_at: '2026-09-11',
    };

    const flash = (page.props as { flash?: { success?: string; error?: string } }).flash;
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(flash?.success || null);

    const handleLogout = () => {
        router.post('/logout', {}, {
            onError: () => {
                // fallback if backend endpoint is not ready yet
                window.location.href = '/login';
            }
        });
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Left: Brand & Nav Links */}
                    <div className="flex items-center gap-8">
                        <Link href="/dashboard" className="flex items-center gap-2.5 group">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                                <CheckCircleIcon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                                    Task<span className="text-indigo-600">Team</span>
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium leading-tight">
                                    Jara &bull; PPK Kel 2
                                </span>
                            </div>
                        </Link>

                        <nav className="hidden sm:flex items-center gap-1">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                            >
                                <LayoutDashboardIcon className="h-4 w-4 text-slate-500" />
                                Dashboard
                            </Link>

                            {authUser.role === 'admin' && (
                                <Link
                                    href="/admin/users"
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <ShieldCheckIcon className="h-4 w-4 text-purple-600" />
                                    Panel Admin
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
                                className="flex items-center gap-2.5 rounded-full p-1.5 hover:bg-slate-100 focus:outline-none dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-xs text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 ring-2 ring-indigo-500/20">
                                    {getInitials(authUser.name)}
                                </div>
                                <div className="hidden md:flex flex-col text-left">
                                    <span className="text-xs font-semibold leading-tight text-slate-900 dark:text-slate-100">
                                        {authUser.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 leading-tight">
                                        {authUser.email}
                                    </span>
                                </div>
                                <ChevronDownIcon className="hidden sm:block h-4 w-4 text-slate-400" />
                            </button>

                            {/* Dropdown Menu */}
                            {userMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800 z-40">
                                        <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                                                {authUser.name}
                                            </p>
                                            <p className="text-[11px] text-slate-400 truncate">
                                                {authUser.email}
                                            </p>
                                            <div className="mt-1.5">
                                                <RoleBadge role={authUser.role} />
                                            </div>
                                        </div>

                                        <div className="py-1 sm:hidden">
                                            <Link
                                                href="/dashboard"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                            >
                                                <LayoutDashboardIcon className="h-4 w-4" />
                                                Dashboard
                                            </Link>
                                            {authUser.role === 'admin' && (
                                                <Link
                                                    href="/admin/users"
                                                    onClick={() => setUserMenuOpen(false)}
                                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                                                >
                                                    <ShieldCheckIcon className="h-4 w-4 text-purple-600" />
                                                    Panel Admin
                                                </Link>
                                            )}
                                        </div>

                                        <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
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
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4">
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
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
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
            <footer className="mt-auto border-t border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900 text-center text-xs text-slate-400">
                Aplikasi Manajemen Tugas Tim (TaskTeam / Jara) &bull; Praktikum Pemrograman Komputer (PPK) Kelompok 2 C
            </footer>
        </div>
    );
}
