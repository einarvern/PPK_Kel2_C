import React, { useState, useEffect } from 'react';
import type { Project } from '../../types';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';

interface ProjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { name: string; description: string }) => void;
    project?: Project | null;
    isLoading?: boolean;
    serverErrors?: Record<string, string>;
}

export function ProjectFormModal({
    isOpen,
    onClose,
    onSubmit,
    project,
    isLoading = false,
    serverErrors = {},
}: ProjectFormModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState<{ name?: string }>({});

    useEffect(() => {
        if (project) {
            setName(project.name);
            setDescription(project.description || '');
        } else {
            setName('');
            setDescription('');
        }
        setErrors({});
    }, [project, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = name.trim();
        if (!trimmedName) {
            setErrors({ name: 'Nama proyek wajib diisi.' });
            return;
        }
        if (trimmedName.length > 255) {
            setErrors({ name: 'Nama proyek maksimal 255 karakter.' });
            return;
        }
        onSubmit({ name: trimmedName, description: description.trim() });
    };

    const nameError = errors.name || serverErrors.name;
    const descriptionError = serverErrors.description;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={project ? 'Ubah Informasi Proyek' : 'Buat Proyek Baru'}
            description={
                project
                    ? 'Perbarui nama dan deskripsi ruang kerja proyek ini.'
                    : 'Buat ruang kerja baru untuk mengelola tugas pribadi atau kolaborasi tim. Anda akan otomatis menjadi pemilik proyek ini.'
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nama Proyek*"
                    placeholder="Contoh: Pengembangan Aplikasi Web JARA"
                    value={name}
                    maxLength={255}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name || serverErrors.name) setErrors({});
                    }}
                    error={nameError}
                    helperText={!nameError ? 'Maksimal 255 karakter' : undefined}
                    autoFocus
                />

                <Textarea
                    label="Deskripsi Proyek"
                    placeholder="Jelaskan tujuan dan ruang lingkup proyek ini (opsional)..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    error={descriptionError}
                />

                <div className="flex justify-end gap-2.5 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Batal
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        isLoading={isLoading}
                    >
                        {project ? 'Simpan Perubahan' : 'Buat Proyek'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
