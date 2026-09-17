<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
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

    public function test_project_members_share_the_same_task_workspace(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $outsider = User::factory()->create();
        $project = Project::create(['name' => 'Shared workspace', 'owner_id' => $owner->id]);
        $project->members()->attach($member->id);

        $taskId = $this->postJson('/api/projects/'.$project->id.'/tasks', [
            'title' => 'Implement shared task board',
            'priority' => 'high',
            'status' => 'todo',
        ], $this->authHeaders($member))
            ->assertCreated()
            ->json('data.id');

        $this->putJson('/api/tasks/'.$taskId, [
            'priority' => 'medium',
        ], $this->authHeaders($owner))
            ->assertOk()
            ->assertJsonPath('data.priority', 'medium');

        $this->patchJson('/api/tasks/'.$taskId.'/status', [
            'status' => 'done',
        ], $this->authHeaders($member))
            ->assertOk()
            ->assertJsonPath('data.status', 'done');

        $this->postJson('/api/projects/'.$project->id.'/tasks', [
            'title' => 'Unauthorized task',
            'priority' => 'low',
            'status' => 'todo',
        ], $this->authHeaders($outsider))->assertForbidden();
    }

    public function test_web_task_routes_reject_users_who_do_not_belong_to_the_project(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $project = Project::create(['name' => 'Private list', 'owner_id' => $owner->id]);
        $task = Task::create([
            'project_id' => $project->id,
            'title' => 'Private task',
            'priority' => 'medium',
            'status' => 'todo',
        ]);

        $this->actingAs($stranger)
            ->post('/projects/'.$project->id.'/tasks', [
                'title' => 'Unauthorized task',
                'priority' => 'low',
                'status' => 'todo',
            ])
            ->assertForbidden();

        $this->actingAs($stranger)
            ->patch('/tasks/'.$task->id, ['status' => 'done'])
            ->assertForbidden();

        $this->actingAs($stranger)
            ->delete('/tasks/'.$task->id)
            ->assertForbidden();
    }

    public function test_task_api_can_sort_by_priority_and_deadline(): void
    {
        $owner = User::factory()->create();
        $project = Project::create(['name' => 'Sorted list', 'owner_id' => $owner->id]);
        $project->tasks()->createMany([
            ['title' => 'Low', 'priority' => 'low', 'status' => 'todo', 'deadline' => '2026-10-03'],
            ['title' => 'High', 'priority' => 'high', 'status' => 'todo', 'deadline' => '2026-10-01'],
            ['title' => 'Medium', 'priority' => 'medium', 'status' => 'todo', 'deadline' => '2026-10-02'],
        ]);

        $headers = $this->authHeaders($owner);

        $this->getJson('/api/projects/'.$project->id.'/tasks?sort=priority&direction=desc', $headers)
            ->assertOk()
            ->assertJsonPath('data.0.title', 'High');

        $this->getJson('/api/projects/'.$project->id.'/tasks?sort=deadline&direction=asc', $headers)
            ->assertOk()
            ->assertJsonPath('data.0.title', 'High');
    }

    public function test_only_project_owner_can_add_and_remove_members(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();
        $candidate = User::factory()->create();
        $project = Project::create(['name' => 'Team list', 'owner_id' => $owner->id]);
        $project->members()->attach($member->id);

        $this->postJson('/api/projects/'.$project->id.'/members', [
            'email' => $candidate->email,
        ], $this->authHeaders($member))->assertForbidden();

        $this->postJson('/api/projects/'.$project->id.'/members', [
            'email' => $candidate->email,
        ], $this->authHeaders($owner))->assertOk();

        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $candidate->id,
        ]);

        $this->deleteJson('/api/projects/'.$project->id.'/members/'.$candidate->id, [], $this->authHeaders($owner))
            ->assertOk();

        $this->assertDatabaseMissing('project_members', [
            'project_id' => $project->id,
            'user_id' => $candidate->id,
        ]);
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
