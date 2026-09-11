<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_login_access_and_logout(): void
    {
        $register = $this->postJson('/api/register', [
            'name' => 'Rafi',
            'email' => 'rafi@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $register->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.role', 'user');

        $login = $this->postJson('/api/login', [
            'email' => 'rafi@example.com',
            'password' => 'password123',
        ]);

        $login->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.user.email', 'rafi@example.com');

        $token = $login->json('data.token');

        $this->getJson('/api/me', ['Authorization' => "Bearer {$token}"])
            ->assertOk()
            ->assertJsonPath('data.user.email', 'rafi@example.com');

        $this->postJson('/api/logout', [], ['Authorization' => "Bearer {$token}"])
            ->assertOk();

        $this->getJson('/api/me', ['Authorization' => "Bearer {$token}"])
            ->assertUnauthorized();
    }

    public function test_only_admin_can_manage_users(): void
    {
        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->getJson('/api/admin/users', [
            'Authorization' => 'Bearer '.$this->tokenFor($user),
        ])->assertForbidden();

        $this->postJson('/api/admin/users', [
            'name' => 'New User',
            'email' => 'new@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ], [
            'Authorization' => 'Bearer '.$this->tokenFor($admin),
        ])->assertCreated();

        $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
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
