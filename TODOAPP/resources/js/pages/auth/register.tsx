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
        post('/register', {
            onError: () => {
                console.log('Register attempt with:', data);
            },
        });
    };

    return (
        <GuestLayout
            title="Daftar Akun Baru"
            subtitle="Bergabunglah dengan TaskTeam untuk mulai berkolaborasi mengelola tugas tim."
        >
            <Head title="Daftar - TaskTeam" />

            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nama Lengkap *"
                    placeholder="Contoh: Rio Setiawan"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    error={errors.name}
                    autoFocus
                    required
                />

                <Input
                    label="Alamat Email *"
                    type="email"
                    placeholder="nama@example.com"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    error={errors.email}
                    required
                />

                <Input
                    label="Kata Sandi / Password *"
                    type="password"
                    placeholder="Minimal 8 karakter (sesuai standar API)"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    error={errors.password}
                    required
                />

                <Input
                    label="Konfirmasi Kata Sandi *"
                    type="password"
                    placeholder="Ulangi kata sandi di atas"
                    value={data.password_confirmation}
                    onChange={(e) => setData('password_confirmation', e.target.value)}
                    error={errors.password_confirmation}
                    required
                />

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full mt-2"
                    isLoading={processing}
                >
                    Daftar Sekarang
                </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                Sudah memiliki akun terdaftar?{' '}
                <Link
                    href="/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                    Masuk ke Akun Anda
                </Link>
            </div>
        </GuestLayout>
    );
}
