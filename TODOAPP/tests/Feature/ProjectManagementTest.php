<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProjectManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_project_owner_and_members_can_access_project_and_tasks(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $stranger = User::factory()->create();

        $project = Project::create([
            'name' => 'Roadmap',
            'description' => 'Launch planning',
            'owner_id' => $owner->id,
        ]);

        $project->members()->attach($member->id);

        $this->actingAs($owner)->get('/projects/' . $project->id)->assertOk();
        $this->actingAs($member)->get('/projects/' . $project->id)->assertOk();
        $this->actingAs($stranger)->get('/projects/' . $project->id)->assertForbidden();
    }

    public function test_project_progress_is_calculated_from_task_statuses(): void
    {
        $owner = User::factory()->create();
        $project = Project::create([
            'name' => 'Release',
            'description' => 'App release tasks',
            'owner_id' => $owner->id,
        ]);

        $project->tasks()->create([
            'title' => 'Design',
            'description' => 'Create welcome screen',
            'priority' => 'Tinggi',
            'status' => 'Selesai',
        ]);

        $project->tasks()->create([
            'title' => 'QA',
            'description' => 'Run regression tests',
            'priority' => 'Sedang',
            'status' => 'Belum dikerjakan',
        ]);

        $this->actingAs($owner)
            ->get('/projects/' . $project->id . '/progress')
            ->assertOk()
            ->assertJsonPath('progress', 50)
            ->assertJsonPath('counts.completed', 1)
            ->assertJsonPath('counts.pending', 1)
            ->assertJsonPath('counts.in_progress', 0);
    }
}
