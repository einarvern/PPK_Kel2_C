<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TaskController extends Controller
{
    public function index(Request $request, Project|int|string $project): JsonResponse
    {
        $targetProject = $this->resolveVisibleProject($project);

        $validated = $request->validate([
            'sort' => ['nullable', 'in:priority,deadline'],
            'direction' => ['nullable', 'in:asc,desc'],
        ]);

        $direction = $validated['direction'] ?? 'asc';
        $tasks = $targetProject->tasks();

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

    public function store(Request $request, Project|int|string $project): JsonResponse
    {
        $targetProject = $this->resolveVisibleProject($project);

        $task = $targetProject->tasks()->create($this->validateTask($request, true));

        return response()->json([
            'success' => true,
            'data' => $task,
        ], 201);
    }

    public function update(Request $request, Task|int|string $task): JsonResponse
    {
        $targetTask = $this->resolveVisibleTask($task);

        $targetTask->update($this->validateTask($request, false));

        return response()->json([
            'success' => true,
            'data' => $targetTask->fresh(),
        ]);
    }

    public function destroy(Task|int|string $task): JsonResponse
    {
        $targetTask = $this->resolveVisibleTask($task);

        $targetTask->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tugas berhasil dihapus.',
        ]);
    }

    public function updateStatus(Request $request, Task|int|string $task): JsonResponse
    {
        $targetTask = $this->resolveVisibleTask($task);

        $validated = $request->validate([
            'status' => ['required', 'in:todo,in_progress,done'],
        ]);

        $targetTask->update(['status' => $validated['status']]);

        return response()->json([
            'success' => true,
            'data' => $targetTask->fresh(),
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

    private function resolveVisibleProject(Project|int|string $project): Project
    {
        $id = $project instanceof Project ? $project->id : (int) $project;
        $user = Auth::user();

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

    private function resolveVisibleTask(Task|int|string $task): Task
    {
        $id = $task instanceof Task ? $task->id : (int) $task;
        $user = Auth::user();

        // FR-06 & FR-24: Query authorization langsung di klausul tasks
        /** @var Task|null $resolved */
        $resolved = Task::query()
            ->visibleTo($user)
            ->where('id', $id)
            ->first();

        if (! $resolved) {
            abort(Task::whereKey($id)->exists() ? 403 : 404, 'Anda tidak memiliki akses ke tugas ini.');
        }

        return $resolved;
    }
}
