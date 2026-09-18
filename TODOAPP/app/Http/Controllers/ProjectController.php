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

    public function show(Project $project): JsonResponse
    {
        abort_unless($project->isVisibleTo(Auth::user()), 403, 'Anda tidak memiliki akses ke proyek ini.');

        return response()->json([
            'success' => true,
            'data' => $project->load(['owner', 'members', 'tasks']),
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

    public function update(Request $request, Project $project): JsonResponse
    {
        abort_unless($project->isOwnedBy(Auth::user()), 403, 'Hanya pemilik proyek yang dapat mengubah proyek ini.');

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
        ]);

        $project->update($validated);

        return response()->json([
            'success' => true,
            'data' => $project->fresh(),
        ]);
    }

    public function destroy(Project $project, ProjectDeletionService $projectDeletion): JsonResponse
    {
        abort_unless($project->isOwnedBy(Auth::user()), 403, 'Hanya pemilik proyek yang dapat menghapus proyek ini.');

        try {
            $projectDeletion->delete($project);
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

    public function addMember(Request $request, Project $project): JsonResponse
    {
        abort_unless($project->isOwnedBy(Auth::user()), 403, 'Hanya pemilik proyek yang dapat menambah anggota.');

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

        if ($project->isOwnedBy($user) || $project->hasMember($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Pengguna sudah menjadi anggota proyek atau adalah pemilik proyek.',
            ], 422);
        }

        $project->members()->attach($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil ditambahkan.',
            'data' => $project->fresh()->load('members'),
        ]);
    }

    public function removeMember(Project $project, User $user): JsonResponse
    {
        abort_unless($project->isOwnedBy(Auth::user()), 403, 'Hanya pemilik proyek yang dapat menghapus anggota.');
        abort_unless($project->hasMember($user) || $project->isOwnedBy($user), 404, 'Pengguna tidak terdaftar di proyek ini.');

        if ($project->isOwnedBy($user)) {
            return response()->json([
                'success' => false,
                'message' => 'Pemilik proyek tidak dapat dihapus sebagai anggota.',
            ], 422);
        }

        $project->members()->detach($user->id);

        return response()->json([
            'success' => true,
            'message' => 'Anggota berhasil dihapus.',
        ]);
    }

    public function progress(Project $project): JsonResponse
    {
        abort_unless($project->isVisibleTo(Auth::user()), 403, 'Anda tidak memiliki akses ke proyek ini.');

        $summary = $project->progress();

        return response()->json([
            'success' => true,
            'project_id' => $project->id,
            'progress' => $summary['progress'],
            'counts' => [
                'total' => $summary['total'],
                'completed' => $summary['completed'],
                'pending' => $summary['pending'],
                'in_progress' => $summary['in_progress'],
            ],
        ]);
    }
}
