<?php

use App\Models\Project;
use App\Models\ProjectMember;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// Show the public landing page to guests and the dashboard to authenticated users.
Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : inertia('welcome');
});

// --- AUTHENTICATION (WEB SESSION) ---
Route::middleware('guest')->group(function () {
    Route::get('/login', function () {
        return inertia('auth/login');
    })->name('login');

    Route::post('/login', function (Request $request) {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();

            if (Auth::user()?->role === 'admin') {
                return redirect()->route('admin.users');
            }

            return redirect()->intended(route('dashboard'));
        }

        return back()->withErrors([
            'email' => 'Email atau kata sandi yang Anda masukkan salah.',
        ])->onlyInput('email');
    });

    Route::get('/register', function () {
        return inertia('auth/register');
    })->name('register');

    Route::post('/register', function (Request $request) {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'user',
        ]);

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->route('dashboard')->with('success', 'Pendaftaran berhasil! Selamat datang di JARA.');
    });
});

Route::post('/logout', function (Request $request) {
    Auth::logout();
    $request->session()->invalidate();
    $request->session()->regenerateToken();

    return redirect()->route('login');
})->name('logout');

// --- PROTECTED APPLICATION ROUTES (AUTHENTICATED) ---
Route::middleware('auth')->group(function () {

    // 1. Dashboard Utama
    Route::get('/dashboard', function () {
        $user = Auth::user();

        if ($user->role === 'admin') {
            return redirect()->route('admin.users');
        }

        // Projects where user is owner
        $ownedProjects = Project::query()
            ->where('owner_id', $user->id)
            ->withDashboardStats()
            ->get()
            ->map(fn (Project $project) => $project->dashboardData(true));

        // Projects where user is member
        $memberProjects = $user->projects()
            ->withDashboardStats()
            ->get()
            ->map(fn (Project $project) => $project->dashboardData(false));

        $projects = $ownedProjects->toBase()->concat($memberProjects->toBase())->values();

        return inertia('dashboard', [
            'projects' => $projects,
        ]);
    })->name('dashboard');

    Route::middleware('role:not-admin')->group(function () {
        // 2. Buat Proyek Baru
        Route::post('/projects', function (Request $request) {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
            ]);

            Project::create([
                'name' => $validated['name'],
                'description' => $validated['description'] ?? null,
                'owner_id' => Auth::id(),
            ]);

            return back()->with('success', 'Proyek baru berhasil dibuat!');
        })->name('projects.store');

        // 3. Detail Proyek & Board Tugas
        Route::get('/projects/{id}', function (int $id) {
            $user = Auth::user();
            /** @var Project|null $project */
            $project = Project::query()
                ->visibleTo($user)
                ->with('owner:id,name,email,role')
                ->where('id', $id)
                ->first();

            if (! $project) {
                abort(Project::whereKey($id)->exists() ? 403 : 404, 'Anda tidak memiliki akses ke proyek ini.');
            }

            $isOwner = $project->isOwnedBy($user);
            $isMember = $project->hasMember($user);

            $tasks = $project->tasks()->get();

            $members = ProjectMember::query()
                ->where('project_id', $project->id)
                ->with('user:id,name,email,role')
                ->get()
                ->map(fn (ProjectMember $member) => [
                    'id' => $member->id,
                    'project_id' => $project->id,
                    'user_id' => $member->user_id,
                    'user' => [
                        'id' => $member->user->id,
                        'name' => $member->user->name,
                        'email' => $member->user->email,
                        'role' => $member->user->role,
                    ],
                    'joined_at' => $member->created_at?->toDateString(),
                ]);

            return inertia('projects/show', [
                'project' => [
                    'id' => $project->id,
                    'name' => $project->name,
                    'description' => $project->description,
                    'owner_id' => $project->owner_id,
                    'owner' => $project->owner->only(['id', 'name', 'email', 'role']),
                    'is_owner' => $isOwner,
                    'created_at' => $project->created_at?->toDateString(),
                ],
                'tasks' => $tasks,
                'members' => $members,
            ]);
        })->name('projects.show');

        // Hapus Proyek (FR-02, FR-03, FR-04)
        Route::delete('/projects/{id}', function (int $id) {
            $user = Auth::user();
            /** @var Project|null $project */
            $project = Project::query()
                ->where('id', $id)
                ->where('owner_id', $user->id)
                ->first();

            if (! $project) {
                abort(Project::whereKey($id)->exists() ? 403 : 404, 'Hanya pemilik proyek yang dapat menghapus proyek ini.');
            }

            DB::transaction(function () use ($project, $user): void {
                $project->tasks()->delete();
                $project->members()->detach();
                Project::query()
                    ->where('id', $project->id)
                    ->where('owner_id', $user->id)
                    ->delete();
            });

            return redirect()->route('dashboard')->with('success', 'Proyek berhasil dihapus!');
        })->name('projects.destroy');

        // 4. Tambah Tugas Baru dalam Proyek
        Route::post('/projects/{id}/tasks', function (Request $request, int $id) {
            $user = Auth::user();
            /** @var Project|null $project */
            $project = Project::query()
                ->visibleTo($user)
                ->where('id', $id)
                ->first();

            if (! $project) {
                abort(Project::whereKey($id)->exists() ? 403 : 404, 'Anda tidak memiliki akses ke proyek ini.');
            }

            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'priority' => ['required', 'in:low,medium,high'],
                'status' => ['required', 'in:todo,in_progress,done'],
                'deadline' => ['nullable', 'date'],
            ]);

            $project->tasks()->create([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'priority' => $validated['priority'],
                'status' => $validated['status'],
                'deadline' => $validated['deadline'] ?? null,
            ]);

            return back()->with('success', 'Tugas berhasil ditambahkan ke proyek!');
        })->name('tasks.store');

        // 5. Update Status / Edit / Hapus Tugas
        Route::patch('/tasks/{id}', function (Request $request, int $id) {
            $user = Auth::user();
            /** @var Task|null $task */
            $task = Task::query()
                ->visibleTo($user)
                ->where('id', $id)
                ->first();

            if (! $task) {
                abort(Task::whereKey($id)->exists() ? 403 : 404, 'Anda tidak memiliki akses ke proyek ini.');
            }

            $validated = $request->validate([
                'status' => ['required', 'in:todo,in_progress,done'],
            ]);

            $task->update($validated);

            return back()->with('success', 'Status tugas berhasil diperbarui!');
        })->name('tasks.updateStatus');

        Route::put('/tasks/{id}', function (Request $request, int $id) {
            $user = Auth::user();
            /** @var Task|null $task */
            $task = Task::query()
                ->visibleTo($user)
                ->where('id', $id)
                ->first();

            if (! $task) {
                abort(Task::whereKey($id)->exists() ? 403 : 404, 'Anda tidak memiliki akses ke proyek ini.');
            }

            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
                'description' => ['nullable', 'string'],
                'priority' => ['required', 'in:low,medium,high'],
                'status' => ['required', 'in:todo,in_progress,done'],
                'deadline' => ['nullable', 'date'],
            ]);

            $task->update([
                'title' => $validated['title'],
                'description' => $validated['description'] ?? null,
                'priority' => $validated['priority'],
                'status' => $validated['status'],
                'deadline' => $validated['deadline'] ?? null,
            ]);

            return back()->with('success', 'Tugas berhasil diperbarui!');
        })->name('tasks.update');

        Route::delete('/tasks/{id}', function (int $id) {
            $user = Auth::user();
            /** @var Task|null $task */
            $task = Task::query()
                ->visibleTo($user)
                ->where('id', $id)
                ->first();

            if (! $task) {
                abort(Task::whereKey($id)->exists() ? 403 : 404, 'Anda tidak memiliki akses ke proyek ini.');
            }
            $task->delete();

            return back()->with('success', 'Tugas berhasil dihapus!');
        })->name('tasks.destroy');

        // 6. Kelola Anggota Proyek (Invite & Remove Member)
        Route::post('/projects/{id}/members', function (Request $request, int $id) {
            $user = Auth::user();
            /** @var Project|null $project */
            $project = Project::query()
                ->where('id', $id)
                ->where('owner_id', $user->id)
                ->first();

            if (! $project) {
                abort(Project::whereKey($id)->exists() ? 403 : 404, 'Hanya pemilik proyek yang dapat menambah anggota.');
            }

            $validated = $request->validate([
                'email' => ['required', 'email', 'exists:users,email'],
            ], [
                'email.exists' => 'Pengguna dengan email ini belum terdaftar di sistem.',
            ]);

            $targetUser = User::where('email', $validated['email'])->firstOrFail();

            if ($targetUser->role === 'admin') {
                return back()->withErrors(['email' => 'Admin tidak dapat bergabung ke proyek.']);
            }

            if ($project->isOwnedBy($targetUser)) {
                return back()->withErrors(['email' => 'Pemilik proyek sudah otomatis menjadi anggota.']);
            }

            if ($project->hasMember($targetUser)) {
                return back()->withErrors(['email' => 'Pengguna ini sudah menjadi anggota proyek.']);
            }

            $project->members()->attach($targetUser->id);

            return back()->with('success', "{$targetUser->name} berhasil ditambahkan ke proyek!");
        })->name('projects.members.store');

        Route::delete('/projects/{id}/members/{userId}', function (int $id, int $userId) {
            $user = Auth::user();
            /** @var Project|null $project */
            $project = Project::query()
                ->where('id', $id)
                ->where('owner_id', $user->id)
                ->first();

            if (! $project) {
                abort(Project::whereKey($id)->exists() ? 403 : 404, 'Hanya pemilik proyek yang dapat menghapus anggota.');
            }

            $member = User::findOrFail($userId);
            abort_unless($project->members()->whereKey($member->id)->exists(), 404, 'Pengguna bukan anggota proyek ini.');

            $project->members()->detach($member->id);

            return back()->with('success', 'Anggota berhasil dikeluarkan dari proyek.');
        })->name('projects.members.destroy');
    });

    // 7. Panel Admin (Khusus Role Admin)
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', function () {
            $users = User::query()
                ->select(['id', 'name', 'email', 'role', 'created_at'])
                ->latest()
                ->get();

            return inertia('admin/users', [
                'users' => $users,
            ]);
        })->name('admin.users');

        Route::post('/users', function (Request $request) {
            $validated = $request->validate([
                'name' => ['required', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:users,email'],
                'password' => ['required', 'string', 'min:8', 'confirmed'],
                'role' => ['required', 'in:user,admin'],
            ]);

            User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'role' => $validated['role'],
            ]);

            return back()->with('success', 'Pengguna baru berhasil ditambahkan oleh Admin!');
        })->name('admin.users.store');

        Route::delete('/users/{user}', function (User $user) {
            if ($user->id === Auth::id()) {
                return back()->withErrors(['error' => 'Anda tidak dapat menghapus akun Anda sendiri.']);
            }

            $user->delete();

            return back()->with('success', 'Pengguna berhasil dihapus dari sistem.');
        })->name('admin.users.destroy');
    });

});
