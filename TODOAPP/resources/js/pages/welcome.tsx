import { Head, Link } from '@inertiajs/react';

function ArrowUpRightIcon({ className = '' }: { className?: string }) {
    return (
        <svg
            aria-hidden="true"
            className={className}
            fill="none"
            viewBox="0 0 20 20"
        >
            <path
                d="M5.833 14.167 14.167 5.833M7.5 5.833h6.667V12.5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.6"
            />
        </svg>
    );
}

function LogoMark() {
    return (
        <span className="h-9 w-9 overflow-hidden rounded-xl bg-emerald-600 shadow-lg shadow-emerald-200">
            <img
                src="/notetakingcat.png"
                alt=""
                className="h-full w-full object-cover"
            />
        </span>
    );
}

export default function Welcome() {
    return (
        <>
            <Head title="Jara" />

            <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-900">
                <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
                    <Link
                        href="/"
                        className="flex items-center gap-2.5"
                        aria-label="Jara home"
                    >
                        <LogoMark />
                        <span className="text-xl font-bold tracking-[-0.04em] text-slate-900">
                            JARA
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/login"
                            className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:inline-flex"
                        >
                            Masuk
                        </Link>
                        <Link
                            href="/register"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-200"
                        >
                            Registrasi 😼
                            <ArrowUpRightIcon className="h-4 w-4" />
                        </Link>
                    </div>
                </header>

                <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-16 lg:px-8">
                    <div
                        aria-hidden="true"
                        className="pointer-events-none absolute top-1/2 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-100/60 blur-3xl"
                    />
                    <section className="relative z-10 mx-auto grid w-full max-w-5xl items-center gap-14 lg:grid-cols-[1fr_0.75fr]">
                        <div className="text-center lg:text-left">
                            <h1 className="text-6xl leading-[0.95] font-semibold tracking-[-0.065em] text-slate-950 sm:text-7xl lg:text-[6.5rem]">
                                JARA
                                <span className="mt-5 block text-emerald-600">
                                    More like Jira Lite 😹
                                </span>
                            </h1>
                            <Link
                                href="/register"
                                className="mt-10 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-xl hover:shadow-emerald-200"
                            >
                                Buat workspace pertama
                                <ArrowUpRightIcon className="h-4 w-4" />
                            </Link>
                        </div>

                        <div className="relative mx-auto w-full max-w-xs lg:mx-0 lg:max-w-sm">
                            <div
                                aria-hidden="true"
                                className="absolute -inset-6 rounded-[2.5rem] bg-emerald-100/70 blur-2xl"
                            />
                            <div className="relative rounded-[2rem] border border-emerald-100 bg-white p-3 shadow-[0_24px_55px_-25px_rgba(5,150,105,0.45)]">
                                <img
                                    src="/notetakingcat.png"
                                    alt="Kucing sedang membaca catatan"
                                    className="aspect-square w-full rounded-[1.5rem] object-cover"
                                />
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="mx-auto flex w-full max-w-7xl items-center justify-center px-6 pb-8 text-xs text-slate-400 lg:px-8">
                    © 2026 PPK Kelompok 2C · JARA workspace
                </footer>
            </div>
        </>
    );
}
