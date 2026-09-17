import React from 'react';
import { Link } from '@inertiajs/react';

interface GuestLayoutProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export function GuestLayout({ children, title, subtitle }: GuestLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col justify-center bg-[#f8fafc] px-4 py-10 sm:px-6 lg:px-8 dark:bg-slate-950">
            <div className="mx-auto w-full max-w-md text-center">
                <Link
                    href="/"
                    className="group inline-flex items-center gap-2.5"
                >
                    <span className="h-11 w-11 overflow-hidden rounded-2xl bg-emerald-600 shadow-md shadow-emerald-200 transition-transform group-hover:scale-105">
                        <img
                            src="/notetakingcat.png"
                            alt=""
                            className="h-full w-full object-cover"
                        />
                    </span>
                    <span className="text-2xl font-bold tracking-[-0.04em] text-slate-900 dark:text-white">
                        JARA
                    </span>
                </Link>

                {title && (
                    <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-100">
                        {title}
                    </h1>
                )}
                {subtitle && (
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="mx-auto mt-8 w-full max-w-md">
                <div className="rounded-2xl border border-slate-200/80 bg-white px-6 py-7 shadow-[0_18px_45px_-28px_rgba(15,23,42,0.35)] sm:px-9 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
                    {children}
                </div>

                <div className="mt-5 text-center text-xs text-slate-400">
                    &copy; 2026 PPK Kelompok 2 C &bull; JARA
                </div>
            </div>
        </div>
    );
}
