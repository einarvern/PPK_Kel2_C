import React from 'react';
import { Link } from '@inertiajs/react';
import { CheckCircleIcon } from '../components/ui/icons';

interface GuestLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function GuestLayout({ children, title, subtitle }: GuestLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-slate-950">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                {/* Brand Logo & Name */}
                <Link href="/" className="inline-flex items-center gap-2.5 group">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                        <CheckCircleIcon className="h-6 w-6" />
                    </div>
                    <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Task<span className="text-indigo-600">Team</span>
                    </span>
                </Link>

                <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                        Aplikasi Manajemen Tugas Tim (Jara)
                    </span>
                </div>

                {title && (
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                        {title}
                    </h2>
                )}
                {subtitle && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
                <div className="rounded-2xl bg-white px-6 py-8 shadow-xl shadow-slate-200/50 sm:px-10 border border-slate-100 dark:bg-slate-900 dark:border-slate-800 dark:shadow-none">
                    {children}
                </div>

                <div className="mt-6 text-center text-xs text-slate-400">
                    &copy; 2026 PPK Kelompok 2 C &bull; TaskTeam / Jara
                </div>
            </div>
        </div>
    );
}
