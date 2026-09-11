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
}

export function ProjectFormModal({
    isOpen,
    onClose,
    onSubmit,
    project,
    isLoading = false,
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
        if (!name.trim()) {
            setErrors({ name: 'Nama proyek wajib diisi' });
            return;
        }
        onSubmit({ name: name.trim(), description: description.trim() });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={project ? 'Ubah Informasi Proyek' : 'Buat Proyek Baru'}
            description={
                project
                    ? 'Perbarui nama dan deskripsi ruang kerja proyek ini.'
                    : 'Tambahkan proyek atau daftar tugas baru untuk mulai mengorganisasi pekerjaan tim Anda.'
            }
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Nama Proyek / Daftar Tugas *"
                    placeholder="Contoh: Pengembangan Website TaskTeam"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({});
                    }}
                    error={errors.name}
                    autoFocus
                />

                <Textarea
                    label="Deskripsi Proyek (Opsional)"
                    placeholder="Tuliskan tujuan singkat, catatan proyek, atau instruksi tim..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="flex justify-end gap-2.5 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                        {project ? 'Simpan Perubahan' : 'Buat Proyek'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
