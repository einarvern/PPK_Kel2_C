<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'owner_id',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'project_user')->withTimestamps();
    }

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

    public function progress(): array
    {
        $statuses = $this->tasks()->pluck('status')->all();
        $total = count($statuses);
        $completed = count(array_filter($statuses, fn ($status) => $status === 'Selesai'));
        $pending = count(array_filter($statuses, fn ($status) => $status === 'Belum dikerjakan'));
        $inProgress = count(array_filter($statuses, fn ($status) => $status === 'Sedang dikerjakan'));

        return [
            'total' => $total,
            'completed' => $completed,
            'pending' => $pending,
            'in_progress' => $inProgress,
            'progress' => $total === 0 ? 0 : (int) round(($completed / $total) * 100),
        ];
    }
}
