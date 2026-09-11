<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Project $project): JsonResponse
    {
        abort_unless($project->isVisibleTo(Auth::user()), 403, 'Anda tidak memiliki akses ke proyek ini.');

        return response()->json([
            'success' => true,
            'data' => $project->tasks()->orderBy('deadline')->get(),
        ]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        abort_unless($project->isVisibleTo(Auth::user()), 403, 'Anda tidak memiliki akses ke proyek ini.');

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['required', 'in:low,medium,high'],
            'status' => ['required', 'in:todo,in_progress,done'],
            'deadline' => ['nullable', 'date'],
        ]);

        $task = $project->tasks()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'priority' => $validated['priority'],
            'status' => $validated['status'],
            'deadline' => $validated['deadline'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'data' => $task,
        ], 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        abort_unless($task->project->isVisibleTo(Auth::user()), 403, 'Anda tidak memiliki akses ke proyek ini.');

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => ['sometimes', 'in:low,medium,high'],
            'status' => ['sometimes', 'in:todo,in_progress,done'],
            'deadline' => ['nullable', 'date'],
        ]);

        $task->update($validated);

        return response()->json([
            'success' => true,
            'data' => $task->fresh(),
        ]);
    }

    public function destroy(Task $task): JsonResponse
    {
        abort_unless($task->project->isVisibleTo(Auth::user()), 403, 'Anda tidak memiliki akses ke proyek ini.');

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dihapus.',
        ]);
    }

    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        abort_unless($task->project->isVisibleTo(Auth::user()), 403, 'Anda tidak memiliki akses ke proyek ini.');

        $validated = $request->validate([
            'status' => ['required', 'in:todo,in_progress,done'],
        ]);

        $task->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'data' => $task->fresh(),
        ]);
    }
}
