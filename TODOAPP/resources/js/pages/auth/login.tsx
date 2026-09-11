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
        if (role === 'admin') {
            setData({
                email: 'admin@taskteam.test',
                password: 'password123',
                remember: true,
            });
        } else {
            setData({
                email: 'rio@taskteam.test',
                password: 'password123',
                remember: true,
            });
        }
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
                        className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 px-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
                    >
                        Isi User Rio
                    </button>
                    <button
                        type="button"
                        onClick={() => fillDemoUser('admin')}
                        className="rounded-lg border border-purple-200 bg-purple-50 py-1.5 px-2 text-xs font-medium text-purple-700 hover:bg-purple-100 transition-colors cursor-pointer dark:border-purple-900/40 dark:bg-purple-950/40 dark:text-purple-300"
                    >
                        Isi Akun Admin
                    </button>
                </div>
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
