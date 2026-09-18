<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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
        return $this->isOwnedBy($user) || ($user && $this->hasMember($user));
    }

    public function isOwnedBy(?User $user): bool
    {
        return $user !== null && $this->owner_id === $user->id;
    }

    public function hasMember(User $user): bool
    {
        return $this->members()->whereKey($user->id)->exists();
    }

    /**
     * @param  Builder<Project>  $query
     * @return Builder<Project>
     */
    public function scopeOwnedBy(Builder $query, User|int $user): Builder
    {
        $userId = $user instanceof User ? $user->id : $user;

        return $query->where('owner_id', $userId);
    }

    /**
     * @param  Builder<Project>  $query
     * @return Builder<Project>
     */
    public function scopeVisibleTo(Builder $query, User|int $user): Builder
    {
        $userId = $user instanceof User ? $user->id : $user;

        return $query->where(function (Builder $q) use ($userId): void {
            $q->where('owner_id', $userId)
                ->orWhereHas('members', fn (Builder $mq) => $mq->where('users.id', $userId));
        });
    }

    /**
     * @param  Builder<Project>  $query
     * @return Builder<Project>
     */
    public function scopeWithDashboardStats(Builder $query): Builder
    {
        return $query->withCount([
            'tasks',
            'tasks as completed_tasks_count' => fn (Builder $taskQuery) => $taskQuery->where('status', 'done'),
            'members',
        ]);
    }

    /** @return array<string, int|string|null|bool> */
    public function dashboardData(bool $isOwner): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'owner_id' => $this->owner_id,
            'is_owner' => $isOwner,
            'tasks_count' => $this->tasks_count,
            'completed_tasks_count' => $this->completed_tasks_count,
            'progress_percentage' => $this->tasks_count > 0
                ? (int) round(($this->completed_tasks_count / $this->tasks_count) * 100)
                : 0,
            'members_count' => $this->members_count + 1,
        ];
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
