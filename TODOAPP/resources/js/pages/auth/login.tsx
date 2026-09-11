import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { GuestLayout } from '../../layouts/guest-layout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onError: () => {
                console.log('Login attempt with:', data);
            },
        });
    };

    // Quick fill helper for review & testing
    const fillDemoUser = (role: 'admin' | 'user') => {
        const email = role === 'admin' ? 'admin@taskteam.test' : 'rio@taskteam.test';
        const password = 'password123';

        setData((prev) => ({
            ...prev,
            email,
            password,
            remember: true,
        }));
    };

    return (
        <GuestLayout
            title="Selamat Datang Kembali"
            subtitle="Masuk ke akun TaskTeam Anda untuk mengelola tugas dan proyek tim."
        >
            <Head title="Masuk - TaskTeam" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Alamat Email"
                    type="email"
                    placeholder="nama@example.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    autoFocus
                    required
                />

                <Input
                    label="Kata Sandi / Password"
                    type="password"
                    placeholder="Min. 8 karakter"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />

                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                        <span>Ingat saya di perangkat ini</span>
                    </label>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={processing}
                >
                    Masuk Sekarang
                </Button>
            </form>

            {/* Quick Demo Fill Buttons for Testing */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-2.5">
                    Demo Cepat Pengujian UI
                </p>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        onClick={() => fillDemoUser('user')}
                        className="rounded-lg border border-slate-200 bg-slate-50 py-2 px-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 text-left"
                    >
                        <span className="block font-semibold">User (Rio)</span>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5 truncate">rio@taskteam.test</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => fillDemoUser('admin')}
                        className="rounded-lg border border-purple-200 bg-purple-50 py-2 px-2 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer dark:border-purple-900/40 dark:bg-purple-950/40 dark:text-purple-300 text-left"
                    >
                        <span className="block font-semibold">Admin</span>
                        <span className="block text-[10px] text-purple-600 dark:text-purple-400 font-mono mt-0.5 truncate">admin@taskteam.test</span>
                    </button>
                </div>
                <p className="text-[11px] text-slate-400 text-center mt-2 font-mono">
                    Password demo: <strong className="text-slate-600 dark:text-slate-300">password123</strong>
                </p>
            </div>

            {/* Register Link */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Belum memiliki akun?{' '}
                <Link
                    href="/register"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    Daftar Akun Baru
                </Link>
            </div>
        </GuestLayout>
    );
}
