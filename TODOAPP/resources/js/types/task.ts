export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type Task = {
    id: number;
    project_id: number;
    title: string;
    description?: string | null;
    priority: TaskPriority;
    status: TaskStatus;
    deadline?: string | null;
    is_due_soon?: boolean;
    is_overdue?: boolean;
    created_at?: string;
    updated_at?: string;
};

export type TaskFilter = {
    search?: string;
    priority?: TaskPriority | 'all';
    status?: TaskStatus | 'all';
    deadline_filter?: 'all' | 'due_soon' | 'overdue';
    sort?: 'default' | 'priority_desc' | 'priority_asc' | 'deadline_asc' | 'deadline_desc';
};

// UI Label Mappings
export const priorityLabels: Record<TaskPriority, string> = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi',
};

export const statusLabels: Record<TaskStatus, string> = {
    todo: 'Belum dikerjakan',
    in_progress: 'Sedang dikerjakan',
    done: 'Selesai',
};
