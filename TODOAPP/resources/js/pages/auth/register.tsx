import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { GuestLayout } from '../../layouts/guest-layout';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';

export default function Register() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <GuestLayout
            title="Buat akun JARA"
            subtitle="Mulai kelola tugas dengan cara yang lebih sederhana."
        >
            <Head title="Daftar · Jara" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nama lengkap"
                    placeholder="Masukkan nama lengkap"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    autoFocus
                    required
                />

                <Input
                    label="Email"
                    type="email"
                    placeholder="nama@example.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />

                <Input
                    label="Kata sandi"
                    type="password"
                    placeholder="Minimal 8 karakter"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />

                <Input
                    label="Konfirmasi kata sandi"
                    type="password"
                    placeholder="Ulangi kata sandi"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    error={errors.password_confirmation}
                    required
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="mt-2 w-full"
                    isLoading={processing}
                >
                    Buat akun
                </Button>
            </form>

            <div className="mt-6 border-t border-slate-100 pt-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
                Sudah punya akun?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400"
                >
                    Masuk
                </Link>
            </div>
        </GuestLayout>
    );
}
