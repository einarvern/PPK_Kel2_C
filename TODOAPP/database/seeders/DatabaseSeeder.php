<?php

namespace Database\Seeders;

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Panggil seeder akun Admin & Pengguna
        $this->call(AdminUserSeeder::class);

        // Siapkan sampel proyek dan tugas untuk pengujian visual & integrasi
        $admin = User::where('email', 'admin@taskteam.test')->first();
        $user = User::where('email', 'rio@taskteam.test')->first();

        if ($user) {
            $project = Project::firstOrCreate(
                [
                    'name' => 'Pengembangan Web TaskTeam (Jara)',
                    'owner_id' => $user->id,
                ],
                [
                    'description' => 'Aplikasi web manajemen tugas tim dengan Kanban board interaktif, pemantauan progres visual, dan manajemen anggota.',
                ]
            );

            Task::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'title' => 'Setup Laravel Starter Kit & React',
                ],
                [
                    'description' => 'Inisialisasi repositori, Tailwind CSS v4, dan struktur komponen TypeScript.',
                    'priority' => 'high',
                    'status' => 'done',
                    'deadline' => date('Y-m-d', strtotime('+2 days')),
                ]
            );

            Task::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'title' => 'Implementasi Task Board & Filter',
                ],
                [
                    'description' => 'Membangun kolom Kanban, filter status & prioritas, serta pemantauan deadline.',
                    'priority' => 'medium',
                    'status' => 'in_progress',
                    'deadline' => date('Y-m-d', strtotime('+3 days')),
                ]
            );

            Task::firstOrCreate(
                [
                    'project_id' => $project->id,
                    'title' => 'Pengujian Fitur Kolaborasi Anggota',
                ],
                [
                    'description' => 'Menguji form invite anggota via email dan proteksi hak akses pemilik.',
                    'priority' => 'low',
                    'status' => 'todo',
                    'deadline' => date('Y-m-d', strtotime('+7 days')),
                ]
            );

            if ($admin && ! $project->members()->where('users.id', $admin->id)->exists()) {
                $project->members()->attach($admin->id);
            }
        }
    }
}
