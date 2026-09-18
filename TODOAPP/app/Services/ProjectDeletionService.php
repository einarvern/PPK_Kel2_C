<?php

namespace App\Services;

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class ProjectDeletionService
{
    /**
     * Delete a project and its related records as one atomic operation.
     */
    public function delete(Project $project): void
    {
        DB::transaction(function () use ($project): void {
            Task::query()
                ->where('project_id', $project->id)
                ->delete();

            ProjectMember::query()
                ->where('project_id', $project->id)
                ->delete();

            if (! $project->delete()) {
                throw new RuntimeException('Proyek tidak dapat dihapus.');
            }
        });
    }
}
