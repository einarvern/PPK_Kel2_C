<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property int $owner_id
 * @property int $tasks_count
 * @property int $completed_tasks_count
 * @property int $members_count
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read User $owner
 * @property-read Collection<int, User> $members
 * @property-read Collection<int, Task> $tasks
 */
class Project extends Model
{
    protected $fillable = [
        'name',
        'description',
        'owner_id',
    ];

    /** @return BelongsTo<User, $this> */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    /** @return BelongsToMany<User, $this> */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_members')
            ->withPivot('id')
            ->withTimestamps();
    }

    /** @return HasMany<Task, $this> */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    public function isVisibleTo(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $this->owner_id === $user->id || $this->members()->whereKey($user->id)->exists();
    }

    /** @return array{total: int, completed: int, pending: int, in_progress: int, progress: int} */
    public function progress(): array
    {
        $statuses = $this->tasks()->pluck('status')->all();
        $total = count($statuses);
        $completed = count(array_filter($statuses, fn ($status) => $status === 'done'));
        $pending = count(array_filter($statuses, fn ($status) => $status === 'todo'));
        $inProgress = count(array_filter($statuses, fn ($status) => $status === 'in_progress'));

        return [
            'total' => $total,
            'completed' => $completed,
            'pending' => $pending,
            'in_progress' => $inProgress,
            'progress' => $total === 0 ? 0 : (int) round(($completed / $total) * 100),
        ];
    }
}
