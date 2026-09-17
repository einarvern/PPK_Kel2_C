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
    deadline_filter?: 'all' | 'due_soon' | 'overdue';
    sort?:
        | 'default'
        | 'priority_desc'
        | 'priority_asc'
        | 'deadline_asc'
        | 'deadline_desc';
};
