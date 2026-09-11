import type { User } from './auth';

export type Project = {
    id: number;
    name: string;
    description?: string | null;
    owner_id: number;
    owner?: User;
    created_at?: string;
    updated_at?: string;
    members_count?: number;
    tasks_count?: number;
    completed_tasks_count?: number;
    progress_percentage?: number;
    is_owner?: boolean;
};

export type ProjectMember = {
    id: number;
    project_id: number;
    user_id: number;
    user: User;
    joined_at?: string;
};

export type ProjectStats = {
    total_projects: number;
    owned_projects: number;
    member_projects: number;
    total_tasks: number;
    completed_tasks: number;
    overall_progress: number;
};
