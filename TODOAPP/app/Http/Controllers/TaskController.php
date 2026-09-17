<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProjectAccess($project);

        $validated = $request->validate([
            'sort' => ['nullable', 'in:priority,deadline'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);

        $direction = $validated['direction'] ?? 'asc';
        $tasks = $project->tasks();

        if (($validated['sort'] ?? null) === 'priority') {
            if ($direction === 'desc') {
                $tasks->orderByRaw("CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC");
            } else {
                $tasks->orderByRaw("CASE priority WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END ASC");
            }
        }

        if (($validated['sort'] ?? null) === 'deadline') {
            // Tasks without a deadline remain at the end of the list.
            $tasks->orderByRaw('deadline IS NULL');
            if ($direction === 'desc') {
                $tasks->orderBy('deadline', 'desc');
            } else {
                $tasks->orderBy('deadline', 'asc');
            }
        }

        return response()->json([
            'success' => true,
            'data' => $tasks->get(),
        ]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorizeProjectAccess($project);

        $task = $project->tasks()->create($this->validateTask($request, true));

        return response()->json([
            'success' => true,
            'data' => $task,
        ], 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $this->authorizeProjectAccess($task->project);

        $task->update($this->validateTask($request, false));

        return response()->json([
            'success' => true,
            'data' => $task->fresh(),
        ]);
    }

    public function destroy(Task $task): JsonResponse
    {
        $this->authorizeProjectAccess($task->project);

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dihapus.',
        ]);
    }

    public function updateStatus(Request $request, Task $task): JsonResponse
    {
        $this->authorizeProjectAccess($task->project);

        $validated = $request->validate([
            'status' => ['required', 'in:todo,in_progress,done'],
        ]);

        $task->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'data' => $task->fresh(),
        ]);
    }

    /** @return array<string, mixed> */
    private function validateTask(Request $request, bool $creating): array
    {
        return $request->validate([
            'title' => [$creating ? 'required' : 'sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'priority' => [$creating ? 'required' : 'sometimes', 'in:low,medium,high'],
            'status' => [$creating ? 'required' : 'sometimes', 'in:todo,in_progress,done'],
            'deadline' => ['nullable', 'date'],
        ]);
    }

    private function authorizeProjectAccess(Project $project): void
    {
        abort_unless($project->isVisibleTo(Auth::user()), 403, 'Anda tidak memiliki akses ke proyek ini.');
    }
}
