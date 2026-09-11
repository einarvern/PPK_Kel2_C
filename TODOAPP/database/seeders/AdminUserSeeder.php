<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Akun Administrator Utama
        User::updateOrCreate(
            ['email' => 'admin@taskteam.test'],
            [
                'name' => 'Administrator TaskTeam',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 2. Akun Administrator Tambahan (admin@example.com)
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin Sistem',
                'password' => Hash::make('password123'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // 3. Akun Pengguna Biasa (Rio Setiawan)
        User::updateOrCreate(
            ['email' => 'rio@taskteam.test'],
            [
                'name' => 'Rio Setiawan',
                'password' => Hash::make('password123'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
    }
}
