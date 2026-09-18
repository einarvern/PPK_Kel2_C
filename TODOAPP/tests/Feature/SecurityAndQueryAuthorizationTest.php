<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class SecurityAndQueryAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * FR-03 & FR-06: Permintaan dari user yang tidak berwenang harus ditolak
     * melalui kondisi authorization pada query (WHERE id = ? AND owner_id = ?).
     */
    public function test_unauthorized_user_cannot_delete_other_user_project(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $member = User::factory()->create();

        $project = Project::create([
            'name' => 'Secret Project',
            'description' => 'Confidential roadmap',
            'owner_id' => $owner->id,
        ]);

        $project->members()->attach($member->id);

        $task = $project->tasks()->create([
            'title' => 'Important Task',
            'priority' => 'high',
            'status' => 'todo',
        ]);

        // 1. Stranger mencoba menghapus via API -> Ditolak (403 Forbidden)
        $this->deleteJson('/api/projects/'.$project->id, [], $this->authHeaders($stranger))
            ->assertForbidden();

        // 2. Member (bukan owner) mencoba menghapus via API -> Ditolak (403 Forbidden)
        $this->deleteJson('/api/projects/'.$project->id, [], $this->authHeaders($member))
            ->assertForbidden();

        // 3. Stranger mencoba menghapus via Web route -> Ditolak (403 Forbidden)
        $this->actingAs($stranger)
            ->delete('/projects/'.$project->id)
            ->assertForbidden();

        // 4. Pastikan data tidak terhapus sama sekali di database
        $this->assertDatabaseHas('projects', ['id' => $project->id]);
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $member->id,
        ]);
    }

    /**
     * FR-02, FR-03 & FR-04: Owner dapat menghapus project miliknya secara atomic
     * beserta seluruh task dan keanggotaan.
     */
    public function test_owner_can_delete_project_with_query_authorization_and_cascade_cleanup(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $project = Project::create([
            'name' => 'Project to Delete',
            'description' => 'Cleanup test',
            'owner_id' => $owner->id,
        ]);

        $project->members()->attach($member->id);

        $task1 = $project->tasks()->create([
            'title' => 'Task 1',
            'priority' => 'low',
            'status' => 'todo',
        ]);

        $task2 = $project->tasks()->create([
            'title' => 'Task 2',
            'priority' => 'medium',
            'status' => 'done',
        ]);

        // Owner menghapus via API
        $response = $this->deleteJson('/api/projects/'.$project->id, [], $this->authHeaders($owner));

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('message', 'Proyek berhasil dihapus.');

        // Seluruh data terkait bersih terhapus
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseMissing('tasks', ['id' => $task1->id]);
        $this->assertDatabaseMissing('tasks', ['id' => $task2->id]);
        $this->assertDatabaseMissing('project_members', [
            'project_id' => $project->id,
            'user_id' => $member->id,
        ]);
    }

    /**
     * FR-02 & FR-03: Owner dapat menghapus project melalui web route.
     */
    public function test_owner_can_delete_project_via_web_route(): void
    {
        $owner = User::factory()->create();
        $project = Project::create([
            'name' => 'Web Delete Project',
            'owner_id' => $owner->id,
        ]);

        $task = $project->tasks()->create([
            'title' => 'Web Task',
            'priority' => 'high',
            'status' => 'todo',
        ]);

        $this->actingAs($owner)
            ->delete('/projects/'.$project->id)
            ->assertRedirect(route('dashboard'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }

    /**
     * FR-03 & FR-05: Verifikasi Prepared Statement dan Parameter Binding pada Query.
     * Query authorization menggunakan parameter current_user_id secara terpisah (bound parameter).
     */
    public function test_query_authorization_uses_prepared_statement_bindings(): void
    {
        $owner = User::factory()->create();
        $project = Project::create([
            'name' => 'Audit Project',
            'owner_id' => $owner->id,
        ]);

        DB::flushQueryLog();
        DB::enableQueryLog();

        $this->deleteJson('/api/projects/'.$project->id, [], $this->authHeaders($owner))
            ->assertOk();

        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        $this->assertNotEmpty($queries);

        // Cari query delete project yang menggunakan WHERE id = ? AND owner_id = ?
        $foundDeleteQuery = false;
        foreach ($queries as $query) {
            $sql = strtolower($query['query']);
            if (str_contains($sql, 'delete') && str_contains($sql, 'projects') && str_contains($sql, 'owner_id')) {
                $foundDeleteQuery = true;
                // Pastikan parameter id dan owner_id berada di dalam bindings array (prepared statement)
                $this->assertContains($project->id, $query['bindings']);
                $this->assertContains($owner->id, $query['bindings']);
                break;
            }
        }

        $this->assertTrue($foundDeleteQuery, 'Query DELETE projects dengan filter WHERE owner_id = ? dan parameter binding harus dijalankan.');
    }

    /**
     * FR-06: Query-level authorization menolak akses dan mutasi task milik project lain.
     */
    public function test_user_cannot_access_or_mutate_other_users_tasks(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();

        $project = Project::create([
            'name' => 'Owner Private Project',
            'owner_id' => $owner->id,
        ]);

        $task = $project->tasks()->create([
            'title' => 'Confidential Task',
            'priority' => 'high',
            'status' => 'todo',
        ]);

        $strangerHeaders = $this->authHeaders($stranger);

        // Stranger mencoba melihat tasks
        $this->getJson('/api/projects/'.$project->id.'/tasks', $strangerHeaders)
            ->assertForbidden();

        // Stranger mencoba mengupdate task
        $this->putJson('/api/tasks/'.$task->id, ['title' => 'Hacked Task'], $strangerHeaders)
            ->assertForbidden();

        // Stranger mencoba mengupdate status task
        $this->patchJson('/api/tasks/'.$task->id.'/status', ['status' => 'done'], $strangerHeaders)
            ->assertForbidden();

        // Stranger mencoba menghapus task
        $this->deleteJson('/api/tasks/'.$task->id, [], $strangerHeaders)
            ->assertForbidden();

        // Nilai task di database tidak berubah
        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'title' => 'Confidential Task',
            'status' => 'todo',
        ]);
    }

    /**
     * FR-04: Transaksi multi-step di-rollback apabila salah satu langkah gagal.
     */
    public function test_atomic_transaction_rolls_back_on_failure(): void
    {
        $owner = User::factory()->create();
        $member = User::factory()->create();

        $project = Project::create([
            'name' => 'Atomic Test Project',
            'owner_id' => $owner->id,
        ]);

        $project->members()->attach($member->id);

        $task = $project->tasks()->create([
            'title' => 'Task to preserve',
            'priority' => 'high',
            'status' => 'todo',
        ]);

        // Simulasikan transaksi yang gagal di langkah terakhir
        try {
            DB::transaction(function () use ($project): void {
                // Langkah 1: Hapus task
                $project->tasks()->delete();

                // Langkah 2: Hapus member
                $project->members()->detach();

                // Langkah 3: Mensimulasikan exception sebelum commit
                throw new \RuntimeException('Simulated failure during deletion');
            });
        } catch (\RuntimeException $e) {
            // Exception tertangkap
        }

        // Karena di-rollback, data task dan member HARUS tetap ada
        $this->assertDatabaseHas('projects', ['id' => $project->id]);
        $this->assertDatabaseHas('tasks', ['id' => $task->id]);
        $this->assertDatabaseHas('project_members', [
            'project_id' => $project->id,
            'user_id' => $member->id,
        ]);
    }

    /**
     * FR-05: Parameter binding aman terhadap SQL Injection attempts.
     */
    public function test_sql_injection_attempt_is_safely_handled(): void
    {
        $owner = User::factory()->create();
        $headers = $this->authHeaders($owner);

        $project = Project::create([
            'name' => 'Sort Test Project',
            'owner_id' => $owner->id,
        ]);

        // Percobaan SQL Injection pada parameter sort
        $maliciousSort = "priority' OR '1'='1";
        $this->getJson('/api/projects/'.$project->id.'/tasks?sort='.$maliciousSort, $headers)
            ->assertUnprocessable(); // Validasi menolak input yang tidak valid

        // Percobaan SQL Injection pada name saat create project
        $maliciousName = "Test Project'); DROP TABLE users; --";
        $response = $this->postJson('/api/projects', [
            'name' => $maliciousName,
            'description' => 'Test injection',
        ], $headers);

        $response->assertCreated();

        // Tabel users tetap ada dan aman
        $this->assertDatabaseHas('users', ['id' => $owner->id]);
        $this->assertDatabaseHas('projects', ['name' => $maliciousName]);
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
