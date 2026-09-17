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
        post('/login');
    };

    return (
        <GuestLayout
            title="Masuk ke JARA"
            subtitle="Satu tempat sederhana untuk tugas pribadi dan tim."
        >
            <Head title="Masuk · Jara" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email"
                    type="email"
                    placeholder="nama@example.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    autoFocus
                    required
                />

                <Input
                    label="Kata sandi"
                    type="password"
                    placeholder="Masukkan kata sandi"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />

                <div className="flex items-center justify-between text-xs">
                    <label className="flex cursor-pointer items-center gap-2 text-slate-600 dark:text-slate-400">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked)
                            }
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 dark:border-slate-700 dark:bg-slate-900"
                        />
                        <span>Ingat saya di perangkat ini</span>
                    </label>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="mt-2 w-full"
                    isLoading={processing}
                >
                    Masuk
                </Button>
            </form>
            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Belum memiliki akun?{' '}
                <Link
                    href="/register"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                    Daftar
                </Link>
            </div>
        </GuestLayout>
    );
}
