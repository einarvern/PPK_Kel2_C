<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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

        $this->getJson('/api/projects/'.$project->id, $this->authHeaders($owner))->assertOk();
        $this->getJson('/api/projects/'.$project->id, $this->authHeaders($member))->assertOk();
        $this->getJson('/api/projects/'.$project->id, $this->authHeaders($stranger))->assertForbidden();
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
            'priority' => 'high',
            'status' => 'done',
        ]);

        $project->tasks()->create([
            'title' => 'QA',
            'description' => 'Run regression tests',
            'priority' => 'medium',
            'status' => 'todo',
        ]);

        $this->getJson('/api/projects/'.$project->id.'/progress', $this->authHeaders($owner))
            ->assertOk()
            ->assertJsonPath('progress', 50)
            ->assertJsonPath('counts.completed', 1)
            ->assertJsonPath('counts.pending', 1)
            ->assertJsonPath('counts.in_progress', 0);
    }

    public function test_authenticated_user_can_create_project_and_task_via_api(): void
    {
        $owner = User::factory()->create();
        $headers = $this->authHeaders($owner);

        $project = $this->postJson('/api/projects', [
            'name' => 'Roadmap',
            'description' => 'Launch planning',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('data.owner_id', $owner->id)
            ->json('data.id');

        $this->postJson('/api/projects/'.$project.'/tasks', [
            'title' => 'Design',
            'description' => 'Create welcome screen',
            'priority' => 'high',
            'status' => 'todo',
        ], $headers)
            ->assertCreated()
            ->assertJsonPath('data.status', 'todo');
    }

    /** @return array<string, string> */
    private function authHeaders(User $user): array
    {
        $token = bin2hex(random_bytes(32));

        DB::table('api_tokens')->insert([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return ['Authorization' => 'Bearer '.$token];
    }
}
