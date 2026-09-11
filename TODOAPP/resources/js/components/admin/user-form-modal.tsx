import React, { useState } from 'react';
import type { Role } from '../../types';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        email: string;
        password?: string;
        password_confirmation?: string;
        role: Role;
    }) => void;
    isLoading?: boolean;
}

export function UserFormModal({
    isOpen,
    onClose,
    onSubmit,
    isLoading = false,
}: UserFormModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [role, setRole] = useState<Role>('user');
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        password_confirmation?: string;
    }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors: typeof errors = {};

        if (!name.trim()) newErrors.name = 'Nama lengkap wajib diisi';
        if (!email.trim()) newErrors.email = 'Email wajib diisi';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            newErrors.email = 'Format email tidak valid';
        if (!password) newErrors.password = 'Password wajib diisi (minimal 8 karakter)';
        else if (password.length < 8)
            newErrors.password = 'Password minimal 8 karakter sesuai standar keamanan API';

        if (password !== passwordConfirmation) {
            newErrors.password_confirmation = 'Konfirmasi password tidak cocok';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        onSubmit({
            name: name.trim(),
            email: email.trim(),
            password,
            password_confirmation: passwordConfirmation,
            role,
        });

        // Reset
        setName('');
        setEmail('');
        setPassword('');
        setPasswordConfirmation('');
        setRole('user');
        setErrors({});
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Tambah Akun Pengguna Baru"
            description="Sebagai Administrator, Anda dapat mendaftarkan akun baru secara langsung ke dalam sistem TaskTeam."
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nama Lengkap *"
                    placeholder="Contoh: Budi Santoso"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    error={errors.name}
                    autoFocus
                />

                <Input
                    label="Alamat Email *"
                    type="email"
                    placeholder="budi@example.com"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    error={errors.email}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                        label="Kata Sandi *"
                        type="password"
                        placeholder="Min. 8 karakter"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                        }}
                        error={errors.password}
                    />

                    <Input
                        label="Konfirmasi Sandi *"
                        type="password"
                        placeholder="Ulangi password"
                        value={passwordConfirmation}
                        onChange={(e) => {
                            setPasswordConfirmation(e.target.value);
                            if (errors.password_confirmation)
                                setErrors({ ...errors, password_confirmation: undefined });
                        }}
                        error={errors.password_confirmation}
                    />
                </div>

                <Select
                    label="Peran / Hak Akses (Role) *"
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                >
                    <option value="user">Pengguna Biasa (User)</option>
                    <option value="admin">Administrator Sistem</option>
                </Select>

                <div className="flex justify-end gap-2.5 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                        Simpan Akun Pengguna
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
