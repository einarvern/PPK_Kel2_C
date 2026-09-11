<?php

use App\Models\Project;
use App\Models\Task;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;

// Redirect root to dashboard or login
Route::get('/', function () {
    return Auth::check() ? redirect()->route('dashboard') : redirect()->route('login');
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

        return redirect()->route('dashboard')->with('success', 'Pendaftaran berhasil! Selamat datang di TaskTeam.');
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

        // Projects where user is owner
        $ownedProjects = Project::query()
            ->where('owner_id', $user->id)
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
                'members',
            ])
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'owner_id' => $p->owner_id,
                'is_owner' => true,
                'tasks_count' => $p->tasks_count,
                'completed_tasks_count' => $p->completed_tasks_count,
                'progress_percentage' => $p->tasks_count > 0 ? (int) round(($p->completed_tasks_count / $p->tasks_count) * 100) : 0,
                'members_count' => $p->members_count + 1,
            ]);

        // Projects where user is member
        $memberProjects = $user->projects()
            ->withCount([
                'tasks',
                'tasks as completed_tasks_count' => fn ($q) => $q->where('status', 'done'),
                'members',
            ])
            ->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'owner_id' => $p->owner_id,
                'is_owner' => false,
                'tasks_count' => $p->tasks_count,
                'completed_tasks_count' => $p->completed_tasks_count,
                'progress_percentage' => $p->tasks_count > 0 ? (int) round(($p->completed_tasks_count / $p->tasks_count) * 100) : 0,
                'members_count' => $p->members_count + 1,
            ]);

        $projects = $ownedProjects->merge($memberProjects)->values();

        return inertia('dashboard', [
            'projects' => $projects,
        ]);
    })->name('dashboard');

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
    Route::get('/projects/{id}', function ($id) {
        $user = Auth::user();
        $project = Project::findOrFail($id);

        $isOwner = $project->owner_id === $user->id;
        $isMember = $project->members()->where('users.id', $user->id)->exists();

        if (! $isOwner && ! $isMember && $user->role !== 'admin') {
            abort(403, 'Anda tidak memiliki akses ke proyek ini.');
        }

        $tasks = $project->tasks()->get();

        $members = $project->members()
            ->select(['users.id', 'users.name', 'users.email', 'users.role'])
            ->get()
            ->map(fn ($u) => [
                'id' => $u->pivot->id ?? $u->id,
                'project_id' => $project->id,
                'user_id' => $u->id,
                'user' => [
                    'id' => $u->id,
                    'name' => $u->name,
                    'email' => $u->email,
                    'role' => $u->role,
                ],
                'joined_at' => date('Y-m-d'),
            ]);

        return inertia('projects/show', [
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'description' => $project->description,
                'owner_id' => $project->owner_id,
                'is_owner' => $isOwner,
            ],
            'tasks' => $tasks,
            'members' => $members,
        ]);
    })->name('projects.show');

    // 4. Tambah Tugas Baru dalam Proyek
    Route::post('/projects/{id}/tasks', function (Request $request, $id) {
        $project = Project::findOrFail($id);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
            'status' => ['required', 'in:todo,in_progress,done'],
            'deadline' => ['nullable', 'date'],
        ]);

        $project->tasks()->create($validated);

        return back()->with('success', 'Tugas berhasil ditambahkan ke proyek!');
    })->name('tasks.store');

    // 5. Update Status / Edit / Hapus Tugas
    Route::patch('/tasks/{id}', function (Request $request, $id) {
        $task = Task::findOrFail($id);
        $validated = $request->validate([
            'status' => ['required', 'in:todo,in_progress,done'],
        ]);

        $task->update($validated);

        return back()->with('success', 'Status tugas berhasil diperbarui!');
    })->name('tasks.updateStatus');

    Route::put('/tasks/{id}', function (Request $request, $id) {
        $task = Task::findOrFail($id);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
            'status' => ['required', 'in:todo,in_progress,done'],
            'deadline' => ['nullable', 'date'],
        ]);

        $task->update($validated);

        return back()->with('success', 'Tugas berhasil diperbarui!');
    })->name('tasks.update');

    Route::delete('/tasks/{id}', function ($id) {
        $task = Task::findOrFail($id);
        $task->delete();

        return back()->with('success', 'Tugas berhasil dihapus!');
    })->name('tasks.destroy');

    // 6. Kelola Anggota Proyek (Invite & Remove Member)
    Route::post('/projects/{id}/members', function (Request $request, $id) {
        $project = Project::findOrFail($id);

        if ($project->owner_id !== Auth::id()) {
            abort(403, 'Hanya pemilik proyek yang dapat menambah anggota.');
        }

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ], [
            'email.exists' => 'Pengguna dengan email ini belum terdaftar di sistem.',
        ]);

        $targetUser = User::where('email', $validated['email'])->firstOrFail();

        if ($targetUser->id === $project->owner_id) {
            return back()->withErrors(['email' => 'Pemilik proyek sudah otomatis menjadi anggota.']);
        }

        if ($project->members()->where('users.id', $targetUser->id)->exists()) {
            return back()->withErrors(['email' => 'Pengguna ini sudah menjadi anggota proyek.']);
        }

        $project->members()->attach($targetUser->id);

        return back()->with('success', "{$targetUser->name} berhasil ditambahkan ke proyek!");
    })->name('projects.members.store');

    Route::delete('/projects/{id}/members/{userId}', function ($id, $userId) {
        $project = Project::findOrFail($id);

        if ($project->owner_id !== Auth::id()) {
            abort(403, 'Hanya pemilik proyek yang dapat menghapus anggota.');
        }

        $project->members()->detach($userId);

        return back()->with('success', 'Anggota berhasil dikeluarkan dari proyek.');
    })->name('projects.members.destroy');

    // 7. Panel Admin (Khusus Role Admin)
    Route::middleware('admin')->prefix('admin')->group(function () {
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
