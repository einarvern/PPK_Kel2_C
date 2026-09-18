<?php

namespace Tests\Feature;

use App\Models\Project;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class ProjectCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_project_via_web_session_and_becomes_owner(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/projects', [
            'name' => 'Proyek Web Rio',
            'description' => 'Ruang kerja pengembangan to-do list',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('success', 'Proyek baru berhasil dibuat!');

        $this->assertDatabaseHas('projects', [
            'name' => 'Proyek Web Rio',
            'description' => 'Ruang kerja pengembangan to-do list',
            'owner_id' => $user->id,
        ]);

        $project = Project::where('name', 'Proyek Web Rio')->firstOrFail();
        $this->assertTrue($project->isOwnedBy($user));
    }

    public function test_user_can_create_project_via_rest_api_and_becomes_owner(): void
    {
        $user = User::factory()->create();
        $token = $this->tokenFor($user);

        $response = $this->postJson('/api/projects', [
            'name' => 'Proyek API Rio',
            'description' => 'Dibuat via REST API',
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.name', 'Proyek API Rio')
            ->assertJsonPath('data.owner_id', $user->id);

        $this->assertDatabaseHas('projects', [
            'name' => 'Proyek API Rio',
            'owner_id' => $user->id,
        ]);
    }

    public function test_owner_id_cannot_be_spoofed_via_web_request(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // User A attempts to forge owner_id as User B
        $this->actingAs($userA)->post('/projects', [
            'name' => 'Proyek Percobaan Manipulasi Web',
            'description' => 'Mencoba menetapkan owner_id orang lain',
            'owner_id' => $userB->id,
        ])->assertRedirect();

        $project = Project::where('name', 'Proyek Percobaan Manipulasi Web')->firstOrFail();

        // Must still belong to User A (the authenticated user)
        $this->assertSame($userA->id, $project->owner_id);
        $this->assertNotSame($userB->id, $project->owner_id);
    }

    public function test_owner_id_cannot_be_spoofed_via_api_request(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();
        $token = $this->tokenFor($userA);

        // User A attempts to forge owner_id as User B in API JSON payload
        $response = $this->postJson('/api/projects', [
            'name' => 'Proyek Percobaan Manipulasi API',
            'description' => 'Mencoba menetapkan owner_id orang lain via API',
            'owner_id' => $userB->id,
        ], ['Authorization' => "Bearer {$token}"]);

        $response->assertCreated()
            ->assertJsonPath('data.owner_id', $userA->id);

        $project = Project::where('name', 'Proyek Percobaan Manipulasi API')->firstOrFail();
        $this->assertSame($userA->id, $project->owner_id);
    }

    public function test_create_project_validates_required_name(): void
    {
        $user = User::factory()->create();

        // Web validation
        $this->actingAs($user)->post('/projects', [
            'name' => '',
            'description' => 'Deskripsi tanpa nama',
        ])->assertSessionHasErrors('name');

        // API validation
        $token = $this->tokenFor($user);
        $this->postJson('/api/projects', [
            'name' => '',
        ], ['Authorization' => "Bearer {$token}"])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_create_project_validates_maximum_name_length(): void
    {
        $user = User::factory()->create();
        $tooLongName = str_repeat('a', 256);

        // Web validation
        $this->actingAs($user)->post('/projects', [
            'name' => $tooLongName,
        ])->assertSessionHasErrors('name');

        // API validation
        $token = $this->tokenFor($user);
        $this->postJson('/api/projects', [
            'name' => $tooLongName,
        ], ['Authorization' => "Bearer {$token}"])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('name');
    }

    public function test_unauthenticated_guest_cannot_create_project(): void
    {
        // Web guest
        $this->post('/projects', [
            'name' => 'Proyek Tamu',
        ])->assertRedirect(route('login'));

        // API guest
        $this->postJson('/api/projects', [
            'name' => 'Proyek Tamu API',
        ])->assertUnauthorized();
    }

    public function test_admin_cannot_create_project_due_to_role_boundaries(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        // Web admin
        $this->actingAs($admin)->post('/projects', [
            'name' => 'Proyek Oleh Admin',
        ])->assertForbidden();

        // API admin
        $token = $this->tokenFor($admin);
        $this->postJson('/api/projects', [
            'name' => 'Proyek API Admin',
        ], ['Authorization' => "Bearer {$token}"])->assertForbidden();
    }

    private function tokenFor(User $user): string
    {
        $token = bin2hex(random_bytes(32));

        DB::table('api_tokens')->insert([
            'user_id' => $user->id,
            'token_hash' => hash('sha256', $token),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $token;
    }
}
