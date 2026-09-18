<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use App\Services\ProjectDeletionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Throwable;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $user = Auth::user();

        $projects = Project::where('owner_id', $user->id)
            ->orWhereHas('members', fn ($query) => $query->where('users.id', $user->id))
            ->with(['owner', 'members', 'tasks'])
            ->get();

        return response()->json([
            'success' => true,
            'data' => $projects,
        ]);
    }

    public function show(Project|int|string $project): JsonResponse
    {
        $targetProject = $this->resolveVisibleProject($project);

        return response()->json([
            'success' => true,
            'data' => $targetProject->load(['owner', 'members', 'tasks']),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        /** @var User $user */
        $user = $request->user();

        $project = $user->ownedProjects()->create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $project,
        ], 201);
    }

    public function update(Request $request, Project|int|string $project): JsonResponse
    {
        $targetProject = $this->resolveOwnedProject($project, 'Hanya pemilik proyek yang dapat mengubah proyek ini.');

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $targetProject->update($validated);

        return response()->json([
            'success' => true,
            'data' => $targetProject->fresh(),
        ]);
    }

    public function destroy(Project|int|string $project, ProjectDeletionService $projectDeletion): JsonResponse
    {
        // 1. Otorisasi & Resolve Project (dari branch feat)
        $targetProject = $this->resolveOwnedProject($project, 'Hanya pemilik proyek yang dapat menghapus proyek ini.');

        // 2. Delegasi ke Service dengan Error Handling (dari branch main)
        try {
            // Teruskan model yang sudah divalidasi ke service
            $projectDeletion->delete($targetProject);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Proyek tidak dapat dihapus. Silakan coba lagi.',
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Proyek berhasil dihapus.',
        ]);
    }

    public function addMember(Request $request, Project|int|string $project): JsonResponse
    {
        $targetProject = $this->resolveOwnedProject($project, 'Hanya pemilik proyek yang dapat menambah anggota.');

        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if ($user->role === 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Admin tidak dapat bergabung ke proyek.',
            ], 422);
        }

        if ($targetProject->isOwnedBy($user) || $targetProject->hasMember($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna sudah menjadi anggota proyek atau adalah pemilik proyek.',
            ], 422);
        }

        $targetProject->members()->attach($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil ditambahkan.',
            'data' => $targetProject->fresh()->load('members'),
        ]);
    }

    public function removeMember(Project|int|string $project, User $user): JsonResponse
    {
        $targetProject = $this->resolveOwnedProject($project, 'Hanya pemilik proyek yang dapat menghapus anggota.');
        abort_unless($targetProject->hasMember($user) || $targetProject->isOwnedBy($user), 404, 'Pengguna tidak terdaftar di proyek ini.');

        if ($targetProject->isOwnedBy($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Pemilik proyek tidak dapat dihapus sebagai anggota.',
            ], 422);
        }

        $targetProject->members()->detach($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil dihapus.',
        ]);
    }

    public function progress(Project|int|string $project): JsonResponse
    {
        $targetProject = $this->resolveVisibleProject($project);

        $summary = $targetProject->progress();

        return response()->json([
            'success' => true,
            'project_id' => $targetProject->id,
            'progress' => $summary['progress'],
            'counts' => [
                'total' => $summary['total'],
                'completed' => $summary['completed'],
                'pending' => $summary['pending'],
                'in_progress' => $summary['in_progress'],
            ],
        ]);
    }

    private function resolveOwnedProject(Project|int|string $project, string $unauthorizedMessage = 'Hanya pemilik proyek yang dapat melakukan operasi ini.'): Project
    {
        $id = $project instanceof Project ? $project->id : (int) $project;
        $user = Auth::user();

        // FR-03, FR-06 & FR-24: Query authorization langsung di klausul database
        /** @var Project|null $resolved */
        $resolved = Project::query()
            ->where('id', $id)
            ->where('owner_id', $user?->id)
            ->first();

        if (! $resolved) {
            abort(Project::whereKey($id)->exists() ? 403 : 404, $unauthorizedMessage);
        }

        return $resolved;
    }

    private function resolveVisibleProject(Project|int|string $project): Project
    {
        $id = $project instanceof Project ? $project->id : (int) $project;
        $user = Auth::user();

        // Query authorization: hanya memuat project yang memang boleh diakses user
        /** @var Project|null $resolved */
        $resolved = Project::query()
            ->visibleTo($user)
            ->where('id', $id)
            ->first();

        if (! $resolved) {
            abort(Project::whereKey($id)->exists() ? 403 : 404, 'Anda tidak memiliki akses ke proyek ini.');
        }

        return $resolved;
    }
}