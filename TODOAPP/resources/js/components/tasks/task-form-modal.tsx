import React, { useState, useEffect } from 'react';
import type { Task, TaskPriority, TaskStatus } from '../../types';
import { Modal } from '../ui/modal';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select } from '../ui/select';
import { Button } from '../ui/button';

interface TaskFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: {
        title: string;
        description: string;
        priority: TaskPriority;
        status: TaskStatus;
        deadline: string | null;
    }) => void;
    task?: Task | null;
    defaultStatus?: TaskStatus;
    isLoading?: boolean;
}

export function TaskFormModal({
    isOpen,
    onClose,
    onSubmit,
    task,
    defaultStatus = 'todo',
    isLoading = false,
}: TaskFormModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<TaskPriority>('medium');
    const [status, setStatus] = useState<TaskStatus>(defaultStatus);
    const [deadline, setDeadline] = useState('');
    const [errors, setErrors] = useState<{ title?: string }>({});

    useEffect(() => {
        if (task) {
            setTitle(task.title);
            setDescription(task.description || '');
            setPriority(task.priority);
            setStatus(task.status);
            setDeadline(task.deadline ? task.deadline.substring(0, 10) : '');
        } else {
            setTitle('');
            setDescription('');
            setPriority('medium');
            setStatus(defaultStatus);
            setDeadline('');
        }
        setErrors({});
    }, [task, defaultStatus, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setErrors({ title: 'Judul tugas wajib diisi' });
            return;
        }

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            priority,
            status,
            deadline: deadline ? deadline : null,
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={task ? 'Edit Tugas' : 'Tambah Tugas Baru'}
            description={
                task
                    ? 'Perbarui detail tugas, tenggat waktu, atau status progres.'
                    : 'Tambahkan rincian pekerjaan baru ke dalam proyek ini.'
            }
            maxWidth="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Judul Tugas *"
                    placeholder="Contoh: Membuat rancangan skema database"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) setErrors({});
                    }}
                    error={errors.title}
                    autoFocus
                />

                <Textarea
                    label="Deskripsi Tugas (Opsional)"
                    placeholder="Tuliskan catatan, langkah pengerjaan, atau link referensi..."
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Select
                        label="Prioritas"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    >
                        <option value="low">Rendah (Low)</option>
                        <option value="medium">Sedang (Medium)</option>
                        <option value="high">Tinggi (High)</option>
                    </Select>

                    <Select
                        label="Status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    >
                        <option value="todo">Belum dikerjakan</option>
                        <option value="in_progress">Sedang dikerjakan</option>
                        <option value="done">Selesai</option>
                    </Select>
                </div>

                <Input
                    label="Tenggat Waktu / Deadline (Opsional)"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    helperText="Tugas akan disorot jika mendekati atau melewati tanggal ini."
                />

                <div className="flex justify-end gap-2.5 pt-4">
                    <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                        Batal
                    </Button>
                    <Button type="submit" variant="primary" isLoading={isLoading}>
                        {task ? 'Simpan Perubahan' : 'Tambah Tugas'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
